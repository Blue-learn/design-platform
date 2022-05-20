import React from "react";
import { Context as GlobalContext } from "./index";

const withGlobalContext = (WrappedComponent: any): React.FC<any> => {
  return (props: any) => (
    <GlobalContext.Consumer>
      {(value: any) => <WrappedComponent {...props} {...value} />}
    </GlobalContext.Consumer>
  );
};

export default withGlobalContext;
