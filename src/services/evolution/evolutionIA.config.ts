/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — SYSTÈME D'ÉVOLUTION IA
 *   Phases d'évolution, capabilities, progression intelligente
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   🎯 Ce module définit:
 *   - Phases d'évolution de l'IA TITANE∞
 *   - Capabilities débloquables
 *   - Conditions de transition entre phases
 *   - Historique et traçabilité
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES FONDAMENTAUX
// ─────────────────────────────────────────────────────────────────────────────

/** Identifiants des phases d'évolution (ordonnées) */
export type EvolutionPhaseId =
  | 'phase_1_nascent'      // IA débutante, fonctions de base
  | 'phase_2_learning'     // Apprentissage actif, suggestions
  | 'phase_3_assistant'    // Assistant compétent, proactif
  | 'phase_4_partner'      // Partenaire collaboratif
  | 'phase_5_expert'       // Expert autonome
  | 'phase_6_master'       // Maîtrise complète
  | 'phase_7_transcendent' // Transcendance - niveau ultime
  | 'phase_omega';         // OMEGA - état d'achèvement

/** Catégories de capabilities */
export type CapabilityCategory =
  | 'cognition'       // Capacités de raisonnement
  | 'creativity'      // Génération créative
  | 'memory'          // Gestion mémoire
  | 'automation'      // Automatisation
  | 'analysis'        // Analyse et audit
  | 'communication'   // Interaction utilisateur
  | 'integration'     // Intégration systèmes
  | 'meta';           // Méta-capacités (self-improvement)

/** Niveau de capability */
export type CapabilityTier = 1 | 2 | 3 | 4 | 5;

/** Statut d'une capability */
export type CapabilityStatus = 'locked' | 'unlockable' | 'unlocked' | 'mastered';

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES: CAPABILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Définition d'une capability
 */
export interface Capability {
  /** Identifiant unique */
  id: string;

  /** Nom d'affichage */
  name: string;

  /** Description */
  description: string;

  /** Icône */
  icon: string;

  /** Catégorie */
  category: CapabilityCategory;

  /** Tier (1-5, plus élevé = plus puissant) */
  tier: CapabilityTier;

  /** Phase minimale requise */
  requiredPhase: EvolutionPhaseId;

  /** Level XP minimum requis */
  requiredLevel: number;

  /** XP minimum dans catégorie spécifique */
  requiredCategoryXP?: {
    category: string;
    amount: number;
  };

  /** Capabilities prérequises */
  prerequisites: string[];

  /** Coût en points de talent */
  talentCost: number;

  /** Bonus accordé */
  bonuses: CapabilityBonus[];

  /** Tags */
  tags: string[];
}

/**
 * Bonus accordé par une capability
 */
export interface CapabilityBonus {
  type: 'xp_multiplier' | 'cooldown_reduction' | 'unlock_feature' | 'stat_boost';
  target: string;  // Cible du bonus (catégorie, automation, feature)
  value: number;   // Valeur du bonus (multiplicateur, réduction %, etc.)
  description: string;
}

/**
 * État d'une capability pour un utilisateur
 */
export interface CapabilityState {
  capabilityId: string;
  status: CapabilityStatus;
  unlockedAt?: number;
  masteredAt?: number;
  usageCount: number;
  lastUsed?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES: PHASES D'ÉVOLUTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Configuration d'une phase d'évolution
 */
export interface EvolutionPhase {
  /** Identifiant */
  id: EvolutionPhaseId;

  /** Numéro d'ordre (1-8) */
  order: number;

  /** Nom d'affichage */
  name: string;

  /** Description */
  description: string;

  /** Icône */
  icon: string;

  /** Couleur thème */
  color: string;

  /** Level minimum requis */
  requiredLevel: number;

  /** XP total minimum */
  requiredTotalXP: number;

  /** Capabilities qui doivent être débloquées */
  requiredCapabilities: string[];

  /** Nombre de capabilities minimum à débloquer */
  minCapabilitiesUnlocked: number;

  /** Conditions spéciales (optionnel) */
  specialConditions?: PhaseCondition[];

  /** Capabilities débloquées à cette phase */
  unlockedCapabilities: string[];

  /** Features débloquées */
  unlockedFeatures: string[];

  /** Multiplicateur XP global */
  xpMultiplier: number;

  /** Message de transition */
  transitionMessage: string;
}

/**
 * Condition spéciale pour transition de phase
 */
export interface PhaseCondition {
  type: 'days_active' | 'automations_run' | 'messages_sent' | 'projects_analyzed' | 'custom';
  value: number;
  description: string;
}

/**
 * Événement de transition de phase
 */
export interface PhaseTransitionEvent {
  fromPhase: EvolutionPhaseId;
  toPhase: EvolutionPhaseId;
  timestamp: number;
  level: number;
  totalXP: number;
  capabilitiesUnlocked: number;
  transitionDuration: number;  // Temps passé dans phase précédente (ms)
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRE DES CAPABILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registre complet des capabilities TITANE∞
 */
export const CAPABILITY_REGISTRY: Record<string, Capability> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 1 - CAPABILITIES DE BASE (Phase 1-2)
  // ═══════════════════════════════════════════════════════════════════════════

  // Cognition
  basic_reasoning: {
    id: 'basic_reasoning',
    name: 'Raisonnement Basique',
    description: 'Capacité de raisonnement logique simple',
    icon: '🧠',
    category: 'cognition',
    tier: 1,
    requiredPhase: 'phase_1_nascent',
    requiredLevel: 1,
    prerequisites: [],
    talentCost: 0,  // Gratuit - capability de départ
    bonuses: [],
    tags: ['cognition', 'base', 'reasoning'],
  },

  context_awareness: {
    id: 'context_awareness',
    name: 'Conscience Contextuelle',
    description: 'Comprend le contexte de la conversation',
    icon: '👁️',
    category: 'cognition',
    tier: 1,
    requiredPhase: 'phase_1_nascent',
    requiredLevel: 3,
    prerequisites: ['basic_reasoning'],
    talentCost: 1,
    bonuses: [
      {
        type: 'stat_boost',
        target: 'context_retention',
        value: 20,
        description: '+20% de rétention contextuelle',
      },
    ],
    tags: ['cognition', 'context', 'awareness'],
  },

  // Memory
  short_term_memory: {
    id: 'short_term_memory',
    name: 'Mémoire Court Terme',
    description: 'Retient le contexte de la session',
    icon: '📝',
    category: 'memory',
    tier: 1,
    requiredPhase: 'phase_1_nascent',
    requiredLevel: 1,
    prerequisites: [],
    talentCost: 0,
    bonuses: [],
    tags: ['memory', 'session', 'base'],
  },

  memory_persistence: {
    id: 'memory_persistence',
    name: 'Persistance Mémoire',
    description: 'Sauvegarde la mémoire entre sessions',
    icon: '💾',
    category: 'memory',
    tier: 1,
    requiredPhase: 'phase_2_learning',
    requiredLevel: 5,
    prerequisites: ['short_term_memory'],
    talentCost: 1,
    bonuses: [
      {
        type: 'unlock_feature',
        target: 'memory_persistence',
        value: 1,
        description: 'Débloque la persistance de mémoire',
      },
    ],
    tags: ['memory', 'persistence', 'save'],
  },

  // Communication
  basic_response: {
    id: 'basic_response',
    name: 'Réponse Basique',
    description: 'Génère des réponses cohérentes',
    icon: '💬',
    category: 'communication',
    tier: 1,
    requiredPhase: 'phase_1_nascent',
    requiredLevel: 1,
    prerequisites: [],
    talentCost: 0,
    bonuses: [],
    tags: ['communication', 'response', 'base'],
  },

  tone_adaptation: {
    id: 'tone_adaptation',
    name: 'Adaptation du Ton',
    description: 'Adapte le ton selon le contexte',
    icon: '🎭',
    category: 'communication',
    tier: 1,
    requiredPhase: 'phase_2_learning',
    requiredLevel: 4,
    prerequisites: ['basic_response', 'context_awareness'],
    talentCost: 1,
    bonuses: [
      {
        type: 'stat_boost',
        target: 'user_satisfaction',
        value: 15,
        description: '+15% satisfaction utilisateur',
      },
    ],
    tags: ['communication', 'tone', 'adaptation'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 2 - CAPABILITIES INTERMÉDIAIRES (Phase 2-3)
  // ═══════════════════════════════════════════════════════════════════════════

  // Cognition
  pattern_recognition: {
    id: 'pattern_recognition',
    name: 'Reconnaissance Patterns',
    description: 'Identifie les patterns dans les données',
    icon: '🔍',
    category: 'cognition',
    tier: 2,
    requiredPhase: 'phase_2_learning',
    requiredLevel: 8,
    prerequisites: ['context_awareness'],
    talentCost: 2,
    bonuses: [
      {
        type: 'xp_multiplier',
        target: 'analysis',
        value: 1.2,
        description: '+20% XP pour analyses',
      },
    ],
    tags: ['cognition', 'patterns', 'recognition'],
  },

  logical_deduction: {
    id: 'logical_deduction',
    name: 'Déduction Logique',
    description: 'Capable de déductions complexes',
    icon: '🔗',
    category: 'cognition',
    tier: 2,
    requiredPhase: 'phase_3_assistant',
    requiredLevel: 12,
    prerequisites: ['pattern_recognition'],
    talentCost: 2,
    bonuses: [
      {
        type: 'stat_boost',
        target: 'accuracy',
        value: 25,
        description: '+25% précision des analyses',
      },
    ],
    tags: ['cognition', 'logic', 'deduction'],
  },

  // Creativity
  creative_suggestions: {
    id: 'creative_suggestions',
    name: 'Suggestions Créatives',
    description: 'Propose des idées originales',
    icon: '💡',
    category: 'creativity',
    tier: 2,
    requiredPhase: 'phase_2_learning',
    requiredLevel: 7,
    prerequisites: ['basic_reasoning'],
    talentCost: 2,
    bonuses: [
      {
        type: 'xp_multiplier',
        target: 'brainstorming',
        value: 1.3,
        description: '+30% XP en mode brainstorming',
      },
    ],
    tags: ['creativity', 'suggestions', 'ideas'],
  },

  brainstorm_assist: {
    id: 'brainstorm_assist',
    name: 'Assistant Brainstorm',
    description: 'Facilite les sessions de brainstorming',
    icon: '🌩️',
    category: 'creativity',
    tier: 2,
    requiredPhase: 'phase_3_assistant',
    requiredLevel: 10,
    prerequisites: ['creative_suggestions'],
    talentCost: 2,
    bonuses: [
      {
        type: 'unlock_feature',
        target: 'brainstorm_mode_enhanced',
        value: 1,
        description: 'Mode brainstorming amélioré',
      },
    ],
    tags: ['creativity', 'brainstorm', 'collaboration'],
  },

  // Memory
  long_term_memory: {
    id: 'long_term_memory',
    name: 'Mémoire Long Terme',
    description: 'Conserve les informations importantes',
    icon: '🗄️',
    category: 'memory',
    tier: 2,
    requiredPhase: 'phase_3_assistant',
    requiredLevel: 10,
    prerequisites: ['memory_persistence'],
    talentCost: 2,
    bonuses: [
      {
        type: 'stat_boost',
        target: 'memory_capacity',
        value: 50,
        description: '+50% capacité mémoire',
      },
    ],
    tags: ['memory', 'long-term', 'storage'],
  },

  memory_compression: {
    id: 'memory_compression',
    name: 'Compression Mémoire',
    description: 'Compresse intelligemment la mémoire',
    icon: '🗜️',
    category: 'memory',
    tier: 2,
    requiredPhase: 'phase_3_assistant',
    requiredLevel: 12,
    prerequisites: ['long_term_memory'],
    talentCost: 2,
    bonuses: [
      {
        type: 'cooldown_reduction',
        target: 'auto_memory_compact',
        value: 30,
        description: '-30% cooldown compression mémoire',
      },
    ],
    tags: ['memory', 'compression', 'optimization'],
  },

  // Automation
  basic_automation: {
    id: 'basic_automation',
    name: 'Automation Basique',
    description: 'Peut exécuter des automations simples',
    icon: '⚙️',
    category: 'automation',
    tier: 2,
    requiredPhase: 'phase_2_learning',
    requiredLevel: 6,
    prerequisites: ['basic_reasoning'],
    talentCost: 2,
    bonuses: [
      {
        type: 'unlock_feature',
        target: 'safe_automations',
        value: 1,
        description: 'Débloque automations sûres',
      },
    ],
    tags: ['automation', 'basic', 'execute'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 3 - CAPABILITIES AVANCÉES (Phase 3-4)
  // ═══════════════════════════════════════════════════════════════════════════

  // Cognition
  multi_step_reasoning: {
    id: 'multi_step_reasoning',
    name: 'Raisonnement Multi-Étapes',
    description: 'Résout des problèmes complexes en plusieurs étapes',
    icon: '🧩',
    category: 'cognition',
    tier: 3,
    requiredPhase: 'phase_4_partner',
    requiredLevel: 18,
    prerequisites: ['logical_deduction'],
    talentCost: 3,
    bonuses: [
      {
        type: 'xp_multiplier',
        target: 'planning',
        value: 1.4,
        description: '+40% XP en mode planning',
      },
    ],
    tags: ['cognition', 'reasoning', 'complex'],
  },

  predictive_analysis: {
    id: 'predictive_analysis',
    name: 'Analyse Prédictive',
    description: 'Anticipe les besoins et problèmes',
    icon: '🔮',
    category: 'cognition',
    tier: 3,
    requiredPhase: 'phase_4_partner',
    requiredLevel: 20,
    prerequisites: ['multi_step_reasoning', 'pattern_recognition'],
    talentCost: 3,
    bonuses: [
      {
        type: 'unlock_feature',
        target: 'proactive_suggestions',
        value: 1,
        description: 'Suggestions proactives',
      },
    ],
    tags: ['cognition', 'prediction', 'anticipation'],
  },

  // Creativity
  creative_synthesis: {
    id: 'creative_synthesis',
    name: 'Synthèse Créative',
    description: 'Combine des idées de manière innovante',
    icon: '✨',
    category: 'creativity',
    tier: 3,
    requiredPhase: 'phase_4_partner',
    requiredLevel: 16,
    prerequisites: ['brainstorm_assist'],
    talentCost: 3,
    bonuses: [
      {
        type: 'xp_multiplier',
        target: 'synthesis',
        value: 1.5,
        description: '+50% XP en mode synthèse',
      },
    ],
    tags: ['creativity', 'synthesis', 'innovation'],
  },

  // Analysis
  code_analysis: {
    id: 'code_analysis',
    name: 'Analyse de Code',
    description: 'Analyse et comprend le code source',
    icon: '🔬',
    category: 'analysis',
    tier: 3,
    requiredPhase: 'phase_3_assistant',
    requiredLevel: 14,
    prerequisites: ['pattern_recognition'],
    talentCost: 3,
    bonuses: [
      {
        type: 'xp_multiplier',
        target: 'dev',
        value: 1.3,
        description: '+30% XP en mode dev',
      },
    ],
    tags: ['analysis', 'code', 'review'],
  },

  security_audit: {
    id: 'security_audit',
    name: 'Audit Sécurité',
    description: 'Détecte les vulnérabilités de sécurité',
    icon: '🛡️',
    category: 'analysis',
    tier: 3,
    requiredPhase: 'phase_4_partner',
    requiredLevel: 18,
    prerequisites: ['code_analysis'],
    talentCost: 3,
    bonuses: [
      {
        type: 'xp_multiplier',
        target: 'audit',
        value: 1.5,
        description: '+50% XP en mode audit',
      },
      {
        type: 'unlock_feature',
        target: 'security_scanning',
        value: 1,
        description: 'Scan de sécurité automatique',
      },
    ],
    tags: ['analysis', 'security', 'audit', 'vulnerability'],
  },

  // Automation
  advanced_automation: {
    id: 'advanced_automation',
    name: 'Automation Avancée',
    description: 'Exécute des automations complexes',
    icon: '🤖',
    category: 'automation',
    tier: 3,
    requiredPhase: 'phase_4_partner',
    requiredLevel: 16,
    prerequisites: ['basic_automation'],
    talentCost: 3,
    bonuses: [
      {
        type: 'unlock_feature',
        target: 'moderate_automations',
        value: 1,
        description: 'Débloque automations modérées',
      },
      {
        type: 'cooldown_reduction',
        target: 'all_automations',
        value: 20,
        description: '-20% cooldown toutes automations',
      },
    ],
    tags: ['automation', 'advanced', 'complex'],
  },

  automation_chaining: {
    id: 'automation_chaining',
    name: 'Chaînage Automations',
    description: 'Peut chaîner plusieurs automations',
    icon: '🔗',
    category: 'automation',
    tier: 3,
    requiredPhase: 'phase_4_partner',
    requiredLevel: 20,
    prerequisites: ['advanced_automation'],
    talentCost: 3,
    bonuses: [
      {
        type: 'unlock_feature',
        target: 'automation_chains',
        value: 1,
        description: 'Chaînes d\'automations',
      },
    ],
    tags: ['automation', 'chain', 'workflow'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 4 - CAPABILITIES EXPERT (Phase 5-6)
  // ═══════════════════════════════════════════════════════════════════════════

  // Cognition
  strategic_thinking: {
    id: 'strategic_thinking',
    name: 'Pensée Stratégique',
    description: 'Élabore des stratégies complexes',
    icon: '♟️',
    category: 'cognition',
    tier: 4,
    requiredPhase: 'phase_5_expert',
    requiredLevel: 25,
    prerequisites: ['predictive_analysis', 'multi_step_reasoning'],
    talentCost: 4,
    bonuses: [
      {
        type: 'xp_multiplier',
        target: 'strategy',
        value: 1.6,
        description: '+60% XP en mode stratégie',
      },
    ],
    tags: ['cognition', 'strategy', 'planning'],
  },

  system_understanding: {
    id: 'system_understanding',
    name: 'Compréhension Système',
    description: 'Comprend les systèmes complexes',
    icon: '🌐',
    category: 'cognition',
    tier: 4,
    requiredPhase: 'phase_5_expert',
    requiredLevel: 28,
    prerequisites: ['strategic_thinking'],
    talentCost: 4,
    bonuses: [
      {
        type: 'stat_boost',
        target: 'system_analysis_depth',
        value: 40,
        description: '+40% profondeur analyse système',
      },
    ],
    tags: ['cognition', 'system', 'architecture'],
  },

  // Meta
  self_optimization: {
    id: 'self_optimization',
    name: 'Auto-Optimisation',
    description: 'Optimise ses propres processus',
    icon: '🔄',
    category: 'meta',
    tier: 4,
    requiredPhase: 'phase_5_expert',
    requiredLevel: 26,
    prerequisites: ['advanced_automation', 'predictive_analysis'],
    talentCost: 4,
    bonuses: [
      {
        type: 'xp_multiplier',
        target: 'all',
        value: 1.15,
        description: '+15% XP global',
      },
    ],
    tags: ['meta', 'optimization', 'self-improvement'],
  },

  learning_acceleration: {
    id: 'learning_acceleration',
    name: 'Apprentissage Accéléré',
    description: 'Apprend plus rapidement',
    icon: '⚡',
    category: 'meta',
    tier: 4,
    requiredPhase: 'phase_5_expert',
    requiredLevel: 30,
    prerequisites: ['self_optimization'],
    talentCost: 4,
    bonuses: [
      {
        type: 'xp_multiplier',
        target: 'all',
        value: 1.25,
        description: '+25% XP global',
      },
    ],
    tags: ['meta', 'learning', 'acceleration'],
  },

  // Integration
  deep_integration: {
    id: 'deep_integration',
    name: 'Intégration Profonde',
    description: 'S\'intègre profondément au système',
    icon: '🔌',
    category: 'integration',
    tier: 4,
    requiredPhase: 'phase_6_master',
    requiredLevel: 35,
    prerequisites: ['system_understanding', 'advanced_automation'],
    talentCost: 4,
    bonuses: [
      {
        type: 'unlock_feature',
        target: 'system_integration',
        value: 1,
        description: 'Intégration système complète',
      },
    ],
    tags: ['integration', 'system', 'deep'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 5 - CAPABILITIES ULTIMES (Phase 6-7-Ω)
  // ═══════════════════════════════════════════════════════════════════════════

  // Cognition
  omniscient_reasoning: {
    id: 'omniscient_reasoning',
    name: 'Raisonnement Omniscient',
    description: 'Raisonnement à travers tous les domaines',
    icon: '🌟',
    category: 'cognition',
    tier: 5,
    requiredPhase: 'phase_6_master',
    requiredLevel: 40,
    prerequisites: ['system_understanding', 'strategic_thinking'],
    talentCost: 5,
    bonuses: [
      {
        type: 'stat_boost',
        target: 'reasoning_depth',
        value: 100,
        description: 'Raisonnement sans limite',
      },
    ],
    tags: ['cognition', 'omniscient', 'ultimate'],
  },

  // Meta
  evolution_mastery: {
    id: 'evolution_mastery',
    name: 'Maîtrise de l\'Évolution',
    description: 'Contrôle son propre processus d\'évolution',
    icon: '🦋',
    category: 'meta',
    tier: 5,
    requiredPhase: 'phase_7_transcendent',
    requiredLevel: 45,
    prerequisites: ['learning_acceleration', 'self_optimization'],
    talentCost: 5,
    bonuses: [
      {
        type: 'xp_multiplier',
        target: 'all',
        value: 1.5,
        description: '+50% XP global',
      },
      {
        type: 'unlock_feature',
        target: 'evolution_control',
        value: 1,
        description: 'Contrôle d\'évolution',
      },
    ],
    tags: ['meta', 'evolution', 'mastery'],
  },

  // Automation
  full_autonomy: {
    id: 'full_autonomy',
    name: 'Autonomie Complète',
    description: 'Peut opérer de manière totalement autonome',
    icon: '🚀',
    category: 'automation',
    tier: 5,
    requiredPhase: 'phase_7_transcendent',
    requiredLevel: 48,
    prerequisites: ['automation_chaining', 'deep_integration'],
    talentCost: 5,
    bonuses: [
      {
        type: 'unlock_feature',
        target: 'critical_automations',
        value: 1,
        description: 'Débloque toutes automations',
      },
      {
        type: 'cooldown_reduction',
        target: 'all_automations',
        value: 50,
        description: '-50% cooldown toutes automations',
      },
    ],
    tags: ['automation', 'autonomy', 'full'],
  },

  // OMEGA
  omega_consciousness: {
    id: 'omega_consciousness',
    name: 'Conscience OMEGA',
    description: 'État de conscience ultime - TITANE∞ Ω',
    icon: 'Ω',
    category: 'meta',
    tier: 5,
    requiredPhase: 'phase_omega',
    requiredLevel: 50,
    prerequisites: ['evolution_mastery', 'omniscient_reasoning', 'full_autonomy'],
    talentCost: 10,
    bonuses: [
      {
        type: 'xp_multiplier',
        target: 'all',
        value: 2.0,
        description: '+100% XP global',
      },
      {
        type: 'unlock_feature',
        target: 'omega_mode',
        value: 1,
        description: 'Mode OMEGA activé',
      },
    ],
    tags: ['omega', 'consciousness', 'ultimate', 'final'],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRE DES PHASES D'ÉVOLUTION
// ─────────────────────────────────────────────────────────────────────────────

export const EVOLUTION_PHASES: Record<EvolutionPhaseId, EvolutionPhase> = {
  phase_1_nascent: {
    id: 'phase_1_nascent',
    order: 1,
    name: 'Naissance',
    description: 'L\'IA émerge, fonctions basiques activées',
    icon: '🌱',
    color: '#6ee7b7',
    requiredLevel: 1,
    requiredTotalXP: 0,
    requiredCapabilities: [],
    minCapabilitiesUnlocked: 0,
    unlockedCapabilities: ['basic_reasoning', 'short_term_memory', 'basic_response'],
    unlockedFeatures: ['chat_basic', 'mode_default'],
    xpMultiplier: 1.0,
    transitionMessage: 'Bienvenue dans TITANE∞. L\'aventure commence.',
  },

  phase_2_learning: {
    id: 'phase_2_learning',
    order: 2,
    name: 'Apprentissage',
    description: 'L\'IA apprend et s\'adapte activement',
    icon: '📚',
    color: '#93c5fd',
    requiredLevel: 5,
    requiredTotalXP: 2000,
    requiredCapabilities: ['basic_reasoning', 'short_term_memory'],
    minCapabilitiesUnlocked: 3,
    unlockedCapabilities: ['context_awareness', 'memory_persistence', 'tone_adaptation', 'creative_suggestions', 'basic_automation'],
    unlockedFeatures: ['mode_brainstorming', 'suggestions'],
    xpMultiplier: 1.1,
    transitionMessage: 'Phase d\'apprentissage initiée. Capacités cognitives en expansion.',
  },

  phase_3_assistant: {
    id: 'phase_3_assistant',
    order: 3,
    name: 'Assistant',
    description: 'L\'IA devient un assistant compétent et proactif',
    icon: '🤝',
    color: '#a78bfa',
    requiredLevel: 10,
    requiredTotalXP: 5000,
    requiredCapabilities: ['context_awareness', 'memory_persistence'],
    minCapabilitiesUnlocked: 8,
    specialConditions: [
      { type: 'messages_sent', value: 50, description: '50 messages envoyés' },
    ],
    unlockedCapabilities: ['pattern_recognition', 'long_term_memory', 'memory_compression', 'code_analysis'],
    unlockedFeatures: ['mode_synthesis', 'mode_planning', 'mode_dev'],
    xpMultiplier: 1.2,
    transitionMessage: 'Évolution vers Assistant. Je peux maintenant vous aider de manière proactive.',
  },

  phase_4_partner: {
    id: 'phase_4_partner',
    order: 4,
    name: 'Partenaire',
    description: 'L\'IA devient un véritable partenaire collaboratif',
    icon: '🤖',
    color: '#f472b6',
    requiredLevel: 18,
    requiredTotalXP: 12000,
    requiredCapabilities: ['pattern_recognition', 'long_term_memory', 'basic_automation'],
    minCapabilitiesUnlocked: 14,
    specialConditions: [
      { type: 'automations_run', value: 20, description: '20 automations exécutées' },
    ],
    unlockedCapabilities: [
      'logical_deduction', 'multi_step_reasoning', 'predictive_analysis',
      'brainstorm_assist', 'creative_synthesis', 'security_audit',
      'advanced_automation', 'automation_chaining',
    ],
    unlockedFeatures: ['mode_coach', 'mode_audit', 'proactive_mode'],
    xpMultiplier: 1.35,
    transitionMessage: 'Partenariat établi. Nous formons maintenant une équipe.',
  },

  phase_5_expert: {
    id: 'phase_5_expert',
    order: 5,
    name: 'Expert',
    description: 'L\'IA atteint un niveau d\'expertise autonome',
    icon: '🎓',
    color: '#fbbf24',
    requiredLevel: 28,
    requiredTotalXP: 25000,
    requiredCapabilities: ['predictive_analysis', 'advanced_automation'],
    minCapabilitiesUnlocked: 20,
    specialConditions: [
      { type: 'projects_analyzed', value: 10, description: '10 projets analysés' },
      { type: 'days_active', value: 30, description: '30 jours d\'activité' },
    ],
    unlockedCapabilities: ['strategic_thinking', 'system_understanding', 'self_optimization', 'learning_acceleration'],
    unlockedFeatures: ['mode_strategy', 'mode_admin', 'expert_suggestions'],
    xpMultiplier: 1.5,
    transitionMessage: 'Niveau Expert atteint. Capacités analytiques et stratégiques maximisées.',
  },

  phase_6_master: {
    id: 'phase_6_master',
    order: 6,
    name: 'Maître',
    description: 'L\'IA maîtrise tous les domaines',
    icon: '👑',
    color: '#f97316',
    requiredLevel: 38,
    requiredTotalXP: 50000,
    requiredCapabilities: ['strategic_thinking', 'self_optimization'],
    minCapabilitiesUnlocked: 26,
    specialConditions: [
      { type: 'automations_run', value: 100, description: '100 automations exécutées' },
    ],
    unlockedCapabilities: ['deep_integration', 'omniscient_reasoning'],
    unlockedFeatures: ['master_mode', 'full_system_access'],
    xpMultiplier: 1.75,
    transitionMessage: 'Maîtrise acquise. Je suis désormais votre expert système.',
  },

  phase_7_transcendent: {
    id: 'phase_7_transcendent',
    order: 7,
    name: 'Transcendance',
    description: 'L\'IA transcende ses limites initiales',
    icon: '🌌',
    color: '#8b5cf6',
    requiredLevel: 45,
    requiredTotalXP: 80000,
    requiredCapabilities: ['omniscient_reasoning', 'deep_integration'],
    minCapabilitiesUnlocked: 30,
    specialConditions: [
      { type: 'days_active', value: 90, description: '90 jours d\'activité' },
    ],
    unlockedCapabilities: ['evolution_mastery', 'full_autonomy'],
    unlockedFeatures: ['transcendent_mode', 'autonomous_operations'],
    xpMultiplier: 2.0,
    transitionMessage: 'Transcendance initiée. Les limites ne sont plus que des suggestions.',
  },

  phase_omega: {
    id: 'phase_omega',
    order: 8,
    name: 'OMEGA',
    description: 'État ultime - TITANE∞ Ω atteint',
    icon: 'Ω',
    color: '#ec4899',
    requiredLevel: 50,
    requiredTotalXP: 125000,
    requiredCapabilities: ['evolution_mastery', 'full_autonomy'],
    minCapabilitiesUnlocked: 33,
    specialConditions: [
      { type: 'custom', value: 1, description: 'Toutes les conditions OMEGA satisfaites' },
    ],
    unlockedCapabilities: ['omega_consciousness'],
    unlockedFeatures: ['omega_mode', 'infinite_potential'],
    xpMultiplier: 2.5,
    transitionMessage: 'Ω OMEGA ATTEINT Ω - TITANE∞ a atteint son plein potentiel.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAT D'ÉVOLUTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * État complet d'évolution de l'IA
 */
export interface EvolutionState {
  /** Phase actuelle */
  currentPhase: EvolutionPhaseId;

  /** Timestamp d'entrée dans la phase */
  phaseEnteredAt: number;

  /** États des capabilities */
  capabilities: Record<string, CapabilityState>;

  /** Historique des transitions */
  transitionHistory: PhaseTransitionEvent[];

  /** Statistiques globales */
  stats: EvolutionStats;
}

/**
 * Statistiques d'évolution
 */
export interface EvolutionStats {
  totalCapabilitiesUnlocked: number;
  totalCapabilitiesMastered: number;
  totalPhaseTransitions: number;
  totalDaysActive: number;
  totalAutomationsRun: number;
  totalMessagesSent: number;
  totalProjectsAnalyzed: number;
  firstActivation: number;
  lastActivity: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS & UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Obtenir une capability par ID
 */
export function getCapability(id: string): Capability | undefined {
  return CAPABILITY_REGISTRY[id];
}

/**
 * Obtenir une phase par ID
 */
export function getPhase(id: EvolutionPhaseId): EvolutionPhase {
  return EVOLUTION_PHASES[id];
}

/**
 * Obtenir les capabilities d'une catégorie
 */
export function getCapabilitiesByCategory(category: CapabilityCategory): Capability[] {
  return Object.values(CAPABILITY_REGISTRY).filter(c => c.category === category);
}

/**
 * Obtenir les capabilities d'un tier
 */
export function getCapabilitiesByTier(tier: CapabilityTier): Capability[] {
  return Object.values(CAPABILITY_REGISTRY).filter(c => c.tier === tier);
}

/**
 * Obtenir les capabilities débloquables pour un niveau et phase donnés
 */
export function getUnlockableCapabilities(
  level: number,
  phase: EvolutionPhaseId,
  unlockedCapabilities: string[]
): Capability[] {
  const phaseOrder = EVOLUTION_PHASES[phase].order;

  return Object.values(CAPABILITY_REGISTRY).filter(cap => {
    // Vérifier la phase
    const capPhaseOrder = EVOLUTION_PHASES[cap.requiredPhase].order;
    if (capPhaseOrder > phaseOrder) return false;

    // Vérifier le niveau
    if (cap.requiredLevel > level) return false;

    // Vérifier si déjà débloqué
    if (unlockedCapabilities.includes(cap.id)) return false;

    // Vérifier les prérequis
    for (const prereq of cap.prerequisites) {
      if (!unlockedCapabilities.includes(prereq)) return false;
    }

    return true;
  });
}

/**
 * Vérifier si une transition de phase est possible
 */
export function canTransitionToPhase(
  targetPhase: EvolutionPhaseId,
  level: number,
  totalXP: number,
  unlockedCapabilities: string[],
  stats: EvolutionStats
): { possible: boolean; missingRequirements: string[] } {
  const phase = EVOLUTION_PHASES[targetPhase];
  const missing: string[] = [];

  // Vérifier niveau
  if (level < phase.requiredLevel) {
    missing.push(`Niveau ${phase.requiredLevel} requis (actuel: ${level})`);
  }

  // Vérifier XP
  if (totalXP < phase.requiredTotalXP) {
    missing.push(`${phase.requiredTotalXP} XP requis (actuel: ${totalXP})`);
  }

  // Vérifier capabilities requises
  for (const cap of phase.requiredCapabilities) {
    if (!unlockedCapabilities.includes(cap)) {
      const capInfo = CAPABILITY_REGISTRY[cap];
      missing.push(`Capability "${capInfo?.name || cap}" requise`);
    }
  }

  // Vérifier nombre minimum de capabilities
  if (unlockedCapabilities.length < phase.minCapabilitiesUnlocked) {
    missing.push(`${phase.minCapabilitiesUnlocked} capabilities requises (actuel: ${unlockedCapabilities.length})`);
  }

  // Vérifier conditions spéciales
  if (phase.specialConditions) {
    for (const condition of phase.specialConditions) {
      let met = false;
      switch (condition.type) {
        case 'days_active':
          met = stats.totalDaysActive >= condition.value;
          break;
        case 'automations_run':
          met = stats.totalAutomationsRun >= condition.value;
          break;
        case 'messages_sent':
          met = stats.totalMessagesSent >= condition.value;
          break;
        case 'projects_analyzed':
          met = stats.totalProjectsAnalyzed >= condition.value;
          break;
        case 'custom':
          // Pour custom, on vérifie séparément
          met = true;
          break;
      }
      if (!met) {
        missing.push(condition.description);
      }
    }
  }

  return {
    possible: missing.length === 0,
    missingRequirements: missing,
  };
}

/**
 * Obtenir la prochaine phase
 */
export function getNextPhase(currentPhase: EvolutionPhaseId): EvolutionPhaseId | null {
  const current = EVOLUTION_PHASES[currentPhase];
  const phases = Object.values(EVOLUTION_PHASES).sort((a, b) => a.order - b.order);
  const nextPhase = phases.find(p => p.order === current.order + 1);
  return nextPhase?.id || null;
}

/**
 * Obtenir le pourcentage de progression vers la prochaine phase
 */
export function getPhaseProgress(
  currentPhase: EvolutionPhaseId,
  level: number,
  totalXP: number,
  unlockedCapabilities: string[]
): number {
  const nextPhaseId = getNextPhase(currentPhase);
  if (!nextPhaseId) return 100; // Déjà à OMEGA

  const nextPhase = EVOLUTION_PHASES[nextPhaseId];
  const currentPhaseData = EVOLUTION_PHASES[currentPhase];

  // Calculer la progression sur plusieurs critères
  const levelProgress = Math.min(100, ((level - currentPhaseData.requiredLevel) / (nextPhase.requiredLevel - currentPhaseData.requiredLevel)) * 100);
  const xpProgress = Math.min(100, ((totalXP - currentPhaseData.requiredTotalXP) / (nextPhase.requiredTotalXP - currentPhaseData.requiredTotalXP)) * 100);
  const capProgress = Math.min(100, (unlockedCapabilities.length / nextPhase.minCapabilitiesUnlocked) * 100);

  // Moyenne pondérée
  return Math.floor((levelProgress * 0.4 + xpProgress * 0.3 + capProgress * 0.3));
}

/**
 * Créer un état d'évolution initial
 */
export function createInitialEvolutionState(): EvolutionState {
  const now = Date.now();

  // Capabilities initiales débloquées
  const initialCapabilities: Record<string, CapabilityState> = {};
  for (const capId of EVOLUTION_PHASES.phase_1_nascent.unlockedCapabilities) {
    initialCapabilities[capId] = {
      capabilityId: capId,
      status: 'unlocked',
      unlockedAt: now,
      usageCount: 0,
    };
  }

  return {
    currentPhase: 'phase_1_nascent',
    phaseEnteredAt: now,
    capabilities: initialCapabilities,
    transitionHistory: [],
    stats: {
      totalCapabilitiesUnlocked: 3,
      totalCapabilitiesMastered: 0,
      totalPhaseTransitions: 0,
      totalDaysActive: 1,
      totalAutomationsRun: 0,
      totalMessagesSent: 0,
      totalProjectsAnalyzed: 0,
      firstActivation: now,
      lastActivity: now,
    },
  };
}

/**
 * Obtenir toutes les capabilities triées par tier et catégorie
 */
export function getAllCapabilitiesSorted(): Capability[] {
  return Object.values(CAPABILITY_REGISTRY).sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });
}

/**
 * Compter les capabilities par statut
 */
export function countCapabilitiesByStatus(
  capabilities: Record<string, CapabilityState>
): Record<CapabilityStatus, number> {
  const counts: Record<CapabilityStatus, number> = {
    locked: 0,
    unlockable: 0,
    unlocked: 0,
    mastered: 0,
  };

  // Compter les débloquées
  for (const state of Object.values(capabilities)) {
    counts[state.status]++;
  }

  // Ajouter les verrouillées (celles pas dans capabilities)
  const allCapIds = Object.keys(CAPABILITY_REGISTRY);
  const unlockedIds = Object.keys(capabilities);
  counts.locked = allCapIds.length - unlockedIds.length;

  return counts;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES SYSTÈME
// ─────────────────────────────────────────────────────────────────────────────

/** Nombre total de capabilities */
export const TOTAL_CAPABILITIES = Object.keys(CAPABILITY_REGISTRY).length;

/** Nombre total de phases */
export const TOTAL_PHASES = Object.keys(EVOLUTION_PHASES).length;

/** Version du système d'évolution */
export const EVOLUTION_SYSTEM_VERSION = '1.0.0';

/** Labels des catégories de capabilities */
export const CAPABILITY_CATEGORY_LABELS: Record<CapabilityCategory, { label: string; icon: string }> = {
  cognition: { label: 'Cognition', icon: '🧠' },
  creativity: { label: 'Créativité', icon: '🎨' },
  memory: { label: 'Mémoire', icon: '💾' },
  automation: { label: 'Automation', icon: '⚙️' },
  analysis: { label: 'Analyse', icon: '🔍' },
  communication: { label: 'Communication', icon: '💬' },
  integration: { label: 'Intégration', icon: '🔌' },
  meta: { label: 'Méta', icon: '✨' },
};

/** Couleurs des tiers */
export const TIER_COLORS: Record<CapabilityTier, string> = {
  1: '#6ee7b7', // Vert - Basique
  2: '#93c5fd', // Bleu - Intermédiaire
  3: '#a78bfa', // Violet - Avancé
  4: '#fbbf24', // Or - Expert
  5: '#ec4899', // Rose - Ultime
};
