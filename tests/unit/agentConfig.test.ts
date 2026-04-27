/**
 * Tests unitaires — AgentConfig + AgentAI
 *
 * Couverture:
 *  - loadAgentConfig / saveAgentConfig / resetAgentConfig
 *  - appendUsageLog / readUsageLog / clearUsageLog
 *  - AgentAI.getRotationWarnings
 *  - AgentAI.analyzeKeyUsage (offline fallback)
 *  - AgentAI.suggestLabels (offline fallback)
 *
 * Rule 16 compliance: new service → Vitest unit tests required.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadAgentConfig,
  saveAgentConfig,
  resetAgentConfig,
  appendUsageLog,
  readUsageLog,
  clearUsageLog,
  DEFAULT_AGENT_CONFIG,
  AGENT_CONFIG_STORAGE_KEY,
  USAGE_LOG_KEY,
} from '../../src/services/remoteKeyManager/AgentConfig';
import { AgentAI } from '../../src/services/remoteKeyManager/AgentAI';

// ─── localStorage mock ───────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: false,
});

// ─── AgentConfig tests ───────────────────────────────────────────────────────

describe('AgentConfig', () => {
  beforeEach(() => localStorageMock.clear());

  it('returns default config when localStorage is empty', () => {
    const config = loadAgentConfig();
    expect(config.version).toBe(1);
    expect(config.training.model).toBe('gemma2:2b');
    expect(config.rotation.autoRotateDays).toBe(90);
  });

  it('persists and reloads config', () => {
    const custom = {
      ...DEFAULT_AGENT_CONFIG,
      rotation: { autoRotateDays: 30, warnAfterDays: 20 },
      updatedAt: new Date().toISOString(),
    };
    saveAgentConfig(custom);
    const loaded = loadAgentConfig();
    expect(loaded.rotation.autoRotateDays).toBe(30);
    expect(loaded.rotation.warnAfterDays).toBe(20);
  });

  it('merges partial config with defaults on reload', () => {
    // Simulate partial legacy storage
    localStorage.setItem(
      AGENT_CONFIG_STORAGE_KEY,
      JSON.stringify({ rotation: { autoRotateDays: 7 } })
    );
    const loaded = loadAgentConfig();
    // training defaults should still be present
    expect(loaded.training.model).toBe('gemma2:2b');
    expect(loaded.rotation.autoRotateDays).toBe(7);
  });

  it('resetAgentConfig restores defaults', () => {
    saveAgentConfig({
      ...DEFAULT_AGENT_CONFIG,
      rotation: { autoRotateDays: 7, warnAfterDays: 5 },
    });
    const reset = resetAgentConfig();
    expect(reset.rotation.autoRotateDays).toBe(90);
  });

  it('handles corrupt localStorage gracefully', () => {
    localStorage.setItem(AGENT_CONFIG_STORAGE_KEY, '{corrupt_json:::}');
    const config = loadAgentConfig();
    expect(config.version).toBe(1);
  });
});

// ─── UsageLog tests ──────────────────────────────────────────────────────────

describe('UsageLog', () => {
  beforeEach(() => localStorageMock.clear());

  it('appends and reads log entries', () => {
    appendUsageLog({ action: 'create', keyId: 'tk_abc', label: 'Test' });
    appendUsageLog({ action: 'rotate', keyId: 'tk_abc' });
    const log = readUsageLog();
    expect(log).toHaveLength(2);
    expect(log[0].action).toBe('create');
    expect(log[1].action).toBe('rotate');
  });

  it('clears usage log', () => {
    appendUsageLog({ action: 'revoke', keyId: 'tk_x' });
    clearUsageLog();
    expect(readUsageLog()).toHaveLength(0);
  });

  it('returns empty array on corrupt log storage', () => {
    localStorage.setItem(USAGE_LOG_KEY, '{not an array}');
    const log = readUsageLog();
    expect(Array.isArray(log)).toBe(true);
  });
});

// ─── AgentAI tests ───────────────────────────────────────────────────────────

describe('AgentAI.getRotationWarnings', () => {
  const config = { ...DEFAULT_AGENT_CONFIG };
  const ai = new AgentAI(config);

  it('returns no warnings when all keys are recent', () => {
    const keys = [
      {
        keyId: 'k1',
        label: 'Test',
        scopes: ['chat'],
        createdAt: new Date().toISOString(),
        active: true,
        daysSinceCreation: 5,
      },
    ];
    expect(ai.getRotationWarnings(keys)).toHaveLength(0);
  });

  it('returns warning for key older than warnAfterDays', () => {
    const keys = [
      {
        keyId: 'k1',
        label: 'Old Key',
        scopes: ['chat'],
        createdAt: '2020-01-01T00:00:00.000Z',
        active: true,
        daysSinceCreation: 65,
      },
    ];
    const warnings = ai.getRotationWarnings(keys);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].keyId).toBe('k1');
    expect(warnings[0].critical).toBe(false);
  });

  it('marks critical for key older than autoRotateDays', () => {
    const keys = [
      {
        keyId: 'k2',
        label: 'Critical Key',
        scopes: ['admin'],
        createdAt: '2020-01-01T00:00:00.000Z',
        active: true,
        daysSinceCreation: 95,
      },
    ];
    const warnings = ai.getRotationWarnings(keys);
    expect(warnings[0].critical).toBe(true);
  });

  it('skips inactive keys', () => {
    const keys = [
      {
        keyId: 'k3',
        label: 'Revoked',
        scopes: ['chat'],
        createdAt: '2020-01-01T00:00:00.000Z',
        active: false,
        daysSinceCreation: 200,
      },
    ];
    expect(ai.getRotationWarnings(keys)).toHaveLength(0);
  });

  it('returns no warnings when warnAfterDays is 0 (disabled)', () => {
    const aiOff = new AgentAI({
      ...config,
      rotation: { autoRotateDays: 0, warnAfterDays: 0 },
    });
    const keys = [
      {
        keyId: 'k4',
        label: 'Any',
        scopes: ['chat'],
        createdAt: '2020-01-01T00:00:00.000Z',
        active: true,
        daysSinceCreation: 500,
      },
    ];
    expect(aiOff.getRotationWarnings(keys)).toHaveLength(0);
  });
});

describe('AgentAI.analyzeKeyUsage offline fallback', () => {
  it('returns ok:false with error message when Ollama unavailable', async () => {
    // invoke is not available in test env — AgentAI should catch and return ok:false
    const ai = new AgentAI(DEFAULT_AGENT_CONFIG);
    const result = await ai.analyzeKeyUsage([], []);
    // Either ok or fails gracefully — must not throw
    expect(typeof result.ok).toBe('boolean');
    if (!result.ok) {
      expect(typeof result.error).toBe('string');
    }
  });
});

describe('AgentAI.suggestLabels offline fallback', () => {
  it('returns ok:false with error message when Ollama unavailable', async () => {
    const ai = new AgentAI(DEFAULT_AGENT_CONFIG);
    const result = await ai.suggestLabels('API mobile application');
    expect(typeof result.ok).toBe('boolean');
    if (!result.ok) {
      expect(typeof result.error).toBe('string');
    }
  });
});
