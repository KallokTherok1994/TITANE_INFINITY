/**
 * TITANE_INFINITY v26.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * v22Ω AI Performance Optimizations Compatible
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   SQLite VECTOR STORE — Unit Tests
 *   NOTE: These tests require native better-sqlite3 bindings.
 *   They are skipped in environments where bindings are not available
 *   (e.g., Node v24+ without compiled bindings).
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { UnifiedMemoryEntry } from '../UnifiedMemory';
import { MemoryTier } from '../../mcp/mcp.types';
import path from 'path';
import fs from 'fs';

// Check if better-sqlite3 bindings are available
let SQLiteVectorStoreCtor: typeof import('../SQLiteVectorStore').SQLiteVectorStore;
let hasSQLiteBindings = false;

try {
  // Attempt to load native module using dynamic import for ESM compatibility
  await import('better-sqlite3');
  hasSQLiteBindings = true;
  const module = await import('../SQLiteVectorStore');
  SQLiteVectorStoreCtor = module.SQLiteVectorStore;
} catch {
  // Native bindings not available - tests will be skipped
  hasSQLiteBindings = false;
}

// Use describe.skipIf to skip all tests when bindings are unavailable
describe.skipIf(!hasSQLiteBindings)('SQLiteVectorStore', () => {
  let store: import('../SQLiteVectorStore').SQLiteVectorStore;
  const testDbPath = path.join(__dirname, 'test-vector-store.db');

  beforeEach(async () => {
    // Clean up existing test DB
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    store = new SQLiteVectorStoreCtor({ dbPath: testDbPath });
    await store.initialize();
  });

  afterEach(async () => {
    await store.close();

    // Clean up test DB
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    const walPath = testDbPath + '-wal';
    const shmPath = testDbPath + '-shm';
    if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
  });

  const createTestEntry = (
    overrides: Partial<UnifiedMemoryEntry> = {}
  ): UnifiedMemoryEntry => {
    const now = Date.now();
    return {
      id: `test-${Math.random().toString(36).substr(2, 9)}`,
      tier: MemoryTier.SHORT_TERM,
      type: 'fact',
      owner: 'test_user',
      summary: 'Test summary',
      details: 'Test details',
      embedding: Array.from({ length: 384 }, () => Math.random()),
      tags: ['test'],
      source: {
        type: 'manual',
        timestamp: now,
        context: 'test',
      },
      relatedTo: [],
      importance: 0.7,
      confidence: 0.9,
      strength: 1.0,
      accessCount: 0,
      created: now,
      accessed: now,
      lastUsed: now,
      compressionLevel: 0,
      isUseful: true,
      isTrue: true,
      isStructuring: true,
      isStable: true,
      isReusable: true,
      ...overrides,
    };
  };

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const newStore = new SQLiteVectorStoreCtor({ dbPath: ':memory:' });
      await expect(newStore.initialize()).resolves.not.toThrow();
      await newStore.close();
    });

    it('should create tables on initialization', async () => {
      const newStore = new SQLiteVectorStoreCtor({ dbPath: ':memory:' });
      await newStore.initialize();

      const stats = await newStore.getStats();
      expect(stats.total).toBe(0);

      await newStore.close();
    });
  });

  describe('Add Operations', () => {
    it('should add a single entry', async () => {
      const entry = createTestEntry();
      await store.add(entry);

      const retrieved = await store.get(entry.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(entry.id);
      expect(retrieved?.summary).toBe(entry.summary);
    });

    it('should add batch entries', async () => {
      const entries = [
        createTestEntry({ summary: 'Entry 1' }),
        createTestEntry({ summary: 'Entry 2' }),
        createTestEntry({ summary: 'Entry 3' }),
      ];

      await store.addBatch(entries);

      const stats = await store.getStats();
      expect(stats.total).toBe(3);
    });

    it('should preserve embedding vectors', async () => {
      const embedding = Array.from({ length: 384 }, (_, i) => i / 384);
      const entry = createTestEntry({ embedding });

      await store.add(entry);

      const retrieved = await store.get(entry.id);
      expect(retrieved?.embedding).toBeDefined();
      expect(retrieved?.embedding!.length).toBe(384);

      // Check embedding values are preserved (within floating point tolerance)
      retrieved?.embedding!.forEach((val, i) => {
        expect(val).toBeCloseTo(embedding[i], 5);
      });
    });
  });

  describe('Get Operations', () => {
    it('should retrieve entry by id', async () => {
      const entry = createTestEntry();
      await store.add(entry);

      const retrieved = await store.get(entry.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(entry.id);
    });

    it('should return null for non-existent id', async () => {
      const retrieved = await store.get('non-existent-id');
      expect(retrieved).toBeNull();
    });
  });

  describe('Update Operations', () => {
    it('should update entry fields', async () => {
      const entry = createTestEntry({ importance: 0.5 });
      await store.add(entry);

      await store.update(entry.id, {
        importance: 0.9,
        summary: 'Updated summary',
        accessCount: 10,
      });

      const updated = await store.get(entry.id);
      expect(updated!.importance).toBe(0.9);
      expect(updated?.summary).toBe('Updated summary');
      expect(updated?.accessCount).toBe(10);
    });

    it('should update embedding vector', async () => {
      const entry = createTestEntry();
      await store.add(entry);

      const newEmbedding = new Array(384).fill(0).map(() => Math.random());
      await store.update(entry.id, { embedding: newEmbedding });

      const updated = await store.get(entry.id);
      expect(updated?.embedding).toBeDefined();
      expect(updated?.embedding!.length).toBe(384);
    });
  });

  describe('Delete Operations', () => {
    it('should delete entry by id', async () => {
      const entry = createTestEntry();
      await store.add(entry);

      await store.delete(entry.id);

      const deleted = await store.get(entry.id);
      expect(deleted).toBeNull();
    });

    it('should delete entries matching filters', async () => {
      await store.addBatch([
        createTestEntry({ importance: 0.2, tier: MemoryTier.SHORT_TERM }),
        createTestEntry({ importance: 0.3, tier: MemoryTier.SHORT_TERM }),
        createTestEntry({ importance: 0.8, tier: MemoryTier.LONG_TERM }),
      ]);

      const deleted = await store.deleteWhere({
        importance: { $lt: 0.5 },
        tier: MemoryTier.SHORT_TERM,
      });

      expect(deleted).toBe(2);

      const stats = await store.getStats();
      expect(stats.total).toBe(1);
    });
  });

  describe('Search Operations', () => {
    beforeEach(async () => {
      const embeddings = [
        Array.from({ length: 384 }, () => Math.random()),
        Array.from({ length: 384 }, () => Math.random()),
        Array.from({ length: 384 }, () => Math.random()),
      ];

      await store.addBatch([
        createTestEntry({
          summary: 'Linux operating system',
          type: 'fact',
          embedding: embeddings[0],
          importance: 0.8,
        }),
        createTestEntry({
          summary: 'TypeScript language',
          type: 'preference',
          embedding: embeddings[1],
          importance: 0.7,
        }),
        createTestEntry({
          summary: 'Project milestone',
          type: 'milestone',
          embedding: embeddings[2],
          importance: 0.9,
        }),
      ]);
    });

    it('should search by embedding vector', async () => {
      const queryEmbedding = Array.from({ length: 384 }, () => Math.random());
      const results = await store.search(queryEmbedding, 5, {});

      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(3);

      results.forEach(result => {
        expect(result.entry).toBeDefined();
        expect(result.similarity).toBeGreaterThanOrEqual(-1);
        expect(result.similarity).toBeLessThanOrEqual(1);
      });
    });

    it('should filter by type', async () => {
      const queryEmbedding = Array.from({ length: 384 }, () => Math.random());
      const results = await store.search(queryEmbedding, 5, {
        types: ['milestone'],
      });

      expect(results.length).toBe(1);
      expect(results[0].entry.type).toBe('milestone');
    });

    it('should filter by tier', async () => {
      await store.add(createTestEntry({ tier: MemoryTier.LONG_TERM, importance: 0.9 }));

      const queryEmbedding = Array.from({ length: 384 }, () => Math.random());
      const results = await store.search(queryEmbedding, 10, {
        tiers: [MemoryTier.LONG_TERM],
      });

      expect(results.every(r => r.entry.tier === MemoryTier.LONG_TERM)).toBe(true);
    });

    it('should filter by minimum importance', async () => {
      const queryEmbedding = Array.from({ length: 384 }, () => Math.random());
      const results = await store.search(queryEmbedding, 10, {
        minImportance: 0.8,
      });

      expect(results.every(r => r.entry.importance >= 0.8)).toBe(true);
    });

    it('should limit results', async () => {
      const queryEmbedding = Array.from({ length: 384 }, () => Math.random());
      const results = await store.search(queryEmbedding, 2, {});

      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should sort by similarity score', async () => {
      const queryEmbedding = Array.from({ length: 384 }, () => Math.random());
      const results = await store.search(queryEmbedding, 10, {});

      for (let i = 1; i < results.length; i++) {
        const prev = results[i - 1].similarity ?? 0;
        const curr = results[i].similarity ?? 0;
        expect(prev).toBeGreaterThanOrEqual(curr);
      }
    });
  });

  describe('Statistics', () => {
    beforeEach(async () => {
      await store.addBatch([
        createTestEntry({ tier: MemoryTier.SHORT_TERM, type: 'fact', importance: 0.3 }),
        createTestEntry({
          tier: MemoryTier.SHORT_TERM,
          type: 'preference',
          importance: 0.5,
        }),
        createTestEntry({ tier: MemoryTier.MEDIUM_TERM, type: 'fact', importance: 0.7 }),
        createTestEntry({
          tier: MemoryTier.LONG_TERM,
          type: 'milestone',
          importance: 0.9,
        }),
        createTestEntry({
          tier: MemoryTier.META_MEMORY,
          type: 'milestone',
          importance: 1.0,
        }),
      ]);
    });

    it('should return total count', async () => {
      const stats = await store.getStats();
      expect(stats.total).toBe(5);
    });

    it('should group by tier', async () => {
      const stats = await store.getStats();

      expect(stats.byTier.SHORT_TERM).toBe(2);
      expect(stats.byTier.MEDIUM_TERM).toBe(1);
      expect(stats.byTier.LONG_TERM).toBe(1);
      expect(stats.byTier.META_MEMORY).toBe(1);
    });

    it('should group by type', async () => {
      const stats = await store.getStats();

      expect(stats.byType.fact).toBe(2);
      expect(stats.byType.preference).toBe(1);
      expect(stats.byType.milestone).toBe(2);
    });

    it('should group by importance', async () => {
      const stats = await store.getStats();

      // Importance thresholds: <0.4 (low), 0.4-0.7 (medium), 0.7-0.9 (high), >=0.9 (critical)
      // Test data: 0.3 (low), 0.5 (medium), 0.7 (high), 0.9 (critical), 1.0 (critical)
      expect(stats.byImportance.low).toBe(1); // 0.3
      expect(stats.byImportance.medium).toBe(1); // 0.5
      expect(stats.byImportance.high).toBe(1); // 0.7
      expect(stats.byImportance.critical).toBe(2); // 0.9, 1.0

      // Check total
      const totalImportance =
        stats.byImportance.low +
        stats.byImportance.medium +
        stats.byImportance.high +
        stats.byImportance.critical;
      expect(totalImportance).toBe(5);
    });
  });

  describe('Cleanup', () => {
    it('should execute cleanup without errors', async () => {
      await store.addBatch([createTestEntry(), createTestEntry(), createTestEntry()]);

      await expect(store.cleanup()).resolves.not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid embedding dimensions', async () => {
      const entry = createTestEntry({
        embedding: [1, 2, 3], // Wrong dimension
      });

      await store.add(entry);
      const retrieved = await store.get(entry.id);

      // Should store and retrieve even with wrong dimensions
      expect(retrieved).toBeDefined();
      expect(retrieved?.embedding!.length).toBe(3);
    });

    it('should handle null embedding', async () => {
      const entry = createTestEntry({ embedding: undefined });

      await store.add(entry);
      const retrieved = await store.get(entry.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.embedding).toBeUndefined();
    });
  });
});
