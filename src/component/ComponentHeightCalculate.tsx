import React, { useEffect, useLayoutEffect, useRef } from "react";
import { WidgetItem } from "../types";
import { LayoutChangeEvent, View } from "react-native";
import ItemRenderer from "../render/ItemRenderer";
export const ComponentHeightCalculate: ({
  widgetItems,
  datastore,
  callback,
}: {
  widgetItems: any;
  datastore: any;
  callback: any;
}) => JSX.Element = ({ widgetItems, datastore, callback }) => {
  const heightsMapRef = useRef({});

  return widgetItems.map((widgetItem: WidgetItem, index: number) => {
    const _onLayout = (event: LayoutChangeEvent) => {
      heightsMapRef.current[widgetItem.id] = event.nativeEvent.layout.height;
      if (index + 1 === widgetItems.length) {
        callback(heightsMapRef.current);
      }
    };

    return (
      <View onLayout={_onLayout} style={{ opacity: 0 }}>
        <ItemRenderer
          item={{
            id: widgetItem.id,
            type: widgetItem.type,
            props: datastore[widgetItem.id],
          }}
        />
      </View>
    );
  });
};
