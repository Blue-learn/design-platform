import React from 'react';
import createDataContext from './createDataContext';
import {
	DataStoreType,
	GlobalActionType,
	ScreenProps,
	WidgetRegistry,
} from '../types';

type PayloadSetDatastoreInPath = {
	path: string;
	data: any;
};
type SetConfigAction = {
	type: GlobalActionType.SET_CONFIG;
	payload: WidgetRegistry;
};
type SetDatastoreAction = {
	type: GlobalActionType.SET_DATASTORE;
	payload: WidgetRegistry;
};

type SetScreenPropsAction = {
	type: GlobalActionType.SET_SCREEN_PROPS;
	payload: ScreenProps;
};

type SetDatastoreInPath = {
	type: GlobalActionType.SET_DATASTORE_IN_PATH;
	payload: PayloadSetDatastoreInPath;
};
type SetActions = {
	type: GlobalActionType.SET_ACTIONS;
	payload: PayloadSetDatastoreInPath;
};

type GlobalAction =
	| SetConfigAction
	| SetScreenPropsAction
	| SetDatastoreAction
	| SetDatastoreInPath
	| SetActions;

export type GlobalState = {
	config?: WidgetRegistry | null;
	screenProps?: ScreenProps | null;
	datastore: DataStoreType;
	actions: any;
};

const initialState: GlobalState = {
	actions: {},
	config: null,
	screenProps: null,
	datastore: null,
};

const GlobalReducer = (
	state: GlobalState,
	action: GlobalAction,
) => {
	switch (action.type) {
		case GlobalActionType.SET_CONFIG:
			return { ...state, config: action.payload };
		case GlobalActionType.SET_SCREEN_PROPS:
			return {
				...state,
				screenProps: action.payload,
			};
		case GlobalActionType.SET_DATASTORE:
			return { ...state, datastore: action.payload };
		case GlobalActionType.SET_DATASTORE_IN_PATH: {
			if (state.datastore === null)
				return { ...state };
			return {
				...state,
				datastore: {
					...state.datastore,
					[action.payload.path]: {
						...state.datastore[action.payload.path],
						...action.payload.data,
					},
				},
			};
		}
		case GlobalActionType.SET_ACTIONS: {
			return {
				...state,
				actions: { ...action.payload },
			};
		}
		default:
			return state;
	}
};

const setConfig = (dispatch: any) => {
	return (config: WidgetRegistry) => {
		dispatch({
			type: GlobalActionType.SET_CONFIG,
			payload: config,
		});
	};
};

const setScreenProps = (dispatch: any) => {
	return (screenProps: ScreenProps) => {
		dispatch({
			type: GlobalActionType.SET_SCREEN_PROPS,
			payload: screenProps,
		});
	};
};

const setDatastore = (dispatch: any) => {
	return (payload: DataStoreType) => {
		dispatch({
			type: GlobalActionType.SET_DATASTORE,
			payload,
		});
	};
};

const setDataStoreInPath = (dispatch: any) => {
	return (payload: any) => {
		dispatch({
			type: GlobalActionType.SET_DATASTORE_IN_PATH,
			...payload,
		});
	};
};
const setActions = (dispatch: any) => {
	return (payload: any) => {
		dispatch({
			type: GlobalActionType.SET_ACTIONS,
			payload,
		});
	};
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
		setConfig,
		setScreenProps,
		setDatastore,
		setDataStoreInPath,
		setActions,
	},
	initialState,
);
