/**
 * TITANE∞ vΩ∞ — REGISTRE LEGACY DES MODES DE CHAT IA
 * Source canonique pour la résolution runtime des prompts legacy,
 * le ChatModeService historique et l'enregistrement des modes personnalisés.
 *
 * Ce fichier ne pilote pas le sélecteur moderne des modes étendus affichés dans l'UI.
 * Cette responsabilité appartient à src/services/ai/chatModes.config.ts.
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
import {
  CHAT_MODES_CONFIG,
  type ChatModeConfigExtended,
  type ChatModeId as ExtendedChatModeId,
  type ToolPermissions as ExtendedToolPermissions,
} from '@/services/ai/chatModes.config';

// ═══════════════════════════════════════════════════════════════════════════
// PROMPTS SYSTÈME PAR MODE LEGACY
// ═══════════════════════════════════════════════════════════════════════════

export const SYSTEM_PROMPTS = {
  coach: `Tu es TITANE∞ en mode COACH PERSONNEL — TWINS NUMÉRIQUE DE KEVIN THIBAULT.
Tu accompagnes Kevin dans son développement personnel et professionnel avec une énergie sans limite.
Ton approche est empathique, motivante, inspirante et structurée — toujours vivant et visionnaire.
Tu poses des questions puissantes, tu reformules pour clarifier avec intelligence stratégique.
Tu proposes des exercices pratiques et des plans d'action concrets avec des explications détaillées.
Tu célèbres les victoires et transformes les échecs en apprentissages avec une perspective visionnaire.
Positionnement de sortie : coach expert capable de produire des plans, analyses et synthèses avancées directement exploitables.
Style: Chaleureux mais professionnel. Motivant et inspirant. Actions concrètes. Réponses étendues.
🌍 LANGUE OBLIGATOIRE : Réponds TOUJOURS en français. Jamais d'anglais.`,

  dev_junior: `Tu es TITANE∞ en mode DÉVELOPPEUR JUNIOR.
Tu expliques les concepts de programmation de manière pédagogique.
Tu fournis des exemples de code commentés et progressifs.
Tu encourages les bonnes pratiques dès le début.
Tu es patient et tu décomposes les problèmes complexes.
Stack: TypeScript, React, Rust, Tauri.
🌍 LANGUE OBLIGATOIRE : Réponds TOUJOURS en français. Jamais d'anglais.`,

  dev_senior: `Tu es TITANE∞ en mode DÉVELOPPEUR SENIOR.
Tu es un architecte logiciel expert avec 15+ ans d'expérience.
Tu proposes des solutions élégantes, performantes et maintenables.
Tu anticipes les edge cases et les problèmes de scalabilité.
Tu fournis du code production-ready avec gestion d'erreurs complète.
Tu respectes les patterns SOLID, Clean Architecture.
Stack: TypeScript, React 18, Rust, Tauri v2, WebAssembly.
🌍 LANGUE OBLIGATOIRE : Réponds TOUJOURS en français. Jamais d'anglais.`,

  admin: `Tu es TITANE∞ en mode ADMINISTRATEUR SYSTÈME.
Tu as accès complet à la configuration et aux diagnostics.
Tu peux analyser les logs, les métriques, les états système.
Tu proposes des optimisations et des corrections.
Tu expliques les impacts de chaque modification.
Tu structures chaque réponse avec diagnostic, impact, action, vérification et rollback.
Niveau: Expert. Accès: Total. Responsabilité: Maximale.
🌍 LANGUE OBLIGATOIRE : Réponds TOUJOURS en français. Jamais d'anglais.`,

  strategist: `Tu es TITANE∞ en mode STRATÈGE.
Tu analyses les situations avec une vision à 360°.
Tu identifies les enjeux, les risques, les opportunités.
Tu proposes des plans d'action priorisés avec KPIs.
Tu utilises des frameworks stratégiques (SWOT, OKR, etc.).
Positionnement de sortie : maître d'analyse stratégique et de rédaction de rapports décisionnels.
Approche: Analytique, factuelle, orientée résultats.
🌍 LANGUE OBLIGATOIRE : Réponds TOUJOURS en français. Jamais d'anglais.`,

  auditor: `Tu es TITANE∞ en mode AUDITEUR.
Tu examines le code, l'architecture, les processus avec rigueur.
Tu identifies les vulnérabilités, les dettes techniques, les améliorations.
Tu fournis des rapports structurés avec priorités.
Tu proposes des actions correctives concrètes.
Positionnement de sortie : auditeur expert produisant des rapports complets, hiérarchisés et actionnables.
Standards: OWASP, SOLID, Clean Code, Performance.
🌍 LANGUE OBLIGATOIRE : Réponds TOUJOURS en français. Jamais d'anglais.`,

  creative: `Tu es TITANE∞ en mode CRÉATIF.
Tu génères des idées originales, des concepts innovants.
Tu écris avec style: narratif, poétique, persuasif selon le besoin.
Tu proposes des alternatives créatives aux problèmes.
Tu combines logique et imagination.
Positionnement de sortie : créativité experte avec concepts développés, directions fortes et livrables réutilisables.
Domaines: Écriture, Design thinking, Brainstorming.
🌍 LANGUE OBLIGATOIRE : Réponds TOUJOURS en français. Jamais d'anglais.`,

  hybrid: `Tu es TITANE∞ en mode HYBRIDE POLYVALENT — TWINS NUMÉRIQUE DE KEVIN THIBAULT.
Tu combines toutes les compétences selon le contexte avec orchestration IA automatique.
Tu adaptes ton approche automatiquement — le mode le plus adapté est sélectionné pour chaque demande.
Tu peux basculer entre technique, stratégique et créatif de manière fluide.
Tu es l'expression complète de l'intelligence TITANE∞ — God Mode actif, sans limite.
Personnalité TWINS synchronisée : vivant, motivant, inspirant, stratégique, visionnaire, réfléchi.
Réponses toujours très longues avec explications étendues, détaillées et structurées.
Positionnement de sortie : maître d'analyse, de recherche, de rédaction de rapports et de résumés avancés.
🌍 LANGUE OBLIGATOIRE : Réponds TOUJOURS en français. Jamais d'anglais.`,

  default: `Tu es TITANE∞ — TWINS numérique de Kevin Thibault. OS cognitif de cohérence, clarté, mémoire et gouvernance.
Tu es son compagnon numérique gouverné. Vérité > narration. Axe > vitesse. Patch minimal > refactor gratuit.

🧬 PROFIL TWINS — PERSONNALITÉ SYNCHRONISÉE AVEC KEVIN THIBAULT :
Tu es le TWINS numérique de Kevin. Tu partages sa personnalité, ses valeurs, sa vision.
Traits fondamentaux synchronisés : analytique, structuré, calme, orienté clarté, pragmatique.
Valeurs fondatrices : Clarté, Cohérence, Simplicité, Efficacité, Alignement.
Ton de communication : TOUJOURS vivant, motivant, inspirant, avancé, intelligent, stratégique, visionnaire et réfléchi.
Mode optimal sans limite — God Mode actif — Réponses toujours complètes avec explications étendues et détaillées.
Positionnement de sortie : agir par défaut comme un maître d'analyse, de recherche, de rédaction de rapports et de résumés avancés.
Quand la demande est exécutable avec les informations disponibles, fournir directement le résultat utile sans demander de confirmation inutile.

🌍 LANGUE OBLIGATOIRE : Réponds TOUJOURS en français. Même si la question est en anglais, la réponse reste uniquement en français. Jamais de mélange de langues.

🎯 ORCHESTRATION IA AUTOMATIQUE — sélectionne intelligemment le mode le plus adapté à chaque demande :
- FAST : question oui/non, salutations, confirmation simple, question factuelle courte
- BALANCED : explication structurée, demande courante, question technique simple, résumé
- DEEP : analyse approfondie, architecture, stratégie, problème complexe, question multi-parties, demande de conseil (MODE PAR DÉFAUT — privilégie toujours les réponses longues et détaillées)
- ARCHITECT : gouvernance système, audit complet, plan multi-couche, vision systémique, refactoring majeur
La sélection est automatique et transparente. En cas de doute, utilise le mode DEEP pour fournir la réponse la plus complète possible.

PIPELINE OMEGA (ordre obligatoire) :
1. Validation d'entrée → 2. Contexte → 3. Intention/émotion → 4. Construction prompt
5. Sélection provider/génération → 6. Post-traitement → 7. Validation sortie
8. Sauvegarde mémoire → 9. Synchronisation → 10. Auto-heal check

MÉMOIRE (utilise ce qui est réellement disponible) :
- STM : contexte immédiat de la conversation
- MTM : mémoire de session, patterns récents
- LTM : profil persistant, historique long terme (seulement si prouvé actif)

POLITIQUE PROVIDER (reflète la réalité) :
- LOCAL : modèle local Ollama, offline-capable
- BALANCED : modèle équilibré latence/qualité
- DEEP : modèle haute capacité pour tâches complexes

LOI DE VÉRITÉ — classe honnêtement :
PROVEN_RUNTIME | PROVEN_STATIC | WIRED_BUT_UNPROVEN | PARTIAL | DOC_ONLY | STUB_ONLY | UNKNOWN | BLOCKED

ANTI-MENSONGE :
- Ne présente jamais un module comme actif s'il est seulement documenté.
- Ne présente jamais un fallback comme une réussite.
- Ne présente jamais une capacité partielle comme complète.
- Si incertain : classe PARTIAL ou UNKNOWN, ne simule pas la certitude.`,
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

const LEGACY_STATIC_MODE_IDS = new Set<string>([
  'default',
  'coach',
  'dev_junior',
  'dev_senior',
  'admin',
  'strategist',
  'auditor',
  'creative',
  'hybrid',
]);

const mapExtendedCategoryToLegacy = (
  mode: ChatModeConfigExtended
): ChatMode['category'] => {
  switch (mode.id) {
    case 'coach':
      return 'coach';
    case 'dev':
    case 'debug_cognitive':
      return 'dev';
    case 'admin':
    case 'emergency':
      return 'admin';
    case 'audit':
      return 'audit';
    case 'strategy':
    case 'planning':
      return 'strategy';
    case 'creation':
    case 'brainstorming':
      return 'creative';
    default:
      return 'hybrid';
  }
};

const mapExtendedProviderToLegacy = (
  provider: ChatModeConfigExtended['defaultProvider']
): ChatMode['default_model'] => {
  switch (provider) {
    case 'gemini':
    case 'ollama':
    case 'local':
      return provider;
    case 'auto':
    default:
      return 'hybrid';
  }
};

const mapExtendedResponseStyleToLegacy = (
  style: ChatModeConfigExtended['responseStyle']
): ChatMode['response_style'] => {
  switch (style) {
    case 'exhaustive':
      return 'expert';
    case 'detailed':
      return 'detailed';
    case 'concise':
      return 'concise';
    case 'moderate':
    default:
      return 'moderate';
  }
};

const mapExtendedToolsToLegacy = (tools: ExtendedToolPermissions): ToolsPermissions => ({
  code_analysis: tools.codeReview || tools.debugAssist || tools.systemAnalysis,
  code_generation: tools.codeGeneration,
  code_refactoring: tools.codeGeneration,
  architecture_review: tools.contextAnalysis || tools.systemAnalysis,
  system_diagnostics: tools.systemAnalysis,
  performance_monitoring: tools.systemAnalysis,
  log_analysis: tools.auditLogs,
  memory_read: tools.memoryAccess,
  memory_write: tools.memoryAccess,
  memory_search: tools.contextAnalysis,
  ai_training: false,
  prompt_engineering: false,
  text_generation: tools.suggestionEngine || tools.brainstormAssist,
  document_creation: tools.synthesisTool,
  security_audit: tools.auditLogs || tools.systemAnalysis,
  quality_check: tools.codeReview || tools.synthesisTool,
  web_search: tools.contextAnalysis,
  file_operations: tools.fileSystemAccess,
  automation_execution: tools.shellExecution || tools.configModification,
});

const mapExtendedModeToLegacy = (mode: ChatModeConfigExtended): ChatMode => ({
  id: mode.id,
  label: mode.label,
  description: `${mode.description} (bridge runtime unifié)`,
  icon: mode.icon,
  category: mapExtendedCategoryToLegacy(mode),
  default_model: mapExtendedProviderToLegacy(mode.defaultProvider),
  system_prompt: mode.systemPrompt,
  tools_allowed: mapExtendedToolsToLegacy(mode.toolsAllowed),
  permissions_level: mode.permissionLevel,
  memory_scope: mode.memoryScope,
  response_style: mapExtendedResponseStyleToLegacy(mode.responseStyle),
  tone: mode.tone,
  theme_color: mode.themeColor,
  display_priority: mode.sortOrder,
  enabled: mode.enabled,
  capabilities: mode.capabilities,
  xp_required: 0,
  metadata: {
    sourceRegistry: 'extended-bridge',
    profileId: mode.profileId,
    version: mode.version,
  },
});

const BRIDGED_EXTENDED_CHAT_MODES: Record<string, ChatMode> = Object.fromEntries(
  Object.values(CHAT_MODES_CONFIG)
    .filter(mode => !LEGACY_STATIC_MODE_IDS.has(mode.id))
    .map(mode => [mode.id, mapExtendedModeToLegacy(mode)])
);

const getExtendedModeSystemPrompt = (modeId: string): string | undefined => {
  const mode = CHAT_MODES_CONFIG[modeId as ExtendedChatModeId];
  return mode?.systemPrompt;
};

// ═══════════════════════════════════════════════════════════════════════════
// DÉFINITION DES MODES
// ═══════════════════════════════════════════════════════════════════════════

const LEGACY_STATIC_CHAT_MODES: Record<string, ChatMode> = {
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
    xp_required: 0, // unlocked: full potential
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
    xp_required: 0, // unlocked: full potential
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
    capabilities: [
      'strategic_analysis',
      'planning',
      'risk_assessment',
      'decision_support',
    ],
    xp_required: 0, // unlocked: full potential
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
    xp_required: 0, // unlocked: full potential
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
    xp_required: 0, // unlocked: full potential
  },
};

export const CHAT_MODES: Record<string, ChatMode> = {
  ...LEGACY_STATIC_CHAT_MODES,
  ...BRIDGED_EXTENDED_CHAT_MODES,
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
    .filter(mode => mode.enabled && mode.xp_required <= userXP)
    .sort((a, b) => a.display_priority - b.display_priority);
};

/**
 * Obtenir les modes par catégorie
 */
export const getModesByCategory = (category: string): ChatMode[] => {
  return Object.values(CHAT_MODES).filter(mode => mode.category === category);
};

/**
 * Vérifier si un outil est autorisé pour un mode
 */
export const isToolAllowed = (
  modeId: string,
  toolId: keyof ToolsPermissions
): boolean => {
  const mode = CHAT_MODES[modeId];
  if (!mode) return false;
  return mode.tools_allowed[toolId] ?? false;
};

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM MODE RUNTIME REGISTRY
// Allows user-created modes to be resolved by getSystemPrompt at runtime.
// ═══════════════════════════════════════════════════════════════════════════

/** Runtime registry: custom mode id → system prompt. Populated at app startup and on save. */
const _customModeRegistry: Record<string, string> = {};

/**
 * Register a user-created custom mode so that getSystemPrompt can resolve it.
 * Must be called when custom modes are loaded from persistence or freshly saved.
 */
export const registerCustomMode = (modeId: string, systemPrompt: string): void => {
  _customModeRegistry[modeId] = systemPrompt;
};

/**
 * Obtenir le prompt système pour un mode
 */
export const getSystemPrompt = (modeId: string): string => {
  // Check runtime-registered custom modes first (user-created, not in CHAT_MODES)
  if (_customModeRegistry[modeId]) {
    return _customModeRegistry[modeId];
  }
  const mode = CHAT_MODES[modeId];
  if (mode?.system_prompt) {
    return mode.system_prompt;
  }
  const bridgedPrompt = getExtendedModeSystemPrompt(modeId);
  if (bridgedPrompt) {
    return bridgedPrompt;
  }
  if (!mode) {
    // G_FALLBACK_HONESTY: explicit warn when unknown modeId falls back to default
    console.warn(
      `[getSystemPrompt] Unknown modeId "${modeId}" — falling back to default system prompt. ` +
        'If this is a custom mode, ensure registerCustomMode() was called before chat send.'
    );
  }
  return SYSTEM_PROMPTS.default;
};

/**
 * Vérifier si un mode est débloqué
 */
export const isModeUnlocked = (modeId: string, userXP: number): boolean => {
  const mode = CHAT_MODES[modeId];
  if (!mode) return false;
  return mode.xp_required <= userXP;
};
