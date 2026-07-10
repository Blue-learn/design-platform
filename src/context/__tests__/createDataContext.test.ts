// react-test-renderer is not a dependency of this package, so the Provider is
// invoked as a plain function and the React element it returns is inspected
// directly (React elements are ordinary objects). `useReducer` is the only hook
// used, and it is stubbed so the call needs no render pass.
const mockUseReducer = jest.fn();

jest.mock('react', () => {
	const actual = jest.requireActual('react');
	return {
		...actual,
		__esModule: true,
		default: { ...actual, useReducer: (...a: any[]) => mockUseReducer(...a) },
		useReducer: (...a: any[]) => mockUseReducer(...a),
	};
});

import createDataContext from '../createDataContext';

const reducer = (s: any) => s;
const initialState = { routeMap: null, count: 0 };

describe('createDataContext', () => {
	let dispatch: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
		dispatch = jest.fn();
		mockUseReducer.mockReturnValue([initialState, dispatch]);
	});

	it('returns both a Context and a Provider', () => {
		const { Context, Provider } = createDataContext(reducer, {}, initialState);

		expect(Context).toBeDefined();
		expect(typeof Provider).toBe('function');
	});

	it('seeds useReducer with the reducer and initial state it was given', () => {
		const { Provider } = createDataContext(reducer, {}, initialState);

		(Provider as any)({ children: null });

		expect(mockUseReducer).toHaveBeenCalledWith(reducer, initialState);
	});

	it('binds every action creator to dispatch and exposes it on the context value', () => {
		// This is the whole point of the factory: consumers call
		// `setRouteMap(payload)` without ever seeing dispatch. If binding broke,
		// every action creator would be called with the payload as its
		// `dispatch` argument and nothing would reach the reducer.
		const bound = jest.fn();
		const setRouteMap = jest.fn(() => bound);
		const { Provider } = createDataContext(reducer, { setRouteMap }, initialState);

		const element: any = (Provider as any)({ children: null });

		expect(setRouteMap).toHaveBeenCalledWith(dispatch);
		expect(element.props.value.setRouteMap).toBe(bound);
	});

	it('binds several action creators independently', () => {
		const a = jest.fn(() => 'boundA');
		const b = jest.fn(() => 'boundB');
		const { Provider } = createDataContext(reducer, { a, b }, initialState);

		const element: any = (Provider as any)({ children: null });

		expect(element.props.value.a).toBe('boundA');
		expect(element.props.value.b).toBe('boundB');
	});

	it('exposes the reducer state under a `state` key', () => {
		// Hooks read `const { state } = useContext(Context)`. Spreading the
		// state onto the value instead would break every one of them.
		const { Provider } = createDataContext(reducer, {}, initialState);

		const element: any = (Provider as any)({ children: null });

		expect(element.props.value.state).toEqual(initialState);
	});

	it('merges the Provider `value` prop OVER the reducer state', () => {
		// The renderer injects widgetRegistry/routeMap through this prop at
		// mount. Merging the other way round would let the initial (null)
		// reducer state clobber what the host app passed in.
		const { Provider } = createDataContext(reducer, {}, initialState);

		const element: any = (Provider as any)({
			children: null,
			value: { count: 99, extra: true },
		});

		expect(element.props.value.state).toEqual({
			routeMap: null,
			count: 99,
			extra: true,
		});
	});

	it('defaults `value` to an empty object so state passes through untouched', () => {
		const { Provider } = createDataContext(reducer, {}, initialState);

		const element: any = (Provider as any)({ children: null });

		expect(element.props.value.state).toEqual(initialState);
	});

	it('renders its children inside the provider', () => {
		const children = 'child-marker';
		const { Provider } = createDataContext(reducer, {}, initialState);

		const element: any = (Provider as any)({ children });

		expect(element.props.children).toBe(children);
	});

	it('gives each call its own Context, so two providers never share state', () => {
		const first = createDataContext(reducer, {}, initialState);
		const second = createDataContext(reducer, {}, initialState);

		expect(first.Context).not.toBe(second.Context);
	});

	it('creates the context with the initial state as its default value', () => {
		// A consumer rendered outside the Provider falls back to this. If it
		// were undefined, destructuring `{ state }` in a hook would throw.
		const { Context } = createDataContext(reducer, {}, initialState);

		expect((Context as any)._currentValue).toEqual(initialState);
	});
});
