import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../../types";
import { useHistory, useLocation } from "react-router-dom";
import { apiService } from "../api/apiService";
import { tokenService } from "./tokenService";
import { IonToast } from "@ionic/react";

interface OnboardingData {
  description: string;
  topics: string[];
  trackingConsent: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    name: string
  ) => Promise<string | void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  checkOnboardingStatus: () => Promise<boolean>;
  getOnboardingData: () => Promise<OnboardingData | null>;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  setNeedsOnboarding: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);
  const history = useHistory();
  const location = useLocation();

  // Check if a user needs to complete onboarding
  const checkOnboardingStatus = async (): Promise<boolean> => {
    try {
      const response = await apiService.get("/onboarding/status");
      return !response.completed;
    } catch (error) {
      console.error("Failed to check onboarding status:", error);
      return false;
    }
  };

  // Get current onboarding data if any
  const getOnboardingData = async (): Promise<OnboardingData | null> => {
    try {
      const data = await apiService.get("/onboarding");
      return {
        description: data.description || "",
        topics: data.topics || [],
        trackingConsent: data.trackingConsent || false,
      };
    } catch (error) {
      console.error("Failed to get onboarding data:", error);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const tokens = await apiService.post(
        "/auth/login",
        { email, password },
        { requiresAuth: false }
      );
      tokenService.setTokens(tokens);
      await fetchUser();

      // Check if the user needs to complete onboarding
      const needsOnboarding = await checkOnboardingStatus();
      setNeedsOnboarding(needsOnboarding);

      if (needsOnboarding) {
        history.replace("/onboarding");
      } else {
        history.replace("/home");
      }
    } catch (error) {
      if (error instanceof Response) {
        if (error.status >= 500) {
          throw new Error(
            "Oops! Our server is taking a coffee break. ☕️ Please try again in a few moments!"
          );
        } else if (error.status === 404) {
          throw new Error(
            "Oops! That email or password doesn't seem right. Try again!"
          );
        } else if (error.status === 403) {
          throw new Error(
            "Your account is disabled. Please contact support for assistance."
          );
        }
      }
      throw new Error("Oops! We couldn't log you in.");
    }
  };

  const logout = async () => {
    try {
      // Just clear tokens and update state, no need to revoke token family
      await tokenService.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      setNeedsOnboarding(false);
      history.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      await tokenService.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      history.push("/login");
    }
  };

  const fetchUser = async (): Promise<User | null> => {
    try {
      const userData = await apiService.get("/profile");
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setIsAuthenticated(false);
      throw new Error("Failed to fetch user");
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<string | void> => {
    try {
      const response = await apiService.post(
        "/auth/signup",
        { email, password, name },
        {
          requiresAuth: false,
          expectedResponseType: "text", // Specify we expect a text response
        }
      );

      // After successful signup, we set the onboarding requirement
      setNeedsOnboarding(true);
      return response;
    } catch (error) {
      if (error instanceof Response) {
        if (error.status >= 500) {
          throw new Error(
            "Oops! Our server is taking a coffee break. ☕️ Please try again in a few moments!"
          );
        } else if (error.status === 409) {
          throw new Error(
            "This email is already registered. Try logging in instead!"
          );
        } else if (error.status === 400) {
          throw new Error(
            "Please check your email and password format and try again."
          );
        }
      }
      // If it's already an Error object, just rethrow it
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Something went wrong during signup. Please try again.");
    }
  };

  const completeOnboarding = async (data: OnboardingData): Promise<void> => {
    try {
      // Submit onboarding data to the backend
      await apiService.post("/onboarding", {
        description: data.description,
        topics: data.topics,
        trackingConsent: data.trackingConsent,
      });

      // Update local state to reflect onboarding completion
      setNeedsOnboarding(false);

      // Refresh user profile data
      await fetchUser();
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to save your preferences. Please try again.");
    }
  };

  useEffect(() => {
    const handleAuthStateChange = (event: Event) => {
      const customEvent = event as CustomEvent;

      if (customEvent.detail?.securityBreach) {
        setUser(null);
        setIsAuthenticated(false);
        setSecurityAlert(
          "Possible security breach detected. Please log in again for your safety."
        );
        history.push("/login");
      } else if (customEvent.detail?.refreshFailed) {
        setUser(null);
        setIsAuthenticated(false);
        history.push("/login");
      }
    };

    const handleTokenRefreshed = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.rotated) {
        console.debug("Token rotated successfully");
      }
    };

    const unsubscribeSecurityBreach = apiService.onSecurityBreach(() => {
      setUser(null);
      setIsAuthenticated(false);
      setSecurityAlert(
        "Possible security breach detected. Please log in again for your safety."
      );
      history.push("/login");
    });

    // Subscribe to onboarding required notifications
    const unsubscribeOnboardingRequired = apiService.onOnboardingRequired(
      () => {
        setNeedsOnboarding(true);
        if (location.pathname !== "/onboarding") {
          history.replace("/onboarding");
        }
      }
    );

    window.addEventListener("auth_state_changed", handleAuthStateChange);
    window.addEventListener("auth_token_refreshed", handleTokenRefreshed);

    return () => {
      window.removeEventListener("auth_state_changed", handleAuthStateChange);
      window.removeEventListener("auth_token_refreshed", handleTokenRefreshed);
      unsubscribeSecurityBreach();
      unsubscribeOnboardingRequired();
    };
  }, [history, location.pathname]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Timeout to let restore the session
        await new Promise((resolve) => setTimeout(resolve, 150));
        if (tokenService.isAuthenticated()) {
          try {
            await fetchUser();
            setIsAuthenticated(true);

            if (
              location.pathname === "/" ||
              location.pathname === "/login" ||
              location.pathname === "/home"
            ) {
              const onboardingNeeded = await checkOnboardingStatus();
              setNeedsOnboarding(onboardingNeeded);

              // Redirect to onboarding if needed
              if (onboardingNeeded) {
                history.replace("/onboarding");
              }
            }
          } catch (error) {
            // If we can't fetch the user, the token might be invalid
            console.error(
              "Error fetching user during auth initialization:",
              error
            );
            // Don't immediately log out - we'll try to refresh the token first
            try {
              const token = await tokenService.refreshAccessToken();
              if (token) {
                // If token refresh succeeded, try to fetch user again
                await fetchUser();
                setIsAuthenticated(true);
              } else {
                // If refresh failed, clear auth state
                await tokenService.clearTokens();
                setUser(null);
                setIsAuthenticated(false);
                setNeedsOnboarding(false);
              }
            } catch (refreshError) {
              console.error(
                "Token refresh failed during auth initialization:",
                refreshError
              );
              await tokenService.clearTokens();
              setUser(null);
              setIsAuthenticated(false);
              setNeedsOnboarding(false);
            }
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [history, location.pathname]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        isAuthenticated,
        signup,
        completeOnboarding,
        checkOnboardingStatus,
        getOnboardingData,
        needsOnboarding,
        setNeedsOnboarding,
      }}
    >
      {children}
      <IonToast
        isOpen={!!securityAlert}
        message={securityAlert || ""}
        duration={5000}
        position="top"
        color="danger"
        buttons={[
          {
            text: "OK",
            role: "cancel",
            handler: () => {
              setSecurityAlert(null);
            },
          },
        ]}
        onDidDismiss={() => setSecurityAlert(null)}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
