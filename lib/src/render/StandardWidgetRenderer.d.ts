import React from "react";
import { View } from "react-native";
import { TemplateItem } from "./ItemRenderer";
import { PerformActionFn } from "../context/PerformActionContext";
declare type TemplateProps = {
    item: TemplateItem;
    renderItem?: any;
    showModalSheet(routeKey: string, params: any): any;
    performAction: PerformActionFn;
    updateDataStore(store: {}): void;
    widgetRef?: React.RefObject<View>;
    isVisible?: boolean;
};
declare class StandardWidgetRenderer extends React.PureComponent<TemplateProps> {
    static config: null;
    private widgetRef;
    constructor(props: TemplateProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    static getDerivedStateFromProps(props: TemplateProps, state: {}): null;
    renderItem: (item: TemplateProps, extraProps?: any) => JSX.Element;
    render(): JSX.Element;
}
export default StandardWidgetRenderer;
