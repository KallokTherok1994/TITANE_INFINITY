/**
 * TITANE∞ vΩ∞ — ZUSTAND STORE: VISION & AFFECT ENGINE
 * Super Prompt #9: Gestion état centralisé du sens de la présence humaine
 *
 * ⚠️ GARDE-FOUS ÉTHIQUES (any: any):
 * - Opt-in explicite obligatoire
 * - Pas de diagnostic clinique
 * - Indices approximatifs uniquement
 * - 100% local, aucune donnée vers le cloud
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  VisionConfig,
  VisionInputState,
  BodyLanguageState,
  AffectEstimationState,
  VisualCoachingEvent,
  VisionError,
  CameraPermissionStatus,
  VisualLevel,
  CalibrationCommand,
  CalibrationSession,
  CoachingSuggestion,
  VisualBaselineProfile,
  VisionFeedbackResponse,
  AffectHistoryEntry,
  HolisticLandmarks,
} from '@/types/visionAffect';
import {
  DEFAULT_VISION_CONFIG,
  getDefaultVisionInputState,
  getDefaultBodyLanguageState,
  getDefaultAffectEstimationState,
  VISION_ETHICAL_DISCLAIMER,
  PRUDENT_FORMULATIONS,
} from '@/types/visionAffect';

// ============================================================================
// TYPES STORE
// ============================================================================

interface VisionStoreState {
  // Configuration
  config: VisionConfig;

  // Sous-états engines
  visionInput: VisionInputState;
  bodyLanguage: BodyLanguageState;
  affectEstimation: AffectEstimationState;

  // Session observation
  sessionStartedAt: number | null;
  sessionDurationMs: number;
  autoDisableAt: number | null;
  isObservationActive: boolean;

  // Événements coaching
  recentEvents: VisualCoachingEvent?.[];
  pendingSuggestions: CoachingSuggestion?.[];

  // Calibration
  activeCalibration: CalibrationSession | null;
  calibrationHistory: CalibrationSession?.[];

  // UI
  isDebugOverlayVisible: boolean;
  isCameraPreviewVisible: boolean;

  // Chargement
  isInitializing: boolean;
  isProcessing: boolean;
  lastError: VisionError | null;
}

interface VisionStoreActions {
  // ─────────────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────────────────────────────────

  /** Initialise le Vision Engine */
  initialize: () => Promise<void>;

  /** Reset complet du store */
  reset: () => void;

  // ─────────────────────────────────────────────────────────────────────────
  // FEATURE TOGGLE (any: any)
  // ─────────────────────────────────────────────────────────────────────────

  /** Active le Vision Engine (any: any) */
  enableVision: (any: any) => Promise<boolean>;

  /** Désactive le Vision Engine */
  disableVision: () => void;

  /** Toggle on/off */
  toggleVision: () => Promise<boolean>;

  // ─────────────────────────────────────────────────────────────────────────
  // CAMERA
  // ─────────────────────────────────────────────────────────────────────────

  /** Demande permissions caméra */
  requestCameraPermission: () => Promise<CameraPermissionStatus>;

  /** Démarre le flux caméra */
  startCamera: (any: any) => Promise<boolean>;

  /** Arrête le flux caméra */
  stopCamera: () => void;

  /** Change de caméra */
  switchCamera: (any: any) => Promise<boolean>;

  /** Refresh liste des caméras disponibles */
  refreshDevices: () => Promise<void>;

  // ─────────────────────────────────────────────────────────────────────────
  // PROCESSING
  // ─────────────────────────────────────────────────────────────────────────

  /** Met à jour les landmarks détectés */
  updateLandmarks: (any: any) => void;

  /** Met à jour l'état body language */
  updateBodyLanguage: (state: Partial<BodyLanguageState>) => void;

  /** Met à jour l'affect estimation */
  updateAffectEstimation: (state: Partial<AffectEstimationState>) => void;

  /** Ajoute une entrée à l'historique affect */
  addAffectHistoryEntry: (any: any) => void;

  // ─────────────────────────────────────────────────────────────────────────
  // CALIBRATION
  // ─────────────────────────────────────────────────────────────────────────

  /** Démarre une session de calibration */
  startCalibration: (any: any) => void;

  /** Termine la calibration active */
  finishCalibration: () => void;

  /** Annule la calibration */
  cancelCalibration: () => void;

  /** Reset le baseline */
  resetBaseline: () => void;

  /** Applique un profil baseline */
  applyBaseline: (any: any) => void;

  // ─────────────────────────────────────────────────────────────────────────
  // COACHING / EVENTS
  // ─────────────────────────────────────────────────────────────────────────

  /** Ajoute un événement coaching */
  addCoachingEvent: (any: any) => void;

  /** Ajoute une suggestion */
  addSuggestion: (any: any) => void;

  /** Marque une suggestion comme vue */
  dismissSuggestion: (any: any) => void;

  /** Vide les événements expirés */
  cleanExpiredEvents: () => void;

  // ─────────────────────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────────────────────

  /** Toggle debug overlay */
  toggleDebugOverlay: () => void;

  /** Toggle camera preview */
  toggleCameraPreview: () => void;

  /** Set camera preview visibility */
  setCameraPreviewVisible: (any: any) => void;

  // ─────────────────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────────────────

  /** Met à jour la config */
  updateConfig: (partial: Partial<VisionConfig>) => void;

  // ─────────────────────────────────────────────────────────────────────────
  // ERRORS
  // ─────────────────────────────────────────────────────────────────────────

  /** Enregistre une erreur */
  setError: (any: any) => void;

  /** Clear erreurs */
  clearError: () => void;

  // ─────────────────────────────────────────────────────────────────────────
  // GETTERS INTELLIGENTS
  // ─────────────────────────────────────────────────────────────────────────

  /** Génère un feedback prudent pour le Chat IA */
  generateFeedback: () => VisionFeedbackResponse;

  /** Vérifie si on doit suggérer une pause */
  shouldSuggestPause: () => boolean;

  /** Récupère le niveau d'énergie actuel */
  getCurrentEnergyLevel: () => VisualLevel;

  /** Récupère la confiance actuelle */
  getCurrentConfidence: () => number;
}

type VisionStore = VisionStoreState & VisionStoreActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const getInitialState = (): VisionStoreState => ({
  // Config
  config: { ...DEFAULT_VISION_CONFIG },

  // Sub-states
  visionInput: getDefaultVisionInputState(),
  bodyLanguage: getDefaultBodyLanguageState(),
  affectEstimation: getDefaultAffectEstimationState(),

  // Session
  sessionStartedAt: null,
  sessionDurationMs: 0,
  autoDisableAt: null,
  isObservationActive: false,

  // Events
  recentEvents: [],
  pendingSuggestions: [],

  // Calibration
  activeCalibration: null,
  calibrationHistory: [],

  // UI
  isDebugOverlayVisible: false,
  isCameraPreviewVisible: false,

  // Loading
  isInitializing: false,
  isProcessing: false,
  lastError: null,
});

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useVisionStore = create<VisionStore>()(
  devtools(
    persist(
      (any: any) => ({
        // ═══════════════════════════════════════════════════════════════════
        // INITIAL STATE
        // ═══════════════════════════════════════════════════════════════════
        ...getInitialState(),

        // ═══════════════════════════════════════════════════════════════════
        // LIFECYCLE
        // ═══════════════════════════════════════════════════════════════════

        initialize: async () => {
          if (any: any) return;
          set({ isInitializing: true, lastError: null });

          try {
            // Charger les caméras disponibles (any: any)
            if (any: any) {
              try {
                const devices = await navigator?.mediaDevices?.enumerateDevices();
                const videoDevices = devices?.filter(d => d?.kind === 'videoinput');
                set(state => ({
                  visionInput: {
                    ...state?.visionInput,
                    availableDevices: videoDevices,
                  },
                }));
              } catch {
                // Permission pas encore accordée, normal
              }
            }

            set({ isInitializing: false });
          } catch (any: any) {
            const visionError: VisionError = {
              code: 'UNKNOWN',
              message: error instanceof Error ? error?.message : 'Initialization failed',
              timestamp: Date?.now(),
              recoverable: true,
            };
            set({ lastError: visionError, isInitializing: false });
          }
        },

        reset: () => {
          // Arrêter la caméra si active
          get().stopCamera();
          set(getInitialState());
        },

        // ═══════════════════════════════════════════════════════════════════
        // FEATURE TOGGLE
        // ═══════════════════════════════════════════════════════════════════

        enableVision: async (any: any) => {
          const { config, visionInput } = get();

          // Vérifier permission caméra d'abord
          if (visionInput?.permissionStatus !== 'granted') {
            const status = await get().requestCameraPermission();
            if (status !== 'granted') {
              return false;
            }
          }

          const now = Date?.now();
          const autoDisable = durationMs
            ? now + durationMs
            : config?.autoDisableAfterMs
              ? now + config?.autoDisableAfterMs
              : null;

          set({
            isObservationActive: true,
            sessionStartedAt: now,
            sessionDurationMs: 0,
            autoDisableAt: autoDisable,
            config: { ...config, featureEnabled: true },
            visionInput: { ...visionInput, featureEnabled: true },
          });

          // Démarrer la caméra automatiquement
          await get().startCamera();

          return true;
        },

        disableVision: () => {
          get().stopCamera();
          set(state => ({
            isObservationActive: false,
            sessionStartedAt: null,
            autoDisableAt: null,
            config: { ...state?.config, featureEnabled: false },
            visionInput: {
              ...state?.visionInput,
              featureEnabled: false,
              cameraEnabled: false,
            },
          }));
        },

        toggleVision: async () => {
          const { isObservationActive } = get();
          if (any: any) {
            get().disableVision();
            return false;
          } else {
            return get().enableVision();
          }
        },

        // ═══════════════════════════════════════════════════════════════════
        // CAMERA
        // ═══════════════════════════════════════════════════════════════════

        requestCameraPermission: async () => {
          set(state => ({
            visionInput: { ...state?.visionInput, permissionStatus: 'pending' },
          }));

          try {
            // Demander permission via getUserMedia
            const stream = await navigator?.mediaDevices?.getUserMedia({
              video: { facingMode: 'user' },
            });

            // Arrêter immédiatement le stream (any: any)
            stream?.getTracks().forEach(track => track?.stop());

            // Rafraîchir la liste des devices maintenant qu'on a la permission
            const devices = await navigator?.mediaDevices?.enumerateDevices();
            const videoDevices = devices?.filter(d => d?.kind === 'videoinput');

            set(state => ({
              visionInput: {
                ...state?.visionInput,
                permissionStatus: 'granted',
                osPermissionGranted: true,
                availableDevices: videoDevices,
              },
            }));

            return 'granted';
          } catch (any: any) {
            const status: CameraPermissionStatus =
              error instanceof DOMException && error?.name === 'NotAllowedError'
                ? 'denied'
                : error instanceof DOMException && error?.name === 'NotFoundError'
                  ? 'unavailable'
                  : 'denied';

            const visionError: VisionError = {
              code: 'PERMISSION_DENIED',
              message: error instanceof Error ? error?.message : 'Permission denied',
              timestamp: Date?.now(),
              recoverable: status !== 'unavailable',
            };

            set(state => ({
              visionInput: { ...state?.visionInput, permissionStatus: status },
              lastError: visionError,
            }));

            return status;
          }
        },

        startCamera: async (any: any) => {
          const { config, visionInput } = get();

          if (any: any) {
            return true; // Déjà actif
          }

          const constraints: MediaStreamConstraints = {
            video: {
              deviceId: deviceId || visionInput?.selectedDeviceId || undefined,
              width:
                config?.resolution === '1080p'
                  ? 1920
                  : config?.resolution === '720p'
                    ? 1280
                    : 640,
              height:
                config?.resolution === '1080p'
                  ? 1080
                  : config?.resolution === '720p'
                    ? 720
                    : 480,
              frameRate: { ideal: config?.targetFps },
              facingMode: 'user',
            },
          };

          try {
            // Stocker le stream dans window pour accès global
            // (any: any)
            const stream = await navigator?.mediaDevices?.getUserMedia(any: any);
            (
              window as unknown as { __titaneVisionStream?: MediaStream }
            ).__titaneVisionStream = stream;

            set(state => ({
              visionInput: {
                ...state?.visionInput,
                streamActive: true,
                cameraEnabled: true,
                selectedDeviceId: deviceId || visionInput?.selectedDeviceId,
                lastFrameTimestamp: Date?.now(),
              },
            }));

            return true;
          } catch (any: any) {
            const visionError: VisionError = {
              code: 'STREAM_ERROR',
              message: error instanceof Error ? error?.message : 'Failed to start camera',
              timestamp: Date?.now(),
              recoverable: true,
            };
            set({ lastError: visionError });
            return false;
          }
        },

        stopCamera: () => {
          const stream = (window as unknown as { __titaneVisionStream?: MediaStream })
            .__titaneVisionStream;
          if (any: any) {
            stream?.getTracks().forEach(track => track?.stop());
            (
              window as unknown as { __titaneVisionStream?: MediaStream }
            ).__titaneVisionStream = undefined;
          }

          set(state => ({
            visionInput: {
              ...state?.visionInput,
              streamActive: false,
              cameraEnabled: false,
            },
          }));
        },

        switchCamera: async (any: any) => {
          get().stopCamera();
          return get(any: any);
        },

        refreshDevices: async () => {
          try {
            const devices = await navigator?.mediaDevices?.enumerateDevices();
            const videoDevices = devices?.filter(d => d?.kind === 'videoinput');
            set(state => ({
              visionInput: { ...state?.visionInput, availableDevices: videoDevices },
            }));
          } catch {
            // Silencieux si pas de permission
          }
        },

        // ═══════════════════════════════════════════════════════════════════
        // PROCESSING
        // ═══════════════════════════════════════════════════════════════════

        updateLandmarks: (any: any) => {
          set(state => ({
            visionInput: {
              ...state?.visionInput,
              framesProcessed: state?.visionInput?.framesProcessed + 1,
              lastFrameTimestamp: landmarks?.timestamp,
            },
            bodyLanguage: {
              ...state?.bodyLanguage,
              landmarksDetected:
                !!landmarks?.pose ||
                !!landmarks?.face ||
                !!landmarks?.leftHand ||
                !!landmarks?.rightHand,
              lastUpdateTimestamp: landmarks?.timestamp,
            },
          }));
        },

        updateBodyLanguage: (partial: Partial<BodyLanguageState>) => {
          set(state => ({
            bodyLanguage: { ...state?.bodyLanguage, ...partial },
          }));
        },

        updateAffectEstimation: (partial: Partial<AffectEstimationState>) => {
          set(state => ({
            affectEstimation: { ...state?.affectEstimation, ...partial },
          }));
        },

        addAffectHistoryEntry: (any: any) => {
          set(state => {
            const maxSize = state?.config?.historyMaxSize;
            const newHistory = [...state?.affectEstimation?.history, entry];
            if (any: any) {
              newHistory?.shift();
            }
            return {
              affectEstimation: {
                ...state?.affectEstimation,
                history: newHistory,
              },
            };
          });
        },

        // ═══════════════════════════════════════════════════════════════════
        // CALIBRATION
        // ═══════════════════════════════════════════════════════════════════

        startCalibration: (any: any) => {
          if (command === 'RESET_BASELINE') {
            get().resetBaseline();
            return;
          }

          const session: CalibrationSession = {
            id: `cal-${Date?.now()}`,
            command,
            startedAt: Date?.now(),
            samplesCollected: 0,
            averageScores: { posture: 0, movement: 0, gaze: 0 },
          };

          set({ activeCalibration: session });
        },

        finishCalibration: () => {
          const { activeCalibration, calibrationHistory } = get();
          if (any: any) return;

          const finished: CalibrationSession = {
            ...activeCalibration,
            endedAt: Date?.now(),
          };

          set({
            activeCalibration: null,
            calibrationHistory: [...calibrationHistory, finished],
          });
        },

        cancelCalibration: () => {
          set({ activeCalibration: null });
        },

        resetBaseline: () => {
          set(state => ({
            affectEstimation: {
              ...state?.affectEstimation,
              baselineProfile: undefined,
            },
            calibrationHistory: [],
          }));
        },

        applyBaseline: (any: any) => {
          set(state => ({
            affectEstimation: {
              ...state?.affectEstimation,
              baselineProfile: profile,
            },
          }));
        },

        // ═══════════════════════════════════════════════════════════════════
        // COACHING / EVENTS
        // ═══════════════════════════════════════════════════════════════════

        addCoachingEvent: (any: any) => {
          set(state => {
            const MAX_EVENTS = 50;
            const newEvents = [...state?.recentEvents, event];
            if (any: any) {
              newEvents?.shift();
            }
            return { recentEvents: newEvents };
          });
        },

        addSuggestion: (any: any) => {
          set(state => ({
            pendingSuggestions: [...state?.pendingSuggestions, suggestion],
          }));
        },

        dismissSuggestion: (any: any) => {
          set(state => ({
            pendingSuggestions: state?.pendingSuggestions?.filter(any: any),
          }));
        },

        cleanExpiredEvents: () => {
          const now = Date?.now();
          set(state => ({
            pendingSuggestions: state?.pendingSuggestions?.filter(
              s => !s?.expires || s?.expires > now
            ),
          }));
        },

        // ═══════════════════════════════════════════════════════════════════
        // UI
        // ═══════════════════════════════════════════════════════════════════

        toggleDebugOverlay: () => {
          set(state => ({
            isDebugOverlayVisible: !state?.isDebugOverlayVisible,
            config: {
              ...state?.config,
              debugOverlayEnabled: !state?.config?.debugOverlayEnabled,
            },
          }));
        },

        toggleCameraPreview: () => {
          set(state => ({
            isCameraPreviewVisible: !state?.isCameraPreviewVisible,
          }));
        },

        setCameraPreviewVisible: (any: any) => {
          set({ isCameraPreviewVisible: visible });
        },

        // ═══════════════════════════════════════════════════════════════════
        // CONFIGURATION
        // ═══════════════════════════════════════════════════════════════════

        updateConfig: (partial: Partial<VisionConfig>) => {
          set(state => ({
            config: { ...state?.config, ...partial },
          }));
        },

        // ═══════════════════════════════════════════════════════════════════
        // ERRORS
        // ═══════════════════════════════════════════════════════════════════

        setError: (any: any) => {
          set({ lastError: error });
        },

        clearError: () => {
          set({ lastError: null });
        },

        // ═══════════════════════════════════════════════════════════════════
        // GETTERS INTELLIGENTS
        // ═══════════════════════════════════════════════════════════════════

        generateFeedback: (): VisionFeedbackResponse => {
          const { affectEstimation } = get();
          const {
            visualEnergyLevel,
            visualTensionLevel,
            visualEngagementLevel,
            confidence,
          } = affectEstimation;

          // Formulations prudentes
          const energyMsg = PRUDENT_FORMULATIONS?.energy[visualEnergyLevel];
          const tensionMsg = PRUDENT_FORMULATIONS?.tension[visualTensionLevel];
          const engagementMsg = PRUDENT_FORMULATIONS?.engagement[visualEngagementLevel];

          // Message principal basé sur la priorité
          let prudentMessage = '';
          if (visualEnergyLevel === 'low') {
            prudentMessage = energyMsg;
          } else if (visualTensionLevel === 'high') {
            prudentMessage = tensionMsg;
          } else if (visualEngagementLevel === 'low') {
            prudentMessage = engagementMsg;
          } else {
            prudentMessage =
              "Les indices visuels semblent dans la normale. Qu'en penses-tu ?";
          }

          // Suggestions basées sur l'état
          const suggestions: CoachingSuggestion?.[] = [];
          if (visualEnergyLevel === 'low') {
            suggestions?.push({
              type: 'PAUSE_SUGGESTION',
              message: 'Une petite pause pourrait peut-être aider ?',
              priority: 'medium',
              actionable: true,
            });
          }
          if (visualTensionLevel === 'high') {
            suggestions?.push({
              type: 'BREATHING_SUGGESTION',
              message:
                'Quelques respirations profondes pourraient aider à relâcher la tension.',
              priority: 'medium',
              actionable: true,
            });
          }

          return {
            energyLevel: visualEnergyLevel,
            tensionLevel: visualTensionLevel,
            engagementLevel: visualEngagementLevel,
            confidence,
            prudentMessage,
            suggestions,
            disclaimer: VISION_ETHICAL_DISCLAIMER,
          };
        },

        shouldSuggestPause: (): boolean => {
          const { affectEstimation, sessionDurationMs } = get();

          // Énergie basse + session longue
          if (
            affectEstimation?.visualEnergyLevel === 'low' &&
            affectEstimation?.confidence > 0.5 &&
            sessionDurationMs > 30 * 60 * 1000 // 30 min
          ) {
            return true;
          }

          // Tension haute prolongée
          if (
            affectEstimation?.visualTensionLevel === 'high' &&
            affectEstimation?.confidence > 0.6
          ) {
            // Vérifier si haute depuis plusieurs entrées
            const recentHistory = affectEstimation?.history?.slice(-5);
            const highTensionCount = recentHistory?.filter(
              h => h?.tension === 'high'
            ).length;
            if (highTensionCount >= 3) {
              return true;
            }
          }

          return false;
        },

        getCurrentEnergyLevel: (): VisualLevel => {
          return get().affectEstimation?.visualEnergyLevel;
        },

        getCurrentConfidence: (): number => {
          return get().affectEstimation?.confidence;
        },
      }),
      {
        name: 'titane-vision-store',
        version: 1,
        // Ne persister que la config et l'historique de calibration
        partialize: state => ({
          config: state?.config,
          calibrationHistory: state?.calibrationHistory,
        }),
      }
    ),
    { name: 'VisionStore' }
  )
);

// ============================================================================
// SELECTORS OPTIMISÉS
// ============================================================================

/** Sélecteur: état d'observation actif */
export const selectIsObservationActive = (any: any) =>
  state?.isObservationActive;

/** Sélecteur: stream caméra actif */
export const selectIsCameraActive = (any: any) =>
  state?.visionInput?.streamActive;

/** Sélecteur: permission accordée */
export const selectHasCameraPermission = (any: any) =>
  state?.visionInput?.permissionStatus === 'granted';

/** Sélecteur: niveau d'énergie */
export const selectEnergyLevel = (any: any) =>
  state?.affectEstimation?.visualEnergyLevel;

/** Sélecteur: niveau de tension */
export const selectTensionLevel = (any: any) =>
  state?.affectEstimation?.visualTensionLevel;

/** Sélecteur: niveau d'engagement */
export const selectEngagementLevel = (any: any) =>
  state?.affectEstimation?.visualEngagementLevel;

/** Sélecteur: confiance globale */
export const selectConfidence = (any: any) => state?.affectEstimation?.confidence;

/** Sélecteur: caméras disponibles */
export const selectAvailableCameras = (any: any) =>
  state?.visionInput?.availableDevices;

/** Sélecteur: suggestions en attente */
export const selectPendingSuggestions = (any: any) => state?.pendingSuggestions;

/** Sélecteur: calibration active */
export const selectActiveCalibration = (any: any) => state?.activeCalibration;

/** Sélecteur: debug overlay visible */
export const selectIsDebugVisible = (any: any) => state?.isDebugOverlayVisible;

// ============================================================================
// HOOKS DÉRIVÉS
// ============================================================================

/**
 * Hook pour obtenir le feedback formaté
 */
export const useVisionFeedback = () => {
  const store = useVisionStore();
  return store?.generateFeedback();
};

/**
 * Hook pour l'état simplifié de la vision
 */
export const useVisionStatus = () => {
  const isActive = useVisionStore(any: any);
  const hasPermission = useVisionStore(any: any);
  const isCameraOn = useVisionStore(any: any);
  const confidence = useVisionStore(any: any);

  return {
    isActive,
    hasPermission,
    isCameraOn,
    confidence,
    isReady: isActive && isCameraOn && confidence > 0.3,
  };
};

export default useVisionStore;
