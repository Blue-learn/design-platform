import { CallbackWithResult } from '@react-native-async-storage/async-storage/lib/typescript/types';
import { AxiosResponse } from 'axios';
import React, { Component } from 'react';
import { View } from 'react-native';

export type RouteMap = {
	[routeId: string]: PageType<any>;
};

export type MicroFrontendProps = {
	routeMap: RouteMap;
	routeCurrent: string;
	widgetRegistry: WidgetRegistry;
};

export type WidgetItem = {
	id: string;
	type: string;
	position?: POSITION;
	props?: object;
};

export type Datastore = {
	[widgetId in string]: Object;
};

export type Layout = {
	id: string;
	type: string;
	widgets: WidgetItem[];
};

export type TemplateSchema = {
	layout: Layout;
	datastore: Datastore;
};

export type WidgetRegistry = {
	[key: string]: {
		Component?: JSX.Element;
	};
};

export type WidgetProps = {
	item: WidgetItem;
	renderItem?: Component;
	triggerAction?: TriggerAction;
	/** Todo **/
	widgetRef?: React.RefObject<View>;
};

export enum GlobalActionTokens {
	SET_WIDGET_REGISTRY = 'SET_WIDGET_REGISTRY',
	SET_DATASTORE = 'SET_DATASTORE',
	SET_DATASTORE_IN_PATH = 'SET_DATASTORE_IN_PATH',
	SET_ACTIONS = 'SET_ACTIONS',
	SET_ROUTE_MAP = 'SET_ROUTE_MAP',
	SET_TEMPLATE_ROUTE = 'SET_TEMPLATE_ROUTE',
}

export type StandardUtilities = {
	network: {
		get: (
			url: string,
			payload?: { params: any },
		) => Promise<AxiosResponse<any, any>>;
		post: (
			url: string,
			payload: any,
		) => Promise<AxiosResponse<any, any>>;
	};
	asyncStorage: {
		get: (
			key: string,
			callBack?: () =>
				| CallbackWithResult<string>
				| undefined,
		) => void;
		set: (
			key: string,
			value: any,
			callBack?: () =>
				| CallbackWithResult<string>
				| undefined,
		) => void;
		remove: (
			key: string,
			callBack?: () =>
				| CallbackWithResult<string>
				| undefined,
		) => void;
		clear: (
			callBack?: () =>
				| CallbackWithResult<string>
				| undefined,
		) => void;
	};
	navigate(routeId: string): void;
	/** todo **/
	showLoader(loaderParams?: any): void;
	/** todo **/
	hideLoader(): void;
	/** todo **/
	showPopup(params: any): void;
	/** todo **/
	hidePopup(): void;
	/** todo **/
	showToast(toastProps: any): void;
	/** todo **/
	reloadPage(reloadParams?: any): void;

	/** @description Scroll to Index by passing RouteId and scroll to position as Index in options prop***/
	scrollToIndex(options: ScrollToIdOptions): void;

	/** @description Returns complete main state of app. Pass custom path as string to access nested props.
	 * Example-> routeMap.${action.routeId}.template.***your_custom_path_to_props***    **/
	getDatastore(path?: string): Promise<any>;

	/** @description Set or Update Datastore by pass routeId, widgetId, Props[Optional] **/
	setDatastore(
		/** @description routeId: Pass string value of RouteId from RouteMap. RouteMap->{routeId:{widgetId}} **/
		routeId: string,
		/** @description widgetId (Path): Use DOT(.) as deliminator to pass complete path for nested props **/
		widgetId: string,
		/** @description New value will be merged with exist value **/
		props?: any,
	): Promise<any>;
};

export type ActionFunction = (
	action: Action,
	datastore: Datastore,
	utilities: StandardUtilities,
) => Promise<any> | any;

export type ActionMap = {
	[key: string]: ActionFunction;
};

export type PageType<T> = {
	onLoad: (
		initialParameters?: any,
	) => Promise<TemplateSchema>;
	template?: TemplateSchema;
	actions?: ActionMap;
};

/** An enum to select the layout of a screen */
export enum LAYOUTS {
	/** The widget is arranged in a list layout */
	LIST = 'layouts/list',

	/** The widget is arranged in a tab layout */
	/* todo */
	TAB = 'layouts/tab',

	MODAL = 'layout/modal',
}

/** An enum to decide on the positioning of a widget */
export enum POSITION {
	/** The widget is fixed to the top of the screen, and continues to appear even when you scroll down */
	FIXED_TOP = 'position/fixed_top',
	/** The  widget is present at the top of the page in the default state */
	ABSOLUTE_TOP = 'position/absolute_top',
	/** The widget is fixed to the bottom of the screen, and continues to appear even when you scroll up */
	FIXED_BOTTOM = 'position/fixed_bottom',
	/** The  widget is present at the bottom of the page in the default state */
	ABSOLUTE_BOTTOM = 'position/absolute_bottom',
	/** This is a position specific to FAB widget */
	FAB = 'position/fab',
	/** TODO */
	STICKY_TOP = 'position/sticky_top',
}

/** Type definition for a tap action
 * @param type action type it can either be a custom type or the one of the predefined action types
 * @param data data that is required to be passed for the tap action
 * @param routeId [Optional] performs action on specific routeId
 */
export type Action<DataType = any> = {
	type: string;
	routeId?: string;
	payload: DataType extends object
		? { [k in keyof DataType]: DataType[k] }
		: any;
};

export type TriggerAction = (
	action: Action,
) => Promise<
	any | { isError: boolean; err: Error }
>;

export enum SCREEN_SIZE {
	/**
	 * Screen Width <576px
	 */
	X_SMALL = 'extra_small',

	/**
	 * Screen Width >=576px
	 */
	SMALL = 'small',

	/**
	 * Screen Width >=768px
	 */
	MEDIUM = 'medium',

	/**
	 * Screen Width >=992px
	 */
	LARGE = 'large',

	/**
	 * Screen Width >=1200px
	 */
	X_LARGE = 'extra_large',
}

export type OnScrollRef = {
	onScroll(yValue: number): void;
};

export type ScrollToIdOptions = {
	index: number;
	routeId: string;
	viewOffset?: number;
};
