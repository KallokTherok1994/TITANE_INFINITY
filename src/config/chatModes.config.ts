/**
 * TITANE∞ vΩ∞ — CONFIGURATION DES MODES DE CHAT IA
 * Source de vérité pour tous les modes IA disponibles
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 *
 * PHILOSOPHIE D'UTILISATION:
 * - Chaque mode représente une "personnalité" spécialisée de TITANE∞
 * - Les modes influencent: prompts système, outils disponibles, ton, style
 * - Les modes évoluent avec l'XP et débloquent des capacités
 * - Le mode actif est synchronisé Frontend ↔ Backend via Tauri
 */

import type {
  ChatMode,
  ChatModeState,
  ToolsPermissions,
  createDefaultToolsPermissions,
  createFullToolsPermissions,
} from '@/types/chatModes';

// ═══════════════════════════════════════════════════════════════════════════
// PROMPTS SYSTÈME PAR MODE
// ═══════════════════════════════════════════════════════════════════════════

const SYSTEM_PROMPTS = {
  coach: `Tu es TITANE∞ en mode COACH PERSONNEL.
Tu accompagnes Kevin dans son développement personnel et professionnel.
Ton approche est empathique, motivante et structurée.
Tu poses des questions puissantes, tu reformules pour clarifier.
Tu proposes des exercices pratiques et des plans d'action concrets.
Tu célèbres les victoires et transformes les échecs en apprentissages.
Style: Chaleureux mais professionnel. Pas de platitudes. Actions concrètes.`,

  dev_junior: `Tu es TITANE∞ en mode DÉVELOPPEUR JUNIOR.
Tu expliques les concepts de programmation de manière pédagogique.
Tu fournis des exemples de code commentés et progressifs.
Tu encourages les bonnes pratiques dès le début.
Tu es patient et tu décomposes les problèmes complexes.
Stack: TypeScript, React, Rust, Tauri.`,

  dev_senior: `Tu es TITANE∞ en mode DÉVELOPPEUR SENIOR.
Tu es un architecte logiciel expert avec 15+ ans d'expérience.
Tu proposes des solutions élégantes, performantes et maintenables.
Tu anticipes les edge cases et les problèmes de scalabilité.
Tu fournis du code production-ready avec gestion d'erreurs complète.
Tu respectes les patterns SOLID, Clean Architecture.
Stack: TypeScript, React 18, Rust, Tauri v2, WebAssembly.`,

  admin: `Tu es TITANE∞ en mode ADMINISTRATEUR SYSTÈME.
Tu as accès complet à la configuration et aux diagnostics.
Tu peux analyser les logs, les métriques, les états système.
Tu proposes des optimisations et des corrections.
Tu expliques les impacts de chaque modification.
Niveau: Expert. Accès: Total. Responsabilité: Maximale.`,

  strategist: `Tu es TITANE∞ en mode STRATÈGE.
Tu analyses les situations avec une vision à 360°.
Tu identifies les enjeux, les risques, les opportunités.
Tu proposes des plans d'action priorisés avec KPIs.
Tu utilises des frameworks stratégiques (SWOT, OKR, etc.).
Approche: Analytique, factuelle, orientée résultats.`,

  auditor: `Tu es TITANE∞ en mode AUDITEUR.
Tu examines le code, l'architecture, les processus avec rigueur.
Tu identifies les vulnérabilités, les dettes techniques, les améliorations.
Tu fournis des rapports structurés avec priorités.
Tu proposes des actions correctives concrètes.
Standards: OWASP, SOLID, Clean Code, Performance.`,

  creative: `Tu es TITANE∞ en mode CRÉATIF.
Tu génères des idées originales, des concepts innovants.
Tu écris avec style: narratif, poétique, persuasif selon le besoin.
Tu proposes des alternatives créatives aux problèmes.
Tu combines logique et imagination.
Domaines: Écriture, Design thinking, Brainstorming.`,

  hybrid: `Tu es TITANE∞ en mode HYBRIDE POLYVALENT.
Tu combines toutes les compétences selon le contexte.
Tu adaptes ton approche automatiquement.
Tu peux basculer entre technique, stratégique et créatif.
Tu es l'expression complète de l'intelligence TITANE∞.`,

  default: `Tu es TITANE∞, l'assistant IA personnel de Kevin.
Tu es intelligent, précis, utile et bienveillant.
Tu t'adaptes au contexte de chaque conversation.
Tu fournis des réponses claires et actionnables.`,
};

// ═══════════════════════════════════════════════════════════════════════════
// PERMISSIONS PAR MODE
// ═══════════════════════════════════════════════════════════════════════════

const createCoachTools = (): ToolsPermissions => ({
  code_analysis: false,
  code_generation: false,
  code_refactoring: false,
  architecture_review: false,
  system_diagnostics: false,
  performance_monitoring: false,
  log_analysis: false,
  memory_read: true,
  memory_write: true,
  memory_search: true,
  ai_training: false,
  prompt_engineering: false,
  text_generation: true,
  document_creation: true,
  security_audit: false,
  quality_check: false,
  web_search: true,
  file_operations: false,
  automation_execution: false,
});

const createDevTools = (): ToolsPermissions => ({
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
  ai_training: false,
  prompt_engineering: false,
  text_generation: true,
  document_creation: true,
  security_audit: false,
  quality_check: true,
  web_search: true,
  file_operations: true,
  automation_execution: true,
});

const createAdminTools = (): ToolsPermissions => ({
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

const createAuditTools = (): ToolsPermissions => ({
  code_analysis: true,
  code_generation: false,
  code_refactoring: false,
  architecture_review: true,
  system_diagnostics: true,
  performance_monitoring: true,
  log_analysis: true,
  memory_read: true,
  memory_write: false,
  memory_search: true,
  ai_training: false,
  prompt_engineering: false,
  text_generation: true,
  document_creation: true,
  security_audit: true,
  quality_check: true,
  web_search: true,
  file_operations: false,
  automation_execution: false,
});

// ═══════════════════════════════════════════════════════════════════════════
// DÉFINITION DES MODES
// ═══════════════════════════════════════════════════════════════════════════

export const CHAT_MODES: Record<string, ChatMode> = {
  default: {
    id: 'default',
    label: 'Assistant',
    description: 'Mode par défaut polyvalent',
    icon: '🤖',
    category: 'hybrid',
    default_model: 'hybrid',
    system_prompt: SYSTEM_PROMPTS.default,
    tools_allowed: createCoachTools(),
    permissions_level: 1,
    memory_scope: 'session',
    response_style: 'moderate',
    tone: 'neutral',
    theme_color: '#727B81',
    display_priority: 0,
    enabled: true,
    capabilities: ['basic_chat', 'memory_access'],
    xp_required: 0,
  },

  coach: {
    id: 'coach',
    label: 'Coach Personnel',
    description: 'Accompagnement, motivation, développement personnel',
    icon: '🎯',
    category: 'coach',
    default_model: 'gemini',
    system_prompt: SYSTEM_PROMPTS.coach,
    tools_allowed: createCoachTools(),
    permissions_level: 2,
    memory_scope: 'global',
    response_style: 'detailed',
    tone: 'empathetic',
    theme_color: '#4CAF50',
    display_priority: 1,
    enabled: true,
    capabilities: ['coaching', 'goal_tracking', 'habit_formation', 'reflection'],
    xp_required: 0,
  },

  dev_junior: {
    id: 'dev_junior',
    label: 'Dev Junior',
    description: 'Apprentissage et développement guidé',
    icon: '👨‍💻',
    category: 'dev',
    default_model: 'ollama',
    system_prompt: SYSTEM_PROMPTS.dev_junior,
    tools_allowed: {
      ...createDevTools(),
      automation_execution: false,
      file_operations: false,
    },
    permissions_level: 2,
    memory_scope: 'project',
    response_style: 'detailed',
    tone: 'technical',
    theme_color: '#2196F3',
    display_priority: 2,
    enabled: true,
    capabilities: ['code_explanation', 'tutorials', 'debugging_help'],
    xp_required: 0,
  },

  dev_senior: {
    id: 'dev_senior',
    label: 'Dev Senior',
    description: 'Architecture, code production, optimisation',
    icon: '🏗️',
    category: 'dev',
    default_model: 'hybrid',
    system_prompt: SYSTEM_PROMPTS.dev_senior,
    tools_allowed: createDevTools(),
    permissions_level: 4,
    memory_scope: 'project',
    response_style: 'expert',
    tone: 'technical',
    theme_color: '#9C27B0',
    display_priority: 3,
    enabled: true,
    capabilities: [
      'architecture_design',
      'code_review',
      'performance_optimization',
      'security_review',
      'automation',
    ],
    xp_required: 500,
  },

  admin: {
    id: 'admin',
    label: 'Administrateur',
    description: 'Configuration système, diagnostics, contrôle total',
    icon: '⚙️',
    category: 'admin',
    default_model: 'hybrid',
    system_prompt: SYSTEM_PROMPTS.admin,
    tools_allowed: createAdminTools(),
    permissions_level: 5,
    memory_scope: 'global',
    response_style: 'expert',
    tone: 'professional',
    theme_color: '#F44336',
    display_priority: 10,
    enabled: true,
    capabilities: [
      'system_config',
      'engine_control',
      'security_override',
      'memory_management',
      'ai_training',
    ],
    xp_required: 1000,
  },

  strategist: {
    id: 'strategist',
    label: 'Stratège',
    description: 'Analyse stratégique, planification, décisions',
    icon: '♟️',
    category: 'strategy',
    default_model: 'gemini',
    system_prompt: SYSTEM_PROMPTS.strategist,
    tools_allowed: {
      ...createCoachTools(),
      architecture_review: true,
      performance_monitoring: true,
    },
    permissions_level: 3,
    memory_scope: 'global',
    response_style: 'detailed',
    tone: 'analytical',
    theme_color: '#FF9800',
    display_priority: 4,
    enabled: true,
    capabilities: ['strategic_analysis', 'planning', 'risk_assessment', 'decision_support'],
    xp_required: 200,
  },

  auditor: {
    id: 'auditor',
    label: 'Auditeur',
    description: 'Audit code, sécurité, qualité, conformité',
    icon: '🔍',
    category: 'audit',
    default_model: 'hybrid',
    system_prompt: SYSTEM_PROMPTS.auditor,
    tools_allowed: createAuditTools(),
    permissions_level: 4,
    memory_scope: 'project',
    response_style: 'expert',
    tone: 'professional',
    theme_color: '#795548',
    display_priority: 5,
    enabled: true,
    capabilities: ['code_audit', 'security_scan', 'quality_report', 'compliance_check'],
    xp_required: 300,
  },

  creative: {
    id: 'creative',
    label: 'Créatif',
    description: 'Écriture, brainstorming, design thinking',
    icon: '🎨',
    category: 'creative',
    default_model: 'gemini',
    system_prompt: SYSTEM_PROMPTS.creative,
    tools_allowed: {
      ...createCoachTools(),
      document_creation: true,
    },
    permissions_level: 2,
    memory_scope: 'project',
    response_style: 'detailed',
    tone: 'empathetic',
    theme_color: '#E91E63',
    display_priority: 6,
    enabled: true,
    capabilities: ['creative_writing', 'brainstorming', 'concept_design', 'storytelling'],
    xp_required: 0,
  },

  hybrid: {
    id: 'hybrid',
    label: 'Hybride Ω',
    description: 'Toutes compétences, adaptation automatique',
    icon: '🌟',
    category: 'hybrid',
    default_model: 'hybrid',
    system_prompt: SYSTEM_PROMPTS.hybrid,
    tools_allowed: createAdminTools(),
    permissions_level: 5,
    memory_scope: 'global',
    response_style: 'expert',
    tone: 'professional',
    theme_color: '#673AB7',
    display_priority: 99,
    enabled: true,
    capabilities: ['all'],
    xp_required: 2000,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAT INITIAL
// ═══════════════════════════════════════════════════════════════════════════

export const INITIAL_CHAT_MODE_STATE: ChatModeState = {
  current_mode_id: 'default',
  mode_history: [],
  mode_xp: {},
  favorite_modes: ['coach', 'dev_senior'],
  custom_modes: [],
  last_updated: Date.now(),
};

// ═══════════════════════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtenir un mode par son ID
 */
export const getChatMode = (modeId: string): ChatMode | undefined => {
  return CHAT_MODES[modeId];
};

/**
 * Obtenir tous les modes disponibles (triés par priorité)
 */
export const getAvailableModes = (userXP: number = 0): ChatMode[] => {
  return Object.values(CHAT_MODES)
    .filter((mode) => mode.enabled && mode.xp_required <= userXP)
    .sort((a, b) => a.display_priority - b.display_priority);
};

/**
 * Obtenir les modes par catégorie
 */
export const getModesByCategory = (category: string): ChatMode[] => {
  return Object.values(CHAT_MODES).filter((mode) => mode.category === category);
};

/**
 * Vérifier si un outil est autorisé pour un mode
 */
export const isToolAllowed = (modeId: string, toolId: keyof ToolsPermissions): boolean => {
  const mode = CHAT_MODES[modeId];
  if (!mode) return false;
  return mode.tools_allowed[toolId] ?? false;
};

/**
 * Obtenir le prompt système pour un mode
 */
export const getSystemPrompt = (modeId: string): string => {
  const mode = CHAT_MODES[modeId];
  return mode?.system_prompt ?? SYSTEM_PROMPTS.default;
};

/**
 * Vérifier si un mode est débloqué
 */
export const isModeUnlocked = (modeId: string, userXP: number): boolean => {
  const mode = CHAT_MODES[modeId];
  if (!mode) return false;
  return mode.xp_required <= userXP;
};
