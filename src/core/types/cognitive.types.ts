/**
 * TITANE∞ v25 — Cognitive Types
 * Types transversaux pour le système cognitif
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ═══════════════════════════════════════════════════════════════════════════
// COGNITIVE STATE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * État cognitif actuel du système
 */
export interface CognitiveState {
  /** Niveau de focus (0-100) */
  focus: number;

  /** Niveau de clarté mentale (0-100) */
  clarity: number;

  /** Charge cognitive actuelle (0-100) */
  load: number;

  /** Ton émotionnel actuel */
  emotion: string;

  /** Mode cognitif actif (deep work, social, admin, etc.) */
  mode: CognitiveMode;

  /** Timestamp de la mesure */
  timestamp: Date;

  /** Métadonnées additionnelles */
  metadata?: Record<string, unknown>;
}

export type CognitiveMode =
  | 'deep_work'
  | 'social'
  | 'admin'
  | 'creative'
  | 'learning'
  | 'rest'
  | 'unknown';

// ═══════════════════════════════════════════════════════════════════════════
// PROGRESSION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Métriques de progression
 */
export interface ProgressMetric {
  /** Points d'expérience totaux */
  xp: number;

  /** Niveau actuel */
  level: number;

  /** Score de constance (0-100) */
  constancy: number;

  /** Nombre de sessions accomplies */
  sessions: number;

  /** Nombre de cycles complétés */
  cycles: number;

  /** Progression semaine en cours */
  weeklyProgress?: DataPoint[];

  /** Progression mois en cours */
  monthlyProgress?: DataPoint[];
}

export interface DataPoint {
  date: Date;
  value: number;
  label?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELIOS (VITALITÉ SYSTÈME)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Métriques vitales du système Helios
 */
export interface HeliosVitals {
  /** Vitalité système globale (0-100) */
  systemVitality: number;

  /** Niveau d'énergie (0-100) */
  energyLevel: number;

  /** Température système (°C) */
  temperature?: number;

  /** Anomalies détectées */
  anomalies: Anomaly[];

  /** Signaux vitaux */
  signals: Signal[];

  /** Statut global */
  status: HeliosStatus;

  /** Timestamp */
  timestamp: Date;
}

export type HeliosStatus = 'optimal' | 'warning' | 'critical' | 'unknown';

export interface Anomaly {
  id: string;
  type: 'performance' | 'memory' | 'cognitive' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export interface Signal {
  id: string;
  source: string;
  value: number;
  unit: string;
  threshold?: number;
  status: 'normal' | 'warning' | 'alert';
}

// ═══════════════════════════════════════════════════════════════════════════
// HARMONIA (ÉQUILIBRE ÉNERGIE/CHARGE)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * État d'équilibre Harmonia
 */
export interface HarmoniaBalance {
  /** Niveau d'énergie disponible (0-100) */
  energyLevel: number;

  /** Charge cognitive actuelle (0-100) */
  cognitiveLoad: number;

  /** Balance énergie/charge (-100 à +100) */
  balance: number;

  /** Recommandation d'ajustement */
  recommendation: string;

  /** Patterns détectés */
  patterns?: HarmoniaPattern[];

  /** Timestamp */
  timestamp: Date;
}

export interface HarmoniaPattern {
  id: string;
  type: 'surge' | 'drain' | 'balance' | 'imbalance';
  intensity: number;
  duration: number;
  recommendation: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// NEXUS (COHÉRENCE & RÉSEAU)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * État de cohérence Nexus
 */
export interface NexusCoherence {
  /** Score d'alignement (0-100) */
  alignment: number;

  /** Niveau de friction (0-100) */
  friction: number;

  /** Cohérence globale (0-100) */
  coherence: number;

  /** Noeuds actifs */
  activeNodes: number;

  /** Connexions actives */
  activeConnections: number;

  /** Timestamp */
  timestamp: Date;
}

/**
 * Noeud dans le réseau Nexus
 */
export interface NexusNode {
  id: string;
  label: string;
  type: 'skill' | 'concept' | 'project' | 'person' | 'resource';
  x: number;
  y: number;
  connections: number;
  importance: number;
  metadata?: Record<string, unknown>;
}

/**
 * Lien entre noeuds Nexus
 */
export interface NexusEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  type?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// HYPER INTELLIGENCE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Insight généré par Hyper Intelligence
 */
export interface HyperInsight {
  id: string;
  type: 'pattern' | 'prediction' | 'recommendation' | 'warning' | 'opportunity';
  content: string;
  confidence: number;
  importance: number;
  timestamp: Date;
  source: string;
  metadata?: Record<string, unknown>;
}

/**
 * Pattern détecté par Hyper Intelligence
 */
export interface CognitivePattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  strength: number;
  firstDetected: Date;
  lastDetected: Date;
  occurrences: number;
}

/**
 * Prédiction cognitive
 */
export interface CognitivePrediction {
  id: string;
  type: 'energy' | 'focus' | 'performance' | 'mood';
  prediction: number;
  confidence: number;
  timeframe: string;
  reasoning: string;
  timestamp: Date;
}
