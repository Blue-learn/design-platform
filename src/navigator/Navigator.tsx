import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import SharedPropsService from "../SharedPropsService";
import { ScreenProps } from "../types";
import ListViewRenderer from "../component/ListViewRenderer";
const Navigator: React.FC<ScreenProps> = (props) => {
  const [isLoading, toggleLoad] = useState(true);
  const _initGlobalProps = async () => {
    toggleLoad(true);
    await SharedPropsService.setGlobalProps(props);
    toggleLoad(false);
  };

  useEffect(() => {
    _initGlobalProps();
  }, []);

  if (isLoading)
    return (
      <ActivityIndicator style={{ margin: 10 }} size="large" color={"black"} />
    );
  return (
    <View style={{ flex: 1 }}>
      {props.initData && (
        <ListViewRenderer
          id={props.initData.success.data.layout.id}
          datastore={props.initData.success.data.datastore}
          widgetItems={props.initData.success.data.layout.widgets}
        />
      )}
    </View>
  );
};

export default Navigator;
