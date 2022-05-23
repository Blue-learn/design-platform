import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import SharedPropsService from "../SharedPropsService";
import ItemRenderer from "../render/ItemRenderer";
import { ScreenProps } from "../types";

const Navigator = (props: ScreenProps) => {
  const [state, setState] = useState(false);

  useEffect(() => {
    SharedPropsService.setGlobalProps(props, () => {
      setState(true);
    });
  }, [props]);

  if (!state)
    return (
      <>
        <Text>Please wait ...</Text>
      </>
    );

  return (
    <View style={{ flex: 1 }}>
      <Text>Hello... from Platform</Text>
      <ItemRenderer
        item={{
          id: "__id__",
          type: "BUTTON",
          props: { label: "Hello World" },
        }}
      />
    </View>
  );
};

export default Navigator;
