/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — SYSTÈME D'AUTOMATIONS CHAT IA
 *   Automations déclenchables depuis le Chat, sécurisées, traçables
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   🎯 Ce module définit:
 *   - Types et structures d'automations
 *   - Registre des automations disponibles
 *   - Système de permissions et sécurité
 *   - Intégration avec Chat Modes et XP Engine
 */

import type {
  ChatModeId,
  PermissionLevel,
  ToolPermissions,
} from '../ai/chatModes.config';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & CONSTANTES FONDAMENTALES
// ─────────────────────────────────────────────────────────────────────────────

/** Identifiants uniques des automations (clés stables) */
export type AutomationId =
  | 'auto_backup'
  | 'auto_cleanup'
  | 'auto_audit'
  | 'auto_format'
  | 'auto_test_run'
  | 'auto_type_check'
  | 'auto_git_status'
  | 'auto_git_commit'
  | 'auto_generate_doc'
  | 'auto_summarize_chat'
  | 'auto_export_conversation'
  | 'auto_memory_compact'
  | 'auto_xp_sync'
  | 'auto_health_check'
  | 'auto_project_analysis'
  | 'auto_dependency_check';

/** Catégories d'automations */
export type AutomationCategory =
  | 'maintenance' // Backup, cleanup, santé système
  | 'code_quality' // Format, lint, type-check
  | 'testing' // Tests, validations
  | 'git' // Git operations (safe)
  | 'documentation' // Génération de docs
  | 'memory' // Mémoire, conversations
  | 'analytics' // Analyse, audit
  | 'system'; // Système interne

/** Type d'exécution */
export type ExecutionType =
  | 'instant' // Exécution immédiate, résultat rapide
  | 'async' // Asynchrone, peut prendre du temps
  | 'scheduled' // Planifiable
  | 'chained'; // Chaînable avec d'autres automations

/** Niveau de sécurité */
export type SecurityLevel =
  | 'safe' // Aucun effet de bord, lecture seule
  | 'moderate' // Modifications mineures, réversibles
  | 'elevated' // Modifications système, nécessite confirmation
  | 'critical'; // Opérations sensibles, admin uniquement

/** Statut d'une exécution */
export type AutomationStatus =
  | 'pending'
  | 'running'
  | 'success'
  | 'failed'
  | 'cancelled'
  | 'requires_confirmation';

/** Résultat d'une automation */
export interface AutomationResult<T = unknown> {
  automationId: AutomationId;
  status: AutomationStatus;
  startedAt: number;
  completedAt?: number;
  duration?: number;
  output?: T;
  error?: string;
  logs: AutomationLog[];
  xpAwarded: number;
}

/** Log d'exécution */
export interface AutomationLog {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACE PRINCIPALE: AutomationConfig
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Configuration complète d'une automation
 */
export interface AutomationConfig {
  /** Identifiant unique (clé stable) */
  id: AutomationId;

  /** Nom d'affichage */
  name: string;

  /** Description courte */
  description: string;

  /** Icône (emoji ou nom icône) */
  icon: string;

  /** Catégorie fonctionnelle */
  category: AutomationCategory;

  /** Type d'exécution */
  executionType: ExecutionType;

  /** Niveau de sécurité */
  securityLevel: SecurityLevel;

  /** Permission minimale requise */
  requiredPermission: PermissionLevel;

  /** Modes de chat autorisés (null = tous) */
  allowedModes: ChatModeId[] | null;

  /** Outils requis pour exécution */
  requiredTools: (keyof ToolPermissions)[];

  /** Paramètres configurables */
  parameters: AutomationParameter[];

  /** XP de base gagné à l'exécution réussie */
  baseXpReward: number;

  /** Multiplicateur XP selon mode */
  xpMultiplierByMode?: Partial<Record<ChatModeId, number>>;

  /** Nécessite confirmation utilisateur */
  requiresConfirmation: boolean;

  /** Peut être annulée en cours */
  cancellable: boolean;

  /** Timeout en ms (0 = pas de limite) */
  timeout: number;

  /** Cooldown entre exécutions (ms) */
  cooldown: number;

  /** Tags pour recherche */
  tags: string[];

  /** Version de l'automation */
  version: string;
}

/** Paramètre d'automation */
export interface AutomationParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'file' | 'directory';
  label: string;
  description?: string;
  required: boolean;
  default?: unknown;
  options?: { value: unknown; label: string }[]; // Pour type 'select'
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRE DES AUTOMATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registre complet de toutes les automations TITANE∞
 */
export const AUTOMATION_REGISTRY: Record<AutomationId, AutomationConfig> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // MAINTENANCE
  // ═══════════════════════════════════════════════════════════════════════════

  auto_backup: {
    id: 'auto_backup',
    name: 'Sauvegarde Automatique',
    description: 'Crée une sauvegarde du projet actuel',
    icon: '💾',
    category: 'maintenance',
    executionType: 'async',
    securityLevel: 'moderate',
    requiredPermission: 2,
    allowedModes: ['dev', 'admin'],
    requiredTools: ['fileSystemAccess'],
    parameters: [
      {
        name: 'destination',
        type: 'directory',
        label: 'Dossier de destination',
        required: false,
        default: './backups',
      },
      {
        name: 'includeNodeModules',
        type: 'boolean',
        label: 'Inclure node_modules',
        required: false,
        default: false,
      },
    ],
    baseXpReward: 25,
    xpMultiplierByMode: { admin: 1.5 },
    requiresConfirmation: true,
    cancellable: true,
    timeout: 300000, // 5 min
    cooldown: 60000, // 1 min
    tags: ['backup', 'save', 'archive'],
    version: '1.0.0',
  },

  auto_cleanup: {
    id: 'auto_cleanup',
    name: 'Nettoyage Projet',
    description: 'Supprime fichiers temporaires et caches',
    icon: '🧹',
    category: 'maintenance',
    executionType: 'instant',
    securityLevel: 'moderate',
    requiredPermission: 2,
    allowedModes: ['dev', 'admin'],
    requiredTools: ['fileSystemAccess'],
    parameters: [
      {
        name: 'cleanNodeModules',
        type: 'boolean',
        label: 'Nettoyer node_modules',
        required: false,
        default: false,
      },
      {
        name: 'cleanDist',
        type: 'boolean',
        label: 'Nettoyer dist/',
        required: false,
        default: true,
      },
      {
        name: 'cleanCache',
        type: 'boolean',
        label: 'Nettoyer caches',
        required: false,
        default: true,
      },
    ],
    baseXpReward: 15,
    requiresConfirmation: true,
    cancellable: false,
    timeout: 60000,
    cooldown: 30000,
    tags: ['clean', 'cache', 'temp'],
    version: '1.0.0',
  },

  auto_audit: {
    id: 'auto_audit',
    name: 'Audit Automatique',
    description: 'Analyse le projet pour détecter problèmes et améliorations',
    icon: '🔍',
    category: 'analytics',
    executionType: 'async',
    securityLevel: 'safe',
    requiredPermission: 1,
    allowedModes: ['audit', 'dev', 'admin', 'strategy'],
    requiredTools: ['systemAnalysis'],
    parameters: [
      {
        name: 'scope',
        type: 'select',
        label: "Portée de l'audit",
        required: true,
        default: 'full',
        options: [
          { value: 'full', label: 'Audit complet' },
          { value: 'security', label: 'Sécurité uniquement' },
          { value: 'performance', label: 'Performance uniquement' },
          { value: 'code_quality', label: 'Qualité code' },
        ],
      },
    ],
    baseXpReward: 50,
    xpMultiplierByMode: { audit: 2.0, admin: 1.5 },
    requiresConfirmation: false,
    cancellable: true,
    timeout: 600000, // 10 min
    cooldown: 120000, // 2 min
    tags: ['audit', 'analysis', 'security', 'quality'],
    version: '1.0.0',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CODE QUALITY
  // ═══════════════════════════════════════════════════════════════════════════

  auto_format: {
    id: 'auto_format',
    name: 'Formatage Code',
    description: 'Formate automatiquement le code (Prettier/ESLint)',
    icon: '✨',
    category: 'code_quality',
    executionType: 'instant',
    securityLevel: 'moderate',
    requiredPermission: 2,
    allowedModes: ['dev', 'admin'],
    requiredTools: ['codeGeneration'],
    parameters: [
      {
        name: 'target',
        type: 'select',
        label: 'Cible',
        required: true,
        default: 'staged',
        options: [
          { value: 'all', label: 'Tous les fichiers' },
          { value: 'staged', label: 'Fichiers staged' },
          { value: 'modified', label: 'Fichiers modifiés' },
        ],
      },
    ],
    baseXpReward: 10,
    requiresConfirmation: false,
    cancellable: false,
    timeout: 60000,
    cooldown: 10000,
    tags: ['format', 'prettier', 'eslint', 'lint'],
    version: '1.0.0',
  },

  auto_type_check: {
    id: 'auto_type_check',
    name: 'Vérification Types',
    description: 'Lance la vérification TypeScript (tsc --noEmit)',
    icon: '📐',
    category: 'code_quality',
    executionType: 'async',
    securityLevel: 'safe',
    requiredPermission: 1,
    allowedModes: ['dev', 'admin', 'audit'],
    requiredTools: ['systemAnalysis'],
    parameters: [],
    baseXpReward: 20,
    xpMultiplierByMode: { dev: 1.5 },
    requiresConfirmation: false,
    cancellable: true,
    timeout: 180000, // 3 min
    cooldown: 30000,
    tags: ['typescript', 'types', 'tsc', 'check'],
    version: '1.0.0',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTING
  // ═══════════════════════════════════════════════════════════════════════════

  auto_test_run: {
    id: 'auto_test_run',
    name: 'Lancer Tests',
    description: 'Exécute la suite de tests (Vitest)',
    icon: '🧪',
    category: 'testing',
    executionType: 'async',
    securityLevel: 'safe',
    requiredPermission: 1,
    allowedModes: ['dev', 'admin', 'audit'],
    requiredTools: ['systemAnalysis'],
    parameters: [
      {
        name: 'testPattern',
        type: 'string',
        label: 'Pattern de tests',
        description: 'Filtrer les tests par pattern',
        required: false,
        default: '',
      },
      {
        name: 'coverage',
        type: 'boolean',
        label: 'Avec couverture',
        required: false,
        default: false,
      },
    ],
    baseXpReward: 30,
    xpMultiplierByMode: { dev: 1.5, audit: 1.25 },
    requiresConfirmation: false,
    cancellable: true,
    timeout: 600000, // 10 min
    cooldown: 60000,
    tags: ['test', 'vitest', 'jest', 'unit'],
    version: '1.0.0',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GIT OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  auto_git_status: {
    id: 'auto_git_status',
    name: 'Git Status',
    description: 'Affiche le statut Git actuel',
    icon: '📊',
    category: 'git',
    executionType: 'instant',
    securityLevel: 'safe',
    requiredPermission: 0,
    allowedModes: null, // Tous les modes
    requiredTools: [],
    parameters: [],
    baseXpReward: 5,
    requiresConfirmation: false,
    cancellable: false,
    timeout: 10000,
    cooldown: 5000,
    tags: ['git', 'status', 'vcs'],
    version: '1.0.0',
  },

  auto_git_commit: {
    id: 'auto_git_commit',
    name: 'Git Commit Assisté',
    description: 'Génère un message de commit et committe',
    icon: '📝',
    category: 'git',
    executionType: 'instant',
    securityLevel: 'moderate',
    requiredPermission: 2,
    allowedModes: ['dev', 'admin'],
    requiredTools: ['codeReview'],
    parameters: [
      {
        name: 'message',
        type: 'string',
        label: 'Message de commit',
        description: 'Laisser vide pour génération automatique',
        required: false,
      },
      {
        name: 'addAll',
        type: 'boolean',
        label: 'Ajouter tous les fichiers',
        required: false,
        default: false,
      },
    ],
    baseXpReward: 20,
    xpMultiplierByMode: { dev: 1.5 },
    requiresConfirmation: true,
    cancellable: false,
    timeout: 30000,
    cooldown: 10000,
    tags: ['git', 'commit', 'vcs'],
    version: '1.0.0',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DOCUMENTATION
  // ═══════════════════════════════════════════════════════════════════════════

  auto_generate_doc: {
    id: 'auto_generate_doc',
    name: 'Générer Documentation',
    description: 'Génère la documentation du code (TSDoc, JSDoc)',
    icon: '📚',
    category: 'documentation',
    executionType: 'async',
    securityLevel: 'moderate',
    requiredPermission: 2,
    allowedModes: ['dev', 'admin', 'synthesis'],
    requiredTools: ['codeGeneration'],
    parameters: [
      {
        name: 'target',
        type: 'file',
        label: 'Fichier cible',
        required: false,
      },
      {
        name: 'format',
        type: 'select',
        label: 'Format de sortie',
        required: true,
        default: 'markdown',
        options: [
          { value: 'markdown', label: 'Markdown' },
          { value: 'html', label: 'HTML' },
          { value: 'json', label: 'JSON' },
        ],
      },
    ],
    baseXpReward: 35,
    xpMultiplierByMode: { dev: 1.5, synthesis: 2.0 },
    requiresConfirmation: false,
    cancellable: true,
    timeout: 300000,
    cooldown: 60000,
    tags: ['doc', 'documentation', 'tsdoc', 'jsdoc'],
    version: '1.0.0',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MEMORY & CHAT
  // ═══════════════════════════════════════════════════════════════════════════

  auto_summarize_chat: {
    id: 'auto_summarize_chat',
    name: 'Résumer Conversation',
    description: 'Génère un résumé de la conversation actuelle',
    icon: '📋',
    category: 'memory',
    executionType: 'instant',
    securityLevel: 'safe',
    requiredPermission: 0,
    allowedModes: null,
    requiredTools: ['synthesisTool'],
    parameters: [
      {
        name: 'length',
        type: 'select',
        label: 'Longueur du résumé',
        required: true,
        default: 'medium',
        options: [
          { value: 'short', label: 'Court (3-5 points)' },
          { value: 'medium', label: 'Moyen (5-10 points)' },
          { value: 'detailed', label: 'Détaillé (10+ points)' },
        ],
      },
    ],
    baseXpReward: 15,
    xpMultiplierByMode: { synthesis: 2.0, journal: 1.5 },
    requiresConfirmation: false,
    cancellable: false,
    timeout: 30000,
    cooldown: 10000,
    tags: ['summarize', 'resume', 'chat', 'conversation'],
    version: '1.0.0',
  },

  auto_export_conversation: {
    id: 'auto_export_conversation',
    name: 'Exporter Conversation',
    description: 'Exporte la conversation en fichier (MD, JSON, TXT)',
    icon: '💾',
    category: 'memory',
    executionType: 'instant',
    securityLevel: 'safe',
    requiredPermission: 1,
    allowedModes: null,
    requiredTools: ['fileSystemAccess'],
    parameters: [
      {
        name: 'format',
        type: 'select',
        label: "Format d'export",
        required: true,
        default: 'markdown',
        options: [
          { value: 'markdown', label: 'Markdown (.md)' },
          { value: 'json', label: 'JSON (.json)' },
          { value: 'text', label: 'Texte brut (.txt)' },
        ],
      },
      {
        name: 'includeMetadata',
        type: 'boolean',
        label: 'Inclure métadonnées',
        required: false,
        default: true,
      },
    ],
    baseXpReward: 10,
    requiresConfirmation: false,
    cancellable: false,
    timeout: 10000,
    cooldown: 5000,
    tags: ['export', 'save', 'conversation', 'chat'],
    version: '1.0.0',
  },

  auto_memory_compact: {
    id: 'auto_memory_compact',
    name: 'Compacter Mémoire',
    description: 'Compacte la mémoire contextuelle pour optimiser',
    icon: '🗜️',
    category: 'memory',
    executionType: 'async',
    securityLevel: 'moderate',
    requiredPermission: 2,
    allowedModes: ['admin', 'dev'],
    requiredTools: ['memoryAccess'],
    parameters: [
      {
        name: 'aggressiveness',
        type: 'select',
        label: 'Niveau de compression',
        required: true,
        default: 'normal',
        options: [
          { value: 'light', label: 'Léger (garder max contexte)' },
          { value: 'normal', label: 'Normal (équilibré)' },
          { value: 'aggressive', label: 'Agressif (max compression)' },
        ],
      },
    ],
    baseXpReward: 20,
    requiresConfirmation: true,
    cancellable: false,
    timeout: 60000,
    cooldown: 300000, // 5 min
    tags: ['memory', 'compact', 'optimize', 'context'],
    version: '1.0.0',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════

  auto_xp_sync: {
    id: 'auto_xp_sync',
    name: 'Synchroniser XP',
    description: "Synchronise l'XP entre frontend et backend Tauri",
    icon: '🔄',
    category: 'system',
    executionType: 'instant',
    securityLevel: 'safe',
    requiredPermission: 0,
    allowedModes: null,
    requiredTools: [],
    parameters: [],
    baseXpReward: 5,
    requiresConfirmation: false,
    cancellable: false,
    timeout: 10000,
    cooldown: 30000,
    tags: ['xp', 'sync', 'experience'],
    version: '1.0.0',
  },

  auto_health_check: {
    id: 'auto_health_check',
    name: 'Vérification Santé',
    description: 'Vérifie la santé du système TITANE∞',
    icon: '❤️',
    category: 'system',
    executionType: 'instant',
    securityLevel: 'safe',
    requiredPermission: 0,
    allowedModes: null,
    requiredTools: ['systemAnalysis'],
    parameters: [],
    baseXpReward: 10,
    requiresConfirmation: false,
    cancellable: false,
    timeout: 30000,
    cooldown: 60000,
    tags: ['health', 'status', 'check', 'diagnostic'],
    version: '1.0.0',
  },

  auto_project_analysis: {
    id: 'auto_project_analysis',
    name: 'Analyse Projet',
    description: 'Analyse la structure et dépendances du projet',
    icon: '🔬',
    category: 'analytics',
    executionType: 'async',
    securityLevel: 'safe',
    requiredPermission: 1,
    allowedModes: ['dev', 'admin', 'audit', 'strategy'],
    requiredTools: ['systemAnalysis', 'contextAnalysis'],
    parameters: [
      {
        name: 'depth',
        type: 'select',
        label: "Profondeur d'analyse",
        required: true,
        default: 'standard',
        options: [
          { value: 'quick', label: 'Rapide (structure seulement)' },
          { value: 'standard', label: 'Standard (structure + deps)' },
          { value: 'deep', label: 'Profonde (analyse complète)' },
        ],
      },
    ],
    baseXpReward: 40,
    xpMultiplierByMode: { audit: 1.5, strategy: 1.25 },
    requiresConfirmation: false,
    cancellable: true,
    timeout: 300000,
    cooldown: 120000,
    tags: ['analysis', 'project', 'structure', 'dependencies'],
    version: '1.0.0',
  },

  auto_dependency_check: {
    id: 'auto_dependency_check',
    name: 'Vérifier Dépendances',
    description: 'Vérifie les mises à jour et vulnérabilités des dépendances',
    icon: '📦',
    category: 'analytics',
    executionType: 'async',
    securityLevel: 'safe',
    requiredPermission: 1,
    allowedModes: ['dev', 'admin', 'audit'],
    requiredTools: ['systemAnalysis'],
    parameters: [
      {
        name: 'checkVulnerabilities',
        type: 'boolean',
        label: 'Vérifier vulnérabilités',
        required: false,
        default: true,
      },
      {
        name: 'checkUpdates',
        type: 'boolean',
        label: 'Vérifier mises à jour',
        required: false,
        default: true,
      },
    ],
    baseXpReward: 25,
    xpMultiplierByMode: { audit: 2.0 },
    requiresConfirmation: false,
    cancellable: true,
    timeout: 120000,
    cooldown: 300000,
    tags: ['dependencies', 'npm', 'security', 'update', 'vulnerability'],
    version: '1.0.0',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS & UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Obtenir une automation par son ID
 */
export function getAutomation(id: AutomationId): AutomationConfig {
  return AUTOMATION_REGISTRY[id];
}

/**
 * Obtenir toutes les automations d'une catégorie
 */
export function getAutomationsByCategory(
  category: AutomationCategory
): AutomationConfig[] {
  return Object.values(AUTOMATION_REGISTRY).filter(a => a.category === category);
}

/**
 * Obtenir les automations autorisées pour un mode de chat
 */
export function getAutomationsForMode(modeId: ChatModeId): AutomationConfig[] {
  return Object.values(AUTOMATION_REGISTRY).filter(
    a => a.allowedModes === null || a.allowedModes.includes(modeId)
  );
}

/**
 * Obtenir les automations autorisées pour un niveau de permission
 */
export function getAutomationsForPermission(level: PermissionLevel): AutomationConfig[] {
  return Object.values(AUTOMATION_REGISTRY).filter(a => a.requiredPermission <= level);
}

/**
 * Vérifier si une automation est autorisée pour un mode et permission
 */
export function canExecuteAutomation(
  automationId: AutomationId,
  modeId: ChatModeId,
  permissionLevel: PermissionLevel,
  availableTools: Partial<ToolPermissions>
): { allowed: boolean; reason?: string } {
  const automation = AUTOMATION_REGISTRY[automationId];

  if (!automation) {
    return { allowed: false, reason: `Automation '${automationId}' inconnue` };
  }

  // Vérifier permission
  if (permissionLevel < automation.requiredPermission) {
    return {
      allowed: false,
      reason: `Permission insuffisante (niveau ${permissionLevel}, requis ${automation.requiredPermission})`,
    };
  }

  // Vérifier mode
  if (automation.allowedModes !== null && !automation.allowedModes.includes(modeId)) {
    return {
      allowed: false,
      reason: `Mode '${modeId}' non autorisé pour cette automation`,
    };
  }

  // Vérifier outils
  for (const tool of automation.requiredTools) {
    if (!availableTools[tool]) {
      return {
        allowed: false,
        reason: `Outil '${tool}' non disponible`,
      };
    }
  }

  return { allowed: true };
}

/**
 * Calculer l'XP pour une automation selon le mode
 */
export function calculateAutomationXP(
  automationId: AutomationId,
  modeId: ChatModeId,
  success: boolean
): number {
  const automation = AUTOMATION_REGISTRY[automationId];
  if (!automation || !success) return 0;

  let xp = automation.baseXpReward;

  // Appliquer multiplicateur de mode
  if (automation.xpMultiplierByMode?.[modeId]) {
    xp = Math.floor(xp * automation.xpMultiplierByMode[modeId]!);
  }

  return xp;
}

/**
 * Rechercher des automations par tag
 */
export function searchAutomationsByTag(tag: string): AutomationConfig[] {
  const lowerTag = tag.toLowerCase();
  return Object.values(AUTOMATION_REGISTRY).filter(a =>
    a.tags.some(t => t.toLowerCase().includes(lowerTag))
  );
}

/**
 * Obtenir un résumé des automations groupées par catégorie
 */
export function getAutomationsSummary(): Record<AutomationCategory, number> {
  const summary: Record<AutomationCategory, number> = {
    maintenance: 0,
    code_quality: 0,
    testing: 0,
    git: 0,
    documentation: 0,
    memory: 0,
    analytics: 0,
    system: 0,
  };

  for (const automation of Object.values(AUTOMATION_REGISTRY)) {
    summary[automation.category]++;
  }

  return summary;
}

/**
 * Obtenir toutes les automations triées par catégorie
 */
export function getAllAutomationsSorted(): AutomationConfig[] {
  return Object.values(AUTOMATION_REGISTRY).sort((a, b) => {
    // D'abord par catégorie
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    // Puis par nom
    return a.name.localeCompare(b.name);
  });
}

/**
 * Obtenir les IDs de toutes les automations
 */
export function getAllAutomationIds(): AutomationId[] {
  return Object.keys(AUTOMATION_REGISTRY) as AutomationId[];
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES D'EXÉCUTION & CONTEXTE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Requête d'exécution d'automation
 */
export interface AutomationExecutionRequest {
  automationId: AutomationId;
  parameters: Record<string, unknown>;
  modeId: ChatModeId;
  permissionLevel: PermissionLevel;
  triggeredBy: 'user' | 'system' | 'schedule' | 'chain';
  parentExecutionId?: string; // Si chaîné
}

/**
 * Contexte d'exécution
 */
export interface AutomationExecutionContext {
  executionId: string;
  request: AutomationExecutionRequest;
  startedAt: number;
  projectRoot: string;
  currentBranch?: string;
  userConfirmed: boolean;
}

/**
 * État du système d'automation
 */
export interface AutomationSystemState {
  enabled: boolean;
  runningExecutions: Map<string, AutomationExecutionContext>;
  cooldowns: Map<AutomationId, number>; // timestamp du dernier run
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  totalXpAwarded: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES SYSTÈME
// ─────────────────────────────────────────────────────────────────────────────

/** Nombre maximum d'exécutions simultanées */
export const MAX_CONCURRENT_EXECUTIONS = 3;

/** Nombre maximum de logs par exécution */
export const MAX_LOGS_PER_EXECUTION = 500;

/** Durée de rétention des résultats (ms) */
export const RESULT_RETENTION_MS = 24 * 60 * 60 * 1000; // 24h

/** Version du système d'automation */
export const AUTOMATION_SYSTEM_VERSION = '1.0.0';

/** Liste des catégories triées pour affichage UI */
export const CATEGORY_DISPLAY_ORDER: AutomationCategory[] = [
  'maintenance',
  'code_quality',
  'testing',
  'git',
  'documentation',
  'memory',
  'analytics',
  'system',
];

/** Labels des catégories pour UI */
export const CATEGORY_LABELS: Record<
  AutomationCategory,
  { label: string; icon: string }
> = {
  maintenance: { label: 'Maintenance', icon: '🔧' },
  code_quality: { label: 'Qualité Code', icon: '✨' },
  testing: { label: 'Tests', icon: '🧪' },
  git: { label: 'Git', icon: '📊' },
  documentation: { label: 'Documentation', icon: '📚' },
  memory: { label: 'Mémoire', icon: '🧠' },
  analytics: { label: 'Analyse', icon: '📈' },
  system: { label: 'Système', icon: '⚙️' },
};

/** Labels des niveaux de sécurité - TITANE Design System */
export const SECURITY_LEVEL_LABELS: Record<
  SecurityLevel,
  { label: string; color: string }
> = {
  safe: { label: 'Sûr', color: '#93b399' }, // TITANE success
  moderate: { label: 'Modéré', color: '#a89f91' }, // TITANE warning
  elevated: { label: 'Élevé', color: '#9a8a82' }, // TITANE warning-dark
  critical: { label: 'Critique', color: '#8f7a7a' }, // TITANE danger
};
