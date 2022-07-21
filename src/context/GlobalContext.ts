import React from 'react';
import createDataContext from './createDataContext';
import {
	ActionMap,
	DataStoreType,
	GlobalActionType,
	RouteMap,
	TemplateSchema,
	WidgetRegistry,
} from '../types';
import { EmptyTemplate } from '../utility';
type SetWidgetRegistryAction = {
	type: GlobalActionType.SET_WIDGET_REGISTRY;
	payload: WidgetRegistry;
};

type PayloadSetDatastoreInPath = {
	routeId: string;
	path: string;
	data: any;
};

type PayloadSetDatastoreAction = {
	routeId: string;
	datastore: DataStoreType;
};
type SetDatastoreAction = {
	type: GlobalActionType.SET_DATASTORE;
	payload: PayloadSetDatastoreAction;
};

type SetDatastoreInPath = {
	type: GlobalActionType.SET_DATASTORE_IN_PATH;
	payload: PayloadSetDatastoreInPath;
};
type SetActions = {
	type: GlobalActionType.SET_ACTIONS;
	payload: { actions: ActionMap; routeId: string };
};
type SetRouteMap = {
	type: GlobalActionType.SET_ROUTE_MAP;
	payload: RouteMap;
};
type SetTemplateForRoute = {
	type: GlobalActionType.SET_TEMPLATE_ROUTE;
	payload: {
		routeId: string;
		template: TemplateSchema;
	};
};

type GlobalAction =
	| SetWidgetRegistryAction
	| SetDatastoreAction
	| SetDatastoreInPath
	| SetActions
	| SetRouteMap
	| SetTemplateForRoute;

export type GlobalState = {
	widgetRegistry?: WidgetRegistry | null;
	routeMap: RouteMap | null;
	currentRouteId: string | null;
};

const initialState: GlobalState = {
	widgetRegistry: null,
	routeMap: null,
	currentRouteId: null,
};

const setDataStorePageTypeData = (
	template: TemplateSchema = EmptyTemplate,
	datastore: DataStoreType = {},
): TemplateSchema => {
	return {
		success: {
			data: {
				layout: {
					...template?.success.data.layout,
				},
				datastore: {
					...template?.success.data.datastore,
					...datastore,
				},
			},
		},
		isError: false,
	};
};
const setDataStoreInPathPageTypeData = (
	template: TemplateSchema = EmptyTemplate,
	action: SetDatastoreInPath,
): TemplateSchema => {
	return {
		success: {
			data: {
				layout: {
					...template?.success.data.layout,
				},
				datastore: {
					...template?.success.data.datastore,
					[action.payload.path]: {
						...template?.success.data.datastore[
							action.payload.path
						],
						...action.payload.data,
					},
				},
			},
		},
		isError: false,
	};
};

const setActionsPageTypeData = (
	actionMap: ActionMap = {},
	action: SetActions,
): ActionMap => {
	return {
		...actionMap,
		...action.payload.actions,
	};
};
const setTemplatePageTypeData = (
	action: SetTemplateForRoute,
): TemplateSchema => {
	return {
		...action.payload.template,
	};
};

const setWidgetRegistry = (dispatch: any) => {
	return (widgetRegistry: WidgetRegistry) => {
		dispatch({
			payload: { ...widgetRegistry },
			type: GlobalActionType.SET_WIDGET_REGISTRY,
		});
	};
};

const setDatastore = (dispatch: any) => {
	return (payload: SetDatastoreAction) => {
		dispatch({
			payload,
			type: GlobalActionType.SET_DATASTORE,
		});
	};
};

const setDataStoreInPath = (dispatch: any) => {
	return (payload: SetDatastoreInPath) => {
		dispatch({
			payload,
			type: GlobalActionType.SET_DATASTORE_IN_PATH,
		});
	};
};
const setActions = (dispatch: any) => {
	return (payload: SetActions) => {
		dispatch({
			payload,
			type: GlobalActionType.SET_ACTIONS,
		});
	};
};
const setRouteMap = (dispatch: any) => {
	return (payload: SetRouteMap) => {
		dispatch({
			payload,
			type: GlobalActionType.SET_ROUTE_MAP,
		});
	};
};
const setTemplateForRoute = (dispatch: any) => {
	return (payload: SetTemplateForRoute) => {
		dispatch({
			payload,
			type: GlobalActionType.SET_TEMPLATE_ROUTE,
		});
	};
};

const GlobalReducer = (
	state: GlobalState,
	action: GlobalAction,
) => {
	switch (action.type) {
		case GlobalActionType.SET_ROUTE_MAP: {
			return {
				...state,
				routeMap: { ...action.payload },
			};
		}
		case GlobalActionType.SET_TEMPLATE_ROUTE: {
			return {
				...state,
				routeMap: {
					...state.routeMap,
					[action.payload.routeId]: {
						...(state.routeMap &&
							state.routeMap[action.payload.routeId]),
						template: setTemplatePageTypeData(action),
					},
				},
			};
		}
		case GlobalActionType.SET_DATASTORE: {
			const _template: TemplateSchema =
				(state.routeMap &&
					state.routeMap[action.payload.routeId]
						.template) ||
				EmptyTemplate;

			if (
				_template.success.data.layout.widgets
					.length == 0
			)
				return { ...state };
			return {
				...state,
				routeMap: {
					...state.routeMap,
					[action.payload.routeId]:
						setDataStorePageTypeData(
							_template,
							action.payload.datastore,
						),
				},
			};
		}
		case GlobalActionType.SET_DATASTORE_IN_PATH: {
			const _template: TemplateSchema =
				(state.routeMap &&
					state.routeMap[action.payload.routeId]
						.template) ||
				EmptyTemplate;

			if (
				_template.success.data.layout.widgets
					.length == 0
			)
				return { ...state };
			return {
				...state,
				routeMap: {
					...state.routeMap,
					[action.payload.routeId]:
						setDataStoreInPathPageTypeData(
							_template,
							action,
						),
				},
			};
		}
		case GlobalActionType.SET_ACTIONS: {
			const oldAction =
				(state.routeMap &&
					action.payload.routeId &&
					state.routeMap[action.payload.routeId]
						.actions) ||
				{};

			return {
				...state,
				routeMap: {
					...state.routeMap,
					[action.payload.routeId]: {
						...(state.routeMap &&
							state.routeMap[action.payload.routeId]),
						actions: setActionsPageTypeData(
							oldAction,
							action,
						),
					},
				},
			};
		}
		default:
			return state;
	}
};

export const {
	Context,
	Provider,
}: {
	Context: React.Context<any>;
	Provider: React.FC;
} = createDataContext(
	GlobalReducer,
	{
		setWidgetRegistry,
		setDatastore,
		setDataStoreInPath,
		setActions,
		setRouteMap,
		setTemplateForRoute,
	},
	initialState,
);
