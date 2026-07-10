// standardUtilitiesRaw is the framework-free half of this module: it is a plain
// factory, so it can be exercised without rendering. Its React-hook sibling is
// covered indirectly via triggerActionHook, which builds its utilities with the
// raw factory.
const mockAsyncStorage = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
};
const mockGoToRoute = jest.fn();
const mockGoBack = jest.fn();
const mockGetWidgetRef = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
	__esModule: true,
	default: mockAsyncStorage,
}));
jest.mock('lodash-es', () => ({
	get: (obj: any, path: string) =>
		path
			.split('.')
			.reduce((acc: any, k) => (acc == null ? undefined : acc[k]), obj),
}));
jest.mock('../../navigation/root_navigation', () => ({
	goToRoute: (...a: any[]) => mockGoToRoute(...a),
	goBack: (...a: any[]) => mockGoBack(...a),
}));
jest.mock('../../SharedPropsService', () => ({
	__esModule: true,
	default: { getWidgetRef: (...a: any[]) => mockGetWidgetRef(...a) },
}));
jest.mock('../../context', () => ({ Context: {} }));

import { standardUtilitiesRaw } from '../standartUtilitiesHook';

const makeState = () => ({
	datastore: { w1: { text: 'hello' } },
	nested: { deep: { value: 42 } },
});

describe('standardUtilitiesRaw', () => {
	let state: any;
	let setDataStoreInPath: jest.Mock;
	let appendWidgets: jest.Mock;
	let utils: any;

	let warnSpy: jest.SpyInstance;

	beforeEach(() => {
		jest.clearAllMocks();
		state = makeState();
		setDataStoreInPath = jest.fn().mockResolvedValue(undefined);
		appendWidgets = jest.fn();
		utils = standardUtilitiesRaw(state, setDataStoreInPath, appendWidgets);
		// setDatastore's no-op path logs a warning by design; silence it so the
		// expected warning does not read as a failure in the test output.
		warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		warnSpy.mockRestore();
	});

	it('exposes axios as the network client', () => {
		// Page `onLoad` handlers receive these utilities and call
		// `utilities.network.get(...)`. Swapping in fetch would break every
		// existing page's data fetching.
		expect(typeof utils.network.get).toBe('function');
		expect(typeof utils.network.post).toBe('function');
	});

	describe('asyncStorage', () => {
		it('delegates get/set/remove/clear to AsyncStorage with the callback', () => {
			const cb = jest.fn();

			utils.asyncStorage.get('k', cb);
			expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('k', cb);

			utils.asyncStorage.set('k', 'v', cb);
			expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('k', 'v', cb);

			utils.asyncStorage.remove('k', cb);
			expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('k', cb);

			utils.asyncStorage.clear(cb);
			expect(mockAsyncStorage.clear).toHaveBeenCalledWith(cb);
		});

		it('returns the AsyncStorage promise from get so callers can await it', () => {
			mockAsyncStorage.getItem.mockReturnValue(Promise.resolve('stored'));

			return expect(utils.asyncStorage.get('k')).resolves.toBe('stored');
		});
	});

	describe('getDatastore', () => {
		it('resolves the value at a dotted path', () => {
			// Page handlers read their own widget's current value this way; a
			// broken path walk silently resolves undefined instead of throwing.
			return expect(utils.getDatastore('nested.deep.value')).resolves.toBe(42);
		});

		it('resolves undefined for a path that does not exist', () => {
			return expect(utils.getDatastore('nope.missing')).resolves.toBeUndefined();
		});

		it('returns the whole state (not a promise) when no path is given', () => {
			// Documented asymmetry: the typed signature says Promise<any>, but
			// the no-path branch returns `state` directly. `await` still works,
			// so it is invisible until someone calls `.then` on it.
			expect(utils.getDatastore()).toBe(state);
		});
	});

	describe('setDatastore', () => {
		it('forwards routeId, widgetId and payload to the context action', () => {
			return utils.setDatastore('home', 'w2', { text: 'new' }).then(() => {
				expect(setDataStoreInPath).toHaveBeenCalledWith({
					routeId: 'home',
					widgetId: 'w2',
					payload: { text: 'new' },
				});
			});
		});

		it('skips the write when the payload is identical to the stored value', () => {
			// Guard against a render loop: a widget that writes back the value
			// it just read would dispatch forever.
			const same = state.datastore.w1;

			return utils.setDatastore('home', 'w1', same).then(() => {
				expect(setDataStoreInPath).not.toHaveBeenCalled();
				// and it says so, which is the only signal a developer gets
				// that their write was dropped
				expect(warnSpy).toHaveBeenCalledWith('value is same');
			});
		});

		it('compares by reference, so an equal-but-new object still writes', () => {
			// `previousValue === payload`. A structurally identical object is a
			// different reference and does dispatch - worth knowing, because it
			// means the loop guard only helps when the same object is reused.
			return utils
				.setDatastore('home', 'w1', { text: 'hello' })
				.then(() => {
					expect(setDataStoreInPath).toHaveBeenCalledTimes(1);
				});
		});

		it('resolves with the datastore in both the write and the skip path', async () => {
			await expect(utils.setDatastore('home', 'w2', { a: 1 })).resolves.toBe(
				state.datastore,
			);
			await expect(
				utils.setDatastore('home', 'w1', state.datastore.w1),
			).resolves.toBe(state.datastore);
		});

		it('propagates a rejection from the context action instead of hanging', () => {
			// The method is `async` rather than wrapping a Promise executor. In
			// the old executor form a throw was swallowed and the caller hung
			// forever with no error surfaced.
			setDataStoreInPath.mockRejectedValue(new Error('dispatch failed'));

			return expect(
				utils.setDatastore('home', 'w2', { a: 1 }),
			).rejects.toThrow('dispatch failed');
		});
	});

	describe('appendWidgets', () => {
		it('repacks its three positional arguments into one action object', () => {
			// Signature is (routeId, datastore, widgets) but the action object
			// is {routeId, datastore, widgets}. Transposing datastore and
			// widgets appends the datastore as a widget list and renders
			// nothing.
			const widgets = [{ id: 'w2', type: 'Text' }];
			const datastore = { w2: { text: 'page 2' } };

			utils.appendWidgets('home', datastore, widgets);

			expect(appendWidgets).toHaveBeenCalledWith({
				routeId: 'home',
				datastore,
				widgets,
			});
		});
	});

	describe('scrollToIndex', () => {
		beforeEach(() => jest.useFakeTimers());
		afterEach(() => jest.useRealTimers());

		it('looks the list ref up by routeId and scrolls after a frame', () => {
			// The 16ms delay lets the list commit newly appended rows before
			// scrolling; scrolling synchronously lands on the old content.
			const scrollToIndex = jest.fn();
			mockGetWidgetRef.mockReturnValue({ scrollToIndex });

			utils.scrollToIndex({ index: 3, routeId: 'home', viewOffset: 10 });

			expect(mockGetWidgetRef).toHaveBeenCalledWith('home');
			expect(scrollToIndex).not.toHaveBeenCalled();

			jest.advanceTimersByTime(16);

			expect(scrollToIndex).toHaveBeenCalledWith({
				index: 3,
				animated: true,
				viewOffset: 10,
			});
		});

		it('does not scroll to index 0, because 0 is falsy', () => {
			// Pinned quirk: the guard is `index && ...`, so "scroll back to the
			// top" is silently a no-op. Callers have to use index 0 via some
			// other path.
			const scrollToIndex = jest.fn();
			mockGetWidgetRef.mockReturnValue({ scrollToIndex });

			utils.scrollToIndex({ index: 0, routeId: 'home' });
			jest.advanceTimersByTime(16);

			expect(scrollToIndex).not.toHaveBeenCalled();
		});
	});

	describe('navigation passthrough', () => {
		it('navigate() routes through goToRoute with empty params', () => {
			utils.navigate('profile');

			expect(mockGoToRoute).toHaveBeenCalledWith('profile', {});
		});

		it('goBack() pops the navigation stack', () => {
			// Wired straight to the shared navigation ref rather than through a
			// route id, so it works from any schema-rendered screen.
			utils.goBack();

			expect(mockGoBack).toHaveBeenCalledTimes(1);
		});
	});

	describe('unimplemented utilities', () => {
		it('are present but no-ops, so calling one cannot crash a page handler', () => {
			// These are declared `todo` in the raw factory. They must still
			// exist: a page calling `utilities.showToast(...)` would otherwise
			// throw "not a function" and abort its whole onLoad.
			['reloadPage', 'showToast', 'showLoader', 'hideLoader', 'showPopup', 'hidePopup'].forEach(
				(name) => {
					expect(typeof utils[name]).toBe('function');
					expect(utils[name]()).toBeUndefined();
				},
			);
		});
	});
});
