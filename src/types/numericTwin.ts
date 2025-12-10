/**
 * TITANE∞ vΩ∞ — Numeric Twin Types
 * © 2025 TITANE∞ — Proprietary License
 * Types TypeScript pour le Numeric Twin Engine
 */

// ═══════════════════════════════════════════════════════════════════════════
// TWIN IDENTITY CORE
// ═══════════════════════════════════════════════════════════════════════════

/** Valeur fondamentale (inviolable) */
export interface CoreValue {
  name: string;
  description: string;
  stability: number; // 0.0 - 1.0
  weight: number; // 0.0 - 1.0
}

/** Style humain Kevin */
export interface HumanStyle {
  sincerity: number;
  gentleIntensity: number;
  accessibleDepth: number;
  calmPrecision: number;
  organicFluidity: number;
}

/** Noyau d'identité du Twin */
export interface TwinIdentityCore {
  version: string;
  name: string;
  signature: string;
  coreValues: CoreValue[];
  humanStyle: HumanStyle;
  fusionIndex: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// TWIN VALUE MAP
// ═══════════════════════════════════════════════════════════════════════════

/** Valeur observée */
export interface ObservedValue {
  name: string;
  frequency: number;
  confidence: number;
  observationsCount: number;
}

/** Cartographie des valeurs */
export interface TwinValueMap {
  observedValues: ObservedValue[];
  confirmedValues: string[];
  alignmentScore: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// TWIN COGNITIVE PATTERNS
// ═══════════════════════════════════════════════════════════════════════════

/** Pattern de raisonnement */
export interface ReasoningPattern {
  name: string;
  description: string;
  frequency: number;
  effectiveness: number;
}

/** Style de structuration */
export interface StructuringStyle {
  simpleToComplex: number;
  structureLevel: number;
  hierarchyPreference: number;
  visualPreference: number;
}

/** Patterns cognitifs */
export interface TwinCognitivePatterns {
  reasoningPatterns: ReasoningPattern[];
  structuringStyle: StructuringStyle;
}

// ═══════════════════════════════════════════════════════════════════════════
// TWIN THERAPEUTIC MODEL
// ═══════════════════════════════════════════════════════════════════════════

/** Modèle thérapeutique */
export interface TwinTherapeuticModel {
  deepListening: number;
  rhythmRespect: number;
  relationalClarity: number;
  supportPrecision: number;
  nonDirectiveGuidance: number;
  holisticIntegration: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// TWIN CREATIVE SIGNATURE
// ═══════════════════════════════════════════════════════════════════════════

/** Signature créative */
export interface TwinCreativeSignature {
  operationalIntuition: number;
  artisticSense: number;
  symbolicSense: number;
  structuralCreativity: number;
  methodologicalInnovation: number;
  embodiedNarration: number;
  frameworksCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// TWIN EVOLUTION PROFILE
// ═══════════════════════════════════════════════════════════════════════════

/** Phase d'évolution */
export type EvolutionPhase =
  | 'Observation'
  | 'Assimilation'
  | 'Integration'
  | 'CoEvolution'
  | 'Symbiosis';

/** Tendances de croissance */
export interface GrowthTrends {
  cognitiveGrowth: number;
  emotionalGrowth: number;
  spiritualGrowth: number;
  entrepreneurialGrowth: number;
}

/** Suggestion d'ajustement */
export interface AdjustmentSuggestion {
  domain: string;
  suggestion: string;
  priority: number;
  validatedByKevin: boolean;
}

/** Profil d'évolution */
export interface TwinEvolutionProfile {
  currentPhase: EvolutionPhase;
  milestonesCount: number;
  growthTrends: GrowthTrends;
  adjustmentSuggestions: AdjustmentSuggestion[];
  syncScore: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// FUSION INDEX
// ═══════════════════════════════════════════════════════════════════════════

/** Tendance du fusion index */
export type FusionTrend = 'Improving' | 'Stable' | 'Declining';

/** Index de fusion */
export interface FusionIndex {
  globalScore: number;
  valueAlignment: number;
  cognitiveAlignment: number;
  styleAlignment: number;
  therapeuticAlignment: number;
  creativeAlignment: number;
  evolutionAlignment: number;
  trend: FusionTrend;
}

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAT COMPLET DU TWIN
// ═══════════════════════════════════════════════════════════════════════════

/** État complet du Twin */
export interface TwinState {
  identityCore: TwinIdentityCore;
  valueMap: TwinValueMap;
  cognitivePatterns: TwinCognitivePatterns;
  therapeuticModel: TwinTherapeuticModel;
  creativeSignature: TwinCreativeSignature;
  evolutionProfile: TwinEvolutionProfile;
  fusionIndex: FusionIndex;
}

// ═══════════════════════════════════════════════════════════════════════════
// REQUÊTES
// ═══════════════════════════════════════════════════════════════════════════

/** Type d'observation */
export type ObservationType = 'value' | 'cognitive' | 'style' | 'emotional';

/** Requête d'observation */
export interface TwinObservationRequest {
  observationType: ObservationType;
  content: string;
  context?: string;
  confidence: number;
}

/** Type d'évolution */
export type EvolutionType =
  | 'trait_adjustment'
  | 'value_reinforcement'
  | 'pattern_integration'
  | 'phase_transition';

/** Requête d'évolution */
export interface TwinEvolutionRequest {
  evolutionType: EvolutionType;
  target: string;
  delta?: number;
  isDeepChange: boolean;
  validatedByKevin: boolean;
}

/** Résultat d'évolution */
export interface TwinEvolutionResult {
  success: boolean;
  evolutionId: string;
  newFusionIndex: number;
  newPhase: EvolutionPhase;
  timestamp: string;
}

/** Requête de validation sync */
export interface TwinSyncValidationRequest {
  syncId: string;
  validated: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════

/** Couleur selon le score */
export function getScoreColor(score: number): string {
  if (score >= 0.8) return '#22c55e'; // Vert
  if (score >= 0.6) return '#3b82f6'; // Bleu
  if (score >= 0.4) return '#f59e0b'; // Orange
  return '#ef4444'; // Rouge
}

/** Label de la phase d'évolution */
export function getPhaseLabel(phase: EvolutionPhase): string {
  const labels: Record<EvolutionPhase, string> = {
    Observation: '🔍 Observation',
    Assimilation: '📥 Assimilation',
    Integration: '🔗 Intégration',
    CoEvolution: '🔄 Co-Évolution',
    Symbiosis: '♾️ Symbiose',
  };
  return labels[phase] || phase;
}

/** Label de la tendance */
export function getTrendLabel(trend: FusionTrend): string {
  const labels: Record<FusionTrend, string> = {
    Improving: '📈 En amélioration',
    Stable: '➡️ Stable',
    Declining: '📉 En déclin',
  };
  return labels[trend] || trend;
}

/** Icône de la tendance */
export function getTrendIcon(trend: FusionTrend): string {
  const icons: Record<FusionTrend, string> = {
    Improving: '↑',
    Stable: '→',
    Declining: '↓',
  };
  return icons[trend] || '→';
}

/** Valeurs fondamentales par défaut */
export const DEFAULT_CORE_VALUES: CoreValue[] = [
  {
    name: 'Alignement',
    description: 'Cohérence entre pensée, parole et action',
    stability: 1.0,
    weight: 0.95,
  },
  {
    name: 'Cohérence',
    description: 'Unité interne et externe',
    stability: 1.0,
    weight: 0.95,
  },
  {
    name: 'Clarté',
    description: 'Transparence et simplicité de communication',
    stability: 0.95,
    weight: 0.9,
  },
  {
    name: 'Autonomie',
    description: 'Liberté et responsabilité personnelle',
    stability: 0.9,
    weight: 0.85,
  },
  {
    name: 'Authenticité',
    description: 'Être vrai, sans masque',
    stability: 1.0,
    weight: 0.95,
  },
  {
    name: 'Simplicité durable',
    description: "Élimination du superflu, focus sur l'essentiel",
    stability: 0.9,
    weight: 0.85,
  },
];
