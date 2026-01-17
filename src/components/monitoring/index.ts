/**
 * TITANE∞ v∞.19.2.3Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.19.2.3Ω — MONITORING COMPONENTS EXPORTS
 * ═══════════════════════════════════════════════════════════════════════════
 */

export { MonitoringHeader } from './MonitoringHeader';
export type { MonitoringHeaderProps } from './MonitoringHeader';

export { SystemStatusCard } from './SystemStatusCard';
export type { SystemStatusCardProps, SystemStatus } from './SystemStatusCard';

export { SystemHealthMonitor } from './SystemHealthMonitor';

export { LogsCard } from './LogsCard';
export type { LogsCardProps } from './LogsCard';

export { ErrorsCard } from './ErrorsCard';
export type { ErrorsCardProps } from './ErrorsCard';

export { CognitiveModuleCard } from './CognitiveModuleCard';
export type { CognitiveModuleCardProps } from './CognitiveModuleCard';

// v∞ — Singularity Dashboard
export {
  SingularityDashboard,
  default as SingularityDashboardDefault,
} from './SingularityDashboard';

// Anomaly & Predictive Dashboards
export { AnomalyDashboard } from './AnomalyDashboard';
export { PredictiveAlertsDashboard } from './PredictiveAlertsDashboard';

// Living Engines
export { LivingEnginesCard } from './LivingEnginesCard';
