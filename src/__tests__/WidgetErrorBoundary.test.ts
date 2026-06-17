import WidgetErrorBoundary from '../renderer/WidgetErrorBoundary';

// Screens are built from server-sent schema, so a widget's props are decided at
// runtime by a payload this package does not control. Without a boundary, one
// widget throwing during render unmounts the whole tree above it and blanks the
// screen. These assert the contract directly rather than through a renderer,
// which this package does not have a test dependency for.

type Boundary = InstanceType<typeof WidgetErrorBoundary>;

const make = (props: Record<string, unknown> = {}): Boundary =>
	new (WidgetErrorBoundary as any)({ children: 'CHILDREN', ...props });

describe('WidgetErrorBoundary', () => {
	it('captures the error into state so React can re-render the fallback', () => {
		const err = new Error('bad widget');
		expect(
			(WidgetErrorBoundary as any).getDerivedStateFromError(err),
		).toEqual({ error: err });
	});

	it('renders its children while nothing has thrown', () => {
		const b = make();
		b.state = { error: null };
		// wrapped in a fragment so the class satisfies JSX's ReactElement return
		expect((b.render() as any).props.children).toBe('CHILDREN');
	});

	it('renders null once a widget has thrown, degrading to a missing widget', () => {
		// Matches what WidgetRenderer already does for a widget that arrives
		// with no props: the screen keeps rendering, minus that one item.
		const b = make();
		b.state = { error: new Error('bad widget') };
		expect(b.render()).toBeNull();
	});

	it('logs the failing widget type and id, so the payload can be traced', () => {
		const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
		try {
			const b = make({ type: 'CARD', id: 'card-7' });
			b.componentDidCatch(new Error('boom'));
			expect(warn).toHaveBeenCalledWith(
				'ERROR: WIDGET RENDER FAILED',
				'type-> CARD id-> card-7 error-> boom',
			);
		} finally {
			warn.mockRestore();
		}
	});

	it('still logs when the widget carries no identity', () => {
		const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
		try {
			make().componentDidCatch(new Error('boom'));
			expect(warn).toHaveBeenCalledTimes(1);
		} finally {
			warn.mockRestore();
		}
	});

	it('does not swallow the error silently — it always reports', () => {
		// A boundary that renders null without logging turns a crash into an
		// invisible blank space, which is harder to diagnose than the crash.
		const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
		try {
			make({ type: 'X', id: 'y' }).componentDidCatch(new Error('e'));
			expect(warn.mock.calls[0][0]).toContain('WIDGET RENDER FAILED');
		} finally {
			warn.mockRestore();
		}
	});
});
