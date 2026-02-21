/**
 * ═══════════════════════════════════════════════════════════════
 * Snapshot Contract Test — Validate TS↔Rust Interface
 * 
 * Tests that Snapshot objects always include required `metadata` field
 * to prevent IPC deserialization failures.
 * ═══════════════════════════════════════════════════════════════
 */

import {
  describe,
  it,
  expect,
} from 'vitest';  

import {
  normalizeSnapshot,
  isValidSnapshot,
  createMinimalSnapshot,
} from '@/services/tauri/snapshotFactory';

describe('Snapshot Contract Guard', () => {
  describe('normalizeSnapshot', () => {
    it('should add metadata field if missing', () => {
      const partial = {
        id: 'test-1',
        timestamp: 12345,
      };

      const normalized = normalizeSnapshot(partial);

      expect(normalized).toHaveProperty('metadata');
      expect(normalized.metadata).toEqual({});
    });

    it('should preserve existing metadata', () => {
      const snapshot = {
        id: 'test-2',
        timestamp: 12345,
        metadata: { key: 'value' },
      };

      const normalized = normalizeSnapshot(snapshot);

      expect(normalized.metadata).toEqual({ key: 'value' });
    });

    it('should handle null metadata by replacing with empty object', () => {
      const snapshot = {
        id: 'test-3',
        timestamp: 12345,
        metadata: null,
      };

      const normalized = normalizeSnapshot(snapshot);

      expect(normalized.metadata).toEqual({});
    });

    it('should work with full snapshot object', () => {
      const full = {
        id: 'test-4',
        timestamp: 12345,
        helios: {},
        nexus: {},
        harmonia: {},
        sentinel: {},
        metadata: { session: 'prod' },
      };

      const normalized = normalizeSnapshot(full);

      expect(normalized.metadata).toEqual({ session: 'prod' });
      expect(normalized.id).toBe('test-4');
    });
  });

  describe('isValidSnapshot', () => {
    it('should validate complete snapshot with metadata', () => {
      const snapshot = {
        id: 'valid-1',
        timestamp: 12345,
        metadata: {},
      };

      expect(isValidSnapshot(snapshot)).toBe(true);
    });

    it('should reject snapshot missing metadata', () => {
      const snapshot = {
        id: 'invalid-1',
        timestamp: 12345,
      };

      expect(isValidSnapshot(snapshot)).toBe(false);
    });

    it('should reject null metadata', () => {
      const snapshot = {
        id: 'invalid-2',
        timestamp: 12345,
        metadata: null,
      };

      expect(isValidSnapshot(snapshot)).toBe(false);
    });

    it('should reject non-object metadata', () => {
      const snapshot = {
        id: 'invalid-3',
        timestamp: 12345,
        metadata: 'not-an-object',
      };

      expect(isValidSnapshot(snapshot)).toBe(false);
    });

    it('should reject missing required fields', () => {
      expect(isValidSnapshot({ metadata: {} })).toBe(false);
      expect(isValidSnapshot({ id: 'test', metadata: {} })).toBe(false);
      expect(isValidSnapshot({ timestamp: 123, metadata: {} })).toBe(false);
    });
  });

  describe('createMinimalSnapshot', () => {
    it('should create snapshot with all required fields', () => {
      const snapshot = createMinimalSnapshot();

      expect(snapshot).toHaveProperty('id');
      expect(snapshot).toHaveProperty('timestamp');
      expect(snapshot).toHaveProperty('metadata');
      expect(isValidSnapshot(snapshot)).toBe(true);
    });

    it('should allow custom id and timestamp', () => {
      const snapshot = createMinimalSnapshot('custom-id', 99999);

      expect(snapshot.id).toBe('custom-id');
      expect(snapshot.timestamp).toBe(99999);
      expect(snapshot.metadata).toEqual({});
    });
  });

  describe('IPC Contract Compliance', () => {
    it('should never send snapshot to Tauri without metadata', () => {
      // Simulate what happens when snapshot is sent to Tauri
      const snapshot = {
        id: 'ipc-test',
        timestamp: Date.now(),
        // Missing metadata would cause Tauri deserialization failure
      };

      const normalized = normalizeSnapshot(snapshot);

      // After normalization, metadata should always exist
      expect(typeof normalized.metadata).toBe('object');
      expect(normalized.metadata).not.toBe(null);
    });

    it('should satisfy Rust Snapshot type requirements', () => {
      // Rust requires: id (String), timestamp (i64), metadata (HashMap)
      const snapshot = {
        id: 'rust-compat-test',
        timestamp: Math.floor(Date.now()),
        metadata: {
          source: 'typescript',
          version: '1.0',
        },
      };

      // After normalization, type invariants are preserved
      const normalized = normalizeSnapshot(snapshot);

      expect(typeof normalized.id).toBe('string');
      expect(typeof normalized.timestamp).toBe('number');
      expect(normalized.timestamp).toBeGreaterThan(0);
      expect(typeof normalized.metadata).toBe('object');
      expect(normalized.metadata).not.toBe(null);
    });
  });
});
