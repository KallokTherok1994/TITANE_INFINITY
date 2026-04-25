/**
 * TITANE∞ — Remote Gateway E2E Test
 * Tests the remote access flow from browser to axum gateway.
 *
 * Prerequisites:
 *   - TITANE running with TITANE_REMOTE_ENABLED=1 on port 7420
 *   - Access via http://localhost:7420 (not Tauri WebView)
 *
 * Run: pnpm exec playwright test e2e/remote-gateway.spec.ts
 */

import { test, expect } from '@playwright/test';

const REMOTE_BASE_URL = process.env.TITANE_REMOTE_E2E_URL ?? 'http://localhost:7420';
const REMOTE_SECRET = process.env.TITANE_REMOTE_E2E_SECRET ?? 'change-me-in-production';

// ── Health endpoint (no auth required) ───────────────────────

test('GET /api/health returns ok:true without auth', async ({ request }) => {
  const resp = await request.get(`${REMOTE_BASE_URL}/api/health`);
  expect(resp.ok()).toBe(true);
  const data = await resp.json();
  expect(data.ok).toBe(true);
  expect(data.content.service).toBe('titane_remote_gateway');
});

test('GET /api/system/health returns ok:true without auth', async ({ request }) => {
  const resp = await request.get(`${REMOTE_BASE_URL}/api/system/health`);
  expect(resp.ok()).toBe(true);
  const data = await resp.json();
  expect(data.ok).toBe(true);
});

// ── Authentication flow ──────────────────────────────────────

test('POST /api/auth/token returns tokens on valid secret', async ({ request }) => {
  const resp = await request.post(`${REMOTE_BASE_URL}/api/auth/token`, {
    data: { secret: REMOTE_SECRET },
  });
  expect(resp.ok()).toBe(true);
  const data = await resp.json();
  expect(data.ok).toBe(true);
  expect(typeof data.access_token).toBe('string');
  expect(typeof data.refresh_token).toBe('string');
});

test('POST /api/auth/token returns 401 on invalid secret', async ({ request }) => {
  const resp = await request.post(`${REMOTE_BASE_URL}/api/auth/token`, {
    data: { secret: 'definitely-wrong-secret-xyz' },
  });
  expect(resp.status()).toBe(401);
  const data = await resp.json();
  expect(data.ok).toBe(false);
});

// ── Protected endpoints ───────────────────────────────────────

test('GET /api/config/runtime returns 401 without token', async ({ request }) => {
  const resp = await request.get(`${REMOTE_BASE_URL}/api/config/runtime`);
  expect(resp.status()).toBe(401);
});

test('GET /api/config/runtime returns config with valid token', async ({ request }) => {
  // Get token first
  const authResp = await request.post(`${REMOTE_BASE_URL}/api/auth/token`, {
    data: { secret: REMOTE_SECRET },
  });
  const { access_token } = await authResp.json();

  const resp = await request.get(`${REMOTE_BASE_URL}/api/config/runtime`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  expect(resp.ok()).toBe(true);
  const data = await resp.json();
  expect(data.ok).toBe(true);
  expect(data.content).toHaveProperty('remote', true);
});

// ── Invoke endpoint ──────────────────────────────────────────

test('POST /api/invoke health_check returns ok', async ({ request }) => {
  const authResp = await request.post(`${REMOTE_BASE_URL}/api/auth/token`, {
    data: { secret: REMOTE_SECRET },
  });
  const { access_token } = await authResp.json();

  const resp = await request.post(`${REMOTE_BASE_URL}/api/invoke`, {
    data: { command: 'health_check' },
    headers: { Authorization: `Bearer ${access_token}` },
  });
  expect(resp.ok()).toBe(true);
  const data = await resp.json();
  expect(data.ok).toBe(true);
});

test('POST /api/invoke blocked command returns error', async ({ request }) => {
  const authResp = await request.post(`${REMOTE_BASE_URL}/api/auth/token`, {
    data: { secret: REMOTE_SECRET },
  });
  const { access_token } = await authResp.json();

  const resp = await request.post(`${REMOTE_BASE_URL}/api/invoke`, {
    data: { command: 'execute_shell_command', payload: { cmd: 'rm -rf /' } },
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const data = await resp.json();
  // Must be blocked — ok: false
  expect(data.ok).toBe(false);
});

// ── Refresh token ────────────────────────────────────────────

test('POST /api/auth/refresh returns new access token', async ({ request }) => {
  const authResp = await request.post(`${REMOTE_BASE_URL}/api/auth/token`, {
    data: { secret: REMOTE_SECRET },
  });
  const { refresh_token } = await authResp.json();

  const refreshResp = await request.post(`${REMOTE_BASE_URL}/api/auth/refresh`, {
    data: { refresh_token },
  });
  expect(refreshResp.ok()).toBe(true);
  const data = await refreshResp.json();
  expect(data.ok).toBe(true);
  expect(typeof data.access_token).toBe('string');
});
