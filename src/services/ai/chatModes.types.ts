/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ — TYPES & INTERFACES DES MODES CHAT IA
 *   Extrait de chatModes.config.ts (V33 split)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & CONSTANTES FONDAMENTALES
// ─────────────────────────────────────────────────────────────────────────────

/** Identifiants uniques des modes (clés stables, ne jamais renommer) */
export type ChatModeId =
  | 'default'
  | 'reflection'
  | 'creation'
  | 'strategy'
  | 'emergency'
  | 'standard'
  | 'quick'
  | 'omega'
  | 'brainstorming'
  | 'synthesis'
  | 'planning'
  | 'journal'
  | 'debug_cognitive'
  | 'coach'
  | 'dev'
  | 'admin'
  | 'audit'
  | 'htf_soumission'
  | 'psychologie_profils'
  | 'humain_total'
  | 'veille_recherche'
  | 'decision'
  | 'kalloks_arts';

/** Catégories fonctionnelles pour regroupement UI */
export type ChatModeCategory =
  | 'general' // Modes universels
  | 'creative' // Divergence, idéation
  | 'productivity' // Structuration, action
  | 'personal' // Introspection, coaching
  | 'technical' // Dev, admin, audit
  | 'strategic'; // Stratégie, décision

/** Niveaux de permission (0 = lecture seule, 5 = admin complet) */
export type PermissionLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** Portée mémoire du mode */
export type MemoryScope = 'session' | 'project' | 'global';

/** Style de réponse IA */
export type ResponseStyle =
  | 'concise'
  | 'moderate'
  | 'detailed'
  | 'exhaustive'
  | 'creative';

/** Ton de communication */
export type CommunicationTone =
  | 'professional'
  | 'empathetic'
  | 'neutral'
  | 'technical'
  | 'motivational'
  | 'analytical'
  | 'artistic';

/** Provider IA préféré */
export type PreferredProvider = 'auto' | 'gemini' | 'ollama' | 'local';

/** Outils autorisés dans le système TITANE∞ */
export interface ToolPermissions {
  // Outils cognitifs
  memoryAccess: boolean; // Accès mémoire contextuelle
  contextAnalysis: boolean; // Analyse de contexte
  suggestionEngine: boolean; // Suggestions automatiques

  // Outils créatifs
  brainstormAssist: boolean; // Aide brainstorming
  synthesisTool: boolean; // Outil de synthèse
  mindMapping: boolean; // Mind mapping

  // Outils productivité
  taskCreation: boolean; // Création de tâches
  planningAssist: boolean; // Aide planification
  reminderSet: boolean; // Configuration rappels

  // Outils techniques
  codeGeneration: boolean; // Génération de code
  codeReview: boolean; // Revue de code
  debugAssist: boolean; // Aide debug
  systemAnalysis: boolean; // Analyse système

  // Outils admin (sensibles)
  fileSystemAccess: boolean; // Accès fichiers
  shellExecution: boolean; // Exécution shell
  configModification: boolean; // Modification config
  auditLogs: boolean; // Accès logs audit
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACE PRINCIPALE: ChatModeConfig ÉTENDU
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Configuration complète d'un mode de chat IA
 *
 * Ce modèle définit tous les aspects d'un mode:
 * - Identité (id, label, description)
 * - Comportement IA (prompt, température, style)
 * - Sécurité (permissions, outils autorisés)
 * - Intégration moteurs TITANE∞
 */
export interface ChatModeConfigExtended {
  // ═══ IDENTITÉ ═══
  /** Identifiant unique stable (ne jamais changer) */
  id: ChatModeId;
  /** Label affiché dans l'UI */
  label: string;
  /** Description courte (1-2 lignes) */
  description: string;
  /** Catégorie fonctionnelle */
  category: ChatModeCategory;
  /** Icône emoji */
  icon: string;
  /** Couleur thématique (hex) */
  themeColor: string;

  // ═══ CONFIGURATION IA ═══
  /** Provider préféré pour ce mode */
  defaultProvider: PreferredProvider;
  /** Modèle spécifique (optionnel) */
  preferredModel?: string;
  /** Prompt système interne */
  systemPrompt: string;
  /** Température (0.0-1.0) */
  temperature: number;
  /** Tokens max réponse */
  maxTokens: number;

  // ═══ STYLE & TON ═══
  /** Longueur des réponses */
  responseStyle: ResponseStyle;
  /** Ton de communication */
  tone: CommunicationTone;
  /** Actions suggérées contextuelles */
  suggestedActions: string[];

  // ═══ SÉCURITÉ & PERMISSIONS ═══
  /** Niveau de permission requis (0-5) */
  permissionLevel: PermissionLevel;
  /** Outils autorisés */
  toolsAllowed: ToolPermissions;
  /** Portée mémoire */
  memoryScope: MemoryScope;

  // ═══ INTÉGRATION TITANE∞ ═══
  /** Profile ID pour buildTitanePrompt */
  profileId: string;
  /** Moteurs TITANE∞ activés */
  enginesEnabled: string[];
  /** Capacités spéciales débloquées */
  capabilities: string[];

  // ═══ MÉTADONNÉES ═══
  /** Version du mode */
  version: string;
  /** Mode activé/désactivé */
  enabled: boolean;
  /** Ordre d'affichage UI */
  sortOrder: number;
  /** Tags pour recherche */
  tags: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// OUTILS PAR DÉFAUT (PRESETS)
// ─────────────────────────────────────────────────────────────────────────────

/** Outils minimaux (mode restrictif) */
export const TOOLS_MINIMAL: ToolPermissions = {
  memoryAccess: true,
  contextAnalysis: true,
  suggestionEngine: true,
  brainstormAssist: false,
  synthesisTool: false,
  mindMapping: false,
  taskCreation: false,
  planningAssist: false,
  reminderSet: false,
  codeGeneration: false,
  codeReview: false,
  debugAssist: false,
  systemAnalysis: false,
  fileSystemAccess: false,
  shellExecution: false,
  configModification: false,
  auditLogs: false,
};

/** Outils standard (usage courant) */
export const TOOLS_STANDARD: ToolPermissions = {
  ...TOOLS_MINIMAL,
  brainstormAssist: true,
  synthesisTool: true,
  mindMapping: true,
  taskCreation: true,
  planningAssist: true,
  reminderSet: true,
};

/** Outils développeur */
export const TOOLS_DEV: ToolPermissions = {
  ...TOOLS_STANDARD,
  codeGeneration: true,
  codeReview: true,
  debugAssist: true,
  systemAnalysis: true,
};

/** Outils admin complets */
export const TOOLS_ADMIN: ToolPermissions = {
  ...TOOLS_DEV,
  fileSystemAccess: true,
  shellExecution: true,
  configModification: true,
  auditLogs: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION DES MODES ÉTENDUS (SOURCE DE VÉRITÉ UI/SELECTOR)
// Ce registre pilote les surfaces UI modernes des modes étendus.
// La résolution runtime legacy des prompts et les modes personnalisés
// restent volontairement portés par src/config/chatModes.config.ts.
// ─────────────────────────────────────────────────────────────────────────────
