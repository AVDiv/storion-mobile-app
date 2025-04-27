import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../../types";
import { useHistory } from "react-router-dom";
import { apiService } from "../api/apiService";
import { tokenService } from "./tokenService";
import { IonToast } from "@ionic/react";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    name: string
  ) => Promise<string | void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);
  const history = useHistory();

  const login = async (email: string, password: string) => {
    try {
      const tokens = await apiService.post(
        "/auth/login",
        { email, password },
        { requiresAuth: false }
      );
      tokenService.setTokens(tokens);
      await fetchUser();
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
      const tokenFamily = tokenService.getTokenFamily();

      if (tokenFamily) {
        try {
          await apiService.post("/auth/revoke", { tokenFamily });
        } catch (error) {
          console.warn("Failed to revoke tokens on server:", error);
        }
      }

      await tokenService.clearTokens();
      setUser(null);
      history.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      await tokenService.clearTokens();
      setUser(null);
      history.push("/login");
    }
  };

  const fetchUser = async () => {
    try {
      const userData = await apiService.get("/profile");
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      throw new Error("Failed to fetch user");
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<string | void> => {
    try {
      return await apiService.post(
        "/auth/signup",
        { email, password, name },
        { requiresAuth: false }
      );
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
      throw new Error("Something went wrong during signup. Please try again.");
    }
  };

  useEffect(() => {
    const handleAuthStateChange = (event: Event) => {
      const customEvent = event as CustomEvent;

      if (customEvent.detail?.securityBreach) {
        setUser(null);
        setSecurityAlert(
          "Possible security breach detected. Please log in again for your safety."
        );
        history.push("/login");
      } else if (customEvent.detail?.refreshFailed) {
        setUser(null);
        history.push("/login");
      }
    };

    const handleTokenRefreshed = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.rotated) {
        console.log("Token rotated successfully");
      }
    };

    const unsubscribeSecurityBreach = apiService.onSecurityBreach(() => {
      setUser(null);
      setSecurityAlert(
        "Possible security breach detected. Please log in again for your safety."
      );
      history.push("/login");
    });

    window.addEventListener("auth_state_changed", handleAuthStateChange);
    window.addEventListener("auth_token_refreshed", handleTokenRefreshed);

    return () => {
      window.removeEventListener("auth_state_changed", handleAuthStateChange);
      window.removeEventListener("auth_token_refreshed", handleTokenRefreshed);
      unsubscribeSecurityBreach();
    };
  }, [history]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (tokenService.isAuthenticated()) {
          await fetchUser();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        isAuthenticated: !!user,
        signup,
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
