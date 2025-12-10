/**
 * TITANE∞ vΩ∞ — useMultimodalStore
 * OPUS v∞.3: Store Zustand pour l'état multimodal
 *
 * Persiste:
 * - Profil baseline multimodal
 * - Configuration des poids de modalités
 * - Préférences utilisateur
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  MultimodalState,
  BaselineFusionProfile,
  ModalityWeights,
  CorrelationMatrix,
  ModalityOrigin,
} from '@/types/multimodalFusion';
import {
  getDefaultBaselineFusionProfile,
  getDefaultModalityWeights,
} from '@/types/multimodalFusion';

// ============================================================================
// TYPES
// ============================================================================

interface MultimodalPreferences {
  autoStart: boolean;
  showSignalQuality: boolean;
  coherenceAlertThreshold: number;
  audioFeedbackEnabled: boolean;
  visualFeedbackEnabled: boolean;
}

interface SignalQualities {
  vision: number;
  voice: number;
  text: number;
}

interface MultimodalStats {
  totalSessions: number;
  totalAnalysisTime: number;
  lastSessionStart: number | null;
  calibrationCount: number;
}

interface MultimodalStoreState {
  // Runtime state
  isActive: boolean;
  currentState: MultimodalState | null;
  signalQualities: SignalQualities;
  recentHistory: MultimodalState[];

  // Persisted state
  baseline: BaselineFusionProfile;
  weights: ModalityWeights;
  correlations: CorrelationMatrix;
  preferences: MultimodalPreferences;
  stats: MultimodalStats;
}

interface MultimodalStoreActions {
  // Runtime actions
  setActive: (active: boolean) => void;
  updateCurrentState: (state: MultimodalState) => void;
  updateSignalQualities: (qualities: SignalQualities) => void;
  addToHistory: (state: MultimodalState) => void;
  clearHistory: () => void;

  // Baseline actions
  updateBaseline: (baseline: BaselineFusionProfile) => void;
  resetBaseline: () => void;

  // Weights actions
  setWeights: (weights: Partial<ModalityWeights>) => void;
  resetWeights: () => void;

  // Correlations actions
  updateCorrelations: (correlations: CorrelationMatrix) => void;

  // Preferences actions
  updatePreferences: (preferences: Partial<MultimodalPreferences>) => void;
  resetPreferences: () => void;

  // Stats actions
  startSession: () => void;
  endSession: () => void;
  incrementCalibrationCount: () => void;

  // Export/Import
  exportProfile: () => {
    baseline: BaselineFusionProfile;
    weights: ModalityWeights;
    correlations: CorrelationMatrix;
    preferences: MultimodalPreferences;
  };
  importProfile: (profile: {
    baseline?: BaselineFusionProfile;
    weights?: ModalityWeights;
    correlations?: CorrelationMatrix;
    preferences?: MultimodalPreferences;
  }) => void;
  resetAll: () => void;
}

type MultimodalStore = MultimodalStoreState & MultimodalStoreActions;

// ============================================================================
// DEFAULTS
// ============================================================================

const DEFAULT_PREFERENCES: MultimodalPreferences = {
  autoStart: false,
  showSignalQuality: true,
  coherenceAlertThreshold: 0.3,
  audioFeedbackEnabled: false,
  visualFeedbackEnabled: true,
};

const DEFAULT_SIGNAL_QUALITIES: SignalQualities = {
  vision: 0,
  voice: 0,
  text: 0,
};

const DEFAULT_CORRELATIONS: CorrelationMatrix = {
  visionVoice: 0.5,
  visionText: 0.5,
  voiceText: 0.5,
  allThree: 0.5,
};

const DEFAULT_STATS: MultimodalStats = {
  totalSessions: 0,
  totalAnalysisTime: 0,
  lastSessionStart: null,
  calibrationCount: 0,
};

// ============================================================================
// STORE
// ============================================================================

export const useMultimodalStore = create<MultimodalStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        isActive: false,
        currentState: null,
        signalQualities: { ...DEFAULT_SIGNAL_QUALITIES },
        recentHistory: [],

        baseline: getDefaultBaselineFusionProfile(),
        weights: getDefaultModalityWeights(),
        correlations: { ...DEFAULT_CORRELATIONS },
        preferences: { ...DEFAULT_PREFERENCES },
        stats: { ...DEFAULT_STATS },

        // Runtime actions
        setActive: active => set({ isActive: active }, false, 'setActive'),

        updateCurrentState: state =>
          set({ currentState: state }, false, 'updateCurrentState'),

        updateSignalQualities: qualities =>
          set({ signalQualities: qualities }, false, 'updateSignalQualities'),

        addToHistory: state =>
          set(
            prev => {
              const newHistory = [...prev.recentHistory, state];
              if (newHistory.length > 100) newHistory.shift();
              return { recentHistory: newHistory };
            },
            false,
            'addToHistory'
          ),

        clearHistory: () => set({ recentHistory: [] }, false, 'clearHistory'),

        // Baseline actions
        updateBaseline: baseline =>
          set(
            { baseline: { ...baseline, lastUpdated: Date.now() } },
            false,
            'updateBaseline'
          ),

        resetBaseline: () =>
          set({ baseline: getDefaultBaselineFusionProfile() }, false, 'resetBaseline'),

        // Weights actions
        setWeights: newWeights =>
          set(
            prev => {
              const merged = { ...prev.weights, ...newWeights };
              const total = merged.vision + merged.voice + merged.text;
              if (total > 0) {
                merged.vision /= total;
                merged.voice /= total;
                merged.text /= total;
              }
              return { weights: merged };
            },
            false,
            'setWeights'
          ),

        resetWeights: () =>
          set({ weights: getDefaultModalityWeights() }, false, 'resetWeights'),

        // Correlations actions
        updateCorrelations: correlations =>
          set({ correlations }, false, 'updateCorrelations'),

        // Preferences actions
        updatePreferences: newPrefs =>
          set(
            prev => ({
              preferences: { ...prev.preferences, ...newPrefs },
            }),
            false,
            'updatePreferences'
          ),

        resetPreferences: () =>
          set({ preferences: { ...DEFAULT_PREFERENCES } }, false, 'resetPreferences'),

        // Stats actions
        startSession: () =>
          set(
            prev => ({
              stats: {
                ...prev.stats,
                totalSessions: prev.stats.totalSessions + 1,
                lastSessionStart: Date.now(),
              },
            }),
            false,
            'startSession'
          ),

        endSession: () =>
          set(
            prev => {
              const sessionTime = prev.stats.lastSessionStart
                ? Date.now() - prev.stats.lastSessionStart
                : 0;
              return {
                stats: {
                  ...prev.stats,
                  totalAnalysisTime: prev.stats.totalAnalysisTime + sessionTime,
                  lastSessionStart: null,
                },
              };
            },
            false,
            'endSession'
          ),

        incrementCalibrationCount: () =>
          set(
            prev => ({
              stats: {
                ...prev.stats,
                calibrationCount: prev.stats.calibrationCount + 1,
              },
            }),
            false,
            'incrementCalibrationCount'
          ),

        // Export/Import
        exportProfile: () => {
          const state = get();
          return {
            baseline: state.baseline,
            weights: state.weights,
            correlations: state.correlations,
            preferences: state.preferences,
          };
        },

        importProfile: profile =>
          set(
            prev => ({
              baseline: profile.baseline ?? prev.baseline,
              weights: profile.weights ?? prev.weights,
              correlations: profile.correlations ?? prev.correlations,
              preferences: profile.preferences ?? prev.preferences,
            }),
            false,
            'importProfile'
          ),

        resetAll: () =>
          set(
            {
              isActive: false,
              currentState: null,
              signalQualities: { ...DEFAULT_SIGNAL_QUALITIES },
              recentHistory: [],
              baseline: getDefaultBaselineFusionProfile(),
              weights: getDefaultModalityWeights(),
              correlations: { ...DEFAULT_CORRELATIONS },
              preferences: { ...DEFAULT_PREFERENCES },
              stats: { ...DEFAULT_STATS },
            },
            false,
            'resetAll'
          ),
      }),
      {
        name: 'titane-multimodal-store',
        version: 1,
        partialize: state => ({
          baseline: state.baseline,
          weights: state.weights,
          correlations: state.correlations,
          preferences: state.preferences,
          stats: state.stats,
        }),
      }
    ),
    { name: 'MultimodalStore' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectIsActive = (state: MultimodalStore) => state.isActive;
export const selectCurrentState = (state: MultimodalStore) => state.currentState;
export const selectBaseline = (state: MultimodalStore) => state.baseline;
export const selectWeights = (state: MultimodalStore) => state.weights;
export const selectCorrelations = (state: MultimodalStore) => state.correlations;
export const selectPreferences = (state: MultimodalStore) => state.preferences;
export const selectStats = (state: MultimodalStore) => state.stats;
export const selectSignalQualities = (state: MultimodalStore) => state.signalQualities;

export const selectDominantModality = (state: MultimodalStore): ModalityOrigin => {
  const q = state.signalQualities;
  if (q.vision >= q.voice && q.vision >= q.text) return 'vision';
  if (q.voice >= q.text) return 'voice';
  return 'text';
};

export const selectOverallConfidence = (state: MultimodalStore) => {
  return state.currentState?.overallConfidence ?? 0;
};

// ============================================================================
// EXPORT
// ============================================================================

export default useMultimodalStore;
