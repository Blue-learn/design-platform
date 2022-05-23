import React from "react";
import createDataContext from "./createDataContext";
type ScreenProps = {};
type StandardEnum = { [id: number]: string };
export type WidgetItem = {
  id: string;
  widgetType: StandardEnum;
  props: any;
};

export type WidgetRegistry = {
  [key: string]: {
    Component?: React.ComponentType<any>;
  };
};

export type DesignComponentConfig = { widgetRegistry: WidgetRegistry };

enum GlobalActionType {
  SET_CONFIG = "set_config",
  SET_SCREEN_PROPS = "set_screen_props",
}

type SetConfigAction = {
  type: GlobalActionType.SET_CONFIG;
  payload: DesignComponentConfig;
};

type SetScreenPropsAction = {
  type: GlobalActionType.SET_SCREEN_PROPS;
  payload: DesignComponentConfig;
};

type GlobalAction = SetConfigAction | SetScreenPropsAction;

export type GlobalState = {
  config: DesignComponentConfig | null;
  screenProps: ScreenProps | null;
};

const initialState: GlobalState = {
  config: null,
  screenProps: null,
};

const GlobalReducer = (state: GlobalState, action: GlobalAction) => {
  switch (action.type) {
    case GlobalActionType.SET_CONFIG:
      return { config: action.payload };
    case GlobalActionType.SET_SCREEN_PROPS:
      return { screenProps: action.payload };
    default:
      return state;
  }
};

const setConfig = (dispatch: any) => {
  return (config: DesignComponentConfig) => {
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

export const {
  Context,
  Provider,
}: {
  Context: React.Context<any>;
  Provider: React.FC;
} = createDataContext(
  GlobalReducer,
  { setConfig, setScreenProps },
  initialState
);
