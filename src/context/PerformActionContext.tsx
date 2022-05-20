import React from "react";

/** Type definition for a tap action
 * @param type action type it can either be a custom type or the one of the predefined action types
 * @param data data that is required to be passed for the tap action
 */
export type TapAction<DataType = any> = {
  type: string;
  data: DataType extends object ? { [k in keyof DataType]: DataType[k] } : any;
};

export type PerformActionFn = (
  tapAction: TapAction,
  boolUpdateDataStore?: boolean | undefined
) => Promise<any | { isError: boolean; err: Error }>;

export type PerformTapActionFn = () => PerformActionFn;

const PerformActionContext = React.createContext<PerformTapActionFn>(
  () => async () => undefined
);

export const withPerformActionContext = (
  WrappedComponent: any
): React.FC<any> => {
  return React.forwardRef<any, any>((props, ref) => (
    <PerformActionContext.Consumer>
      {(value: PerformTapActionFn) => (
        <WrappedComponent {...props} ref={ref} performTapAction={value} />
      )}
    </PerformActionContext.Consumer>
  ));
};

export default PerformActionContext;
