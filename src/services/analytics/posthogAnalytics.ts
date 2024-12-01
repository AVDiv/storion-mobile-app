import { Posthog } from "@capawesome/capacitor-posthog";
import posthog from "posthog-js";

const POSTHOG_API_KEY = "YOUR_POSTHOG_API_KEY"; // Replace with your API key
const POSTHOG_HOST = "YOUR_POSTHOG_HOST"; // e.g. 'https://app.posthog.com' or your self-hosted URL

export const initializePostHog = async () => {
  try {
    // Initialize web version for development
    if (window.location.hostname === "localhost") {
      posthog.init(POSTHOG_API_KEY, {
        api_host: POSTHOG_HOST,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === "development") {
            posthog.debug();
          }
        },
      });
      return;
    }

    // Initialize native version for mobile
    await Posthog.setup({
      apiKey: POSTHOG_API_KEY,
      host: POSTHOG_HOST,
    });
  } catch (error) {
    console.error("Failed to initialize PostHog:", error);
  }
};

export const captureEvent = async (
  eventName: string,
  properties?: Record<string, any>
) => {
  try {
    if (window.location.hostname === "localhost") {
      posthog.capture(eventName, properties);
      return;
    }
    await Posthog.capture({ event: eventName, properties });
  } catch (error) {
    console.error("Failed to capture event:", error);
  }
};

export const identify = async (
  distinctId: string,
  properties?: Record<string, any>
) => {
  try {
    if (window.location.hostname === "localhost") {
      posthog.identify(distinctId, properties);
      return;
    }
    await Posthog.identify({ distinctId, properties });
  } catch (error) {
    console.error("Failed to identify user:", error);
  }
};

export const reset = async () => {
  try {
    if (window.location.hostname === "localhost") {
      posthog.reset();
      return;
    }
    await Posthog.reset();
  } catch (error) {
    console.error("Failed to reset PostHog:", error);
  }
};
