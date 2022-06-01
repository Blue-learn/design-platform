import React from "react";
import _get from "lodash-es/get";
import { View, Text } from "react-native";
import ItemRenderer from "./ItemRenderer";
import SharedPropsService from "../SharedPropsService";
import { DataStoreType, TemplateProps } from "../types";

class StandardWidgetRenderer extends React.PureComponent<
  TemplateProps & { datastore: DataStoreType }
> {
  widgetRef: React.RefObject<View>;

  constructor(props: any) {
    super(props);
    this.state = {
      isVisible: true,
    };
    this.widgetRef = React.createRef<View>();
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
      itemProps = {
        ...itemProps,
        ...newItemProps,
      };
    }

    const props: any = {
      ...itemProps,
      renderItem: this.renderItem,
      performAction,
      showModalSheet,
      isVisible: true,
    };
    const Widget: any = _get(
      SharedPropsService.getPropsValue("widgetRegistry"),
      `${item.type}`,
      null
    );

    if (!Widget || !Widget.Component)
      return (
        <Text key={item.id}>
          Error type:{item.type} id:{item.id} not found
        </Text>
      );
    const WidgetToRender = Widget.Component;
    return <WidgetToRender key={item.id} {...props} ref={this.widgetRef} />;
  }
}

export default StandardWidgetRenderer;
