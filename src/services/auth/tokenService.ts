import { Preferences } from "@capacitor/preferences";
import { AuthTokens, RefreshResponse } from "../../types";
import { AppConfig } from "../../app.config";
import { jwtDecode } from "jwt-decode";

// Interface for decoded JWT
interface DecodedToken {
  exp: number;
  [key: string]: any;
}

// Constants
const USED_TOKENS_KEY = "used_refresh_tokens";

class TokenService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshTokenTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Initialize from storage on service creation
    this.initFromStorage();

    // Listen for storage events in other tabs (for multi-tab support)
    window.addEventListener("storage", this.handleStorageChange);
  }

  /**
   * Initialize tokens from secure storage
   */
  private initFromStorage(): void {
    // Load auth tokens
    Preferences.get({ key: "auth_tokens" })
      .then(({ value }) => {
        if (value) {
          const storedData = JSON.parse(value);

          // Set the tokens from storage
          this.accessToken = storedData.access_token;
          this.refreshToken = storedData.refresh_token;

          // Try to refresh the access token immediately on init if needed
          if (this.refreshToken && !this.accessToken) {
            this.refreshAccessToken();
          } else if (this.accessToken) {
            // Schedule refresh if we have an access token
            this.scheduleTokenRefresh();
          }
        }
      })
      .catch((error) => {
        console.error("Failed to initialize tokens from storage:", error);
      });
  }

  /**
   * Handle storage changes from other tabs
   */
  private handleStorageChange = (event: StorageEvent) => {
    if (event.key === "auth_logout") {
      // Another tab logged out, sync this tab
      this.clearTokens();
      window.dispatchEvent(
        new CustomEvent("auth_state_changed", {
          detail: { isAuthenticated: false },
        })
      );
    }
  };

  /**
   * Set both tokens and schedule refresh
   */
  public setTokens(tokens: AuthTokens): void {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;

    // Store tokens securely
    this.storeTokens();

    // Schedule token refresh
    this.scheduleTokenRefresh();
  }

  /**
   * Store tokens in secure storage
   */
  private async storeTokens(): Promise<void> {
    try {
      await Preferences.set({
        key: "auth_tokens",
        value: JSON.stringify({
          access_token: this.accessToken,
          refresh_token: this.refreshToken,
        }),
      });
    } catch (error) {
      console.error("Failed to store tokens:", error);
    }
  }

  /**
   * Get the access token (for API calls)
   */
  public getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get the refresh token (primarily for testing purposes)
   */
  public getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Clear all tokens and cancel refresh
   */
  public async clearTokens(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;

    // Clear the refresh timeout
    if (this.refreshTokenTimeoutId) {
      clearTimeout(this.refreshTokenTimeoutId);
      this.refreshTokenTimeoutId = null;
    }

    // Remove from storage
    try {
      await Preferences.remove({ key: "auth_tokens" });
      // Broadcast logout to other tabs
      localStorage.setItem("auth_logout", Date.now().toString());
      localStorage.removeItem("auth_logout");
    } catch (error) {
      console.error("Failed to clear tokens from storage:", error);
    }
  }

  /**
   * Check if the user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Schedule access token refresh before it expires
   */
  private scheduleTokenRefresh(): void {
    if (!this.accessToken || !this.refreshToken) return;

    try {
      // Cancel any existing refresh timeout
      if (this.refreshTokenTimeoutId) {
        clearTimeout(this.refreshTokenTimeoutId);
      }

      // Decode token to get expiration
      const decoded = jwtDecode<DecodedToken>(this.accessToken);
      const expiresAt = decoded.exp * 1000; // Convert to milliseconds

      // Calculate time to refresh (75% of token lifetime)
      const currentTime = Date.now();
      const timeUntilExpiry = expiresAt - currentTime;

      // Refresh at 75% of token lifetime or immediately if less than 5 minutes left
      const refreshTime = Math.max(
        timeUntilExpiry * 0.75,
        Math.min(timeUntilExpiry - 300000, 0) // Refresh 5 minutes before expiry at the latest
      );

      if (refreshTime <= 0) {
        // Token already expired or about to expire, refresh immediately
        this.refreshAccessToken();
      } else {
        // Schedule refresh
        this.refreshTokenTimeoutId = setTimeout(
          () => this.refreshAccessToken(),
          refreshTime
        );
      }
    } catch (error) {
      console.error("Failed to schedule token refresh:", error);
      // If we can't decode the token, try refreshing immediately
      this.refreshAccessToken();
    }
  }

  /**
   * Refresh the access token using the refresh token
   */
  public async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshToken) return null;

    try {
      // Using Authorization header as per backend documentation
      const response = await fetch(`${AppConfig.BACKEND_HOST}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.refreshToken}`,
        },
      });

      // Handle different response statuses more gracefully
      if (response.status === 401 || response.status === 403) {
        // Invalid or expired refresh token - clear and require re-login
        this.clearTokens();
        window.dispatchEvent(
          new CustomEvent("auth_state_changed", {
            detail: { isAuthenticated: false, refreshFailed: true },
          })
        );
        return null;
      } else if (!response.ok) {
        // For other errors like 500s, don't clear tokens immediately
        // Just return null and let the caller handle retrying
        console.error(`Token refresh failed with status: ${response.status}`);
        return null;
      }

      const tokens = await response.json();

      // Set the new access token
      this.accessToken = tokens.access_token;

      // Store the updated tokens
      this.storeTokens();

      // Schedule token refresh
      this.scheduleTokenRefresh();

      // Notify app that tokens have been refreshed
      window.dispatchEvent(
        new CustomEvent("auth_token_refreshed", {
          detail: { refreshed: true },
        })
      );

      return tokens.access_token;
    } catch (error) {
      console.error("Token refresh failed:", error);

      // Don't immediately clear tokens on network errors
      // This prevents users from being logged out during temporary connectivity issues
      if (
        error instanceof TypeError &&
        error.message.includes("NetworkError")
      ) {
        return null;
      }

      // For other types of errors, clear tokens and notify app
      this.clearTokens();
      window.dispatchEvent(
        new CustomEvent("auth_state_changed", {
          detail: { isAuthenticated: false, refreshFailed: true },
        })
      );
      return null;
    }
  }
}

export const tokenService = new TokenService();
