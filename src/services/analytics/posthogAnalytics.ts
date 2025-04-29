import { Posthog } from "@capawesome/capacitor-posthog";
import { storageService } from "../storage/storageService";

const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST;
const POSTHOG_API_KEY = import.meta.env.VITE_POSTHOG_API_KEY;
const TELEMETRY_ENABLED_KEY = "telemetry_enabled" as const;

export const isTelemetryEnabled = async (): Promise<boolean> => {
  const stored = await storageService.get<boolean>(TELEMETRY_ENABLED_KEY);
  return stored ?? true;
};

export const setTelemetryEnabled = async (enabled: boolean): Promise<void> => {
  await storageService.set(TELEMETRY_ENABLED_KEY, enabled);
  if (!enabled) {
    await posthogReset();
  }
};

export const initializePostHog = async () => {
  if (!(await isTelemetryEnabled())) return;
  try {
    Posthog.setup({
      host: POSTHOG_HOST,
      apiKey: POSTHOG_API_KEY,
    });
  } catch (error) {
    console.error("Failed to initialize PostHog:", error);
  }
};

export const posthogCaptureEvent = async (
  eventName: string,
  properties?: Record<string, any>
) => {
  if (!(await isTelemetryEnabled())) return;
  try {
    await Posthog.capture({ event: eventName, properties });
  } catch (error) {
    console.error("Failed to capture event:", error);
  }
};

export const posthogIdentify = async (
  distinctId: string,
  userProperties?: Record<string, any>
) => {
  if (!(await isTelemetryEnabled())) return;
  try {
    await Posthog.identify({ distinctId, userProperties });
  } catch (error) {
    console.error("Failed to identify user:", error);
  }
};

export const posthogAlias = async (alias: string) => {
  if (!(await isTelemetryEnabled())) return;
  try {
    await Posthog.alias({ alias });
  } catch (error) {
    console.error("Failed to alias user:", error);
  }
};

export const posthogPageviewCaptureEvent = async (
  other_properties: any = {}
) => {
  if (!(await isTelemetryEnabled())) return;
  try {
    console.log("posthogPageviewCaptureEvent", other_properties);
    await Posthog.capture({
      event: "$pageview",
      properties: {
        $current_url: window.location.href,
        $title: document.title,
        ...other_properties,
      },
    });
  } catch (error) {
    console.error("Failed to capture page event:", error);
  }
};

export const posthogPageleaveCaptureEvent = async () => {
  if (!(await isTelemetryEnabled())) return;
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

export const posthogReset = async () => {
  try {
    await Posthog.reset();
  } catch (error) {
    console.error("Failed to reset PostHog:", error);
  }
};
