import React from "react";
import _get from "lodash-es/get";
import { View } from "react-native";
import ItemRenderer, { TemplateItem } from "./ItemRenderer";
import { PerformActionFn } from "../context/PerformActionContext";
import SharedPropsService from "../SharedPropsService";
import { DesignComponentConfig } from "../context";

type TemplateProps = {
  item: TemplateItem;
  renderItem?: any;
  showModalSheet(routeKey: string, params: any): any;
  performAction?: PerformActionFn;
  updateDataStore(store: {}): void;
  widgetRef?: React.RefObject<View>;
  isVisible?: boolean;
};

class StandardWidgetRenderer extends React.PureComponent<TemplateProps> {
  static config: DesignComponentConfig = { widgetRegistry: {} };

  private widgetRef: React.RefObject<View>;

  constructor(props: TemplateProps) {
    super(props);
    this.state = {
      isVisible: true,
    };
    StandardWidgetRenderer.config =
      SharedPropsService.getPropsValue("componentConfig");

    this.widgetRef = React.createRef<View>();
  }

  componentDidMount() {}

  componentWillUnmount() {}

  static getDerivedStateFromProps(props: TemplateProps, state: {}) {
    return null;
  }

  renderItem = (
    item: TemplateProps,
    extraProps: any = { isVisible: false }
  ) => {
    return (
      <ItemRenderer
        item={{
          ...item,
        }}
        extraProps={...{
          ...extraProps,
        }}
      />
    );
  };

  render() {
    const { item, performAction, showModalSheet, ...restProps } = this.props;

    let itemProps = restProps;
    if (item.props) {
      const newItemProps = item.props;
      itemProps = { ...itemProps, ...newItemProps };
    }

    const props: any = {
      ...itemProps,
      renderItem: this.renderItem,
      performAction,
      showModalSheet,
      isVisible: true,
    };

    const Widget: any = _get(
      StandardWidgetRenderer.config.widgetRegistry,
      `${item.type || item.widgetType}`,
      null
    );

    const WidgetToRender = Widget.Component;

    return (
      <>
        <WidgetToRender {...props} ref={this.widgetRef} />
      </>
    );
  }
}

export default StandardWidgetRenderer;
