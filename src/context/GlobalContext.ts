import React from 'react';
import createDataContext from './createDataContext';
import {
	ActionMap,
	Datastore,
	GlobalActionTokens,
	RouteMap,
	TemplateSchema,
	WidgetRegistry,
} from '../types';
import { EmptyTemplate } from '../utility';
type SetWidgetRegistryAction = {
	type: GlobalActionTokens.SET_WIDGET_REGISTRY;
	payload: WidgetRegistry;
};

type PayloadSetDatastoreInPath = {
	widgetId: string;
	data: any;
};

type PayloadSetDatastoreAction = {
	routeId: string;
	datastore: Datastore;
};
type SetDatastoreAction = {
	type: GlobalActionTokens.SET_DATASTORE;
	payload: PayloadSetDatastoreAction;
};

type SetDatastoreInPath = {
	type: GlobalActionTokens.SET_DATASTORE_IN_PATH;
	routeId: string;
	widgetId: string;
	payload: PayloadSetDatastoreInPath;
};
type SetActions = {
	type: GlobalActionTokens.SET_ACTIONS;
	payload: { actions: ActionMap; routeId: string };
};
type SetRouteMap = {
	type: GlobalActionTokens.SET_ROUTE_MAP;
	payload: RouteMap;
};
type SetTemplateForRoute = {
	type: GlobalActionTokens.SET_TEMPLATE_ROUTE;
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
	routeMap: RouteMap | null;
};

const initialState: GlobalState = {
	routeMap: null,
};

const setDataStorePageTypeData = (
	template: TemplateSchema = EmptyTemplate,
	datastore: Datastore = {},
): TemplateSchema => {
	return {
		layout: {
			...template?.layout,
		},
		datastore: {
			...template?.datastore,
			...datastore,
		},
	};
};
const setDataStoreInPathPageTypeData = (
	template: TemplateSchema = EmptyTemplate,
	action: SetDatastoreInPath,
): TemplateSchema => {
	return {
		layout: {
			...template?.layout,
		},
		datastore: {
			...template?.datastore,
			[action.widgetId]: {
				...template?.datastore[action.widgetId],
				...action.payload,
			},
		},
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
			type: GlobalActionTokens.SET_WIDGET_REGISTRY,
		});
	};
};

const setDatastore = (dispatch: any) => {
	return (payload: SetDatastoreAction) => {
		dispatch({
			payload,
			type: GlobalActionTokens.SET_DATASTORE,
		});
	};
};

const setDataStoreInPath = (dispatch: any) => {
	return (action: SetDatastoreInPath) => {
		dispatch({
			...action,
			type: GlobalActionTokens.SET_DATASTORE_IN_PATH,
		});
	};
};
const setActions = (dispatch: any) => {
	return (payload: SetActions) => {
		dispatch({
			payload,
			type: GlobalActionTokens.SET_ACTIONS,
		});
	};
};
const setRouteMap = (dispatch: any) => {
	return (payload: SetRouteMap) => {
		dispatch({
			payload,
			type: GlobalActionTokens.SET_ROUTE_MAP,
		});
	};
};
const setTemplateForRoute = (dispatch: any) => {
	return (payload: SetTemplateForRoute) => {
		dispatch({
			payload,
			type: GlobalActionTokens.SET_TEMPLATE_ROUTE,
		});
	};
};

const GlobalReducer = (
	state: GlobalState,
	action: GlobalAction,
) => {
	switch (action.type) {
		case GlobalActionTokens.SET_ROUTE_MAP: {
			return {
				...state,
				routeMap: { ...action.payload },
			};
		}
		case GlobalActionTokens.SET_TEMPLATE_ROUTE: {
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
		case GlobalActionTokens.SET_DATASTORE: {
			const _template: TemplateSchema =
				(state.routeMap &&
					state.routeMap[action.payload.routeId]
						.template) ||
				EmptyTemplate;

			if (_template.layout.widgets.length == 0)
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
		case GlobalActionTokens.SET_DATASTORE_IN_PATH: {
			const _template: TemplateSchema =
				(state.routeMap &&
					state.routeMap[action.routeId].template) ||
				EmptyTemplate;
			if (_template.layout.widgets.length == 0)
				return { ...state };
			return {
				...state,
				routeMap: {
					...state.routeMap,
					[action.routeId]: {
						...(state.routeMap &&
							state.routeMap[action.routeId]),
						template: setDataStoreInPathPageTypeData(
							_template,
							action,
						),
					},
				},
			};
		}
		case GlobalActionTokens.SET_ACTIONS: {
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
