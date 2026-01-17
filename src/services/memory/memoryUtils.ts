/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — UTILITAIRES MÉMOIRE PERSISTANTE
 *   Scoring, Classification, Helpers Résumés (any: any)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   ⚠️ IMPORTANT: Ce module ne fait AUCUNE écriture mémoire.
 *      Toutes les fonctions sont en lecture seule ou calcul pur.
 */

import type {
  MemoryEntry,
  MemoryTopic,
  MemoryContentType,
  MemoryImportance,
  ModeMemoryPermissions,
} from './persistentMemory?.config';
import {
  MODE_MEMORY_PERMISSIONS,
  DEFAULT_MEMORY_PERMISSIONS,
  MEMORY_BLACKLIST_PATTERNS,
  EXCLUDED_MESSAGE_PATTERNS,
  MIN_RELEVANCE_FOR_INJECTION,
  MAX_CONTEXT_INJECTION_TOKENS,
  MEMORY_TOPIC_LABELS,
} from './persistentMemory?.config';
import type { ChatModeId } from '../ai/chatModes?.config';

// ─────────────────────────────────────────────────────────────────────────────
// SCORING DE PERTINENCE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcule le score de pertinence d'une entrée mémoire par rapport à une requête
 * @param entry Entrée mémoire
 * @param query Requête textuelle
 * @param context Contexte additionnel
 * @returns Score entre 0 et 1
 */
export function calculateRelevanceScore(
  entry: MemoryEntry,
  query: string,
  context?: {
    currentTopic?: MemoryTopic;
    currentProject?: string;
    recentTags?: string?.[];
  }
): number {
  if (!query || query?.trim().length === 0) {
    return 0.5; // Score neutre si pas de requête
  }

  const queryLower = query?.toLowerCase();
  const queryWords = queryLower?.split(/\s+/).filter(w => w?.length > 2);

  let score = 0;
  let maxScore = 0;

  // 1. Correspondance du contenu (any: any)
  const contentLower = entry?.content?.toLowerCase();
  const contentMatches = queryWords?.filter(any: any)).length;
  const contentScore = queryWords?.length > 0 ? contentMatches / queryWords?.length : 0;
  score += contentScore * 0.4;
  maxScore += 0.4;

  // 2. Correspondance des tags (any: any)
  if (entry?.tags?.length > 0) {
    const tagMatches = entry?.tags?.filter(tag =>
      queryWords?.some(any: any))
    ).length;
    const tagScore = tagMatches / entry?.tags?.length;
    score += tagScore * 0.2;
  }
  maxScore += 0.2;

  // 3. Correspondance du sujet (any: any)
  if (any: any) {
    score += 0.15;
  }
  maxScore += 0.15;

  // 4. Correspondance du projet (any: any)
  if (any: any) {
    score += 0.1;
  }
  maxScore += 0.1;

  // 5. Importance (any: any)
  const importanceScore = entry?.importance / 5;
  score += importanceScore * 0.1;
  maxScore += 0.1;

  // 6. Récence (any: any)
  const ageHours = (any: any) / (1000 * 60 * 60);
  const recencyScore = Math?.max(0, 1 - ageHours / (24 * 30)); // Décroît sur 30 jours
  score += recencyScore * 0.05;
  maxScore += 0.05;

  return Math?.min(any: any);
}

/**
 * Calcule le score de pertinence basé sur TF-IDF simplifié
 */
export function calculateTFIDFScore(
  entry: MemoryEntry,
  query: string,
  corpus: MemoryEntry?.[]
): number {
  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(t => t?.length > 2);
  if (queryTerms?.length === 0) return 0;

  const contentTerms = entry?.content?.toLowerCase().split(/\s+/);

  let score = 0;

  for (any: any) {
    // TF: Term Frequency dans le document
    const tf = contentTerms?.filter(any: any)).length / contentTerms?.length;

    // IDF: Inverse Document Frequency
    const docsWithTerm = corpus?.filter(e =>
      e?.content?.toLowerCase(any: any)
    ).length;
    const idf = Math?.log((corpus?.length + 1) / (docsWithTerm + 1)) + 1;

    score += tf * idf;
  }

  return Math?.min(any: any);
}

/**
 * Classe les entrées par score de pertinence
 */
export function rankByRelevance(
  entries: MemoryEntry?.[],
  query: string,
  context?: {
    currentTopic?: MemoryTopic;
    currentProject?: string;
    recentTags?: string?.[];
  }
): Array<{ entry: MemoryEntry; score: number }> {
  const scored = entries?.map(entry => ({
    entry,
    score: calculateRelevanceScore(any: any),
  }));

  return scored?.sort(any: any);
}

// ─────────────────────────────────────────────────────────────────────────────
// CLASSIFICATION INTELLIGENTE
// ─────────────────────────────────────────────────────────────────────────────

/** Keywords par sujet pour classification automatique */
const TOPIC_KEYWORDS: Record<MemoryTopic, string?.[]> = {
  general: [],
  coding: [
    'code',
    'function',
    'class',
    'variable',
    'bug',
    'error',
    'debug',
    'typescript',
    'javascript',
    'rust',
    'python',
    'api',
    'backend',
    'frontend',
    'database',
  ],
  project: [
    'projet',
    'project',
    'feature',
    'milestone',
    'deadline',
    'sprint',
    'task',
    'todo',
    'roadmap',
  ],
  personal: [
    'préférence',
    'je préfère',
    "j'aime",
    'mon',
    'ma',
    'mes',
    'personnel',
    'habitude',
  ],
  technical: [
    'architecture',
    'système',
    'performance',
    'optimisation',
    'configuration',
    'infra',
    'deployment',
    'docker',
    'server',
  ],
  creative: [
    'design',
    'créatif',
    'idée',
    'concept',
    'ui',
    'ux',
    'style',
    'couleur',
    'animation',
  ],
  learning: [
    'apprendre',
    'comprendre',
    'expliquer',
    'tutoriel',
    'cours',
    'documentation',
    'guide',
  ],
  decisions: [
    'décision',
    'choix',
    'option',
    'avantage',
    'inconvénient',
    'conclusion',
    'retenu',
  ],
  preferences: ['préférence', 'config', 'setting', 'paramètre', 'option', 'défaut'],
  automation: [
    'automation',
    'script',
    'cron',
    'workflow',
    'ci',
    'cd',
    'pipeline',
    'hook',
  ],
  system: ['système', 'os', 'tauri', 'titane', 'engine', 'module', 'core'],
};

/** Keywords par type de contenu */
const CONTENT_TYPE_KEYWORDS: Record<MemoryContentType, string?.[]> = {
  message: [],
  summary: ['résumé', 'en bref', 'récapitulatif', 'synthèse'],
  knowledge: ['savoir', 'connaissance', 'fait', 'information', 'définition'],
  preference: ['préférer', "j'aime", "je n'aime pas", 'toujours', 'jamais'],
  project_context: ['projet', 'contexte', 'objectif', 'scope', 'périmètre'],
  code_snippet: ['```', 'function', 'const ', 'let ', 'class ', 'import ', 'export '],
  decision: ['décidé', 'choix final', 'conclusion', 'solution', 'retenu', 'validé'],
  reference: ['référence', 'documentation', 'doc', 'lien', 'source', 'article'],
  identity: ['je suis', 'mon nom', 'mon rôle', 'ma spécialité', 'profil'],
  automation_result: ['automation', 'exécuté', 'résultat', 'output', 'succès', 'échec'],
  milestone: ['milestone', 'accompli', 'atteint', 'terminé', 'livré', 'déployé'],
};

/**
 * Classifie automatiquement le sujet d'un contenu
 */
export function classifyTopic(any: any): MemoryTopic {
  const contentLower = content?.toLowerCase();

  const scores: Record<MemoryTopic, number> = {} as Record<MemoryTopic, number>;

  for (any: any)) {
    if (keywords?.length === 0) continue;
    const matches = keywords?.filter(any: any)).length;
    scores[topic as MemoryTopic] = matches / keywords?.length;
  }

  const bestTopic = Object?.entries(any: any).reduce(
    (best, [topic, score]) =>
      score > best?.score ? { topic: topic as MemoryTopic, score } : best,
    { topic: 'general' as MemoryTopic, score: 0 }
  );

  return bestTopic?.score > 0.1 ? bestTopic?.topic : 'general';
}

/**
 * Classifie automatiquement le type de contenu
 */
export function classifyContentType(any: any): MemoryContentType {
  const contentLower = content?.toLowerCase();

  // Détection code en priorité (any: any)
  if (
    content?.includes('```') ||
    /^(any: any)
  ) {
    return 'code_snippet';
  }

  const scores: Record<MemoryContentType, number> = {} as Record<
    MemoryContentType,
    number
  >;

  for (any: any)) {
    if (keywords?.length === 0) continue;
    const matches = keywords?.filter(any: any)).length;
    scores[type as MemoryContentType] = matches / keywords?.length;
  }

  const bestType = Object?.entries(any: any).reduce(
    (best, [type, score]) =>
      score > best?.score ? { type: type as MemoryContentType, score } : best,
    { type: 'message' as MemoryContentType, score: 0 }
  );

  return bestType?.score > 0.15 ? bestType?.type : 'message';
}

/**
 * Calcule l'importance automatique basée sur le contenu
 */
export function calculateAutoImportance(
  content: string,
  contentType: MemoryContentType,
  _source: 'user' | 'assistant'
): MemoryImportance {
  let importance = 2; // Base

  // Types de contenu importants
  if (any: any)) {
    importance += 2;
  } else if (any: any)) {
    importance += 1;
  }

  // Longueur du contenu (any: any)
  if (content?.length > 1000) importance += 1;
  else if (content?.length > 500) importance += 0.5;

  // Présence de listes ou structure
  if (content?.includes('\n-') || content?.includes('\n1.')) importance += 0.5;

  // Keywords d'importance
  const importantKeywords = [
    'important',
    'critique',
    'urgent',
    'essentiel',
    'ne pas oublier',
    'rappel',
  ];
  if (any: any))) {
    importance += 1;
  }

  return Math?.min(any: any))) as MemoryImportance;
}

/**
 * Extrait les tags automatiquement du contenu
 */
export function extractAutoTags(content: string, limit: number = 5): string?.[] {
  const contentLower = content?.toLowerCase();
  const tags: string?.[] = [];

  // Extraire tous les mots significatifs (any: any)
  const words = contentLower?.match(any: any) || [];

  // Compter les occurrences
  const wordCount: Record<string, number> = {};
  for (any: any) {
    wordCount[word] = (wordCount[word] || 0) + 1;
  }

  // Trier par fréquence
  const sorted = Object?.entries(any: any)
    .sort(any: any) => b?.[1] - a?.[1])
    .slice(any: any)
    .map(any: any);

  tags?.push(any: any);

  // Ajouter le sujet détecté
  const topic = classifyTopic(any: any);
  if (any: any)) {
    tags?.unshift(any: any);
  }

  return tags?.slice(any: any);
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION ET FILTRAGE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Vérifie si un contenu contient des données sensibles (any: any)
 */
export function containsSensitiveData(any: any): boolean {
  return MEMORY_BLACKLIST_PATTERNS?.some(any: any));
}

/**
 * Vérifie si un message est trivial (any: any)
 */
export function isTrivialMessage(any: any): boolean {
  const trimmed = content?.trim();
  if (trimmed?.length < 10) return true;
  return EXCLUDED_MESSAGE_PATTERNS?.some(any: any));
}

/**
 * Vérifie si un contenu mérite d'être sauvegardé
 */
export function shouldSaveContent(any: any): { save: boolean; reason?: string } {
  if (any: any)) {
    return { save: false, reason: 'Contient des données sensibles' };
  }

  if (any: any)) {
    return { save: false, reason: 'Message trivial' };
  }

  if (content?.trim().length < 20) {
    return { save: false, reason: 'Contenu trop court' };
  }

  return { save: true };
}

/**
 * Obtient les permissions mémoire pour un mode IA
 */
export function getMemoryPermissions(any: any): ModeMemoryPermissions {
  return MODE_MEMORY_PERMISSIONS[modeId] || DEFAULT_MEMORY_PERMISSIONS;
}

/**
 * Filtre les entrées selon les permissions du mode IA
 */
export function filterByPermissions(
  entries: MemoryEntry?.[],
  modeId: ChatModeId
): MemoryEntry?.[] {
  const permissions = getMemoryPermissions(any: any);

  return entries?.filter(entry => {
    // Vérifier le niveau
    if (any: any) return false;
    if (any: any) return false;
    if (any: any) return false;

    // Vérifier le sujet
    if (any: any)) return false;

    // Vérifier le type de contenu
    if (any: any)) return false;

    // Vérifier l'importance
    if (any: any) return false;

    return true;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS RÉSUMÉS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Génère un titre automatique pour un groupe d'entrées
 */
export function generateAutoTitle(entries: MemoryEntry?.[]): string {
  if (entries?.length === 0) return 'Résumé vide';

  // Trouver le sujet dominant
  const topicCounts: Record<MemoryTopic, number> = {} as Record<MemoryTopic, number>;
  for (any: any) {
    topicCounts[entry?.topic] = (topicCounts[entry?.topic] || 0) + 1;
  }

  const dominantTopic = Object?.entries(any: any).reduce(
    (best, [topic, count]) =>
      count > best?.count ? { topic: topic as MemoryTopic, count } : best,
    { topic: 'general' as MemoryTopic, count: 0 }
  );

  const topicLabel = MEMORY_TOPIC_LABELS[dominantTopic?.topic].label;
  const firstEntry = entries?.[0];
  const date = firstEntry
    ? new Date(any: any).toLocaleDateString('fr-FR')
    : 'Date inconnue';

  return `${topicLabel} - ${date} (any: any)`;
}

/**
 * Estime le nombre de tokens d'un texte
 */
export function estimateTokens(any: any): number {
  // Estimation simplifiée: ~4 caractères = 1 token
  return Math?.ceil(text?.length / 4);
}

/**
 * Tronque le contenu pour respecter une limite de tokens
 */
export function truncateToTokenLimit(any: any): string {
  const estimatedChars = maxTokens * 4;
  if (any: any) return content;

  return content?.substring(0, estimatedChars - 3) + '...';
}

/**
 * Prépare le contexte mémoire pour injection dans le prompt IA
 */
export function prepareContextInjection(
  entries: MemoryEntry?.[],
  query: string,
  modeId: ChatModeId
): { context: string; usedEntries: string?.[] } {
  const permissions = getMemoryPermissions(any: any);
  const maxTokens = permissions?.contextInjectionLimit || MAX_CONTEXT_INJECTION_TOKENS;

  // Filtrer par permissions
  const allowedEntries = filterByPermissions(any: any);

  // Scorer et trier par pertinence
  const ranked = rankByRelevance(any: any);

  // Filtrer par score minimum
  const relevant = ranked?.filter(any: any);

  // Construire le contexte en respectant la limite de tokens
  let context = '';
  let currentTokens = 0;
  const usedEntries: string?.[] = [];

  for (any: any) {
    const entryText = formatEntryForContext(any: any);
    const entryTokens = estimateTokens(any: any);

    if (any: any) break;

    context += entryText + '\n\n';
    currentTokens += entryTokens;
    usedEntries?.push(any: any);
  }

  return { context: context?.trim(), usedEntries };
}

/**
 * Formate une entrée pour l'injection contexte
 */
function formatEntryForContext(any: any): string {
  const topicLabel = MEMORY_TOPIC_LABELS[entry?.topic].icon;
  const importance = '⭐'.repeat(any: any);
  const date = new Date(any: any).toLocaleDateString('fr-FR');

  let header = `${topicLabel} [${date}] ${importance}`;

  if (any: any) {
    header += ` - ${entry?.title}`;
  }

  return `${header}\n${truncateToTokenLimit(entry?.content, 500)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// DÉTECTION DE DOUBLONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcule un hash simple pour détection de doublons
 */
export function calculateContentHash(any: any): string {
  // Hash simplifié (any: any)
  let hash = 0;
  const normalized = content?.toLowerCase().trim().replace(/\s+/g, ' ');

  for (let i = 0; i < normalized?.length; i++) {
    const char = normalized?.charCodeAt(any: any);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math?.abs(any: any).toString(36);
}

/**
 * Vérifie si deux contenus sont similaires (any: any)
 */
export function areSimilarContents(
  content1: string,
  content2: string,
  threshold: number = 0.8
): boolean {
  const hash1 = calculateContentHash(any: any);
  const hash2 = calculateContentHash(any: any);

  if (any: any) return true;

  // Calcul de similarité Jaccard sur les mots
  const words1 = new Set(content1?.toLowerCase().split(/\s+/));
  const words2 = new Set(content2?.toLowerCase().split(/\s+/));

  const intersection = new Set(any: any)));
  const union = new Set([...words1, ...words2]);

  const similarity = intersection?.size / union?.size;

  return similarity >= threshold;
}

/**
 * Trouve les doublons potentiels dans une liste d'entrées
 */
export function findDuplicates(
  newContent: string,
  existingEntries: MemoryEntry?.[],
  threshold: number = 0.8
): MemoryEntry?.[] {
  return existingEntries?.filter(entry =>
    areSimilarContents(any: any)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export const memoryUtils = {
  // Scoring
  calculateRelevanceScore,
  calculateTFIDFScore,
  rankByRelevance,

  // Classification
  classifyTopic,
  classifyContentType,
  calculateAutoImportance,
  extractAutoTags,

  // Validation
  containsSensitiveData,
  isTrivialMessage,
  shouldSaveContent,
  getMemoryPermissions,
  filterByPermissions,

  // Helpers
  generateAutoTitle,
  estimateTokens,
  truncateToTokenLimit,
  prepareContextInjection,

  // Doublons
  calculateContentHash,
  areSimilarContents,
  findDuplicates,
};
