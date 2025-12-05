/**
 * TITANE∞ vΩ∞ — VISION INPUT ENGINE
 * Super Prompt #9: Gestion caméra + permissions
 *
 * Responsabilités:
 * - Gestion permissions (Tauri capability + OS + utilisateur)
 * - Accès caméra via getUserMedia
 * - Sélection device
 * - Start/Stop flux vidéo
 * - Calcul FPS
 *
 * ⚠️ PRIVACY: Le flux vidéo ne quitte JAMAIS la machine.
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  VisionInputState,
  VisionError,
  VisionErrorCode,
  CameraPermissionStatus,
  VisionConfig,
} from '@/types/visionAffect';

import {
  getDefaultVisionInputState,
} from '@/types/visionAffect';

import {
  CAMERA_RESOLUTIONS,
  PERFORMANCE_BUDGETS,
} from '@/config/visionAffect.config';

// ============================================================================
// TYPES INTERNES
// ============================================================================

type VisionStateUpdater = (state: Partial<VisionInputState>) => void;
type ErrorHandler = (error: VisionError) => void;

interface FrameCallback {
  (timestamp: number): void;
}

// ============================================================================
// VISION INPUT ENGINE CLASS
// ============================================================================

/**
 * VisionInputEngine v∞
 *
 * Gère l'accès caméra et les permissions pour TITANE∞.
 * 100% local, opt-in explicite.
 */
export class VisionInputEngine {
  private static instance: VisionInputEngine | null = null;

  // État interne
  private state: VisionInputState;
  private config: VisionConfig;

  // Stream
  private mediaStream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  // Performance tracking
  private frameTimestamps: number[] = [];
  private animationFrameId: number | null = null;

  // Callbacks
  private stateUpdater: VisionStateUpdater | null = null;
  private errorHandler: ErrorHandler | null = null;
  private frameCallbacks: Set<FrameCallback> = new Set();

  // Auto-disable
  private autoDisableTimeout: ReturnType<typeof setTimeout> | null = null;

  private constructor(config: VisionConfig) {
    this.config = config;
    this.state = getDefaultVisionInputState();
    this.state.featureEnabled = config.featureEnabled;
  }

  /**
   * Singleton pattern
   */
  static getInstance(config: VisionConfig): VisionInputEngine {
    if (!VisionInputEngine.instance) {
      VisionInputEngine.instance = new VisionInputEngine(config);
    }
    return VisionInputEngine.instance;
  }

  /**
   * Réinitialise l'instance (pour tests)
   */
  static resetInstance(): void {
    if (VisionInputEngine.instance) {
      VisionInputEngine.instance.cleanup();
      VisionInputEngine.instance = null;
    }
  }

  // ============================================================================
  // CONFIGURATION & CALLBACKS
  // ============================================================================

  /**
   * Configure le callback de mise à jour d'état
   */
  setStateUpdater(updater: VisionStateUpdater): void {
    this.stateUpdater = updater;
  }

  /**
   * Configure le handler d'erreurs
   */
  setErrorHandler(handler: ErrorHandler): void {
    this.errorHandler = handler;
  }

  /**
   * Ajoute un callback appelé à chaque frame
   */
  addFrameCallback(callback: FrameCallback): void {
    this.frameCallbacks.add(callback);
  }

  /**
   * Retire un callback de frame
   */
  removeFrameCallback(callback: FrameCallback): void {
    this.frameCallbacks.delete(callback);
  }

  /**
   * Met à jour la configuration
   */
  updateConfig(newConfig: Partial<VisionConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Si feature désactivée, arrêter tout
    if (!this.config.featureEnabled && this.state.cameraEnabled) {
      this.stopCameraStream();
    }
  }

  // ============================================================================
  // PERMISSIONS
  // ============================================================================

  /**
   * Vérifie le statut des permissions caméra
   */
  async checkPermissionStatus(): Promise<CameraPermissionStatus> {
    try {
      // Vérifier si l'API est disponible
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.updateState({ permissionStatus: 'unavailable' });
        return 'unavailable';
      }

      // Utiliser l'API Permissions si disponible
      if (navigator.permissions) {
        try {
          const result = await navigator.permissions.query({
            name: 'camera' as PermissionName,
          });

          const status = this.mapPermissionState(result.state);
          this.updateState({ permissionStatus: status });

          // Écouter les changements
          result.onchange = () => {
            const newStatus = this.mapPermissionState(result.state);
            this.updateState({ permissionStatus: newStatus });
          };

          return status;
        } catch {
          // Permissions API pas supportée pour camera, c'est OK
        }
      }

      // Par défaut, on ne sait pas
      return 'unknown';
    } catch (error) {
      console.warn('[VisionInputEngine] Error checking permissions:', error);
      return 'unknown';
    }
  }

  /**
   * Demande la permission caméra à l'OS
   */
  async requestCameraPermission(): Promise<CameraPermissionStatus> {
    if (!this.config.featureEnabled) {
      console.warn('[VisionInputEngine] Feature not enabled, cannot request permission');
      return 'denied';
    }

    this.updateState({ permissionStatus: 'pending' });

    try {
      // La demande de permission passe par getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: CAMERA_RESOLUTIONS[this.config.resolution].width },
          height: { ideal: CAMERA_RESOLUTIONS[this.config.resolution].height },
        },
        audio: false, // Pas besoin d'audio
      });

      // Permission accordée ! Arrêter le stream temporaire
      stream.getTracks().forEach(track => track.stop());

      this.updateState({
        permissionStatus: 'granted',
        osPermissionGranted: true,
      });

      // Lister les devices disponibles
      await this.listCameraDevices();

      return 'granted';
    } catch (error) {
      const visionError = this.handleMediaError(error);
      this.updateState({
        permissionStatus: visionError.code === 'PERMISSION_DENIED' ? 'denied' : 'unknown',
        osPermissionGranted: false,
        lastError: visionError,
      });

      return 'denied';
    }
  }

  /**
   * Liste les caméras disponibles
   */
  async listCameraDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');

      this.updateState({ availableDevices: cameras });

      // Sélectionner la première caméra si aucune sélectionnée
      if (!this.state.selectedDeviceId && cameras.length > 0) {
        this.updateState({ selectedDeviceId: cameras[0].deviceId });
      }

      return cameras;
    } catch (error) {
      console.error('[VisionInputEngine] Error listing devices:', error);
      return [];
    }
  }

  /**
   * Sélectionne une caméra spécifique
   */
  selectCamera(deviceId: string): void {
    const device = this.state.availableDevices.find(d => d.deviceId === deviceId);
    if (device) {
      this.updateState({ selectedDeviceId: deviceId });

      // Redémarrer le stream si actif
      if (this.state.streamActive && this.videoElement) {
        this.restartStream();
      }
    }
  }

  // ============================================================================
  // STREAM MANAGEMENT
  // ============================================================================

  /**
   * Démarre le flux caméra
   */
  async startCameraStream(videoElement: HTMLVideoElement): Promise<boolean> {
    // Vérifications préalables
    if (!this.config.featureEnabled) {
      console.warn('[VisionInputEngine] Feature not enabled');
      return false;
    }

    if (this.state.permissionStatus !== 'granted') {
      const status = await this.requestCameraPermission();
      if (status !== 'granted') {
        return false;
      }
    }

    try {
      this.videoElement = videoElement;

      // Configuration du stream
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: this.state.selectedDeviceId
            ? { exact: this.state.selectedDeviceId }
            : undefined,
          width: { ideal: CAMERA_RESOLUTIONS[this.config.resolution].width },
          height: { ideal: CAMERA_RESOLUTIONS[this.config.resolution].height },
          frameRate: { ideal: this.config.targetFps },
        },
        audio: false,
      };

      // Obtenir le stream
      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Attacher au video element
      videoElement.srcObject = this.mediaStream;
      await videoElement.play();

      // Mettre à jour l'état
      this.updateState({
        cameraEnabled: true,
        streamActive: true,
        lastError: undefined,
      });

      // Démarrer le tracking FPS
      this.startFpsTracking();

      // Configurer auto-disable si défini
      if (this.config.autoDisableAfterMs) {
        this.setupAutoDisable(this.config.autoDisableAfterMs);
      }

      console.log('[VisionInputEngine] Camera stream started');
      return true;
    } catch (error) {
      const visionError = this.handleMediaError(error);
      this.updateState({
        streamActive: false,
        lastError: visionError,
      });

      this.emitError(visionError);
      return false;
    }
  }

  /**
   * Arrête le flux caméra
   */
  stopCameraStream(): void {
    // Arrêter le stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    // Nettoyer le video element
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }

    // Arrêter le tracking FPS
    this.stopFpsTracking();

    // Annuler auto-disable
    if (this.autoDisableTimeout) {
      clearTimeout(this.autoDisableTimeout);
      this.autoDisableTimeout = null;
    }

    // Mettre à jour l'état
    this.updateState({
      cameraEnabled: false,
      streamActive: false,
      fpsEstimate: 0,
    });

    console.log('[VisionInputEngine] Camera stream stopped');
  }

  /**
   * Redémarre le stream (changement de device)
   */
  private async restartStream(): Promise<void> {
    if (this.videoElement) {
      const videoEl = this.videoElement;
      this.stopCameraStream();
      await this.startCameraStream(videoEl);
    }
  }

  // ============================================================================
  // FEATURE TOGGLE
  // ============================================================================

  /**
   * Active la feature vision (opt-in explicite)
   */
  enableVisionFeature(): void {
    this.config.featureEnabled = true;
    this.updateState({ featureEnabled: true });
    console.log('[VisionInputEngine] Vision feature ENABLED (opt-in)');
  }

  /**
   * Désactive la feature vision
   */
  disableVisionFeature(): void {
    // Arrêter le stream si actif
    if (this.state.streamActive) {
      this.stopCameraStream();
    }

    this.config.featureEnabled = false;
    this.updateState({ featureEnabled: false });
    console.log('[VisionInputEngine] Vision feature DISABLED');
  }

  // ============================================================================
  // FPS TRACKING
  // ============================================================================

  /**
   * Démarre le tracking FPS
   */
  private startFpsTracking(): void {
    this.frameTimestamps = [];

    const trackFrame = (timestamp: number) => {
      if (!this.state.streamActive) return;

      // Ajouter timestamp
      this.frameTimestamps.push(timestamp);

      // Garder seulement les N dernières frames
      const bufferSize = PERFORMANCE_BUDGETS.landmarkBufferSize;
      if (this.frameTimestamps.length > bufferSize) {
        this.frameTimestamps.shift();
      }

      // Calculer FPS
      const fps = this.calculateFps();
      this.updateState({
        fpsEstimate: fps,
        lastFrameTimestamp: timestamp,
        framesProcessed: this.state.framesProcessed + 1,
      });

      // Notifier les callbacks
      this.frameCallbacks.forEach(cb => cb(timestamp));

      // Continuer
      this.animationFrameId = requestAnimationFrame(trackFrame);
    };

    this.animationFrameId = requestAnimationFrame(trackFrame);
  }

  /**
   * Arrête le tracking FPS
   */
  private stopFpsTracking(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.frameTimestamps = [];
  }

  /**
   * Calcule le FPS actuel
   */
  private calculateFps(): number {
    if (this.frameTimestamps.length < 2) return 0;

    const first = this.frameTimestamps[0];
    const last = this.frameTimestamps[this.frameTimestamps.length - 1];
    const duration = (last - first) / 1000; // En secondes

    if (duration <= 0) return 0;

    return Math.round((this.frameTimestamps.length - 1) / duration);
  }

  // ============================================================================
  // AUTO-DISABLE
  // ============================================================================

  /**
   * Configure l'auto-désactivation après une durée
   */
  private setupAutoDisable(durationMs: number): void {
    if (this.autoDisableTimeout) {
      clearTimeout(this.autoDisableTimeout);
    }

    this.autoDisableTimeout = setTimeout(() => {
      console.log('[VisionInputEngine] Auto-disabling after timeout');
      this.stopCameraStream();
    }, durationMs);
  }

  /**
   * Prolonge la session d'observation
   */
  extendSession(additionalMs: number): void {
    if (this.autoDisableTimeout && this.state.streamActive) {
      clearTimeout(this.autoDisableTimeout);
      this.setupAutoDisable(additionalMs);
      console.log(`[VisionInputEngine] Session extended by ${additionalMs}ms`);
    }
  }

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  /**
   * Convertit une erreur MediaDevices en VisionError
   */
  private handleMediaError(error: unknown): VisionError {
    let code: VisionErrorCode = 'UNKNOWN';
    let message = 'Unknown error';
    let recoverable = true;

    if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          code = 'PERMISSION_DENIED';
          message = 'Camera permission denied by user or system';
          recoverable = false;
          break;

        case 'NotFoundError':
        case 'DevicesNotFoundError':
          code = 'DEVICE_NOT_FOUND';
          message = 'No camera device found';
          recoverable = false;
          break;

        case 'NotReadableError':
        case 'TrackStartError':
          code = 'STREAM_ERROR';
          message = 'Camera is in use by another application';
          recoverable = true;
          break;

        case 'OverconstrainedError':
          code = 'STREAM_ERROR';
          message = 'Camera does not support requested resolution';
          recoverable = true;
          break;

        default:
          message = error.message || 'Media error occurred';
      }
    } else if (error instanceof Error) {
      message = error.message;
    }

    return {
      code,
      message,
      timestamp: Date.now(),
      recoverable,
    };
  }

  /**
   * Émet une erreur via le handler
   */
  private emitError(error: VisionError): void {
    if (this.errorHandler) {
      this.errorHandler(error);
    }
    console.error('[VisionInputEngine] Error:', error);
  }

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /**
   * Met à jour l'état et notifie
   */
  private updateState(partial: Partial<VisionInputState>): void {
    this.state = { ...this.state, ...partial };

    if (this.stateUpdater) {
      this.stateUpdater(partial);
    }
  }

  /**
   * Retourne l'état actuel
   */
  getState(): VisionInputState {
    return { ...this.state };
  }

  /**
   * Retourne le video element actif
   */
  getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }

  /**
   * Retourne le stream actif
   */
  getMediaStream(): MediaStream | null {
    return this.mediaStream;
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Mappe l'état de permission
   */
  private mapPermissionState(state: PermissionState): CameraPermissionStatus {
    switch (state) {
      case 'granted':
        return 'granted';
      case 'denied':
        return 'denied';
      case 'prompt':
      default:
        return 'unknown';
    }
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /**
   * Nettoie toutes les ressources
   */
  cleanup(): void {
    this.stopCameraStream();
    this.frameCallbacks.clear();
    this.stateUpdater = null;
    this.errorHandler = null;
  }
}

// ============================================================================
// EXPORTS FONCTIONNELS (pour usage simplifié)
// ============================================================================

let engineInstance: VisionInputEngine | null = null;

/**
 * Initialise le VisionInputEngine
 */
export function initVisionInputEngine(config: VisionConfig): VisionInputEngine {
  engineInstance = VisionInputEngine.getInstance(config);
  return engineInstance;
}

/**
 * Récupère l'instance du VisionInputEngine
 */
export function getVisionInputEngine(): VisionInputEngine | null {
  return engineInstance;
}

/**
 * Active la vision (raccourci)
 */
export function enableVision(): void {
  engineInstance?.enableVisionFeature();
}

/**
 * Désactive la vision (raccourci)
 */
export function disableVision(): void {
  engineInstance?.disableVisionFeature();
}

/**
 * Démarre la caméra (raccourci)
 */
export async function startCamera(videoElement: HTMLVideoElement): Promise<boolean> {
  return engineInstance?.startCameraStream(videoElement) ?? false;
}

/**
 * Arrête la caméra (raccourci)
 */
export function stopCamera(): void {
  engineInstance?.stopCameraStream();
}
