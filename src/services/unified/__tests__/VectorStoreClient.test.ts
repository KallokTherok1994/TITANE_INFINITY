/**
 * 🧪 TITANE∞ VectorStoreClient — Tests P0
 * Phase 6 YOLO: Mock fix + test execution
 */

import { VectorStoreClient } from '../VectorStoreClient';
import { MemoryTier } from '@/services/mcp/mcp.types';
import type { UnifiedMemoryEntry } from '../UnifiedMemory';
import { logger } from '@/utils/logger';
import { vi, beforeEach, afterEach, describe, test, expect } from 'vitest';

// Mock Tauri API inline (pattern ConversationManager)
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn((cmd: string, args?: any) => {
    if (cmd === 'vector_store_init') return Promise.resolve('test-123');
    if (cmd === 'vector_store_insert') return Promise.resolve({ success: true });
    if (cmd === 'vector_search') {
      return Promise.resolve([
        {
          entry: {
            id: 'test-1',
            tier: 'MEDIUM_TERM',
            type: 'fact',
            summary: 'Test memory',
            owner: 'test',
            tags: ['test'],
            importance: 0.8,
            created: Date.now(),
          },
          score: 0.95,
        },
      ]);
    }
    if (cmd === 'vector_store_get') {
      if (args?.id === 'exists') {
        return Promise.resolve({
          id: 'exists',
          tier: 'SHORT_TERM',
          type: 'fact',
          summary: 'Exists',
          owner: 'test',
          tags: [],
          importance: 0.5,
          created: Date.now(),
        });
      }
      return Promise.resolve(null);
    }
    if (cmd === 'vector_store_update') return Promise.resolve({ success: true });
    if (cmd === 'vector_store_delete') return Promise.resolve({ success: true });
    if (cmd === 'vector_store_get_stats') {
      return Promise.resolve({
        totalEntries: 100,
        byTier: { SHORT_TERM: 50, MEDIUM_TERM: 30, LONG_TERM: 20 },
        byType: { fact: 60, preference: 40 },
        avgImportance: 0.7,
        dbSizeBytes: 1024 * 1024,
      });
    }
    return Promise.resolve({ success: true });
  }),
}));

describe('VectorStoreClient P0 Tests', () => {
  let client: VectorStoreClient;

  beforeEach(async () => {
    vi.clearAllMocks();
    client = new VectorStoreClient({
      dbPath: ':memory:',
      tableName: 'unified_memories',
      dimensions: 384,
    });
    await client.initialize();
  });

  afterEach(async () => {
    await client.close();
    vi.clearAllMocks();
  });

  describe('✅ Initialization', () => {
    test('should initialize successfully', async () => {
      const newClient = new VectorStoreClient({
        dbPath: 'test.db',
        tableName: 'unified_memories',
        dimensions: 384,
      });
      await expect(newClient.initialize()).resolves.not.toThrow();
      await newClient.close();
    });
  });

  describe('✅ CRUD Operations', () => {
    test('should get existing entry', async () => {
      const entry = await client.get('exists');
      expect(entry).not.toBeNull();
      expect(entry?.id).toBe('exists');
    });

    test('should return null for non-existent entry', async () => {
      const entry = await client.get('does-not-exist');
      expect(entry).toBeNull();
    });
  });

  describe('✅ Statistics', () => {
    test('should get stats', async () => {
      const stats = await client.getStats();
      expect(stats).toBeDefined();
      expect(stats.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('✅ Stub Methods', () => {
    test('deleteWhere should warn', async () => {
      const spy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
      const result = await client.deleteWhere({ importance: { $lt: 0.3 } });
      expect(result).toBe(0);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
