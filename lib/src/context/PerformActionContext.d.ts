import React from "react";
/** Type defination for a tap action
 * @param type action type it can either be a custom type or the one of the predefined action types
 * @param data data that is required to be passed for the tap action
 */
export declare type TapAction<DataType = any> = {
    type: string;
    data: DataType extends object ? {
        [k in keyof DataType]: DataType[k];
    } : any;
};
export declare type PerformActionFn = (tapAction: TapAction, boolUpdateDataStore?: boolean | undefined) => Promise<any | {
    isError: boolean;
    err: Error;
}>;
export declare type PerformTapActionFn = () => PerformActionFn;
declare const PerformActionContext: React.Context<PerformTapActionFn>;
export declare const withPerformActionContext: (WrappedComponent: any) => React.FC<any>;
export default PerformActionContext;
