import React from 'react';
import createDataContext from './createDataContext';
import {
	ActionMap,
	Datastore,
	GlobalActionTokens,
	LAYOUTS,
	RouteMap,
	TemplateSchema,
	WidgetItem,
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
type SetLoaderForRoute = {
	type: GlobalActionTokens.SET_LOADER_IN_PATH;
	routeId: string;
	widgetItems: WidgetItem[];
};

type AppenWidgets = {
	type: GlobalActionTokens.APPEND_WIDGETS;
	payload: {
		routeId: string;
		widgets: WidgetItem[];
		datastore: Datastore;
	};
};

type GlobalAction =
	| SetWidgetRegistryAction
	| SetDatastoreAction
	| SetDatastoreInPath
	| SetActions
	| SetRouteMap
	| SetTemplateForRoute
	| AppenWidgets
	| SetLoaderForRoute;

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

// const mergeLayout = (
// 	template: TemplateSchema = EmptyTemplate,
// 	datastore: Datastore = {},
// ): TemplateSchema => {
// 	return {
// 		layout: {
// 			...template?.layout,
// 		},
// 		datastore: {
// 			...template?.datastore,
// 			...datastore,
// 		},
// 	};
// };

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
const setLoaderForRoute = (dispatch: any) => {
	return (payload: SetLoaderForRoute) => {
		dispatch({
			payload,
			type: GlobalActionTokens.SET_LOADER_IN_PATH,
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

const appendWidgets = (dispatch: any) => {
	return (payload: AppenWidgets) => {
		dispatch({
			payload,
			type: GlobalActionTokens.APPEND_WIDGETS,
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
		case GlobalActionTokens.SET_LOADER_IN_PATH: {
			const _widgetItemsShimmer: WidgetItem[] =
				(state.routeMap &&
					state.routeMap[action.routeId].loading) ||
				[];

			if (_widgetItemsShimmer.length == 0)
				return { ...state };
			return {
				...state,
				routeMap: {
					...state.routeMap,
					[action.routeId]: {
						...(state.routeMap &&
							state.routeMap[action.routeId]),
						loading: [...action.widgetItems],
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

		case GlobalActionTokens.APPEND_WIDGETS: {
			if (!state.routeMap) return;

			const combined_template: TemplateSchema = {
				datastore: {
					...state.routeMap[action.payload.routeId]
						.template?.datastore,
					...action.payload.datastore,
				},
				layout: {
					id: state.routeMap[action.payload.routeId]
						.template?.layout.id as string,
					type: state.routeMap[action.payload.routeId]
						.template?.layout.type as LAYOUTS,
					widgets: [
						...((state.routeMap &&
							state.routeMap[action.payload.routeId]
								.template?.layout
								.widgets) as WidgetItem[]),
						...action.payload.widgets,
					],
				},
			};

			return {
				...state,
				routeMap: {
					...state.routeMap,
					[action.payload.routeId]: {
						...(state.routeMap &&
							state.routeMap[action.payload.routeId]),
						template: combined_template,
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
		appendWidgets,
		setLoaderForRoute,
	},
	initialState,
);
