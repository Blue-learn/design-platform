// `react-native` and `lodash-es` both ship untranspiled ESM that ts-jest does
// not transform (node_modules is excluded from transforms). Both are replaced
// with minimal CJS stand-ins so the framework-free logic in utility.ts can be
// exercised. `Dimensions.get` is a jest.fn so screen width can be driven.
const mockGetDimensions = jest.fn();
jest.mock('react-native', () => ({
	Dimensions: { get: (...args: any[]) => mockGetDimensions(...args) },
}));
jest.mock('lodash-es/forEach', () => ({
	__esModule: true,
	default: (collection: any[], fn: any) => collection.forEach(fn),
}));

import {
	arePropsEqual,
	EmptyTemplate,
	findDiff,
	getScreenType,
	getUniqueId,
	hasEqualProps,
} from '../utility';
import { LAYOUTS, SCREEN_SIZE } from '../../types';

describe('arePropsEqual', () => {
	it('compares only the allow-listed keys and ignores everything else', () => {
		// This drives React.memo for every widget. If it stopped filtering, an
		// unrelated prop (a new inline callback each render) would make every
		// widget re-render on every parent render.
		const areEqual = arePropsEqual(['id']);

		expect(areEqual({ id: 1, onPress: () => {} }, { id: 1, onPress: () => {} })).toBe(
			true,
		);
	});

	it('reports a difference when an allow-listed key changes', () => {
		// The mirror risk: over-filtering means a real prop change never
		// re-renders the widget and the UI silently goes stale.
		const areEqual = arePropsEqual(['id']);

		expect(areEqual({ id: 1 }, { id: 2 })).toBe(false);
	});

	it('compares allow-listed values deeply, not by reference', () => {
		// Schema-driven props are rebuilt objects on every render; a reference
		// comparison here would defeat memoisation entirely.
		const areEqual = arePropsEqual(['style']);

		expect(areEqual({ style: { flex: 1 } }, { style: { flex: 1 } })).toBe(true);
		expect(areEqual({ style: { flex: 1 } }, { style: { flex: 2 } })).toBe(false);
	});

	it('treats a missing allow-listed key as undefined on both sides', () => {
		const areEqual = arePropsEqual(['absent']);

		expect(areEqual({ id: 1 }, { id: 2 })).toBe(true);
	});

	it('with an empty allow-list every prop set compares equal', () => {
		// Documents the footgun: `arePropsEqual([])` freezes the widget forever.
		const areEqual = arePropsEqual([]);

		expect(areEqual({ id: 1 }, { id: 999 })).toBe(true);
	});

	it('returns a reusable comparator rather than a result', () => {
		const areEqual = arePropsEqual(['id']);

		expect(typeof areEqual).toBe('function');
		expect(areEqual({ id: 1 }, { id: 1 })).toBe(true);
		expect(areEqual({ id: 1 }, { id: 3 })).toBe(false);
	});
});

describe('hasEqualProps', () => {
	it('deep-compares the whole prop object', () => {
		expect(hasEqualProps({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
		expect(hasEqualProps({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
	});

	it('distinguishes extra keys', () => {
		expect(hasEqualProps({ a: 1 }, { a: 1, b: 2 })).toBe(false);
	});
});

describe('findDiff', () => {
	it('lists the keys whose values changed', () => {
		// Used to explain avoidable re-renders during debugging; a wrong key
		// list sends whoever is profiling down the wrong path.
		expect(findDiff({ a: 1, b: 2, c: 3 }, { a: 1, b: 99, c: 3 })).toEqual(['b']);
	});

	it('returns an empty array when the objects are deeply equal', () => {
		expect(findDiff({ a: { deep: true } }, { a: { deep: true } })).toEqual([]);
	});

	it('finds several changed keys at once', () => {
		expect(findDiff({ a: 1, b: 2 }, { a: 9, b: 8 }).sort()).toEqual(['a', 'b']);
	});

	it('iterates the keys of the NEXT props, so a key removed in next is not reported', () => {
		// Documents a real asymmetry: only `nextProps` keys are walked, so a
		// prop that existed before and is now gone does not show up in the diff
		// even though the objects differ.
		const diff = findDiff({ a: 1 }, { a: 1, removed: 'gone' });

		expect(diff).toEqual([]);
	});

	it('reports a key that is newly added in next props', () => {
		expect(findDiff({ a: 1, added: true }, { a: 1 })).toEqual(['added']);
	});
});

describe('getScreenType', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('maps each width band to its screen-size token', () => {
		// These breakpoints select which layout variant a schema renders. An
		// off-by-one at a boundary shows the tablet layout on a phone.
		const cases: Array<[number, SCREEN_SIZE]> = [
			[320, SCREEN_SIZE.X_SMALL],
			[575, SCREEN_SIZE.X_SMALL],
			[576, SCREEN_SIZE.SMALL],
			[767, SCREEN_SIZE.SMALL],
			[768, SCREEN_SIZE.MEDIUM],
			[991, SCREEN_SIZE.MEDIUM],
			[992, SCREEN_SIZE.LARGE],
			[1199, SCREEN_SIZE.LARGE],
			[1200, SCREEN_SIZE.X_LARGE],
			[2560, SCREEN_SIZE.X_LARGE],
		];

		cases.forEach(([width, expected]) => {
			mockGetDimensions.mockReturnValue({ width });
			expect(getScreenType()).toBe(expected);
		});
	});

	it('reads the "window" dimension, not "screen"', () => {
		// On Android "screen" includes the status/navigation bars, so using it
		// would push widths into the next band on some devices.
		mockGetDimensions.mockReturnValue({ width: 400 });
		getScreenType();

		expect(mockGetDimensions).toHaveBeenCalledWith('window');
	});
});

describe('getUniqueId', () => {
	it('returns a non-empty string of at most 5 lowercase letters', () => {
		for (let i = 0; i < 200; i++) {
			const id = getUniqueId();
			expect(id.length).toBeLessThanOrEqual(5);
			expect(id).toMatch(/^[a-z]*$/);
		}
	});

	it('strips digits, so the id is letters only', () => {
		// The id is used as a React key and a widget-ref map key. It is derived
		// from Math.random().toString(36) with digits removed - which is also
		// why it can be SHORTER than 5 characters, and occasionally empty.
		const ids = Array.from({ length: 500 }, () => getUniqueId());

		expect(ids.every((id) => !/\d/.test(id))).toBe(true);
	});

	it('produces mostly distinct values across many calls', () => {
		// Not a cryptographic guarantee - with <=5 letters collisions exist.
		// The assertion is deliberately loose: it catches the real regression
		// (a constant or near-constant id) without being flaky.
		const ids = new Set(Array.from({ length: 500 }, () => getUniqueId()));

		expect(ids.size).toBeGreaterThan(100);
	});
});

describe('EmptyTemplate', () => {
	it('is a renderable list template with no widgets', () => {
		// Every reducer branch falls back to this when a route has no template.
		// A malformed fallback (missing layout.widgets) crashes the reducer,
		// which reads `.layout.widgets.length` unguarded.
		expect(EmptyTemplate.layout.type).toBe(LAYOUTS.LIST);
		expect(EmptyTemplate.layout.widgets).toEqual([]);
		expect(EmptyTemplate.datastore).toEqual({});
	});

	it('carries a stable id the renderer can key on', () => {
		expect(EmptyTemplate.layout.id).toBe('empty_template');
	});
});
