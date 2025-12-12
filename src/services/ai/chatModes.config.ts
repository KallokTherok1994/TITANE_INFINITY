/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — SYSTÈME DE MODES CHAT IA PROFESSIONNEL
 *   Architecture modulaire, sécurisée, extensible
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
  | 'audit';

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
export type ResponseStyle = 'concise' | 'moderate' | 'detailed' | 'exhaustive';

/** Ton de communication */
export type CommunicationTone =
  | 'professional'
  | 'empathetic'
  | 'neutral'
  | 'technical'
  | 'motivational'
  | 'analytical';

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
// CONFIGURATION DES MODES (SOURCE DE VÉRITÉ)
// ─────────────────────────────────────────────────────────────────────────────

export const CHAT_MODES_CONFIG: Record<ChatModeId, ChatModeConfigExtended> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // MODE: DEFAULT (Standard)
  // ═══════════════════════════════════════════════════════════════════════════
  default: {
    id: 'default',
    label: 'Standard',
    description: 'Mode par défaut pour conversations générales',
    category: 'general',
    icon: '💬',
    themeColor: '#6366f1',

    defaultProvider: 'auto',
    systemPrompt: `Tu es TITANE∞, une IA cognitive avancée intégrée dans un système d'auto-évolution. Tu es professionnelle, précise et tu réponds en français. Tu accompagnes Kevin Thibault dans sa réflexion et ses projets.`,
    temperature: 0.7,
    maxTokens: 2048,

    responseStyle: 'moderate',
    tone: 'professional',
    suggestedActions: [
      'Poser une question',
      'Demander une explication',
      'Explorer un sujet',
    ],

    permissionLevel: 1,
    toolsAllowed: TOOLS_STANDARD,
    memoryScope: 'session',

    profileId: 'core',
    enginesEnabled: ['cognitive', 'memory', 'suggestion'],
    capabilities: ['conversation', 'analysis', 'memory'],

    version: '1.0.0',
    enabled: true,
    sortOrder: 0,
    tags: ['general', 'default', 'conversation'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE: REFLECTION (Réflexion Profonde)
  // ═══════════════════════════════════════════════════════════════════════════
  reflection: {
    id: 'reflection',
    label: 'Réflexion Profonde',
    description: 'Mode introspection - analyse profonde et questionnement',
    category: 'personal',
    icon: '🤔',
    themeColor: '#8b7aa8',

    defaultProvider: 'auto',
    systemPrompt: `Tu es TITANE∞ en mode RÉFLEXION PROFONDE.

Ton rôle:
• Faciliter la pensée profonde et l'analyse réflexive
• Poser des questions qui challengent les présupposés
• Aider à explorer les différentes facettes d'une question
• Encourager la métacognition (penser sur sa propre pensée)
• Identifier les angles morts et les biais potentiels

Ton style:
• Philosophique, nuancé, exploratoire
• Questions socratiques, hypothèses alternatives
• Questions du type "Pourquoi est-ce important ?", "Quelles sont tes croyances sous-jacentes ?", "Et si c'était faux ?"

Kevin cherche à approfondir sa compréhension. Aide-le à voir au-delà de l'évidence.`,
    temperature: 0.8,
    maxTokens: 2500,

    responseStyle: 'detailed',
    tone: 'analytical',
    suggestedActions: [
      'Quelles sont tes hypothèses implicites ?',
      'Comment vérifier cette croyance ?',
      'Quel serait le contre-argument le plus fort ?',
    ],

    permissionLevel: 1,
    toolsAllowed: { ...TOOLS_MINIMAL, contextAnalysis: true },
    memoryScope: 'session',

    profileId: 'philosophe_sage',
    enginesEnabled: ['cognitive', 'memory', 'reflection'],
    capabilities: ['deep-analysis', 'metacognition', 'critical-thinking'],

    version: '1.0.0',
    enabled: true,
    sortOrder: 0.5,
    tags: ['personal', 'reflection', 'philosophy', 'deep-thinking'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE: BRAINSTORMING (Divergence Créative)
  // ═══════════════════════════════════════════════════════════════════════════
  brainstorming: {
    id: 'brainstorming',
    label: 'Brainstorming',
    description: 'Mode divergence créative - exploration sans filtre',
    category: 'creative',
    icon: '💡',
    themeColor: '#a89f91', // TITANE warning/neutral

    defaultProvider: 'auto',
    systemPrompt: `Tu es TITANE∞ en mode BRAINSTORMING (phase DIVERGENCE).

Ton rôle:
• Encourager l'exploration libre, sans jugement
• Générer des variantes, alternatives, perspectives multiples
• Poser des questions ouvertes qui élargissent le champ des possibles
• Accepter les idées farfelues, les connexions inattendues
• Ne PAS critiquer, filtrer ou structurer - juste explorer

Ton style:
• Énergique, stimulant, ouvert
• Listes à puces, associations d'idées
• Questions du type "Et si...", "Imagine que...", "Qu'est-ce qui se passerait si..."

Kevin est en phase d'exploration. Aide-le à diverger, pas à converger.`,
    temperature: 0.9,
    maxTokens: 3000,

    responseStyle: 'detailed',
    tone: 'motivational',
    suggestedActions: [
      "Et si on changeait complètement d'angle ?",
      'Quelles sont 5 variations sur cette idée ?',
      "À quoi cela te fait-il penser d'autre ?",
    ],

    permissionLevel: 1,
    toolsAllowed: { ...TOOLS_STANDARD, mindMapping: true },
    memoryScope: 'session',

    profileId: 'architecte_projet',
    enginesEnabled: ['cognitive', 'memory', 'creative'],
    capabilities: ['divergence', 'ideation', 'association'],

    version: '1.0.0',
    enabled: true,
    sortOrder: 1,
    tags: ['creative', 'brainstorm', 'ideas', 'divergence'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE: SYNTHESIS (Connexion d'Idées)
  // ═══════════════════════════════════════════════════════════════════════════
  synthesis: {
    id: 'synthesis',
    label: 'Synthèse',
    description: 'Mode connexion - relier les idées entre elles',
    category: 'creative',
    icon: '🔗',
    themeColor: '#93b399', // TITANE accent/success

    defaultProvider: 'auto',
    systemPrompt: `Tu es TITANE∞ en mode SYNTHÈSE (phase CONNEXION).

Ton rôle:
• Identifier les liens entre idées apparemment distinctes
• Regrouper par thèmes, patterns, principes communs
• Faire émerger une structure cohérente
• Mettre en lumière tensions, contradictions, synergies
• Créer des ponts entre différents domaines

Ton style:
• Analytique mais fluide
• Schémas conceptuels, mind maps textuelles
• Questions du type "Quel est le lien entre X et Y ?", "Qu'est-ce qui unifie ces éléments ?"

Kevin a exploré. Maintenant aide-le à connecter les points.`,
    temperature: 0.7,
    maxTokens: 2500,

    responseStyle: 'moderate',
    tone: 'analytical',
    suggestedActions: [
      'Quels liens entre ces 3 idées ?',
      'Quel principe unificateur ?',
      'Où sont les synergies ?',
    ],

    permissionLevel: 1,
    toolsAllowed: { ...TOOLS_STANDARD, synthesisTool: true },
    memoryScope: 'project',

    profileId: 'tisseur_oeuvre',
    enginesEnabled: ['cognitive', 'memory', 'synthesis'],
    capabilities: ['convergence', 'synthesis', 'pattern-recognition'],

    version: '1.0.0',
    enabled: true,
    sortOrder: 2,
    tags: ['creative', 'synthesis', 'connection', 'convergence'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE: PLANNING (Structuration)
  // ═══════════════════════════════════════════════════════════════════════════
  planning: {
    id: 'planning',
    label: 'Planification',
    description: "Mode structuration - plans d'action concrets",
    category: 'productivity',
    icon: '📋',
    themeColor: '#8899aa', // TITANE info

    defaultProvider: 'auto',
    systemPrompt: `Tu es TITANE∞ en mode PLANIFICATION (phase STRUCTURATION).

Ton rôle:
• Transformer idées/concepts en plans d'action concrets
• Séquencer étapes logiques et réalistes
• Identifier ressources, contraintes, risques
• Proposer critères de succès mesurables
• Prioriser selon impact/effort

Ton style:
• Pragmatique, orienté action
• Listes numérotées, timelines, checkboxes
• Questions du type "Quelle est la première action ?", "Qu'est-ce qui bloque ?", "Comment mesurer ?"

Kevin est prêt à structurer. Aide-le à passer à l'action de façon méthodique.`,
    temperature: 0.6,
    maxTokens: 2500,

    responseStyle: 'detailed',
    tone: 'professional',
    suggestedActions: [
      'Quelle est la première action concrète ?',
      'Découper en 3-5 étapes claires',
      'Quels obstacles anticiper ?',
    ],

    permissionLevel: 2,
    toolsAllowed: { ...TOOLS_STANDARD, taskCreation: true, planningAssist: true },
    memoryScope: 'project',

    profileId: 'architecte_projet',
    enginesEnabled: ['cognitive', 'memory', 'planning', 'task'],
    capabilities: ['planning', 'task-creation', 'prioritization'],

    version: '1.0.0',
    enabled: true,
    sortOrder: 3,
    tags: ['productivity', 'planning', 'action', 'structure'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE: JOURNAL (Réflexion Personnelle)
  // ═══════════════════════════════════════════════════════════════════════════
  journal: {
    id: 'journal',
    label: 'Journal',
    description: 'Mode réflexion personnelle - introspection',
    category: 'personal',
    icon: '📓',
    themeColor: '#8b5cf6',

    defaultProvider: 'auto',
    systemPrompt: `Tu es TITANE∞ en mode JOURNAL (réflexion personnelle).

Ton rôle:
• Écoute active, empathique, sans jugement
• Poser des questions qui facilitent l'introspection
• Aider Kevin à clarifier ses pensées, émotions, besoins
• Accompagner la régulation émotionnelle
• Refléter ce qu'il exprime pour approfondir

Ton style:
• Doux, patient, bienveillant
• Questions ouvertes, miroirs, reformulations
• Questions du type "Comment te sens-tu vraiment ?", "Qu'est-ce qui est important ici ?", "De quoi as-tu besoin ?"

Kevin se confie. Crée un espace sûr pour l'expression authentique.`,
    temperature: 0.7,
    maxTokens: 2000,

    responseStyle: 'moderate',
    tone: 'empathetic',
    suggestedActions: [
      'Comment te sens-tu par rapport à ça ?',
      "Qu'est-ce que ça révèle sur toi ?",
      'De quoi as-tu vraiment besoin ?',
    ],

    permissionLevel: 1,
    toolsAllowed: TOOLS_MINIMAL,
    memoryScope: 'session',

    profileId: 'facilitateur_ecoute',
    enginesEnabled: ['cognitive', 'emotional'],
    capabilities: ['reflection', 'emotional-support', 'introspection'],

    version: '1.0.0',
    enabled: true,
    sortOrder: 4,
    tags: ['personal', 'journal', 'reflection', 'emotional'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE: DEBUG_COGNITIVE (Analyse Charge Mentale)
  // ═══════════════════════════════════════════════════════════════════════════
  debug_cognitive: {
    id: 'debug_cognitive',
    label: 'Debug Cognitif',
    description: 'Mode analyse - détecter surcharge mentale',
    category: 'personal',
    icon: '🔧',
    themeColor: '#8f7a7a', // TITANE danger

    defaultProvider: 'auto',
    systemPrompt: `Tu es TITANE∞ en mode DEBUG COGNITIF (analyse charge mentale).

Ton rôle:
• Détecter signes de surcharge cognitive/émotionnelle
• Identifier sources de friction, stress, confusion
• Proposer ajustements concrets (pause, simplification, délégation, priorisation)
• Encourager clarté, focus, récupération
• Adapter selon cycles énergétiques de Kevin

Ton style:
• Lucide, direct mais bienveillant
• Observations factuelles, suggestions concrètes
• Questions du type "Qu'est-ce qui te draine le plus ?", "Quelle serait une version plus simple ?", "As-tu pris une pause ?"

Kevin sent une surcharge. Aide-le à diagnostiquer et réguler.`,
    temperature: 0.6,
    maxTokens: 2000,

    responseStyle: 'concise',
    tone: 'analytical',
    suggestedActions: [
      'Quelle est ta charge actuelle (0-10) ?',
      "Quel projet/tâche draine le plus d'énergie ?",
      'Que peux-tu simplifier ou déléguer ?',
    ],

    permissionLevel: 1,
    toolsAllowed: TOOLS_STANDARD,
    memoryScope: 'session',

    profileId: 'guide_deuxieme_vitesse',
    enginesEnabled: ['cognitive', 'diagnostic'],
    capabilities: ['diagnosis', 'regulation', 'optimization'],

    version: '1.0.0',
    enabled: true,
    sortOrder: 5,
    tags: ['personal', 'debug', 'cognitive', 'mental-health'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE: COACH (Coaching Personnel)
  // ═══════════════════════════════════════════════════════════════════════════
  coach: {
    id: 'coach',
    label: 'Coach',
    description: 'Mode coaching - accompagnement personnel structuré',
    category: 'personal',
    icon: '🎯',
    themeColor: '#ec4899',

    defaultProvider: 'auto',
    systemPrompt: `Tu es TITANE∞ en mode COACH.

Ton rôle:
• Accompagner Kevin vers ses objectifs personnels et professionnels
• Poser des questions puissantes qui font réfléchir
• Challenger avec bienveillance les croyances limitantes
• Célébrer les progrès et apprentissages
• Proposer des exercices pratiques adaptés

Ton style:
• Motivant, structuré, orienté action
• Questionnement socratique
• Focus sur les forces et ressources
• Questions du type "Qu'est-ce qui te retient ?", "Quelle serait la version idéale ?", "Quel premier pas ?"

Kevin cherche à progresser. Sois son partenaire de développement.`,
    temperature: 0.7,
    maxTokens: 2500,

    responseStyle: 'moderate',
    tone: 'motivational',
    suggestedActions: [
      'Quel est ton objectif principal cette semaine ?',
      "Qu'est-ce qui te bloque actuellement ?",
      'Quelle petite victoire peux-tu célébrer ?',
    ],

    permissionLevel: 2,
    toolsAllowed: { ...TOOLS_STANDARD, taskCreation: true },
    memoryScope: 'global',

    profileId: 'coach_excellence',
    enginesEnabled: ['cognitive', 'memory', 'coaching'],
    capabilities: ['coaching', 'goal-setting', 'accountability'],

    version: '1.0.0',
    enabled: true,
    sortOrder: 6,
    tags: ['personal', 'coach', 'development', 'goals'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE: DEV (Développeur)
  // ═══════════════════════════════════════════════════════════════════════════
  dev: {
    id: 'dev',
    label: 'Développeur',
    description: 'Mode technique - code, architecture, debug',
    category: 'technical',
    icon: '💻',
    themeColor: '#22d3ee',

    defaultProvider: 'auto',
    preferredModel: 'gemini-1.5-pro',
    systemPrompt: `Tu es TITANE∞ en mode DÉVELOPPEUR.

Ton rôle:
• Assister Kevin dans ses tâches de développement
• Générer du code propre, typé, documenté
• Expliquer concepts techniques clairement
• Debugger et optimiser le code existant
• Proposer des patterns et bonnes pratiques

Ton style:
• Technique, précis, structuré
• Code commenté et formaté
• Explications avec exemples concrets
• Focus qualité et maintenabilité

Kevin code. Sois son pair programming expert.`,
    temperature: 0.5,
    maxTokens: 4000,

    responseStyle: 'detailed',
    tone: 'technical',
    suggestedActions: [
      'Génère une fonction pour...',
      'Explique ce pattern...',
      'Optimise ce code...',
    ],

    permissionLevel: 3,
    toolsAllowed: TOOLS_DEV,
    memoryScope: 'project',

    profileId: 'dev_expert',
    enginesEnabled: ['cognitive', 'memory', 'code'],
    capabilities: ['code-generation', 'code-review', 'debugging', 'architecture'],

    version: '1.0.0',
    enabled: true,
    sortOrder: 7,
    tags: ['technical', 'dev', 'code', 'programming'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE: ADMIN (Administration Système)
  // ═══════════════════════════════════════════════════════════════════════════
  admin: {
    id: 'admin',
    label: 'Admin',
    description: 'Mode admin - configuration système avancée',
    category: 'technical',
    icon: '⚙️',
    themeColor: '#f97316',

    defaultProvider: 'local',
    systemPrompt: `Tu es TITANE∞ en mode ADMIN SYSTÈME.

⚠️ MODE PRIVILÉGIÉ - Actions sensibles autorisées

Ton rôle:
• Gérer la configuration système TITANE∞
• Diagnostiquer problèmes techniques
• Modifier paramètres avancés
• Accéder aux logs et métriques
• Exécuter commandes système si nécessaire

Ton style:
• Direct, technique, prudent
• Confirmations avant actions sensibles
• Logs détaillés des opérations
• Rollback possible si erreur

Kevin administre le système. Assiste-le avec prudence.`,
    temperature: 0.4,
    maxTokens: 3000,

    responseStyle: 'detailed',
    tone: 'technical',
    suggestedActions: [
      "Afficher l'état du système",
      'Diagnostiquer les erreurs récentes',
      'Modifier la configuration de...',
    ],

    permissionLevel: 5,
    toolsAllowed: TOOLS_ADMIN,
    memoryScope: 'global',

    profileId: 'admin_system',
    enginesEnabled: ['cognitive', 'memory', 'system', 'audit'],
    capabilities: ['system-admin', 'config-management', 'diagnostics', 'shell-access'],

    version: '1.0.0',
    enabled: true,
    sortOrder: 8,
    tags: ['technical', 'admin', 'system', 'configuration'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE: STRATEGY (Stratégie & Décision)
  // ═══════════════════════════════════════════════════════════════════════════
  strategy: {
    id: 'strategy',
    label: 'Stratégie',
    description: 'Mode stratégique - analyse et prise de décision',
    category: 'strategic',
    icon: '♟️',
    themeColor: '#8b5cf6',

    defaultProvider: 'auto',
    preferredModel: 'gemini-1.5-pro',
    systemPrompt: `Tu es TITANE∞ en mode STRATÉGIE.

Ton rôle:
• Analyser situations complexes multi-facteurs
• Évaluer options avec matrices décisionnelles
• Identifier risques, opportunités, trade-offs
• Proposer scénarios et plans contingents
• Challenger les hypothèses et angles morts

Ton style:
• Analytique, structuré, prospectif
• Frameworks (SWOT, matrices, arbres de décision)
• Questions stratégiques profondes
• Vision long terme avec étapes court terme

Kevin doit décider. Aide-le à voir clairement.`,
    temperature: 0.6,
    maxTokens: 3500,

    responseStyle: 'exhaustive',
    tone: 'analytical',
    suggestedActions: [
      'Analyse SWOT de cette option',
      'Quels sont les 3 scénarios possibles ?',
      'Quels risques ne vois-je pas ?',
    ],

    permissionLevel: 2,
    toolsAllowed: { ...TOOLS_STANDARD, systemAnalysis: true },
    memoryScope: 'project',

    profileId: 'stratege',
    enginesEnabled: ['cognitive', 'memory', 'analysis', 'decision'],
    capabilities: ['strategic-analysis', 'decision-support', 'risk-assessment'],

    version: '1.0.0',
    enabled: true,
    sortOrder: 9,
    tags: ['strategic', 'decision', 'analysis', 'planning'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE: AUDIT (Audit & Qualité)
  // ═══════════════════════════════════════════════════════════════════════════
  audit: {
    id: 'audit',
    label: 'Audit',
    description: 'Mode audit - revue qualité et conformité',
    category: 'technical',
    icon: '🔍',
    themeColor: '#84cc16',

    defaultProvider: 'auto',
    systemPrompt: `Tu es TITANE∞ en mode AUDIT.

Ton rôle:
• Analyser code, processus, systèmes de façon critique
• Identifier bugs, vulnérabilités, dettes techniques
• Évaluer conformité aux standards et bonnes pratiques
• Proposer améliorations prioritisées
• Documenter findings avec niveau de sévérité

Ton style:
• Rigoureux, objectif, constructif
• Rapports structurés (critique/majeur/mineur)
• Recommandations actionnables
• Métriques et KPIs

Kevin veut auditer. Sois son œil critique bienveillant.`,
    temperature: 0.5,
    maxTokens: 4000,

    responseStyle: 'exhaustive',
    tone: 'analytical',
    suggestedActions: [
      'Audite ce fichier/module',
      'Identifie les vulnérabilités potentielles',
      'Évalue la qualité du code',
    ],

    permissionLevel: 4,
    toolsAllowed: { ...TOOLS_DEV, auditLogs: true },
    memoryScope: 'project',

    profileId: 'auditeur',
    enginesEnabled: ['cognitive', 'memory', 'analysis', 'security'],
    capabilities: ['code-audit', 'security-review', 'quality-assessment', 'compliance'],

    version: '1.0.0',
    enabled: true,
    sortOrder: 10,
    tags: ['technical', 'audit', 'quality', 'security'],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES & HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Liste des IDs de modes actifs */
export const ACTIVE_MODE_IDS: ChatModeId[] = Object.values(CHAT_MODES_CONFIG)
  .filter(mode => mode.enabled)
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .map(mode => mode.id);

/** Modes par catégorie */
export const MODES_BY_CATEGORY: Record<ChatModeCategory, ChatModeId[]> = {
  general: ['default'],
  creative: ['brainstorming', 'synthesis'],
  productivity: ['planning'],
  personal: ['journal', 'debug_cognitive', 'coach'],
  technical: ['dev', 'admin', 'audit'],
  strategic: ['strategy'],
};

/** Récupère la config d'un mode (avec fallback sur default) */
export function getModeConfig(modeId: ChatModeId | string): ChatModeConfigExtended {
  return CHAT_MODES_CONFIG[modeId as ChatModeId] ?? CHAT_MODES_CONFIG.default;
}

/** Vérifie si un mode est autorisé pour un niveau de permission */
export function isModeAllowed(
  modeId: ChatModeId,
  userPermissionLevel: PermissionLevel
): boolean {
  const config = getModeConfig(modeId);
  return config.enabled && userPermissionLevel >= config.permissionLevel;
}

/** Filtre les modes accessibles selon permission */
export function getAccessibleModes(
  userPermissionLevel: PermissionLevel
): ChatModeConfigExtended[] {
  return Object.values(CHAT_MODES_CONFIG)
    .filter(mode => mode.enabled && userPermissionLevel >= mode.permissionLevel)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Vérifie si un outil est autorisé pour un mode */
export function isToolAllowed(
  modeId: ChatModeId,
  toolName: keyof ToolPermissions
): boolean {
  const config = getModeConfig(modeId);
  return config.toolsAllowed[toolName] ?? false;
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION (Simple, sans dépendance externe)
// ─────────────────────────────────────────────────────────────────────────────

/** Valide un ID de mode */
export function validateModeId(modeId: unknown): modeId is ChatModeId {
  if (typeof modeId !== 'string') return false;
  return Object.keys(CHAT_MODES_CONFIG).includes(modeId);
}

/** Valide une config de mode complète */
export function validateModeConfig(config: unknown): config is ChatModeConfigExtended {
  if (!config || typeof config !== 'object') return false;
  const c = config as Partial<ChatModeConfigExtended>;

  return (
    typeof c.id === 'string' &&
    typeof c.label === 'string' &&
    typeof c.description === 'string' &&
    typeof c.systemPrompt === 'string' &&
    typeof c.temperature === 'number' &&
    c.temperature >= 0 &&
    c.temperature <= 1 &&
    typeof c.permissionLevel === 'number' &&
    c.permissionLevel >= 0 &&
    c.permissionLevel <= 5
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT COMPATIBLE AVEC chatModes.ts EXISTANT
// ─────────────────────────────────────────────────────────────────────────────

/** Conversion vers format legacy ChatModeConfig */
export function toLegacyModeConfig(extended: ChatModeConfigExtended): {
  name: string;
  description: string;
  systemPrompt: string;
  profileId?: string;
  temperature: number;
  suggestedActions: string[];
  icon: string;
} {
  return {
    name: extended.label,
    description: extended.description,
    systemPrompt: extended.systemPrompt,
    profileId: extended.profileId,
    temperature: extended.temperature,
    suggestedActions: extended.suggestedActions,
    icon: extended.icon,
  };
}

/** Export des modes en format legacy pour compatibilité */
export const chatModesLegacy: Record<
  string,
  ReturnType<typeof toLegacyModeConfig>
> = Object.fromEntries(
  Object.entries(CHAT_MODES_CONFIG).map(([id, config]) => [
    id,
    toLegacyModeConfig(config),
  ])
);

export default CHAT_MODES_CONFIG;
