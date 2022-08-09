import React, { useContext } from 'react';
import {
	Action,
	GlobalActionTokens,
	StandardUtilities,
	TemplateSchema,
} from '../types';
import {
	Context,
	GlobalState,
} from './GlobalContext';
import { get } from 'lodash-es';
import SharedPropsService from '../SharedPropsService';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
	goBack,
	navigateToRoute,
} from '../navigation/root_navigation';

export const TriggerAction = (
	state: GlobalState,
	setDataStoreInPath: (payload: Action) => void,
	setActions: (payload: Action) => void,
	standardUtilities: StandardUtilities,
) => {
	return (action: Action) => {
		switch (action.type) {
			/**
			 * Global Action Handle - Update Datastore for routeId -> widgetId
			 * */
			case GlobalActionTokens.SET_DATASTORE_IN_PATH: {
				if (setDataStoreInPath) {
					setDataStoreInPath(action);
				}
				break;
			}
			/**
			 * Global Action Handle - Set Action map for routeId
			 * */
			case GlobalActionTokens.SET_ACTIONS: {
				if (setActions) {
					setActions(action);
				}
				break;
			}

			default: {
				/**
				 * Custom Action Handle
				 * */
				const template:
					| ''
					| undefined
					| null
					| TemplateSchema =
					action.routeId &&
					state.routeMap &&
					state.routeMap[action.routeId].template;

				const actionsMap =
					template &&
					action.routeId &&
					state.routeMap &&
					state.routeMap[action.routeId].actions;

				if (
					actionsMap != null &&
					template &&
					template.datastore != null
				) {
					actionsMap[action.type](
						action,
						template?.datastore,
						standardUtilities,
					);
				}
				break;
			}
		}
	};
};
const standardUtilities = (
	state: any,
	setDataStoreInPath: (payload: any) => any,
): StandardUtilities => ({
	network: {
		get: async (url, payload) =>
			await axios.get(url, payload),
		post: async (url, payload) =>
			await axios.post(url, payload),
	},
	asyncStorage: {
		get: (key, callBack) =>
			AsyncStorage.getItem(key, callBack),
		set: (key, value, callBack) =>
			AsyncStorage.setItem(key, value, callBack),
		remove: (key, callBack) =>
			AsyncStorage.removeItem(key, callBack),
		clear: (callBack) =>
			AsyncStorage.clear(callBack),
	},
	getDatastore(path: string): Promise<any> {
		if (path) {
			return Promise.resolve(get(state, path));
		} else {
			return state;
		}
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
	reloadPage(reloadParams?: any) {},
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
	navigate(routeId: string) {
		navigateToRoute(routeId, {});
	},
	goBack,
});

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

			return (
				<WrappedComponent
					{...props}
					ref={ref}
					triggerAction={TriggerAction(
						state,
						setDataStoreInPath,
						setActions,
						standardUtilities(
							state,
							setDataStoreInPath,
						),
					)}
				/>
			);
		},
	);
};
