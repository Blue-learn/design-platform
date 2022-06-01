import React, { createContext, useReducer } from "react";

export interface ProviderProps {
  children: React.ReactNode;
  value?: any;
}

interface Actions {
  [key: string]: any;
}

export default (reducer: any, actions: Actions, initialState: any) => {
  const Context = createContext(initialState);

  const Provider: React.FC = ({ children, value = {} }: ProviderProps) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const boundActions = {};
    for (const key in actions) {
      boundActions[key] = actions[key](dispatch);
    }

    const mergedState = {
      ...(state as any),
      ...value,
    };
    return (
      <Context.Provider value={{ state: mergedState, ...boundActions }}>
        {children}
      </Context.Provider>
    );
  };

  return { Context, Provider };
};
