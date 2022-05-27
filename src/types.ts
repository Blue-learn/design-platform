import React from "react";

export type ScreenProps = {
  route?: string; // screen or view to open
  routeId: string;
  initData?: TemplateSchema;
  widgetRegistry: WidgetRegistry;
};
export type TemplateSchema = {
  isError: boolean;
  success: {
    data: {
      layout: {
        id: string;
        type: string;
        widgets: { id: string; type: string; position?: string }[];
      };
      datastore: { [keys in string]: Object };
    };
  };
};
type StandardEnum = { [id: number | string]: string };
export type WidgetItem = {
  id: string;
  type: StandardEnum;
  props: any;
};

export type WidgetRegistry = {
  [key: string]: {
    Component?: any;
  };
};
