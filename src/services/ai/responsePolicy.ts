/**
 * TITANE∞ v24.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 *   CANONICAL CHAT RESPONSE POLICY — Source de vérité unique
 *   Autorité : chatEngine.ts → orchestrator.ts → providers
 *   Profiles : DIRECT | BALANCED | DEEP | ARCHITECT
 *   Constitution : Rule 1 (Minimal patch), Rule 3 (Truth-first)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Ce fichier est l'unique source de vérité pour :
 * - La profondeur de réponse
 * - La longueur cible
 * - Le seuil d'inférence implicite
 * - La politique mémoire par profil
 * - La politique provider par profil
 * - Les étiquettes de vérité
 *
 * I14 : Un meilleur libellé n'est pas une preuve d'intelligence supérieure.
 * I15 : "Plus long" ne signifie pas répétitif, flou ou moins utile.
 */

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
  reasoningEffort: 'low' | 'medium' | 'high';

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
    // v26.0.0: truthStatus removed — kernel.evaluateTruthStatus() is the authority
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
    reasoningEffort: 'high',
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
  debug_cognitive: 'DEEP',
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

  // Règle 2 : Signaux lexicaux directs (DIRECT)
  if (DIRECT_SIGNALS.some(s => msg.includes(s))) {
    return {
      profileId: 'DIRECT',
      profile: RESPONSE_PROFILES.DIRECT,
      reason: 'direct_lexical_signal',
      inferenceState: 'SAFE_TO_INFER',
      confidence: 0.9,
    };
  }

  // Règle 3 : Signaux lexicaux ARCHITECT
  if (ARCHITECT_SIGNALS.some(s => msg.includes(s))) {
    return {
      profileId: 'ARCHITECT',
      profile: RESPONSE_PROFILES.ARCHITECT,
      reason: 'architect_lexical_signal',
      inferenceState: 'SAFE_TO_INFER',
      confidence: 0.85,
    };
  }

  // Règle 4 : Signaux lexicaux DEEP
  if (DEEP_SIGNALS.some(s => msg.includes(s))) {
    return {
      profileId: 'DEEP',
      profile: RESPONSE_PROFILES.DEEP,
      reason: 'deep_lexical_signal',
      inferenceState: 'SAFE_TO_INFER',
      confidence: 0.85,
    };
  }

  // Règle 5 : Mode actif → profil par défaut du mode
  const modeDefault = MODE_PROFILE_MAP[input.mode] ?? 'DEVELOPED';

  // Règle 6 : Complexité élevée → forcer DEEP si mode est DEVELOPED
  if (complexity > 0.75 && modeDefault === 'DEVELOPED') {
    return {
      profileId: 'DEEP',
      profile: RESPONSE_PROFILES.DEEP,
      reason: 'high_complexity_escalation',
      inferenceState: 'INFER_WITH_DISCLOSURE',
      confidence: 0.7,
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

  // Score normalisé entre 0 et 1
  const lengthScore = Math.min(wordCount / 100, 1.0) * 0.3;
  const questionScore = Math.min(questionCount / 3, 1.0) * 0.2;
  const conjunctionScore = Math.min(conjunctionCount / 4, 1.0) * 0.25;
  const lexicalScore = longWordRatio * 0.25;

  return Math.min(1.0, lengthScore + questionScore + conjunctionScore + lexicalScore);
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
  // Seul openai (o-series) supporte reasoning_effort nativement
  if (provider === 'openai') {
    return { reasoning_effort: effort };
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
  | 'conversational'; // Greeting, acknowledgment, social

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
};

/**
 * Classify the intent of a user message.
 * Returns intent type, confidence, signals, and routing metadata.
 */
export function classifyIntent(message: string): IntentClassification {
  const msgLower = message.toLowerCase();
  const wordCount = message.split(/\s+/).filter(Boolean).length;

  let bestIntent: IntentType = 'information_request';
  let bestScore = 0;
  const matchedSignals: string[] = [];

  for (const [intent, config] of Object.entries(INTENT_SIGNALS)) {
    let score = 0;
    const signals: string[] = [];

    for (const pattern of config.patterns) {
      if (pattern.test(msgLower)) {
        score += 1;
        signals.push(pattern.source.substring(0, 30));
      }
    }

    // Boost for longer messages with matching patterns
    if (score > 0 && wordCount > 5) {
      score *= 1.2;
    }

    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent as IntentType;
      matchedSignals.length = 0;
      matchedSignals.push(...signals);
    }
  }

  // Default to conversational for very short messages with no patterns
  if (bestScore === 0 && wordCount <= 3) {
    bestIntent = 'conversational';
  }

  const config = INTENT_SIGNALS[bestIntent];
  const confidence = Math.min(1.0, bestScore / 2);

  return {
    intent: bestIntent,
    confidence,
    signals: matchedSignals,
    freshnessRequired: config.freshness,
    memoryRelevance: config.memoryRelevance,
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

  /** Stable system identity label */
  systemLabel: 'TITANE∞',

  /** Version for identity tracking */
  version: '24.5.0',

  /** Core behavioral promise */
  promise: 'Je suis là pour comprendre vite, agir utile, et me souvenir.',
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
  };

  return intentDepthMap[intent] ?? 'DEVELOPED';
}

/**
 * Compute effective depth considering:
 * 1. User's stored depth preference (highest priority)
 * 2. Intent-based depth
 * 3. Mode default (fallback)
 */
export function computeEffectiveDepth(
  intent: IntentType,
  mode: string,
  userDepthPreference?: string | null
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
  return getDepthForIntent(intent);
}

export const RESPONSE_POLICY_VERSION = '1.2.0';
export const RESPONSE_POLICY_DATE = '2026-03-31';

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
