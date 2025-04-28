import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { IonLoading } from "@ionic/react";
import { useAuth } from "../../../services/auth/authContext";

interface OnboardingRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

/**
 * OnboardingRoute ensures users have completed onboarding before accessing protected routes
 * Now relies on API 403 responses to detect onboarding requirements
 */
const OnboardingRoute: React.FC<OnboardingRouteProps> = ({
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

        // If not authenticated, redirect to login
        if (!isAuthenticated) {
          return (
            <Redirect
              to={{
                pathname: "/login",
                state: { from: props.location },
              }}
            />
          );
        }
        return <Component {...props} />;
      }}
    />
  );
};

export default OnboardingRoute;
