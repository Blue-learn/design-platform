import { useContext } from 'react';
import { Context } from '../context';
import { useMemo } from 'react';
import { StandardUtilities } from '../types';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get } from 'lodash-es';
import SharedPropsService from '../SharedPropsService';
import {
	goBack,
	goToRoute,
} from '../navigation/root_navigation';

const standardUtilitiesRaw = (
	state: any,
	setDataStoreInPath: (payload: any) => any,
	setLayout: (payload: any) => any,
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
	setLayout(routeId, template) {
		setLayout({
			routeId,
			template,
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

export const standardUtilitiesHook =
	(): StandardUtilities => {
		const { setDataStoreInPath, state, setLayout } =
			useContext(Context);

		return useMemo(
			() =>
				standardUtilitiesRaw(
					state,
					setDataStoreInPath,
					setLayout,
				),
			[state],
		);
	};
