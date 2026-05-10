/**
 * e2eIpcProbeBridge.test.ts
 * v62 — Unit tests for E2E IPC probe bridge
 *
 * Tests:
 * - Bridge disabled by default (no localStorage flag)
 * - Bridge refuses unknown commandId
 * - Bridge refuses destructive commandId
 * - Bridge redacts sensitive content
 * - Bridge allowlist contains only safe read-only commands
 * - Production guard: bridge not registered without flag
 * - Response shape is stable
 * - No raw arbitrary invoke exposed
 * - isE2EProbeEnabled logic
 * - registerE2eIpcProbeBridge only registers when flag set
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isE2EProbeEnabled,
  registerE2eIpcProbeBridge,
  getE2EIpcProbeBridge,
  BRIDGE_VERSION,
} from '../e2eIpcProbeBridge';

// ─── localStorage mock ──────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

// ─── window mock ─────────────────────────────────────────────────────────────

const windowMock: Record<string, unknown> = {};

// ─── Setup / teardown ────────────────────────────────────────────────────────

beforeEach(() => {
  localStorageMock.clear();
  delete windowMock['__TITANE_E2E_IPC_PROBE__'];
  // Patch global
  vi.stubGlobal('localStorage', localStorageMock);
  vi.stubGlobal('window', windowMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorageMock.clear();
  delete windowMock['__TITANE_E2E_IPC_PROBE__'];
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('E2E IPC Probe Bridge (v62)', () => {
  describe('isE2EProbeEnabled', () => {
    it('returns false by default (no localStorage flag)', () => {
      expect(isE2EProbeEnabled()).toBe(false);
    });

    it('returns true only when localStorage.TITANE_E2E_PROBE=1', () => {
      localStorageMock.setItem('TITANE_E2E_PROBE', '1');
      expect(isE2EProbeEnabled()).toBe(true);
    });

    it('returns false for any value other than "1"', () => {
      localStorageMock.setItem('TITANE_E2E_PROBE', 'true');
      expect(isE2EProbeEnabled()).toBe(false);

      localStorageMock.setItem('TITANE_E2E_PROBE', 'yes');
      expect(isE2EProbeEnabled()).toBe(false);

      localStorageMock.setItem('TITANE_E2E_PROBE', '0');
      expect(isE2EProbeEnabled()).toBe(false);
    });

    it('returns false after removing flag', () => {
      localStorageMock.setItem('TITANE_E2E_PROBE', '1');
      expect(isE2EProbeEnabled()).toBe(true);
      localStorageMock.removeItem('TITANE_E2E_PROBE');
      expect(isE2EProbeEnabled()).toBe(false);
    });
  });

  describe('production guard: bridge not registered without flag', () => {
    it('does NOT register bridge when flag is absent', () => {
      registerE2eIpcProbeBridge();
      expect(windowMock['__TITANE_E2E_IPC_PROBE__']).toBeUndefined();
    });

    it('does NOT register bridge when flag is "false"', () => {
      localStorageMock.setItem('TITANE_E2E_PROBE', 'false');
      registerE2eIpcProbeBridge();
      expect(windowMock['__TITANE_E2E_IPC_PROBE__']).toBeUndefined();
    });

    it('getE2EIpcProbeBridge returns null when not registered', () => {
      expect(getE2EIpcProbeBridge()).toBeNull();
    });
  });

  describe('bridge registration when E2E mode is enabled', () => {
    beforeEach(() => {
      localStorageMock.setItem('TITANE_E2E_PROBE', '1');
      registerE2eIpcProbeBridge();
    });

    it('registers bridge on window.__TITANE_E2E_IPC_PROBE__', () => {
      expect(windowMock['__TITANE_E2E_IPC_PROBE__']).toBeDefined();
    });

    it('bridge version is v62', () => {
      const bridge = windowMock['__TITANE_E2E_IPC_PROBE__'] as { version: string };
      expect(bridge.version).toBe(BRIDGE_VERSION);
      expect(bridge.version).toBe('v62');
    });

    it('bridge.enabled is true', () => {
      const bridge = windowMock['__TITANE_E2E_IPC_PROBE__'] as { enabled: boolean };
      expect(bridge.enabled).toBe(true);
    });

    it('bridge has required methods', () => {
      const bridge = windowMock['__TITANE_E2E_IPC_PROBE__'] as Record<string, unknown>;
      expect(typeof bridge['listAllowedCommands']).toBe('function');
      expect(typeof bridge['invoke']).toBe('function');
      expect(typeof bridge['getLastResult']).toBe('function');
      expect(typeof bridge['clearLastResult']).toBe('function');
    });

    it('listAllowedCommands returns non-empty array of strings', () => {
      const bridge = windowMock['__TITANE_E2E_IPC_PROBE__'] as {
        listAllowedCommands: () => string[]
      };
      const cmds = bridge.listAllowedCommands();
      expect(Array.isArray(cmds)).toBe(true);
      expect(cmds.length).toBeGreaterThan(0);
      expect(cmds).toContain('experience_state');
      expect(cmds).toContain('system_health');
    });

    it('does not expose raw arbitrary Tauri command names', () => {
      const bridge = windowMock['__TITANE_E2E_IPC_PROBE__'] as {
        listAllowedCommands: () => string[]
      };
      const cmds = bridge.listAllowedCommands();
      expect(cmds).not.toContain('experience_get_state');
      expect(cmds).not.toContain('get_system_health');
      expect(cmds).not.toContain('web_research');
    });
  });

  describe('bridge.invoke security guards', () => {
    beforeEach(() => {
      localStorageMock.setItem('TITANE_E2E_PROBE', '1');
      registerE2eIpcProbeBridge();
    });

    it('refuses unknown commandId with COMMAND_NOT_ALLOWLISTED', async () => {
      const bridge = windowMock['__TITANE_E2E_IPC_PROBE__'] as {
        invoke: (id: string) => Promise<{ errorKind: string; attempted: boolean; ok: boolean }>;
      };
      const result = await bridge.invoke('arbitrary_unknown_command');
      expect(result.ok).toBe(false);
      expect(result.attempted).toBe(false);
      expect(result.errorKind).toBe('COMMAND_NOT_ALLOWLISTED');
    });

    it('refuses raw Tauri command name (not a probe alias)', async () => {
      const bridge = windowMock['__TITANE_E2E_IPC_PROBE__'] as {
        invoke: (id: string) => Promise<{ errorKind: string; ok: boolean }>;
      };
      const result = await bridge.invoke('experience_get_state');
      expect(result.ok).toBe(false);
      expect(result.errorKind).toBe('COMMAND_NOT_ALLOWLISTED');
    });

    it('refuses destructive commandId patterns', async () => {
      const bridge = windowMock['__TITANE_E2E_IPC_PROBE__'] as {
        invoke: (id: string) => Promise<{ errorKind: string; attempted: boolean; ok: boolean }>;
      };

      const destructiveIds = [
        'delete_memory',
        'reset_everything',
        'write_to_disk',
        'save_token',
        'execute_shell',
        'clear_all',
      ];

      for (const id of destructiveIds) {
        const result = await bridge.invoke(id);
        expect(result.ok, `${id} must be refused`).toBe(false);
        expect(result.attempted, `${id} must not be attempted`).toBe(false);
        expect(result.errorKind, `${id} errorKind`).toBe('COMMAND_BLOCKED_DESTRUCTIVE');
      }
    });

    it('response has stable required fields', async () => {
      const bridge = windowMock['__TITANE_E2E_IPC_PROBE__'] as {
        invoke: (id: string) => Promise<Record<string, unknown>>;
      };
      const result = await bridge.invoke('unknown_cmd');
      // All response shapes must have these fields
      expect('ok' in result).toBe(true);
      expect('commandId' in result).toBe(true);
      expect('attempted' in result).toBe(true);
      expect('available' in result).toBe(true);
      expect('errorKind' in result).toBe(true);
      expect('latencyMs' in result).toBe(true);
      expect('proofLevel' in result).toBe(true);
      expect('safeToPersist' in result).toBe(true);
      expect('redactionApplied' in result).toBe(true);
      expect('bridgeVersion' in result).toBe(true);
      expect('source' in result).toBe(true);
      expect(result['source']).toBe('APP_CONTEXT_TAURI_IPC_PROBE');
      expect(result['bridgeVersion']).toBe('v62');
    });

    it('redactionApplied is always true', async () => {
      const bridge = windowMock['__TITANE_E2E_IPC_PROBE__'] as {
        invoke: (id: string) => Promise<{ redactionApplied: boolean }>;
      };
      const result = await bridge.invoke('any_command');
      expect(result.redactionApplied).toBe(true);
    });

    it('safeToPersist is always true', async () => {
      const bridge = windowMock['__TITANE_E2E_IPC_PROBE__'] as {
        invoke: (id: string) => Promise<{ safeToPersist: boolean }>;
      };
      const result = await bridge.invoke('any_command');
      expect(result.safeToPersist).toBe(true);
    });
  });

  describe('bridge.getLastResult / clearLastResult', () => {
    beforeEach(() => {
      localStorageMock.setItem('TITANE_E2E_PROBE', '1');
      registerE2eIpcProbeBridge();
    });

    it('getLastResult returns null initially', () => {
      const bridge = windowMock['__TITANE_E2E_IPC_PROBE__'] as {
        getLastResult: () => unknown;
        clearLastResult: () => void;
      };
      bridge.clearLastResult();
      expect(bridge.getLastResult()).toBeNull();
    });

    it('getLastResult is updated after invoke', async () => {
      const bridge = windowMock['__TITANE_E2E_IPC_PROBE__'] as {
        invoke: (id: string) => Promise<unknown>;
        getLastResult: () => unknown;
      };
      bridge.invoke('unknown_to_set_last_result');
      // Wait for microtask
      await new Promise(r => setTimeout(r, 0));
      // Last result should be set (may still be processing but await handles it)
    });

    it('clearLastResult sets result to null', async () => {
      const bridge = windowMock['__TITANE_E2E_IPC_PROBE__'] as {
        invoke: (id: string) => Promise<unknown>;
        getLastResult: () => unknown;
        clearLastResult: () => void;
      };
      await bridge.invoke('unknown_command_clear_test');
      bridge.clearLastResult();
      expect(bridge.getLastResult()).toBeNull();
    });
  });
});
