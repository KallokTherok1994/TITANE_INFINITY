/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ — Message Quality Scorer
 *
 * Évalue la qualité des interactions utilisateur avec TITANE pour
 * attribuer des points XP proportionnels à la cohérence et la
 * pertinence des messages et conversations.
 *
 * Critères d'évaluation:
 *  1. Longueur et effort du message
 *  2. Cohérence linguistique (structure, ponctuation)
 *  3. Pertinence contextuelle (mots-clés spécifiques, questions ciblées)
 *  4. Complexité de la demande (technique, analytique, créative)
 *  5. Continuité conversationnelle (suivi du contexte)
 * ═══════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface QualityScore {
  /** Score total (0-100) */
  total: number;
  /** Score de longueur/effort (0-20) */
  lengthScore: number;
  /** Score de cohérence (0-25) */
  coherenceScore: number;
  /** Score de pertinence (0-25) */
  relevanceScore: number;
  /** Score de complexité (0-20) */
  complexityScore: number;
  /** Score de continuité conversationnelle (0-10) */
  continuityScore: number;
  /** Tier de qualité déterminé */
  tier: QualityTier;
}

export type QualityTier = 'minimal' | 'basic' | 'good' | 'excellent' | 'exceptional';

export interface QualityXPReward {
  /** XP de base du message */
  baseXP: number;
  /** XP bonus basé sur la qualité */
  qualityBonusXP: number;
  /** XP total attribué */
  totalXP: number;
  /** Tier de qualité */
  tier: QualityTier;
  /** Score détaillé */
  score: QualityScore;
}

export interface ConversationContext {
  /** Nombre de messages dans la conversation courante */
  messageCount: number;
  /** Derniers sujets abordés */
  recentTopics: string[];
  /** Le message précédent de l'utilisateur (pour évaluer la continuité) */
  previousUserMessage?: string;
  /** La dernière réponse de TITANE */
  previousAssistantResponse?: string;
}

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

/** XP de base attribué pour chaque message (participation) */
const BASE_MESSAGE_XP = 5;

/** Multiplicateurs XP par tier de qualité */
const TIER_MULTIPLIERS: Record<QualityTier, number> = {
  minimal: 1.0,
  basic: 1.5,
  good: 2.5,
  excellent: 4.0,
  exceptional: 6.0,
};

/** Seuils de score pour les tiers */
const TIER_THRESHOLDS: { min: number; tier: QualityTier }[] = [
  { min: 80, tier: 'exceptional' },
  { min: 60, tier: 'excellent' },
  { min: 40, tier: 'good' },
  { min: 20, tier: 'basic' },
  { min: 0, tier: 'minimal' },
];

/** Mots-clés techniques/spécifiques qui indiquent pertinence */
const RELEVANCE_KEYWORDS_FR = [
  'analyse', 'optimise', 'améliore', 'configure', 'explique', 'détaille',
  'compare', 'évalue', 'recherche', 'développe', 'implémente', 'corrige',
  'résume', 'planifie', 'organise', 'structure', 'diagnostique', 'résous',
  'documente', 'teste', 'vérifie', 'surveille', 'automatise', 'intègre',
  'architecture', 'stratégie', 'performance', 'sécurité', 'qualité',
  'comment', 'pourquoi', 'quand', 'combien', 'quel', 'quelle',
];

const RELEVANCE_KEYWORDS_EN = [
  'analyze', 'optimize', 'improve', 'configure', 'explain', 'detail',
  'compare', 'evaluate', 'research', 'develop', 'implement', 'fix',
  'summarize', 'plan', 'organize', 'structure', 'diagnose', 'solve',
  'document', 'test', 'verify', 'monitor', 'automate', 'integrate',
  'architecture', 'strategy', 'performance', 'security', 'quality',
  'how', 'why', 'when', 'what', 'which', 'where',
];

/** Indicateurs de complexité */
const COMPLEXITY_INDICATORS = [
  // Technique
  'api', 'base de données', 'database', 'algorithme', 'algorithm',
  'framework', 'typescript', 'javascript', 'python', 'rust',
  'backend', 'frontend', 'fullstack', 'devops', 'ci/cd',
  'docker', 'kubernetes', 'microservice', 'serverless',
  // Analytique
  'tendance', 'trend', 'corrélation', 'correlation', 'régression',
  'projection', 'prédiction', 'prediction', 'modèle', 'model',
  'statistique', 'statistic', 'métrique', 'metric',
  // Créatif
  'design', 'conception', 'innovation', 'créatif', 'creative',
  'prototype', 'itération', 'iteration', 'brainstorm',
  // Business
  'roi', 'kpi', 'objectif', 'objective', 'budget', 'timeline',
  'roadmap', 'milestone', 'sprint', 'agile', 'scrum',
];

/** Indicateurs de continuité conversationnelle */
const CONNECTOR_PATTERN = /\b(donc|ainsi|car|parce que|cependant|néanmoins|toutefois|en effet|par conséquent|because|however|therefore|moreover|furthermore|additionally|consequently)\b/i;

/** Patterns d'action explicite */
const ACTION_PATTERN = /\b(peux-tu|pourrais-tu|je veux|j'aimerais|aide-moi|can you|could you|please|help me|i want|i need|i'd like)\b/i;

/** Patterns de contexte spécifique */
const CONTEXT_PATTERN = /\b(le fichier|le projet|le code|la page|le module|l'application|the file|the project|the code|the page|the module|the app)\b/i;

/** Patterns de multi-aspects */
const MULTI_ASPECT_PATTERN = /\b(et aussi|également|de plus|aussi|en plus|and also|additionally|also|moreover|as well)\b/i;

/** Patterns de référence conversationnelle */
const REFERENCE_PATTERN = /\b(oui|non|exactement|c'est ça|d'accord|merci|continue|précise|yes|no|exactly|right|thanks|continue|clarify|go on|parfait|super)\b/i;

// ─────────────────────────────────────────────────────────────────
// SCORING FUNCTIONS
// ─────────────────────────────────────────────────────────────────

/**
 * Évalue le score de longueur/effort (0-20)
 * Messages très courts = peu d'effort, messages détaillés = plus d'effort
 */
function scoreLengthEffort(message: string): number {
  const len = message.trim().length;
  if (len < 5) return 0;
  if (len < 15) return 3;
  if (len < 30) return 6;
  if (len < 60) return 10;
  if (len < 120) return 14;
  if (len < 250) return 17;
  return 20;
}

/**
 * Évalue la cohérence linguistique (0-25)
 * Examine la structure du message, la ponctuation, les phrases complètes
 */
function scoreCoherence(message: string): number {
  const trimmed = message.trim();
  let score = 0;

  // Commence par une majuscule (+3)
  if (/^[A-ZÀ-ÖÙ-Ü]/.test(trimmed)) {
    score += 3;
  }

  // Contient de la ponctuation finale (+4)
  if (/[.!?;:]$/.test(trimmed)) {
    score += 4;
  }

  // Contient des phrases multiples (indicateur de développement) (+5)
  const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 5);
  if (sentences.length >= 2) {
    score += Math.min(5, sentences.length);
  }

  // Pas d'abus de majuscules ou caractères spéciaux (+3)
  const upperRatio = (trimmed.match(/[A-Z]/g) || []).length / Math.max(1, trimmed.length);
  if (upperRatio < 0.5) {
    score += 3;
  }

  // Contient des mots connecteurs (donc, ainsi, car, parce que, cependant) (+5)
  if (CONNECTOR_PATTERN.test(trimmed)) {
    score += 5;
  }

  // Utilisation de virgules/structures complexes (+5)
  const commaCount = (trimmed.match(/,/g) || []).length;
  if (commaCount >= 1) {
    score += Math.min(5, commaCount * 2);
  }

  return Math.min(25, score);
}

/**
 * Évalue la pertinence du message (0-25)
 * Analyse les mots-clés, les questions ciblées, et les intentions
 */
function scoreRelevance(message: string): number {
  const lower = message.toLowerCase();
  let score = 0;

  // Mots-clés pertinents FR
  const frHits = RELEVANCE_KEYWORDS_FR.filter(kw => lower.includes(kw));
  score += Math.min(10, frHits.length * 2);

  // Mots-clés pertinents EN
  const enHits = RELEVANCE_KEYWORDS_EN.filter(kw => lower.includes(kw));
  score += Math.min(10, enHits.length * 2);

  // Question directe (+5)
  if (/\?/.test(message)) {
    score += 3;
  }

  // Demande explicite d'action (+5)
  if (ACTION_PATTERN.test(message)) {
    score += 5;
  }

  // Référence à un contexte spécifique (+3)
  if (CONTEXT_PATTERN.test(message)) {
    score += 3;
  }

  return Math.min(25, score);
}

/**
 * Évalue la complexité de la demande (0-20)
 * Plus la demande est complexe/technique, plus le score est élevé
 */
function scoreComplexity(message: string): number {
  const lower = message.toLowerCase();
  let score = 0;

  // Indicateurs de complexité trouvés
  const complexityHits = COMPLEXITY_INDICATORS.filter(ind => lower.includes(ind));
  score += Math.min(10, complexityHits.length * 2);

  // Message multi-aspects (contient "et", "aussi", "également") (+5)
  if (MULTI_ASPECT_PATTERN.test(message)) {
    score += 3;
  }

  // Contient des exemples ou du code (+5)
  if (/```|`[^`]+`|exemple|example/i.test(message)) {
    score += 5;
  }

  // Contient des chiffres/données spécifiques (+2)
  if (/\d+/.test(message)) {
    score += 2;
  }

  return Math.min(20, score);
}

/**
 * Évalue la continuité conversationnelle (0-10)
 * Un message qui fait suite logiquement à la conversation = plus de points
 */
function scoreContinuity(
  message: string,
  context: ConversationContext
): number {
  let score = 0;

  // Conversation en cours (+3 si au moins 2 messages dans la conversation)
  if (context.messageCount >= 2) {
    score += 3;
  }

  // Référence au message précédent (continuité) (+4)
  if (context.previousAssistantResponse) {
    if (REFERENCE_PATTERN.test(message)) {
      score += 2;
    }

    // Mots partagés entre la réponse précédente et le message actuel
    const prevWords = new Set(
      context.previousAssistantResponse
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 4)
    );
    const currentWords = message.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const overlap = currentWords.filter(w => prevWords.has(w)).length;
    if (overlap >= 2) {
      score += 2;
    }
  }

  // Conversation longue (engagement soutenu) (+3)
  if (context.messageCount >= 5) {
    score += 2;
  }
  if (context.messageCount >= 10) {
    score += 1;
  }

  return Math.min(10, score);
}

// ─────────────────────────────────────────────────────────────────
// MAIN API
// ─────────────────────────────────────────────────────────────────

/**
 * Détermine le tier de qualité à partir du score total
 */
export function determineTier(totalScore: number): QualityTier {
  for (const threshold of TIER_THRESHOLDS) {
    if (totalScore >= threshold.min) {
      return threshold.tier;
    }
  }
  return 'minimal';
}

/**
 * Évalue la qualité d'un message utilisateur
 */
export function evaluateMessageQuality(
  message: string,
  context: ConversationContext = { messageCount: 1, recentTopics: [] }
): QualityScore {
  const lengthScore = scoreLengthEffort(message);
  const coherenceScore = scoreCoherence(message);
  const relevanceScore = scoreRelevance(message);
  const complexityScore = scoreComplexity(message);
  const continuityScore = scoreContinuity(message, context);

  const total = lengthScore + coherenceScore + relevanceScore + complexityScore + continuityScore;
  const tier = determineTier(total);

  return {
    total,
    lengthScore,
    coherenceScore,
    relevanceScore,
    complexityScore,
    continuityScore,
    tier,
  };
}

/**
 * Calcule la récompense XP basée sur la qualité du message
 *
 * Chaque message rapporte un minimum de BASE_MESSAGE_XP (5 XP) pour
 * comptabiliser l'utilisation de TITANE. Un bonus XP est ajouté selon
 * la qualité de l'interaction évaluée.
 */
export function calculateQualityXPReward(
  message: string,
  context: ConversationContext = { messageCount: 1, recentTopics: [] }
): QualityXPReward {
  const score = evaluateMessageQuality(message, context);
  const multiplier = TIER_MULTIPLIERS[score.tier];
  const qualityBonusXP = Math.round(BASE_MESSAGE_XP * (multiplier - 1));
  const totalXP = BASE_MESSAGE_XP + qualityBonusXP;

  return {
    baseXP: BASE_MESSAGE_XP,
    qualityBonusXP,
    totalXP,
    tier: score.tier,
    score,
  };
}

/**
 * Calcule les XP gagnés par TITANE pour sa réponse
 * TITANE gagne des XP à chaque message pour comptabiliser son utilisation
 */
export function calculateTitaneResponseXP(
  responseLength: number,
  wasHelpful: boolean = true
): number {
  let xp = 3; // XP de base pour chaque réponse TITANE

  // Bonus selon la longueur de réponse (effort de TITANE)
  if (responseLength > 500) xp += 2;
  if (responseLength > 1000) xp += 3;
  if (responseLength > 2000) xp += 5;

  // Bonus si la réponse a été utile
  if (wasHelpful) xp += 2;

  return xp;
}
