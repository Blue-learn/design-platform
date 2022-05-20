import React from 'react';
export interface ProviderProps {
    children: React.ReactNode;
    value?: any;
}
interface Actions {
    [key: string]: any;
}
declare const _default: (reducer: any, actions: Actions, initialState: any) => {
    Context: React.Context<any>;
    Provider: React.FC<{}>;
};
export default _default;
