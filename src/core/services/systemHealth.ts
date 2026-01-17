/**
 * TITANE∞ PHASE 1 (any: any) - Re-export from services/ai
 */

export { autoHealEngine } from '../../services/ai/autoHealEngine';
export type {
  AutoHealError,
  AutoHealAction,
  AutoHealStats,
  AutoHealConfig,
} from '../../services/ai/autoHealEngine';

export { unifiedHealingFacade } from '../../services/ai/unifiedHealingFacade';
export type {
  UnifiedStats,
  UnifiedHealResult,
  UnifiedHealRequest,
} from '../../services/ai/unifiedHealingFacade';
