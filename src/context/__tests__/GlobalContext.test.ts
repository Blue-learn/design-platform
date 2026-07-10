// GlobalReducer and the action creators are module-private: GlobalContext.ts
// hands them straight to createDataContext at import time. Mocking that factory
// captures both, which is the only way to unit-test the reducer that drives
// every schema-rendered screen.
let capturedReducer: any;
let capturedActions: any;
let capturedInitialState: any;

jest.mock('../createDataContext', () => ({
	__esModule: true,
	default: (reducer: any, actions: any, initialState: any) => {
		capturedReducer = reducer;
		capturedActions = actions;
		capturedInitialState = initialState;
		return { Context: { __context: true }, Provider: () => null };
	},
}));

// utility.ts (imported for EmptyTemplate) reaches react-native and lodash-es,
// both untranspiled ESM under this jest config.
jest.mock('react-native', () => ({ Dimensions: { get: () => ({ width: 375 }) } }));
jest.mock('lodash-es/forEach', () => ({
	__esModule: true,
	default: (c: any[], fn: any) => c.forEach(fn),
}));

import '../GlobalContext';
import { GlobalActionTokens, LAYOUTS } from '../../types';

const widget = (id: string) => ({ id, type: 'Text' });

const routeWithWidgets = (overrides: any = {}) => ({
	template: {
		layout: { id: 'l1', type: LAYOUTS.LIST, widgets: [widget('w1')] },
		datastore: { w1: { text: 'hello' } },
	},
	onLoad: jest.fn(),
	actions: { EXISTING: jest.fn() },
	...overrides,
});

const stateWith = (route: any, routeId = 'home') => ({
	routeMap: { [routeId]: route },
});

describe('GlobalContext wiring', () => {
	it('registers every action creator the hooks destructure from Context', () => {
		// standardUtilitiesHook and triggerActionHook pull these by name off the
		// context value. A rename here fails at runtime as "not a function",
		// not at compile time, because the context is typed `any`.
		expect(Object.keys(capturedActions).sort()).toEqual([
			'appendWidgets',
			'setActions',
			'setDataStoreInPath',
			'setDatastore',
			'setLoaderForRoute',
			'setRouteMap',
			'setTemplateForRoute',
			'setWidgetRegistry',
		]);
	});

	it('starts with a null routeMap', () => {
		// Several reducer branches guard on `state.routeMap &&`; the initial
		// null is what those guards exist for.
		expect(capturedInitialState).toEqual({ routeMap: null });
	});
});

describe('GlobalReducer', () => {
	it('returns the state unchanged for an unknown action type', () => {
		const state = stateWith(routeWithWidgets());

		expect(capturedReducer(state, { type: 'NOT_A_REAL_TOKEN' })).toBe(state);
	});

	describe('SET_ROUTE_MAP', () => {
		it('replaces the route map with a shallow copy of the payload', () => {
			const payload = { home: routeWithWidgets() };

			const next = capturedReducer(
				{ routeMap: null },
				{ type: GlobalActionTokens.SET_ROUTE_MAP, payload },
			);

			expect(next.routeMap).toEqual(payload);
			// Copied, not aliased: later mutation of the caller's object must
			// not retroactively change reducer state.
			expect(next.routeMap).not.toBe(payload);
		});

		it('discards any previously registered routes', () => {
			const next = capturedReducer(stateWith(routeWithWidgets(), 'old'), {
				type: GlobalActionTokens.SET_ROUTE_MAP,
				payload: { fresh: routeWithWidgets() },
			});

			expect(next.routeMap).not.toHaveProperty('old');
			expect(next.routeMap).toHaveProperty('fresh');
		});
	});

	describe('SET_TEMPLATE_ROUTE', () => {
		it('sets the template while preserving the rest of the page entry', () => {
			// onLoad/actions live alongside `template` on the same entry. Losing
			// them here would break every subsequent action dispatch for the
			// route, because triggerActionHook reads routeMap[id].actions.
			const route = routeWithWidgets();
			const template = {
				layout: { id: 'l2', type: LAYOUTS.LIST, widgets: [widget('w9')] },
				datastore: {},
			};

			const next = capturedReducer(stateWith(route), {
				type: GlobalActionTokens.SET_TEMPLATE_ROUTE,
				payload: { routeId: 'home', template },
			});

			expect(next.routeMap.home.template).toEqual(template);
			expect(next.routeMap.home.onLoad).toBe(route.onLoad);
			expect(next.routeMap.home.actions).toBe(route.actions);
		});

		it('leaves other routes untouched', () => {
			const other = routeWithWidgets();
			const state = { routeMap: { home: routeWithWidgets(), other } };

			const next = capturedReducer(state, {
				type: GlobalActionTokens.SET_TEMPLATE_ROUTE,
				payload: {
					routeId: 'home',
					template: {
						layout: { id: 'x', type: LAYOUTS.LIST, widgets: [] },
						datastore: {},
					},
				},
			});

			expect(next.routeMap.other).toBe(other);
		});
	});

	describe('SET_DATASTORE', () => {
		it('ignores the update when the route has no widgets yet', () => {
			// Guard against writing data into a page whose layout has not
			// loaded - the datastore would be dropped when the real template
			// arrives.
			const emptyRoute = {
				template: {
					layout: { id: 'l', type: LAYOUTS.LIST, widgets: [] },
					datastore: {},
				},
			};

			const next = capturedReducer(stateWith(emptyRoute), {
				type: GlobalActionTokens.SET_DATASTORE,
				payload: { routeId: 'home', datastore: { w1: { text: 'new' } } },
			});

			expect(next.routeMap.home).toBe(emptyRoute);
		});

		it('merges the incoming datastore over the existing one', () => {
			const next = capturedReducer(stateWith(routeWithWidgets()), {
				type: GlobalActionTokens.SET_DATASTORE,
				payload: { routeId: 'home', datastore: { w2: { text: 'added' } } },
			});

			expect(next.routeMap.home.datastore).toEqual({
				w1: { text: 'hello' },
				w2: { text: 'added' },
			});
		});

		it('BUG (pinned): overwrites the whole page entry with a bare template, dropping onLoad/actions', () => {
			// Every other branch writes `{...existingEntry, template: {...}}`.
			// This one assigns the TemplateSchema directly as the route entry,
			// so `routeMap[id].template`, `.onLoad` and `.actions` all vanish
			// and the page can no longer dispatch its custom actions.
			//
			// Left as-is rather than fixed: it is product-visible behaviour that
			// consumers of the published package may already work around, and
			// changing the shape of a route entry is not a safe drive-by edit.
			const route = routeWithWidgets();

			const next = capturedReducer(stateWith(route), {
				type: GlobalActionTokens.SET_DATASTORE,
				payload: { routeId: 'home', datastore: { w2: {} } },
			});

			expect(next.routeMap.home.template).toBeUndefined();
			expect(next.routeMap.home.onLoad).toBeUndefined();
			expect(next.routeMap.home.actions).toBeUndefined();
			// what it becomes instead: the merged TemplateSchema itself
			expect(next.routeMap.home).toHaveProperty('layout');
			expect(next.routeMap.home).toHaveProperty('datastore');
		});
	});

	describe('SET_DATASTORE_IN_PATH', () => {
		it('merges the payload into the addressed widget only', () => {
			const state = stateWith({
				template: {
					layout: { id: 'l', type: LAYOUTS.LIST, widgets: [widget('w1')] },
					datastore: { w1: { text: 'hello', keep: true }, w2: { text: 'other' } },
				},
			});

			const next = capturedReducer(state, {
				type: GlobalActionTokens.SET_DATASTORE_IN_PATH,
				routeId: 'home',
				widgetId: 'w1',
				payload: { text: 'updated' },
			});

			// merged, not replaced - `keep` survives
			expect(next.routeMap.home.template.datastore.w1).toEqual({
				text: 'updated',
				keep: true,
			});
			expect(next.routeMap.home.template.datastore.w2).toEqual({
				text: 'other',
			});
		});

		it('preserves the surrounding page entry, unlike SET_DATASTORE', () => {
			const route = routeWithWidgets();

			const next = capturedReducer(stateWith(route), {
				type: GlobalActionTokens.SET_DATASTORE_IN_PATH,
				routeId: 'home',
				widgetId: 'w1',
				payload: { text: 'x' },
			});

			expect(next.routeMap.home.onLoad).toBe(route.onLoad);
			expect(next.routeMap.home.template).toBeDefined();
		});

		it('creates the widget entry when the widget has no datastore yet', () => {
			const next = capturedReducer(stateWith(routeWithWidgets()), {
				type: GlobalActionTokens.SET_DATASTORE_IN_PATH,
				routeId: 'home',
				widgetId: 'brand_new',
				payload: { text: 'first' },
			});

			expect(next.routeMap.home.template.datastore.brand_new).toEqual({
				text: 'first',
			});
		});

		it('ignores the write when the route has no widgets', () => {
			const emptyRoute = {
				template: {
					layout: { id: 'l', type: LAYOUTS.LIST, widgets: [] },
					datastore: {},
				},
			};

			const next = capturedReducer(stateWith(emptyRoute), {
				type: GlobalActionTokens.SET_DATASTORE_IN_PATH,
				routeId: 'home',
				widgetId: 'w1',
				payload: { text: 'x' },
			});

			expect(next.routeMap.home).toBe(emptyRoute);
		});
	});

	describe('SET_LOADER_IN_PATH', () => {
		it('replaces the loading widgets for the route', () => {
			const route = routeWithWidgets({ loading: [widget('shimmer')] });
			const nextShimmers = [widget('s1'), widget('s2')];

			const next = capturedReducer(stateWith(route), {
				type: GlobalActionTokens.SET_LOADER_IN_PATH,
				routeId: 'home',
				widgetItems: nextShimmers,
			});

			expect(next.routeMap.home.loading).toEqual(nextShimmers);
			expect(next.routeMap.home.template).toBe(route.template);
		});

		it('does nothing when the route declared no loading widgets to begin with', () => {
			// A route can only show a loader if its schema seeded `loading`.
			// Calling showLoader on a route without one is silently a no-op -
			// the common cause of "the spinner never appears" for a new page.
			const route = routeWithWidgets({ loading: [] });

			const next = capturedReducer(stateWith(route), {
				type: GlobalActionTokens.SET_LOADER_IN_PATH,
				routeId: 'home',
				widgetItems: [widget('s1')],
			});

			expect(next.routeMap.home).toBe(route);
		});

		it('can clear the loader once the route has one', () => {
			// hideLoader dispatches an empty widgetItems array; the guard checks
			// the EXISTING loader, so clearing still works.
			const route = routeWithWidgets({ loading: [widget('shimmer')] });

			const next = capturedReducer(stateWith(route), {
				type: GlobalActionTokens.SET_LOADER_IN_PATH,
				routeId: 'home',
				widgetItems: [],
			});

			expect(next.routeMap.home.loading).toEqual([]);
		});
	});

	describe('SET_ACTIONS', () => {
		it('merges new handlers over the route’s existing action map', () => {
			const route = routeWithWidgets();
			const added = jest.fn();

			const next = capturedReducer(stateWith(route), {
				type: GlobalActionTokens.SET_ACTIONS,
				payload: { routeId: 'home', actions: { ADDED: added } },
			});

			expect(next.routeMap.home.actions.EXISTING).toBe(route.actions.EXISTING);
			expect(next.routeMap.home.actions.ADDED).toBe(added);
		});

		it('lets a later registration override a handler of the same name', () => {
			const replacement = jest.fn();

			const next = capturedReducer(stateWith(routeWithWidgets()), {
				type: GlobalActionTokens.SET_ACTIONS,
				payload: { routeId: 'home', actions: { EXISTING: replacement } },
			});

			expect(next.routeMap.home.actions.EXISTING).toBe(replacement);
		});

		it('keeps the template intact while updating actions', () => {
			const route = routeWithWidgets();

			const next = capturedReducer(stateWith(route), {
				type: GlobalActionTokens.SET_ACTIONS,
				payload: { routeId: 'home', actions: {} },
			});

			expect(next.routeMap.home.template).toBe(route.template);
		});
	});

	describe('APPEND_WIDGETS', () => {
		it('appends widgets to the end of the existing layout', () => {
			// This is what powers infinite scroll: page 2's widgets must land
			// AFTER page 1's, never replace them.
			const next = capturedReducer(stateWith(routeWithWidgets()), {
				type: GlobalActionTokens.APPEND_WIDGETS,
				payload: {
					routeId: 'home',
					widgets: [widget('w2'), widget('w3')],
					datastore: {},
				},
			});

			expect(next.routeMap.home.template.layout.widgets.map((w: any) => w.id)).toEqual(
				['w1', 'w2', 'w3'],
			);
		});

		it('merges the appended datastore over the existing one', () => {
			const next = capturedReducer(stateWith(routeWithWidgets()), {
				type: GlobalActionTokens.APPEND_WIDGETS,
				payload: {
					routeId: 'home',
					widgets: [widget('w2')],
					datastore: { w2: { text: 'page 2' } },
				},
			});

			expect(next.routeMap.home.template.datastore).toEqual({
				w1: { text: 'hello' },
				w2: { text: 'page 2' },
			});
		});

		it('carries the layout id and type through unchanged', () => {
			const next = capturedReducer(stateWith(routeWithWidgets()), {
				type: GlobalActionTokens.APPEND_WIDGETS,
				payload: { routeId: 'home', widgets: [], datastore: {} },
			});

			expect(next.routeMap.home.template.layout.id).toBe('l1');
			expect(next.routeMap.home.template.layout.type).toBe(LAYOUTS.LIST);
		});

		it('BUG (pinned): returns undefined instead of the state when routeMap is null', () => {
			// `if (!state.routeMap) return;` - a reducer that returns undefined
			// sets React state to undefined, so the very next read of
			// `state.routeMap` throws and the screen white-screens. Every other
			// branch returns a state object.
			//
			// Pinned rather than fixed: the correct return is `state`, but this
			// is a published package and the crash may already be masked or
			// depended on by consumers, so it is not a safe unilateral change.
			expect(
				capturedReducer(
					{ routeMap: null },
					{
						type: GlobalActionTokens.APPEND_WIDGETS,
						payload: { routeId: 'home', widgets: [], datastore: {} },
					},
				),
			).toBeUndefined();
		});
	});
});

describe('action creators', () => {
	let dispatch: jest.Mock;

	beforeEach(() => {
		dispatch = jest.fn();
	});

	it('are curried over dispatch', () => {
		// Each is `(dispatch) => (payload) => dispatch(...)`. Calling the outer
		// function must not dispatch anything on its own.
		capturedActions.setRouteMap(dispatch);

		expect(dispatch).not.toHaveBeenCalled();
	});

	it('setWidgetRegistry copies the registry into the payload', () => {
		const registry = { Text: {} };
		capturedActions.setWidgetRegistry(dispatch)(registry);

		expect(dispatch).toHaveBeenCalledWith({
			type: GlobalActionTokens.SET_WIDGET_REGISTRY,
			payload: { Text: {} },
		});
		expect(dispatch.mock.calls[0][0].payload).not.toBe(registry);
	});

	it('setDataStoreInPath SPREADS the action instead of nesting it under payload', () => {
		// The reducer reads `action.routeId` and `action.widgetId` at the top
		// level for this one token. Nesting it like the others would leave both
		// undefined and the write would target `routeMap[undefined]`.
		capturedActions.setDataStoreInPath(dispatch)({
			routeId: 'home',
			widgetId: 'w1',
			payload: { text: 'x' },
		});

		expect(dispatch).toHaveBeenCalledWith({
			type: GlobalActionTokens.SET_DATASTORE_IN_PATH,
			routeId: 'home',
			widgetId: 'w1',
			payload: { text: 'x' },
		});
	});

	it('the remaining creators nest their argument under `payload`', () => {
		const cases: Array<[string, GlobalActionTokens]> = [
			['setDatastore', GlobalActionTokens.SET_DATASTORE],
			['setActions', GlobalActionTokens.SET_ACTIONS],
			['setRouteMap', GlobalActionTokens.SET_ROUTE_MAP],
			['setTemplateForRoute', GlobalActionTokens.SET_TEMPLATE_ROUTE],
			['appendWidgets', GlobalActionTokens.APPEND_WIDGETS],
			['setLoaderForRoute', GlobalActionTokens.SET_LOADER_IN_PATH],
		];

		cases.forEach(([name, type]) => {
			const d = jest.fn();
			const arg = { marker: name };
			capturedActions[name](d)(arg);

			expect(d).toHaveBeenCalledWith({ type, payload: arg });
		});
	});

	it('setLoaderForRoute nests under payload even though the reducer reads it at top level', () => {
		// MISMATCH, pinned: the creator dispatches
		// `{type, payload:{routeId, widgetItems}}` but the SET_LOADER_IN_PATH
		// branch reads `action.routeId` / `action.widgetItems`. Going through
		// the creator therefore hits `routeMap[undefined]` and throws, which is
		// why standardUtilitiesHook's showLoader/hideLoader do not work.
		const d = jest.fn();
		capturedActions.setLoaderForRoute(d)({
			routeId: 'home',
			widgetItems: [],
		});

		const dispatched = d.mock.calls[0][0];
		expect(dispatched.routeId).toBeUndefined();
		expect(dispatched.payload).toEqual({ routeId: 'home', widgetItems: [] });
	});
});
