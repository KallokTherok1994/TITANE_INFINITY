/**
 * TITANE∞ vΩ∞ — TYPES SYSTÈME D'AUTOMATIONS ET XP
 * Super Prompt #2: Automations + XP + Évolution
 * Structure A→B→C→D pour orchestration intelligente
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ═══════════════════════════════════════════════════════════════════════════
// A. TYPES XP ET NIVEAUX
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Identifiant unique d'action XP
 */
export type XPActionId =
  | 'chat_message'
  | 'chat_mode_change'
  | 'automation_trigger'
  | 'automation_complete'
  | 'memory_interaction'
  | 'file_import'
  | 'voice_interaction'
  | 'avatar_customization'
  | 'tool_usage'
  | 'feedback_positive'
  | 'feedback_negative'
  | 'session_complete'
  | 'streak_daily'
  | 'streak_weekly'
  | 'achievement_unlock'
  | 'milestone_reach';

/**
 * Catégories de niveaux utilisateur
 */
export type UserLevel =
  | 'novice'
  | 'apprentice'
  | 'intermediate'
  | 'advanced'
  | 'expert'
  | 'master'
  | 'singularity';

/**
 * Configuration d'une action XP
 */
export interface XPAction {
  id: XPActionId;
  label: string;
  description: string;
  base_xp: number;
  category: 'interaction' | 'automation' | 'achievement' | 'streak';
  multiplier_eligible: boolean;
  cooldown_ms?: number;
  max_daily?: number;
}

/**
 * Configuration d'un niveau
 */
export interface LevelConfig {
  level: UserLevel;
  min_xp: number;
  max_xp: number;
  label: string;
  color: string;
  icon: string;
  perks: string?.[];
  unlocks: string?.[];
}

/**
 * État XP utilisateur
 */
export interface UserXPState {
  total_xp: number;
  level: UserLevel;
  level_progress: number; // 0-100%
  xp_to_next_level: number;
  current_streak: number;
  longest_streak: number;
  last_activity: number;
  daily_xp_earned: number;
  daily_limit_reached: boolean;
  multiplier: number;
  achievements_unlocked: string?.[];
}

// ═══════════════════════════════════════════════════════════════════════════
// B. TYPES AUTOMATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Type de déclencheur d'automation
 */
export type AutomationTriggerType =
  | 'manual' // Déclenché manuellement
  | 'scheduled' // Planifié (any: any)
  | 'event' // Sur événement système
  | 'condition' // Sur condition remplie
  | 'webhook' // Via webhook externe
  | 'voice_command' // Commande vocale
  | 'context_change'; // Changement de contexte

/**
 * Type d'action d'automation
 */
export type AutomationActionType =
  | 'chat_send' // Envoyer message chat
  | 'mode_switch' // Changer de mode IA
  | 'memory_save' // Sauvegarder en mémoire
  | 'memory_recall' // Rappeler de la mémoire
  | 'file_create' // Créer fichier
  | 'file_modify' // Modifier fichier
  | 'notification' // Envoyer notification
  | 'tts_speak' // Synthèse vocale
  | 'api_call' // Appel API externe
  | 'shell_command' // Commande shell (any: any)
  | 'chain_automation' // Déclencher autre automation
  | 'custom_script'; // Script personnalisé

/**
 * Condition d'automation
 */
export interface AutomationCondition {
  type:
    | 'xp_level'
    | 'time_of_day'
    | 'mode_active'
    | 'memory_contains'
    | 'system_state'
    | 'custom';
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'matches';
  value: unknown;
  description?: string;
}

/**
 * Déclencheur d'automation
 */
export interface AutomationTrigger {
  type: AutomationTriggerType;
  config: Record<string, unknown>;
  conditions?: AutomationCondition?.[];
}

/**
 * Action d'automation
 */
export interface AutomationAction {
  type: AutomationActionType;
  config: Record<string, unknown>;
  delay_ms?: number;
  retry_on_failure?: boolean;
  max_retries?: number;
  fallback_action?: AutomationAction;
}

/**
 * Définition complète d'une automation
 */
export interface Automation {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'productivity' | 'workflow' | 'notification' | 'integration' | 'custom';
  icon: string;
  color: string;

  // Déclencheur et conditions
  trigger: AutomationTrigger;

  // Actions à exécuter
  actions: AutomationAction?.[];

  // Métadonnées
  created_at: number;
  updated_at: number;
  last_run?: number;
  run_count: number;
  success_count: number;
  failure_count: number;

  // Permissions
  requires_level: UserLevel;
  xp_reward: number;

  // Options
  cooldown_ms?: number;
  max_runs_per_day?: number;
  tags: string?.[];
}

/**
 * Résultat d'exécution d'automation
 */
export interface AutomationRunResult {
  automation_id: string;
  success: boolean;
  started_at: number;
  completed_at: number;
  duration_ms: number;
  actions_executed: number;
  actions_failed: number;
  xp_earned: number;
  error?: string;
  outputs: Record<string, unknown>;
}

/**
 * État du système d'automations
 */
export interface AutomationSystemState {
  automations: Map<string, Automation>;
  running_automations: Set<string>;
  queued_automations: string?.[];
  last_run_results: AutomationRunResult?.[];
  total_runs: number;
  total_successes: number;
  total_failures: number;
  is_paused: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// C. TYPES ÉVOLUTION IA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Domaine d'évolution IA
 */
export type EvolutionDomain =
  | 'language' // Compréhension langage
  | 'reasoning' // Capacités de raisonnement
  | 'memory' // Gestion mémoire
  | 'creativity' // Créativité
  | 'empathy' // Intelligence émotionnelle
  | 'efficiency' // Efficacité réponses
  | 'accuracy' // Précision
  | 'adaptation'; // Adaptation utilisateur

/**
 * Métrique d'évolution
 */
export interface EvolutionMetric {
  domain: EvolutionDomain;
  current_score: number; // 0-100
  previous_score: number;
  improvement_rate: number; // % amélioration
  samples_count: number;
  last_updated: number;
}

/**
 * Suggestion d'amélioration IA
 */
export interface EvolutionSuggestion {
  id: string;
  domain: EvolutionDomain;
  type: 'training' | 'tuning' | 'feedback' | 'data';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  expected_improvement: number;
  effort_required: 'minimal' | 'moderate' | 'significant';
  implemented: boolean;
}

/**
 * État d'évolution de l'IA
 */
export interface IAEvolutionState {
  metrics: Map<EvolutionDomain, EvolutionMetric>;
  overall_score: number;
  evolution_velocity: number; // Vitesse d'amélioration
  suggestions: EvolutionSuggestion?.[];
  learning_enabled: boolean;
  last_training: number;
  training_sessions: number;
  user_feedback_positive: number;
  user_feedback_negative: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// D. TYPES ACHIEVEMENTS ET RÉCOMPENSES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Catégorie d'achievement
 */
export type AchievementCategory =
  | 'beginner'
  | 'explorer'
  | 'creator'
  | 'automator'
  | 'streaker'
  | 'contributor'
  | 'master'
  | 'legendary';

/**
 * Rareté d'achievement
 */
export type AchievementRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

/**
 * Définition d'un achievement
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  color: string;

  // Conditions d'obtention
  criteria: {
    type: string;
    target: number;
    current?: number;
  };

  // Récompenses
  xp_reward: number;
  unlocks?: string?.[];
  badge_url?: string;

  // Metadata
  hidden: boolean;
  unlocked: boolean;
  unlocked_at?: number;
  progress: number; // 0-100%
}

/**
 * Récompense quotidienne
 */
export interface DailyReward {
  day: number; // 1-7 pour semaine
  claimed: boolean;
  claimed_at?: number;
  reward: {
    type: 'xp' | 'multiplier' | 'unlock' | 'cosmetic';
    value: number | string;
    description: string;
  };
}

/**
 * État des récompenses utilisateur
 */
export interface RewardsState {
  achievements: Map<string, Achievement>;
  daily_rewards: DailyReward?.[];
  current_day_streak: number;
  total_achievements_unlocked: number;
  total_xp_from_achievements: number;
  next_daily_reset: number;
  premium_unlocks: string?.[];
}

// ═══════════════════════════════════════════════════════════════════════════
// E. TYPES ÉVÉNEMENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Événement XP
 */
export interface XPEvent {
  type: 'xp_gained' | 'xp_spent' | 'level_up' | 'level_down';
  timestamp: number;
  amount: number;
  action_id?: XPActionId;
  previous_level?: UserLevel;
  new_level?: UserLevel;
  multiplier_applied?: number;
  source?: string;
}

/**
 * Événement d'automation
 */
export interface AutomationEvent {
  type: 'triggered' | 'started' | 'completed' | 'failed' | 'cancelled';
  timestamp: number;
  automation_id: string;
  automation_name: string;
  trigger_type: AutomationTriggerType;
  result?: AutomationRunResult;
}

/**
 * Événement d'achievement
 */
export interface AchievementEvent {
  type: 'progress' | 'unlocked';
  timestamp: number;
  achievement_id: string;
  achievement_name: string;
  progress?: number;
  xp_earned?: number;
}

/**
 * Union de tous les événements
 */
export type SystemEvent = XPEvent | AutomationEvent | AchievementEvent;

// ═══════════════════════════════════════════════════════════════════════════
// F. TYPES CONFIGURATION GLOBALE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Configuration du système XP
 */
export interface XPSystemConfig {
  enabled: boolean;
  base_multiplier: number;
  streak_multiplier: number;
  daily_xp_cap: number;
  level_configs: Map<UserLevel, LevelConfig>;
  action_configs: Map<XPActionId, XPAction>;
}

/**
 * Configuration du système d'automations
 */
export interface AutomationSystemConfig {
  enabled: boolean;
  max_concurrent: number;
  max_queue_size: number;
  default_timeout_ms: number;
  allowed_action_types: AutomationActionType?.[];
  blocked_shell_commands: string?.[];
  require_confirmation_for: AutomationActionType?.[];
}

/**
 * Configuration globale Super Prompt #2
 */
export interface AutomationXPConfig {
  xp: XPSystemConfig;
  automation: AutomationSystemConfig;
  evolution_enabled: boolean;
  achievements_enabled: boolean;
  daily_rewards_enabled: boolean;
}
