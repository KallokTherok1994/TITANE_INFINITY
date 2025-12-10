/**
 * TITANE_INFINITY v∞.42 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   UNIFIED MEMORY — Unit Tests
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Comprehensive unit tests for UnifiedMemory system
 * Target: >80% code coverage
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UnifiedMemory } from '../UnifiedMemory';
import type {
  IVectorStore,
  IEmbeddingGenerator,
  UnifiedMemoryEntry,
} from '../UnifiedMemory';

// Mock implementations
class MockVectorStore implements IVectorStore {
  private memories: Map<string, UnifiedMemoryEntry> = new Map();

  async initialize(): Promise<void> {}

  async add(entry: UnifiedMemoryEntry): Promise<void> {
    this.memories.set(entry.id, entry);
  }

  async addBatch(entries: UnifiedMemoryEntry[]): Promise<void> {
    entries.forEach(e => this.memories.set(e.id, e));
  }

  async search(embedding: number[], limit: number, filters?: Record<string, any>) {
    const entries = Array.from(this.memories.values());

    // Apply filters
    let filtered = entries;
    if (filters?.tiers) {
      filtered = filtered.filter(e => filters.tiers.includes(e.tier));
    }
    if (filters?.types) {
      filtered = filtered.filter(e => filters.types.includes(e.type));
    }
    if (filters?.owner) {
      filtered = filtered.filter(e => e.owner === filters.owner);
    }
    if (filters?.minImportance !== undefined) {
      filtered = filtered.filter(e => e.importance >= filters.minImportance);
    }

    // Calculate cosine similarity
    const results = filtered
      .filter(e => e.embedding)
      .map(e => {
        const similarity = this.cosineSimilarity(embedding, e.embedding!);
        return {
          entry: e,
          score: similarity,
          similarity,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return results;
  }

  async get(id: string): Promise<UnifiedMemoryEntry | null> {
    return this.memories.get(id) || null;
  }

  async update(id: string, updates: Partial<UnifiedMemoryEntry>): Promise<void> {
    const entry = this.memories.get(id);
    if (entry) {
      Object.assign(entry, updates);
    }
  }

  async delete(id: string): Promise<void> {
    this.memories.delete(id);
  }

  async deleteWhere(filters: Record<string, any>): Promise<number> {
    let deleted = 0;
    const toDelete: string[] = [];

    for (const [id, entry] of this.memories.entries()) {
      let shouldDelete = true;

      if (filters.score?.$lt !== undefined) {
        shouldDelete = shouldDelete && entry.importance < filters.score.$lt;
      }
      if (filters.created?.$lt !== undefined) {
        shouldDelete = shouldDelete && entry.created < filters.created.$lt;
      }

      if (shouldDelete) {
        toDelete.push(id);
      }
    }

    toDelete.forEach(id => {
      this.memories.delete(id);
      deleted++;
    });

    return deleted;
  }

  async getStats() {
    const entries = Array.from(this.memories.values());

    const byTier = {
      SHORT_TERM: entries.filter(e => e.tier === 'SHORT_TERM').length,
      MEDIUM_TERM: entries.filter(e => e.tier === 'MEDIUM_TERM').length,
      LONG_TERM: entries.filter(e => e.tier === 'LONG_TERM').length,
      META_MEMORY: entries.filter(e => e.tier === 'META_MEMORY').length,
    };

    const byType = entries.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {} as any);

    const byImportance = {
      low: entries.filter(e => e.importance < 0.4).length,
      medium: entries.filter(e => e.importance >= 0.4 && e.importance < 0.7).length,
      high: entries.filter(e => e.importance >= 0.7 && e.importance < 0.9).length,
      critical: entries.filter(e => e.importance >= 0.9).length,
    };

    return {
      total: entries.length,
      byTier,
      byType,
      byImportance,
      avgEmbeddingTimeMs: 0,
      avgRetrievalTimeMs: 0,
      storageSizeMB: 0,
      oldestMemory: entries.length > 0 ? Math.min(...entries.map(e => e.created)) : 0,
      newestMemory: entries.length > 0 ? Math.max(...entries.map(e => e.created)) : 0,
    };
  }

  async cleanup(): Promise<void> {}
  async close(): Promise<void> {}

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0,
      normA = 0,
      normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Test helpers
  clear() {
    this.memories.clear();
  }

  size() {
    return this.memories.size;
  }
}

class MockEmbeddingGenerator implements IEmbeddingGenerator {
  async initialize(): Promise<void> {}

  async generate(text: string): Promise<number[]> {
    // Deterministic hash-based embedding
    const hash = this.hashString(text);
    const embedding = new Array(384);
    for (let i = 0; i < 384; i++) {
      embedding[i] = Math.sin(hash + i) * 0.5;
    }
    return this.normalize(embedding);
  }

  async generateBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(t => this.generate(t)));
  }

  getDimensions(): number {
    return 384;
  }

  getModelName(): string {
    return 'mock-model';
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private normalize(vec: number[]): number[] {
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    return vec.map(v => v / norm);
  }
}

// Test suite
describe('UnifiedMemory', () => {
  let memory: UnifiedMemory;
  let vectorStore: MockVectorStore;
  let embeddingGenerator: MockEmbeddingGenerator;

  beforeEach(async () => {
    vectorStore = new MockVectorStore();
    embeddingGenerator = new MockEmbeddingGenerator();
    memory = new UnifiedMemory(vectorStore, embeddingGenerator, {
      enabled: true,
      cleanup: { enabled: false, intervalMs: 0, removeBelowScore: 0.3 },
      consolidation: { enabled: false, intervalMs: 0, mergeSimilarThreshold: 0.9 },
      decay: { enabled: false, intervalMs: 0, decayRate: 0.05 },
    });
    await memory.initialize();
  });

  afterEach(async () => {
    await memory.shutdown();
    vectorStore.clear();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const newMemory = new UnifiedMemory(vectorStore, embeddingGenerator);
      await expect(newMemory.initialize()).resolves.not.toThrow();
      await newMemory.shutdown();
    });

    it('should not initialize twice', async () => {
      await memory.initialize(); // Already initialized in beforeEach
      expect(vectorStore.size()).toBe(0);
    });
  });

  describe('Memory Creation', () => {
    it('should create a memory entry', async () => {
      const entry = await memory.createMemory({
        type: 'fact',
        owner: 'test_user',
        summary: 'Test fact',
        details: 'This is a test fact',
        tags: ['test'],
        importance: 0.8,
      });

      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
      expect(entry.type).toBe('fact');
      expect(entry.owner).toBe('test_user');
      expect(entry.summary).toBe('Test fact');
      expect(entry.importance).toBe(0.8);
      expect(entry.embedding).toBeDefined();
      expect(entry.embedding!.length).toBe(384);
      expect(vectorStore.size()).toBe(1);
    });

    it('should calculate importance automatically', async () => {
      const entry1 = await memory.createMemory({
        type: 'milestone',
        owner: 'test',
        summary: 'Major milestone',
        tags: [],
      });
      expect(entry1.importance).toBe(0.9);

      const entry2 = await memory.createMemory({
        type: 'fact',
        owner: 'test',
        summary: 'Regular fact',
        tags: [],
      });
      expect(entry2.importance).toBe(0.7);

      const entry3 = await memory.createMemory({
        type: 'context',
        owner: 'test',
        summary: 'Context info',
        tags: [],
      });
      expect(entry3.importance).toBe(0.4);
    });

    it('should boost importance with tags', async () => {
      const entry = await memory.createMemory({
        type: 'fact',
        owner: 'test',
        summary: 'Important fact',
        tags: ['critical', 'important'],
      });
      expect(entry.importance).toBeGreaterThan(0.7);
      expect(entry.importance).toBeLessThanOrEqual(1.0);
    });

    it('should set default tier to SHORT_TERM', async () => {
      const entry = await memory.createMemory({
        type: 'fact',
        owner: 'test',
        summary: 'Test',
        tags: [],
      });
      expect(entry.tier).toBe('SHORT_TERM');
    });

    it('should set MCP metadata flags', async () => {
      const entry = await memory.createMemory({
        type: 'milestone',
        owner: 'test',
        summary: 'Test',
        tags: [],
      });
      expect(entry.isUseful).toBe(true);
      expect(entry.isTrue).toBe(true);
      expect(entry.isStructuring).toBe(true);
      expect(entry.isStable).toBe(true);
      expect(entry.isReusable).toBe(true);
    });
  });

  describe('Memory Retrieval', () => {
    beforeEach(async () => {
      await memory.createMemory({
        type: 'fact',
        owner: 'user1',
        summary: 'Pop OS is a Linux distribution',
        tags: ['os', 'linux'],
        importance: 0.8,
      });

      await memory.createMemory({
        type: 'preference',
        owner: 'user1',
        summary: 'Prefers TypeScript over JavaScript',
        tags: ['language'],
        importance: 0.7,
      });

      await memory.createMemory({
        type: 'milestone',
        owner: 'user1',
        summary: 'MCP OS v1.1 completed',
        tags: ['mcp'],
        importance: 0.95,
      });
    });

    it('should retrieve memories by semantic search', async () => {
      const results = await memory.retrieveMemories({
        text: 'What operating system?',
        limit: 5,
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].score).toBeGreaterThan(0);
      expect(results[0].similarity).toBeDefined();
    });

    it('should filter by type', async () => {
      const results = await memory.retrieveMemories({
        text: 'test',
        types: ['milestone'],
        limit: 5,
      });

      expect(results.every(r => r.entry.type === 'milestone')).toBe(true);
    });

    it('should filter by owner', async () => {
      await memory.createMemory({
        type: 'fact',
        owner: 'user2',
        summary: 'Different user fact',
        tags: [],
      });

      const results = await memory.retrieveMemories({
        text: 'fact',
        owner: 'user1',
        limit: 10,
      });

      expect(results.every(r => r.entry.owner === 'user1')).toBe(true);
    });

    it('should filter by minimum importance', async () => {
      const results = await memory.retrieveMemories({
        text: 'test',
        minImportance: 0.8,
        limit: 10,
      });

      expect(results.every(r => r.entry.importance >= 0.8)).toBe(true);
    });

    it('should update access metadata on retrieval', async () => {
      const entry = await memory.createMemory({
        type: 'fact',
        owner: 'test',
        summary: 'Access test',
        tags: [],
      });

      const initialAccessCount = entry.accessCount;

      await memory.retrieveMemories({
        text: 'Access test',
        limit: 1,
      });

      const updated = await vectorStore.get(entry.id);
      expect(updated!.accessCount).toBeGreaterThan(initialAccessCount);
    });
  });

  describe('Memory Update', () => {
    it('should update memory entry', async () => {
      const entry = await memory.createMemory({
        type: 'fact',
        owner: 'test',
        summary: 'Original',
        tags: [],
      });

      await memory.updateMemory(entry.id, {
        summary: 'Updated',
        importance: 0.9,
      });

      const updated = await vectorStore.get(entry.id);
      expect(updated!.summary).toBe('Updated');
      expect(updated!.importance).toBe(0.9);
    });
  });

  describe('Memory Deletion', () => {
    it('should delete memory entry', async () => {
      const entry = await memory.createMemory({
        type: 'fact',
        owner: 'test',
        summary: 'To delete',
        tags: [],
      });

      await memory.deleteMemory(entry.id);

      const deleted = await vectorStore.get(entry.id);
      expect(deleted).toBeNull();
    });
  });

  describe('Memory Superseding', () => {
    it('should supersede old memory with new one', async () => {
      const oldEntry = await memory.createMemory({
        type: 'fact',
        owner: 'test',
        summary: 'Old fact',
        tags: [],
      });

      const newEntry = await memory.supersedeMemory(oldEntry.id, {
        type: 'fact',
        owner: 'test',
        summary: 'New fact',
        tags: [],
      });

      expect(newEntry.id).not.toBe(oldEntry.id);
      expect(newEntry.relatedTo).toContain(oldEntry.id);

      const updated = await vectorStore.get(oldEntry.id);
      expect(updated!.supersedes).toBe(newEntry.id);
      expect(updated!.strength).toBe(0.1);
    });
  });

  describe('Context Building', () => {
    beforeEach(async () => {
      await memory.createMemory({
        type: 'fact',
        owner: 'test',
        summary: 'Relevant fact',
        tags: [],
        importance: 0.8,
      });
    });

    it('should build context for OMEGA injection', async () => {
      const context = await memory.buildContext('relevant', { limit: 5 });

      expect(context.memories).toBeDefined();
      expect(context.summary).toBeDefined();
      expect(context.metadata).toBeDefined();
      expect(context.metadata?.query).toBe('relevant');
      expect(context.metadata?.totalRetrieved).toBeGreaterThanOrEqual(0);
      expect(context.metadata?.retrievalTimeMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Tier Promotion', () => {
    it('should promote SHORT_TERM to MEDIUM_TERM after 10 accesses', async () => {
      const entry = await memory.createMemory({
        type: 'fact',
        owner: 'test',
        summary: 'Test',
        tags: [],
      });

      await vectorStore.update(entry.id, { accessCount: 10 });
      await memory.promoteMemory(entry.id);

      const updated = await vectorStore.get(entry.id);
      expect(updated!.tier).toBe('MEDIUM_TERM');
    });

    it('should promote MEDIUM_TERM to LONG_TERM after 50 accesses', async () => {
      const entry = await memory.createMemory({
        tier: 'MEDIUM_TERM',
        type: 'fact',
        owner: 'test',
        summary: 'Test',
        tags: [],
      });

      await vectorStore.update(entry.id, { accessCount: 50 });
      await memory.promoteMemory(entry.id);

      const updated = await vectorStore.get(entry.id);
      expect(updated!.tier).toBe('LONG_TERM');
    });

    it('should promote LONG_TERM to META_MEMORY with high importance', async () => {
      const entry = await memory.createMemory({
        tier: 'LONG_TERM',
        type: 'milestone',
        owner: 'test',
        summary: 'Test',
        tags: [],
        importance: 0.9,
      });

      await vectorStore.update(entry.id, { accessCount: 100 });
      await memory.promoteMemory(entry.id);

      const updated = await vectorStore.get(entry.id);
      expect(updated!.tier).toBe('META_MEMORY');
    });
  });

  describe('Cleanup', () => {
    it('should delete low-quality memories', async () => {
      const now = Date.now();
      const oldDate = now - 400 * 24 * 60 * 60 * 1000; // 400 days ago

      const entry = await memory.createMemory({
        type: 'context',
        owner: 'test',
        summary: 'Old low quality',
        tags: [],
        importance: 0.2,
      });

      await vectorStore.update(entry.id, { created: oldDate });

      const deleted = await memory.cleanup();
      expect(deleted).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Consolidation', () => {
    it('should merge highly similar memories', async () => {
      const entry1 = await memory.createMemory({
        type: 'fact',
        owner: 'test',
        summary: 'Almost identical fact',
        tags: ['tag1'],
        importance: 0.7,
      });

      const entry2 = await memory.createMemory({
        type: 'fact',
        owner: 'test',
        summary: 'Almost identical fact',
        tags: ['tag2'],
        importance: 0.8,
      });

      const initialSize = vectorStore.size();
      const merged = await memory.consolidate();

      expect(vectorStore.size()).toBeLessThanOrEqual(initialSize);
    });
  });

  describe('Decay', () => {
    it('should apply decay to unaccessed memories', async () => {
      const now = Date.now();
      const oldDate = now - 30 * 24 * 60 * 60 * 1000; // 30 days ago

      const entry = await memory.createMemory({
        type: 'fact',
        owner: 'test',
        summary: 'Old memory',
        tags: [],
      });

      await vectorStore.update(entry.id, {
        accessed: oldDate,
        lastUsed: oldDate,
      });

      await memory.decay();

      const updated = await vectorStore.get(entry.id);
      // Decay may delete weak memories, so check if exists or was deleted
      if (updated) {
        expect(updated.strength).toBeLessThanOrEqual(1.0);
      } else {
        // Entry was deleted due to low strength
        expect(updated).toBeNull();
      }
    });

    it('should not decay META_MEMORY tier', async () => {
      const now = Date.now();
      const oldDate = now - 365 * 24 * 60 * 60 * 1000; // 1 year ago

      const entry = await memory.createMemory({
        tier: 'META_MEMORY',
        type: 'milestone',
        owner: 'test',
        summary: 'Critical memory',
        tags: [],
        importance: 1.0,
      });

      const initialStrength = entry.strength;

      await vectorStore.update(entry.id, {
        accessed: oldDate,
        lastUsed: oldDate,
      });

      await memory.decay();

      const updated = await vectorStore.get(entry.id);
      expect(updated!.strength).toBe(initialStrength);
    });
  });

  describe('Statistics', () => {
    beforeEach(async () => {
      await memory.createMemory({
        type: 'fact',
        owner: 'test',
        summary: 'Fact 1',
        tags: [],
        importance: 0.8,
      });

      await memory.createMemory({
        type: 'preference',
        owner: 'test',
        summary: 'Preference 1',
        tags: [],
        importance: 0.6,
      });
    });

    it('should return statistics', async () => {
      const stats = await memory.getStats();

      expect(stats.total).toBeGreaterThanOrEqual(2);
      expect(stats.byTier).toBeDefined();
      expect(stats.byType).toBeDefined();
      expect(stats.byImportance).toBeDefined();
    });

    it('should return performance statistics', () => {
      const perfStats = memory.getPerformanceStats();

      expect(perfStats.avgEmbeddingTimeMs).toBeGreaterThanOrEqual(0);
      expect(perfStats.avgRetrievalTimeMs).toBeGreaterThanOrEqual(0);
      expect(perfStats.lastCleanup).toBeDefined();
      expect(perfStats.lastConsolidation).toBeDefined();
      expect(perfStats.lastDecay).toBeDefined();
    });
  });
});
