import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import SharedPropsService from "../SharedPropsService";
import { ScreenProps } from "../types";
import ListViewRenderer from "../component/ListViewRenderer";

const Navigator = (props: ScreenProps) => {
  const [isLoading, toggleLoad] = useState(true);
  const _initGlobalProps = async () => {
    toggleLoad(true);
    await SharedPropsService.setGlobalProps(props);
    toggleLoad(false);
  };

  useEffect(() => {
    _initGlobalProps();
  }, [props]);

  if (isLoading)
    return (
      <ActivityIndicator style={{ margin: 10 }} size="large" color={"black"} />
    );

  return (
    <View style={{ flex: 1 }}>
      {props.initData && <ListViewRenderer template={props.initData} />}
    </View>
  );
};

export default Navigator;
