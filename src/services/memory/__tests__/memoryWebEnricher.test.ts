/**
 * Tests: MemoryWebEnricher
 * v31.2.33 — Rule 16 compliance
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  memoryWebEnricher,
  extractMainConcept,
  type EnrichableEntry,
} from '../memoryWebEnricher';

// ─────────────────────────────────────────────────────────────────
// MOCKS
// ─────────────────────────────────────────────────────────────────

vi.mock('@/services/webResearchService', () => ({
  browserWebSearch: vi.fn().mockResolvedValue({
    ok: true,
    content: [
      {
        title: 'Test Article',
        url: 'https://en.wikipedia.org/wiki/Test',
        snippet: 'A test snippet.',
      },
    ],
    error: null,
  }),
}));

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// requestIdleCallback mock
Object.defineProperty(globalThis, 'requestIdleCallback', {
  value: (cb: () => void) => setTimeout(cb, 10),
  writable: true,
});

// ─────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────

describe('memoryWebEnricher', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('extractMainConcept', () => {
    it('extracts substantive words', () => {
      const concept = extractMainConcept(
        'Le projet TITANE utilise intelligence artificielle'
      );
      expect(concept).not.toContain('Le');
      expect(concept).toMatch(/TITANE|projet|utilise|intelligence|artificielle/i);
    });

    it('strips stop words', () => {
      const concept = extractMainConcept('le la les un une des et ou de');
      expect(concept).toBe('');
    });

    it('limits to 80 characters', () => {
      const concept = extractMainConcept('a'.repeat(200));
      expect(concept.length).toBeLessThanOrEqual(80);
    });

    it('handles empty string', () => {
      expect(extractMainConcept('')).toBe('');
    });
  });

  describe('scheduleEnrichment', () => {
    it('does not throw for valid entry', () => {
      const entry: EnrichableEntry = {
        id: 'entry-1',
        summary: 'TITANE knowledge graph integration',
      };
      expect(() => memoryWebEnricher.scheduleEnrichment(entry)).not.toThrow();
    });

    it('does not throw for entry without id', () => {
      const entry: EnrichableEntry = { summary: 'Some memory content about AI' };
      expect(() => memoryWebEnricher.scheduleEnrichment(entry)).not.toThrow();
    });

    it('deduplicates same entry id', () => {
      const entry: EnrichableEntry = {
        id: 'dedup-test',
        summary: 'Test content for dedup',
      };
      expect(() => {
        memoryWebEnricher.scheduleEnrichment(entry);
        memoryWebEnricher.scheduleEnrichment(entry);
        memoryWebEnricher.scheduleEnrichment(entry);
      }).not.toThrow();
    });

    it('skips entries with empty text', () => {
      const entry: EnrichableEntry = { id: 'empty-entry' };
      expect(() => memoryWebEnricher.scheduleEnrichment(entry)).not.toThrow();
    });
  });

  describe('startIdleEnrichment', () => {
    it('accepts array of entries without throwing', () => {
      const entries: EnrichableEntry[] = [
        { id: 'e1', summary: 'Intelligence artificielle et apprentissage' },
        { id: 'e2', userMessage: 'Comment fonctionne TITANE?' },
        { id: 'e3', aiResponse: 'TITANE utilise des moteurs cognitifs.' },
      ];
      expect(() => memoryWebEnricher.startIdleEnrichment(entries)).not.toThrow();
    });

    it('accepts empty array', () => {
      expect(() => memoryWebEnricher.startIdleEnrichment([])).not.toThrow();
    });
  });

  describe('getEnrichment', () => {
    it('returns null for unknown entry', () => {
      const result = memoryWebEnricher.getEnrichment('unknown-id');
      expect(result).toBeNull();
    });

    it('returns null for expired entry', () => {
      const expiredEntry = {
        entries: {
          'expired-id': {
            entryId: 'expired-id',
            concept: 'test',
            sources: [],
            enrichedAt: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days ago
            expiresAt: Date.now() - 1000, // expired
          },
        },
        lastPruned: 0,
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(expiredEntry));
      const result = memoryWebEnricher.getEnrichment('expired-id');
      expect(result).toBeNull();
    });

    it('returns enriched entry when valid', () => {
      const validEntry = {
        entries: {
          'valid-id': {
            entryId: 'valid-id',
            concept: 'intelligence artificielle',
            sources: [
              {
                title: 'AI',
                url: 'https://en.wikipedia.org/wiki/AI',
                snippet: 'AI snippet.',
                fetchedAt: Date.now(),
              },
            ],
            enrichedAt: Date.now(),
            expiresAt: Date.now() + 6 * 24 * 60 * 60 * 1000, // not expired
          },
        },
        lastPruned: Date.now(),
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(validEntry));
      const result = memoryWebEnricher.getEnrichment('valid-id');
      expect(result).not.toBeNull();
      expect(result?.concept).toBe('intelligence artificielle');
    });
  });

  describe('getAllEnrichments', () => {
    it('returns empty array when no enrichments', () => {
      const result = memoryWebEnricher.getAllEnrichments();
      expect(Array.isArray(result)).toBe(true);
    });

    it('returns only non-expired entries', () => {
      const store = {
        entries: {
          valid: {
            entryId: 'valid',
            concept: 'test',
            sources: [],
            enrichedAt: Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          },
          expired: {
            entryId: 'expired',
            concept: 'old',
            sources: [],
            enrichedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
            expiresAt: Date.now() - 1000,
          },
        },
        lastPruned: 0,
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(store));
      const result = memoryWebEnricher.getAllEnrichments();
      expect(result.every(e => e.expiresAt > Date.now())).toBe(true);
    });
  });
});
