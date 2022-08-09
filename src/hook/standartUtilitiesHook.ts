import { useContext } from 'react';
import { Context } from '../context/GlobalContext';

import { useState, useMemo } from 'react';
import { StandardUtilities } from '../types';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get } from 'lodash-es';
import SharedPropsService from '../SharedPropsService';
import {
	goBack,
	navigateToRoute,
} from '../navigation/root_navigation';

const standardUtilitiesRaw = (
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

export const standardUtilitiesHook =
	(): StandardUtilities => {
		const { setDataStoreInPath, state } =
			useContext(Context);

		return useMemo(
			() =>
				standardUtilitiesRaw(
					state,
					setDataStoreInPath,
				),
			[],
		);
	};