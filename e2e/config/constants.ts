export const E2E_TIMEOUTS = {
  network: 10_000,
  auth: 10_000,
  api: 30_000,
  ui: 15_000,
  chatReady: 20_000,
} as const;

export const REMOTE_E2E_DEFAULTS = {
  baseUrl: process.env.TITANE_REMOTE_E2E_URL ?? 'http://localhost:7420',
  secret: process.env.TITANE_REMOTE_E2E_SECRET ?? 'change-me-in-production',
} as const;
