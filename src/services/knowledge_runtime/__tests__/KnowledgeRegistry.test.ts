import { describe, expect, it } from 'vitest';
import {
  getKnowledgeRegistryCoverage,
  getKnowledgeRegistryEntries,
  getKnowledgeRegistryEntryByCategory,
  resetKnowledgeRegistryCache,
} from '@/services/knowledge_runtime/KnowledgeRegistry';

describe('KnowledgeRegistry', () => {
  it('loads a non-empty registry with indexed and synthetic coverage', async () => {
    resetKnowledgeRegistryCache();
    const entries = await getKnowledgeRegistryEntries();

    expect(entries.length).toBeGreaterThan(50);
    expect(entries.some(entry => entry.metadataOrigin === 'indexed')).toBe(true);
    expect(entries.some(entry => entry.metadataOrigin === 'synthetic')).toBe(true);
  });

  it('returns known indexed categories', async () => {
    const entry = await getKnowledgeRegistryEntryByCategory('system_architecture');

    expect(entry).not.toBeNull();
    expect(entry?.category).toBe('system_architecture');
  });

  it('synthesizes governance metadata for unindexed categories', async () => {
    const synthetic = await getKnowledgeRegistryEntryByCategory('chronobiologie_rythmes');

    expect(synthetic).not.toBeNull();
    expect(synthetic?.metadataOrigin).toBe('synthetic');
    expect(synthetic?.category).toBe('chronobiologie_rythmes');
  });

  it('reports full runtime coverage for bundled KB files', async () => {
    const coverage = await getKnowledgeRegistryCoverage();

    expect(coverage.totalFiles).toBeGreaterThan(50);
    expect(coverage.covered).toBe(coverage.totalFiles);
    expect(coverage.missing).toEqual([]);
  });
});
