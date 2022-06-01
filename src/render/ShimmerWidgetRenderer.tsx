import React from "react";
import _get from "lodash-es/get";
import SharedPropsService from "../SharedPropsService";
import { WidgetItem } from "../types";

const ShimmerWidgetRenderer: React.FunctionComponent<WidgetItem> = ({
  type,
}) => {
  const config = SharedPropsService.getPropsValue("widgetRegistry");

  const Widget = _get(config, `${type}`, null);

  const WidgetToRender = Widget ? Widget.Shimmer : null;

  return <>{WidgetToRender ? <WidgetToRender /> : null}</>;
};
export default ShimmerWidgetRenderer;
