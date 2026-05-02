/**
 * Tests: ReflectiveVerifier (Self-RAG)
 * v31.2.33 — Rule 16 compliance
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  detectFactualClaims,
  computeConfidence,
  applyReflectiveCorrections,
  verifyCritique,
  REFLECTIVE_CONFIDENCE_THRESHOLD,
  REFLECTIVE_VERIFIER_ENABLED,
  type ReflectiveCritique,
} from '../reflectiveVerifier';

// ─────────────────────────────────────────────────────────────────
// MOCKS
// ─────────────────────────────────────────────────────────────────

vi.mock('@/services/webResearchService', () => ({
  webSearch: vi.fn().mockResolvedValue({
    ok: true,
    content: [
      {
        title: 'Wikipedia Test Article',
        url: 'https://en.wikipedia.org/wiki/Test',
        snippet: 'This is a test Wikipedia snippet about the searched topic.',
      },
    ],
    error: null,
  }),
}));

// ─────────────────────────────────────────────────────────────────
// TEST SUITE
// ─────────────────────────────────────────────────────────────────

describe('reflectiveVerifier', () => {
  describe('detectFactualClaims', () => {
    it('detects year dates', () => {
      expect(detectFactualClaims('En 2024, la France a réformé son système.')).toBe(true);
    });

    it('detects percentages', () => {
      expect(detectFactualClaims('Le taux a augmenté de 45.3%.')).toBe(true);
    });

    it('detects "selon" citations', () => {
      expect(detectFactualClaims("Selon l'OMS, cette mesure est efficace.")).toBe(true);
    });

    it('detects proper names (two capitalized words)', () => {
      expect(detectFactualClaims('Marie Curie a découvert le radium.')).toBe(true);
    });

    it('detects large numbers', () => {
      expect(detectFactualClaims('La ville compte 1 200 000 habitants.')).toBe(true);
    });

    it('detects URLs', () => {
      expect(detectFactualClaims("Voir https://example.com pour plus d'infos.")).toBe(
        true
      );
    });

    it('detects superlatives', () => {
      expect(detectFactualClaims("C'est le plus grand bâtiment du monde.")).toBe(true);
    });

    it('returns false for purely conversational response', () => {
      expect(detectFactualClaims('Je comprends ce que tu ressens.')).toBe(false);
    });

    it('returns false for simple greeting', () => {
      expect(detectFactualClaims("Bonjour! Comment puis-je t'aider?")).toBe(false);
    });
  });

  describe('computeConfidence', () => {
    it('uses singularity coherence as base', () => {
      const conf = computeConfidence('test response', false, {
        singularityCoherence: 0.8,
      });
      expect(conf).toBeGreaterThanOrEqual(0.8);
    });

    it('applies memory match bonus', () => {
      const confNoMemory = computeConfidence('test', false, {
        singularityCoherence: 0.5,
        memoryMatches: 0,
      });
      const confWithMemory = computeConfidence('test', false, {
        singularityCoherence: 0.5,
        memoryMatches: 3,
      });
      expect(confWithMemory).toBeGreaterThan(confNoMemory);
    });

    it('applies factual claims penalty without memory', () => {
      const confNoFact = computeConfidence('test', false, {
        singularityCoherence: 0.5,
        memoryMatches: 0,
      });
      const confWithFact = computeConfidence('test', true, {
        singularityCoherence: 0.5,
        memoryMatches: 0,
      });
      expect(confWithFact).toBeLessThan(confNoFact);
    });

    it('applies short response penalty with claims', () => {
      const shortResponse = 'En 2024, le PIB était de 2.5%.'; // < 100 chars, factual
      const longResponse = 'En 2024, ' + 'a'.repeat(200);
      const confShort = computeConfidence(shortResponse, true, {
        singularityCoherence: 0.6,
      });
      const confLong = computeConfidence(longResponse, true, {
        singularityCoherence: 0.6,
      });
      expect(confLong).toBeGreaterThan(confShort);
    });

    it('applies long response bonus', () => {
      const shortResponse = 'Test.';
      const longResponse = 'a'.repeat(600);
      const confShort = computeConfidence(shortResponse, false, {
        singularityCoherence: 0.5,
      });
      const confLong = computeConfidence(longResponse, false, {
        singularityCoherence: 0.5,
      });
      expect(confLong).toBeGreaterThan(confShort);
    });

    it('clamps confidence to [0, 1]', () => {
      const confHigh = computeConfidence('test', false, {
        singularityCoherence: 1.0,
        memoryMatches: 10,
      });
      const confLow = computeConfidence('short', true, {
        singularityCoherence: 0.0,
        memoryMatches: 0,
      });
      expect(confHigh).toBeLessThanOrEqual(1);
      expect(confLow).toBeGreaterThanOrEqual(0);
    });

    it('uses 0.5 as default singularityCoherence', () => {
      const conf = computeConfidence('test', false, {});
      expect(conf).toBeCloseTo(0.5, 1);
    });
  });

  describe('applyReflectiveCorrections', () => {
    const baseCritique: ReflectiveCritique = {
      confidence: 0.4,
      verified: false,
      hasFactualClaims: true,
      corrections: [],
      webSources: [
        {
          title: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Test',
          snippet: 'A test snippet with enough content.',
        },
      ],
      shouldRevise: true,
      processingMs: 10,
    };

    it('appends sources note when shouldRevise is true', () => {
      const result = applyReflectiveCorrections('Original response.', baseCritique);
      expect(result).toContain('Sources complémentaires consultées');
      expect(result).toContain('Wikipedia');
    });

    it('returns unchanged response when shouldRevise is false', () => {
      const noRevision = { ...baseCritique, shouldRevise: false };
      const result = applyReflectiveCorrections('Original response.', noRevision);
      expect(result).toBe('Original response.');
    });

    it('returns unchanged response when no webSources', () => {
      const noSources = { ...baseCritique, webSources: [] };
      const result = applyReflectiveCorrections('Original response.', noSources);
      expect(result).toBe('Original response.');
    });

    it('limits sources to 3 max', () => {
      const manySources = {
        ...baseCritique,
        webSources: Array.from({ length: 6 }, (_, i) => ({
          title: `Source ${i}`,
          url: `https://example.com/${i}`,
          snippet: 'Test snippet content here.',
        })),
      };
      const result = applyReflectiveCorrections('Response.', manySources);
      expect((result.match(/Source \d/g) || []).length).toBeLessThanOrEqual(3);
    });
  });

  describe('verifyCritique', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('returns high confidence for conversational mode (journal)', async () => {
      const critique = await verifyCritique('How are you?', 'I am doing well.', {
        mode: 'journal',
      });
      expect(critique.confidence).toBe(1.0);
      expect(critique.verified).toBe(true);
      expect(critique.hasFactualClaims).toBe(false);
      expect(critique.shouldRevise).toBe(false);
    });

    it('returns high confidence for creative mode', async () => {
      const critique = await verifyCritique('Write a poem', 'Once upon a time...', {
        mode: 'creative',
      });
      expect(critique.verified).toBe(true);
    });

    it('does not trigger web search when confidence is high', async () => {
      const { webSearch } = await import('@/services/webResearchService');
      const critique = await verifyCritique(
        'What year was it?',
        'It was a normal year.',
        { singularityCoherence: 0.9, memoryMatches: 5 }
      );
      expect(critique.verified).toBe(true);
      expect(webSearch).not.toHaveBeenCalled();
    });

    it('triggers web search when confidence is low and has factual claims', async () => {
      const { webSearch } = await import('@/services/webResearchService');
      // factual claim + low confidence
      const critique = await verifyCritique(
        'What happened in 2023?',
        'En 2023, selon le rapport, le PIB était de 45.3% plus élevé.',
        { singularityCoherence: 0.2, memoryMatches: 0 }
      );
      expect(webSearch).toHaveBeenCalled();
      expect(critique.webSources.length).toBeGreaterThan(0);
    });

    it('sets shouldRevise=true when web sources found and confidence is low', async () => {
      const critique = await verifyCritique(
        'What happened in 2023?',
        'En 2023, selon le rapport, le PIB était de 45.3% plus élevé.',
        { singularityCoherence: 0.2, memoryMatches: 0 }
      );
      expect(critique.shouldRevise).toBe(true);
    });

    it('handles web search failure gracefully (no throw)', async () => {
      const { webSearch } = await import('@/services/webResearchService');
      vi.mocked(webSearch).mockRejectedValueOnce(new Error('Network error'));

      const critique = await verifyCritique(
        'Explain 2024',
        'En 2024, selon les experts, le taux était de 30%.',
        { singularityCoherence: 0.3, memoryMatches: 0 }
      );
      expect(critique.shouldRevise).toBe(false);
      expect(critique.webSources).toHaveLength(0);
    });

    it('handles web search returning null gracefully', async () => {
      const { webSearch } = await import('@/services/webResearchService');
      vi.mocked(webSearch).mockResolvedValueOnce({
        ok: false,
        content: null,
        error: { code: 'ERR', message: 'fail' },
      });

      const critique = await verifyCritique(
        'What is X?',
        'En 2024, selon une étude, le résultat montre 80%.',
        { singularityCoherence: 0.3, memoryMatches: 0 }
      );
      expect(critique.shouldRevise).toBe(false);
    });

    it('includes processingMs in result', async () => {
      const critique = await verifyCritique('test', 'test response', {});
      expect(typeof critique.processingMs).toBe('number');
      expect(critique.processingMs).toBeGreaterThanOrEqual(0);
    });

    it('verifies exported constants', () => {
      expect(REFLECTIVE_CONFIDENCE_THRESHOLD).toBe(0.65);
      expect(REFLECTIVE_VERIFIER_ENABLED).toBe(true);
    });
  });
});
