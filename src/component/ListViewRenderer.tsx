import React from "react";
import { Dimensions } from "react-native";
import {
  RecyclerListView,
  DataProvider,
  LayoutProvider,
} from "recyclerlistview";
import ItemRenderer from "../render/ItemRenderer";
import _get from "lodash-es/get";
import { TemplateSchema } from "../types";
import { ComponentHeightCalculate } from "./ComponentHeightCalculate";

const { width } = Dimensions.get("window");
const heightsMapRef = { current: {} };

export default class ListViewRenderer extends React.Component<
  { template: TemplateSchema },
  {
    dataProvider: DataProvider;
    datastore: { [keys in string]: Object };
    isMeasuring: boolean;
  }
> {
  private _layoutProvider: LayoutProvider;
  constructor(args: any) {
    super(args);

    let dataProvider = new DataProvider((r1, r2) => {
      return r1 !== r2;
    });

    this._rowRenderer = this._rowRenderer.bind(this);
    this.state = {
      dataProvider: dataProvider.cloneWithRows(
        _get(this.props.template, `success.data.layout.widgets`, [])
      ),
      datastore: _get(this.props.template, `success.data.datastore`, {}),
      isMeasuring: true,
    };
  }
  initLayoutMaker = () => {
    this._layoutProvider = new LayoutProvider(
      (index) => {
        return index;
      },
      (type, dim, index) => {
        const item = this.state.dataProvider.getAllData()[index];
        dim.width = width;
        dim.height = heightsMapRef.current[item.id] | 0;
      }
    );
  };

  _rowRenderer(type: number, data: { id: string; type: string }) {
    return (
      <ItemRenderer
        item={{
          id: data.id,
          type: data.type,
          props: this.state.datastore[data.id],
        }}
      />
    );
  }
  _updateHeight = (calculatedHeights: {
    [key in string | number]: number;
  }) => {
    heightsMapRef.current = calculatedHeights;
    this.setState({ isMeasuring: false });
    this.initLayoutMaker();
  };
  render() {
    if (this.state.isMeasuring)
      return (
        <ComponentHeightCalculate
          widgetItems={this.state.dataProvider.getAllData()}
          datastore={this.state.datastore}
          callback={this._updateHeight}
        />
      );
    return (
      <RecyclerListView
        layoutProvider={this._layoutProvider}
        dataProvider={this.state.dataProvider}
        rowRenderer={this._rowRenderer}
      />
    );
  }
}
