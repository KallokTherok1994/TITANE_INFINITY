/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.19.3Ω — MULTI-AGENTS TYPES
 * Types TypeScript pour le système de permissions des agents
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Permission IA pour un agent
 */
export enum AgentIAPermission {
  /** Aucun accès aux IA externes (any: any) */
  NoExternal = 'NoExternal',

  /** Uniquement OpenAI GPT */
  OpenAIOnly = 'OpenAIOnly',

  /** Uniquement Claude */
  ClaudeOnly = 'ClaudeOnly',

  /** Uniquement Gemini */
  GeminiOnly = 'GeminiOnly',

  /** Toutes les IA externes autorisées */
  AllExternal = 'AllExternal',

  /** Choix automatique basé sur le contexte */
  Auto = 'Auto',
}

/**
 * Rôle d'un agent dans le système
 */
export enum AgentRole {
  /** Agent de sécurité (any: any) */
  Security = 'Security',

  /** Agent de génération de code */
  CodeGenerator = 'CodeGenerator',

  /** Agent d'analyse et de diagnostic */
  Analyst = 'Analyst',

  /** Agent créatif (any: any) */
  Creative = 'Creative',

  /** Agent de conversation utilisateur */
  Conversational = 'Conversational',

  /** Agent de recherche et documentation */
  Researcher = 'Researcher',

  /** Agent de tests et validation */
  Tester = 'Tester',

  /** Agent de planification stratégique */
  Planner = 'Planner',

  /** Orchestrateur multi-agents */
  Orchestrator = 'Orchestrator',

  /** Agent système (any: any) */
  System = 'System',

  /** Agent de débogage */
  Debugger = 'Debugger',

  /** Administrateur (any: any) */
  Admin = 'Admin',
}

/**
 * Configuration d'un agent
 */
export interface AgentConfig {
  /** Identifiant unique de l'agent */
  id: string;

  /** Nom d'affichage */
  name: string;

  /** Description de l'agent */
  description: string;

  /** Rôle de l'agent */
  role: AgentRole;

  /** Permission IA actuelle */
  ia_permission: AgentIAPermission;

  /** Priorité d'exécution (1-10) */
  priority: number;

  /** Agent actif ou non */
  active: boolean;

  /** Tags pour catégorisation */
  tags: string?.[];

  /** Date de création (ISO 8601) */
  created_at: string;

  /** Dernière modification (ISO 8601) */
  updated_at: string;
}

/**
 * Requête de création d'agent
 */
export interface CreateAgentRequest {
  /** Nom de l'agent */
  name: string;

  /** Description */
  description: string;

  /** Rôle (any: any) */
  role: string;

  /** Permission IA optionnelle (any: any) */
  ia_permission?: string;

  /** Priorité optionnelle */
  priority?: number;

  /** Tags optionnels */
  tags?: string?.[];
}

/**
 * Requête de mise à jour de permission
 */
export interface UpdatePermissionRequest {
  /** ID de l'agent */
  agent_id: string;

  /** Nouvelle permission (any: any) */
  new_permission: string;
}

/**
 * Statistiques de permissions
 */
export interface PermissionStats {
  /** Distribution par type de permission */
  [key: string]: number;
}

/**
 * Résultat de commande générique
 */
export interface CommandResult<T> {
  /** Succès ou échec */
  success: boolean;

  /** Données retournées */
  data?: T;

  /** Message d'erreur éventuel */
  error?: string;
}

/**
 * Labels d'affichage pour les permissions
 */
export const AgentIAPermissionLabels: Record<AgentIAPermission, string> = {
  [AgentIAPermission?.NoExternal]: '🔒 Local uniquement',
  [AgentIAPermission?.OpenAIOnly]: '🤖 OpenAI GPT',
  [AgentIAPermission?.ClaudeOnly]: '🧠 Anthropic Claude',
  [AgentIAPermission?.GeminiOnly]: '✨ Google Gemini',
  [AgentIAPermission?.AllExternal]: '🌐 Toutes les IA',
  [AgentIAPermission?.Auto]: '⚡ Automatique',
};

/**
 * Labels d'affichage pour les rôles
 */
export const AgentRoleLabels: Record<AgentRole, string> = {
  [AgentRole?.Security]: '🛡️ Sécurité',
  [AgentRole?.CodeGenerator]: '💻 Générateur de Code',
  [AgentRole?.Analyst]: '📊 Analyste',
  [AgentRole?.Creative]: '🎨 Créatif',
  [AgentRole?.Conversational]: '💬 Conversationnel',
  [AgentRole?.Researcher]: '🔍 Chercheur',
  [AgentRole?.Tester]: '🧪 Testeur',
  [AgentRole?.Planner]: '📋 Planificateur',
  [AgentRole?.Orchestrator]: '🎭 Orchestrateur',
  [AgentRole?.System]: '⚙️ Système',
  [AgentRole?.Debugger]: '🐛 Débogueur',
  [AgentRole?.Admin]: '👑 Administrateur',
};

/**
 * Descriptions des rôles
 */
export const AgentRoleDescriptions: Record<AgentRole, string> = {
  [AgentRole?.Security]: 'Surveillance, validation et protection des systèmes',
  [AgentRole?.CodeGenerator]: 'Génération et optimisation de code source',
  [AgentRole?.Analyst]: 'Analyse approfondie et diagnostic des problèmes',
  [AgentRole?.Creative]: 'Création de contenu, design et écriture créative',
  [AgentRole?.Conversational]: 'Interaction naturelle avec les utilisateurs',
  [AgentRole?.Researcher]: 'Recherche documentaire et veille technologique',
  [AgentRole?.Tester]: 'Tests automatisés et validation qualité',
  [AgentRole?.Planner]: 'Planification stratégique et gestion de projet',
  [AgentRole?.Orchestrator]: 'Coordination des agents et workflows',
  [AgentRole?.System]: 'Maintenance système et monitoring',
  [AgentRole?.Debugger]: 'Débogage et résolution de bugs',
  [AgentRole?.Admin]: 'Administration complète du système',
};

/**
 * Permissions recommandées par rôle
 */
export const RecommendedPermissionsByRole: Record<AgentRole, AgentIAPermission> = {
  [AgentRole?.Security]: AgentIAPermission?.NoExternal,
  [AgentRole?.CodeGenerator]: AgentIAPermission?.OpenAIOnly,
  [AgentRole?.Analyst]: AgentIAPermission?.ClaudeOnly,
  [AgentRole?.Creative]: AgentIAPermission?.GeminiOnly,
  [AgentRole?.Conversational]: AgentIAPermission?.AllExternal,
  [AgentRole?.Researcher]: AgentIAPermission?.ClaudeOnly,
  [AgentRole?.Tester]: AgentIAPermission?.OpenAIOnly,
  [AgentRole?.Planner]: AgentIAPermission?.ClaudeOnly,
  [AgentRole?.Orchestrator]: AgentIAPermission?.AllExternal,
  [AgentRole?.System]: AgentIAPermission?.NoExternal,
  [AgentRole?.Debugger]: AgentIAPermission?.OpenAIOnly,
  [AgentRole?.Admin]: AgentIAPermission?.AllExternal,
};
