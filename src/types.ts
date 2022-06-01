import { PerformActionFn } from "./context/PerformActionContext";
import React from "react";
import { View } from "react-native";

export type WidgetItem = {
  id: string;
  type: string;
  position?: string;
  props?: object;
};
export type ScreenProps = {
  route?: string; // screen or view to open
  routeId: string;
  initData?: TemplateSchema;
  widgetRegistry: WidgetRegistry;
};
export type DataStoreType = { [keys in string]: Object } | null;
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
  showModalSheet(routeKey: string, params: any): any;
  performAction?: PerformActionFn;
  updateDataStore(store: {}): void;
  widgetRef?: React.RefObject<View>;
  isVisible?: boolean;
};
