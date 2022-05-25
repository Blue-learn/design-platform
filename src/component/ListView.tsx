import React, { Props } from "react";
import { Dimensions } from "react-native";
import {
  RecyclerListView,
  DataProvider,
  LayoutProvider,
} from "recyclerlistview";
import ItemRenderer from "../render/ItemRenderer";
import _get from "lodash-es/get";
import { templateSchema } from "../template_schema";

export default class ListView extends React.Component<
  {},
  { dataProvider: DataProvider; datastore: { [keys in string]: Object } }
> {
  private readonly _layoutProvider: LayoutProvider;
  constructor(args: any) {
    super(args);

    let { width } = Dimensions.get("window");

    //Create the data provider and provide method which takes in two rows of data and return if those two are different or not.
    //THIS IS VERY IMPORTANT, FORGET PERFORMANCE IF THIS IS MESSED UP
    let dataProvider = new DataProvider((r1, r2) => {
      return r1 !== r2;
    });

    this._layoutProvider = new LayoutProvider(
      (index) => {
        return index;
      },
      (type, dim) => {
        dim.width = width;
        dim.height = 50;
      }
    );

    this._rowRenderer = this._rowRenderer.bind(this);

    //Since component should always render once data has changed, make data provider part of the state
    this.state = {
      dataProvider: dataProvider.cloneWithRows(
        _get(templateSchema, `success.data.layout.widgets`, [])
      ),
      datastore: _get(templateSchema, `success.data.datastore`, {}),
    };
  }

  _rowRenderer(type: number, data: any) {
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

  render() {
    return (
      <RecyclerListView
        layoutProvider={this._layoutProvider}
        dataProvider={this.state.dataProvider}
        rowRenderer={this._rowRenderer}
      />
    );
  }
}
