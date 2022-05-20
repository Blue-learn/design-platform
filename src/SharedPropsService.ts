import { ScreenProps } from "./types";

let _globalProps: ScreenProps;

function setGlobalProps(props: ScreenProps) {
  _globalProps = props;
}

function getPropsValue(key: string) {
  if (_globalProps) {
    return _globalProps[key];
  }
  return null;
}

export default {
  setGlobalProps,
  getPropsValue,
};
