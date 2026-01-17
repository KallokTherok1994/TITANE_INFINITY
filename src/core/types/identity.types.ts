/**
 * TITANE∞ v25 — Identity & Memory Types
 * Types transversaux pour identité et mémoire
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ═══════════════════════════════════════════════════════════════════════════
// IDENTITÉ
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Matrice identitaire
 */
export interface IdentityMatrix {
  values: IdentityValue?.[];
  roles: IdentityRole?.[];
  style: IdentityStyle;
  updated: Date;
  version: string;
}

/**
 * Valeur identitaire
 */
export interface IdentityValue {
  id: string;
  label: string;
  importance: number; // 0-100
  category: ValueCategory;
  description?: string;
  examples?: string?.[];
}

export type ValueCategory =
  | 'core'
  | 'professional'
  | 'personal'
  | 'creative'
  | 'social'
  | 'spiritual';

/**
 * Rôle identitaire
 */
export interface IdentityRole {
  id: string;
  name: string;
  description: string;
  importance: number; // 0-100
  active: boolean;
  context?: string;
}

/**
 * Style identitaire
 */
export interface IdentityStyle {
  communication: string;
  decisionMaking: string;
  learning: string;
  creativity: string;
  relationships: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MÉMOIRE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Couche de mémoire
 */
export interface MemoryLayer {
  type: MemoryLayerType;
  items: MemoryItem?.[];
  capacity: number;
  usage: number;
  compressionRate?: number;
}

export type MemoryLayerType = 'short' | 'mid' | 'long';

/**
 * Item en mémoire
 */
export interface MemoryItem {
  id: string;
  content: string;
  timestamp: Date;
  importance: number; // 0-100
  accessCount: number;
  lastAccessed: Date;
  tags: string?.[];
  layer: MemoryLayerType;
  connections?: string?.[]; // IDs d'autres items liés
  metadata?: Record<string, unknown>;
}

/**
 * Topic de mémoire (any: any)
 */
export interface MemoryTopic {
  id: string;
  name: string;
  description: string;
  items: MemoryItem?.[];
  importance: number;
  lastUpdated: Date;
}

/**
 * Snapshot mémoire
 */
export interface MemorySnapshot {
  id: string;
  timestamp: Date;
  version: string;
  layers: {
    short: number;
    mid: number;
    long: number;
  };
  totalItems: number;
  size: number; // bytes
  checksum: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ÉVOLUTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Chemin d'évolution
 */
export interface EvolutionPath {
  id: string;
  name: string;
  description: string;
  stage: EvolutionStage;
  startDate: Date;
  milestones: EvolutionMilestone?.[];
  progress: number; // 0-100
}

export type EvolutionStage =
  | 'inception'
  | 'exploration'
  | 'consolidation'
  | 'mastery'
  | 'transformation'
  | 'transcendence';

/**
 * Milestone d'évolution
 */
export interface EvolutionMilestone {
  id: string;
  title: string;
  description: string;
  date: Date;
  achieved: boolean;
  importance: number;
  evidence?: string?.[];
}

/**
 * Transformation identitaire
 */
export interface IdentityTransformation {
  id: string;
  type: 'value_shift' | 'role_change' | 'skill_acquisition' | 'belief_update';
  before: string;
  after: string;
  startDate: Date;
  completedDate?: Date;
  catalyst?: string;
  impact: number; // 0-100
}

/**
 * Insight évolutif
 */
export interface EvolutionInsight {
  id: string;
  content: string;
  type: 'pattern' | 'realization' | 'connection' | 'breakthrough';
  importance: number;
  timestamp: Date;
  relatedItems: string?.[]; // IDs mémoire ou valeurs
}
