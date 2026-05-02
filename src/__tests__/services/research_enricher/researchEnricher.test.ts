/**
 * Tests — Research Enricher service (chatResearchDetector + kbEnricher)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  isResearchQuery,
  detectResearchIntent,
  extractSearchTerms,
  buildResearchPrompt,
} from '../../../services/research_enricher/chatResearchDetector';
import {
  addRuntimeEnrichment,
  getRuntimeEnrichments,
  clearAllEnrichments,
  enrichKBFromResearch,
  mergeWithKBContext,
} from '../../../services/research_enricher/kbEnricher';

// ── Chat Research Detector ───────────────────────────────────────────────────

describe('chatResearchDetector — isResearchQuery', () => {
  it('detects FR research intent (recherche)', () => {
    expect(isResearchQuery('recherche les effets du lithium')).toBe(true);
  });

  it('detects FR analysis intent (analyse)', () => {
    expect(isResearchQuery('analyse les interactions médicamenteuses du CYP3A4')).toBe(
      true
    );
  });

  it('detects FR explanation intent (explique)', () => {
    expect(isResearchQuery('explique le syndrome sérotoninergique')).toBe(true);
  });

  it('detects FR list intent (liste)', () => {
    expect(isResearchQuery('liste les antibiotiques actifs contre le SARM')).toBe(true);
  });

  it("detects FR question intent (qu'est-ce que)", () => {
    expect(isResearchQuery("qu'est-ce que la cirrhose ?")).toBe(true);
  });

  it('detects FR comparative intent (différence entre)', () => {
    expect(isResearchQuery('quelle est la différence entre MICI et SII ?')).toBe(true);
  });

  it('detects EN research intent', () => {
    expect(isResearchQuery('what is NASH and how does it progress?')).toBe(true);
  });

  it('does not flag simple greetings', () => {
    expect(isResearchQuery('bonjour')).toBe(false);
  });

  it('does not flag very short inputs', () => {
    expect(isResearchQuery('ok')).toBe(false);
  });
});

describe('chatResearchDetector — detectResearchIntent', () => {
  it('returns intent=search for recherche query', () => {
    const result = detectResearchIntent('recherche les mécanismes du SIBO');
    expect(result.isResearch).toBe(true);
    expect(result.intent).toBe('search');
  });

  it('returns intent=comparison for comparison query', () => {
    const result = detectResearchIntent('compare Crohn vs rectocolite hémorragique');
    expect(result.isResearch).toBe(true);
    expect(result.intent).toBe('comparison');
  });

  it('returns confidence >= 0.7 for clear research queries', () => {
    const result = detectResearchIntent('explique la pharmacocinétique ADME');
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it('returns isResearch=false and intent=none for unrelated message', () => {
    const result = detectResearchIntent('bonjour comment vas-tu');
    expect(result.isResearch).toBe(false);
    expect(result.intent).toBe('none');
  });

  it('returns extractedTerms as array', () => {
    const result = detectResearchIntent('analyse le traitement du VHC avec sofosbuvir');
    expect(Array.isArray(result.extractedTerms)).toBe(true);
  });
});

describe('chatResearchDetector — extractSearchTerms', () => {
  it('removes common stop words', () => {
    const terms = extractSearchTerms('quels sont les effets du lithium sur le rein ?');
    expect(terms).not.toContain('les');
    expect(terms).not.toContain('sur');
    expect(terms).not.toContain('du');
  });

  it('extracts meaningful medical terms', () => {
    const terms = extractSearchTerms('traitement de la cirrhose avec terlipressine');
    expect(terms).toContain('cirrhose');
    expect(terms).toContain('terlipressine');
  });

  it('deduplicates terms', () => {
    const terms = extractSearchTerms('pharmacologie pharmacologie ADME pharmacologie');
    const unique = new Set(terms);
    expect(unique.size).toBe(terms.length);
  });

  it('returns empty array for empty input', () => {
    expect(extractSearchTerms('')).toEqual([]);
  });
});

describe('chatResearchDetector — buildResearchPrompt', () => {
  it('includes KB context when provided', () => {
    const prompt = buildResearchPrompt('question', 'context KB', undefined);
    expect(prompt).toContain('context KB');
    expect(prompt).toContain('question');
  });

  it('includes web results section when provided', () => {
    const prompt = buildResearchPrompt('question', 'kb context', 'web results data');
    expect(prompt).toContain('web results data');
  });

  it('returns the raw message when no context is provided', () => {
    const prompt = buildResearchPrompt('simple question', '', undefined);
    expect(prompt).toBe('simple question');
  });
});

// ── KB Enricher ──────────────────────────────────────────────────────────────

describe('kbEnricher — addRuntimeEnrichment + getRuntimeEnrichments', () => {
  beforeEach(() => {
    clearAllEnrichments();
  });

  it('stores an enrichment and retrieves it', () => {
    addRuntimeEnrichment({
      query: 'hépatite C sofosbuvir',
      timestamp: Date.now(),
      summary: 'Traitement AAD sofosbuvir/velpatasvir 12 semaines >95% guérison',
      categories: ['gastroenterologie_hepatologie'],
      confidence: 0.9,
      source: 'web',
    });

    const enrichments = getRuntimeEnrichments();
    expect(enrichments.length).toBe(1);
    expect(enrichments[0].query).toBe('hépatite C sofosbuvir');
  });

  it('returns empty array when nothing stored', () => {
    expect(getRuntimeEnrichments()).toEqual([]);
  });

  it('generates a unique id for each enrichment', () => {
    addRuntimeEnrichment({
      query: 'q1',
      timestamp: Date.now(),
      summary: 's1',
      categories: [],
      confidence: 0.8,
      source: 'web',
    });
    addRuntimeEnrichment({
      query: 'q2',
      timestamp: Date.now(),
      summary: 's2',
      categories: [],
      confidence: 0.8,
      source: 'web',
    });

    const enrichments = getRuntimeEnrichments();
    expect(enrichments.length).toBe(2);
    expect(enrichments[0].id).not.toBe(enrichments[1].id);
  });

  it('limits stored enrichments to 10', () => {
    for (let i = 0; i < 15; i++) {
      addRuntimeEnrichment({
        query: `query ${i}`,
        timestamp: Date.now(),
        summary: `summary ${i}`,
        categories: [],
        confidence: 0.7,
        source: 'web',
      });
    }
    const enrichments = getRuntimeEnrichments();
    expect(enrichments.length).toBeLessThanOrEqual(10);
  });
});

describe('kbEnricher — enrichKBFromResearch', () => {
  beforeEach(() => {
    clearAllEnrichments();
  });

  it('creates enrichment from query and results', () => {
    const enrichment = enrichKBFromResearch(
      'pharmacologie clinique',
      'Résultats: ADME, CYP450, interactions médicamenteuses',
      ['pharmacologie_clinique_avancee'],
      0.85
    );

    expect(enrichment.id).toBeTruthy();
    expect(enrichment.query).toBe('pharmacologie clinique');
    expect(enrichment.source).toBe('web');
    expect(enrichment.confidence).toBe(0.85);
  });

  it('truncates long summaries to 500 chars', () => {
    const longResults = 'x'.repeat(1000);
    const enrichment = enrichKBFromResearch('test', longResults);
    expect(enrichment.summary.length).toBeLessThanOrEqual(500);
  });
});

describe('kbEnricher — mergeWithKBContext', () => {
  it('returns original context when no enrichments', () => {
    const merged = mergeWithKBContext('original context', [], 'query');
    expect(merged).toBe('original context');
  });

  it('appends relevant enrichments to KB context', () => {
    const enrichment = {
      id: 'test-id',
      query: 'cirrhose traitement',
      timestamp: Date.now(),
      summary: 'Terlipressine + albumine pour syndrome hépatorénal',
      categories: ['gastroenterologie_hepatologie'],
      confidence: 0.9,
      source: 'web' as const,
    };

    const merged = mergeWithKBContext('contexte KB original', [enrichment], 'cirrhose');

    expect(merged).toContain('contexte KB original');
    expect(merged).toContain('Terlipressine');
  });

  it('does not include unrelated enrichments', () => {
    const enrichment = {
      id: 'test-id',
      query: 'yoga méditation',
      timestamp: Date.now(),
      summary: 'Postures de yoga pour la souplesse',
      categories: ['yoga'],
      confidence: 0.8,
      source: 'web' as const,
    };

    const merged = mergeWithKBContext(
      'contexte KB médical',
      [enrichment],
      'pharmacologie interactions médicamenteuses'
    );

    // Unrelated enrichment should not appear
    expect(merged).not.toContain('Postures de yoga');
  });
});
