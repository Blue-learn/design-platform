import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { get } from 'lodash-es';
import { useContext, useMemo } from 'react';
import { Context } from '../context';
import {
	goBack,
	goToRoute,
} from '../navigation/root_navigation';
import SharedPropsService from '../SharedPropsService';
import {
	StandardUtilities,
	WidgetItem,
} from '../types';

export const standardUtilitiesRaw = (
	state: any,
	setDataStoreInPath: any,
	appendWidgets: any,
): StandardUtilities => ({
	network: axios,
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
	appendWidgets(routeId, datastore, widgets) {
		appendWidgets({
			routeId,
			datastore,
			widgets,
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
		goToRoute(routeId, {});
	},
	goBack,
});

/**
 * @description
 * WARNING: This hook does not return updated value of data recived from context
 */
export const standardUtilitiesHook =
	(): StandardUtilities => {
		const {
			setDataStoreInPath,
			appendWidgets,
			setLoaderForRoute,
			state,
		} = useContext(Context);

		const standardUtilitiesRaw =
			(): StandardUtilities => ({
				network: axios,
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
				appendWidgets(routeId, datastore, widgets) {
					appendWidgets({
						routeId,
						datastore,
						widgets,
					});
				},
				/** todo **/
				reloadPage(reloadParams?: any) {},
				/** todo **/
				showToast(toastProps: any) {},
				/** todo **/
				showLoader(
					routeId: string,
					widgetItems: WidgetItem[],
				) {
					setLoaderForRoute({
						routeId,
						widgetItems,
					});
				},
				hideLoader(routeId: string) {
					setLoaderForRoute({
						routeId,
						widgetItems: [],
					});
				},
				/** todo **/
				showPopup(params: any) {},
				/** todo **/
				hidePopup() {},
				/** todo **/
				navigate(routeId: string) {
					goToRoute(routeId, {});
				},
				goBack,
			});

		return useMemo(() => {
			return standardUtilitiesRaw();
		}, []);
	};
