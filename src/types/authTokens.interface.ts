export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

// Refresh response from server
export interface RefreshResponse {
  access_token: string;
}
