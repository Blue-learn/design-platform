/// <reference types="react" />
declare type ScreenProps = {};
declare type StandardEnum = {
    [id: number]: string;
};
export declare type WidgetItem = {
    id: string;
    widgetType: StandardEnum;
    props: any;
};
export declare type WidgetRegistry = {
    [key: string]: {
        Component?: React.ComponentType<any>;
    };
};
export declare type DcConfig = {
    widgetRegistry: WidgetRegistry;
};
export declare type GlobalState = {
    config: DcConfig | null;
    screenProps: ScreenProps | null;
};
export declare const Context: import("react").Context<any>, Provider: import("react").FC<{}>;
export {};
