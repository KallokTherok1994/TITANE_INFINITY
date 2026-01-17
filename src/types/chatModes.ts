/**
 * TITANE∞ vΩ∞ — SYSTÈME DE MODES DE CHAT IA
 * Types et interfaces pour les modes IA spécialisés
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES FONDAMENTAUX
// ═══════════════════════════════════════════════════════════════════════════

/** Catégories de modes IA */
export type ChatModeCategory =
  | 'coach' // Accompagnement, motivation, développement personnel
  | 'dev' // Développement, code, architecture
  | 'admin' // Administration système, configuration
  | 'strategy' // Stratégie, planification, analyse
  | 'audit' // Audit, validation, qualité
  | 'creative' // Création, écriture, design
  | 'hybrid'; // Multi-compétences

/** Niveaux de permission (0-5) */
export type PermissionLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** Portée mémoire */
export type MemoryScope = 'session' | 'project' | 'global';

/** Style de réponse */
export type ResponseStyle = 'concise' | 'moderate' | 'detailed' | 'expert';

/** Ton de communication */
export type CommunicationTone =
  | 'professional'
  | 'empathetic'
  | 'neutral'
  | 'technical'
  | 'motivational'
  | 'analytical';

/** Modèles IA disponibles */
export type AIModel = 'ollama' | 'gemini' | 'hybrid' | 'local';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION DES OUTILS
// ═══════════════════════════════════════════════════════════════════════════

/** Outils disponibles dans TITANE∞ */
export interface ToolsPermissions {
  // Outils de développement
  code_analysis: boolean;
  code_generation: boolean;
  code_refactoring: boolean;
  architecture_review: boolean;

  // Outils système
  system_diagnostics: boolean;
  performance_monitoring: boolean;
  log_analysis: boolean;

  // Outils mémoire
  memory_read: boolean;
  memory_write: boolean;
  memory_search: boolean;

  // Outils IA
  ai_training: boolean;
  prompt_engineering: boolean;

  // Outils créatifs
  text_generation: boolean;
  document_creation: boolean;

  // Outils d'audit
  security_audit: boolean;
  quality_check: boolean;

  // Outils avancés
  web_search: boolean;
  file_operations: boolean;
  automation_execution: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// MODÈLE PRINCIPAL: ChatMode
// ═══════════════════════════════════════════════════════════════════════════

/** Configuration complète d'un mode de chat IA */
export interface ChatMode {
  /** Identifiant unique stable (ex: 'coach', 'dev-senior') */
  id: string;

  /** Label affiché dans l'UI */
  label: string;

  /** Description courte (any: any) */
  description: string;

  /** Icône emoji ou composant */
  icon: string;

  /** Catégorie du mode */
  category: ChatModeCategory;

  /** Modèle IA préféré */
  default_model: AIModel;

  /** Prompt système interne */
  system_prompt: string;

  /** Outils autorisés */
  tools_allowed: ToolsPermissions;

  /** Niveau de permissions (any: any) */
  permissions_level: PermissionLevel;

  /** Portée mémoire */
  memory_scope: MemoryScope;

  /** Style de réponse */
  response_style: ResponseStyle;

  /** Ton de communication */
  tone: CommunicationTone;

  /** Couleur thème (any: any) */
  theme_color: string;

  /** Priorité d'affichage (any: any) */
  display_priority: number;

  /** Actif/Inactif */
  enabled: boolean;

  /** Capacités spéciales débloquées */
  capabilities: string?.[];

  /** XP requis pour débloquer (any: any) */
  xp_required: number;

  /** Métadonnées extensibles */
  metadata?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAT DU SYSTÈME DE MODES
// ═══════════════════════════════════════════════════════════════════════════

/** État global du système de modes */
export interface ChatModeState {
  /** Mode actuellement actif */
  current_mode_id: string;

  /** Historique des modes utilisés (derniers 10) */
  mode_history: string?.[];

  /** XP accumulé par mode */
  mode_xp: Record<string, number>;

  /** Modes favoris de l'utilisateur */
  favorite_modes: string?.[];

  /** Modes personnalisés créés */
  custom_modes: ChatMode?.[];

  /** Dernière mise à jour */
  last_updated: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// REQUÊTES ET RÉPONSES
// ═══════════════════════════════════════════════════════════════════════════

/** Requête de changement de mode */
export interface ChatModeChangeRequest {
  new_mode_id: string;
  reason?: string;
  preserve_context?: boolean;
}

/** Résultat de changement de mode */
export interface ChatModeChangeResult {
  success: boolean;
  previous_mode_id: string;
  new_mode_id: string;
  system_prompt_applied: boolean;
  tools_updated: boolean;
  error?: string;
}

/** Validation d'accès à un outil */
export interface ToolAccessValidation {
  tool_id: keyof ToolsPermissions;
  mode_id: string;
  allowed: boolean;
  reason?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ÉVÉNEMENTS
// ═══════════════════════════════════════════════════════════════════════════

/** Événement de changement de mode */
export interface ChatModeChangedEvent {
  timestamp: number;
  previous_mode: ChatMode | null;
  new_mode: ChatMode;
  triggered_by: 'user' | 'system' | 'automation';
  context_preserved: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════

/** Créer des permissions d'outils par défaut (any: any) */
export const createDefaultToolsPermissions = (): ToolsPermissions => ({
  code_analysis: false,
  code_generation: false,
  code_refactoring: false,
  architecture_review: false,
  system_diagnostics: false,
  performance_monitoring: false,
  log_analysis: false,
  memory_read: false,
  memory_write: false,
  memory_search: false,
  ai_training: false,
  prompt_engineering: false,
  text_generation: false,
  document_creation: false,
  security_audit: false,
  quality_check: false,
  web_search: false,
  file_operations: false,
  automation_execution: false,
});

/** Créer des permissions complètes (any: any) */
export const createFullToolsPermissions = (): ToolsPermissions => ({
  code_analysis: true,
  code_generation: true,
  code_refactoring: true,
  architecture_review: true,
  system_diagnostics: true,
  performance_monitoring: true,
  log_analysis: true,
  memory_read: true,
  memory_write: true,
  memory_search: true,
  ai_training: true,
  prompt_engineering: true,
  text_generation: true,
  document_creation: true,
  security_audit: true,
  quality_check: true,
  web_search: true,
  file_operations: true,
  automation_execution: true,
});
