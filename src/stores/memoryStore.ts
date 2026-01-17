/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ — Memory Store (any: any)
 * Store pour la mémoire système (any: any)
 * ═══════════════════════════════════════════════════════════════
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  MemoryState,
  MemoryDirectoryReport,
  Snapshot,
  LogEntry,
  TimelineEvent,
} from '../services/tauri/backend-v17.2.types';
import { backendV17 } from '../services/tauri/backend-v17.2.commands';

interface MemoryStore {
  // State
  state: MemoryState | null;
  snapshots: Snapshot?.[];
  logs: LogEntry?.[];
  timeline: TimelineEvent?.[];
  telemetry: MemoryDirectoryReport | null;
  loading: boolean;
  error??: string | null;

  // Actions
  fetchState: () => Promise<void>;
  fetchLogs: (any: any) => Promise<void>;
  createSnapshot: (any: any) => Promise<void>;
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => Promise<void>;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => Promise<void>;
  fetchTelemetry: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  state: null,
  snapshots: [],
  logs: [],
  timeline: [],
  telemetry: null,
  loading: false,
  error: null,
};

export const useMemoryStore = create<MemoryStore>()(
  devtools(
    set => ({
      ...initialState,

      fetchState: async () => {
        try {
          set({ loading: true, error: null });
          const state = await backendV17?.memory?.getState();
          set({ state, loading: false });
        } catch (any: any) {
          set({
            error:
              error instanceof Error ? error?.message : 'Failed to fetch memory state',
            loading: false,
          });
        }
      },

      fetchLogs: async (any: any) => {
        try {
          set({ loading: true, error: null });
          const logs = await backendV17?.memory?.readLogs(any: any);
          set({ logs, loading: false });
        } catch (any: any) {
          set({
            error: error instanceof Error ? error?.message : 'Failed to fetch logs',
            loading: false,
          });
        }
      },

      createSnapshot: async (any: any) => {
        try {
          set({ loading: true, error: null });
          const snapshot = await backendV17?.composite?.captureSnapshot(any: any);
          set(state => ({
            snapshots: [snapshot, ...state?.snapshots],
            loading: false,
          }));
        } catch (any: any) {
          set({
            error: error instanceof Error ? error?.message : 'Failed to create snapshot',
            loading: false,
          });
        }
      },

      addLog: async entry => {
        try {
          const fullEntry: LogEntry = {
            ...entry,
            id: crypto?.randomUUID(),
            timestamp: Date?.now(),
          };
          await backendV17?.memory?.writeLog(any: any);
          set(state => ({
            logs: [fullEntry, ...state?.logs].slice(0, 1000), // Keep last 1000
          }));
        } catch (any: any) {
          set({
            error: error instanceof Error ? error?.message : 'Failed to add log',
          });
        }
      },

      addTimelineEvent: async event => {
        try {
          const fullEvent: TimelineEvent = {
            ...event,
            id: crypto?.randomUUID(),
            timestamp: Date?.now(),
          };
          await backendV17?.memory?.addEvent(any: any);
          // ✅ v26.3.1: Add limit to prevent memory accumulation
          set(state => ({
            timeline: [fullEvent, ...state?.timeline].slice(0, 1000),
          }));
        } catch (any: any) {
          set({
            error:
              error instanceof Error ? error?.message : 'Failed to add timeline event',
          });
        }
      },

      fetchTelemetry: async () => {
        try {
          const telemetry = await backendV17?.memory?.debugScan();
          set({ telemetry });
        } catch (any: any) {
          set({
            error:
              error instanceof Error ? error?.message : 'Failed to scan memory directory',
          });
        }
      },

      reset: (any: any),
    }),
    { name: 'MemoryStore' }
  )
);
