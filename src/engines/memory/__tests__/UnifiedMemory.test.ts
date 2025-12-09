/**
 * TITANE∞ v20Ω — UnifiedMemory Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { unifiedMemory } from '../UnifiedMemoryEngine';
import { MemoryCache } from '../frontend/memoryCache';
import type { MemoryEntry } from '../types';

describe('UnifiedMemory', () => {
  describe('Store Operations', () => {
    it('should store content and return ID', async () => {
      const id = await unifiedMemory.store('Test memory content', {
        type: 'conversation',
        importance: 0.8,
      });

      expect(id).toBeDefined();
      // In mock mode, backend returns mock_* IDs
      expect(id).toMatch(/^(mem_|mock_)\d+/);
    });

    it('should store with default options', async () => {
      const id = await unifiedMemory.store('Simple content');

      expect(id).toBeDefined();
    });

    it('should store conversation messages', async () => {
      const id = await unifiedMemory.storeConversation(
        'Hello, how are you?',
        'user',
        'session-123'
      );

      expect(id).toBeDefined();
    });
  });

  describe('Recall Operations', () => {
    it('should recall by query', async () => {
      await unifiedMemory.store('Important meeting notes', { importance: 0.9 });
      await unifiedMemory.store('Grocery list', { importance: 0.3 });

      const results = await unifiedMemory.recall('meeting', { limit: 5 });

      expect(Array.isArray(results)).toBe(true);
    });

    it('should filter by type', async () => {
      await unifiedMemory.store('Knowledge item', { type: 'knowledge' });
      await unifiedMemory.store('Preference item', { type: 'preference' });

      const results = await unifiedMemory.recall('', {
        type: 'knowledge',
        limit: 10,
      });

      // All results should be knowledge type (if any returned from cache)
      results.forEach(r => {
        expect(r.type).toBe('knowledge');
      });
    });

    it('should filter by minimum importance', async () => {
      await unifiedMemory.store('Low importance', { importance: 0.2 });
      await unifiedMemory.store('High importance', { importance: 0.9 });

      const results = await unifiedMemory.recall('', {
        minImportance: 0.5,
        limit: 10,
      });

      results.forEach(r => {
        expect(r.importance).toBeGreaterThanOrEqual(0.5);
      });
    });
  });

  describe('Conversation Context', () => {
    it('should get recent conversation context', async () => {
      await unifiedMemory.storeConversation('Message 1', 'user');
      await unifiedMemory.storeConversation('Response 1', 'assistant');

      const context = await unifiedMemory.getConversationContext(10);

      expect(Array.isArray(context)).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should return memory stats', async () => {
      const stats = await unifiedMemory.getStats();

      expect(stats).toHaveProperty('stm');
      expect(stats).toHaveProperty('mtm');
      expect(stats).toHaveProperty('ltm');
      expect(stats).toHaveProperty('cache');
      expect(stats).toHaveProperty('performance');
    });

    it('should track performance metrics', async () => {
      // Perform some operations
      await unifiedMemory.store('Test 1');
      await unifiedMemory.store('Test 2');
      await unifiedMemory.recall('Test');

      const stats = await unifiedMemory.getStats();

      expect(stats.performance.totalOperations).toBeGreaterThan(0);
    });
  });

  describe('Backend Connection', () => {
    it('should report backend connection status', () => {
      // In test environment, should be disconnected (mock mode)
      const connected = unifiedMemory.isBackendConnected();
      expect(typeof connected).toBe('boolean');
    });
  });
});

describe('MemoryCache', () => {
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache(10);
  });

  it('should store and retrieve entries', () => {
    const entry: MemoryEntry = {
      id: 'test-1',
      content: 'Test content',
      type: 'conversation',
      tier: 'stm',
      importance: 0.5,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0,
      metadata: {},
    };

    const id = cache.store(entry);
    const retrieved = cache.get(id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.content).toBe('Test content');
  });

  it('should track hit rate', () => {
    const entry: MemoryEntry = {
      id: 'test-1',
      content: 'Test content',
      type: 'conversation',
      tier: 'stm',
      importance: 0.5,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0,
      metadata: {},
    };

    cache.store(entry);

    // Hit
    cache.get('test-1');
    // Miss
    cache.get('nonexistent');

    expect(cache.hitRate).toBe(0.5);
  });

  it('should evict LRU entries when at capacity', () => {
    // Fill cache to capacity
    for (let i = 0; i < 12; i++) {
      cache.store({
        id: `entry-${i}`,
        content: `Content ${i}`,
        type: 'conversation',
        tier: 'stm',
        importance: 0.5,
        timestamp: Date.now(),
        lastAccessed: Date.now() - (12 - i) * 1000, // Older entries first
        accessCount: 0,
        metadata: {},
      });
    }

    // Cache should not exceed max size
    expect(cache.size).toBeLessThanOrEqual(10);

    // Oldest entries should be evicted
    expect(cache.has('entry-0')).toBe(false);
    expect(cache.has('entry-1')).toBe(false);
  });

  it('should query by content', () => {
    cache.store({
      id: 'important-1',
      content: 'This is an important meeting',
      type: 'conversation',
      tier: 'stm',
      importance: 0.8,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0,
      metadata: {},
    });

    cache.store({
      id: 'other-1',
      content: 'Something else entirely',
      type: 'conversation',
      tier: 'stm',
      importance: 0.5,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0,
      metadata: {},
    });

    const results = cache.query('important');

    expect(results.length).toBe(1);
    expect(results[0].id).toBe('important-1');
  });

  it('should cleanup stale entries', () => {
    cache.store({
      id: 'stale-1',
      content: 'Old content',
      type: 'conversation',
      tier: 'stm',
      importance: 0.5,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0,
      metadata: {},
    });

    // Invalidate entry
    cache.invalidate('stale-1');

    // Cleanup should remove stale entries
    const removed = cache.cleanup();
    expect(removed).toBe(1);
  });

  it('should return stats', () => {
    const stats = cache.getStats();

    expect(stats).toHaveProperty('size');
    expect(stats).toHaveProperty('maxSize');
    expect(stats).toHaveProperty('hitRate');
    expect(stats).toHaveProperty('hits');
    expect(stats).toHaveProperty('misses');
  });
});
