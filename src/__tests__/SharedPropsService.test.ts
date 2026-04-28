import SharedPropsService from '../SharedPropsService';

// SharedPropsService is a module-level singleton: the renderer writes the widget
// registry and route map into it once at startup, then every rendered screen
// reads from it. That makes the reset discipline below load-bearing — state
// leaks between consumers otherwise.

const emptyProps = () => ({ widgetRegistry: {}, routeMap: {}, ref: {} });

beforeEach(async () => {
	await SharedPropsService.setGlobalProps(emptyProps() as any);
});

describe('getPropsValue', () => {
	it('returns null when called with no key', () => {
		expect(SharedPropsService.getPropsValue()).toBeNull();
	});

	it('returns the stored value for a known key', async () => {
		const registry = { Button: {} };
		await SharedPropsService.setGlobalProps({
			widgetRegistry: registry,
			routeMap: {},
			ref: {},
		} as any);
		expect(SharedPropsService.getPropsValue('widgetRegistry')).toBe(registry);
	});

	it('returns undefined for an unknown key rather than throwing', () => {
		expect(SharedPropsService.getPropsValue('nope')).toBeUndefined();
	});

	it('reads the route map the renderer navigates with', async () => {
		const routeMap = { home: { id: 'home' } };
		await SharedPropsService.setGlobalProps({
			widgetRegistry: {},
			routeMap,
			ref: {},
		} as any);
		expect(SharedPropsService.getPropsValue('routeMap')).toBe(routeMap);
	});
});

describe('setGlobalProps', () => {
	it('REPLACES the whole object rather than merging', async () => {
		// A caller that sets only the routeMap wipes the widgetRegistry with it.
		// Worth knowing before calling this twice.
		await SharedPropsService.setGlobalProps({
			widgetRegistry: { Button: {} },
			routeMap: {},
			ref: {},
		} as any);
		await SharedPropsService.setGlobalProps({
			widgetRegistry: {},
			routeMap: { home: {} },
			ref: {},
		} as any);
		expect(SharedPropsService.getPropsValue('widgetRegistry')).toEqual({});
	});

	it('awaits the props, so a promise may be passed instead of a value', async () => {
		// `_globalProps = await props` — the signature says GlobalProps but a
		// Promise<GlobalProps> also works, which is how the renderer bootstraps
		// asynchronously.
		await SharedPropsService.setGlobalProps(
			Promise.resolve({
				widgetRegistry: { Async: {} },
				routeMap: {},
				ref: {},
			}) as any
		);
		expect(SharedPropsService.getPropsValue('widgetRegistry')).toEqual({
			Async: {},
		});
	});
});

describe('widget ref map', () => {
	it('stores and retrieves a widget ref by id', async () => {
		const ref = { current: 'node' };
		await SharedPropsService.setWidgetRefMap('w1', ref);
		expect(SharedPropsService.getWidgetRef('w1')).toBe(ref);
	});

	it('returns undefined for an unknown widget id', () => {
		expect(SharedPropsService.getWidgetRef('missing')).toBeUndefined();
	});

	it('overwrites an existing ref for the same id', async () => {
		await SharedPropsService.setWidgetRefMap('w1', { current: 'a' });
		await SharedPropsService.setWidgetRefMap('w1', { current: 'b' });
		expect(SharedPropsService.getWidgetRef('w1')).toEqual({ current: 'b' });
	});

	it('loses every ref when setGlobalProps is called again', async () => {
		// Because setGlobalProps replaces the object wholesale, `ref` is reset
		// with it. Any widget that registered a ref before a re-bootstrap has to
		// register again.
		await SharedPropsService.setWidgetRefMap('w1', { current: 'a' });
		await SharedPropsService.setGlobalProps(emptyProps() as any);
		expect(SharedPropsService.getWidgetRef('w1')).toBeUndefined();
	});
});
