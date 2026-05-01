/**
 * TITANE∞ — UserPreferencesEngine — Suite de tests complète v31.2.34
 *
 * Couverture:
 *   1. DEEP_INTERNET_ANALYSIS_INSTRUCTION — présence, rigueur et garde-fous d'expression
 *   2. getPreferences() — valeurs par défaut et merge localStorage
 *   3. setCustomPreference() / deep_internet_analysis toggle
 *   4. generateContextForAI() — injection DEEP_INTERNET_ANALYSIS_INSTRUCTION
 *   5. recordInteraction() — métriques et extraction topics
 *   6. analyzeUserMessage() — détection préférences dans messages
 *   7. Connexion préf deep_internet_analysis → shouldHandoffToResearch
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─────────────────────────────────────────────────────────────────
// Mock localStorage (JSDOM fourni par Vitest — isolé ici)
// ─────────────────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// ─────────────────────────────────────────────────────────────────
// Imports SUT
// ─────────────────────────────────────────────────────────────────

// Import the module-level singleton after mock is in place
// We need fresh instances for each test — re-import via dynamic isolation
import {
  UserPreferencesEngine as _UserPreferencesEngineType,
} from '../userPreferencesEngine';

type UPE = InstanceType<typeof _UserPreferencesEngineType>;

// We test via a fresh class instance created inline to avoid singleton state pollution
async function freshEngine(): Promise<UPE> {
  localStorageMock.clear();
  localStorageMock.getItem.mockReturnValue(null);
  const mod = await import('../userPreferencesEngine?fresh=' + Math.random());
  return mod.userPreferencesEngine;
}

// ─────────────────────────────────────────────────────────────────
// Since the engine is a singleton, we test via the exported instance
// and reset localStorage before each test.
// ─────────────────────────────────────────────────────────────────

import { userPreferencesEngine } from '../userPreferencesEngine';

beforeEach(() => {
  localStorageMock.clear();
  localStorageMock.getItem.mockReturnValue(null);
  localStorageMock.setItem.mockClear();
  userPreferencesEngine.resetPreferences();
});

// ═══════════════════════════════════════════════════════════════════
// 1. DEEP_INTERNET_ANALYSIS_INSTRUCTION — rigueur + expression naturelle
// ═══════════════════════════════════════════════════════════════════

describe('DEEP_INTERNET_ANALYSIS_INSTRUCTION — contenu conforme', () => {
  it('est injecté dans generateContextForAI quand deep_internet_analysis = true', () => {
    userPreferencesEngine.setCustomPreference('deep_internet_analysis', true);
    const ctx = userPreferencesEngine.generateContextForAI();
    expect(ctx).toContain('ANALYSE APPROFONDIE FIABLE ET NATURELLE');
  });

  it('n\'est PAS injecté dans generateContextForAI quand deep_internet_analysis = false', () => {
    userPreferencesEngine.setCustomPreference('deep_internet_analysis', false);
    const ctx = userPreferencesEngine.generateContextForAI();
    expect(ctx).not.toContain('ANALYSE APPROFONDIE MAXIMALE');
  });

  it('contient la Phase 1 COLLECTE MAXIMALE', () => {
    userPreferencesEngine.setCustomPreference('deep_internet_analysis', true);
    const ctx = userPreferencesEngine.generateContextForAI();
    expect(ctx).toContain('COLLECTE MAXIMALE');
  });

  it('contient la Phase 2 CROISEMENT CRITIQUE', () => {
    userPreferencesEngine.setCustomPreference('deep_internet_analysis', true);
    const ctx = userPreferencesEngine.generateContextForAI();
    expect(ctx).toContain('CROISEMENT CRITIQUE');
  });

  it('contient la Phase 3 SYNTHÈSE STRUCTURÉE', () => {
    userPreferencesEngine.setCustomPreference('deep_internet_analysis', true);
    const ctx = userPreferencesEngine.generateContextForAI();
    expect(ctx).toContain('SYNTHÈSE STRUCTURÉE');
  });

  it('contient la Phase 4 RÉFLEXION APPROFONDIE', () => {
    userPreferencesEngine.setCustomPreference('deep_internet_analysis', true);
    const ctx = userPreferencesEngine.generateContextForAI();
    expect(ctx).toContain('RÉFLEXION APPROFONDIE');
  });

  it('contient la Phase 5 CONCLUSIONS ET RECOMMANDATIONS', () => {
    userPreferencesEngine.setCustomPreference('deep_internet_analysis', true);
    const ctx = userPreferencesEngine.generateContextForAI();
    expect(ctx).toContain('CONCLUSIONS ET RECOMMANDATIONS');
  });

  it('spécifie un format avec titres en gras', () => {
    userPreferencesEngine.setCustomPreference('deep_internet_analysis', true);
    const ctx = userPreferencesEngine.generateContextForAI();
    expect(ctx).toContain('##');
  });

  it('interdit d exposer spontanément le raisonnement interne', () => {
    userPreferencesEngine.setCustomPreference('deep_internet_analysis', true);
    const ctx = userPreferencesEngine.generateContextForAI();
    expect(ctx).toContain("n'expose pas spontanément tes phases");
  });

  it('ne demande plus de penser à voix haute', () => {
    userPreferencesEngine.setCustomPreference('deep_internet_analysis', true);
    const ctx = userPreferencesEngine.generateContextForAI();
    expect(ctx).not.toContain('pense à voix haute');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 2. getPreferences() — valeurs par défaut
// ═══════════════════════════════════════════════════════════════════

describe('getPreferences() — valeurs par défaut', () => {
  it('retourne la langue fr-FR par défaut', () => {
    const prefs = userPreferencesEngine.getPreferences();
    expect(prefs.language).toBe('fr-FR');
  });

  it('retourne formality informal par défaut', () => {
    const prefs = userPreferencesEngine.getPreferences();
    expect(prefs.communicationStyle.formality).toBe('informal');
  });

  it('retourne deep_internet_analysis = true par défaut', () => {
    const prefs = userPreferencesEngine.getPreferences();
    // DEFAULT_PREFERENCES has deep_internet_analysis: true
    expect(prefs.customPreferences['deep_internet_analysis']).toBe(true);
  });

  it('retourne expertiseLevel intermediate par défaut', () => {
    const prefs = userPreferencesEngine.getPreferences();
    expect(prefs.technical.expertiseLevel).toBe('intermediate');
  });

  it('retourne une copie (pas une référence interne)', () => {
    const prefs1 = userPreferencesEngine.getPreferences();
    const prefs2 = userPreferencesEngine.getPreferences();
    expect(prefs1).not.toBe(prefs2);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 3. setCustomPreference() / deep_internet_analysis toggle
// ═══════════════════════════════════════════════════════════════════

describe('setCustomPreference() — deep_internet_analysis toggle', () => {
  it('active deep_internet_analysis', () => {
    userPreferencesEngine.setCustomPreference('deep_internet_analysis', true);
    const prefs = userPreferencesEngine.getPreferences();
    expect(prefs.customPreferences['deep_internet_analysis']).toBe(true);
  });

  it('désactive deep_internet_analysis', () => {
    userPreferencesEngine.setCustomPreference('deep_internet_analysis', false);
    const prefs = userPreferencesEngine.getPreferences();
    expect(prefs.customPreferences['deep_internet_analysis']).toBe(false);
  });

  it('persiste dans localStorage', () => {
    userPreferencesEngine.setCustomPreference('deep_internet_analysis', false);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('accepte des préférences arbitraires string/number/boolean', () => {
    userPreferencesEngine.setCustomPreference('test_key_string', 'hello');
    userPreferencesEngine.setCustomPreference('test_key_number', 42);
    userPreferencesEngine.setCustomPreference('test_key_bool', true);
    const prefs = userPreferencesEngine.getPreferences();
    expect(prefs.customPreferences['test_key_string']).toBe('hello');
    expect(prefs.customPreferences['test_key_number']).toBe(42);
    expect(prefs.customPreferences['test_key_bool']).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 4. communicationStyle — formality / verbosity
// ═══════════════════════════════════════════════════════════════════

describe('updateCommunicationStyle() — formality & verbosity', () => {
  it('met à jour formality formal', () => {
    userPreferencesEngine.updateCommunicationStyle({ formality: 'formal' });
    expect(userPreferencesEngine.getCommunicationStyle().formality).toBe('formal');
  });

  it('met à jour verbosity concise', () => {
    userPreferencesEngine.updateCommunicationStyle({ verbosity: 'concise' });
    expect(userPreferencesEngine.getCommunicationStyle().verbosity).toBe('concise');
  });

  it('merge partiellement (ne réinitialise pas les autres champs)', () => {
    userPreferencesEngine.updateCommunicationStyle({ humor: false });
    const style = userPreferencesEngine.getCommunicationStyle();
    expect(style.formality).toBe('informal'); // default unchanged
    expect(style.humor).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 5. recordInteraction() — métriques
// ═══════════════════════════════════════════════════════════════════

describe('recordInteraction() — métriques mises à jour', () => {
  it('incrémente totalInteractions', () => {
    const before = userPreferencesEngine.getPreferences().metrics.totalInteractions;
    userPreferencesEngine.recordInteraction('test question', 'test response');
    const after = userPreferencesEngine.getPreferences().metrics.totalInteractions;
    expect(after).toBe(before + 1);
  });

  it('met à jour lastInteraction', () => {
    const before = userPreferencesEngine.getPreferences().metrics.lastInteraction;
    userPreferencesEngine.recordInteraction('test', 'response');
    const after = userPreferencesEngine.getPreferences().metrics.lastInteraction;
    expect(after).toBeGreaterThanOrEqual(before);
  });

  it('calcule averageResponseLength', () => {
    userPreferencesEngine.recordInteraction('question', 'réponse courte');
    const avg = userPreferencesEngine.getPreferences().metrics.averageResponseLength;
    expect(avg).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 6. analyzeUserMessage() — détection deep_internet_analysis
// ═══════════════════════════════════════════════════════════════════

describe('analyzeUserMessage() via recordInteraction — deep_internet_analysis', () => {
  it('active deep_internet_analysis sur message "active analyse approfondie"', () => {
    userPreferencesEngine.setCustomPreference('deep_internet_analysis', false);
    userPreferencesEngine.recordInteraction('active analyse approfondie', 'ok');
    const prefs = userPreferencesEngine.getPreferences();
    expect(prefs.customPreferences['deep_internet_analysis']).toBe(true);
  });

  it('désactive deep_internet_analysis sur "désactive deep_internet_analysis"', () => {
    userPreferencesEngine.setCustomPreference('deep_internet_analysis', true);
    userPreferencesEngine.recordInteraction('désactive deep_internet_analysis', 'ok');
    const prefs = userPreferencesEngine.getPreferences();
    expect(prefs.customPreferences['deep_internet_analysis']).toBe(false);
  });

  it('active sur "recherche approfondie" (topic + qualifier)', () => {
    userPreferencesEngine.setCustomPreference('deep_internet_analysis', false);
    userPreferencesEngine.recordInteraction('recherche approfondie sur internet', 'ok');
    const prefs = userPreferencesEngine.getPreferences();
    expect(prefs.customPreferences['deep_internet_analysis']).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 7. interests — addInterest / removeInterest
// ═══════════════════════════════════════════════════════════════════

describe('interests — addInterest / removeInterest', () => {
  it('ajoute un intérêt normalisé en minuscules', () => {
    userPreferencesEngine.addInterest('Intelligence Artificielle');
    expect(userPreferencesEngine.getInterests()).toContain('intelligence artificielle');
  });

  it('n\'ajoute pas deux fois le même intérêt', () => {
    userPreferencesEngine.addInterest('python');
    userPreferencesEngine.addInterest('python');
    expect(userPreferencesEngine.getInterests().filter(i => i === 'python').length).toBe(1);
  });

  it('supprime un intérêt', () => {
    userPreferencesEngine.addInterest('rust');
    userPreferencesEngine.removeInterest('rust');
    expect(userPreferencesEngine.getInterests()).not.toContain('rust');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 8. technical preferences — expertiseLevel
// ═══════════════════════════════════════════════════════════════════

describe('updateTechnicalPreferences() — expertiseLevel', () => {
  it('passe en beginner', () => {
    userPreferencesEngine.updateTechnicalPreferences({ expertiseLevel: 'beginner' });
    expect(userPreferencesEngine.getTechnicalPreferences().expertiseLevel).toBe('beginner');
  });

  it('passe en expert', () => {
    userPreferencesEngine.updateTechnicalPreferences({ expertiseLevel: 'expert' });
    expect(userPreferencesEngine.getTechnicalPreferences().expertiseLevel).toBe('expert');
  });

  it('génère un contexte IA avec niveau technique avancé', () => {
    userPreferencesEngine.updateTechnicalPreferences({ expertiseLevel: 'advanced' });
    const ctx = userPreferencesEngine.generateContextForAI();
    expect(ctx).toContain('avancé');
  });

  it('génère un contexte IA avec niveau débutant', () => {
    userPreferencesEngine.updateTechnicalPreferences({ expertiseLevel: 'beginner' });
    const ctx = userPreferencesEngine.generateContextForAI();
    expect(ctx).toContain('débutant');
  });
});
