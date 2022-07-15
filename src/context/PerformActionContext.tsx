import React, { useContext } from 'react';
import {
	GlobalActionType,
	StandardUtilities,
	TapAction,
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
					return Promise.resolve(
						get(state.datastore, path),
					);
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

			const handlePerformAction = (
				data: TapAction,
			) => {
				switch (data.type) {
					/**
					 * Global Action Handle
					 * */
					case GlobalActionType.SET_DATASTORE_IN_PATH:
						setDataStoreInPath(data);
						break;
					case GlobalActionType.SET_ACTIONS: {
						setActions(data);
						break;
					}

					default: {
						/**
						 * Custom Action Handle
						 * */
						// console.warn('custom actions', actions);
						// console.warn('custom data', data);
						state.actions &&
							Object.values(state.actions).length > 0 &&
							data.type &&
							data.payload &&
							state.actions[data.type](
								data.payload,
								state,
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
					performTapAction={handlePerformAction}
				/>
			);
		},
	);
};
