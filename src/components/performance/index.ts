/**
 * @file index.ts
 * @description Export des composants Performance - TITANE∞ Performance Engine vΩ∞Ω+
 * @version 1.0.0
 * @license TITANE_INFINITY_∞_OMEGA+_LICENSE
 */

// Composants principaux
export { PerformanceDashboard } from './PerformanceDashboard';
export { MetricsGraph } from './MetricsGraph';
export { PerformanceIssues } from './PerformanceIssues';
export { RecommendationsPanel } from './RecommendationsPanel';

// Types réexportés
export type { PerformanceDashboardProps } from './PerformanceDashboard';
export type {
  MetricsGraphProps,
  MetricSeriesConfig,
  GraphDataPoint,
  GraphType,
  TimeRange
} from './MetricsGraph';
export type {
  PerformanceIssuesProps,
  IssueFilterOptions
} from './PerformanceIssues';
export type {
  RecommendationsPanelProps,
  RecommendationFilterOptions
} from './RecommendationsPanel';
