export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  refresh_token_id?: string; // Unique identifier for the refresh token
  refresh_token_expiry?: number; // Optional expiry timestamp for the refresh token
  token_family?: string; // Used for tracking related refresh tokens to prevent reuse attacks
}

// Refresh response from server
export interface RefreshResponse extends AuthTokens {
  previous_token_revoked?: boolean; // Flag to indicate if previous token was successfully revoked
}
