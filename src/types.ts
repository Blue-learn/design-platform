import React from 'react';
import { View } from 'react-native';

export type WidgetItem = {
	id: string;
	type: string;
	position?: POSITION;
	props?: object;
};
export type ScreenProps = {
	initData?: TemplateSchema;
	widgetRegistry: WidgetRegistry;
};
export type DataStoreType =
	| { [keys in string]: Object }
	| null;
export type LayoutType = {
	id: string;
	type: string;
	widgets: WidgetItem[];
};
export type TemplateSchema = {
	isError: boolean;
	success: {
		data: {
			layout: LayoutType;
			datastore: DataStoreType;
		};
	};
};

export type WidgetRegistry = {
	[key: string]: {
		Component?: JSX.Element;
	};
};

export type TemplateProps = {
	item: WidgetItem;
	renderItem?: any;
	showModalSheet(
		routeKey: string,
		params: any,
	): any;
	performAction?: PerformActionFn;
	updateDataStore(store: {}): void;
	widgetRef?: React.RefObject<View>;
	isVisible?: boolean;
};

export enum GlobalActionType {
	SET_CONFIG = 'set_config',
	SET_SCREEN_PROPS = 'set_screen_props',
	SET_DATASTORE = 'set_datastore',
	SET_DATASTORE_IN_PATH = 'SET_DATASTORE_IN_PATH',
	SET_ACTIONS = 'SET_ACTIONS',
}

export type StandardUtilities = {
	showLoader(loaderParams?: any): void;
	hideLoader(): void;
	showPopup(params: any): void;
	hidePopup(): void;
	showToast(toastProps: any): void;
	reloadPage(reloadParams?: any): void;
	scrollToId(options: any): void;
	getFromDataStore(path: string): Promise<any>;
	setInDataStore(
		path: string,
		value?: any,
	): Promise<any>;
};
export type ActionFn = (
	actionData: any,
	dataStore: DataStoreType,
	utilities: StandardUtilities,
) => Promise<any> | any;
export type PageActionMap = {
	[key: string]: ActionFn;
};
export type ActionMap = PageActionMap;

export type PageType<T> = {
	onLoad: (
		initialParameters?: any,
	) => TemplateSchema;
	actions?: ActionMap;
	loadNext?(
		initData: T,
		action: TapAction,
		dataStore: any,
	): Promise<TemplateSchema>;
};

/** An enum to select the layout of a screen */
export enum LAYOUTS {
	/** The widget are arranged in a list layout */
	LIST = 'layouts/list',

	/* todo */
	/** The widget are arranged in a tab layout */
	TAB = 'layouts/tab',
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
 */
export type TapAction<DataType = any> = {
	type: string;
	payload: DataType extends object
		? { [k in keyof DataType]: DataType[k] }
		: any;
};

export type PerformActionFn = (
	tapAction: TapAction,
	// boolUpdateDataStore?: boolean | undefined,
) => Promise<
	any | { isError: boolean; err: Error }
>;

export type PerformTapActionFn =
	() => PerformActionFn;
