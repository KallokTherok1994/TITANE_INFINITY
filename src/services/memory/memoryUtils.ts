/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — UTILITAIRES MÉMOIRE PERSISTANTE
 *   Scoring, Classification, Helpers Résumés (READ-ONLY Frontend)
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
} from './persistentMemory.config';
import {
  MODE_MEMORY_PERMISSIONS,
  DEFAULT_MEMORY_PERMISSIONS,
  MEMORY_BLACKLIST_PATTERNS,
  EXCLUDED_MESSAGE_PATTERNS,
  MIN_RELEVANCE_FOR_INJECTION,
  MAX_CONTEXT_INJECTION_TOKENS,
  MEMORY_TOPIC_LABELS,
} from './persistentMemory.config';
import type { ChatModeId } from '../ai/chatModes.config';

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
    recentTags?: string[];
  }
): number {
  if (!query || query.trim().length === 0) {
    return 0.5; // Score neutre si pas de requête
  }

  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

  let score = 0;
  let maxScore = 0;

  // 1. Correspondance du contenu (40% du score)
  const contentLower = entry.content.toLowerCase();
  const contentMatches = queryWords.filter(w => contentLower.includes(w)).length;
  const contentScore = queryWords.length > 0 ? contentMatches / queryWords.length : 0;
  score += contentScore * 0.4;
  maxScore += 0.4;

  // 2. Correspondance des tags (20% du score)
  if (entry.tags.length > 0) {
    const tagMatches = entry.tags.filter(tag =>
      queryWords.some(w => tag.toLowerCase().includes(w))
    ).length;
    const tagScore = tagMatches / entry.tags.length;
    score += tagScore * 0.2;
  }
  maxScore += 0.2;

  // 3. Correspondance du sujet (15% du score)
  if (context?.currentTopic && entry.topic === context.currentTopic) {
    score += 0.15;
  }
  maxScore += 0.15;

  // 4. Correspondance du projet (10% du score)
  if (context?.currentProject && entry.metadata.projectId === context.currentProject) {
    score += 0.1;
  }
  maxScore += 0.1;

  // 5. Importance (10% du score)
  const importanceScore = entry.importance / 5;
  score += importanceScore * 0.1;
  maxScore += 0.1;

  // 6. Récence (5% du score)
  const ageHours = (Date.now() - entry.metadata.createdAt) / (1000 * 60 * 60);
  const recencyScore = Math.max(0, 1 - ageHours / (24 * 30)); // Décroît sur 30 jours
  score += recencyScore * 0.05;
  maxScore += 0.05;

  return Math.min(1, score / maxScore);
}

/**
 * Calcule le score de pertinence basé sur TF-IDF simplifié
 */
export function calculateTFIDFScore(
  entry: MemoryEntry,
  query: string,
  corpus: MemoryEntry[]
): number {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  if (queryTerms.length === 0) return 0;

  const contentTerms = entry.content.toLowerCase().split(/\s+/);

  let score = 0;

  for (const term of queryTerms) {
    // TF: Term Frequency dans le document
    const tf = contentTerms.filter(t => t.includes(term)).length / contentTerms.length;

    // IDF: Inverse Document Frequency
    const docsWithTerm = corpus.filter(e =>
      e.content.toLowerCase().includes(term)
    ).length;
    const idf = Math.log((corpus.length + 1) / (docsWithTerm + 1)) + 1;

    score += tf * idf;
  }

  return Math.min(1, score / queryTerms.length);
}

/**
 * Classe les entrées par score de pertinence
 */
export function rankByRelevance(
  entries: MemoryEntry[],
  query: string,
  context?: {
    currentTopic?: MemoryTopic;
    currentProject?: string;
    recentTags?: string[];
  }
): Array<{ entry: MemoryEntry; score: number }> {
  const scored = entries.map(entry => ({
    entry,
    score: calculateRelevanceScore(entry, query, context),
  }));

  return scored.sort((a, b) => b.score - a.score);
}

// ─────────────────────────────────────────────────────────────────────────────
// CLASSIFICATION INTELLIGENTE
// ─────────────────────────────────────────────────────────────────────────────

/** Keywords par sujet pour classification automatique */
const TOPIC_KEYWORDS: Record<MemoryTopic, string[]> = {
  general: [],
  coding: ['code', 'function', 'class', 'variable', 'bug', 'error', 'debug', 'typescript', 'javascript', 'rust', 'python', 'api', 'backend', 'frontend', 'database'],
  project: ['projet', 'project', 'feature', 'milestone', 'deadline', 'sprint', 'task', 'todo', 'roadmap'],
  personal: ['préférence', 'je préfère', 'j\'aime', 'mon', 'ma', 'mes', 'personnel', 'habitude'],
  technical: ['architecture', 'système', 'performance', 'optimisation', 'configuration', 'infra', 'deployment', 'docker', 'server'],
  creative: ['design', 'créatif', 'idée', 'concept', 'ui', 'ux', 'style', 'couleur', 'animation'],
  learning: ['apprendre', 'comprendre', 'expliquer', 'tutoriel', 'cours', 'documentation', 'guide'],
  decisions: ['décision', 'choix', 'option', 'avantage', 'inconvénient', 'conclusion', 'retenu'],
  preferences: ['préférence', 'config', 'setting', 'paramètre', 'option', 'défaut'],
  automation: ['automation', 'script', 'cron', 'workflow', 'ci', 'cd', 'pipeline', 'hook'],
  system: ['système', 'os', 'tauri', 'titane', 'engine', 'module', 'core'],
};

/** Keywords par type de contenu */
const CONTENT_TYPE_KEYWORDS: Record<MemoryContentType, string[]> = {
  message: [],
  summary: ['résumé', 'en bref', 'récapitulatif', 'synthèse'],
  knowledge: ['savoir', 'connaissance', 'fait', 'information', 'définition'],
  preference: ['préférer', 'j\'aime', 'je n\'aime pas', 'toujours', 'jamais'],
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
export function classifyTopic(content: string): MemoryTopic {
  const contentLower = content.toLowerCase();

  const scores: Record<MemoryTopic, number> = {} as Record<MemoryTopic, number>;

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.length === 0) continue;
    const matches = keywords.filter(kw => contentLower.includes(kw)).length;
    scores[topic as MemoryTopic] = matches / keywords.length;
  }

  const bestTopic = Object.entries(scores).reduce(
    (best, [topic, score]) => score > best.score ? { topic: topic as MemoryTopic, score } : best,
    { topic: 'general' as MemoryTopic, score: 0 }
  );

  return bestTopic.score > 0.1 ? bestTopic.topic : 'general';
}

/**
 * Classifie automatiquement le type de contenu
 */
export function classifyContentType(content: string): MemoryContentType {
  const contentLower = content.toLowerCase();

  // Détection code en priorité (pattern spécifique)
  if (content.includes('```') || /^(const|let|var|function|class|import|export|def|pub|fn)\s/.test(content)) {
    return 'code_snippet';
  }

  const scores: Record<MemoryContentType, number> = {} as Record<MemoryContentType, number>;

  for (const [type, keywords] of Object.entries(CONTENT_TYPE_KEYWORDS)) {
    if (keywords.length === 0) continue;
    const matches = keywords.filter(kw => contentLower.includes(kw)).length;
    scores[type as MemoryContentType] = matches / keywords.length;
  }

  const bestType = Object.entries(scores).reduce(
    (best, [type, score]) => score > best.score ? { type: type as MemoryContentType, score } : best,
    { type: 'message' as MemoryContentType, score: 0 }
  );

  return bestType.score > 0.15 ? bestType.type : 'message';
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
  if (['decision', 'knowledge', 'reference', 'milestone'].includes(contentType)) {
    importance += 2;
  } else if (['code_snippet', 'project_context'].includes(contentType)) {
    importance += 1;
  }

  // Longueur du contenu (messages longs = plus importants)
  if (content.length > 1000) importance += 1;
  else if (content.length > 500) importance += 0.5;

  // Présence de listes ou structure
  if (content.includes('\n-') || content.includes('\n1.')) importance += 0.5;

  // Keywords d'importance
  const importantKeywords = ['important', 'critique', 'urgent', 'essentiel', 'ne pas oublier', 'rappel'];
  if (importantKeywords.some(kw => content.toLowerCase().includes(kw))) {
    importance += 1;
  }

  return Math.min(5, Math.max(1, Math.round(importance))) as MemoryImportance;
}

/**
 * Extrait les tags automatiquement du contenu
 */
export function extractAutoTags(content: string, limit: number = 5): string[] {
  const contentLower = content.toLowerCase();
  const tags: string[] = [];

  // Extraire tous les mots significatifs (> 4 caractères)
  const words = contentLower.match(/\b[a-zàâçéèêëîïôûùüÿñæœ]{5,}\b/g) || [];

  // Compter les occurrences
  const wordCount: Record<string, number> = {};
  for (const word of words) {
    wordCount[word] = (wordCount[word] || 0) + 1;
  }

  // Trier par fréquence
  const sorted = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);

  tags.push(...sorted);

  // Ajouter le sujet détecté
  const topic = classifyTopic(content);
  if (topic !== 'general' && !tags.includes(topic)) {
    tags.unshift(topic);
  }

  return tags.slice(0, limit);
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION ET FILTRAGE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Vérifie si un contenu contient des données sensibles (à NE PAS sauvegarder)
 */
export function containsSensitiveData(content: string): boolean {
  return MEMORY_BLACKLIST_PATTERNS.some(pattern => pattern.test(content));
}

/**
 * Vérifie si un message est trivial (à NE PAS sauvegarder)
 */
export function isTrivialMessage(content: string): boolean {
  const trimmed = content.trim();
  if (trimmed.length < 10) return true;
  return EXCLUDED_MESSAGE_PATTERNS.some(pattern => pattern.test(trimmed));
}

/**
 * Vérifie si un contenu mérite d'être sauvegardé
 */
export function shouldSaveContent(content: string): { save: boolean; reason?: string } {
  if (containsSensitiveData(content)) {
    return { save: false, reason: 'Contient des données sensibles' };
  }

  if (isTrivialMessage(content)) {
    return { save: false, reason: 'Message trivial' };
  }

  if (content.trim().length < 20) {
    return { save: false, reason: 'Contenu trop court' };
  }

  return { save: true };
}

/**
 * Obtient les permissions mémoire pour un mode IA
 */
export function getMemoryPermissions(modeId: ChatModeId): ModeMemoryPermissions {
  return MODE_MEMORY_PERMISSIONS[modeId] || DEFAULT_MEMORY_PERMISSIONS;
}

/**
 * Filtre les entrées selon les permissions du mode IA
 */
export function filterByPermissions(
  entries: MemoryEntry[],
  modeId: ChatModeId
): MemoryEntry[] {
  const permissions = getMemoryPermissions(modeId);

  return entries.filter(entry => {
    // Vérifier le niveau
    if (entry.level === 'session' && !permissions.canReadSession) return false;
    if (entry.level === 'intermediate' && !permissions.canReadIntermediate) return false;
    if (entry.level === 'long_term' && !permissions.canReadLongTerm) return false;

    // Vérifier le sujet
    if (!permissions.allowedTopics.includes(entry.topic)) return false;

    // Vérifier le type de contenu
    if (!permissions.allowedContentTypes.includes(entry.contentType)) return false;

    // Vérifier l'importance
    if (entry.importance > permissions.maxImportance) return false;

    return true;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS RÉSUMÉS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Génère un titre automatique pour un groupe d'entrées
 */
export function generateAutoTitle(entries: MemoryEntry[]): string {
  if (entries.length === 0) return 'Résumé vide';

  // Trouver le sujet dominant
  const topicCounts: Record<MemoryTopic, number> = {} as Record<MemoryTopic, number>;
  for (const entry of entries) {
    topicCounts[entry.topic] = (topicCounts[entry.topic] || 0) + 1;
  }

  const dominantTopic = Object.entries(topicCounts).reduce(
    (best, [topic, count]) => count > best.count ? { topic: topic as MemoryTopic, count } : best,
    { topic: 'general' as MemoryTopic, count: 0 }
  );

  const topicLabel = MEMORY_TOPIC_LABELS[dominantTopic.topic].label;
  const date = new Date(entries[0].metadata.createdAt).toLocaleDateString('fr-FR');

  return `${topicLabel} - ${date} (${entries.length} éléments)`;
}

/**
 * Estime le nombre de tokens d'un texte
 */
export function estimateTokens(text: string): number {
  // Estimation simplifiée: ~4 caractères = 1 token
  return Math.ceil(text.length / 4);
}

/**
 * Tronque le contenu pour respecter une limite de tokens
 */
export function truncateToTokenLimit(content: string, maxTokens: number): string {
  const estimatedChars = maxTokens * 4;
  if (content.length <= estimatedChars) return content;

  return content.substring(0, estimatedChars - 3) + '...';
}

/**
 * Prépare le contexte mémoire pour injection dans le prompt IA
 */
export function prepareContextInjection(
  entries: MemoryEntry[],
  query: string,
  modeId: ChatModeId
): { context: string; usedEntries: string[] } {
  const permissions = getMemoryPermissions(modeId);
  const maxTokens = permissions.contextInjectionLimit || MAX_CONTEXT_INJECTION_TOKENS;

  // Filtrer par permissions
  const allowedEntries = filterByPermissions(entries, modeId);

  // Scorer et trier par pertinence
  const ranked = rankByRelevance(allowedEntries, query);

  // Filtrer par score minimum
  const relevant = ranked.filter(r => r.score >= MIN_RELEVANCE_FOR_INJECTION);

  // Construire le contexte en respectant la limite de tokens
  let context = '';
  let currentTokens = 0;
  const usedEntries: string[] = [];

  for (const { entry, score } of relevant) {
    const entryText = formatEntryForContext(entry, score);
    const entryTokens = estimateTokens(entryText);

    if (currentTokens + entryTokens > maxTokens) break;

    context += entryText + '\n\n';
    currentTokens += entryTokens;
    usedEntries.push(entry.id);
  }

  return { context: context.trim(), usedEntries };
}

/**
 * Formate une entrée pour l'injection contexte
 */
function formatEntryForContext(entry: MemoryEntry, _score: number): string {
  const topicLabel = MEMORY_TOPIC_LABELS[entry.topic].icon;
  const importance = '⭐'.repeat(entry.importance);
  const date = new Date(entry.metadata.createdAt).toLocaleDateString('fr-FR');

  let header = `${topicLabel} [${date}] ${importance}`;

  if ('title' in entry && entry.title) {
    header += ` - ${entry.title}`;
  }

  return `${header}\n${truncateToTokenLimit(entry.content, 500)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// DÉTECTION DE DOUBLONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcule un hash simple pour détection de doublons
 */
export function calculateContentHash(content: string): string {
  // Hash simplifié (en prod, utiliser crypto)
  let hash = 0;
  const normalized = content.toLowerCase().trim().replace(/\s+/g, ' ');

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(36);
}

/**
 * Vérifie si deux contenus sont similaires (pour dédoublonnage)
 */
export function areSimilarContents(
  content1: string,
  content2: string,
  threshold: number = 0.8
): boolean {
  const hash1 = calculateContentHash(content1);
  const hash2 = calculateContentHash(content2);

  if (hash1 === hash2) return true;

  // Calcul de similarité Jaccard sur les mots
  const words1 = new Set(content1.toLowerCase().split(/\s+/));
  const words2 = new Set(content2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  const similarity = intersection.size / union.size;

  return similarity >= threshold;
}

/**
 * Trouve les doublons potentiels dans une liste d'entrées
 */
export function findDuplicates(
  newContent: string,
  existingEntries: MemoryEntry[],
  threshold: number = 0.8
): MemoryEntry[] {
  return existingEntries.filter(entry =>
    areSimilarContents(newContent, entry.content, threshold)
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
