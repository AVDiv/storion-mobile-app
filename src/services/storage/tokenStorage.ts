import { Preferences } from "@capacitor/preferences";

const TOKEN_KEY = "auth_tokens";

export const TokenStorage = {
  async saveTokens(tokens: { access_token: string; refresh_token: string }) {
    await Preferences.set({
      key: TOKEN_KEY,
      value: JSON.stringify(tokens),
    });
  },

  async getTokens() {
    const result = await Preferences.get({ key: TOKEN_KEY });
    return result.value ? JSON.parse(result.value) : null;
  },

  async removeTokens() {
    await Preferences.remove({ key: TOKEN_KEY });
  },
};
