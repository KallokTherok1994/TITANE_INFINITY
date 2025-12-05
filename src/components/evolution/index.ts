/**
 * TITANE∞ Evolution Engine - UI Components
 * Copyright (c) 2025 MUSIC∞AI
 *
 * Composants React pour l'interface utilisateur du moteur d'évolution.
 *
 * @module components/evolution
 */

// ════════════════════════════════════════════════════════════════════════════
// EXPORTS - COMPOSANTS
// ════════════════════════════════════════════════════════════════════════════

export { EvolutionDashboard } from './EvolutionDashboard';
export { default as EvolutionDashboardDefault } from './EvolutionDashboard';

export { EvolutionHistory } from './EvolutionHistory';
export { default as EvolutionHistoryDefault } from './EvolutionHistory';

export { EvolutionTrends } from './EvolutionTrends';
export { default as EvolutionTrendsDefault } from './EvolutionTrends';

// ════════════════════════════════════════════════════════════════════════════
// RE-EXPORTS - TYPES DU SERVICE
// ════════════════════════════════════════════════════════════════════════════

export type {
  EvolutionReport,
  EvolutionScores,
  EvolutionSuggestion,
  EvolutionAction,
  EvolutionHistoryEntry,
  EvolutionPattern,
  EvolutionInsight,
  PerformanceTrend,
  TrendDirection,
  RiskLevel,
  SuggestionStatus,
  ActionResult,
  GovernanceRole
} from '../../services/evolutionEngine/evolutionEngine.config';
