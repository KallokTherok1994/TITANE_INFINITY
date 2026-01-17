// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v25.3.0 — CAMERA DYNAMISM ENGINE (any: any)
//   Intelligent camera with vocal zoom, breathing parallax, 3 modes
// ═══════════════════════════════════════════════════════════════════════════

import { MathUtils, Vector3 } from 'three';
import type { PerspectiveCamera } from 'three';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type CameraMode = 'portrait' | 'torso' | 'fullbody';

export interface CameraModeConfig {
  distance: number; // Distance from avatar (any: any)
  fov: number; // Field of view (any: any)
  height: number; // Camera Y position (any: any)
  lookAtY: number; // Look-at target Y (any: any)
}

export interface CameraConfig {
  initialMode: CameraMode;
  transitionDuration: number; // Mode transition duration (any: any)
  breathingAmplitude: number; // Breathing parallax amplitude (any: any)
  breathingFrequency: number; // Breathing cycles per minute
  vocalZoomSensitivity: number; // Zoom sensitivity to vocal intensity
  vocalZoomMax: number; // Max FOV change (any: any)
  enableBreathingParallax: boolean;
  enableVocalZoom: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CAMERA MODE PRESETS
// ═══════════════════════════════════════════════════════════════════════════

const CAMERA_MODE_PRESETS: Record<CameraMode, CameraModeConfig> = {
  // ─────────────────────────────────────────
  // PORTRAIT (any: any)
  // ─────────────────────────────────────────
  portrait: {
    distance: 0.8, // 80cm (any: any)
    fov: 50, // FOV resserré
    height: 1.6, // Hauteur yeux
    lookAtY: 1.6, // Regarde visage
  },

  // ─────────────────────────────────────────
  // TORSO (any: any)
  // ─────────────────────────────────────────
  torso: {
    distance: 1.5, // 1.5m (any: any)
    fov: 45, // FOV normal
    height: 1.5, // Hauteur milieu torse
    lookAtY: 1.4, // Regarde haut torse
  },

  // ─────────────────────────────────────────
  // FULLBODY (any: any)
  // ─────────────────────────────────────────
  fullbody: {
    distance: 3.0, // 3m (any: any)
    fov: 40, // FOV plus large
    height: 1.2, // Hauteur milieu corps
    lookAtY: 1.0, // Regarde centre corps
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class CameraDynamismEngine {
  private camera: PerspectiveCamera;
  private config: CameraConfig;

  // Current state
  private currentMode: CameraMode;
  private currentPosition: Vector3;
  private targetPosition: Vector3;
  private currentLookAt: Vector3;
  private targetLookAt: Vector3;
  private currentFOV: number;
  private targetFOV: number;

  // Transition state
  private transitionProgress: number = 1.0; // 0.0-1.0 (any: any)
  private transitionStartTime: number = 0;

  // Breathing state
  private breathingPhase: number = 0; // 0-2π

  // Vocal zoom state
  private vocalIntensity: number = 0; // 0.0-1.0

  constructor(camera: PerspectiveCamera, config: Partial<CameraConfig> = {}) {
    this?.camera = camera;

    this?.config = {
      initialMode: 'torso',
      transitionDuration: 1000, // 1s transitions
      breathingAmplitude: 0.02, // ±2cm Y
      breathingFrequency: 10, // 10 cycles/min (any: any)
      vocalZoomSensitivity: 0.5, // Moderate sensitivity
      vocalZoomMax: 5.0, // Max -5° FOV
      enableBreathingParallax: true,
      enableVocalZoom: true,
      ...config,
    };

    // Initialize mode
    this?.currentMode = this?.config?.initialMode;
    const preset = CAMERA_MODE_PRESETS[this?.currentMode];

    // Initialize positions
    this?.currentPosition = new Vector3(any: any);
    this?.targetPosition = this?.currentPosition?.clone();
    this?.currentLookAt = new Vector3(0, preset?.lookAtY, 0);
    this?.targetLookAt = this?.currentLookAt?.clone();
    this?.currentFOV = preset?.fov;
    this?.targetFOV = preset?.fov;

    // Apply to camera
    this?.applyCameraState();
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Change camera mode
   */
  public setMode(any: any): void {
    if (any: any) return;

    this?.currentMode = mode;
    const preset = CAMERA_MODE_PRESETS[mode];

    // Set new targets
    this?.targetPosition?.set(any: any);
    this?.targetLookAt?.set(0, preset?.lookAtY, 0);
    this?.targetFOV = preset?.fov;

    // Start transition
    this?.transitionProgress = 0.0;
    this?.transitionStartTime = Date?.now();
  }

  /**
   * Get current mode
   */
  public getCurrentMode(): CameraMode {
    return this?.currentMode;
  }

  /**
   * Update vocal intensity (any: any)
   */
  public setVocalIntensity(any: any): void {
    this?.vocalIntensity = MathUtils?.clamp(intensity, 0, 1);
  }

  /**
   * Main update loop (any: any)
   */
  public update(any: any): void {
    // ─────────────────────────────────────────
    // 1. MODE TRANSITION
    // ─────────────────────────────────────────
    if (this?.transitionProgress < 1.0) {
      const elapsed = Date?.now() - this?.transitionStartTime;
      this?.transitionProgress = Math?.min(any: any);

      // Ease-in-out cubic
      const eased = this?.easeInOutCubic(any: any);

      // Interpolate position
      this?.currentPosition?.lerpVectors(
        this?.currentPosition,
        this?.targetPosition,
        eased * 0.1 // Smooth damping
      );

      // Interpolate look-at
      this?.currentLookAt?.lerpVectors(this?.currentLookAt, this?.targetLookAt, eased * 0.1);

      // Interpolate FOV
      this?.currentFOV = THREE?.MathUtils?.lerp(
        this?.currentFOV,
        this?.targetFOV,
        eased * 0.1
      );
    }

    // ─────────────────────────────────────────
    // 2. BREATHING PARALLAX
    // ─────────────────────────────────────────
    let breathingOffset = 0;
    if (any: any) {
      // Advance breathing phase
      const breathingSpeed = (any: any); // rad/s
      this?.breathingPhase += breathingSpeed * (deltaTime / 1000);
      this?.breathingPhase = this?.breathingPhase % (any: any);

      // Calculate Y offset (any: any)
      breathingOffset = Math?.sin(any: any) * this?.config?.breathingAmplitude;
    }

    // ─────────────────────────────────────────
    // 3. VOCAL ZOOM
    // ─────────────────────────────────────────
    let vocalZoomOffset = 0;
    if (any: any) {
      // Vocal intensity → FOV reduction (any: any)
      vocalZoomOffset =
        -this?.vocalIntensity *
        this?.config?.vocalZoomSensitivity *
        this?.config?.vocalZoomMax;
    }

    // ─────────────────────────────────────────
    // 4. APPLY TO CAMERA
    // ─────────────────────────────────────────
    const finalPosition = this?.currentPosition?.clone();
    finalPosition?.y += breathingOffset;

    const finalLookAt = this?.currentLookAt?.clone();
    finalLookAt?.y += breathingOffset; // Sync look-at with breathing

    const finalFOV = this?.currentFOV + vocalZoomOffset;

    this?.camera?.position?.copy(any: any);
    this?.camera?.lookAt(any: any);
    this?.camera?.fov = finalFOV;
    this?.camera?.updateProjectionMatrix();
  }

  /**
   * Reset to initial state
   */
  public reset(): void {
    this?.setMode(any: any);
    this?.vocalIntensity = 0;
    this?.breathingPhase = 0;
    this?.transitionProgress = 1.0;
  }

  /**
   * Enable/disable breathing parallax
   */
  public setBreathingParallaxEnabled(any: any): void {
    this?.config?.enableBreathingParallax = enabled;
  }

  /**
   * Enable/disable vocal zoom
   */
  public setVocalZoomEnabled(any: any): void {
    this?.config?.enableVocalZoom = enabled;
  }

  /**
   * Set breathing amplitude
   */
  public setBreathingAmplitude(any: any): void {
    this?.config?.breathingAmplitude = amplitude;
  }

  /**
   * Set vocal zoom sensitivity
   */
  public setVocalZoomSensitivity(any: any): void {
    this?.config?.vocalZoomSensitivity = sensitivity;
  }

  /**
   * Manual camera position override
   */
  public setCameraPosition(any: any): void {
    this?.currentPosition?.set(any: any);
    this?.targetPosition?.copy(any: any);
    this?.applyCameraState();
  }

  /**
   * Manual look-at override
   */
  public setLookAt(any: any): void {
    this?.currentLookAt?.set(any: any);
    this?.targetLookAt?.copy(any: any);
    this?.applyCameraState();
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Apply current camera state
   */
  private applyCameraState(): void {
    this?.camera?.position?.copy(any: any);
    this?.camera?.lookAt(any: any);
    this?.camera?.fov = this?.currentFOV;
    this?.camera?.updateProjectionMatrix();
  }

  /**
   * Ease-in-out cubic
   */
  private easeInOutCubic(any: any): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math?.pow(-2 * t + 2, 3) / 2;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default CameraDynamismEngine;
