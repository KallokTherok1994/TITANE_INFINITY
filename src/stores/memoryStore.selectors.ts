/**
 * TITANE∞ v29.0.0 — Memory Store Selectors
 * Optimized selectors with shallow equality for memoryStore
 * Prevents unnecessary rerenders by selecting only needed slices
 */

import { useMemoryStore } from './memoryStore';
import { shallow } from 'zustand/shallow';

// ═══════════════════════════════════════════════════════════════
// PRIMITIVE SELECTORS (Single Value)
// ═══════════════════════════════════════════════════════════════

export const useMemoryState = () => useMemoryStore(state => state.state);
export const useSnapshots = () => useMemoryStore(state => state.snapshots);
export const useLogs = () => useMemoryStore(state => state.logs);
export const useTimeline = () => useMemoryStore(state => state.timeline);
export const useTelemetry = () => useMemoryStore(state => state.telemetry);
export const useMemoryLoading = () => useMemoryStore(state => state.loading);
export const useMemoryError = () => useMemoryStore(state => state.error);

// ═══════════════════════════════════════════════════════════════
// COMPOSITE SELECTORS (Multiple Values with Shallow Equality)
// ═══════════════════════════════════════════════════════════════

/**
 * Loading state (loading + error)
 * Use when component needs both values
 */
export const useMemoryLoadingState = () =>
  useMemoryStore(
    state => ({
      loading: state.loading,
      error: state.error,
    }),
    shallow
  );

/**
 * Snapshots with count
 * Use for UI components showing snapshots list
 */
export const useSnapshotsState = () =>
  useMemoryStore(
    state => ({
      snapshots: state.snapshots,
      count: state.snapshots.length,
    }),
    shallow
  );

/**
 * Logs with count
 * Use for UI components showing logs list
 */
export const useLogsState = () =>
  useMemoryStore(
    state => ({
      logs: state.logs,
      count: state.logs.length,
    }),
    shallow
  );

/**
 * Timeline with count
 * Use for UI components showing timeline
 */
export const useTimelineState = () =>
  useMemoryStore(
    state => ({
      timeline: state.timeline,
      count: state.timeline.length,
    }),
    shallow
  );

// ═══════════════════════════════════════════════════════════════
// ACTION SELECTORS (Actions Only)
// ═══════════════════════════════════════════════════════════════

/**
 * Memory state actions
 * Use when component only needs actions, not state
 */
export const useMemoryActions = () =>
  useMemoryStore(
    state => ({
      fetchState: state.fetchState,
      fetchLogs: state.fetchLogs,
      fetchTelemetry: state.fetchTelemetry,
      reset: state.reset,
    }),
    shallow
  );

/**
 * Snapshot actions
 * Use when component only needs snapshot actions
 */
export const useSnapshotActions = () =>
  useMemoryStore(
    state => ({
      createSnapshot: state.createSnapshot,
    }),
    shallow
  );

/**
 * Log actions
 * Use when component only needs log actions
 */
export const useLogActions = () =>
  useMemoryStore(
    state => ({
      addLog: state.addLog,
    }),
    shallow
  );

/**
 * Timeline actions
 * Use when component only needs timeline actions
 */
export const useTimelineActions = () =>
  useMemoryStore(
    state => ({
      addTimelineEvent: state.addTimelineEvent,
    }),
    shallow
  );

// ═══════════════════════════════════════════════════════════════
// COMPUTED SELECTORS (Derived State with Memoization)
// ═══════════════════════════════════════════════════════════════

/**
 * Has snapshots (boolean)
 * Use for components that only need to know if snapshots exist
 */
export const useHasSnapshots = () => useMemoryStore(state => state.snapshots.length > 0);

/**
 * Snapshot count (number)
 * Use for badge displays
 */
export const useSnapshotCount = () => useMemoryStore(state => state.snapshots.length);

/**
 * Has logs (boolean)
 * Use for components that only need to know if logs exist
 */
export const useHasLogs = () => useMemoryStore(state => state.logs.length > 0);

/**
 * Log count (number)
 * Use for badge displays
 */
export const useLogCount = () => useMemoryStore(state => state.logs.length);

/**
 * Has timeline events (boolean)
 * Use for components that only need to know if timeline has events
 */
export const useHasTimelineEvents = () =>
  useMemoryStore(state => state.timeline.length > 0);

/**
 * Timeline event count (number)
 * Use for badge displays
 */
export const useTimelineEventCount = () => useMemoryStore(state => state.timeline.length);

/**
 * Is memory loaded (boolean)
 * Use for conditional rendering
 */
export const useIsMemoryLoaded = () => useMemoryStore(state => state.state !== null);

/**
 * Has memory error (boolean)
 * Use for error UI components
 */
export const useHasMemoryError = () => useMemoryStore(state => state.error !== null);

/**
 * Latest snapshot (Snapshot | undefined)
 * Use for displaying most recent snapshot
 */
export const useLatestSnapshot = () => useMemoryStore(state => state.snapshots[0]);

/**
 * Latest log (LogEntry | undefined)
 * Use for displaying most recent log
 */
export const useLatestLog = () => useMemoryStore(state => state.logs[0]);

/**
 * Latest timeline event (TimelineEvent | undefined)
 * Use for displaying most recent event
 */
export const useLatestTimelineEvent = () => useMemoryStore(state => state.timeline[0]);
