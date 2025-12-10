/**
 * TITANE_INFINITY v∞.42 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   UNIFIED MEMORY — Integration Tests (Vitest)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createUnifiedMemory } from './index';
import type { UnifiedMemory } from './UnifiedMemory';
import * as fs from 'fs';

describe.skip('Unified Memory Integration', () => {
  const TEST_DB_PATH = './data/test_unified_memory_vitest.db';
  let memory: UnifiedMemory | undefined;

  const cleanupTestDb = () => {
    const paths = [TEST_DB_PATH, TEST_DB_PATH + '-wal', TEST_DB_PATH + '-shm'];
    paths.forEach(p => {
      if (fs.existsSync(p)) {
        try {
          fs.unlinkSync(p);
        } catch {
          /* ignore */
        }
      }
    });
  };

  beforeAll(async () => {
    cleanupTestDb();
    memory = await createUnifiedMemory({
      dbPath: TEST_DB_PATH,
      modelName: 'all-MiniLM-L6-v2',
      enableCache: true,
    });
  });

  afterAll(async () => {
    if (memory) {
      await memory.shutdown();
    }
    cleanupTestDb();
  });

  it('should initialize successfully', () => {
    expect(memory).toBeDefined();
  });

  it('should create memories', async () => {
    expect(memory).toBeDefined();
    if (!memory) return;

    const entry = await memory.createMemory({
      type: 'fact',
      owner: 'test_user',
      summary: 'Test fact',
      details: 'This is a test',
      tags: ['test'],
      importance: 0.8,
    });

    expect(entry).toBeDefined();
    expect(entry.id).toBeDefined();
  });

  it('should retrieve memories semantically', async () => {
    expect(memory).toBeDefined();
    if (!memory) return;

    // Create test memory
    await memory.createMemory({
      type: 'fact',
      owner: 'test_user',
      summary: 'Test retrieval',
      details: 'Semantic search test',
      tags: ['search'],
      importance: 0.7,
    });

    // Search
    const results = await memory.retrieveMemories({
      text: 'test retrieval',
      limit: 5,
    });

    expect(Array.isArray(results)).toBe(true);
  });

  it('should build context', async () => {
    expect(memory).toBeDefined();
    if (!memory) return;

    const context = await memory.buildContext('test context', {
      limit: 3,
    });

    expect(context).toBeDefined();
    expect(context.memories).toBeDefined();
  });

  it('should get statistics', async () => {
    expect(memory).toBeDefined();
    if (!memory) return;

    const stats = await memory.getStats();

    expect(stats).toBeDefined();
    expect(typeof stats.total).toBe('number');
  });
});
