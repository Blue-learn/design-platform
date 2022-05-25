import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import SharedPropsService from "../SharedPropsService";
import { ScreenProps } from "../types";
import ListView from "../component/ListView";

const Navigator = (props: ScreenProps) => {
  const [isLoading, toggleLoad] = useState(true);

  useEffect(() => {
    toggleLoad(true);
    SharedPropsService.setGlobalProps(props, () => {
      toggleLoad(false);
    });
  }, [props]);

  if (isLoading)
    return (
      <ActivityIndicator style={{ margin: 10 }} size="large" color={"black"} />
    );

  return (
    <View style={{ flex: 1 }}>
      <ListView />
    </View>
  );
};

export default Navigator;
