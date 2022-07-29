import React, { useContext } from 'react';
import {
	GlobalActionTokens,
	StandardUtilities,
	Action,
	TemplateSchema,
} from '../types';
import { Context } from './GlobalContext';
import { get } from 'lodash-es';
import SharedPropsService from '../SharedPropsService';

export const withPerformActionContext = (
	WrappedComponent: any,
): React.FC<any> => {
	return React.forwardRef<any, any>(
		(props, ref) => {
			const {
				setDataStoreInPath,
				setActions,
				state,
			} = useContext(Context);

			const standardUtilities: StandardUtilities = {
				/** todo **/
				reloadPage(reloadParams?: any) {},
				getDatastore(path: string): Promise<any> {
					return path
						? Promise.resolve(get(state, path))
						: state;
				},
				scrollToIndex({
					index,
					routeId,
					viewOffset,
				}): void {
					let _ref =
						SharedPropsService.getWidgetRef(routeId);

					setTimeout(() => {
						index &&
							_ref.scrollToIndex({
								index,
								animated: true,
								viewOffset,
							});
					}, 16);
				},
				setDatastore(
					routeId,
					widgetId: string,
					payload?: any,
				): Promise<any> {
					return new Promise(async (resolve) => {
						if (typeof widgetId === 'undefined') {
							console.warn('path parameter missing');
							resolve(state.datastore);
							return;
						}

						const previousValue = get(
							state.datastore,
							widgetId,
						);

						/** if previousValue is undefined, then setting undefined again is not allowed **/
						if (previousValue === payload) {
							console.warn('value is same');
							resolve(state.datastore);
							return;
						}
						await setDataStoreInPath({
							routeId,
							widgetId,
							payload,
						});
						resolve(state.datastore);
					});
				},
				/** todo **/
				showToast(toastProps: any) {},
				/** todo **/
				showLoader(loaderParams?: any) {},
				/** todo **/
				hideLoader() {},
				/** todo **/
				showPopup(params: any) {},
				/** todo **/
				hidePopup() {},
				/** todo **/
				navigate(routeId: string) {},
			};

			const handleTriggerAction = (
				action: Action,
			) => {
				switch (action.type) {
					/**
					 * Global Action Handle - Update Datastore for routeId -> widgetId
					 * */
					case GlobalActionTokens.SET_DATASTORE_IN_PATH: {
						setDataStoreInPath(action);
						break;
					}
					/**
					 * Global Action Handle - Set Action map for routeId
					 * */
					case GlobalActionTokens.SET_ACTIONS: {
						setActions(action);
						break;
					}

					default: {
						/**
						 * Custom Action Handle
						 * */
						let template: TemplateSchema =
							action.routeId &&
							state.routeMap[action.routeId].template;
						template &&
							action.routeId &&
							state.routeMap[action.routeId].actions[
								action.type
							](
								action,
								template.datastore,
								standardUtilities,
							);
						break;
					}
				}
			};

			return (
				<WrappedComponent
					{...props}
					ref={ref}
					triggerAction={handleTriggerAction}
				/>
			);
		},
	);
};
