/**
 * 🧪 TITANE∞ VectorStoreClient — Tests P0
 * Phase 5 YOLO: Coverage expansion (40% → 50%+)
 */

import { VectorStoreClient } from '../VectorStoreClient';
import { MemoryTier } from '@/services/mcp/mcp.types';
import type { UnifiedMemoryEntry } from '../UnifiedMemory';
import { vi } from 'vitest';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn((cmd: string, args?: any) => {
    if (cmd === 'vector_store_init') {
      return Promise.resolve({ storeId: 'test-store-123' });
    }
    if (cmd === 'vector_store_insert') {
      return Promise.resolve({ success: true });
    }
    if (cmd === 'vector_search') {
      // Mock search results
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
          distance: 0.05,
        },
      ]);
    }
    if (cmd === 'vector_store_get') {
      if (args.id === 'exists') {
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
    if (cmd === 'vector_store_update') {
      return Promise.resolve({ success: true });
    }
    if (cmd === 'vector_store_delete') {
      return Promise.resolve({ success: true });
    }
    if (cmd === 'vector_store_get_stats') {
      return Promise.resolve({
        totalEntries: 100,
        byTier: { SHORT_TERM: 50, MEDIUM_TERM: 30, LONG_TERM: 20 },
        byType: { fact: 60, preference: 40 },
        avgImportance: 0.7,
        dbSizeBytes: 1024 * 1024, // 1MB
      });
    }
    return Promise.resolve({ success: true });
  }),
}));

describe('VectorStoreClient P0 Tests', () => {
  let client: VectorStoreClient;

  beforeEach(async () => {
    client = new VectorStoreClient({ dbPath: ':memory:' });
    await client.initialize();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await client.close();
    vi.clearAllMocks();
  });

  describe('✅ Initialization', () => {
    test('should initialize successfully', async () => {
      const newClient = new VectorStoreClient({ dbPath: 'test.db' });
      await expect(newClient.initialize()).resolves.not.toThrow();
      await newClient.close();
    });

    test('should throw error when using methods before initialization', async () => {
      const uninitClient = new VectorStoreClient({ dbPath: 'test.db' });
      await expect(
        uninitClient.insert({
          id: 'test',
          tier: MemoryTier.SHORT_TERM,
        } as UnifiedMemoryEntry)
      ).rejects.toThrow('not initialized');
    });
  });

  describe('✅ Insert Operations', () => {
    test('should insert single entry', async () => {
      const entry: UnifiedMemoryEntry = {
        id: 'test-insert-1',
        tier: MemoryTier.MEDIUM_TERM,
        type: 'fact',
        summary: 'Test insertion',
        details: 'Full details here',
        embedding: new Array(384).fill(0.5),
        owner: 'test-user',
        tags: ['test', 'insertion'],
        source: { type: 'manual', timestamp: Date.now() },
        importance: 0.8,
        confidence: 0.9,
        strength: 0.7,
        isUseful: true,
        isTrue: true,
        isStructuring: false,
        isStable: true,
        isReusable: true,
        created: Date.now(),
        accessed: Date.now(),
        accessCount: 0,
        compressionLevel: 0,
      };

      await expect(client.insert(entry)).resolves.not.toThrow();
    });

    test('should insert batch entries', async () => {
      const entries: UnifiedMemoryEntry[] = [
        {
          id: 'batch-1',
          tier: MemoryTier.SHORT_TERM,
          type: 'fact',
          summary: 'Batch 1',
          owner: 'test',
          tags: [],
          source: { type: 'system', timestamp: Date.now() },
          importance: 0.5,
          confidence: 0.5,
          strength: 0.5,
          isUseful: true,
          isTrue: true,
          isStructuring: false,
          isStable: true,
          isReusable: true,
          created: Date.now(),
          accessed: Date.now(),
          accessCount: 0,
          compressionLevel: 0,
        },
        {
          id: 'batch-2',
          tier: MemoryTier.MEDIUM_TERM,
          type: 'preference',
          summary: 'Batch 2',
          owner: 'test',
          tags: [],
          source: { type: 'conversation', timestamp: Date.now() },
          importance: 0.6,
          confidence: 0.5,
          strength: 0.5,
          isUseful: true,
          isTrue: true,
          isStructuring: false,
          isStable: true,
          isReusable: true,
          created: Date.now(),
          accessed: Date.now(),
          accessCount: 0,
          compressionLevel: 0,
        },
      ];

      await expect(client.insertBatch(entries)).resolves.not.toThrow();
    });
  });

  describe('✅ Search Operations', () => {
    test('should search with embedding vector', async () => {
      const embedding = new Array(384).fill(0.5);
      const results = await client.search(embedding, 10);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('entry');
      expect(results[0]).toHaveProperty('score');
      expect(results[0].score).toBeGreaterThanOrEqual(0);
      expect(results[0].score).toBeLessThanOrEqual(1);
    });

    test('should search with filters (tier)', async () => {
      const embedding = new Array(384).fill(0.5);
      const results = await client.search(embedding, 5, {
        tierFilter: [MemoryTier.MEDIUM_TERM],
      });

      expect(Array.isArray(results)).toBe(true);
    });

    test('should search with options object', async () => {
      const embedding = new Array(384).fill(0.5);
      const results = await client.search(embedding, {
        topK: 3,
        minScore: 0.7,
        tierFilter: [MemoryTier.LONG_TERM],
      });

      expect(Array.isArray(results)).toBe(true);
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

    test('should update entry', async () => {
      await expect(
        client.update('exists', {
          importance: 0.9,
          tags: ['updated'],
        })
      ).resolves.not.toThrow();
    });

    test('should delete entry', async () => {
      await expect(client.delete('test-id')).resolves.not.toThrow();
    });
  });

  describe('✅ Statistics', () => {
    test('should get stats', async () => {
      const stats = await client.getStats();

      expect(stats).toBeDefined();
      expect(stats.total).toBeGreaterThanOrEqual(0);
      expect(stats.byTier).toBeDefined();
      expect(stats.storageSizeMB).toBeGreaterThanOrEqual(0);
    });

    test('should have correct stats structure', async () => {
      const stats = await client.getStats();

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('byTier');
      expect(stats).toHaveProperty('byType');
      expect(stats).toHaveProperty('storageSizeMB');
    });
  });

  describe('✅ Interface Compliance (IVectorStore)', () => {
    test('should support add() method', async () => {
      const entry = {
        id: 'add-test',
        tier: MemoryTier.SHORT_TERM,
        type: 'fact' as const,
        summary: 'Add test',
        owner: 'test',
        tags: [],
        source: { type: 'system' as const, timestamp: Date.now() },
        importance: 0.5,
        confidence: 0.5,
        strength: 0.5,
        isUseful: true,
        isTrue: true,
        isStructuring: false,
        isStable: true,
        isReusable: true,
        created: Date.now(),
        accessed: Date.now(),
        accessCount: 0,
        compressionLevel: 0,
      };

      await expect(client.add(entry)).resolves.not.toThrow();
    });

    test('should support addBatch() method', async () => {
      const entries = [
        {
          id: 'batch-add-1',
          tier: MemoryTier.SHORT_TERM,
          type: 'fact' as const,
          summary: 'Batch add 1',
          owner: 'test',
          tags: [],
          source: { type: 'system' as const, timestamp: Date.now() },
          importance: 0.5,
          confidence: 0.5,
          strength: 0.5,
          isUseful: true,
          isTrue: true,
          isStructuring: false,
          isStable: true,
          isReusable: true,
          created: Date.now(),
          accessed: Date.now(),
          accessCount: 0,
          compressionLevel: 0,
        },
      ];

      await expect(client.addBatch(entries)).resolves.not.toThrow();
    });
  });

  describe('✅ Error Handling', () => {
    test('should handle clear() error (not implemented)', async () => {
      await expect(client.clear()).rejects.toThrow('not available');
    });

    test('should handle close() gracefully', async () => {
      await expect(client.close()).resolves.not.toThrow();
      // After close, should throw on operations
      await expect(client.get('test')).rejects.toThrow('not initialized');
    });
  });

  describe('✅ Stub Methods (TODO warnings)', () => {
    test('deleteWhere should warn and return 0', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = await client.deleteWhere({ importance: { $lt: 0.3 } });

      expect(result).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('not yet implemented')
      );

      consoleSpy.mockRestore();
    });

    test('cleanup should warn', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      await client.cleanup();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('not yet implemented')
      );

      consoleSpy.mockRestore();
    });
  });
});
