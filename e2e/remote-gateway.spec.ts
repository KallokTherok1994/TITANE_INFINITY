/**
 * TITANE∞ — Remote Gateway E2E Test
 * Tests the remote access flow from browser to axum gateway.
 *
 * Prerequisites:
 *   - TITANE running with TITANE_REMOTE_ENABLED=1 on port 7420
 *   - Access via http://localhost:7420 (not Tauri WebView)
 *
 * Run: pnpm exec playwright test e2e/remote-gateway.spec.ts
 * These tests are skipped automatically when the gateway is not running.
 */

import { test, expect } from '@playwright/test';

import { REMOTE_E2E_DEFAULTS } from './config/constants';
import {
  getRemoteAccessToken,
  requireRemoteGatewayOrFail,
} from './helpers/remote-auth';

const REMOTE_BASE_URL = REMOTE_E2E_DEFAULTS.baseUrl;
const REMOTE_SECRET = REMOTE_E2E_DEFAULTS.secret;

test.beforeAll(async () => {
  await requireRemoteGatewayOrFail('remote-gateway.spec.ts', REMOTE_BASE_URL);
});

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
  const access_token = await getRemoteAccessToken(request, {
    baseUrl: REMOTE_BASE_URL,
    secret: REMOTE_SECRET,
  });

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
  const access_token = await getRemoteAccessToken(request, {
    baseUrl: REMOTE_BASE_URL,
    secret: REMOTE_SECRET,
  });

  const resp = await request.post(`${REMOTE_BASE_URL}/api/invoke`, {
    data: { command: 'health_check' },
    headers: { Authorization: `Bearer ${access_token}` },
  });
  expect(resp.ok()).toBe(true);
  const data = await resp.json();
  expect(data.ok).toBe(true);
});

test('POST /api/invoke blocked command returns error', async ({ request }) => {
  const access_token = await getRemoteAccessToken(request, {
    baseUrl: REMOTE_BASE_URL,
    secret: REMOTE_SECRET,
  });

  const resp = await request.post(`${REMOTE_BASE_URL}/api/invoke`, {
    data: { command: 'execute_shell_command', payload: { cmd: 'rm -rf /' } },
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const data = await resp.json();
  // Must be blocked — ok: false
  expect(data.ok).toBe(false);
});

test('POST /api/invoke twin_get_identity returns identity payload', async ({ request }) => {
  const access_token = await getRemoteAccessToken(request, {
    baseUrl: REMOTE_BASE_URL,
    secret: REMOTE_SECRET,
  });

  const resp = await request.post(`${REMOTE_BASE_URL}/api/invoke`, {
    data: { command: 'twin_get_identity' },
    headers: { Authorization: `Bearer ${access_token}` },
  });

  expect(resp.ok()).toBe(true);
  const data = await resp.json();
  expect(data.ok).toBe(true);
  expect(data.content).toHaveProperty('name');
  expect(data.content).toHaveProperty('fusionIndex');
  expect(data.content).toHaveProperty('humanStyle');
  expect(Array.isArray(data.content.coreValues)).toBe(true);
});

test('POST /api/invoke twin_get_evolution_profile returns profile payload', async ({ request }) => {
  const access_token = await getRemoteAccessToken(request, {
    baseUrl: REMOTE_BASE_URL,
    secret: REMOTE_SECRET,
  });

  const resp = await request.post(`${REMOTE_BASE_URL}/api/invoke`, {
    data: { command: 'twin_get_evolution_profile' },
    headers: { Authorization: `Bearer ${access_token}` },
  });

  expect(resp.ok()).toBe(true);
  const data = await resp.json();
  expect(data.ok).toBe(true);
  expect(data.content).toHaveProperty('currentPhase');
  expect(data.content).toHaveProperty('growthTrends');
  expect(data.content).toHaveProperty('syncScore');
  expect(data.content).toHaveProperty('milestonesCount');
});

test('POST /api/invoke twin_get_fusion_index returns fusion payload', async ({ request }) => {
  const access_token = await getRemoteAccessToken(request, {
    baseUrl: REMOTE_BASE_URL,
    secret: REMOTE_SECRET,
  });

  const resp = await request.post(`${REMOTE_BASE_URL}/api/invoke`, {
    data: { command: 'twin_get_fusion_index' },
    headers: { Authorization: `Bearer ${access_token}` },
  });

  expect(resp.ok()).toBe(true);
  const data = await resp.json();
  expect(data.ok).toBe(true);
  expect(data.content).toHaveProperty('globalScore');
  expect(data.content).toHaveProperty('trend');
});

test('POST /api/invoke twin_submit_observation returns syncId and twin_validate_sync confirms it', async ({ request }) => {
  const access_token = await getRemoteAccessToken(request, {
    baseUrl: REMOTE_BASE_URL,
    secret: REMOTE_SECRET,
  });

  const observeResp = await request.post(`${REMOTE_BASE_URL}/api/invoke`, {
    data: {
      command: 'twin_submit_observation',
      payload: {
        observationType: 'style',
        content: 'structured framework',
        context: 'remote gateway e2e',
        confidence: 0.8,
      },
    },
    headers: { Authorization: `Bearer ${access_token}` },
  });

  expect(observeResp.ok()).toBe(true);
  const observeData = await observeResp.json();
  expect(observeData.ok).toBe(true);
  expect(observeData.content).toHaveProperty('success', true);
  expect(observeData.content).toHaveProperty('syncId');
  expect(typeof observeData.content.syncId).toBe('string');

  const validateResp = await request.post(`${REMOTE_BASE_URL}/api/invoke`, {
    data: {
      command: 'twin_validate_sync',
      payload: {
        syncId: observeData.content.syncId,
        validated: true,
      },
    },
    headers: { Authorization: `Bearer ${access_token}` },
  });

  expect(validateResp.ok()).toBe(true);
  const validateData = await validateResp.json();
  expect(validateData.ok).toBe(true);
  expect(validateData.content).toMatchObject({
    success: true,
    syncId: observeData.content.syncId,
    validated: true,
  });
});

test('POST /api/invoke twin_submit_observation rejects invalid confidence payload', async ({ request }) => {
  const access_token = await getRemoteAccessToken(request, {
    baseUrl: REMOTE_BASE_URL,
    secret: REMOTE_SECRET,
  });

  const resp = await request.post(`${REMOTE_BASE_URL}/api/invoke`, {
    data: {
      command: 'twin_submit_observation',
      payload: {
        observationType: 'style',
        content: 'structured framework',
        confidence: 1.2,
      },
    },
    headers: { Authorization: `Bearer ${access_token}` },
  });

  expect(resp.ok()).toBe(true);
  const data = await resp.json();
  expect(data.ok).toBe(false);
  expect(data.error).toContain('confidence must be between 0.0 and 1.0');
});

test('POST /api/invoke twin_apply_evolution returns new phase metadata on valid payload', async ({ request }) => {
  const access_token = await getRemoteAccessToken(request, {
    baseUrl: REMOTE_BASE_URL,
    secret: REMOTE_SECRET,
  });

  const resp = await request.post(`${REMOTE_BASE_URL}/api/invoke`, {
    data: {
      command: 'twin_apply_evolution',
      payload: {
        evolutionType: 'trait_adjustment',
        target: 'sincerity',
        delta: 0.2,
        isDeepChange: false,
        validatedByKevin: true,
      },
    },
    headers: { Authorization: `Bearer ${access_token}` },
  });

  expect(resp.ok()).toBe(true);
  const data = await resp.json();
  expect(data.ok).toBe(true);
  expect(data.content).toHaveProperty('success', true);
  expect(typeof data.content.evolutionId).toBe('string');
  expect(typeof data.content.newFusionIndex).toBe('number');
  expect(typeof data.content.newPhase).toBe('string');
  expect(typeof data.content.timestamp).toBe('string');
});

test('POST /api/invoke twin_apply_evolution rejects invalid delta payload', async ({ request }) => {
  const access_token = await getRemoteAccessToken(request, {
    baseUrl: REMOTE_BASE_URL,
    secret: REMOTE_SECRET,
  });

  const resp = await request.post(`${REMOTE_BASE_URL}/api/invoke`, {
    data: {
      command: 'twin_apply_evolution',
      payload: {
        evolutionType: 'trait_adjustment',
        target: 'sincerity',
        delta: 1.5,
        isDeepChange: false,
        validatedByKevin: true,
      },
    },
    headers: { Authorization: `Bearer ${access_token}` },
  });

  expect(resp.ok()).toBe(true);
  const data = await resp.json();
  expect(data.ok).toBe(false);
  expect(data.error).toContain('delta must be between -1.0 and 1.0');
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
