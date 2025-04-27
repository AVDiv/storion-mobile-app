export const DEFAULT_STORAGE_VALUES = {
  telemetry_enabled: true,
  auth_tokens: null,
} as const;

export type StorageKey = keyof typeof DEFAULT_STORAGE_VALUES;
