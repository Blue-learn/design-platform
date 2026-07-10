// The HOC is a plain function returning a plain function component, so both can
// be invoked directly and the resulting React elements inspected - no renderer
// needed. GlobalContext is stubbed because importing it pulls the whole
// react-native-dependent utility chain.
const fakeConsumer = 'GlobalContext.Consumer';

jest.mock('../index', () => ({
	Context: { Consumer: fakeConsumer },
}));

import withGlobalContext from '../withGlobalContext';

const Wrapped = () => null;

describe('withGlobalContext', () => {
	it('returns a new component rather than mutating the wrapped one', () => {
		const Enhanced = withGlobalContext(Wrapped);

		expect(typeof Enhanced).toBe('function');
		expect(Enhanced).not.toBe(Wrapped);
	});

	it('renders a GlobalContext.Consumer at the root', () => {
		// Reading through a Consumer (rather than useContext) is what lets this
		// HOC wrap class components too. Swapping it for a hook would break
		// every class-based consumer in the host app.
		const Enhanced: any = withGlobalContext(Wrapped);

		const element = Enhanced({});

		expect(element.type).toBe(fakeConsumer);
		expect(typeof element.props.children).toBe('function');
	});

	it('spreads the context value onto the wrapped component', () => {
		// The whole point: `state`, `setRouteMap`, etc. arrive as individual
		// props. Passing the value as a single `context` prop instead would
		// break every consumer's prop access.
		const Enhanced: any = withGlobalContext(Wrapped);
		const contextValue = { state: { routeMap: {} }, setRouteMap: jest.fn() };

		const inner = Enhanced({}).props.children(contextValue);

		expect(inner.type).toBe(Wrapped);
		expect(inner.props.state).toBe(contextValue.state);
		expect(inner.props.setRouteMap).toBe(contextValue.setRouteMap);
	});

	it('passes the HOC’s own props through as well', () => {
		const Enhanced: any = withGlobalContext(Wrapped);

		const inner = Enhanced({ id: 'w1', title: 'hello' }).props.children({});

		expect(inner.props.id).toBe('w1');
		expect(inner.props.title).toBe('hello');
	});

	it('lets the context value win when a key collides with an own prop', () => {
		// Spread order is `{...props} {...value}`. A widget prop named `state`
		// is therefore silently replaced by the global state - a real trap when
		// naming widget props.
		const Enhanced: any = withGlobalContext(Wrapped);

		const inner = Enhanced({ state: 'own' }).props.children({ state: 'global' });

		expect(inner.props.state).toBe('global');
	});

	it('handles an empty context value without dropping own props', () => {
		const Enhanced: any = withGlobalContext(Wrapped);

		const inner = Enhanced({ id: 'w1' }).props.children({});

		expect(inner.props.id).toBe('w1');
	});

	it('can wrap different components independently', () => {
		const A = () => null;
		const B = () => null;

		const innerA = (withGlobalContext(A) as any)({}).props.children({});
		const innerB = (withGlobalContext(B) as any)({}).props.children({});

		expect(innerA.type).toBe(A);
		expect(innerB.type).toBe(B);
	});
});
