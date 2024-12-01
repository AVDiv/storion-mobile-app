import { Posthog } from "@capawesome/capacitor-posthog";

const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST;
const POSTHOG_API_KEY = import.meta.env.VITE_POSTHOG_API_KEY;

export const initializePostHog = async () => {
  try {
    Posthog.setup({
      host: POSTHOG_HOST,
      apiKey: POSTHOG_API_KEY,
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
    await Posthog.capture({ event: eventName, properties });
  } catch (error) {
    console.error("Failed to capture event:", error);
  }
};

export const identify = async (
  distinctId: string,
  userProperties?: Record<string, any>
) => {
  try {
    await Posthog.identify({ distinctId, userProperties });
  } catch (error) {
    console.error("Failed to identify user:", error);
  }
};

export const pageviewCaptureEvent = async () => {
  try {
    await Posthog.capture({
      event: "$pageview",
      properties: {
        $current_url: window.location.href,
        $title: document.title,
      },
    });
  } catch (error) {
    console.error("Failed to capture page event:", error);
  }
};

export const pageleaveCaptureEvent = async () => {
  try {
    await Posthog.capture({
      event: "$pageleave",
      properties: {
        $current_url: window.location.href,
        $title: document.title,
      },
    });
  } catch (error) {
    console.error("Failed to capture page event:", error);
  }
};

export const reset = async () => {
  try {
    await Posthog.reset();
  } catch (error) {
    console.error("Failed to reset PostHog:", error);
  }
};
