import React, { useEffect } from "react";
import { View, Text } from "react-native";
import SharedPropsService from "../SharedPropsService";

const Navigator = (props: any) => {
  useEffect(() => {}, []);
  console.warn("received props -> ", props);
  SharedPropsService.setGlobalProps(props.config);

  return (
    <View style={{ flex: 1 }}>
      <Text>Hello from Platform......xxx.....</Text>
    </View>
  );
};

export default Navigator;
