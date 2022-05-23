import { ScreenProps } from "./types";

let _globalProps: ScreenProps;

async function setGlobalProps(props: ScreenProps, callback?: Function) {
  _globalProps = await props;
  if (callback) await callback();
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
