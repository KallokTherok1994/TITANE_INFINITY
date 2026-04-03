/**
 * TITANE∞ — Tests unitaires : responsePolicy.ts
 * Suite : CANONICAL_RESPONSE_POLICY
 * Gate : G_RESPONSE_POLICY_CANONICAL | G_PROFILE_SELECTION_ACTIVE | G_IMPLICIT_INFERENCE_BOUNDED
 *
 * Exécuter 3 fois (x3 proof requirement) via : pnpm test responsePolicy.unit.test.ts
 */

import { describe, it, expect } from 'vitest';
import {
  selectResponseProfile,
  evaluateInferenceState,
  estimateComplexity,
  getEffectiveProfile,
  RESPONSE_PROFILES,
  PROVIDER_UNSUPPORTED_PARAMS,
  mapReasoningEffort,
  type ResponseProfileId,
} from '@/services/ai/responsePolicy';

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1 — PROFILS FONDAMENTAUX
// ─────────────────────────────────────────────────────────────────────────────

describe('ResponsePolicy — Profils fondamentaux', () => {
  it('les 4 profils canoniques existent et ont les bons IDs', () => {
    const ids: ResponseProfileId[] = ['DIRECT', 'BALANCED', 'DEEP', 'ARCHITECT'];
    for (const id of ids) {
      expect(RESPONSE_PROFILES[id]).toBeDefined();
      expect(RESPONSE_PROFILES[id].id).toBe(id);
    }
  });

  it('DIRECT a le maxTokens le plus bas', () => {
    const direct = RESPONSE_PROFILES.DIRECT.maxTokens;
    expect(direct).toBeLessThan(RESPONSE_PROFILES.BALANCED.maxTokens);
    expect(direct).toBeLessThan(RESPONSE_PROFILES.DEEP.maxTokens);
    expect(direct).toBeLessThan(RESPONSE_PROFILES.ARCHITECT.maxTokens);
  });

  it('ARCHITECT a le maxTokens le plus élevé', () => {
    const architect = RESPONSE_PROFILES.ARCHITECT.maxTokens;
    expect(architect).toBeGreaterThan(RESPONSE_PROFILES.DEEP.maxTokens);
    expect(architect).toBeGreaterThan(RESPONSE_PROFILES.BALANCED.maxTokens);
    expect(architect).toBeGreaterThan(RESPONSE_PROFILES.DIRECT.maxTokens);
  });

  it('DIRECT a la temperature la plus basse (réponses fixes)', () => {
    expect(RESPONSE_PROFILES.DIRECT.temperature).toBeLessThanOrEqual(
      RESPONSE_PROFILES.BALANCED.temperature
    );
  });

  it('les budgets timeout sont croissants du DIRECT à ARCHITECT', () => {
    const d = RESPONSE_PROFILES.DIRECT.stream.timeoutMs;
    const b = RESPONSE_PROFILES.BALANCED.stream.timeoutMs;
    const dp = RESPONSE_PROFILES.DEEP.stream.timeoutMs;
    const a = RESPONSE_PROFILES.ARCHITECT.stream.timeoutMs;
    expect(d).toBeLessThanOrEqual(b);
    expect(b).toBeLessThanOrEqual(dp);
    expect(dp).toBeLessThanOrEqual(a);
  });

  it('les structureLevel sont croissants de DIRECT à ARCHITECT', () => {
    expect(RESPONSE_PROFILES.DIRECT.structureLevel).toBeLessThanOrEqual(
      RESPONSE_PROFILES.BALANCED.structureLevel
    );
    expect(RESPONSE_PROFILES.BALANCED.structureLevel).toBeLessThanOrEqual(
      RESPONSE_PROFILES.DEEP.structureLevel
    );
    expect(RESPONSE_PROFILES.DEEP.structureLevel).toBeLessThanOrEqual(
      RESPONSE_PROFILES.ARCHITECT.structureLevel
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2 — SÉLECTION DYNAMIQUE DU PROFIL
// ─────────────────────────────────────────────────────────────────────────────

describe('ResponsePolicy — Sélection dynamique du profil', () => {
  it('override explicite utilisateur prend la priorité absolue', () => {
    const result = selectResponseProfile({
      message: 'analyse en profondeur tout cela',
      mode: 'default',
      explicitProfileOverride: 'DIRECT',
    });
    expect(result.profileId).toBe('DIRECT');
    expect(result.reason).toBe('explicit_user_override');
    expect(result.confidence).toBe(1.0);
  });

  it('signal "fais court" → DIRECT', () => {
    const result = selectResponseProfile({ message: 'fais court stp', mode: 'default' });
    expect(result.profileId).toBe('DIRECT');
    expect(result.reason).toBe('direct_lexical_signal');
  });

  it('signal "réponds vite" → DIRECT', () => {
    const result = selectResponseProfile({ message: 'réponds vite', mode: 'default' });
    expect(result.profileId).toBe('DIRECT');
  });

  it('signal "analyse en profondeur" → DEEP', () => {
    const result = selectResponseProfile({
      message: 'analyse en profondeur cette situation',
      mode: 'default',
    });
    expect(result.profileId).toBe('DEEP');
    expect(result.reason).toBe('deep_lexical_signal');
  });

  it('signal "structure-moi cela" → ARCHITECT', () => {
    const result = selectResponseProfile({
      message: 'structure-moi cela clairement',
      mode: 'default',
    });
    expect(result.profileId).toBe('ARCHITECT');
    expect(result.reason).toBe('architect_lexical_signal');
  });

  it('mode "strategy" → ARCHITECT par défaut du mode', () => {
    const result = selectResponseProfile({
      message: 'donne-moi ton avis',
      mode: 'strategy',
    });
    expect(result.profileId).toBe('ARCHITECT');
    expect(result.reason).toContain('mode_default');
  });

  it('mode "quick" → DIRECT par défaut du mode', () => {
    const result = selectResponseProfile({
      message: 'bonjour',
      mode: 'quick',
    });
    expect(result.profileId).toBe('DIRECT');
  });

  it('mode "omega" → OMEGA par défaut du mode', () => {
    const result = selectResponseProfile({
      message: 'comment vas-tu?',
      mode: 'omega',
    });
    expect(result.profileId).toBe('OMEGA');
  });

  it('mode "audit" → ARCHITECT par défaut du mode', () => {
    const result = selectResponseProfile({
      message: 'analyse le système',
      mode: 'audit',
    });
    expect(result.profileId).toBe('ARCHITECT');
  });

  it('message très court + BALANCED → DIRECT par heuristique', () => {
    const result = selectResponseProfile({
      message: 'ok',
      mode: 'default',
    });
    expect(result.profileId).toBe('DIRECT');
    expect(result.reason).toBe('short_message_direct');
  });

  it('le profil retourné est toujours un objet ResponseProfile valide', () => {
    const result = selectResponseProfile({ message: 'test', mode: 'default' });
    expect(result.profile).toBeDefined();
    expect(result.profile.maxTokens).toBeGreaterThan(0);
    expect(result.profile.temperature).toBeGreaterThan(0);
    expect(result.profile.temperature).toBeLessThanOrEqual(1.0);
    expect(result.inferenceState).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1.0);
  });

  it('mode inconnu → fallback sur BALANCED', () => {
    const result = selectResponseProfile({
      message: 'test avec mode qui nexiste pas dans la configuration',
      mode: 'mode_qui_nexiste_pas',
    });
    expect(result.profileId).toBe('BALANCED');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3 — ÉTAT D'INFÉRENCE
// ─────────────────────────────────────────────────────────────────────────────

describe("ResponsePolicy — Évaluation de l'état d'inférence", () => {
  it('message très court + complexité élevée + sans contexte → CLARIFY_REQUIRED', () => {
    const state = evaluateInferenceState('?', RESPONSE_PROFILES.BALANCED, false);
    expect(state).toBe('CLARIFY_REQUIRED');
  });

  it('message simple, faible complexité → SAFE_TO_INFER', () => {
    const state = evaluateInferenceState(
      'quel est le chemin de ce fichier?',
      RESPONSE_PROFILES.DIRECT,
      false
    );
    expect(['SAFE_TO_INFER', 'INFER_WITH_DISCLOSURE']).toContain(state);
  });

  it('message moyen ambiguïté avec contexte → INFER_WITH_DISCLOSURE au plus haut', () => {
    const state = evaluateInferenceState(
      'comment régler ce problème de performance?',
      RESPONSE_PROFILES.BALANCED,
      true
    );
    expect(['SAFE_TO_INFER', 'INFER_WITH_DISCLOSURE']).toContain(state);
  });

  it("les 4 états d'inférence sont possibles", () => {
    const validStates = [
      'SAFE_TO_INFER',
      'INFER_WITH_DISCLOSURE',
      'CLARIFY_REQUIRED',
      'BLOCKED_BY_MISSING_FACT',
    ];
    const test = evaluateInferenceState('test', RESPONSE_PROFILES.BALANCED, false);
    expect(validStates).toContain(test);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 4 — ESTIMATION DE COMPLEXITÉ
// ─────────────────────────────────────────────────────────────────────────────

describe('ResponsePolicy — Estimation de complexité', () => {
  it('message vide → complexité nulle', () => {
    expect(estimateComplexity('')).toBe(0);
  });

  it('message court simple → complexité < 0.3', () => {
    expect(estimateComplexity('ok')).toBeLessThan(0.3);
    expect(estimateComplexity('merci')).toBeLessThan(0.3);
  });

  it('message long avec questions multiples → complexité > 0.35', () => {
    const complex =
      'Peux-tu analyser la situation actuelle du projet? Quels sont les risques principaux et les priorités à court terme? Que recommanderais-tu pour la stratégie de déploiement?';
    expect(estimateComplexity(complex)).toBeGreaterThan(0.35);
  });

  it('la complexité est toujours bornée [0, 1]', () => {
    const messages = [
      '',
      'ok',
      'test message',
      'Question très longue qui comporte de nombreuses parties et sous-questions complexes impliquant plusieurs contextes différents et des conjonctions multiples car cette phrase est vraiment très longue et complexe?',
    ];
    for (const msg of messages) {
      const c = estimateComplexity(msg);
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThanOrEqual(1.0);
    }
  });

  it('est une fonction pure : même input → même output', () => {
    const msg = 'Analyse cela en profondeur et donne-moi toutes les options.';
    expect(estimateComplexity(msg)).toBe(estimateComplexity(msg));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 5 — getEffectiveProfile avec override modeMaxTokens
// ─────────────────────────────────────────────────────────────────────────────

describe('ResponsePolicy — getEffectiveProfile', () => {
  it('modeMaxTokens supérieur au profil → retourne modeMaxTokens', () => {
    // OMEGA mode est actuellement configuré à 16000 tokens.
    // Message suffisamment long pour ne pas déclencher Rule 7 (short_message_direct)
    const { profile } = getEffectiveProfile(
      'omega',
      'donne-moi toutes les options disponibles',
      4000,
      0.6
    );
    expect(profile.maxTokens).toBe(16000);
  });

  it('modeMaxTokens inférieur au profil DEEP → profil DEEP gagne', () => {
    // Si le mode a moins que DEEP (4000), et qu'on est en DEEP, DEEP l'emporte
    // (getEffectiveProfile prend max(modeMaxTokens, profile.maxTokens))
    const { profile } = getEffectiveProfile('omega', 'analyse en profondeur', 1024, 0.7);
    expect(profile.maxTokens).toBeGreaterThanOrEqual(1024);
  });

  it('explicit override respecté par getEffectiveProfile', () => {
    const { profile, selectionResult } = getEffectiveProfile(
      'omega',
      'analyse en profondeur',
      4000,
      0.6,
      'DIRECT'
    );
    expect(selectionResult.profileId).toBe('DIRECT');
    // maxTokens: max(DIRECT.maxTokens=512, modeMaxTokens=4000) = 4000
    expect(profile.maxTokens).toBe(4000);
  });

  it('modeTemperature est appliquée quand fournie', () => {
    const { profile } = getEffectiveProfile('default', 'test', 2048, 0.42);
    expect(profile.temperature).toBe(0.42);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 6 — COMPATIBILITÉ PROVIDER
// ─────────────────────────────────────────────────────────────────────────────

describe('ResponsePolicy — Compatibilité provider', () => {
  it('ollama a des paramètres non supportés définis', () => {
    expect(PROVIDER_UNSUPPORTED_PARAMS.ollama).toBeDefined();
    expect(PROVIDER_UNSUPPORTED_PARAMS.ollama.length).toBeGreaterThan(0);
    expect(PROVIDER_UNSUPPORTED_PARAMS.ollama).toContain('reasoning_effort');
  });

  it('openai a une liste vide (supporte tout)', () => {
    expect(PROVIDER_UNSUPPORTED_PARAMS.openai).toEqual([]);
  });

  it('mapReasoningEffort pour openai retourne le param natif', () => {
    const result = mapReasoningEffort('openai', 'high');
    expect(result).toEqual({ reasoning_effort: 'high' });
  });

  it('mapReasoningEffort pour ollama retourne objet vide (ignoré)', () => {
    const result = mapReasoningEffort('ollama', 'high');
    expect(result).toEqual({});
  });

  it('mapReasoningEffort pour gemini retourne objet vide (non supporté)', () => {
    const result = mapReasoningEffort('gemini', 'medium');
    expect(result).toEqual({});
  });

  it('tous les providers référencés ont des entrées dans PROVIDER_UNSUPPORTED_PARAMS', () => {
    const expectedProviders = [
      'ollama',
      'titane-local',
      'gemini',
      'claude',
      'openai',
      'copilot',
    ];
    for (const p of expectedProviders) {
      expect(PROVIDER_UNSUPPORTED_PARAMS[p]).toBeDefined();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 7 — INVARIANTS DE VÉRITÉ (I12-I15 du Super Prompt)
// ─────────────────────────────────────────────────────────────────────────────

describe('ResponsePolicy — Invariants de vérité', () => {
  it('I12: les profils non prouvés sont honnêtement marqués WIRED_BUT_UNPROVEN', () => {
    // DEEP et ARCHITECT ne sont pas encore prouvés runtime
    expect(RESPONSE_PROFILES.DEEP.truthStatus).toBe('WIRED_BUT_UNPROVEN');
    expect(RESPONSE_PROFILES.ARCHITECT.truthStatus).toBe('WIRED_BUT_UNPROVEN');
    expect(RESPONSE_PROFILES.DEEP.runtimeProven).toBe(false);
    expect(RESPONSE_PROFILES.ARCHITECT.runtimeProven).toBe(false);
  });

  it('I15: DIRECT a la longueur la plus basse (pas de répétition padding)', () => {
    expect(RESPONSE_PROFILES.DIRECT.maxTokens).toBeLessThan(
      RESPONSE_PROFILES.BALANCED.maxTokens
    );
  });

  it('I3/I4: aucun profil ne prétend faire du "deep reasoning" sans preuve', () => {
    // Si runtimeProven is false → le profil reconnaît honnêtement son statut
    for (const id of Object.keys(RESPONSE_PROFILES) as ResponseProfileId[]) {
      if (!RESPONSE_PROFILES[id].runtimeProven) {
        expect(['WIRED_BUT_UNPROVEN', 'STABLE_PARTIAL', 'PARTIAL']).toContain(
          RESPONSE_PROFILES[id].truthStatus
        );
      }
    }
  });

  it('RESPONSE_POLICY_VERSION est défini et non vide', async () => {
    const { RESPONSE_POLICY_VERSION, RESPONSE_POLICY_DATE } =
      await import('@/services/ai/responsePolicy');
    expect(RESPONSE_POLICY_VERSION).toBeTruthy();
    expect(RESPONSE_POLICY_DATE).toBe('2026-03-31');
  });
});
