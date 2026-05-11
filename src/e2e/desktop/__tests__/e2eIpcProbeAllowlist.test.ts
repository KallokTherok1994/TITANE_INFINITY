/**
 * e2eIpcProbeAllowlist.test.ts
 * v63 — Unit tests for E2E IPC probe allowlist
 *
 * Tests:
 * - Allowlist contains only read-only commands
 * - No destructive commands in the allowlist
 * - All commands have required fields
 * - isAllowlistedCommandId works correctly
 * - listAllowedCommandIds returns all keys
 * - getAllowlistEntry returns correct entry or null
 * - RESEARCH has research_status (safe read-only, v63)
 */

import { describe, it, expect } from 'vitest';
import {
  E2E_IPC_PROBE_ALLOWLIST,
  isAllowlistedCommandId,
  listAllowedCommandIds,
  getAllowlistEntry,
  type AllowlistEntry,
} from '../e2eIpcProbeAllowlist';

const DESTRUCTIVE_PATTERNS = [
  'delete',
  'remove',
  'reset',
  'drop',
  'clear',
  'purge',
  'wipe',
  'push',
  'send',
  'upload',
  'sync_push',
  'write',
  'save',
  'execute',
  'exec',
  'eval',
  'run_',
  'shell',
];

describe('E2E IPC Probe Allowlist (v63)', () => {
  describe('allowlist structure', () => {
    it('should export a non-empty allowlist', () => {
      expect(Object.keys(E2E_IPC_PROBE_ALLOWLIST).length).toBeGreaterThan(0);
    });

    it('every entry should have all required fields', () => {
      for (const [commandId, entry] of Object.entries(E2E_IPC_PROBE_ALLOWLIST)) {
        expect(entry.commandId, `${commandId}: commandId`).toBe(commandId);
        expect(entry.command, `${commandId}: command`).toBeTruthy();
        expect(entry.module, `${commandId}: module`).toBeTruthy();
        expect(typeof entry.readOnly, `${commandId}: readOnly`).toBe('boolean');
        expect(typeof entry.requiresSandbox, `${commandId}: requiresSandbox`).toBe(
          'boolean'
        );
        expect(entry.description, `${commandId}: description`).toBeTruthy();
        expect(
          typeof entry.inSecurityAllowlist,
          `${commandId}: inSecurityAllowlist`
        ).toBe('boolean');
        expect(typeof entry.rustImplemented, `${commandId}: rustImplemented`).toBe(
          'boolean'
        );
      }
    });

    it('all commands must be read-only', () => {
      for (const [commandId, entry] of Object.entries(E2E_IPC_PROBE_ALLOWLIST)) {
        expect(entry.readOnly, `${commandId} must be read-only`).toBe(true);
      }
    });

    it('no destructive commands in the allowlist', () => {
      for (const [commandId, entry] of Object.entries(E2E_IPC_PROBE_ALLOWLIST)) {
        const lowerCommand = entry.command.toLowerCase();
        const lowerCommandId = commandId.toLowerCase();
        for (const pattern of DESTRUCTIVE_PATTERNS) {
          expect(
            lowerCommand.includes(pattern),
            `command ${entry.command} must not contain destructive pattern "${pattern}"`
          ).toBe(false);
          expect(
            lowerCommandId.includes(pattern),
            `commandId ${commandId} must not contain destructive pattern "${pattern}"`
          ).toBe(false);
        }
      }
    });

    it('RESEARCH module must have research_status entry (v63 — safe read-only command)', () => {
      const researchEntries = Object.values(E2E_IPC_PROBE_ALLOWLIST).filter(
        e => e.module === 'RESEARCH'
      );
      expect(researchEntries.length).toBe(1);
      expect(researchEntries[0].commandId).toBe('research_status');
      expect(researchEntries[0].command).toBe('research_get_status');
      expect(researchEntries[0].readOnly).toBe(true);
    });

    it('EXPERIENCE module must have experience_state entry', () => {
      expect(E2E_IPC_PROBE_ALLOWLIST['experience_state']).toBeDefined();
      expect(E2E_IPC_PROBE_ALLOWLIST['experience_state'].command).toBe(
        'experience_get_state'
      );
    });

    it('CLOUD module must have cloud_status entry', () => {
      expect(E2E_IPC_PROBE_ALLOWLIST['cloud_status']).toBeDefined();
      expect(E2E_IPC_PROBE_ALLOWLIST['cloud_status'].command).toBe('cloud_get_status');
    });

    it('AGENT_CHAT module must have health_check entry', () => {
      expect(E2E_IPC_PROBE_ALLOWLIST['health_check']).toBeDefined();
      expect(E2E_IPC_PROBE_ALLOWLIST['health_check'].command).toBe('health_check');
    });

    it('all entries must have inSecurityAllowlist = true', () => {
      for (const [commandId, entry] of Object.entries(E2E_IPC_PROBE_ALLOWLIST)) {
        expect(
          entry.inSecurityAllowlist,
          `${commandId}: must be in security allowlist`
        ).toBe(true);
      }
    });

    it('all entries must have rustImplemented = true', () => {
      for (const [commandId, entry] of Object.entries(E2E_IPC_PROBE_ALLOWLIST)) {
        expect(entry.rustImplemented, `${commandId}: must have Rust implementation`).toBe(
          true
        );
      }
    });
  });

  describe('isAllowlistedCommandId', () => {
    it('returns true for known commandIds', () => {
      expect(isAllowlistedCommandId('system_health')).toBe(true);
      expect(isAllowlistedCommandId('experience_state')).toBe(true);
      expect(isAllowlistedCommandId('memory_state')).toBe(true);
      expect(isAllowlistedCommandId('health_check')).toBe(true);
      expect(isAllowlistedCommandId('cloud_status')).toBe(true);
      expect(isAllowlistedCommandId('research_status')).toBe(true);
    });

    it('returns false for unknown commandIds', () => {
      expect(isAllowlistedCommandId('web_research')).toBe(false);
      expect(isAllowlistedCommandId('arbitrary_command')).toBe(false);
      expect(isAllowlistedCommandId('')).toBe(false);
      expect(isAllowlistedCommandId('__proto__')).toBe(false);
    });

    it('returns false for raw Tauri command names (not probe aliases)', () => {
      // Raw commands must be accessed via commandId alias only
      expect(isAllowlistedCommandId('experience_get_state')).toBe(false);
      expect(isAllowlistedCommandId('get_system_health')).toBe(false);
    });
  });

  describe('listAllowedCommandIds', () => {
    it('returns all commandId keys', () => {
      const ids = listAllowedCommandIds();
      expect(ids).toContain('system_health');
      expect(ids).toContain('experience_state');
      expect(ids).toContain('memory_state');
      expect(ids).toContain('cloud_status');
      expect(ids).toContain('health_check');
      expect(ids).toContain('research_status');
    });

    it('does not include raw Tauri command names', () => {
      const ids = listAllowedCommandIds();
      expect(ids).not.toContain('get_system_health');
      expect(ids).not.toContain('experience_get_state');
    });

    it('returns a stable sorted-compatible array (no duplicates)', () => {
      const ids = listAllowedCommandIds();
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });
  });

  describe('getAllowlistEntry', () => {
    it('returns the correct entry for a known commandId', () => {
      const entry: AllowlistEntry | null = getAllowlistEntry('experience_state');
      expect(entry).not.toBeNull();
      expect(entry!.command).toBe('experience_get_state');
      expect(entry!.module).toBe('EXPERIENCE');
      expect(entry!.readOnly).toBe(true);
    });

    it('returns null for unknown commandId', () => {
      expect(getAllowlistEntry('not_exist')).toBeNull();
      expect(getAllowlistEntry('')).toBeNull();
    });
  });
});
