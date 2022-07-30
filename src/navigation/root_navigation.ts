import {
	createNavigationContainerRef,
	StackActions,
} from '@react-navigation/native';

/** @description This shouldn't be used directly. It will affect globally **/
export const navigationRef =
	createNavigationContainerRef();

/** @description Navigate to an existing Micro-frontend Page initially created by routeMap **/
export function navigateToRoute(
	name: string,
	params: any,
) {
	if (navigationRef.isReady()) {
		// @ts-ignore
		navigationRef.navigate(name, params);
	}
}

/** @description create a new Micro-frontend page with new props.
 *  @param pushRoute use to create dynamic new route with new props   **/
export function pushRoute(...args: any[]) {
	if (navigationRef.isReady()) {
		navigationRef.dispatch(
			// @ts-ignore
			StackActions.push(...args),
		);
	}
}
