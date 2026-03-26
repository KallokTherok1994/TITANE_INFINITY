/**
 * TITANE∞ — OMEGA MODE CLASSIFIER
 * ═══════════════════════════════════════════════════════════════════
 * Auto-selects the correct conversation mode, response profile,
 * effort level, and model class for each user turn.
 *
 * DESIGN RULES:
 * - Pure function (no async, no LLM call, <1ms)
 * - Deterministic signal detection
 * - Reuses RESPONSE_PROFILES from responsePolicy.ts (read-only)
 * - Maps to existing backend ConversationMode enum values
 * - If confidence < 0.7, caller preserves user's manual mode
 * - SHADOW_LEARNING is never auto-classified from user input
 *
 * Constitution: I1 (no fake learning), I3 (no hidden routing),
 *               I4 (no mode inflation), I6 (minimal patch)
 *
 * Lock: #1 — OMEGA_AUTO_ORCHESTRATION_CHAIN
 * ═══════════════════════════════════════════════════════════════════
 */

import type { ResponseProfileId } from './responsePolicy';
import { RESPONSE_PROFILES, estimateComplexity } from './responsePolicy';

// ─────────────────────────────────────────────────────────────────────────────
// CANONICAL MODES (8 canonical modes per Super Prompt §4)
// ─────────────────────────────────────────────────────────────────────────────

export type CanonicalMode =
  | 'DIRECT'         // simple factual/practical, low ambiguity, fast
  | 'CLARIFY_LIGHT'  // ambiguity exists but answerable, one clarifier if needed
  | 'DEEP_REASONING' // complex reasoning, synthesis, long chains
  | 'ARCHITECT'      // system design, long-term coherence, module interactions
  | 'REPAIR'         // isolate blocker, reproduce, patch minimally
  | 'CERTIFY'        // validate runtime truth, run tests/evals/gates
  | 'EXPLORATION'    // ideation, options, possible paths
  | 'SHADOW_LEARNING'; // observe only, never promoted (set programmatically)

// Backend ConversationMode values (must match Rust enum exactly)
export type BackendConversationMode =
  | 'default'
  | 'brainstorming'
  | 'synthesis'
  | 'planning'
  | 'journal'
  | 'debug_cognitive';

// Effort levels (extends responsePolicy.ts reasoningEffort with 'max')
export type EffortLevel = 'low' | 'medium' | 'high' | 'max';

// Model classes (Haiku/Sonnet/Opus abstraction)
export type ModelClass = 'HAIKU' | 'SONNET' | 'OPUS';

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT TYPE
// ─────────────────────────────────────────────────────────────────────────────

export interface ModeClassification {
  /** One of 8 canonical conversation modes */
  canonicalMode: CanonicalMode;
  /** Corresponding ResponseProfile from responsePolicy.ts */
  profileId: ResponseProfileId;
  /** Backend ConversationMode (matches Rust enum, snake_case) */
  backendMode: BackendConversationMode;
  /** Effort level for this turn */
  effortLevel: EffortLevel;
  /** Recommended model class */
  modelClass: ModelClass;
  /** Classifier confidence 0.0-1.0. Below 0.7, caller should preserve user mode */
  confidence: number;
  /** Short machine-readable reason code for trace meta */
  reasonCode: string;
  /** List of detected input signals */
  signals: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// INPUT TYPE
// ─────────────────────────────────────────────────────────────────────────────

export interface ClassifierInput {
  message: string;
  /** User's currently active manual mode (default = 'default') */
  userExplicitMode?: BackendConversationMode;
  /** Number of turns user has been on this mode (helps decide when to auto-override) */
  turnsOnCurrentMode?: number;
  /** Optional conversation history for context signals */
  conversationHistory?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CANONICAL MODE → PROFILE + BACKEND MAPPING TABLE
// ─────────────────────────────────────────────────────────────────────────────

interface ModeSpec {
  profileId: ResponseProfileId;
  backendMode: BackendConversationMode;
  effortLevel: EffortLevel;
  modelClass: ModelClass;
}

const CANONICAL_MODE_SPECS: Record<CanonicalMode, ModeSpec> = {
  DIRECT: {
    profileId: 'DIRECT',
    backendMode: 'default',
    effortLevel: 'low',
    modelClass: 'SONNET',
  },
  CLARIFY_LIGHT: {
    profileId: 'DIRECT',
    backendMode: 'default',
    effortLevel: 'low',
    modelClass: 'SONNET',
  },
  DEEP_REASONING: {
    profileId: 'DEEP',
    backendMode: 'synthesis',
    effortLevel: 'high',
    modelClass: 'SONNET',
  },
  ARCHITECT: {
    profileId: 'ARCHITECT',
    backendMode: 'planning',
    effortLevel: 'high',
    modelClass: 'OPUS',
  },
  REPAIR: {
    profileId: 'DEEP',
    backendMode: 'debug_cognitive',
    effortLevel: 'high',
    modelClass: 'SONNET',
  },
  CERTIFY: {
    profileId: 'ARCHITECT',
    backendMode: 'debug_cognitive',
    effortLevel: 'max',
    modelClass: 'OPUS',
  },
  EXPLORATION: {
    profileId: 'BALANCED',
    backendMode: 'brainstorming',
    effortLevel: 'medium',
    modelClass: 'SONNET',
  },
  SHADOW_LEARNING: {
    profileId: 'BALANCED',
    backendMode: 'default',
    effortLevel: 'medium',
    modelClass: 'SONNET',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL DICTIONARIES
// (DIRECT/DEEP/ARCHITECT signals are in responsePolicy.ts — we define the rest here)
// ─────────────────────────────────────────────────────────────────────────────

/** REPAIR: code errors, exceptions, broken behavior */
const REPAIR_SIGNALS = [
  // Error type markers
  'typeerror', 'syntaxerror', 'referenceerror', 'rangeerror', 'uncaught',
  'cannot read', 'undefined is not', 'null is not', 'is not a function',
  'is not defined', 'unexpected token', 'module not found',
  // Error reporting patterns
  'stack trace', 'at line', 'at column', 'error:', 'exception:',
  // Action verbs for repair
  'répare', 'corrige', 'fix', 'debug', 'résous', 'solve', 'broken',
  'ne fonctionne pas', 'ça bug', 'ça plante', 'cassé', 'crash',
  'ne marche pas', 'ne compile pas', 'build failed', 'compile error',
  'regression', 'régressio',
];

/** CERTIFY: validation, proof, gate checks, runtime verification */
const CERTIFY_SIGNALS = [
  'vérifie', 'verifi', 'prouve', 'certifie', 'valide', 'validate',
  'certify', 'confirm', 'gate', 'gates', 'proof', 'preuve',
  'est-ce que ça marche', 'fonctionne vraiment', 'réellement',
  'runtime proof', 'test de vérité', 'est-ce prouvé', 'est prouvé',
  'vérification', 'en runtime', 'en prod', 'en production',
  'audit', 'contrôle', 'assertion', 'invariant',
];

/** CLARIFY_LIGHT: vague/ambiguous requests without enough context */
const AMBIGUITY_SIGNALS = [
  'quelque chose', 'un truc', 'un machin', 'une chose', 'ça',
  'fais-le', 'occupe-toi', 'gère ça', 'règle ça', 'traite ça',
  'improve it', 'make it better', 'fix it', 'do something',
  'je ne sais pas', 'sais pas trop', 'pas sûr', 'peut-être',
];

/** EXPLORATION: ideation, possibilities, directions */
const EXPLORATION_SIGNALS = [
  'idées', 'ideas', 'options', 'possibilités', 'possibilities',
  'nouvelles directions', 'new directions', 'explorer', 'explore',
  'quelles pistes', 'what if', 'et si', 'imaginons', 'imagine',
  'brainstorm', 'réfléchissons', "qu'est-ce qu'on pourrait",
  'propose-moi', 'suggère', 'suggest', 'inspire', 'créatif', 'creative',
];

/** DEEP_REASONING: complex analysis, synthesis, long reasoning chains */
const DEEP_REASONING_SIGNALS = [
  'analyse en profondeur', 'en détail', 'explique bien',
  'approfondi', 'développe', 'détaille', 'complet', 'exhaustif',
  'examine', 'creuse', 'deep dive', 'comprehensive', 'thorough',
  'elaborate', 'pourquoi', 'comment fonctionne', 'mécanisme',
  'dépendances', 'interactions', 'complexe', 'implications',
];

/** ARCHITECT: system design, structure, long-term coherence */
const ARCHITECT_SIGNALS = [
  'structure', 'organise', 'architecture', 'stratégie', 'priorités',
  'axes', 'incohérence', 'incoherence', 'décision',
  'structure-moi', 'synthèse stratégique', "plan d'action",
  'cartographie', 'framework', 'roadmap', 'blueprint',
  'long terme', 'long-term', 'conception', 'design système',
  'module', 'dépendances cycliques', 'couplage', 'cohésion',
];

/** DIRECT: short, simple factual, explicit speed signals */
const DIRECT_SIGNALS = [
  'fais court', 'réponds vite', 'vite', 'rapide', 'en bref',
  "l'essentiel", 'donne-moi juste', 'simplement', 'en une phrase',
  'quick', 'brief', 'short answer', 'tldr', 'tl;dr',
];

/** FACTUAL_QUESTION: simple who/what/when/where questions → DIRECT */
const FACTUAL_QUESTION_PATTERNS = [
  /^(qui|what|who|when|où|where|quel|quelle|quels|quelles)\s/i,
  /^(c'est quoi|qu'est-ce que|qu'est-ce qu')/i,
  /^(combien|how many|how much)\s/i,
  /^(est-ce que|is it|does|can|will)\s/i,
];

/** CODE_REVIEW: review, audit, refactor signals → ARCHITECT or DEEP */
const CODE_REVIEW_SIGNALS = [
  'review', 'code review', 'revue de code', 'audit',
  'refactor', 'réusine', 'nettoie', 'clean up',
  'qualité', 'quality', 'smell', 'dette technique',
  'technical debt', 'couplage', 'coupling', 'cohésion',
];

/** TEST_REQUEST: test writing, test running signals → CERTIFY */
const TEST_SIGNALS = [
  'test', 'tests', 'écris un test', 'write a test',
  'lance les tests', 'run tests', 'couverture', 'coverage',
  'jest', 'vitest', 'playwright', 'e2e', 'unit test',
  'integration test', 'test de charge', 'load test',
];

/** CONFIG_CHANGE: configuration, setup, env signals → ARCHITECT */
const CONFIG_SIGNALS = [
  'config', 'configuration', 'env', 'environment',
  'variable d\'environnement', 'env var', 'settings',
  'paramètre', 'option', 'flag', 'feature flag',
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: build ModeClassification from canonical mode + signals + confidence
// ─────────────────────────────────────────────────────────────────────────────

function buildResult(
  canonicalMode: CanonicalMode,
  confidence: number,
  reasonCode: string,
  signals: string[]
): ModeClassification {
  const spec = CANONICAL_MODE_SPECS[canonicalMode];
  return {
    canonicalMode,
    profileId: spec.profileId,
    backendMode: spec.backendMode,
    effortLevel: spec.effortLevel,
    modelClass: spec.modelClass,
    confidence,
    reasonCode,
    signals,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: detect which signals from a list are present in the message
// ─────────────────────────────────────────────────────────────────────────────

function detectSignals(msgLower: string, signalList: readonly string[]): string[] {
  return signalList.filter(s => msgLower.includes(s));
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CLASSIFIER FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Classify the canonical mode, profile, effort, and model class for a user turn.
 *
 * Rules (in priority order):
 * 1. REPAIR — explicit error signals (highest priority: must not be ignored)
 * 2. CERTIFY — validation/proof signals
 * 3. ARCHITECT — architecture/structure signals
 * 4. CLARIFY_LIGHT — ambiguity signals + short message (no useful inference possible)
 * 5. EXPLORATION — ideation/options signals
 * 6. DEEP_REASONING — complexity analysis signals
 * 7. DIRECT — explicit brevity signals OR ultra-short message (≤ 8 chars)
 * 8. Complexity-based fallback → DEEP_REASONING if complexity > 0.72, else DIRECT
 *
 * Returns DIRECT with confidence 0.55 as safe default (maps to Default mode).
 *
 * Confidence < 0.7: caller should preserve user's manual mode setting.
 */
export function classifyMode(input: ClassifierInput): ModeClassification {
  const msg = input.message;
  const msgLower = msg.toLowerCase();
  const msgLen = msg.length;

  // ── RULE 1: REPAIR (highest priority — error signals cannot be ignored) ──
  const repairHits = detectSignals(msgLower, REPAIR_SIGNALS);
  if (repairHits.length >= 2) {
    // Multiple error signals = high confidence repair
    return buildResult('REPAIR', 0.92, 'CODE_ERROR_SIGNAL_STRONG', repairHits.slice(0, 3));
  }
  if (repairHits.length === 1) {
    return buildResult('REPAIR', 0.80, 'CODE_ERROR_SIGNAL', repairHits);
  }
  // Backtick presence + repair-adjacent context
  const hasBackticks = (msg.match(/`[^`]+`/g) ?? []).length >= 2;
  const hasErrorWord = msgLower.includes('error') || msgLower.includes('erreur');
  if (hasBackticks && hasErrorWord) {
    return buildResult('REPAIR', 0.78, 'CODE_BACKTICK_ERROR', ['backtick_error_combo']);
  }

  // ── RULE 2: CERTIFY ──
  const certifyHits = detectSignals(msgLower, CERTIFY_SIGNALS);
  if (certifyHits.length >= 2) {
    return buildResult('CERTIFY', 0.88, 'CERTIFY_SIGNAL_STRONG', certifyHits.slice(0, 3));
  }
  if (certifyHits.length === 1) {
    return buildResult('CERTIFY', 0.75, 'CERTIFY_SIGNAL', certifyHits);
  }

  // ── RULE 3: ARCHITECT ──
  const architectHits = detectSignals(msgLower, ARCHITECT_SIGNALS);
  if (architectHits.length >= 2) {
    return buildResult('ARCHITECT', 0.87, 'ARCHITECT_SIGNAL_STRONG', architectHits.slice(0, 3));
  }
  if (architectHits.length === 1) {
    return buildResult('ARCHITECT', 0.73, 'ARCHITECT_SIGNAL', architectHits);
  }

  // ── RULE 4: CLARIFY_LIGHT (ambiguity detection) ──
  // Only triggers when: ambiguity signal present + message is short + no strong context
  const ambiguityHits = detectSignals(msgLower, AMBIGUITY_SIGNALS);
  if (ambiguityHits.length >= 1 && msgLen < 60 && !hasBackticks) {
    return buildResult('CLARIFY_LIGHT', 0.68, 'AMBIGUITY_SIGNAL', ambiguityHits);
  }

  // ── RULE 5: EXPLORATION ──
  const explorationHits = detectSignals(msgLower, EXPLORATION_SIGNALS);
  if (explorationHits.length >= 2) {
    return buildResult('EXPLORATION', 0.83, 'EXPLORATION_SIGNAL_STRONG', explorationHits.slice(0, 3));
  }
  if (explorationHits.length === 1) {
    return buildResult('EXPLORATION', 0.67, 'EXPLORATION_SIGNAL', explorationHits);
  }

  // ── RULE 6: DEEP_REASONING ──
  const deepHits = detectSignals(msgLower, DEEP_REASONING_SIGNALS);
  if (deepHits.length >= 2) {
    return buildResult('DEEP_REASONING', 0.85, 'DEEP_SIGNAL_STRONG', deepHits.slice(0, 3));
  }
  if (deepHits.length === 1) {
    return buildResult('DEEP_REASONING', 0.75, 'DEEP_SIGNAL', deepHits);
  }

  // ── RULE 5b: CODE_REVIEW signals → ARCHITECT or DEEP ──
  const codeReviewHits = detectSignals(msgLower, CODE_REVIEW_SIGNALS);
  if (codeReviewHits.length >= 2) {
    return buildResult('ARCHITECT', 0.82, 'CODE_REVIEW_STRONG', codeReviewHits.slice(0, 3));
  }
  if (codeReviewHits.length === 1) {
    return buildResult('DEEP_REASONING', 0.72, 'CODE_REVIEW_SIGNAL', codeReviewHits);
  }

  // ── RULE 5c: TEST signals → CERTIFY ──
  const testHits = detectSignals(msgLower, TEST_SIGNALS);
  if (testHits.length >= 2) {
    return buildResult('CERTIFY', 0.85, 'TEST_SIGNAL_STRONG', testHits.slice(0, 3));
  }
  if (testHits.length === 1 && !repairHits.length) {
    return buildResult('CERTIFY', 0.72, 'TEST_SIGNAL', testHits);
  }

  // ── RULE 5d: CONFIG signals → ARCHITECT ──
  const configHits = detectSignals(msgLower, CONFIG_SIGNALS);
  if (configHits.length >= 2) {
    return buildResult('ARCHITECT', 0.80, 'CONFIG_SIGNAL_STRONG', configHits.slice(0, 3));
  }

  // ── RULE 7: DIRECT (explicit brevity signals) ──
  const directHits = detectSignals(msgLower, DIRECT_SIGNALS);
  if (directHits.length >= 1) {
    return buildResult('DIRECT', 0.88, 'DIRECT_LEXICAL_SIGNAL', directHits);
  }

  // ── RULE 7b: FACTUAL_QUESTION patterns → DIRECT ──
  // Captures "Qui est X?", "Quelle est la date?", "C'est quoi X?"
  const isFactualQuestion = FACTUAL_QUESTION_PATTERNS.some(p => p.test(msg));
  if (isFactualQuestion && msgLen <= 120) {
    return buildResult('DIRECT', 0.75, 'FACTUAL_QUESTION_PATTERN', ['question_type_match']);
  }

  // Ultra-short message (≤ 8 chars) → DIRECT
  if (msgLen <= 8) {
    return buildResult('DIRECT', 0.78, 'ULTRA_SHORT_MESSAGE', ['msgLen_lte_8']);
  }

  // ── RULE 7c: Short simple question (≤ 80 chars, ends with ?, low complexity) ──
  const isSimpleQuestion = msgLower.endsWith('?') && msgLen <= 80;
  if (isSimpleQuestion) {
    const complexity = estimateComplexity(msg);
    if (complexity < 0.5) {
      return buildResult('DIRECT', 0.72, 'SHORT_SIMPLE_QUESTION', ['ends_with_question_mark', `len:${msgLen}`]);
    }
  }

  // ── RULE 8: Complexity-based fallback ──
  const complexity = estimateComplexity(msg);
  if (complexity > 0.72) {
    return buildResult('DEEP_REASONING', 0.65, 'HIGH_COMPLEXITY_FALLBACK', [`complexity:${complexity.toFixed(2)}`]);
  }

  // Safe default: DIRECT at low confidence (caller may override with user mode)
  return buildResult('DIRECT', 0.55, 'DEFAULT_FALLBACK', []);
}

// ─────────────────────────────────────────────────────────────────────────────
// RESOLVER: should auto-classification override user's manual mode?
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Decides whether the auto-classified mode should replace the user's current mode.
 *
 * Rules:
 * - User's explicit mode always wins if confidence < 0.7
 * - If user is on 'default' AND confidence >= 0.7 → use auto-classified mode
 * - If user explicitly switched mode (not 'default') → respect it (never override)
 * - REPAIR and CERTIFY always override (safety signal, confidence >= 0.7 guaranteed)
 */
export function resolveMode(
  classification: ModeClassification,
  userExplicitMode: BackendConversationMode = 'default'
): BackendConversationMode {
  // Low confidence: always preserve user mode
  if (classification.confidence < 0.7) {
    return userExplicitMode;
  }

  // User is on non-default mode: respect their choice
  if (userExplicitMode !== 'default') {
    // Exception: REPAIR and CERTIFY are safety signals that always override
    if (classification.canonicalMode === 'REPAIR' || classification.canonicalMode === 'CERTIFY') {
      return classification.backendMode;
    }
    return userExplicitMode;
  }

  // User is on default + confidence >= 0.7: use auto-classified mode
  return classification.backendMode;
}

// ─────────────────────────────────────────────────────────────────────────────
// SHADOW LEARNING MODE (programmatic only — never from user input)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a SHADOW_LEARNING classification for observation-only turns.
 * This is set programmatically (never auto-classified from user input).
 */
export function shadowLearningMode(): ModeClassification {
  return buildResult('SHADOW_LEARNING', 1.0, 'PROGRAMMATIC_SHADOW', ['shadow_learning_mode']);
}

// ─────────────────────────────────────────────────────────────────────────────
// ANTI-LIE ASSERTIONS (for use in tests and runtime checks)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Assert that TraceMeta is present when auto-classification ran.
 * Use in tests: assertTraceMeta(response) should not throw.
 */
export function assertClassificationHonest(
  classification: ModeClassification,
  resolvedBackendMode: BackendConversationMode
): void {
  // If high confidence, resolved mode must match classification
  if (classification.confidence >= 0.7 && resolvedBackendMode === classification.backendMode) {
    // Consistent — pass
    return;
  }
  // If low confidence, resolved mode should be user mode (not classification)
  if (classification.confidence < 0.7 && resolvedBackendMode === classification.backendMode) {
    throw new Error(
      `[OmegaClassifier] Anti-lie: classification confidence ${classification.confidence} < 0.7 ` +
      `but resolved to classification.backendMode='${classification.backendMode}'. ` +
      `User mode should have been preserved.`
    );
  }
}

/**
 * Assert that CERTIFY/ARCHITECT modes never use low effort.
 */
export function assertEffortCoherent(classification: ModeClassification): void {
  const highEffortModes: CanonicalMode[] = ['ARCHITECT', 'CERTIFY', 'DEEP_REASONING'];
  if (highEffortModes.includes(classification.canonicalMode) && classification.effortLevel === 'low') {
    throw new Error(
      `[OmegaClassifier] Anti-lie: mode ${classification.canonicalMode} has effort 'low'. ` +
      `Expected: high or max.`
    );
  }
}
