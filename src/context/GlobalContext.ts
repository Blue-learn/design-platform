import React from "react";
import createDataContext from "./createDataContext";
import { DataStoreType, ScreenProps, WidgetRegistry } from "../types";

enum GlobalActionType {
  SET_CONFIG = "set_config",
  SET_SCREEN_PROPS = "set_screen_props",
  SET_DATASTORE = "set_datastore",
}

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

type GlobalAction = SetConfigAction | SetScreenPropsAction | SetDatastoreAction;

export type GlobalState = {
  config?: WidgetRegistry | null;
  screenProps?: ScreenProps | null;
  datastore: DataStoreType;
};

const initialState: GlobalState = {
  config: null,
  screenProps: null,
  datastore: null,
};

const GlobalReducer = (state: GlobalState, action: GlobalAction) => {
  switch (action.type) {
    case GlobalActionType.SET_CONFIG:
      return { ...state, config: action.payload };
    case GlobalActionType.SET_SCREEN_PROPS:
      return { ...state, screenProps: action.payload };
    case GlobalActionType.SET_DATASTORE:
      return { ...state, datastore: action.payload };
    default:
      return state;
  }
};

const setConfig = (dispatch: any) => {
  return (config: WidgetRegistry) => {
    dispatch({ type: GlobalActionType.SET_CONFIG, payload: config });
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
    dispatch({ type: GlobalActionType.SET_DATASTORE, payload });
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
  { setConfig, setScreenProps, setDatastore },
  initialState
);
