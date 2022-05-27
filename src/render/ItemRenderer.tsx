import React from "react";
import _isEmpty from "lodash-es/isEmpty";
import {
  PerformActionFn,
  PerformTapActionFn,
  withPerformActionContext,
} from "../context/PerformActionContext";
import StandardWidgetRenderer from "./StandardWidgetRenderer";

export type TemplateItem = {
  id: string;
  type?: string;
  widgetType?: string;
  props?: any;
};
interface Props {
  item: TemplateItem;
  extraProps?: any;
  isShimmer?: boolean;
  onComponentMount?: (id: string) => void;
  forwardedRef?: any;
  // from context
  performTapAction?: PerformTapActionFn;
}

class ItemRenderer extends React.PureComponent<Props> {
  boundPerformTapAction: PerformActionFn;

  itemData: any;

  constructor(props: Props) {
    super(props);
    const { item, performTapAction } = props;

    if (performTapAction) {
      this.boundPerformTapAction = performTapAction();
    }
  }

  componentDidMount() {
    const { item, onComponentMount } = this.props;
    if (
      onComponentMount &&
      !_isEmpty(item) &&
      (!_isEmpty(item.props) || !_isEmpty(this.itemData))
    )
      onComponentMount(item.id || "");
  }

  render() {
    const { item, extraProps = {}, forwardedRef, isShimmer } = this.props;

    const itemData = item.props || {};
    if (itemData !== this.itemData) {
      this.itemData = itemData;
    }
    if (_isEmpty(item.props) && _isEmpty(itemData)) {
      const errorObj = {
        errorType: "ERROR_TYPES.ITEM_RENDERING_SKIPPED",
        message: `Component ${item.type} not rendered. Missing props for id ${item.id}.`,
      };
      console.warn("ItemRender->", errorObj);
      return null;
    }
    return (
      <StandardWidgetRenderer
        key={`${item.id || item.type}`}
        ref={forwardedRef}
        performAction={this.boundPerformTapAction}
        item={item}
        {...extraProps}
        {...itemData}
      />
    );
  }
}

const ItemRendererWithRef = React.forwardRef((props: Props, ref) => {
  return <ItemRenderer {...props} forwardedRef={ref} />;
});

export default withPerformActionContext(ItemRendererWithRef);
