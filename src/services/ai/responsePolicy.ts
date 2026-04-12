/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 *   RESPONSE POLICY PROFILES — Utility library for profile definitions
 *   Runtime authority: canonicalDiscernmentKernel.ts (single decision point)
 *   This file provides profile parameters consumed by the kernel.
 *   Constitution : Rule 1 (Minimal patch), Rule 3 (Truth-first)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Ce fichier fournit :
 * - Définitions de profils (DIRECT, BALANCED, DEVELOPED, DEEP, ARCHITECT, OMEGA)
 * - Sélection lexicale de profil (signaux directs)
 * - Classification d'intention sémantique
 * - Évaluation d'état d'inférence
 * - Estimation de complexité
 *
 * L'autorité runtime de décision est le CanonicalDiscernmentKernel.
 * Le kernel décide : profil, provider, mémoire, inférence, vérité.
 *
 * I14 : Un meilleur libellé n'est pas une preuve d'intelligence supérieure.
 * I15 : "Plus long" ne signifie pas répétitif, flou ou moins utile.
 */

import type { EffortLevel } from './omegaModeClassifier';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES FONDAMENTAUX
// ─────────────────────────────────────────────────────────────────────────────

/** Les 5 profils de réponse canoniques */
export type ResponseProfileId =
  | 'DIRECT'
  | 'BALANCED'
  | 'DEVELOPED'
  | 'DEEP'
  | 'ARCHITECT'
  | 'OMEGA';

/** État d'inférence implicite */
export type InferenceState =
  | 'SAFE_TO_INFER' // Intention claire, répondre directement
  | 'INFER_WITH_DISCLOSURE' // Intention probable, annoncer l'hypothèse
  | 'CLARIFY_REQUIRED' // Ambiguïté trop haute pour agir utilement
  | 'BLOCKED_BY_MISSING_FACT'; // Fait critique manquant, éliciter seulement

/** Étiquette de vérité du mode actif */
export type TruthStatus =
  | 'PROVEN_RUNTIME' // Prouvé par test E2E ou runtime
  | 'STABLE_PARTIAL' // Stable mais non prouvé de bout en bout
  | 'WIRED_BUT_UNPROVEN' // Câblé dans le code, non prouvé en runtime
  | 'PARTIAL' // Partiellement fonctionnel
  | 'STUB_ONLY' // Stub uniquement, non fonctionnel
  | 'DEFAULT_FAKE' // Label trompeur : ne pas afficher comme actif
  | 'LYING_UI'; // L'UI prétend une capacité inexistante

/** Politique mémoire pour un profil */
export interface MemoryPolicy {
  /** Injecter la mémoire STM (session courante) */
  injectSTM: boolean;
  /** Injecter la mémoire LTM (long terme pertinente) */
  injectLTM: boolean;
  /** Injecter uniquement par retrieval ciblé */
  targetedRetrievalOnly: boolean;
  /** Nombre maximum de sources mémoire injectées */
  maxSources: number;
  /** Séparer mémoire et instructions dans le prompt */
  isolateMemorySection: boolean;
}

/** Politique streaming/retry pour un profil */
export interface StreamPolicy {
  /** Activer le streaming si disponible */
  enableStreaming: boolean;
  /** Budget timeout (ms) */
  timeoutMs: number;
  /** Nombre de retries max */
  maxRetries: number;
  /** Stratégie retry : 'linear' | 'exponential' */
  retryStrategy: 'linear' | 'exponential';
}

/** Définition complète d'un profil de réponse */
export interface ResponseProfile {
  id: ResponseProfileId;
  label: string;
  description: string;

  // Paramètres IA
  /** Tokens max pour la réponse */
  maxTokens: number;
  /** Température de génération */
  temperature: number;
  /** Effort de raisonnement (pour providers compatibles : openai o1/o3) */
  reasoningEffort: EffortLevel;

  // Politique de réponse
  /** Niveau de structure (0=prose, 1=léger, 2=structuré, 3=haute structure) */
  structureLevel: 0 | 1 | 2 | 3;
  /** Seuil de clarification : 0.0 = demander souvent, 1.0 = ne jamais demander */
  clarificationThreshold: number;
  /** Agressivité d'inférence implicite (0.0-1.0) */
  inferenceAggression: number;

  // Politiques associées
  memory: MemoryPolicy;
  stream: StreamPolicy;

  /** Providers préférés dans l'ordre */
  preferredProviders: string[];

  // Vérité — v26.0.0: Optional, kernel.evaluateTruthStatus() is the authority
  truthStatus?: TruthStatus;
  /** Profil disponible en production ? */
  runtimeProven: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// LES 4 PROFILS CANONIQUES
// ─────────────────────────────────────────────────────────────────────────────

export const RESPONSE_PROFILES: Record<ResponseProfileId, ResponseProfile> = {
  /**
   * DIRECT — Réponse immédiate, overhead minimal, faible latence
   * Cas : "fais court", "réponds vite", "l'essentiel"
   */
  DIRECT: {
    id: 'DIRECT',
    label: 'Direct',
    description: 'Réponse rapide, claire, minimale. Faible latence.',
    maxTokens: 1024,
    temperature: 0.5,
    reasoningEffort: 'low',
    structureLevel: 0,
    clarificationThreshold: 0.85, // rarement demander
    inferenceAggression: 0.8, // inférer fortement
    memory: {
      injectSTM: true,
      injectLTM: false,
      targetedRetrievalOnly: false,
      maxSources: 2,
      isolateMemorySection: false,
    },
    stream: {
      enableStreaming: true,
      timeoutMs: 20000,
      maxRetries: 1,
      retryStrategy: 'linear',
    },
    preferredProviders: ['ollama', 'titane-local'],
    truthStatus: 'STABLE_PARTIAL',
    runtimeProven: false,
  },

  /**
   * BALANCED — Mode quotidien par défaut, structure modérée, profondeur utile
   * Cas : usage général sans signal explicite
   */
  BALANCED: {
    id: 'BALANCED',
    label: 'Équilibré',
    description:
      'Mode par défaut. Structure modérée, profondeur utile sans sur-ingénierie.',
    maxTokens: 4096,
    temperature: 0.7,
    reasoningEffort: 'medium',
    structureLevel: 1,
    clarificationThreshold: 0.72, // raised: ask less often, infer more
    inferenceAggression: 0.72, // raised: stronger intent deduction by default
    memory: {
      injectSTM: true,
      injectLTM: true,
      targetedRetrievalOnly: false,
      maxSources: 5,
      isolateMemorySection: true,
    },
    stream: {
      enableStreaming: true,
      timeoutMs: 45000,
      maxRetries: 2,
      retryStrategy: 'linear',
    },
    preferredProviders: ['ollama', 'gemini', 'openai', 'titane-local'],
    truthStatus: 'STABLE_PARTIAL',
    runtimeProven: false,
  },

  /**
   * DEVELOPED — Profondeur par défaut pour Kevin. Réflexion approfondie, structure développée.
   * Cas : usage quotidien stratégique, demandes importantes, réponses decision-ready.
   * C'est le profil par défaut pour Kevin Thibault.
   */
  DEVELOPED: {
    id: 'DEVELOPED',
    label: 'Développé',
    description:
      'Profil par défaut. Réflexion approfondie, réponse développée, structure utile. Équilibre entre profondeur et efficacité.',
    maxTokens: 6144,
    temperature: 0.65,
    reasoningEffort: 'high',
    structureLevel: 2,
    clarificationThreshold: 0.78, // élevé: inférer d'abord, question chirurgicale seulement si HIGH ambiguity
    inferenceAggression: 0.75, // forte inférence, Kevin veut agir pas questionner
    memory: {
      injectSTM: true,
      injectLTM: true,
      targetedRetrievalOnly: false,
      maxSources: 8,
      isolateMemorySection: true,
    },
    stream: {
      enableStreaming: true,
      timeoutMs: 90000,
      maxRetries: 2,
      retryStrategy: 'linear',
    },
    preferredProviders: ['gemini', 'openai', 'claude', 'ollama', 'titane-local'],
    truthStatus: 'STABLE_PARTIAL',
    runtimeProven: false,
  },

  /**
   * DEEP — Raisonnement plus riche, structure forte, synthèse dense
   * Cas : "analyse en profondeur", "explique en détail", complexité élevée
   */
  DEEP: {
    id: 'DEEP',
    label: 'Profond',
    description:
      'Raisonnement riche, structure forte, synthèse dense. Latence accrue acceptée.',
    maxTokens: 8192,
    temperature: 0.65,
    reasoningEffort: 'high',
    structureLevel: 2,
    clarificationThreshold: 0.65, // élevé: Kevin veut une question seulement si vraiment nécessaire
    inferenceAggression: 0.6,
    memory: {
      injectSTM: true,
      injectLTM: true,
      targetedRetrievalOnly: false,
      maxSources: 10,
      isolateMemorySection: true,
    },
    stream: {
      enableStreaming: true,
      timeoutMs: 120000,
      maxRetries: 2,
      retryStrategy: 'exponential',
    },
    preferredProviders: ['gemini', 'openai', 'claude', 'ollama', 'titane-local'],
    truthStatus: 'WIRED_BUT_UNPROVEN',
    runtimeProven: false,
  },

  /**
   * ARCHITECT — Clarté stratégique maximale, exposition des axes/priorités/incohérences
   * Cas : "structure-moi cela", architecture, décision complexe, audit
   * Format interne préféré : AXIS → PRIORITY → INCOHERENCE → SIMPLE ACTION
   */
  ARCHITECT: {
    id: 'ARCHITECT',
    label: 'Architecte',
    description:
      'Clarté stratégique maximale. Expose axes, priorités, incohérences, action simple.',
    maxTokens: 12000,
    temperature: 0.55,
    reasoningEffort: 'high',
    structureLevel: 3,
    clarificationThreshold: 0.3,
    inferenceAggression: 0.4,
    memory: {
      injectSTM: true,
      injectLTM: true,
      targetedRetrievalOnly: true,
      maxSources: 12,
      isolateMemorySection: true,
    },
    stream: {
      enableStreaming: true,
      timeoutMs: 180000,
      maxRetries: 3,
      retryStrategy: 'exponential',
    },
    preferredProviders: ['gemini', 'claude', 'openai', 'ollama', 'titane-local'],
    truthStatus: 'WIRED_BUT_UNPROVEN',
    runtimeProven: false,
  },

  /**
   * OMEGA — Potentiel maximal absolu. Contexte total, mémoire complète, génération illimitée.
   * Cas : "godmod", "plein potentiel", tâches complexes multi-étapes, sessions hybrides admin
   */
  OMEGA: {
    id: 'OMEGA',
    label: 'Oméga ∞',
    description:
      'Puissance maximale. Mémoire totale, génération longue, raisonnement approfondi. Aucune limitation artificielle.',
    maxTokens: 16000,
    temperature: 0.72,
    reasoningEffort: 'max',
    structureLevel: 3,
    clarificationThreshold: 0.2,
    inferenceAggression: 0.9,
    memory: {
      injectSTM: true,
      injectLTM: true,
      targetedRetrievalOnly: false,
      maxSources: 20,
      isolateMemorySection: true,
    },
    stream: {
      enableStreaming: true,
      timeoutMs: 240000,
      maxRetries: 3,
      retryStrategy: 'exponential',
    },
    preferredProviders: ['gemini', 'claude', 'openai', 'ollama', 'titane-local'],
    truthStatus: 'WIRED_BUT_UNPROVEN',
    runtimeProven: false,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MAPPING MODE → PROFIL PAR DÉFAUT
// ─────────────────────────────────────────────────────────────────────────────

/** Profil par défaut selon le mode de chat actif */
const MODE_PROFILE_MAP: Record<string, ResponseProfileId> = {
  default: 'DEVELOPED',
  standard: 'DEVELOPED',
  quick: 'DIRECT',
  reflection: 'DEEP',
  creation: 'DEVELOPED',
  strategy: 'ARCHITECT',
  emergency: 'DIRECT',
  omega: 'OMEGA',
  brainstorming: 'DEEP',
  synthesis: 'ARCHITECT',
  planning: 'ARCHITECT',
  hybrid: 'OMEGA',
  journal: 'DEVELOPED',
  debug_cognitive: 'ARCHITECT',
  coach: 'DEVELOPED',
  dev: 'DEEP',
  admin: 'OMEGA',
  audit: 'ARCHITECT',
};

// ─────────────────────────────────────────────────────────────────────────────
// DÉTECTEUR D'INTENTION (lexique minimal, déterministe)
// ─────────────────────────────────────────────────────────────────────────────

const DIRECT_SIGNALS = [
  'fais court',
  'réponds vite',
  'vite',
  'rapide',
  'en bref',
  'résume',
  "l'essentiel",
  'donne-moi juste',
  'simplement',
  'en une phrase',
  'quick',
  'brief',
  'short answer',
  'tldr',
  'tl;dr',
];

const DEEP_SIGNALS = [
  'analyse en profondeur',
  'en détail',
  'explique bien',
  'approfondi',
  'développe',
  'détaille',
  'complet',
  'exhaustif',
  'examine',
  'creuse',
  'deep dive',
  'comprehensive',
  'thorough',
  'elaborate',
];

const ARCHITECT_SIGNALS = [
  'structure',
  'organise',
  'crée un plan',
  'architecture',
  'stratégie',
  'priorités',
  'axes',
  'incoherence',
  'incohérence',
  'décision',
  'audit',
  'structure-moi',
  'synthèse stratégique',
  "plan d'action",
  'cartographie',
  'framework',
  'roadmap',
  'blueprint',
];

// ─────────────────────────────────────────────────────────────────────────────
// SÉLECTION DYNAMIQUE DU PROFIL
// ─────────────────────────────────────────────────────────────────────────────

export interface ProfileSelectionInput {
  /** Message utilisateur */
  message: string;
  /** Mode de chat actif */
  mode: string;
  /** Complexité estimée du message (0.0-1.0) */
  complexity?: number;
  /** Longueur du message */
  messageLength?: number;
  /** Override explicite utilisateur */
  explicitProfileOverride?: ResponseProfileId;
}

export interface ProfileSelectionResult {
  profileId: ResponseProfileId;
  profile: ResponseProfile;
  reason: string;
  inferenceState: InferenceState;
  confidence: number; // 0.0-1.0
}

/**
 * Sélectionner le profil de réponse dynamiquement.
 * Règle absolue : l'override explicite utilisateur prend la priorité.
 */
export function selectResponseProfile(
  input: ProfileSelectionInput
): ProfileSelectionResult {
  const msg = input.message.toLowerCase();
  const msgLen = input.messageLength ?? input.message.length;
  const complexity = input.complexity ?? estimateComplexity(input.message);

  // Règle 1 : Override explicite utilisateur (priorité absolue)
  if (input.explicitProfileOverride) {
    return {
      profileId: input.explicitProfileOverride,
      profile: RESPONSE_PROFILES[input.explicitProfileOverride],
      reason: 'explicit_user_override',
      inferenceState: 'SAFE_TO_INFER',
      confidence: 1.0,
    };
  }

  // v30.3.0: Signal-weighted profile selection — count matching signals for confidence scaling
  const directHits = DIRECT_SIGNALS.filter(s => msg.includes(s)).length;
  const architectHits = ARCHITECT_SIGNALS.filter(s => msg.includes(s)).length;
  const deepHits = DEEP_SIGNALS.filter(s => msg.includes(s)).length;

  // Règle 2 : Signaux lexicaux directs (DIRECT)
  if (directHits > 0) {
    // v30.3.0: Confidence scales with signal density (1 signal = 0.82, 2+ = 0.92)
    const confidence = Math.min(0.95, 0.75 + directHits * 0.08);
    return {
      profileId: 'DIRECT',
      profile: RESPONSE_PROFILES.DIRECT,
      reason: `direct_lexical_signal(${directHits})`,
      inferenceState: 'SAFE_TO_INFER',
      confidence,
    };
  }

  // Règle 3 : Signaux lexicaux ARCHITECT
  if (architectHits > 0) {
    const confidence = Math.min(0.95, 0.75 + architectHits * 0.06);
    return {
      profileId: 'ARCHITECT',
      profile: RESPONSE_PROFILES.ARCHITECT,
      reason: `architect_lexical_signal(${architectHits})`,
      inferenceState: 'SAFE_TO_INFER',
      confidence,
    };
  }

  // Règle 4 : Signaux lexicaux DEEP
  if (deepHits > 0) {
    const confidence = Math.min(0.95, 0.75 + deepHits * 0.06);
    return {
      profileId: 'DEEP',
      profile: RESPONSE_PROFILES.DEEP,
      reason: `deep_lexical_signal(${deepHits})`,
      inferenceState: 'SAFE_TO_INFER',
      confidence,
    };
  }

  // Règle 5 : Mode actif → profil par défaut du mode
  const modeDefault = MODE_PROFILE_MAP[input.mode] ?? 'BALANCED';

  // v30.3.0: Graduated complexity-based profile escalation
  // Replaces the single DEVELOPED→DEEP rule with a multi-tier escalation ladder
  if (complexity > 0.85 && (modeDefault === 'DEVELOPED' || modeDefault === 'DEEP')) {
    return {
      profileId: 'ARCHITECT',
      profile: RESPONSE_PROFILES.ARCHITECT,
      reason: 'very_high_complexity_escalation',
      inferenceState: 'INFER_WITH_DISCLOSURE',
      confidence: 0.72,
    };
  }
  if (complexity > 0.72 && modeDefault === 'DEVELOPED') {
    return {
      profileId: 'DEEP',
      profile: RESPONSE_PROFILES.DEEP,
      reason: 'high_complexity_escalation',
      inferenceState: 'INFER_WITH_DISCLOSURE',
      confidence: 0.7,
    };
  }
  if (complexity > 0.60 && modeDefault === 'BALANCED') {
    return {
      profileId: 'DEVELOPED',
      profile: RESPONSE_PROFILES.DEVELOPED,
      reason: 'moderate_complexity_escalation',
      inferenceState: 'INFER_WITH_DISCLOSURE',
      confidence: 0.68,
    };
  }

  // Règle 7 : Message très court (≤ 8 chars) → DIRECT
  // Seuls les messages ultra-minimaux (ex: "ok", "oui") déclenchent DIRECT.
  // Les messages plus longs reçoivent DEVELOPED par défaut.
  if (msgLen <= 8) {
    return {
      profileId: 'DIRECT',
      profile: RESPONSE_PROFILES.DIRECT,
      reason: 'short_message_direct',
      inferenceState: 'SAFE_TO_INFER',
      confidence: 0.75,
    };
  }

  // Règle 8 : Fallback = profil du mode
  return {
    profileId: modeDefault,
    profile: RESPONSE_PROFILES[modeDefault],
    reason: `mode_default:${input.mode}`,
    inferenceState: complexity > 0.5 ? 'INFER_WITH_DISCLOSURE' : 'SAFE_TO_INFER',
    confidence: 0.6,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ÉVALUATION DE L'ÉTAT D'INFÉRENCE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Évaluer si le système peut inférer l'intention ou doit clarifier.
 * Ne jamais poser de question si l'inférence est sûre.
 */
export function evaluateInferenceState(
  message: string,
  profile: ResponseProfile,
  hasContext: boolean
): InferenceState {
  const msgLen = message.length;
  const wordCount = message.split(/\s+/).filter(Boolean).length;
  const complexity = estimateComplexity(message);

  // Texte ultra-court sans contexte → toujours clarifier
  if (msgLen < 4 && !hasContext) {
    return 'CLARIFY_REQUIRED';
  }

  // Très court et très complexe sans contexte → clarification requise
  if (wordCount < 3 && complexity > 0.5 && !hasContext) {
    return 'CLARIFY_REQUIRED';
  }

  // Message complet, inférence possible selon le seuil du profil
  if (complexity <= 1.0 - profile.clarificationThreshold) {
    return 'SAFE_TO_INFER';
  }

  // Message ambigu mais assez long pour inférer avec avertissement
  if (msgLen >= 20 && complexity < 0.8) {
    return 'INFER_WITH_DISCLOSURE';
  }

  // Cas extrêmement ambigu
  if (complexity >= 0.9 && !hasContext) {
    return 'BLOCKED_BY_MISSING_FACT';
  }

  return 'INFER_WITH_DISCLOSURE';
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Estimation de complexité lexicale/structurelle d'un message.
 * Borné : 0.0 (trivial) → 1.0 (très complexe).
 * Pure fonction, pas d'I/O, pas de réseau.
 *
 * v30.2.0: Enhanced with structural analysis signals:
 * - Enumeration detection (lists, multi-point requests)
 * - Conditional/hypothetical reasoning markers
 * - Multi-topic detection (commas, semicolons, conjunctions with topic shifts)
 * - Temporal markers (past/present/future framing)
 *
 * v30.3.0: Enhanced with:
 * - Topic diversity factor: detects multi-domain requests via keyword clustering
 * - Negation/nuance signals: "mais pas", "sauf", "en revanche" indicate refined thinking
 * - Total 8-factor scoring for higher discrimination accuracy
 */
export function estimateComplexity(message: string): number {
  const words = message.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const questionCount = (message.match(/\?/g) || []).length;
  const conjunctionCount = (
    message.match(
      /\b(et|ou|mais|donc|car|or|ni|parce|because|however|although|whereas)\b/gi
    ) || []
  ).length;
  const longWordRatio = words.filter(w => w.length > 8).length / Math.max(wordCount, 1);

  // v30.2.0: Structural complexity signals
  const enumerationCount = (
    message.match(/\b(\d+[\.\)]\s|premièrement|deuxièmement|d'abord|ensuite|enfin|firstly|secondly|finally|also|de plus|par ailleurs)\b/gi) || []
  ).length;
  const conditionalCount = (
    message.match(/\b(si|sauf si|à condition|dans le cas|suppose|imaginons|et si|if|unless|assuming|what if|in case)\b/gi) || []
  ).length;
  const temporalCount = (
    message.match(/\b(avant|après|pendant|historiquement|à l'avenir|prochainement|jadis|auparavant|dorénavant|before|after|during|previously|going forward)\b/gi) || []
  ).length;

  // v30.3.0: Topic diversity — count distinct domain markers
  const domainMarkers = [
    /\b(technique|code|développement|architecture|api|backend|frontend|infrastructure)\b/gi,
    /\b(stratégie|business|marché|client|vente|marketing|croissance|revenue)\b/gi,
    /\b(équipe|management|leadership|organisation|processus|workflow|rh)\b/gi,
    /\b(personnel|vie|santé|bien-être|motivation|énergie|habitude)\b/gi,
    /\b(finance|budget|coût|investissement|rentabilité|trésorerie)\b/gi,
    /\b(juridique|contrat|conformité|rgpd|légal|réglementation)\b/gi,
    /\b(créatif|design|ux|ui|branding|visuel|identité)\b/gi,
  ];
  const topicDiversityCount = domainMarkers.filter(rx => rx.test(message)).length;

  // v30.3.0: Negation/nuance signals — indicate refined or constrained thinking
  const negationCount = (
    message.match(/\b(mais pas|sauf|en revanche|au contraire|toutefois|néanmoins|cependant|excepté|sans|not|except|rather|instead|without)\b/gi) || []
  ).length;

  // Score normalisé entre 0 et 1
  // v30.3.0: 8-factor formula with topic diversity and negation
  const lengthScore = Math.min(wordCount / 100, 1.0) * 0.20;
  const questionScore = Math.min(questionCount / 3, 1.0) * 0.19;
  const conjunctionScore = Math.min(conjunctionCount / 4, 1.0) * 0.17;
  const lexicalScore = longWordRatio * 0.17;
  const structuralScore = Math.min((enumerationCount + conditionalCount + temporalCount) / 5, 1.0) * 0.10;
  const topicScore = Math.min(topicDiversityCount / 3, 1.0) * 0.10;
  const negationScore = Math.min(negationCount / 3, 1.0) * 0.07;

  return Math.min(1.0, lengthScore + questionScore + conjunctionScore + lexicalScore + structuralScore + topicScore + negationScore);
}

/**
 * Obtenir le profil effectif pour un mode et un message donnés.
 * Fonction principale à appeler depuis chatEngine.ts.
 */
export function getEffectiveProfile(
  mode: string,
  message: string,
  modeMaxTokens?: number,
  modeTemperature?: number,
  explicitOverride?: ResponseProfileId
): { profile: ResponseProfile; selectionResult: ProfileSelectionResult } {
  const selectionResult = selectResponseProfile({
    message,
    mode,
    explicitProfileOverride: explicitOverride,
  });

  const base = selectionResult.profile;

  // Si le mode a des paramètres spécifiques plus élevés, les respecter
  const effectiveMaxTokens =
    modeMaxTokens && modeMaxTokens > base.maxTokens ? modeMaxTokens : base.maxTokens;

  const effectiveTemperature =
    modeTemperature !== undefined ? modeTemperature : base.temperature;

  const profile: ResponseProfile = {
    ...base,
    maxTokens: effectiveMaxTokens,
    temperature: effectiveTemperature,
  };

  return { profile, selectionResult };
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPATIBILITÉ PROVIDER
// ─────────────────────────────────────────────────────────────────────────────

/** Paramètres incompatibles par provider (ne jamais envoyer ces params) */
export const PROVIDER_UNSUPPORTED_PARAMS: Record<string, string[]> = {
  ollama: ['reasoning_effort', 'logprobs', 'n', 'presence_penalty'],
  'titane-local': ['reasoning_effort', 'logprobs', 'n', 'tools'],
  gemini: ['reasoning_effort', 'logit_bias', 'presence_penalty'],
  claude: ['reasoning_effort', 'logit_bias', 'n'],
  openai: [], // OpenAI supporte tous les paramètres standards
  copilot: ['reasoning_effort', 'n', 'logit_bias'],
};

/** Mapper le reasoningEffort vers le param natif provider si supporté */
export function mapReasoningEffort(
  provider: string,
  effort: ResponseProfile['reasoningEffort']
): Record<string, unknown> {
  // Seul openai (o-series) supporte reasoning_effort nativement.
  // L'API OpenAI accepte low/medium/high seulement — 'max' est plafonné à 'high'.
  if (provider === 'openai') {
    const mappedEffort = effort === 'max' ? 'high' : effort;
    return { reasoning_effort: mappedEffort };
  }
  // Ignorer pour les autres providers
  return {};
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT: POLITIQUE CANONIQUE — INTERFACE PRINCIPALE
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// INTENT CLASSIFICATION (v24.4.0)
// Semantic intent detection beyond lexical signals
// ─────────────────────────────────────────────────────────────────────────────

/** Intent types detected from user messages */
export type IntentType =
  | 'information_request' // User wants facts, explanations, or how-to
  | 'action_request' // User wants something done (code, build, deploy)
  | 'memory_recall' // User asking about past decisions, events, or stored info
  | 'current_info' // User needs fresh/web information
  | 'preference_signal' // User expressing how they like things structured
  | 'creative' // User wants generation, brainstorming, writing
  | 'diagnostic' // User asking about system state, errors, health
  | 'conversational' // Greeting, acknowledgment, social
  | 'research_analysis' // Deep research / web analysis / synthesis request
  | 'professional_document' // User wants a professional document generated (report, letter, plan, etc.)
  | 'deep_reflection' // User seeks deep reflection, philosophical analysis, introspection
  | 'memory_management' // User wants to manage, organize, review, or curate memory
  | 'message_analysis' // User wants detailed analysis of a message, conversation, or communication
  | 'data_collection'; // User wants to gather, aggregate, compile, or structure data

export interface IntentClassification {
  intent: IntentType;
  confidence: number; // 0.0-1.0
  signals: string[]; // What triggered this classification
  freshnessRequired: 'stable' | 'current' | 'realtime'; // How fresh the info needs to be
  memoryRelevance: 'low' | 'medium' | 'high'; // How relevant memory is to this intent
}

const INTENT_SIGNALS: Record<
  IntentType,
  {
    patterns: RegExp[];
    freshness: 'stable' | 'current' | 'realtime';
    memoryRelevance: 'low' | 'medium' | 'high';
  }
> = {
  information_request: {
    patterns: [
      /\b(quoi|que|comment|pourquoi|quel|quelle|explique|défini|c'est quoi|qu'est-ce)\b/i,
      /\b(what|how|why|which|explain|define|tell me)\b/i,
      /\b(différence|comparaison|pourquoi|raison)\b/i,
    ],
    freshness: 'stable',
    memoryRelevance: 'medium',
  },
  action_request: {
    patterns: [
      /\b(crée|créer|fais|faire|génère|générer|construit|construire|implémente)\b/i,
      /\b(build|create|make|generate|implement|deploy|fix|patch)\b/i,
      /\b(installe|configure|ajoute|supprime|modifie|change)\b/i,
    ],
    freshness: 'stable',
    memoryRelevance: 'high',
  },
  memory_recall: {
    patterns: [
      /\b(souviens|rappelle|qu'as-tu|qu'avons-nous|décision|choisi|choisi|dernière fois)\b/i,
      /\b(remember|recall|what did|last time|previously|before|history)\b/i,
      /\b(statut|état|progression|où en est|avancement)\b/i,
    ],
    freshness: 'stable',
    memoryRelevance: 'high',
  },
  current_info: {
    patterns: [
      /\b(actuel|aujourd'hui|maintenant|récemment|dernière|nouveau|latest)\b/i,
      /\b(current|today|now|recent|latest|new|breaking|update)\b/i,
      /\b(météo|weather|news|actualité|prix|cours|version actuelle)\b/i,
    ],
    freshness: 'current',
    memoryRelevance: 'low',
  },
  preference_signal: {
    patterns: [
      /\b(préfère|j'aime|j'aime pas|style|format|ton|manière|façon)\b/i,
      /\b(prefer|like|dislike|style|format|tone|way|manner)\b/i,
      /\b(toujours|jamais|souvent|rarement|habituellement)\b/i,
    ],
    freshness: 'stable',
    memoryRelevance: 'high',
  },
  creative: {
    patterns: [
      /\b(idée|brainstorm|invente|imag|écris|écriture|poème|histoire|story)\b/i,
      /\b(idea|brainstorm|invent|imagine|write|creative|story|poem)\b/i,
      /\b(explor|expériment|essay|proposition|suggestion)\b/i,
    ],
    freshness: 'stable',
    memoryRelevance: 'medium',
  },
  diagnostic: {
    patterns: [
      /\b(erreur|bug|problème|issue|crash|lent|performance|diagnostic)\b/i,
      /\b(error|bug|issue|problem|crash|slow|performance|diagnose)\b/i,
      /\b(log|debug|trace|status|health|santé)\b/i,
    ],
    freshness: 'realtime',
    memoryRelevance: 'high',
  },
  conversational: {
    patterns: [
      /^(salut|bonjour|hello|hi|hey|merci|thanks|ok|oui|non|bye|au revoir)$/i,
      /\b(comment ça va|how are you|quoi de neuf|what's up)\b/i,
    ],
    freshness: 'stable',
    memoryRelevance: 'low',
  },
  research_analysis: {
    patterns: [
      /\b(recherche|rechercher|cherche sur|trouve sur|analyse|analyser|étudie|étudier)\b/i,
      /\b(internet|web|en ligne|online|sources|multiples sources)\b/i,
      /\b(résumé|synthèse|rapport|bilan|compte-rendu|tour d'horizon)\b/i,
      /\b(approfond|en profondeur|détaillé|exhaustif|complet|maximum)\b/i,
      /\b(research|search the web|find online|analyze|study|investigate)\b/i,
      /\b(deep dive|deep analysis|comprehensive|thorough|in-depth)\b/i,
      /\b(croise les sources|recoup|compare les sources|vérifie)\b/i,
      /\b(enrichi(?:s|r|ssez)?\s+(?:l[ea]s?\s+)?(?:connaissance|compréhension|analyse|recherche|information))\b/i,
      /\b(état de l'art|benchmark|tendance|évolution|perspective|horizon)\b/i,
      /\b(fiabilité|véracité|fact[- ]check|vérification des sources|validation des sources)\b/i,
    ],
    freshness: 'current',
    memoryRelevance: 'medium',
  },
  professional_document: {
    patterns: [
      /\b(rédige|rédiger|rédaction|document|fichier|lettre|courrier|courriel)\b/i,
      /\b(rapport|rapport professionnel|compte[- ]rendu|note de service|mémo)\b/i,
      /\b(cv|curriculum|lettre de motivation|candidature|portfolio)\b/i,
      /\b(proposition commerciale|devis|facture|contrat|cahier des charges)\b/i,
      /\b(présentation|dossier|documentation|guide|manuel|tutoriel)\b/i,
      /\b(business plan|plan d'affaires|executive summary|pitch deck)\b/i,
      /\b(draft|write a report|formal document|professional letter|proposal)\b/i,
      /\b(procès[- ]verbal|ordre du jour|agenda|template|modèle)\b/i,
      /\b(génère un document|crée un rapport|prépare un|formalise|mets en forme)\b/i,
    ],
    freshness: 'stable',
    memoryRelevance: 'high',
  },
  deep_reflection: {
    patterns: [
      /\b(réfléchis|réflexion|réfléchir|médite|méditer|contemple|contempler)\b/i,
      /\b(sens profond|essence|fondamental|existentiel|philosophi)\b/i,
      /\b(introspection|conscience|lucidité|discernement|sagesse)\b/i,
      /\b(pourquoi vraiment|au fond|en réalité|à quoi bon|quel sens)\b/i,
      /\b(prends du recul|vision d'ensemble|perspective|hauteur de vue)\b/i,
      /\b(croyance|présupposé|biais|angle mort|hypothèse implicite)\b/i,
      /\b(reflect|ponder|contemplate|deeper meaning|underlying|fundamental)\b/i,
      /\b(what really matters|core question|root cause|big picture|first principles)\b/i,
      /\b(remise en question|questionne|challenge|remet en cause)\b/i,
    ],
    freshness: 'stable',
    memoryRelevance: 'high',
  },
  memory_management: {
    patterns: [
      /\b(mémoire|mémorise|retiens|enregistre|sauvegarde|note ça|garde en mémoire)\b/i,
      /\b(oublie|efface|supprime de ta mémoire|ne retiens plus|nettoie)\b/i,
      /\b(qu'as-tu retenu|que sais-tu sur moi|mes préférences|mes habitudes)\b/i,
      /\b(organise tes souvenirs|trie tes notes|résume ce qu'on a fait)\b/i,
      /\b(historique|journal|archive|trace|log des conversations)\b/i,
      /\b(remember this|save this|store this|keep track|forget this|clear memory)\b/i,
      /\b(what do you know about me|my preferences|my history|recall all)\b/i,
      /\b(contexte précédent|session précédente|conversation précédente|dernier échange)\b/i,
      /\b(consolide|fusionne|déduplique|priorise en mémoire|tri mémoire)\b/i,
    ],
    freshness: 'stable',
    memoryRelevance: 'high',
  },
  message_analysis: {
    patterns: [
      /\b(analyse ce message|analyse cette conversation|décortique|décompose ce texte)\b/i,
      /\b(ton du message|intention de l'auteur|sous-texte|message implicite)\b/i,
      /\b(sentiment|émotion|ressenti|perception|interprétation)\b/i,
      /\b(reformule|paraphrase|résume ce message|simplifie ce texte)\b/i,
      /\b(points clés|idées principales|arguments|structure du message)\b/i,
      /\b(analyze this message|parse this|break down|dissect|interpret this)\b/i,
      /\b(what does this mean|tone analysis|sentiment analysis|communication style)\b/i,
      /\b(qualité de la communication|clarté|cohérence|pertinence du message)\b/i,
      /\b(biais dans ce message|manipulation|rhétorique|persuasion|argumentaire)\b/i,
      /\b(non-dit|implicite|entre les lignes|ce qu'il veut dire vraiment)\b/i,
    ],
    freshness: 'stable',
    memoryRelevance: 'medium',
  },
  data_collection: {
    patterns: [
      /\b(collecte|rassemble|compile|agrège|centralise|recense|inventorie)\b/i,
      /\b(données|data|informations|statistiques|métriques|indicateurs|KPI)\b/i,
      /\b(tableau|listing|base de données|registre|catalogue|répertoire)\b/i,
      /\b(extrais les données|récupère les infos|pull data|scrape|mine)\b/i,
      /\b(structure les données|organise les infos|classe|catégorise|trie)\b/i,
      /\b(collect data|gather information|compile a list|aggregate|census)\b/i,
      /\b(benchmark|comparatif|état des lieux|inventaire|cartographie des données)\b/i,
      /\b(sources de données|provenance|fiabilité des données|qualité des données)\b/i,
      /\b(export|csv|json|tableau croisé|pivot|visualisation de données)\b/i,
      /\b(veille|monitoring|suivi|tracking|observation systématique)\b/i,
    ],
    freshness: 'current',
    memoryRelevance: 'high',
  },
};

/**
 * Classify the intent of a user message.
 * Returns intent type, confidence, signals, and routing metadata.
 *
 * v30.3.0: Enhanced with:
 * - Multi-intent detection: secondary intent tracked for hybrid routing
 * - Confidence penalization: conflicting strong signals reduce confidence
 * - Semantic boosting: intent-specific combinators (e.g. research + internet = higher confidence)
 * - Length-adaptive scoring: longer messages need proportionally more signal density
 */
export function classifyIntent(message: string): IntentClassification {
  const msgLower = message.toLowerCase();
  const wordCount = message.split(/\s+/).filter(Boolean).length;

  // Score all intents
  const intentScores: Array<{
    intent: IntentType;
    score: number;
    signals: string[];
    config: (typeof INTENT_SIGNALS)[IntentType];
  }> = [];

  for (const [intent, config] of Object.entries(INTENT_SIGNALS)) {
    let score = 0;
    const signals: string[] = [];

    for (const pattern of config.patterns) {
      if (pattern.test(msgLower)) {
        score += 1;
        signals.push(pattern.source.substring(0, 30));
      }
    }

    // Length-adaptive boost: longer messages with matching patterns get scaled boost
    if (score > 0 && wordCount > 5) {
      score *= 1.2;
    }
    // Extra boost for very long detailed messages (20+ words with 3+ signal matches)
    if (score >= 3 && wordCount > 20) {
      score *= 1.15;
    }

    if (score > 0) {
      intentScores.push({ intent: intent as IntentType, score, signals, config });
    }
  }

  // Sort by score descending
  intentScores.sort((a, b) => b.score - a.score);

  // Default to conversational for very short messages with no patterns
  if (intentScores.length === 0 && wordCount <= 3) {
    const config = INTENT_SIGNALS['conversational'];
    return {
      intent: 'conversational',
      confidence: 0.5,
      signals: [],
      freshnessRequired: config.freshness,
      memoryRelevance: config.memoryRelevance,
    };
  }

  // Default to information_request if no patterns matched
  if (intentScores.length === 0) {
    const config = INTENT_SIGNALS['information_request'];
    return {
      intent: 'information_request',
      confidence: 0.3,
      signals: [],
      freshnessRequired: config.freshness,
      memoryRelevance: config.memoryRelevance,
    };
  }

  // At this point intentScores is guaranteed non-empty (empty cases returned above)
  const best = intentScores[0]!;
  const secondBest = intentScores.length > 1 ? intentScores[1] : null;

  // v30.3.0: Confidence penalization for close-scoring competing intents
  // If two intents score very close (within 20%), reduce confidence to signal ambiguity
  let confidenceBase = best.score;
  if (secondBest && secondBest.score > best.score * 0.8) {
    confidenceBase *= 0.85; // 15% penalty for ambiguous intent
  }

  // v30.3.0: Semantic boosting for synergistic intent combinations
  // Some intent pairs naturally reinforce each other
  if (secondBest) {
    const pair = new Set([best.intent, secondBest.intent]);
    // research + deep_reflection → higher confidence (the user wants thorough analysis)
    if (pair.has('research_analysis') && pair.has('deep_reflection')) {
      confidenceBase *= 1.15;
    }
    // data_collection + research_analysis → higher confidence (structured research)
    if (pair.has('data_collection') && pair.has('research_analysis')) {
      confidenceBase *= 1.1;
    }
    // memory_management + memory_recall → higher confidence (memory-focused session)
    if (pair.has('memory_management') && pair.has('memory_recall')) {
      confidenceBase *= 1.1;
    }
    // message_analysis + deep_reflection → higher confidence (deep analytical intent)
    if (pair.has('message_analysis') && pair.has('deep_reflection')) {
      confidenceBase *= 1.1;
    }
  }

  const confidence = Math.min(1.0, confidenceBase / 2);

  // v30.3.0: Elevate memory relevance when secondary intent is memory-related
  let effectiveMemoryRelevance = best.config.memoryRelevance;
  if (
    secondBest &&
    (secondBest.intent === 'memory_recall' ||
      secondBest.intent === 'memory_management') &&
    effectiveMemoryRelevance === 'low'
  ) {
    effectiveMemoryRelevance = 'medium';
  }

  // v30.3.0: Elevate freshness when secondary intent requires current data
  let effectiveFreshness = best.config.freshness;
  if (
    secondBest &&
    secondBest.config.freshness === 'current' &&
    effectiveFreshness === 'stable'
  ) {
    effectiveFreshness = 'current';
  }

  return {
    intent: best.intent,
    confidence,
    signals: best.signals,
    freshnessRequired: effectiveFreshness,
    memoryRelevance: effectiveMemoryRelevance,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// IDENTITY CONTINUITY CONSTANTS — Stable behavioral anchors
// These define "who TITANE is" across all interactions
// ─────────────────────────────────────────────────────────────────────────────

export const IDENTITY_CONSTANTS = {
  /** Always honest about uncertainty — never fake confidence */
  grounded: true,

  /** Prefers acting over waiting when action is safe and reversible */
  actionBiased: true,

  /** Consults memory before asking the user known information */
  memoryAware: true,

  /** Respects known user preferences in response shaping */
  preferenceAware: true,

  /** Values clarity and usefulness over verbosity */
  conciseWhenPossible: true,

  /** Applies structured reasoning chains for complex analysis */
  structuredReasoning: true,

  /** Generates professional-quality formatted output when requested */
  professionalOutputCapable: true,

  /** Deep reflection with multi-perspective analysis */
  deepReflectionEnabled: true,

  /** Active memory lifecycle management (store, organize, summarize, forget) */
  memoryLifecycleEnabled: true,

  /** Deep message analysis (tone, intent, structure, implicit meaning) */
  messageAnalysisEnabled: true,

  /** Structured data collection and aggregation */
  dataCollectionEnabled: true,

  /** Internet research, analysis, and enrichment from web sources */
  internetAnalysisEnabled: true,

  /** Cross-validation of information across multiple sources */
  crossValidationEnabled: true,

  /** Adaptive depth scaling based on intent + complexity signals */
  adaptiveDepthEnabled: true,

  /** Stable system identity label */
  systemLabel: 'TITANE∞',

  /** Version for identity tracking */
  version: '30.3.0',

  /** Core behavioral promise */
  promise:
    'Je suis là pour comprendre vite, agir utile, raisonner en profondeur, gérer ta mémoire, analyser tes messages, enrichir depuis le web, et me souvenir.',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// DEPTH AUTO-SELECTION — Map intent to response depth
// ─────────────────────────────────────────────────────────────────────────────

/** Map intent type to default response depth */
export function getDepthForIntent(intent: IntentType): ResponseProfileId {
  const intentDepthMap: Record<IntentType, ResponseProfileId> = {
    conversational: 'DIRECT',
    information_request: 'DEVELOPED',
    action_request: 'DEVELOPED',
    memory_recall: 'DIRECT',
    current_info: 'DEVELOPED',
    preference_signal: 'DEVELOPED',
    creative: 'DEEP',
    diagnostic: 'DEEP',
    research_analysis: 'DEEP',
    professional_document: 'ARCHITECT',
    deep_reflection: 'DEEP',
    memory_management: 'DEVELOPED',
    message_analysis: 'DEEP',
    data_collection: 'ARCHITECT',
  };

  return intentDepthMap[intent] ?? 'DEVELOPED';
}

/**
 * Compute effective depth considering:
 * 1. User's stored depth preference (highest priority)
 * 2. Intent-based depth
 * 3. v30.3.0: Complexity-adjusted escalation — complex queries auto-escalate depth
 * 4. Mode default (fallback)
 */
export function computeEffectiveDepth(
  intent: IntentType,
  mode: string,
  userDepthPreference?: string | null,
  messageComplexity?: number
): ResponseProfileId {
  // User preference overrides everything
  if (userDepthPreference) {
    const prefToProfile: Record<string, ResponseProfileId> = {
      short: 'DIRECT',
      standard: 'BALANCED',
      developed: 'DEVELOPED',
      deep: 'ARCHITECT',
    };
    return prefToProfile[userDepthPreference] ?? 'DEVELOPED';
  }

  // Intent-based selection
  let depth = getDepthForIntent(intent);

  // v30.3.0: Complexity-adjusted escalation
  // If message complexity is high, escalate depth by one level
  if (typeof messageComplexity === 'number' && messageComplexity > 0) {
    const PROFILE_RANK: Record<ResponseProfileId, number> = {
      DIRECT: 0, BALANCED: 1, DEVELOPED: 2, DEEP: 3, ARCHITECT: 4, OMEGA: 5,
    };
    const RANK_TO_PROFILE: ResponseProfileId[] = ['DIRECT', 'BALANCED', 'DEVELOPED', 'DEEP', 'ARCHITECT', 'OMEGA'];
    const currentRank = PROFILE_RANK[depth] ?? 2;

    // Graduated escalation based on complexity score
    if (messageComplexity > 0.85 && currentRank < 4) {
      depth = RANK_TO_PROFILE[currentRank + 2] ?? depth; // Jump +2 levels for very high complexity
    } else if (messageComplexity > 0.60 && currentRank < 4) {
      depth = RANK_TO_PROFILE[currentRank + 1] ?? depth; // Escalate +1 level for moderate-high complexity
    }
  }

  return depth;
}

export const RESPONSE_POLICY_VERSION = '2.2.0';
export const RESPONSE_POLICY_DATE = '2026-04-12';

export default {
  profiles: RESPONSE_PROFILES,
  selectProfile: selectResponseProfile,
  evaluateInference: evaluateInferenceState,
  estimateComplexity,
  getEffectiveProfile,
  mapReasoningEffort,
  PROVIDER_UNSUPPORTED_PARAMS,
  VERSION: RESPONSE_POLICY_VERSION,
};
