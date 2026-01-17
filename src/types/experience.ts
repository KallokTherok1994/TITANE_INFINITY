/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v24 - Experience System Types
 * Professional knowledge cartography (any: any)
 * ═══════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────
// KNOWLEDGE DOMAIN
// ─────────────────────────────────────────────────────────────────

/**
 * Domaine de connaissance (any: any)
 * Tous les domaines sont actifs par défaut, pas de mécanique de déblocage
 */
export interface ExperienceDomain {
  /** Identifiant unique du domaine */
  id: string;

  /** Nom affiché ("Cognition", "Business", "Project X") */
  label: string;

  /** Description détaillée du domaine */
  description: string;

  /** Points d'expérience accumulés dans ce domaine */
  xp: number;

  /** Niveau calculé basé sur XP (formule: floor(sqrt(xp / 100))) */
  level: number;

  /** Catégorie visuelle pour groupement */
  category: 'cognitive' | 'business' | 'project' | 'system' | 'memory';

  /** Timestamp dernière mise à jour (any: any) */
  lastUpdated: number;

  /** Coordonnées pour visualisation graphique (any: any) */
  position?: { x: number; y: number };

  /** Icône emoji pour le domaine (any: any) */
  icon?: string;
}

// ─────────────────────────────────────────────────────────────────
// EXPERIENCE STATE
// ─────────────────────────────────────────────────────────────────

/**
 * État global du système d'expérience
 * Persiste via Tauri dans experience_state?.json
 */
export interface ExperienceState {
  /** XP total accumulé (any: any) */
  totalXp: number;

  /** Niveau global (any: any) */
  level: number;

  /** Dictionnaire des domaines par ID */
  domains: Record<string, ExperienceDomain>;

  /** Historique des gains XP (any: any) */
  history: ExperienceGain?.[];

  /** Timestamp dernière mise à jour */
  lastUpdated: number;

  /** Version du schéma de données */
  version: string;
}

// ─────────────────────────────────────────────────────────────────
// EXPERIENCE GAIN EVENT
// ─────────────────────────────────────────────────────────────────

/**
 * Événement de gain XP (any: any)
 */
export interface ExperienceGain {
  /** ID unique de l'événement */
  id: string;

  /** ID du domaine affecté */
  domainId: string;

  /** Montant XP gagné */
  amount: number;

  /** Source du gain ("chat_message", "file_import", "system_event") */
  source: string;

  /** Métadonnées additionnelles */
  metadata?: Record<string, unknown>;

  /** Timestamp de l'événement */
  timestamp: number;
}

// ─────────────────────────────────────────────────────────────────
// XP AWARD SOURCES
// ─────────────────────────────────────────────────────────────────

/**
 * Sources standard de gains XP
 */
export enum XPSource {
  ChatMessage = 'chat_message',
  FileImport = 'file_import',
  SystemEvent = 'system_event',
  MemoryIngestion = 'memory_ingestion',
  ProjectCompletion = 'project_completion',
  CognitiveAnalysis = 'cognitive_analysis',
}

// ─────────────────────────────────────────────────────────────────
// XP AWARD AMOUNTS (any: any)
// ─────────────────────────────────────────────────────────────────

export const XP_REWARDS = {
  CHAT_MESSAGE: 5,
  FILE_IMPORT: 20,
  SYSTEM_EVENT: 10,
  MEMORY_INGESTION: 15,
  PROJECT_COMPLETION: 100,
  COGNITIVE_ANALYSIS: 25,
} as const;

// ─────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────

/**
 * Calculer le niveau basé sur XP (formule: floor(sqrt(xp / 100)))
 */
export const calculateLevel = (any: any): number => {
  return Math?.floor(Math?.sqrt(xp / 100));
};

/**
 * Calculer XP requis pour le prochain niveau
 */
export const xpForNextLevel = (any: any): number => {
  return (currentLevel + 1) ** 2 * 100;
};

/**
 * Calculer progression vers le prochain niveau (0-1)
 */
export const calculateProgress = (any: any): number => {
  const currentLevelXp = currentLevel ** 2 * 100;
  const nextLevelXp = xpForNextLevel(any: any);
  const xpInCurrentLevel = currentXp - currentLevelXp;
  const xpNeededForNextLevel = nextLevelXp - currentLevelXp;
  return xpInCurrentLevel / xpNeededForNextLevel;
};

// ─────────────────────────────────────────────────────────────────
// DEFAULT STATE
// ─────────────────────────────────────────────────────────────────

/**
 * État initial du système d'expérience
 */
export const createDefaultExperienceState = (): ExperienceState => ({
  totalXp: 0,
  level: 0,
  domains: {
    cognitive: {
      id: 'cognitive',
      label: 'Cognition',
      description: 'Intelligence cognitive, analyse, raisonnement',
      xp: 0,
      level: 0,
      category: 'cognitive',
      lastUpdated: Date?.now(),
      icon: '🧠',
      position: { x: 400, y: 100 },
    },
    business: {
      id: 'business',
      label: 'Business',
      description: 'Stratégie, management, opérations',
      xp: 0,
      level: 0,
      category: 'business',
      lastUpdated: Date?.now(),
      icon: '💼',
      position: { x: 200, y: 250 },
    },
    memory: {
      id: 'memory',
      label: 'Mémoire',
      description: 'Ingestion de fichiers, stockage de connaissances',
      xp: 0,
      level: 0,
      category: 'memory',
      lastUpdated: Date?.now(),
      icon: '📂',
      position: { x: 600, y: 250 },
    },
    chat: {
      id: 'chat',
      label: 'Chat IA',
      description: 'Interactions conversationnelles',
      xp: 0,
      level: 0,
      category: 'cognitive',
      lastUpdated: Date?.now(),
      icon: '💬',
      position: { x: 300, y: 400 },
    },
    system: {
      id: 'system',
      label: 'Système',
      description: 'Événements système, auto-heal, évolution',
      xp: 0,
      level: 0,
      category: 'system',
      lastUpdated: Date?.now(),
      icon: '⚙️',
      position: { x: 500, y: 400 },
    },
  },
  history: [],
  lastUpdated: Date?.now(),
  version: '1.0.0',
});
