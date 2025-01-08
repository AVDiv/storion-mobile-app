import React, { createContext, useContext, useEffect, useState } from "react";
import { storageService } from "../storage/storageService";
import { AuthTokens, User } from "../../types";
import { AppConfig } from "../../app.config";
import { useHistory } from "react-router-dom";
import { StorageKey } from "../storage/config";

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
  const history = useHistory();

  const refreshAccessToken = async (
    refreshToken: string
  ): Promise<AuthTokens> => {
    const response = await fetch(`${AppConfig.BACKEND_HOST}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh session");
    }

    return response.json();
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${AppConfig.BACKEND_HOST}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      if (response.status >= 500)
        throw new Error(
          "Oops! Our server is taking a coffee break. ☕️ Please try again in a few moments!"
        );
      else if (response.status === 404)
        throw new Error(
          "Oops! That email or password doesn’t seem right. Try again!"
        );
      else if (response.status === 403)
        throw new Error(
          "Your account is disabled. Please contact support for assistance."
        );
      else throw new Error("Oops! We couldn’t log you in.");
    }

    const tokens: AuthTokens = await response.json();
    await storageService.set("auth_tokens" as StorageKey, tokens);
    await fetchUser(tokens.access_token);
  };

  const logout = async () => {
    await storageService.remove("auth_tokens" as StorageKey);
    setUser(null);
    history.push("/login");
  };

  const fetchUser = async (access_token: string) => {
    const response = await fetch(`${AppConfig.BACKEND_HOST}/profile`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    const userData = await response.json();
    setUser(userData);
  };

  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<string | void> => {
    const response = await fetch(`${AppConfig.BACKEND_HOST}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      if (response.status >= 500) {
        throw new Error(
          "Oops! Our server is taking a coffee break. ☕️ Please try again in a few moments!"
        );
      } else if (response.status === 409) {
        throw new Error(
          "This email is already registered. Try logging in instead!"
        );
      } else if (response.status === 400) {
        throw new Error(
          "Please check your email and password format and try again."
        );
      } else {
        throw new Error(
          "Something went wrong during signup. Please try again."
        );
      }
    }

    return response.text();
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const tokens = await storageService.get<AuthTokens>(
          "auth_tokens" as StorageKey
        );
        if (tokens) {
          try {
            await fetchUser(tokens.access_token);
          } catch (error) {
            try {
              const newTokens = await refreshAccessToken(tokens.refresh_token);
              await storageService.set("auth_tokens" as StorageKey, newTokens);
              await fetchUser(newTokens.access_token);
            } catch (refreshError) {
              await logout();
            }
          }
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
