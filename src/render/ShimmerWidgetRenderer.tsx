import React from "react";
import _get from "lodash-es/get";
import { TemplateItem } from "./ItemRenderer";
import SharedPropsService from "../SharedPropsService";

const ShimmerWidgetRenderer: React.FunctionComponent<TemplateItem> = ({
  type,
}) => {
  const config = SharedPropsService.getPropsValue("widgetRegistry");

  const Widget = _get(config, `${type}`, null);

  const WidgetToRender = Widget ? Widget.Shimmer : null;

  return <>{WidgetToRender ? <WidgetToRender /> : null}</>;
};
export default ShimmerWidgetRenderer;
