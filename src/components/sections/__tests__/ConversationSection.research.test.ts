/**
 * TITANE∞ — ConversationSection — Research functions unit tests v31.2.34
 *
 * Couverture:
 *   1. shouldHandoffToResearch()  — déclenchement web research, patterns, préférences
 *   2. buildResearchHandoff()     — construction payload {q, mode, target_url, seed_urls}
 *   3. classifyResearchOutcome()  — classification 'blocked' | 'limited' | 'pass'
 *   4. buildResearchReply()       — construction texte réponse assistante par outcome
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─────────────────────────────────────────────────────────────────
// Mock userPreferencesEngine — contrôle de deep_internet_analysis
// ─────────────────────────────────────────────────────────────────

const mockGetPreferences = vi.fn();

vi.mock('@/services/userPreferencesEngine', () => ({
  userPreferencesEngine: {
    getPreferences: () => mockGetPreferences(),
  },
}));

// ─────────────────────────────────────────────────────────────────
// Imports SUT (après mocks)
// ─────────────────────────────────────────────────────────────────

import type { ResearchReport } from '@/types/research';
import {
  shouldHandoffToResearch,
  buildResearchHandoff,
  classifyResearchOutcome,
  buildResearchReply,
} from '../ConversationSection';

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function prefsWithDeep(deep: boolean): ReturnType<typeof mockGetPreferences> {
  return {
    language: 'fr-FR',
    communicationStyle: { formality: 'informal', verbosity: 'balanced', humor: true, emojis: true },
    interests: [],
    topicsHistory: [],
    technical: { preferredLanguages: [], expertiseLevel: 'intermediate', preferCodeComments: true, preferExamples: true },
    audio: { voiceEnabled: true, preferredVoice: 'fr_FR-siwis-medium', preferredSpeed: 1.0 },
    metrics: {
      totalInteractions: 0, positiveReactions: 0, negativeReactions: 0,
      averageResponseLength: 0, lastInteraction: Date.now(), createdAt: Date.now(), updatedAt: Date.now(),
    },
    customPreferences: { deep_internet_analysis: deep },
  };
}

function makeReport(overrides: Partial<ResearchReport> = {}): ResearchReport {
  return {
    answer: {
      answer: 'Réponse de test',
      citations: [],
      limitations: [],
      trace_id: 'trace-test',
      sources_count: 0,
      retrieved_passages_count: 0,
      ...(overrides.answer ?? {}),
    },
    trace: {
      trace_id: 'trace-test',
      markers: [],
      errors: [],
      ...(overrides.trace ?? {}),
    },
    ...overrides,
  };
}

function makeCitation(overrides: Record<string, unknown> = {}) {
  return {
    url: 'https://fr.wikipedia.org/wiki/Test',
    title: 'Article Test',
    excerpt: 'Un extrait de test suffisamment long pour être pertinent.',
    accessed_at: new Date().toISOString(),
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════
// 1. shouldHandoffToResearch()
// ═══════════════════════════════════════════════════════════════════

describe('shouldHandoffToResearch() — patterns classiques', () => {
  beforeEach(() => {
    mockGetPreferences.mockReturnValue(prefsWithDeep(false));
  });

  it('déclenche pour "recherche sur internet"', () => {
    expect(shouldHandoffToResearch('Recherche sur internet les actualités IA')).toBe(true);
  });

  it('déclenche pour "chercher sur le web"', () => {
    expect(shouldHandoffToResearch('Peux-tu chercher sur le web les dernières infos ?')).toBe(true);
  });

  it('déclenche pour "search online"', () => {
    expect(shouldHandoffToResearch('search online for quantum computing news')).toBe(true);
  });

  it('déclenche pour "look up on the web"', () => {
    expect(shouldHandoffToResearch('look up on the web the latest AI models')).toBe(true);
  });

  it('ne déclenche PAS pour une question générale sans recherche/web', () => {
    expect(shouldHandoffToResearch('Explique-moi comment fonctionne le machine learning')).toBe(false);
  });

  it('ne déclenche PAS pour une phrase avec "recherche" sans cible web', () => {
    expect(shouldHandoffToResearch('Mes recherches en cours portent sur les algorithmes')).toBe(false);
  });

  it('ne déclenche PAS pour une phrase avec "web" sans verbe recherche', () => {
    expect(shouldHandoffToResearch('Le web est un réseau mondial')).toBe(false);
  });

  it('ne déclenche PAS pour un message vide', () => {
    expect(shouldHandoffToResearch('')).toBe(false);
  });

  it('est insensible à la casse', () => {
    expect(shouldHandoffToResearch('RECHERCHE SUR INTERNET')).toBe(true);
  });
});

describe('shouldHandoffToResearch() — deep_internet_analysis activé', () => {
  beforeEach(() => {
    mockGetPreferences.mockReturnValue(prefsWithDeep(true));
  });

  it('déclenche pour "actualité" avec préf deep active', () => {
    expect(shouldHandoffToResearch('Quelles sont les actualités sur TITANE ?')).toBe(true);
  });

  it('déclenche pour "dernières nouvelles" avec préf deep active', () => {
    expect(shouldHandoffToResearch('Donne-moi les dernières nouvelles sur les LLM')).toBe(true);
  });

  it('déclenche pour "informations récentes" avec préf deep active', () => {
    expect(shouldHandoffToResearch('Je veux les informations récentes sur GPT-5')).toBe(true);
  });

  it('déclenche pour "tendances actuelles" avec préf deep active', () => {
    expect(shouldHandoffToResearch('Quelles sont les tendances actuelles du marché ?')).toBe(true);
  });

  it('déclenche pour URL http dans le message', () => {
    expect(shouldHandoffToResearch('Analyse ce site https://fr.wikipedia.org/wiki/IA')).toBe(true);
  });

  it('déclenche pour "cherche ... sur" avec préf deep active', () => {
    expect(shouldHandoffToResearch('cherche sur les dernières publications académiques')).toBe(true);
  });

  it('ne déclenche PAS pour question générale même avec préf deep active', () => {
    expect(shouldHandoffToResearch('Comment s\'appelle le président de la France ?')).toBe(false);
  });

  it('continue à déclencher pour pattern classique recherche+web', () => {
    expect(shouldHandoffToResearch('recherche sur internet les actualités')).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 2. buildResearchHandoff()
// ═══════════════════════════════════════════════════════════════════

describe('buildResearchHandoff() — structure payload', () => {
  it('retourne mode WEB_LIVE', () => {
    const result = buildResearchHandoff('recherche sur internet les LLM');
    expect(result.mode).toBe('WEB_LIVE');
  });

  it('retourne un topic q non vide', () => {
    const result = buildResearchHandoff('recherche sur internet les modèles de langage');
    expect(result.q.trim().length).toBeGreaterThan(0);
  });

  it('retourne des seed_urls Wikipedia FR', () => {
    const result = buildResearchHandoff('recherche sur internet l\'intelligence artificielle');
    expect(result.seed_urls.length).toBeGreaterThanOrEqual(1);
    expect(result.seed_urls[0]).toContain('wikipedia.org');
  });

  it('retourne target_url égal au premier seed_url', () => {
    const result = buildResearchHandoff('recherche sur internet Python');
    expect(result.target_url).toBe(result.seed_urls[0]);
  });

  it('extrait une URL détectée dans le message comme target', () => {
    const url = 'https://example.com/article';
    const result = buildResearchHandoff(`Analyse cette page ${url}`);
    expect(result.target_url).toBe(url);
    expect(result.seed_urls).toContain(url);
  });

  it('nettoie les ponctuation en fin d\'URL détectée', () => {
    const result = buildResearchHandoff('Regarde https://example.com/article.');
    expect(result.target_url).not.toMatch(/\.$/);
  });

  it('génère 4 seed_urls (wikipedia, recherche, wiktionnaire, wikidata) sans URL détectée', () => {
    const result = buildResearchHandoff('recherche sur internet les algorithmes');
    expect(result.seed_urls.length).toBe(4);
  });

  it('génère un slug valide pour target_url (pas d\'espaces)', () => {
    const result = buildResearchHandoff('recherche sur internet machine learning');
    expect(result.target_url).not.toContain(' ');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 3. classifyResearchOutcome()
// ═══════════════════════════════════════════════════════════════════

describe('classifyResearchOutcome() — blocked', () => {
  it('retourne "blocked" pour marker VERDICT_BLOCKED', () => {
    const report = makeReport({ trace: { trace_id: 'x', markers: ['VERDICT_BLOCKED'], errors: [] } });
    expect(classifyResearchOutcome(report)).toBe('blocked');
  });

  it('VERDICT_BLOCKED prime sur les citations présentes', () => {
    const report = makeReport({
      answer: { answer: 'ok', citations: [makeCitation()], limitations: [], trace_id: 'x', sources_count: 1, retrieved_passages_count: 1 },
      trace: { trace_id: 'x', markers: ['VERDICT_BLOCKED'], errors: [] },
    });
    expect(classifyResearchOutcome(report)).toBe('blocked');
  });
});

describe('classifyResearchOutcome() — limited', () => {
  it('retourne "limited" quand citations = 0', () => {
    const report = makeReport();
    expect(classifyResearchOutcome(report)).toBe('limited');
  });

  it('retourne "limited" quand réponse contient "no generative model used"', () => {
    const report = makeReport({
      answer: { answer: 'no generative model used', citations: [makeCitation()], limitations: [], trace_id: 'x', sources_count: 1, retrieved_passages_count: 1 },
    });
    expect(classifyResearchOutcome(report)).toBe('limited');
  });

  it('retourne "limited" quand réponse contient "robot policy"', () => {
    const report = makeReport({
      answer: { answer: 'robot policy blocks this', citations: [makeCitation()], limitations: [], trace_id: 'x', sources_count: 1, retrieved_passages_count: 1 },
    });
    expect(classifyResearchOutcome(report)).toBe('limited');
  });

  it('retourne "limited" quand sources_count=1 et retrieved_passages_count=1', () => {
    const report = makeReport({
      answer: { answer: 'Une réponse normale', citations: [makeCitation()], limitations: [], trace_id: 'x', sources_count: 1, retrieved_passages_count: 1 },
    });
    expect(classifyResearchOutcome(report)).toBe('limited');
  });

  it('retourne "limited" quand 3+ limitations et < 2 citations', () => {
    const report = makeReport({
      answer: {
        answer: 'Réponse partielle',
        citations: [makeCitation()],
        limitations: ['l1', 'l2', 'l3'],
        trace_id: 'x',
        sources_count: 2,
        retrieved_passages_count: 2,
      },
    });
    expect(classifyResearchOutcome(report)).toBe('limited');
  });
});

describe('classifyResearchOutcome() — pass', () => {
  it('retourne "pass" avec 2 citations et sources_count >= 2', () => {
    const report = makeReport({
      answer: {
        answer: 'Bonne synthèse',
        citations: [makeCitation(), makeCitation({ url: 'https://fr.wikipedia.org/wiki/Autre' })],
        limitations: [],
        trace_id: 'x',
        sources_count: 2,
        retrieved_passages_count: 3,
      },
    });
    expect(classifyResearchOutcome(report)).toBe('pass');
  });

  it('retourne "pass" avec 3 citations et aucune limitation critique', () => {
    const citations = [makeCitation(), makeCitation({ url: 'https://a.com' }), makeCitation({ url: 'https://b.com' })];
    const report = makeReport({
      answer: { answer: 'Excellente synthèse', citations, limitations: ['légère'], trace_id: 'x', sources_count: 3, retrieved_passages_count: 4 },
    });
    expect(classifyResearchOutcome(report)).toBe('pass');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 4. buildResearchReply()
// ═══════════════════════════════════════════════════════════════════

describe('buildResearchReply() — blocked', () => {
  it('contient un titre avec "bloquée"', () => {
    const report = makeReport({ trace: { trace_id: 'x', markers: ['VERDICT_BLOCKED', 'ROBOTS_BLOCKED'], errors: [] } });
    const reply = buildResearchReply(report, 'blocked');
    expect(reply).toContain('bloquée');
  });

  it('contient la cause de blocage ROBOTS_BLOCKED', () => {
    const report = makeReport({ trace: { trace_id: 'x', markers: ['VERDICT_BLOCKED', 'ROBOTS_BLOCKED'], errors: [] } });
    const reply = buildResearchReply(report, 'blocked');
    expect(reply).toContain('ROBOTS_BLOCKED');
  });

  it('ne contient pas de citations quand aucune n\'est disponible', () => {
    const report = makeReport({ trace: { trace_id: 'x', markers: ['VERDICT_BLOCKED'], errors: [] } });
    const reply = buildResearchReply(report, 'blocked');
    expect(reply).toContain('Aucune source exploitable');
  });
});

describe('buildResearchReply() — limited', () => {
  it('contient "analyse partielle" dans le titre', () => {
    const report = makeReport({ trace: { trace_id: 'x', markers: ['VERDICT_UNKNOWN'], errors: [] } });
    const reply = buildResearchReply(report, 'limited');
    expect(reply).toContain('analyse partielle');
  });

  it('liste les citations disponibles', () => {
    const report = makeReport({
      answer: {
        answer: 'Synthèse partielle',
        citations: [makeCitation({ title: 'Article Wikipedia' })],
        limitations: [],
        trace_id: 'x',
        sources_count: 1,
        retrieved_passages_count: 1,
      },
      trace: { trace_id: 'x', markers: ['VERDICT_PARTIAL'], errors: [] },
    });
    const reply = buildResearchReply(report, 'limited');
    expect(reply).toContain('Article Wikipedia');
  });

  it('affiche le count de sources', () => {
    const report = makeReport({
      answer: {
        answer: 'Synthèse',
        citations: [makeCitation()],
        limitations: [],
        trace_id: 'x',
        sources_count: 1,
        retrieved_passages_count: 1,
      },
      trace: { trace_id: 'x', markers: [], errors: [] },
    });
    const reply = buildResearchReply(report, 'limited');
    expect(reply).toContain('Sources utilisables');
  });
});

describe('buildResearchReply() — pass', () => {
  it('contient le titre de recherche sans "bloquée" ni "partielle"', () => {
    const citations = [
      makeCitation({ title: 'Intelligence Artificielle', url: 'https://fr.wikipedia.org/wiki/IA' }),
      makeCitation({ title: 'Machine Learning', url: 'https://fr.wikipedia.org/wiki/ML' }),
    ];
    const report = makeReport({
      answer: {
        answer: 'L\'intelligence artificielle est un domaine vaste.',
        citations,
        limitations: [],
        trace_id: 'x',
        sources_count: 2,
        retrieved_passages_count: 3,
      },
      trace: { trace_id: 'x', markers: ['VERDICT_PASS'], errors: [] },
    });
    const reply = buildResearchReply(report, 'pass');
    expect(reply).not.toContain('bloquée');
    expect(reply).not.toContain('analyse partielle');
    expect(reply.length).toBeGreaterThan(50);
  });

  it('inclut les URLs de citations dans le reply', () => {
    const citations = [
      makeCitation({ title: 'Article A', url: 'https://fr.wikipedia.org/wiki/A' }),
      makeCitation({ title: 'Article B', url: 'https://fr.wikipedia.org/wiki/B' }),
    ];
    const report = makeReport({
      answer: {
        answer: 'Bonne synthèse complète.',
        citations,
        limitations: [],
        trace_id: 'x',
        sources_count: 2,
        retrieved_passages_count: 2,
      },
      trace: { trace_id: 'x', markers: ['VERDICT_PASS'], errors: [] },
    });
    const reply = buildResearchReply(report, 'pass');
    expect(reply).toContain('https://fr.wikipedia.org/wiki/A');
  });
});
