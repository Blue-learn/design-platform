import {
	GlobalActionTokens,
	LAYOUTS,
	POSITION,
	SCREEN_SIZE,
} from '../types';

// These enums are the wire format between a JSON page schema (authored outside
// this repo) and the renderer. Their string VALUES are what a backend sends, so
// changing one is a breaking API change, not a rename. The invariants below are
// the ones that break silently rather than loudly.

const valuesOf = (e: object) => Object.values(e) as string[];

describe('GlobalActionTokens', () => {
	it('has no duplicate values', () => {
		// Two tokens sharing a value collapse into one `case` in GlobalReducer;
		// the second branch becomes dead code and its action silently no-ops.
		const values = valuesOf(GlobalActionTokens);

		expect(new Set(values).size).toBe(values.length);
	});

	it('uses each key as its own value', () => {
		// Action creators dispatch `type: GlobalActionTokens.X` and the reducer
		// switches on the same member, but actions also cross the JS/JSON
		// boundary. A key/value mismatch makes a hand-written action object
		// (`{type: 'SET_ACTIONS'}`) miss its case and fall through to default.
		Object.entries(GlobalActionTokens).forEach(([key, value]) => {
			expect(value).toBe(key);
		});
	});

	it('still declares every token the reducer and hooks branch on', () => {
		// Removing a token from this enum compiles fine at the call site that
		// no longer uses it while leaving the reducer case unreachable.
		expect(valuesOf(GlobalActionTokens).sort()).toEqual([
			'APPEND_WIDGETS',
			'SET_ACTIONS',
			'SET_DATASTORE',
			'SET_DATASTORE_IN_PATH',
			'SET_LOADER_IN_PATH',
			'SET_ROUTE_MAP',
			'SET_TEMPLATE_ROUTE',
			'SET_WIDGET_REGISTRY',
		]);
	});

	it('keeps SET_DATASTORE and SET_DATASTORE_IN_PATH distinct', () => {
		// They take differently shaped actions - one carries `payload.routeId`,
		// the other a top-level `routeId`/`widgetId`. Conflating them writes the
		// datastore to the wrong path.
		expect(GlobalActionTokens.SET_DATASTORE).not.toBe(
			GlobalActionTokens.SET_DATASTORE_IN_PATH,
		);
	});
});

describe('LAYOUTS', () => {
	it('has no duplicate values', () => {
		const values = valuesOf(LAYOUTS);

		expect(new Set(values).size).toBe(values.length);
	});

	it('pins the exact wire values a page schema must send', () => {
		// NOTE the inconsistency, which is deliberate to record: LIST and TAB
		// are namespaced `layouts/` (plural) while MODAL is `layout/`
		// (singular). This is pinned as-is because schemas in production
		// already send `layout/modal`; "fixing" the prefix would stop every
		// existing modal page from resolving its layout.
		expect(LAYOUTS.LIST).toBe('layouts/list');
		expect(LAYOUTS.TAB).toBe('layouts/tab');
		expect(LAYOUTS.MODAL).toBe('layout/modal');
	});

	it('namespaces every layout value with a "layout"-rooted prefix', () => {
		valuesOf(LAYOUTS).forEach((value) => {
			expect(value).toMatch(/^layouts?\//);
		});
	});
});

describe('POSITION', () => {
	it('has no duplicate values', () => {
		// FIXED_TOP and ABSOLUTE_TOP mean different scroll behaviour; if they
		// ever shared a value, a fixed header would scroll away.
		const values = valuesOf(POSITION);

		expect(new Set(values).size).toBe(values.length);
	});

	it('namespaces every value under "position/"', () => {
		valuesOf(POSITION).forEach((value) => {
			expect(value).toMatch(/^position\//);
		});
	});

	it('pins the exact wire values', () => {
		expect(POSITION.FIXED_TOP).toBe('position/fixed_top');
		expect(POSITION.ABSOLUTE_TOP).toBe('position/absolute_top');
		expect(POSITION.FIXED_BOTTOM).toBe('position/fixed_bottom');
		expect(POSITION.ABSOLUTE_BOTTOM).toBe('position/absolute_bottom');
		expect(POSITION.FAB).toBe('position/fab');
		expect(POSITION.STICKY_TOP).toBe('position/sticky_top');
	});

	it('keeps the fixed and absolute variants of each edge separate', () => {
		expect(POSITION.FIXED_TOP).not.toBe(POSITION.ABSOLUTE_TOP);
		expect(POSITION.FIXED_BOTTOM).not.toBe(POSITION.ABSOLUTE_BOTTOM);
	});
});

describe('SCREEN_SIZE', () => {
	it('has no duplicate values', () => {
		const values = valuesOf(SCREEN_SIZE);

		expect(new Set(values).size).toBe(values.length);
	});

	it('pins the values getScreenType() returns', () => {
		// utility.getScreenType maps pixel bands onto these; consumers compare
		// against the string, so the value is the contract.
		expect(SCREEN_SIZE.X_SMALL).toBe('extra_small');
		expect(SCREEN_SIZE.SMALL).toBe('small');
		expect(SCREEN_SIZE.MEDIUM).toBe('medium');
		expect(SCREEN_SIZE.LARGE).toBe('large');
		expect(SCREEN_SIZE.X_LARGE).toBe('extra_large');
	});

	it('covers exactly the five bands getScreenType can produce', () => {
		// A sixth member with no branch in getScreenType would be unreachable;
		// removing one leaves a band returning undefined.
		expect(valuesOf(SCREEN_SIZE)).toHaveLength(5);
	});
});
