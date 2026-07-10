// @react-navigation/native pulls the React Native runtime, so the two pieces
// this module actually uses are stubbed. `createNavigationContainerRef` returns
// the shared ref object the module holds for its whole lifetime.
const mockNavRef = {
	goBack: jest.fn(),
	isReady: jest.fn(),
	navigate: jest.fn(),
	dispatch: jest.fn(),
};
const mockStackPush = jest.fn((...args: any[]) => ({
	type: 'PUSH',
	args,
}));

jest.mock('@react-navigation/native', () => ({
	createNavigationContainerRef: () => mockNavRef,
	StackActions: { push: (...args: any[]) => mockStackPush(...args) },
}));

import {
	goBack,
	goToRoute,
	navigationRef,
	pushRoute,
} from '../root_navigation';

describe('root_navigation', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockNavRef.isReady.mockReturnValue(true);
	});

	it('exports the single shared navigation ref', () => {
		// Every screen navigates through this one module-level ref. If it were
		// recreated per import, navigation calls would go to a detached
		// container and silently do nothing.
		expect(navigationRef).toBe(mockNavRef);
	});

	describe('goBack', () => {
		it('delegates to the container ref', () => {
			goBack();

			expect(mockNavRef.goBack).toHaveBeenCalledTimes(1);
		});

		it('does NOT check isReady() first, unlike the other two helpers', () => {
			// Pinning the current behaviour: goBack is called unguarded, so
			// invoking it before the container mounts throws from
			// react-navigation rather than no-opping. The asymmetry with
			// goToRoute/pushRoute is real and worth knowing before calling it
			// from an early lifecycle hook.
			mockNavRef.isReady.mockReturnValue(false);

			goBack();

			expect(mockNavRef.isReady).not.toHaveBeenCalled();
			expect(mockNavRef.goBack).toHaveBeenCalledTimes(1);
		});
	});

	describe('goToRoute', () => {
		it('navigates with the route name and params when the container is ready', () => {
			goToRoute('profile', { id: 7 });

			expect(mockNavRef.navigate).toHaveBeenCalledWith('profile', { id: 7 });
		});

		it('silently does nothing when the container is not ready', () => {
			// Actions can fire from onLoad before the navigator mounts. The
			// guard is what stops that crashing the app on cold start.
			mockNavRef.isReady.mockReturnValue(false);

			goToRoute('profile', { id: 7 });

			expect(mockNavRef.navigate).not.toHaveBeenCalled();
		});

		it('forwards params by reference, including empty objects', () => {
			const params = {};
			goToRoute('home', params);

			expect(mockNavRef.navigate).toHaveBeenCalledWith('home', params);
			expect(mockNavRef.navigate.mock.calls[0][1]).toBe(params);
		});
	});

	describe('pushRoute', () => {
		it('dispatches a StackActions.push built from all its arguments', () => {
			// push creates a NEW screen instance rather than reusing an existing
			// one - that difference is why a schema-driven route with fresh
			// props must push, not navigate.
			pushRoute('detail', { postId: 42 });

			expect(mockStackPush).toHaveBeenCalledWith('detail', { postId: 42 });
			expect(mockNavRef.dispatch).toHaveBeenCalledWith({
				type: 'PUSH',
				args: ['detail', { postId: 42 }],
			});
		});

		it('does nothing when the container is not ready', () => {
			mockNavRef.isReady.mockReturnValue(false);

			pushRoute('detail', {});

			expect(mockNavRef.dispatch).not.toHaveBeenCalled();
			expect(mockStackPush).not.toHaveBeenCalled();
		});

		it('accepts a bare route id with no props', () => {
			pushRoute('detail');

			expect(mockStackPush).toHaveBeenCalledWith('detail');
			expect(mockNavRef.dispatch).toHaveBeenCalledTimes(1);
		});

		it('uses dispatch, not navigate, so repeated pushes stack up', () => {
			// If this ever switched to navigate(), pushing the same route twice
			// would reuse the existing screen and the second set of props would
			// be dropped.
			pushRoute('detail', { postId: 1 });
			pushRoute('detail', { postId: 2 });

			expect(mockNavRef.dispatch).toHaveBeenCalledTimes(2);
			expect(mockNavRef.navigate).not.toHaveBeenCalled();
		});
	});
});
