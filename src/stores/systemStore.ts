/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ — System Store (Zustand)
 * Store centralisé pour l'état système (Helios, Nexus, Harmonia, Sentinel)
 * ═══════════════════════════════════════════════════════════════
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  HeliosState,
  NexusState,
  HarmoniaState,
  SentinelState,
  HealthStatus,
} from '../services/tauri/backend-v17.2.types';
import { backendV17 } from '../services/tauri/backend-v17.2.commands';

interface SystemStore {
  // State
  helios: HeliosState | null;
  nexus: NexusState | null;
  harmonia: HarmoniaState | null;
  sentinel: SentinelState | null;
  health: HealthStatus | null;
  loading: boolean;
  error: string | null;
  lastUpdate: number | null;

  // Actions
  fetchHelios: () => Promise<void>;
  fetchNexus: () => Promise<void>;
  fetchHarmonia: () => Promise<void>;
  fetchSentinel: () => Promise<void>;
  fetchHealth: () => Promise<void>;
  fetchAll: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  helios: null,
  nexus: null,
  harmonia: null,
  sentinel: null,
  health: null,
  loading: false,
  error: null,
  lastUpdate: null,
};

export const useSystemStore = create<SystemStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        fetchHelios: async () => {
          try {
            set({ loading: true, error: null });
            const helios = await backendV17.helios.getState();
            set({ helios, loading: false, lastUpdate: Date.now() });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch Helios',
              loading: false 
            });
          }
        },

        fetchNexus: async () => {
          try {
            set({ loading: true, error: null });
            const nexus = await backendV17.system.getNexusState();
            set({ nexus, loading: false, lastUpdate: Date.now() });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch Nexus',
              loading: false 
            });
          }
        },

        fetchHarmonia: async () => {
          try {
            set({ loading: true, error: null });
            const harmonia = await backendV17.system.getHarmoniaState();
            set({ harmonia, loading: false, lastUpdate: Date.now() });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch Harmonia',
              loading: false 
            });
          }
        },

        fetchSentinel: async () => {
          try {
            set({ loading: true, error: null });
            const sentinel = await backendV17.system.getSentinelState();
            set({ sentinel, loading: false, lastUpdate: Date.now() });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch Sentinel',
              loading: false 
            });
          }
        },

        fetchHealth: async () => {
          try {
            set({ loading: true, error: null });
            const health = await backendV17.helios.getHealth();
            set({ health, loading: false, lastUpdate: Date.now() });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch Health',
              loading: false 
            });
          }
        },

        fetchAll: async () => {
          try {
            set({ loading: true, error: null });
            
            const [helios, nexus, harmonia, sentinel, health] = await Promise.all([
              backendV17.helios.getState(),
              backendV17.system.getNexusState(),
              backendV17.system.getHarmoniaState(),
              backendV17.system.getSentinelState(),
              backendV17.helios.getHealth(),
            ]);

            set({ 
              helios, 
              nexus, 
              harmonia, 
              sentinel, 
              health,
              loading: false,
              lastUpdate: Date.now(),
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch system state',
              loading: false 
            });
          }
        },

        reset: () => set(initialState),
      }),
      {
        name: 'titane-system-store',
        partialize: (state) => ({
          helios: state.helios,
          nexus: state.nexus,
          harmonia: state.harmonia,
          sentinel: state.sentinel,
          lastUpdate: state.lastUpdate,
        }),
      }
    ),
    { name: 'SystemStore' }
  )
);
