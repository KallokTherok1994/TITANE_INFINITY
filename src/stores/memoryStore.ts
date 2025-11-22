/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ — Memory Store (Zustand)
 * Store pour la mémoire système (snapshots, logs, timeline)
 * ═══════════════════════════════════════════════════════════════
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  MemoryState,
  Snapshot,
  LogEntry,
  TimelineEvent,
} from '../services/tauri/backend-v17.2.types';
import { backendV17 } from '../services/tauri/backend-v17.2.commands';

interface MemoryStore {
  // State
  state: MemoryState | null;
  snapshots: Snapshot[];
  logs: LogEntry[];
  timeline: TimelineEvent[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchState: () => Promise<void>;
  fetchLogs: (count: number) => Promise<void>;
  createSnapshot: (description: string) => Promise<void>;
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => Promise<void>;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => Promise<void>;
  reset: () => void;
}

const initialState = {
  state: null,
  snapshots: [],
  logs: [],
  timeline: [],
  loading: false,
  error: null,
};

export const useMemoryStore = create<MemoryStore>()(
  devtools(
    (set) => ({
      ...initialState,

      fetchState: async () => {
        try {
          set({ loading: true, error: null });
          const state = await backendV17.memory.getState();
          set({ state, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch memory state',
            loading: false,
          });
        }
      },

      fetchLogs: async (count: number) => {
        try {
          set({ loading: true, error: null });
          const logs = await backendV17.memory.readLogs(count);
          set({ logs, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch logs',
            loading: false,
          });
        }
      },

      createSnapshot: async (description: string) => {
        try {
          set({ loading: true, error: null });
          const snapshot = await backendV17.composite.captureSnapshot(description);
          set((state) => ({
            snapshots: [snapshot, ...state.snapshots],
            loading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create snapshot',
            loading: false,
          });
        }
      },

      addLog: async (entry) => {
        try {
          const fullEntry: LogEntry = {
            ...entry,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
          };
          await backendV17.memory.writeLog(fullEntry);
          set((state) => ({
            logs: [fullEntry, ...state.logs].slice(0, 1000), // Keep last 1000
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add log',
          });
        }
      },

      addTimelineEvent: async (event) => {
        try {
          const fullEvent: TimelineEvent = {
            ...event,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
          };
          await backendV17.memory.addEvent(fullEvent);
          set((state) => ({
            timeline: [fullEvent, ...state.timeline],
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add timeline event',
          });
        }
      },

      reset: () => set(initialState),
    }),
    { name: 'MemoryStore' }
  )
);
