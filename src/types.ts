import { DesignComponentConfig } from "./context";

export type ScreenProps = {
  route?: string; // screen or view to open
  routeId: string;
  initData?: any;
  componentConfig?: DesignComponentConfig;
};
