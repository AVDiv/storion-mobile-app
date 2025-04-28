import { AppConfig } from "../../app.config";
import { tokenService } from "../auth/tokenService";

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
  skipRefresh?: boolean;
  expectedResponseType?: "json" | "text"; // Add option to specify expected response type
}

/**
 * API service with authentication and refresh handling
 */
class ApiService {
  private isRefreshing = false;
  private refreshQueue: Array<() => void> = [];
  private tokenSecurityListeners: Set<() => void> = new Set();
  private onboardingRequiredListeners: Set<() => void> = new Set();

  constructor() {
    // Listen for token security events
    window.addEventListener("auth_state_changed", this.handleAuthStateChanged);
  }

  /**
   * Handle auth state changes, particularly security breaches
   */
  private handleAuthStateChanged = (event: Event) => {
    const customEvent = event as CustomEvent;
    // If there was a security breach (token reuse detected), notify listeners
    if (customEvent.detail?.securityBreach) {
      this.notifySecurityBreach();
    }
  };

  /**
   * Register a listener for token security events
   */
  public onSecurityBreach(callback: () => void): () => void {
    this.tokenSecurityListeners.add(callback);
    // Return unsubscribe function
    return () => this.tokenSecurityListeners.delete(callback);
  }

  /**
   * Register a listener for onboarding required events
   */
  public onOnboardingRequired(callback: () => void): () => void {
    this.onboardingRequiredListeners.add(callback);
    // Return unsubscribe function
    return () => this.onboardingRequiredListeners.delete(callback);
  }

  /**
   * Notify all listeners of a security breach
   */
  private notifySecurityBreach(): void {
    this.tokenSecurityListeners.forEach((callback) => callback());
  }

  /**
   * Notify all listeners that onboarding is required
   */
  private notifyOnboardingRequired(): void {
    this.onboardingRequiredListeners.forEach((callback) => callback());
  }

  /**
   * Execute API request with authentication and refresh handling
   */
  public async fetch<T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> {
    const {
      requiresAuth = true,
      skipRefresh = false,
      expectedResponseType = "json", // Default to JSON responses
      ...fetchOptions
    } = options;

    // Build the request options
    const requestOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    };

    // Add authentication token if required
    if (requiresAuth) {
      let token = tokenService.getAccessToken();

      // If no token but auth is required, try to refresh
      if (!token && !skipRefresh) {
        token = await this.refreshToken();
      }

      if (token) {
        requestOptions.headers = {
          ...requestOptions.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(
        `${AppConfig.BACKEND_HOST}${endpoint}`,
        requestOptions
      );

      // Handle 401 Unauthorized - Token expired
      if (response.status === 401 && requiresAuth && !skipRefresh) {
        // Try to refresh the token and retry the request
        const newToken = await this.refreshToken();

        if (newToken) {
          // Retry the original request with the new token
          return this.fetch<T>(endpoint, {
            ...options,
            skipRefresh: true, // Prevent infinite refresh loops
            headers: {
              ...fetchOptions.headers,
              Authorization: `Bearer ${newToken}`,
            },
          });
        } else {
          throw new Error("Authentication failed");
        }
      }

      // Handle 403 Forbidden - Check for onboarding required message
      if (response.status === 403) {
        try {
          // Try to parse error message to check if it's related to onboarding
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.clone().json();
            if (
              errorData &&
              (errorData.message?.includes("Onboarding must be completed") ||
                errorData.error?.includes("Onboarding must be completed"))
            ) {
              // Notify listeners that onboarding is required
              this.notifyOnboardingRequired();
              throw new Error("Onboarding must be completed first");
            }
          } else {
            const errorText = await response.clone().text();
            if (errorText?.includes("Onboarding must be completed")) {
              // Notify listeners that onboarding is required
              this.notifyOnboardingRequired();
              throw new Error("Onboarding must be completed first");
            }
          }
        } catch (parseError) {
          if (
            parseError instanceof Error &&
            parseError.message === "Onboarding must be completed first"
          ) {
            throw parseError;
          }
          console.warn("Failed to parse 403 response", parseError);
        }
      }

      // Handle other error responses
      if (!response.ok) {
        console.error(`API request failed: ${endpoint}`, response);

        // Try to extract error message from response based on content type
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.clone().json();
            if (errorData && errorData.message) {
              throw new Error(errorData.message);
            } else if (errorData && errorData.error) {
              throw new Error(errorData.error);
            }
          } catch (parseError) {
            console.warn("Failed to parse error response as JSON", parseError);
          }
        } else {
          try {
            const errorText = await response.clone().text();
            if (errorText) {
              throw new Error(errorText);
            }
          } catch (textError) {
            console.warn("Failed to parse error response as text", textError);
          }
        }

        throw response;
      }

      if (response.status === 204 || fetchOptions.method === "DELETE") {
        return {} as T;
      }

      const contentType = response.headers.get("content-type");

      if (
        expectedResponseType === "text" ||
        (contentType && !contentType.includes("application/json"))
      ) {
        const text = await response.text();
        return text as unknown as T;
      } else {
        return (await response.json()) as T;
      }
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Refresh the authentication token
   * Uses the token rotation mechanism for enhanced security
   */
  private async refreshToken(): Promise<string | null> {
    // If already refreshing, wait for that to complete to avoid multiple simultaneous refreshes
    if (this.isRefreshing) {
      return new Promise<string | null>((resolve) => {
        this.refreshQueue.push(() => {
          resolve(tokenService.getAccessToken());
        });
      });
    }

    this.isRefreshing = true;

    try {
      // This will automatically handle token rotation
      const token = await tokenService.refreshAccessToken();

      // Execute queued callbacks with new token
      this.refreshQueue.forEach((callback) => callback());
      this.refreshQueue = [];

      return token;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Convenience methods for common HTTP verbs
  public get<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    return this.fetch<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T = any>(
    endpoint: string,
    data: any,
    options: ApiOptions = {}
  ): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public put<T = any>(
    endpoint: string,
    data: any,
    options: ApiOptions = {}
  ): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  public delete<T = any>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }
}

export const apiService = new ApiService();
