import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { IonLoading } from "@ionic/react";
import { useAuth } from "../../../services/auth/authContext";

interface OnboardingRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

/**
 * OnboardingRoute ensures users have completed onboarding before accessing protected routes
 * If onboarding is required, it redirects the user to the onboarding page
 */
const OnboardingRoute: React.FC<OnboardingRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { isAuthenticated, isLoading, needsOnboarding } = useAuth();

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

        // If needs onboarding, redirect to onboarding
        if (needsOnboarding) {
          return (
            <Redirect
              to={{
                pathname: "/onboarding",
                state: { from: props.location },
              }}
            />
          );
        }

        // User is authenticated and completed onboarding, render the component
        return <Component {...props} />;
      }}
    />
  );
};

export default OnboardingRoute;
