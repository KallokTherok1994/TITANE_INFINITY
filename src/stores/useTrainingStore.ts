/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  TITANE INFINITY — Training Baseline Store v∞.2                           ║
 * ║  Zustand Store for Training Baseline Engine                               ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║  Gère l'état de l'entraînement personnalisé utilisateur                   ║
 * ║  100% local • Éthique • Privé                                             ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  UserStateLabel,
  TrainingSession,
  TrainingBaselineProfile,
  StateSignature,
} from '@/types/trainingBaseline';
import { getDefaultTrainingBaselineProfile } from '@/types/trainingBaseline';
// REMOVED: engines/training supprimé en PHASE 1 (OPTION B)
import { TrainingBaselineEngine, TRAINING_CONFIG } from '@/engines/training/_stubs';

// ============================================================================
// TYPES DU STORE
// ============================================================================

export interface TrainingProgress {
  currentFrames: number;
  targetDurationMs: number;
  percentage: number;
}

export interface TrainingStoreState {
  // === État de la session ===
  isSessionActive: boolean;
  currentSessionLabel: UserStateLabel | null;
  sessionStartTime: number | null;
  sessionProgress: TrainingProgress | null;

  // === Profil de baseline ===
  baselineProfile: TrainingBaselineProfile;

  // === Feedback UI ===
  lastCaptureTime: number | null;
  lastCaptureSuccess: boolean;
  captureCount: number;

  // === Statut système ===
  isProcessing: boolean;
  lastError: string | null;

  // === Préférences ===
  autoSaveEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface TrainingStoreActions {
  // === Actions de session ===
  startSession: (label: UserStateLabel) => Promise<boolean>;
  stopSession: () => TrainingSession | null;

  // === Actions de profil ===
  loadProfile: () => void;
  resetProfile: () => void;
  exportProfile: () => TrainingBaselineProfile;
  importProfile: (profile: TrainingBaselineProfile) => boolean;

  // === Actions de mise à jour ===
  updateProgress: () => void;
  syncFromEngine: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // === Préférences ===
  setAutoSave: (enabled: boolean) => void;
  setNotifications: (enabled: boolean) => void;
}

export type TrainingStore = TrainingStoreState & TrainingStoreActions;

// ============================================================================
// ÉTAT INITIAL
// ============================================================================

const initialState: TrainingStoreState = {
  // Session
  isSessionActive: false,
  currentSessionLabel: null,
  sessionStartTime: null,
  sessionProgress: null,

  // Profil
  baselineProfile: getDefaultTrainingBaselineProfile(),

  // Feedback
  lastCaptureTime: null,
  lastCaptureSuccess: false,
  captureCount: 0,

  // Système
  isProcessing: false,
  lastError: null,

  // Préférences
  autoSaveEnabled: true,
  notificationsEnabled: true,
};

// ============================================================================
// STORE ZUSTAND
// ============================================================================

export const useTrainingStore = create<TrainingStore>()(
  devtools(
    persist(
      (set, get) => {
        // Instance du moteur
        let engine: TrainingBaselineEngine | null = null;

        const getEngine = (): TrainingBaselineEngine => {
          if (!engine) {
            engine = TrainingBaselineEngine.getInstance();
          }
          return engine;
        };

        return {
          // État initial
          ...initialState,

          // ================================================================
          // ACTIONS DE SESSION
          // ================================================================

          startSession: async (label: UserStateLabel): Promise<boolean> => {
            const currentState = get();

            if (currentState.isSessionActive) {
              set({ lastError: 'Une session est déjà en cours' });
              return false;
            }

            set({ isProcessing: true, lastError: null });

            try {
              const session = await getEngine().startTrainingCapture(
                TRAINING_CONFIG.defaultCaptureDuration
              );

              set({
                isSessionActive: true,
                currentSessionLabel: label,
                sessionStartTime: session.startedAt,
                sessionProgress: {
                  currentFrames: 0,
                  targetDurationMs: session.targetDurationMs,
                  percentage: 0,
                },
                isProcessing: false,
              });

              return true;
            } catch (error) {
              set({
                isProcessing: false,
                lastError: (error as Error).message,
              });
              return false;
            }
          },

          stopSession: (): TrainingSession | null => {
            const currentState = get();

            if (!currentState.isSessionActive) {
              return null;
            }

            const session = getEngine().getCurrentSession();

            // Annuler la capture
            getEngine().cancelCapture();

            // Mettre à jour le profil
            const profile = getEngine().getProfile();

            set({
              isSessionActive: false,
              currentSessionLabel: null,
              sessionStartTime: null,
              sessionProgress: null,
              baselineProfile: profile,
              isProcessing: false,
            });

            return session;
          },

          // ================================================================
          // ACTIONS DE PROFIL
          // ================================================================

          loadProfile: (): void => {
            try {
              const profile = getEngine().getProfile();
              set({ baselineProfile: profile, lastError: null });
            } catch (error) {
              set({ lastError: (error as Error).message });
            }
          },

          resetProfile: (): void => {
            // Réinitialiser localement
            set({
              baselineProfile: getDefaultTrainingBaselineProfile(),
              captureCount: 0,
              lastCaptureTime: null,
              lastError: null,
            });
          },

          exportProfile: (): TrainingBaselineProfile => {
            return get().baselineProfile;
          },

          importProfile: (profile: TrainingBaselineProfile): boolean => {
            try {
              // Validation basique
              if (
                !profile.stateSignatures ||
                typeof profile.profileConfidence !== 'number'
              ) {
                set({ lastError: 'Format de profil invalide' });
                return false;
              }

              set({
                baselineProfile: profile,
                lastError: null,
              });

              return true;
            } catch (error) {
              set({ lastError: (error as Error).message });
              return false;
            }
          },

          // ================================================================
          // ACTIONS DE MISE À JOUR
          // ================================================================

          updateProgress: (): void => {
            const session = getEngine().getCurrentSession();
            if (session) {
              set({
                sessionProgress: {
                  currentFrames: session.framesCollected,
                  targetDurationMs: session.targetDurationMs,
                  percentage: session.progress,
                },
              });
            }
          },

          syncFromEngine: (): void => {
            const session = getEngine().getCurrentSession();
            const profile = getEngine().getProfile();

            set({
              isSessionActive: session !== null,
              currentSessionLabel: session?.targetLabel ?? null,
              sessionStartTime: session?.startedAt ?? null,
              sessionProgress: session
                ? {
                    currentFrames: session.framesCollected,
                    targetDurationMs: session.targetDurationMs,
                    percentage: session.progress,
                  }
                : null,
              baselineProfile: profile,
            });
          },

          setError: (error: string | null): void => {
            set({ lastError: error });
          },

          clearError: (): void => {
            set({ lastError: null });
          },

          // ================================================================
          // PRÉFÉRENCES
          // ================================================================

          setAutoSave: (enabled: boolean): void => {
            set({ autoSaveEnabled: enabled });
          },

          setNotifications: (enabled: boolean): void => {
            set({ notificationsEnabled: enabled });
          },
        };
      },
      {
        name: 'titane-training-store',
        partialize: state => ({
          // Persister uniquement le profil et les préférences
          baselineProfile: state.baselineProfile,
          autoSaveEnabled: state.autoSaveEnabled,
          notificationsEnabled: state.notificationsEnabled,
          captureCount: state.captureCount,
        }),
      }
    ),
    { name: 'TrainingStore' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

/**
 * Sélecteur pour l'état de session
 */
export const selectSessionState = (state: TrainingStore) => ({
  isActive: state.isSessionActive,
  label: state.currentSessionLabel,
  startTime: state.sessionStartTime,
  progress: state.sessionProgress,
});

/**
 * Sélecteur pour le profil de baseline
 */
export const selectBaselineProfile = (state: TrainingStore) => state.baselineProfile;

/**
 * Sélecteur pour la progression
 */
export const selectProgress = (state: TrainingStore) => state.sessionProgress;

/**
 * Sélecteur pour le feedback UI
 */
export const selectCaptureFeedback = (state: TrainingStore) => ({
  lastTime: state.lastCaptureTime,
  success: state.lastCaptureSuccess,
  count: state.captureCount,
});

/**
 * Sélecteur pour les états entraînés
 */
export const selectTrainedLabels = (state: TrainingStore): UserStateLabel[] => {
  return Object.keys(state.baselineProfile.stateSignatures) as UserStateLabel[];
};

/**
 * Sélecteur pour la signature d'un état
 */
export const selectSignature =
  (label: UserStateLabel) =>
  (state: TrainingStore): StateSignature | null => {
    return state.baselineProfile.stateSignatures[label] ?? null;
  };

/**
 * Sélecteur pour la confiance globale
 */
export const selectGlobalConfidence = (state: TrainingStore): number => {
  return state.baselineProfile.profileConfidence;
};

/**
 * Sélecteur pour le nombre total d'échantillons
 */
export const selectTotalSamples = (state: TrainingStore): number => {
  return state.baselineProfile.totalSamplesCount;
};

/**
 * Sélecteur pour vérifier si un état est entraîné
 */
export const selectIsLabelTrained =
  (label: UserStateLabel) =>
  (state: TrainingStore): boolean => {
    return label in state.baselineProfile.stateSignatures;
  };

/**
 * Sélecteur pour le statut système
 */
export const selectSystemStatus = (state: TrainingStore) => ({
  isProcessing: state.isProcessing,
  error: state.lastError,
});

// ============================================================================
// HOOKS UTILITAIRES
// ============================================================================

/**
 * Hook pour les actions de training
 */
export const useTrainingActions = () => {
  const store = useTrainingStore();
  return {
    startSession: store.startSession,
    stopSession: store.stopSession,
    loadProfile: store.loadProfile,
    resetProfile: store.resetProfile,
    exportProfile: store.exportProfile,
    importProfile: store.importProfile,
    clearError: store.clearError,
    syncFromEngine: store.syncFromEngine,
  };
};

/**
 * Hook pour l'état de session
 */
export const useTrainingSession = () => {
  return useTrainingStore(selectSessionState);
};

/**
 * Hook pour le profil de baseline
 */
export const useBaselineProfile = () => {
  return useTrainingStore(selectBaselineProfile);
};

/**
 * Hook pour le feedback de capture
 */
export const useCaptureFeedback = () => {
  return useTrainingStore(selectCaptureFeedback);
};

/**
 * Hook pour le statut système
 */
export const useTrainingStatus = () => {
  return useTrainingStore(selectSystemStatus);
};
