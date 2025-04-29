import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { useAuth } from "../../../services/auth/authContext";

// Custom loader component
const CustomLoader: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="custom-loader-container">
      <div className="loader-spinner">
        <svg className="spinner" viewBox="0 0 50 50">
          <circle
            className="path"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
          ></circle>
        </svg>
      </div>
      <p>{message}</p>
      <style>{`
        .custom-loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          width: 100%;
          position: fixed;
          top: 0;
          left: 0;
          background: rgba(var(--ion-background-color-rgb), 0.85);
          backdrop-filter: blur(6px);
          z-index: 999;
        }

        .loader-spinner {
          margin-bottom: 16px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          animation: rotate 2s linear infinite;
        }

        .path {
          stroke: var(--color-primary);
          stroke-linecap: round;
          animation: dash 1.5s ease-in-out infinite;
        }

        p {
          color: var(--ion-text-color);
          font-size: 16px;
          font-weight: 500;
        }

        @keyframes rotate {
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes dash {
          0% {
            stroke-dasharray: 1, 150;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -35;
          }
          100% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -124;
          }
        }
      `}</style>
    </div>
  );
};

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
          return <CustomLoader message="Please wait..." />;
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
