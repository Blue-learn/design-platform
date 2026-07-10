// triggerActionHook is a React hook, but the only hooks it uses are useContext
// and useMemo. Stubbing those two lets the dispatcher itself - the part with
// real branching - be tested without a renderer.
const mockContextValue: any = {};
const mockStandardUtilities = { marker: 'utils' };
const mockStandardUtilitiesRaw = jest.fn(
	(..._args: any[]) => mockStandardUtilities,
);

jest.mock('react', () => {
	const actual = jest.requireActual('react');
	return {
		...actual,
		__esModule: true,
		useContext: () => mockContextValue,
		// The hook memoises with an empty dep array; running the factory
		// immediately is equivalent for a single "render".
		useMemo: (factory: any) => factory(),
	};
});
jest.mock('../../context', () => ({ Context: {} }));
jest.mock('../standartUtilitiesHook', () => ({
	standardUtilitiesRaw: (...a: any[]) => mockStandardUtilitiesRaw(...a),
	standardUtilitiesHook: jest.fn(),
}));

import { triggerActionHook } from '../triggerActionHook';
import { GlobalActionTokens } from '../../types';

const setContext = (value: any) => {
	Object.keys(mockContextValue).forEach((k) => delete mockContextValue[k]);
	Object.assign(mockContextValue, value);
};

const templateWith = (datastore: any = { w1: {} }) => ({
	layout: { id: 'l1', type: 'layouts/list', widgets: [{ id: 'w1' }] },
	datastore,
});

describe('triggerActionHook', () => {
	let setDataStoreInPath: jest.Mock;
	let setActions: jest.Mock;
	let appendWidgets: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
		setDataStoreInPath = jest.fn();
		setActions = jest.fn();
		appendWidgets = jest.fn();
		setContext({
			setDataStoreInPath,
			setActions,
			appendWidgets,
			state: { routeMap: {} },
		});
	});

	it('builds its utilities from the RAW factory, passing state first', () => {
		// The raw factory closes over the CURRENT state on every call. The hook
		// version memoises with an empty dep array and is documented as
		// returning stale data, so custom actions would read a frozen datastore.
		// Argument order matters: state, then the two context actions.
		triggerActionHook();

		expect(mockStandardUtilitiesRaw).toHaveBeenCalledWith(
			{ routeMap: {} },
			setDataStoreInPath,
			appendWidgets,
		);
	});

	it('returns a dispatcher function', () => {
		expect(typeof triggerActionHook()).toBe('function');
	});

	describe('built-in global actions', () => {
		it('routes SET_DATASTORE_IN_PATH to the context action with the whole action object', () => {
			const trigger = triggerActionHook();
			const action = {
				type: GlobalActionTokens.SET_DATASTORE_IN_PATH,
				routeId: 'home',
				widgetId: 'w1',
				payload: { text: 'x' },
			};

			trigger(action as any);

			expect(setDataStoreInPath).toHaveBeenCalledWith(action);
			expect(setActions).not.toHaveBeenCalled();
		});

		it('routes SET_ACTIONS to the setActions context action', () => {
			const trigger = triggerActionHook();
			const action = {
				type: GlobalActionTokens.SET_ACTIONS,
				payload: { routeId: 'home', actions: {} },
			};

			trigger(action as any);

			expect(setActions).toHaveBeenCalledWith(action);
			expect(setDataStoreInPath).not.toHaveBeenCalled();
		});

		it('does not throw when the context action is missing', () => {
			// The context is typed `any`; a Provider that forgot to register an
			// action would otherwise crash every widget that dispatches.
			setContext({ state: { routeMap: {} } });
			const trigger = triggerActionHook();

			expect(() =>
				trigger({ type: GlobalActionTokens.SET_ACTIONS, payload: {} } as any),
			).not.toThrow();
		});

		it('never falls through a global token to the custom-action branch', () => {
			// Both built-in cases `break`. Falling through would try to look up
			// routeMap[undefined] and throw.
			setContext({
				setDataStoreInPath,
				setActions,
				appendWidgets,
				state: { routeMap: {} },
			});
			const trigger = triggerActionHook();

			expect(() =>
				trigger({
					type: GlobalActionTokens.SET_DATASTORE_IN_PATH,
					routeId: 'not_registered',
					widgetId: 'w1',
					payload: {},
				} as any),
			).not.toThrow();
		});
	});

	describe('custom actions', () => {
		it('invokes the route’s handler with the action, its datastore and the utilities', () => {
			// This three-argument shape is the public contract every page author
			// writes against; reordering it silently hands a page the wrong
			// object and its handler reads undefined fields.
			const handler = jest.fn();
			const template = templateWith({ w1: { text: 'hello' } });
			setContext({
				setDataStoreInPath,
				setActions,
				appendWidgets,
				state: {
					routeMap: { home: { template, actions: { CUSTOM: handler } } },
				},
			});
			const trigger = triggerActionHook();
			const action = { type: 'CUSTOM', routeId: 'home', payload: { a: 1 } };

			trigger(action as any);

			expect(handler).toHaveBeenCalledWith(
				action,
				template.datastore,
				mockStandardUtilities,
			);
		});

		it('does nothing when the route registered no actions', () => {
			setContext({
				setDataStoreInPath,
				setActions,
				appendWidgets,
				state: { routeMap: { home: { template: templateWith() } } },
			});
			const trigger = triggerActionHook();

			expect(() =>
				trigger({ type: 'CUSTOM', routeId: 'home', payload: {} } as any),
			).not.toThrow();
		});

		it('does nothing when the route has actions but no template', () => {
			// The guard requires BOTH a template and a non-null datastore; a
			// route whose onLoad has not resolved yet must not run handlers
			// against a missing datastore.
			const handler = jest.fn();
			setContext({
				setDataStoreInPath,
				setActions,
				appendWidgets,
				state: { routeMap: { home: { actions: { CUSTOM: handler } } } },
			});
			const trigger = triggerActionHook();

			trigger({ type: 'CUSTOM', routeId: 'home', payload: {} } as any);

			expect(handler).not.toHaveBeenCalled();
		});

		it('throws for an action whose routeId is not in the route map', () => {
			// Pinned: `state.routeMap[action.routeId].template` is unguarded, so
			// dispatching to an unknown route throws rather than no-opping. Worth
			// knowing because a typo'd routeId in a schema fails loudly here and
			// not at schema-load time.
			setContext({
				setDataStoreInPath,
				setActions,
				appendWidgets,
				state: { routeMap: { home: {} } },
			});
			const trigger = triggerActionHook();

			expect(() =>
				trigger({ type: 'CUSTOM', routeId: 'ghost', payload: {} } as any),
			).toThrow();
		});

		it('does nothing when the action carries no routeId', () => {
			const handler = jest.fn();
			setContext({
				setDataStoreInPath,
				setActions,
				appendWidgets,
				state: {
					routeMap: { home: { template: templateWith(), actions: { CUSTOM: handler } } },
				},
			});
			const trigger = triggerActionHook();

			trigger({ type: 'CUSTOM', payload: {} } as any);

			expect(handler).not.toHaveBeenCalled();
		});

		it('picks the handler belonging to the action’s own route', () => {
			// Two routes can register the same action name with different
			// handlers; dispatching must not cross them.
			const homeHandler = jest.fn();
			const otherHandler = jest.fn();
			setContext({
				setDataStoreInPath,
				setActions,
				appendWidgets,
				state: {
					routeMap: {
						home: { template: templateWith(), actions: { TAP: homeHandler } },
						other: { template: templateWith(), actions: { TAP: otherHandler } },
					},
				},
			});
			const trigger = triggerActionHook();

			trigger({ type: 'TAP', routeId: 'other', payload: {} } as any);

			expect(otherHandler).toHaveBeenCalledTimes(1);
			expect(homeHandler).not.toHaveBeenCalled();
		});
	});
});
