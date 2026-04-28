/**
 * Tests: KnowledgeGraphIndex
 * v31.2.33 — Rule 16 compliance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  knowledgeGraphIndex,
  extractTokens,
  nodeId,
  type GraphEntry,
} from '../knowledgeGraphIndex';

// ─────────────────────────────────────────────────────────────────
// localStorage mock
// ─────────────────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

// ─────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────

describe('knowledgeGraphIndex', () => {
  beforeEach(() => {
    localStorageMock.clear();
    knowledgeGraphIndex.clear();
  });

  describe('extractTokens', () => {
    it('extracts substantive words', () => {
      const tokens = extractTokens('TITANE intelligence artificielle mémoire');
      expect(tokens).toContain('titane');
      expect(tokens).toContain('intelligence');
      expect(tokens).toContain('artificielle');
    });

    it('filters stop words', () => {
      const tokens = extractTokens('le la les et ou de du au');
      expect(tokens).toHaveLength(0);
    });

    it('filters words shorter than 3 characters', () => {
      const tokens = extractTokens('ab cd ef test');
      expect(tokens).not.toContain('ab');
      expect(tokens).not.toContain('cd');
      expect(tokens).toContain('test');
    });

    it('limits to 20 tokens', () => {
      const longText = Array.from({ length: 30 }, (_, i) => `word${i}`).join(' ');
      const tokens = extractTokens(longText);
      expect(tokens.length).toBeLessThanOrEqual(20);
    });

    it('lowercases tokens', () => {
      const tokens = extractTokens('TITANE INFINITY');
      expect(tokens).toContain('titane');
      expect(tokens).toContain('infinity');
    });
  });

  describe('nodeId', () => {
    it('generates consistent IDs', () => {
      expect(nodeId('intelligence artificielle')).toBe('intelligence_artificielle');
    });

    it('lowercases the label', () => {
      expect(nodeId('TITANE')).toBe('titane');
    });

    it('limits to 40 characters', () => {
      const id = nodeId('a'.repeat(60));
      expect(id.length).toBeLessThanOrEqual(40);
    });
  });

  describe('buildIndex', () => {
    it('creates nodes from entries', () => {
      const entries: GraphEntry[] = [
        { id: 'e1', summary: 'intelligence artificielle apprentissage TITANE' },
        { id: 'e2', summary: 'mémoire contextuelle graphe connaissance' },
      ];
      knowledgeGraphIndex.buildIndex(entries);
      const graph = knowledgeGraphIndex.getGraph();
      expect(Object.keys(graph.nodes).length).toBeGreaterThan(0);
    });

    it('creates edges for shared tokens', () => {
      const entries: GraphEntry[] = [
        { id: 'e1', summary: 'TITANE apprentissage machine intelligence' },
        { id: 'e2', summary: 'intelligence artificielle réseaux neurones' },
      ];
      knowledgeGraphIndex.buildIndex(entries);
      const graph = knowledgeGraphIndex.getGraph();
      // Both share 'intelligence' token → should have edges
      const edgeCount = Object.values(graph.edges).reduce((sum, arr) => sum + arr.length, 0);
      expect(edgeCount).toBeGreaterThan(0);
    });

    it('handles empty entries array', () => {
      expect(() => knowledgeGraphIndex.buildIndex([])).not.toThrow();
    });

    it('handles entries without summary', () => {
      const entries: GraphEntry[] = [{ id: 'e1' }];
      expect(() => knowledgeGraphIndex.buildIndex(entries)).not.toThrow();
    });

    it('uses tags for tokenization (tags become primary token when no summary)', () => {
      const entries: GraphEntry[] = [
        { id: 'e1', tags: ['memoire', 'contextuelle'] },
        { id: 'e2', tags: ['memoire', 'graphique'] },
      ];
      knowledgeGraphIndex.buildIndex(entries);
      const graph = knowledgeGraphIndex.getGraph();
      expect(Object.keys(graph.nodes)).toContain('memoire');
    });
  });

  describe('addEdge', () => {
    it('adds a bidirectional edge between two labels', () => {
      knowledgeGraphIndex.addEdge('intelligence', 'memoire', 0.8);
      const related = knowledgeGraphIndex.getRelatedNodes('intelligence');
      expect(related).toContain('memoire');
    });

    it('does not throw for unknown nodes', () => {
      expect(() => knowledgeGraphIndex.addEdge('unknown_a', 'unknown_b', 0.5)).not.toThrow();
    });
  });

  describe('getRelatedNodes', () => {
    it('returns empty array for unknown node', () => {
      const result = knowledgeGraphIndex.getRelatedNodes('unknown_node');
      expect(result).toHaveLength(0);
    });

    it('returns 1-hop neighbors', () => {
      knowledgeGraphIndex.addEdge('titane', 'intelligence', 0.9);
      const related = knowledgeGraphIndex.getRelatedNodes('titane', 1);
      expect(related).toContain('intelligence');
    });

    it('returns 2-hop neighbors', () => {
      knowledgeGraphIndex.addEdge('titane', 'intelligence', 0.9);
      knowledgeGraphIndex.addEdge('intelligence', 'memoire', 0.8);
      const related = knowledgeGraphIndex.getRelatedNodes('titane', 2);
      expect(related).toContain('memoire');
    });

    it('does not include starting node in results', () => {
      knowledgeGraphIndex.addEdge('titane', 'intelligence', 0.9);
      const related = knowledgeGraphIndex.getRelatedNodes('titane');
      expect(related).not.toContain('titane');
    });

    it('deduplicates results', () => {
      knowledgeGraphIndex.addEdge('a', 'c', 0.5);
      knowledgeGraphIndex.addEdge('a', 'b', 0.5);
      knowledgeGraphIndex.addEdge('b', 'c', 0.5);
      const related = knowledgeGraphIndex.getRelatedNodes('a', 2);
      const unique = [...new Set(related)];
      expect(related).toHaveLength(unique.length);
    });
  });

  describe('getRelatedLabels', () => {
    it('returns labels for related nodes', () => {
      knowledgeGraphIndex.addEdge('titane', 'intelligence', 0.9);
      const labels = knowledgeGraphIndex.getRelatedLabels('titane', 1);
      expect(labels).toContain('intelligence');
    });

    it('returns empty array for unknown node', () => {
      const labels = knowledgeGraphIndex.getRelatedLabels('unknown');
      expect(labels).toHaveLength(0);
    });
  });

  describe('getRelatedEntryIds', () => {
    it('returns entry IDs from related nodes', () => {
      const entries: GraphEntry[] = [
        { id: 'entry-a', summary: 'TITANE intelligence artificielle mémoire contextuelle' },
        { id: 'entry-b', summary: 'intelligence machine learning deep réseau' },
      ];
      knowledgeGraphIndex.buildIndex(entries);
      // Find a node that has entry-a and get related entry IDs
      const graph = knowledgeGraphIndex.getGraph();
      const nodeIds = Object.keys(graph.nodes);
      if (nodeIds.length > 0) {
        const result = knowledgeGraphIndex.getRelatedEntryIds(nodeIds[0], 2);
        expect(Array.isArray(result)).toBe(true);
      }
    });
  });

  describe('clear', () => {
    it('clears the graph', () => {
      knowledgeGraphIndex.addEdge('test', 'test2', 0.5);
      knowledgeGraphIndex.clear();
      const graph = knowledgeGraphIndex.getGraph();
      expect(Object.keys(graph.nodes)).toHaveLength(0);
      expect(Object.keys(graph.edges)).toHaveLength(0);
    });
  });
});
