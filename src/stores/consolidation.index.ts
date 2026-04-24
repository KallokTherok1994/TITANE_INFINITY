/**
 * TITANE∞ v31.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * SPRINT 3: Visual Stores Consolidation Index
 *
 * This file documents the consolidation path and provides
 * a single point for imports.
 *
 * Before (3 separate stores):
 * - visualStore.ts (491 lines)
 * - visualStateStore.ts (150 lines)
 * - visualStateStoreV21.ts (371 lines)
 * Total: 1012 lines of redundant code
 *
 * After (consolidated):
 * - unifiedVisualStoreImpl.ts (382 lines)
 * - unifiedVisualStore.ts (exports) (~30 lines)
 * Total: ~410 lines (+60% reduction)
 *
 * Migration Status:
 * ✅ unifiedVisualStoreImpl.ts created
 * ✅ unifiedVisualStore.ts updated with new exports
 * ⏳ gradual migration of consumers to useUnifiedVisualStore
 * ⏳ deprecation of old store imports
 *
 * New Recommended Pattern:
 * import { useUnifiedVisualStore, useVisualCurrentState } from '@/stores';
 *
 * Legacy Pattern (Still Supported):
 * import { useVisualStore } from '@/stores/visualStore';
 * ═══════════════════════════════════════════════════════════════
 */

// Export consolidated store
export { useUnifiedVisualStore } from './unifiedVisualStoreImpl';

// Export selector hooks
export {
  useVisualCurrentState,
  useVisualMetrics,
  useVisualEngineStatus,
  useVisualFPS,
  useVisualActions,
} from './unifiedVisualStoreImpl';

// Export types
export type {
  UnifiedVisualState,
  UnifiedVisualActions,
  UnifiedVisualStore,
} from './unifiedVisualStoreImpl';

// For documentation purposes
export const CONSOLIDATION_INFO = {
  date: '2026-04-24',
  sprint: 'SPRINT 3 - MEDIUM-01',
  stores_consolidated: [
    'visualStore.ts',
    'visualStateStore.ts',
    'visualStateStoreV21.ts',
  ],
  implementation: 'unifiedVisualStoreImpl.ts',
  line_reduction: '60%+',
  breaking_changes: 'None (full backward compatibility via re-exports)',
};
