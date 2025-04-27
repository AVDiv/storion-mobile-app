import { Preferences } from "@capacitor/preferences";
import { AuthTokens, RefreshResponse } from "../../types";
import { AppConfig } from "../../app.config";
import { StorageKey } from "../storage/config";
import { jwtDecode } from "jwt-decode";

// Interface for decoded JWT
interface DecodedToken {
  exp: number;
  sub: string;
  jti?: string; // JWT ID
  [key: string]: any;
}

// Constants
const TOKEN_FAMILY_KEY = "token_family";
const USED_TOKENS_KEY = "used_refresh_tokens";
const MAX_USED_TOKENS_HISTORY = 10; // Keep track of last 10 used tokens

class TokenService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenFamily: string | null = null;
  private refreshTokenId: string | null = null;
  private refreshTokenTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private usedRefreshTokens: Set<string> = new Set(); // Track used refresh tokens to prevent replay attacks

  constructor() {
    // Initialize from storage on service creation
    this.initFromStorage();

    // Listen for storage events in other tabs (for multi-tab support)
    window.addEventListener("storage", this.handleStorageChange);
  }

  /**
   * Initialize tokens from secure storage
   */
  private async initFromStorage(): Promise<void> {
    try {
      // Load auth tokens
      const { value } = await Preferences.get({ key: "auth_tokens" });
      if (value) {
        const tokens: AuthTokens = JSON.parse(value);

        // Get token family if it exists
        const { value: familyValue } = await Preferences.get({
          key: TOKEN_FAMILY_KEY,
        });
        if (familyValue) {
          this.tokenFamily = JSON.parse(familyValue);
        }

        // Load used refresh tokens history
        const { value: usedTokensValue } = await Preferences.get({
          key: USED_TOKENS_KEY,
        });
        if (usedTokensValue) {
          const usedTokens = JSON.parse(usedTokensValue) as string[];
          this.usedRefreshTokens = new Set(usedTokens);
        }

        this.setTokens(tokens);
      }
    } catch (error) {
      console.error("Failed to initialize tokens from storage:", error);
    }
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
    } else if (event.key === USED_TOKENS_KEY && event.newValue) {
      // Update used tokens from another tab
      try {
        const usedTokens = JSON.parse(event.newValue);
        this.usedRefreshTokens = new Set(usedTokens);
      } catch (error) {
        console.error("Failed to parse used tokens from storage event:", error);
      }
    }
  };

  /**
   * Set both tokens and schedule refresh
   */
  public setTokens(tokens: AuthTokens): void {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;

    // Update token family if provided
    if (tokens.token_family) {
      this.tokenFamily = tokens.token_family;
      this.storeTokenFamily(tokens.token_family);
    }

    // Extract and store refresh token ID if available
    if (tokens.refresh_token_id) {
      this.refreshTokenId = tokens.refresh_token_id;
    } else {
      try {
        // Try to decode the refresh token to get its ID (if JWT format)
        const decoded = jwtDecode<DecodedToken>(tokens.refresh_token);
        if (decoded.jti) {
          this.refreshTokenId = decoded.jti;
        }
      } catch (error) {
        // Not a decodable JWT, that's okay
        this.refreshTokenId = null;
      }
    }

    // Store tokens securely
    this.storeRefreshToken(tokens);

    // Schedule token refresh
    this.scheduleTokenRefresh();
  }

  /**
   * Store refresh token and related data in secure storage
   */
  private async storeRefreshToken(tokens: AuthTokens): Promise<void> {
    try {
      await Preferences.set({
        key: "auth_tokens",
        value: JSON.stringify({
          refresh_token: tokens.refresh_token,
          refresh_token_id: this.refreshTokenId,
          refresh_token_expiry: tokens.refresh_token_expiry,
        }),
      });
    } catch (error) {
      console.error("Failed to store refresh token:", error);
    }
  }

  /**
   * Store token family identifier
   */
  private async storeTokenFamily(family: string): Promise<void> {
    try {
      await Preferences.set({
        key: TOKEN_FAMILY_KEY,
        value: JSON.stringify(family),
      });
    } catch (error) {
      console.error("Failed to store token family:", error);
    }
  }

  /**
   * Add a used refresh token to the blacklist to prevent replay attacks
   */
  private async addToUsedTokens(tokenId: string): Promise<void> {
    if (!tokenId) return;

    try {
      this.usedRefreshTokens.add(tokenId);

      // Keep the history to a manageable size
      const usedTokensArray = Array.from(this.usedRefreshTokens);
      if (usedTokensArray.length > MAX_USED_TOKENS_HISTORY) {
        // Remove oldest tokens if we exceed the limit
        const tokensToKeep = usedTokensArray.slice(-MAX_USED_TOKENS_HISTORY);
        this.usedRefreshTokens = new Set(tokensToKeep);
      }

      // Store in preferences
      await Preferences.set({
        key: USED_TOKENS_KEY,
        value: JSON.stringify(Array.from(this.usedRefreshTokens)),
      });

      // Also update localStorage to notify other tabs
      localStorage.setItem(
        USED_TOKENS_KEY,
        JSON.stringify(Array.from(this.usedRefreshTokens))
      );
    } catch (error) {
      console.error("Failed to update used tokens list:", error);
    }
  }

  /**
   * Check if a refresh token has been used before
   */
  private hasTokenBeenUsed(tokenId: string): boolean {
    if (!tokenId) return false;
    return this.usedRefreshTokens.has(tokenId);
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
   * Get the token family identifier
   */
  public getTokenFamily(): string | null {
    return this.tokenFamily;
  }

  /**
   * Clear all tokens and cancel refresh
   */
  public async clearTokens(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenFamily = null;

    // Clear the refresh timeout
    if (this.refreshTokenTimeoutId) {
      clearTimeout(this.refreshTokenTimeoutId);
      this.refreshTokenTimeoutId = null;
    }

    // Remove from storage
    try {
      await Preferences.remove({ key: "auth_tokens" });
      await Preferences.remove({ key: TOKEN_FAMILY_KEY });
      // We intentionally don't clear the used tokens list to maintain security

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
   * Implements refresh token rotation - each refresh token can only be used once
   */
  public async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshToken) return null;

    // Store the current refresh token ID before we get a new one
    const currentRefreshTokenId = this.refreshTokenId;

    // If this token has been used before, it might be a replay attack
    if (currentRefreshTokenId && this.hasTokenBeenUsed(currentRefreshTokenId)) {
      console.error("Possible refresh token reuse detected!");
      // Invalidate all tokens and force re-authentication
      this.clearTokens();
      window.dispatchEvent(
        new CustomEvent("auth_state_changed", {
          detail: { isAuthenticated: false, securityBreach: true },
        })
      );
      return null;
    }

    try {
      const response = await fetch(`${AppConfig.BACKEND_HOST}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken,
          tokenFamily: this.tokenFamily,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      // Add the current token to the used tokens list
      if (currentRefreshTokenId) {
        await this.addToUsedTokens(currentRefreshTokenId);
      }

      const tokens: RefreshResponse = await response.json();

      // Set the new tokens (which will include the new refresh token)
      this.setTokens(tokens);

      // Notify app that tokens have been refreshed
      window.dispatchEvent(
        new CustomEvent("auth_token_refreshed", {
          detail: { rotated: true },
        })
      );

      return tokens.access_token;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // If refresh fails, clear tokens and notify app
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
