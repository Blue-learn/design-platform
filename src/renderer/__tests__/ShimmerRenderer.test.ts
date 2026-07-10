// ShimmerRenderer is a plain function component whose only branch is registry
// lookup, so it is invoked directly and the returned element tree inspected.
const mockGetPropsValue = jest.fn();

jest.mock('../../SharedPropsService', () => ({
	__esModule: true,
	default: { getPropsValue: (...a: any[]) => mockGetPropsValue(...a) },
}));
jest.mock('lodash-es/get', () => ({
	__esModule: true,
	default: (obj: any, path: string, fallback: any) => {
		const value = obj == null ? undefined : obj[path];
		return value === undefined ? fallback : value;
	},
}));

import ShimmerRenderer from '../ShimmerRenderer';

const render = (type: string) => (ShimmerRenderer as any)({ id: 'w1', type });

// The component returns <>{X ? <X/> : null}</>, so the fragment's single child
// is what actually gets mounted.
const childOf = (element: any) => element.props.children;

describe('ShimmerRenderer', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('reads the widget registry from SharedPropsService', () => {
		// The registry is the host app's map of widget name -> implementation.
		// Reading the wrong key returns undefined and every shimmer disappears.
		mockGetPropsValue.mockReturnValue({});

		render('Text');

		expect(mockGetPropsValue).toHaveBeenCalledWith('widgetRegistry');
	});

	it('renders the registered widget’s Shimmer component', () => {
		const Shimmer = () => null;
		mockGetPropsValue.mockReturnValue({ Text: { Shimmer } });

		expect(childOf(render('Text')).type).toBe(Shimmer);
	});

	it('renders nothing when the widget is registered without a Shimmer', () => {
		// Most widgets have no shimmer variant. Falling back to the real
		// Component here would render live widgets bound to empty data during
		// loading, which is how "undefined" flashes on screen.
		mockGetPropsValue.mockReturnValue({ Text: { Component: () => null } });

		expect(childOf(render('Text'))).toBeNull();
	});

	it('renders nothing for a widget type that is not in the registry', () => {
		mockGetPropsValue.mockReturnValue({ Text: { Shimmer: () => null } });

		expect(childOf(render('NotRegistered'))).toBeNull();
	});

	it('renders nothing when the registry itself is missing', () => {
		// getPropsValue returns null before the host app bootstraps. A shimmer
		// rendered in that window must not crash the screen.
		mockGetPropsValue.mockReturnValue(null);

		expect(() => render('Text')).not.toThrow();
		expect(childOf(render('Text'))).toBeNull();
	});

	it('looks the widget up by its `type`, not its `id`', () => {
		// Widget ids are per-instance; types are what the registry is keyed on.
		// Using the id would miss every lookup once a page has two of the same
		// widget.
		const Shimmer = () => null;
		mockGetPropsValue.mockReturnValue({ Text: { Shimmer }, w1: { Shimmer } });

		const element = (ShimmerRenderer as any)({ id: 'w1', type: 'Text' });

		expect(childOf(element).type).toBe(Shimmer);
	});

	it('renders the Shimmer with no props', () => {
		// The shimmer is a static placeholder; forwarding the real widget's
		// props would make it try to render actual (absent) data.
		const Shimmer = () => null;
		mockGetPropsValue.mockReturnValue({ Text: { Shimmer } });

		expect(childOf(render('Text')).props).toEqual({});
	});
});
