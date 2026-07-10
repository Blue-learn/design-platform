// The HOC wraps its argument in React.forwardRef. forwardRef components are not
// callable directly, so the inner render function is reached through `.render`,
// which is how React itself invokes them. No renderer is required.
const mockTriggerAction = jest.fn();
const mockTriggerActionHook = jest.fn(() => mockTriggerAction);

jest.mock('../../hook', () => ({
	triggerActionHook: () => mockTriggerActionHook(),
}));

import { withPerformActionContext } from '../PerformActionContext';

const Wrapped = () => null;

const renderHOC = (props: any = {}, ref: any = null) => {
	const Enhanced: any = withPerformActionContext(Wrapped);
	return Enhanced.render(props, ref);
};

describe('withPerformActionContext', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('returns a forwardRef component, not a plain function', () => {
		// Widgets are scrolled to via SharedPropsService refs. A HOC that
		// swallowed the ref would leave scrollToIndex with an undefined ref and
		// every programmatic scroll would throw.
		const Enhanced: any = withPerformActionContext(Wrapped);

		expect(typeof Enhanced.render).toBe('function');
		expect(Enhanced.$$typeof).toBe(Symbol.for('react.forward_ref'));
	});

	it('injects a triggerAction prop obtained from the hook', () => {
		// This prop is how every widget dispatches. If it stopped being passed,
		// widgets would fail with "triggerAction is not a function" only when
		// the user taps - never at mount.
		const inner = renderHOC();

		expect(mockTriggerActionHook).toHaveBeenCalledTimes(1);
		expect(inner.props.triggerAction).toBe(mockTriggerAction);
	});

	it('renders the wrapped component', () => {
		expect(renderHOC().type).toBe(Wrapped);
	});

	it('forwards the incoming ref to the wrapped component', () => {
		const ref = { current: null };

		expect(renderHOC({}, ref).ref).toBe(ref);
	});

	it('passes its own props through untouched', () => {
		const inner = renderHOC({ id: 'w1', item: { type: 'Text' } });

		expect(inner.props.id).toBe('w1');
		expect(inner.props.item).toEqual({ type: 'Text' });
	});

	it('lets triggerAction win over an incoming prop of the same name', () => {
		// Spread order is `{...props} ref triggerAction`, so the injected
		// dispatcher is applied last and a caller cannot accidentally shadow it
		// with a stale one.
		const inner = renderHOC({ triggerAction: 'caller-supplied' });

		expect(inner.props.triggerAction).toBe(mockTriggerAction);
	});

	it('calls the hook once per render, so each render gets the current dispatcher', () => {
		renderHOC();
		renderHOC();

		expect(mockTriggerActionHook).toHaveBeenCalledTimes(2);
	});

	it('does not put the ref into props, keeping it a real React ref', () => {
		// `ref` is a reserved React prop. Landing it in props instead of on the
		// element would make React warn and the ref would never attach.
		// Checked via the key list rather than by reading `props.ref`, which
		// itself triggers React's warning.
		const ref = { current: null };
		const inner = renderHOC({}, ref);

		expect(Object.keys(inner.props)).not.toContain('ref');
		expect(inner.ref).toBe(ref);
	});
});
