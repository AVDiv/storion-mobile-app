import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "storion.app",
  appName: "storion-app",
  webDir: "dist",
  android: {
    allowMixedContent: true, // For Testing purposes only
  },
};

export default config;
