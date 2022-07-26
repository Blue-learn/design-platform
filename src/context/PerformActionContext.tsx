import React, { useContext } from 'react';
import {
	GlobalActionTokens,
	StandardUtilities,
	Action,
	TemplateSchema,
} from '../types';
import { Context } from './GlobalContext';
import { get } from 'lodash-es';

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
				getFromDataStore(path: string): Promise<any> {
					return Promise.resolve(get(state, path));
				},
				/** todo **/
				scrollToId(options: any): void {},
				setInDataStore(
					path: string,
					value?: any,
				): Promise<any> {
					return new Promise(async (resolve) => {
						if (typeof path === 'undefined') {
							console.warn('path parameter missing');
							resolve(state.datastore);
							return;
						}

						const previousValue = get(
							state.datastore,
							path,
						);
						// if previousValue is undefined, then setting undefined again is not allowed
						if (previousValue === value) {
							console.warn('value is same');
							resolve(state.datastore);
							return;
						}

						await setDataStoreInPath(path, value);
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
					 * Global Action Handle
					 * */
					case GlobalActionTokens.SET_DATASTORE_IN_PATH: {
						setDataStoreInPath(action);
						break;
					}
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
								template.success.data.datastore,
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
