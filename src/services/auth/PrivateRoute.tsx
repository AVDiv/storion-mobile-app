import React from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import { IonLoading } from "@ionic/react";
import { useAuth } from "./authContext";

interface PrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (isLoading) {
          return <IonLoading isOpen={true} message={"Please wait..."} />;
        }

        return isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location },
            }}
          />
        );
      }}
    />
  );
};
