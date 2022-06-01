import React, { useEffect, useLayoutEffect, useRef } from "react";
import { DataStoreType, WidgetItem } from "../types";
import { LayoutChangeEvent, View } from "react-native";
import ItemRenderer from "../render/ItemRenderer";
export const ComponentHeightCalculate: React.FC<
  { widgetItems: WidgetItem[] } & { datastore: DataStoreType | null } & {
    callback: (measuredHeightsMap: Object) => void;
  }
> = ({ widgetItems, datastore, callback }): JSX.Element => {
  const heightsMapRef = useRef({});

  return (
    <>
      {widgetItems.map((widgetItem: WidgetItem, index: number): JSX.Element => {
        const _onLayout = (event: LayoutChangeEvent) => {
          heightsMapRef.current[widgetItem.id] =
            event.nativeEvent.layout.height;
          if (index + 1 === widgetItems.length) {
            callback(heightsMapRef.current);
          }
        };

        return (
          <View
            key={`height_${widgetItem.id}`}
            onLayout={_onLayout}
            style={{ opacity: 0 }}
          >
            <ItemRenderer
              item={{
                id: widgetItem.id,
                type: widgetItem.type,
                props: datastore?.[widgetItem.id],
              }}
            />
          </View>
        );
      })}
    </>
  );
};
