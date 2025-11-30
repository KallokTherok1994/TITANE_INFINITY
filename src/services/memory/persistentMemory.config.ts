/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — SYSTÈME DE MÉMOIRE PERSISTANTE LOCALE
 *   Architecture Hiérarchique à 3 Niveaux + Memory Engine
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   🎯 Ce module définit:
 *   - Niveau 1: Mémoire de Session (volatile, court terme)
 *   - Niveau 2: Mémoire Intermédiaire (persistante, résumée)
 *   - Niveau 3: Mémoire Longue Durée (permanente, chiffrée)
 *   - Scoring de pertinence et classification intelligente
 *   - Intégration Memory Engine ↔ Chat IA ↔ XP Engine
 *
 *   ⚠️ SÉCURITÉ: Aucune écriture depuis le frontend.
 *      Toutes les écritures passent par Tauri Commands Rust.
 */

import type { ChatModeId } from '../ai/chatModes.config';
import type { EvolutionPhaseId } from '../evolution/evolutionIA.config';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES FONDAMENTAUX
// ─────────────────────────────────────────────────────────────────────────────

/** Niveaux de mémoire */
export type MemoryLevel = 'session' | 'intermediate' | 'long_term';

/** Types de contenu mémoire */
export type MemoryContentType =
  | 'message'           // Message utilisateur/IA
  | 'summary'           // Résumé généré
  | 'knowledge'         // Connaissance extraite
  | 'preference'        // Préférence utilisateur
  | 'project_context'   // Contexte de projet
  | 'code_snippet'      // Extrait de code
  | 'decision'          // Décision importante
  | 'reference'         // Document de référence
  | 'identity'          // Identité/profil stable
  | 'automation_result' // Résultat d'automation
  | 'milestone';        // Milestone atteint

/** Catégories de sujets mémoire */
export type MemoryTopic =
  | 'general'
  | 'coding'
  | 'project'
  | 'personal'
  | 'technical'
  | 'creative'
  | 'learning'
  | 'decisions'
  | 'preferences'
  | 'automation'
  | 'system';

/** Importance de l'entrée mémoire */
export type MemoryImportance = 1 | 2 | 3 | 4 | 5; // 1=trivial, 5=critique

/** Statut de l'entrée mémoire */
export type MemoryStatus = 'active' | 'archived' | 'pending_review' | 'expired';

/** Source de l'entrée mémoire */
export type MemorySource =
  | 'chat_user'
  | 'chat_assistant'
  | 'auto_summary'
  | 'manual_save'
  | 'automation'
  | 'system'
  | 'import';

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES: ENTRÉES MÉMOIRE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Métadonnées communes à toutes les entrées
 */
export interface MemoryMetadata {
  /** Timestamp de création */
  createdAt: number;
  /** Timestamp de dernière modification */
  updatedAt: number;
  /** Timestamp de dernier accès */
  lastAccessedAt?: number;
  /** Nombre d'accès */
  accessCount: number;
  /** Source de l'entrée */
  source: MemorySource;
  /** Mode IA lors de la création */
  modeId?: ChatModeId;
  /** Phase d'évolution lors de la création */
  evolutionPhase?: EvolutionPhaseId;
  /** ID de projet associé */
  projectId?: string;
  /** ID de conversation source */
  conversationId?: string;
  /** Hash pour détection de doublons */
  contentHash?: string;
  /** Version du schéma */
  schemaVersion: string;
}

/**
 * Niveau 1: Entrée Mémoire de Session (volatile)
 * - Durée: Session courante ou max 24h
 * - Usage: Contexte immédiat, historique récent
 * - Rétention: Auto-suppression après session ou TTL
 */
export interface SessionMemoryEntry {
  /** ID unique */
  id: string;
  /** Niveau de mémoire */
  level: 'session';
  /** Type de contenu */
  contentType: MemoryContentType;
  /** Contenu textuel */
  content: string;
  /** Sujet/catégorie */
  topic: MemoryTopic;
  /** Importance (1-5) */
  importance: MemoryImportance;
  /** Tags pour recherche */
  tags: string[];
  /** Métadonnées */
  metadata: MemoryMetadata;
  /** TTL en millisecondes (défaut: 24h) */
  ttl: number;
  /** Peut être promu au niveau supérieur */
  promotable: boolean;
}

/**
 * Niveau 2: Entrée Mémoire Intermédiaire (persistante)
 * - Durée: 7-30 jours selon importance
 * - Usage: Résumés thématiques, contexte projet
 * - Rétention: Compression automatique, promotion vers long-terme
 */
export interface IntermediateMemoryEntry {
  /** ID unique */
  id: string;
  /** Niveau de mémoire */
  level: 'intermediate';
  /** Type de contenu */
  contentType: MemoryContentType;
  /** Titre résumé */
  title: string;
  /** Contenu principal */
  content: string;
  /** Contenu original (si résumé) */
  originalContent?: string;
  /** Sujet/catégorie */
  topic: MemoryTopic;
  /** Importance (1-5) */
  importance: MemoryImportance;
  /** Tags pour recherche */
  tags: string[];
  /** Statut */
  status: MemoryStatus;
  /** Métadonnées */
  metadata: MemoryMetadata;
  /** IDs des entrées session sources */
  sourceEntryIds: string[];
  /** Score de pertinence calculé */
  relevanceScore: number;
  /** Date d'expiration */
  expiresAt: number;
  /** Peut être promu au niveau supérieur */
  promotable: boolean;
}

/**
 * Niveau 3: Entrée Mémoire Longue Durée (permanente)
 * - Durée: Permanent (sauf suppression manuelle)
 * - Usage: Connaissances stables, identité, références
 * - Rétention: Jamais auto-supprimé, chiffrement fort
 */
export interface LongTermMemoryEntry {
  /** ID unique */
  id: string;
  /** Niveau de mémoire */
  level: 'long_term';
  /** Type de contenu */
  contentType: MemoryContentType;
  /** Titre */
  title: string;
  /** Résumé court */
  summary: string;
  /** Contenu complet */
  content: string;
  /** Sujet/catégorie */
  topic: MemoryTopic;
  /** Importance (1-5) */
  importance: MemoryImportance;
  /** Tags pour recherche */
  tags: string[];
  /** Statut */
  status: MemoryStatus;
  /** Métadonnées */
  metadata: MemoryMetadata;
  /** IDs des entrées sources (session + intermediate) */
  sourceEntryIds: string[];
  /** Score de confiance (0-100) */
  confidenceScore: number;
  /** Vérifié par l'utilisateur */
  userVerified: boolean;
  /** Peut être modifié */
  editable: boolean;
  /** Version de l'entrée (pour historique) */
  version: number;
  /** Historique des versions précédentes (IDs) */
  versionHistory: string[];
}

/** Union des types d'entrées mémoire */
export type MemoryEntry = SessionMemoryEntry | IntermediateMemoryEntry | LongTermMemoryEntry;

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES: RÉSUMÉS ET BUNDLES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Résumé automatique de mémoire
 */
export interface MemorySummary {
  /** ID unique */
  id: string;
  /** Titre du résumé */
  title: string;
  /** Contenu résumé */
  content: string;
  /** Sujet principal */
  topic: MemoryTopic;
  /** Période couverte (début) */
  periodStart: number;
  /** Période couverte (fin) */
  periodEnd: number;
  /** Nombre d'entrées sources */
  sourceCount: number;
  /** IDs des entrées sources */
  sourceIds: string[];
  /** Mode IA principal */
  primaryMode?: ChatModeId;
  /** Mots-clés extraits */
  keywords: string[];
  /** Score d'importance agrégé */
  aggregatedImportance: number;
  /** Timestamp de génération */
  generatedAt: number;
  /** Type de résumé */
  summaryType: 'daily' | 'weekly' | 'topic' | 'project' | 'on_demand';
}

/**
 * Bundle logique de mémoire (groupe thématique)
 */
export interface MemoryBundle {
  /** ID unique */
  id: string;
  /** Nom du bundle */
  name: string;
  /** Description */
  description: string;
  /** Sujet principal */
  topic: MemoryTopic;
  /** IDs des entrées incluses */
  entryIds: string[];
  /** Tags du bundle */
  tags: string[];
  /** Timestamp de création */
  createdAt: number;
  /** Timestamp de modification */
  updatedAt: number;
  /** Créateur (user | system) */
  createdBy: 'user' | 'system';
  /** Couleur pour UI */
  color?: string;
  /** Icône pour UI */
  icon?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES: REQUÊTES ET RÉPONSES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Requête de lecture mémoire
 */
export interface MemoryReadRequest {
  /** Niveaux à interroger */
  levels?: MemoryLevel[];
  /** Sujets à filtrer */
  topics?: MemoryTopic[];
  /** Types de contenu */
  contentTypes?: MemoryContentType[];
  /** Importance minimale */
  minImportance?: MemoryImportance;
  /** Mode IA courant (pour filtrage permissions) */
  currentMode: ChatModeId;
  /** Requête textuelle (pour scoring) */
  query?: string;
  /** Tags à rechercher */
  tags?: string[];
  /** ID de projet */
  projectId?: string;
  /** Limite de résultats */
  limit?: number;
  /** Inclure les résumés */
  includeSummaries?: boolean;
  /** Score de pertinence minimum */
  minRelevanceScore?: number;
}

/**
 * Réponse de lecture mémoire
 */
export interface MemoryReadResponse {
  /** Entrées trouvées */
  entries: MemoryEntry[];
  /** Résumés (si demandés) */
  summaries?: MemorySummary[];
  /** Nombre total (avant limit) */
  totalCount: number;
  /** Temps de requête (ms) */
  queryTime: number;
  /** Scores de pertinence par ID */
  relevanceScores: Record<string, number>;
}

/**
 * Requête d'écriture mémoire (envoyée au Rust)
 */
export interface MemoryWriteRequest {
  /** Niveau cible */
  level: MemoryLevel;
  /** Type de contenu */
  contentType: MemoryContentType;
  /** Contenu */
  content: string;
  /** Titre (optionnel) */
  title?: string;
  /** Sujet */
  topic: MemoryTopic;
  /** Importance */
  importance: MemoryImportance;
  /** Tags */
  tags: string[];
  /** Source */
  source: MemorySource;
  /** Mode IA courant */
  modeId: ChatModeId;
  /** Phase d'évolution */
  evolutionPhase: EvolutionPhaseId;
  /** ID de projet */
  projectId?: string;
  /** ID de conversation */
  conversationId?: string;
  /** TTL personnalisé (session only) */
  customTtl?: number;
}

/**
 * Réponse d'écriture mémoire
 */
export interface MemoryWriteResponse {
  /** Succès */
  success: boolean;
  /** ID de l'entrée créée */
  entryId?: string;
  /** Message d'erreur */
  error?: string;
  /** Entrée dupliquée trouvée */
  duplicate?: boolean;
  /** ID du doublon */
  duplicateId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES: STATISTIQUES ET ÉTAT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Statistiques mémoire
 */
export interface MemoryStats {
  /** Comptage par niveau */
  countByLevel: Record<MemoryLevel, number>;
  /** Comptage par sujet */
  countByTopic: Record<MemoryTopic, number>;
  /** Comptage par type */
  countByType: Record<MemoryContentType, number>;
  /** Taille totale (octets) */
  totalSize: number;
  /** Taille par niveau */
  sizeByLevel: Record<MemoryLevel, number>;
  /** Dernière écriture */
  lastWrite: number;
  /** Dernière lecture */
  lastRead: number;
  /** Nombre de résumés */
  summaryCount: number;
  /** Nombre de bundles */
  bundleCount: number;
  /** Santé du système */
  health: MemoryHealth;
}

/**
 * Santé du système mémoire
 */
export interface MemoryHealth {
  /** État global */
  status: 'healthy' | 'degraded' | 'critical';
  /** Fichiers corrompus */
  corruptedFiles: number;
  /** Dernière vérification intégrité */
  lastIntegrityCheck: number;
  /** Espace disque disponible (%) */
  diskSpacePercent: number;
  /** Chiffrement actif */
  encryptionActive: boolean;
  /** Dernière sauvegarde */
  lastBackup: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES SYSTÈME
// ─────────────────────────────────────────────────────────────────────────────

/** TTL par défaut pour mémoire session (24h) */
export const DEFAULT_SESSION_TTL = 24 * 60 * 60 * 1000;

/** TTL pour mémoire intermédiaire (30 jours) */
export const DEFAULT_INTERMEDIATE_TTL = 30 * 24 * 60 * 60 * 1000;

/** Seuil de compression (nombre d'entrées) */
export const COMPRESSION_THRESHOLD = 100;

/** Seuil de promotion automatique (importance >= 4) */
export const AUTO_PROMOTION_THRESHOLD: MemoryImportance = 4;

/** Limite d'injection contexte (tokens estimés) */
export const MAX_CONTEXT_INJECTION_TOKENS = 2000;

/** Score de pertinence minimum pour injection */
export const MIN_RELEVANCE_FOR_INJECTION = 0.5;

/** Version du schéma mémoire */
export const MEMORY_SCHEMA_VERSION = '1.0.0';

/** Labels des niveaux de mémoire */
export const MEMORY_LEVEL_LABELS: Record<MemoryLevel, { label: string; icon: string; color: string }> = {
  session: { label: 'Session', icon: '⏱️', color: '#93c5fd' },
  intermediate: { label: 'Intermédiaire', icon: '📝', color: '#a78bfa' },
  long_term: { label: 'Long Terme', icon: '🗄️', color: '#fbbf24' },
};

/** Labels des sujets */
export const MEMORY_TOPIC_LABELS: Record<MemoryTopic, { label: string; icon: string }> = {
  general: { label: 'Général', icon: '📌' },
  coding: { label: 'Code', icon: '💻' },
  project: { label: 'Projet', icon: '📁' },
  personal: { label: 'Personnel', icon: '👤' },
  technical: { label: 'Technique', icon: '🔧' },
  creative: { label: 'Créatif', icon: '🎨' },
  learning: { label: 'Apprentissage', icon: '📚' },
  decisions: { label: 'Décisions', icon: '⚖️' },
  preferences: { label: 'Préférences', icon: '⚙️' },
  automation: { label: 'Automation', icon: '🤖' },
  system: { label: 'Système', icon: '🖥️' },
};

/** Labels des types de contenu */
export const MEMORY_CONTENT_TYPE_LABELS: Record<MemoryContentType, { label: string; icon: string }> = {
  message: { label: 'Message', icon: '💬' },
  summary: { label: 'Résumé', icon: '📋' },
  knowledge: { label: 'Connaissance', icon: '💡' },
  preference: { label: 'Préférence', icon: '⚙️' },
  project_context: { label: 'Contexte Projet', icon: '📁' },
  code_snippet: { label: 'Code', icon: '💻' },
  decision: { label: 'Décision', icon: '⚖️' },
  reference: { label: 'Référence', icon: '📖' },
  identity: { label: 'Identité', icon: '🆔' },
  automation_result: { label: 'Résultat Auto.', icon: '🤖' },
  milestone: { label: 'Milestone', icon: '🏆' },
};

/** Couleurs des niveaux d'importance */
export const IMPORTANCE_COLORS: Record<MemoryImportance, string> = {
  1: '#9ca3af', // Gris - Trivial
  2: '#6ee7b7', // Vert - Faible
  3: '#93c5fd', // Bleu - Normal
  4: '#fbbf24', // Or - Important
  5: '#ef4444', // Rouge - Critique
};

// ─────────────────────────────────────────────────────────────────────────────
// RÈGLES D'ÉCRITURE PAR MODE IA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Configuration d'accès mémoire par mode IA
 */
export interface ModeMemoryPermissions {
  /** Peut lire la mémoire session */
  canReadSession: boolean;
  /** Peut lire la mémoire intermédiaire */
  canReadIntermediate: boolean;
  /** Peut lire la mémoire long terme */
  canReadLongTerm: boolean;
  /** Peut écrire (via Rust) */
  canWrite: boolean;
  /** Sujets autorisés en lecture */
  allowedTopics: MemoryTopic[];
  /** Types de contenu autorisés */
  allowedContentTypes: MemoryContentType[];
  /** Importance maximale accessible */
  maxImportance: MemoryImportance;
  /** Limite d'injection contexte (tokens) */
  contextInjectionLimit: number;
}

/** Permissions mémoire par mode IA */
export const MODE_MEMORY_PERMISSIONS: Partial<Record<ChatModeId, ModeMemoryPermissions>> = {
  default: {
    canReadSession: true,
    canReadIntermediate: true,
    canReadLongTerm: false,
    canWrite: true,
    allowedTopics: ['general', 'personal', 'creative'],
    allowedContentTypes: ['message', 'summary', 'preference'],
    maxImportance: 3,
    contextInjectionLimit: 500,
  },
  dev: {
    canReadSession: true,
    canReadIntermediate: true,
    canReadLongTerm: true,
    canWrite: true,
    allowedTopics: ['general', 'coding', 'project', 'technical', 'decisions'],
    allowedContentTypes: ['message', 'summary', 'knowledge', 'project_context', 'code_snippet', 'decision'],
    maxImportance: 5,
    contextInjectionLimit: 2000,
  },
  debug_cognitive: {
    canReadSession: true,
    canReadIntermediate: true,
    canReadLongTerm: true,
    canWrite: true,
    allowedTopics: ['general', 'coding', 'project', 'technical', 'decisions', 'automation'],
    allowedContentTypes: ['message', 'summary', 'knowledge', 'project_context', 'code_snippet', 'decision', 'automation_result'],
    maxImportance: 5,
    contextInjectionLimit: 3000,
  },
  brainstorming: {
    canReadSession: true,
    canReadIntermediate: true,
    canReadLongTerm: true,
    canWrite: true,
    allowedTopics: ['general', 'creative', 'personal', 'learning'],
    allowedContentTypes: ['message', 'summary', 'knowledge', 'reference'],
    maxImportance: 4,
    contextInjectionLimit: 1500,
  },
  audit: {
    canReadSession: true,
    canReadIntermediate: true,
    canReadLongTerm: true,
    canWrite: true,
    allowedTopics: ['general', 'technical', 'project', 'decisions', 'system'],
    allowedContentTypes: ['message', 'summary', 'knowledge', 'decision', 'reference'],
    maxImportance: 5,
    contextInjectionLimit: 2500,
  },
  admin: {
    canReadSession: true,
    canReadIntermediate: true,
    canReadLongTerm: true,
    canWrite: true,
    allowedTopics: Object.keys(MEMORY_TOPIC_LABELS) as MemoryTopic[],
    allowedContentTypes: Object.keys(MEMORY_CONTENT_TYPE_LABELS) as MemoryContentType[],
    maxImportance: 5,
    contextInjectionLimit: 4000,
  },
};

/** Permissions par défaut */
export const DEFAULT_MEMORY_PERMISSIONS: ModeMemoryPermissions = {
  canReadSession: true,
  canReadIntermediate: true,
  canReadLongTerm: false,
  canWrite: true,
  allowedTopics: ['general'],
  allowedContentTypes: ['message', 'summary'],
  maxImportance: 3,
  contextInjectionLimit: 1000,
};

// ─────────────────────────────────────────────────────────────────────────────
// RÈGLES D'AUTO-SAUVEGARDE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Règle d'auto-sauvegarde
 */
export interface AutoSaveRule {
  /** ID de la règle */
  id: string;
  /** Nom */
  name: string;
  /** Description */
  description: string;
  /** Actif */
  enabled: boolean;
  /** Pattern de déclenchement */
  trigger: AutoSaveTrigger;
  /** Niveau cible */
  targetLevel: MemoryLevel;
  /** Sujet par défaut */
  defaultTopic: MemoryTopic;
  /** Type de contenu */
  contentType: MemoryContentType;
  /** Importance par défaut */
  defaultImportance: MemoryImportance;
  /** Génère un résumé automatique */
  autoSummarize: boolean;
  /** Modes IA où la règle s'applique */
  applicableModes: ChatModeId[] | 'all';
}

/**
 * Déclencheur d'auto-sauvegarde
 */
export interface AutoSaveTrigger {
  type: 'message_count' | 'time_interval' | 'keyword' | 'importance' | 'end_session' | 'manual';
  /** Nombre de messages (pour message_count) */
  messageCount?: number;
  /** Intervalle en ms (pour time_interval) */
  interval?: number;
  /** Mots-clés (pour keyword) */
  keywords?: string[];
  /** Importance minimale (pour importance) */
  minImportance?: MemoryImportance;
}

/** Règles d'auto-sauvegarde par défaut */
export const DEFAULT_AUTO_SAVE_RULES: AutoSaveRule[] = [
  {
    id: 'auto_session_messages',
    name: 'Messages de session',
    description: 'Sauvegarde automatique des messages importants',
    enabled: true,
    trigger: { type: 'importance', minImportance: 3 },
    targetLevel: 'session',
    defaultTopic: 'general',
    contentType: 'message',
    defaultImportance: 3,
    autoSummarize: false,
    applicableModes: 'all',
  },
  {
    id: 'auto_code_snippets',
    name: 'Extraits de code',
    description: 'Détection et sauvegarde automatique du code',
    enabled: true,
    trigger: { type: 'keyword', keywords: ['```', 'function', 'const ', 'class '] },
    targetLevel: 'intermediate',
    defaultTopic: 'coding',
    contentType: 'code_snippet',
    defaultImportance: 3,
    autoSummarize: false,
    applicableModes: ['dev', 'debug_cognitive'],
  },
  {
    id: 'auto_daily_summary',
    name: 'Résumé quotidien',
    description: 'Génère un résumé en fin de journée',
    enabled: true,
    trigger: { type: 'time_interval', interval: 24 * 60 * 60 * 1000 },
    targetLevel: 'intermediate',
    defaultTopic: 'general',
    contentType: 'summary',
    defaultImportance: 3,
    autoSummarize: true,
    applicableModes: 'all',
  },
  {
    id: 'auto_decisions',
    name: 'Décisions importantes',
    description: 'Sauvegarde les décisions mentionnées',
    enabled: true,
    trigger: { type: 'keyword', keywords: ['décidé', 'choix final', 'conclusion', 'solution retenue'] },
    targetLevel: 'long_term',
    defaultTopic: 'decisions',
    contentType: 'decision',
    defaultImportance: 4,
    autoSummarize: true,
    applicableModes: 'all',
  },
];

// ─────────────────────════════════════════════════════════════════════════════
// CONTENUS JAMAIS SAUVEGARDÉS (BLACKLIST)
// ─────────────────────────────────────────────────────────────────────────────

/** Patterns de contenu à ne jamais sauvegarder */
export const MEMORY_BLACKLIST_PATTERNS: RegExp[] = [
  /password|mot de passe|mdp/i,
  /api[_\s-]?key/i,
  /secret[_\s-]?key/i,
  /token[_\s-]?secret/i,
  /private[_\s-]?key/i,
  /ssh[_\s-]?key/i,
  /bearer\s+[a-zA-Z0-9]/i,
  /-----BEGIN\s+(RSA|DSA|EC|OPENSSH)\s+PRIVATE\s+KEY-----/i,
];

/** Types de messages exclus */
export const EXCLUDED_MESSAGE_PATTERNS: RegExp[] = [
  /^(bonjour|salut|hello|hi|hey)\s*[!.?]*$/i,
  /^(merci|thanks|thx)\s*[!.?]*$/i,
  /^(ok|okay|d'accord|compris)\s*[!.?]*$/i,
  /^(oui|non|yes|no)\s*[!.?]*$/i,
];

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS POUR UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────

export {
  // Types déjà exportés inline
};
