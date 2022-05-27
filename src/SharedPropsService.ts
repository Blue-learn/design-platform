import { ScreenProps } from "./types";

let _globalProps: ScreenProps = { routeId: "", widgetRegistry: {} };

async function setGlobalProps(props: ScreenProps) {
  _globalProps = await props;
}

function getPropsValue(key?: string) {
  if (_globalProps && key) {
    return _globalProps[key];
  }
  return null;
}

export default {
  setGlobalProps,
  getPropsValue,
};
