import React from "react";
import _get from "lodash-es/get";
import { TemplateItem } from "./ItemRenderer";
import SharedPropsService from "../SharedPropsService";
// import Separator from './components/Separator';

const ShimmerWidgetRenderer: React.FunctionComponent<TemplateItem> = ({
  type,
}) => {
  const config = SharedPropsService.getPropsValue("componentConfig");

  const Widget = _get(config, `${type}`, null);

  const WidgetToRender = Widget ? Widget.Shimmer : null;

  return <>{WidgetToRender ? <WidgetToRender /> : null}</>;
};
export default ShimmerWidgetRenderer;
