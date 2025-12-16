// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v25.3.0 — CAMERA DYNAMISM ENGINE (YOLO OPT-1: Three.js lazy)
//   Intelligent camera with vocal zoom, breathing parallax, 3 modes
// ═══════════════════════════════════════════════════════════════════════════

import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type CameraMode = 'portrait' | 'torso' | 'fullbody';

export interface CameraModeConfig {
  distance: number; // Distance from avatar (meters)
  fov: number; // Field of view (degrees)
  height: number; // Camera Y position (meters)
  lookAtY: number; // Look-at target Y (meters)
}

export interface CameraConfig {
  initialMode: CameraMode;
  transitionDuration: number; // Mode transition duration (ms)
  breathingAmplitude: number; // Breathing parallax amplitude (meters)
  breathingFrequency: number; // Breathing cycles per minute
  vocalZoomSensitivity: number; // Zoom sensitivity to vocal intensity
  vocalZoomMax: number; // Max FOV change (degrees)
  enableBreathingParallax: boolean;
  enableVocalZoom: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CAMERA MODE PRESETS
// ═══════════════════════════════════════════════════════════════════════════

const CAMERA_MODE_PRESETS: Record<CameraMode, CameraModeConfig> = {
  // ─────────────────────────────────────────
  // PORTRAIT (close-up visage)
  // ─────────────────────────────────────────
  portrait: {
    distance: 0.8, // 80cm (très proche)
    fov: 50, // FOV resserré
    height: 1.6, // Hauteur yeux
    lookAtY: 1.6, // Regarde visage
  },

  // ─────────────────────────────────────────
  // TORSO (torse + tête)
  // ─────────────────────────────────────────
  torso: {
    distance: 1.5, // 1.5m (moyen)
    fov: 45, // FOV normal
    height: 1.5, // Hauteur milieu torse
    lookAtY: 1.4, // Regarde haut torse
  },

  // ─────────────────────────────────────────
  // FULLBODY (corps entier)
  // ─────────────────────────────────────────
  fullbody: {
    distance: 3.0, // 3m (large)
    fov: 40, // FOV plus large
    height: 1.2, // Hauteur milieu corps
    lookAtY: 1.0, // Regarde centre corps
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class CameraDynamismEngine {
  private camera: THREE.PerspectiveCamera;
  private config: CameraConfig;

  // Current state
  private currentMode: CameraMode;
  private currentPosition: THREE.Vector3;
  private targetPosition: THREE.Vector3;
  private currentLookAt: THREE.Vector3;
  private targetLookAt: THREE.Vector3;
  private currentFOV: number;
  private targetFOV: number;

  // Transition state
  private transitionProgress: number = 1.0; // 0.0-1.0 (1.0 = complete)
  private transitionStartTime: number = 0;

  // Breathing state
  private breathingPhase: number = 0; // 0-2π

  // Vocal zoom state
  private vocalIntensity: number = 0; // 0.0-1.0

  constructor(camera: THREE.PerspectiveCamera, config: Partial<CameraConfig> = {}) {
    this.camera = camera;

    this.config = {
      initialMode: 'torso',
      transitionDuration: 1000, // 1s transitions
      breathingAmplitude: 0.02, // ±2cm Y
      breathingFrequency: 10, // 10 cycles/min (realistic)
      vocalZoomSensitivity: 0.5, // Moderate sensitivity
      vocalZoomMax: 5.0, // Max -5° FOV
      enableBreathingParallax: true,
      enableVocalZoom: true,
      ...config,
    };

    // Initialize mode
    this.currentMode = this.config.initialMode;
    const preset = CAMERA_MODE_PRESETS[this.currentMode];

    // Initialize positions
    this.currentPosition = new THREE.Vector3(0, preset.height, preset.distance);
    this.targetPosition = this.currentPosition.clone();
    this.currentLookAt = new THREE.Vector3(0, preset.lookAtY, 0);
    this.targetLookAt = this.currentLookAt.clone();
    this.currentFOV = preset.fov;
    this.targetFOV = preset.fov;

    // Apply to camera
    this.applyCameraState();
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Change camera mode
   */
  public setMode(mode: CameraMode): void {
    if (this.currentMode === mode) return;

    this.currentMode = mode;
    const preset = CAMERA_MODE_PRESETS[mode];

    // Set new targets
    this.targetPosition.set(0, preset.height, preset.distance);
    this.targetLookAt.set(0, preset.lookAtY, 0);
    this.targetFOV = preset.fov;

    // Start transition
    this.transitionProgress = 0.0;
    this.transitionStartTime = Date.now();
  }

  /**
   * Get current mode
   */
  public getCurrentMode(): CameraMode {
    return this.currentMode;
  }

  /**
   * Update vocal intensity (for zoom effect)
   */
  public setVocalIntensity(intensity: number): void {
    this.vocalIntensity = THREE.MathUtils.clamp(intensity, 0, 1);
  }

  /**
   * Main update loop (appelé chaque frame)
   */
  public update(deltaTime: number): void {
    // ─────────────────────────────────────────
    // 1. MODE TRANSITION
    // ─────────────────────────────────────────
    if (this.transitionProgress < 1.0) {
      const elapsed = Date.now() - this.transitionStartTime;
      this.transitionProgress = Math.min(1.0, elapsed / this.config.transitionDuration);

      // Ease-in-out cubic
      const eased = this.easeInOutCubic(this.transitionProgress);

      // Interpolate position
      this.currentPosition.lerpVectors(
        this.currentPosition,
        this.targetPosition,
        eased * 0.1 // Smooth damping
      );

      // Interpolate look-at
      this.currentLookAt.lerpVectors(this.currentLookAt, this.targetLookAt, eased * 0.1);

      // Interpolate FOV
      this.currentFOV = THREE.MathUtils.lerp(
        this.currentFOV,
        this.targetFOV,
        eased * 0.1
      );
    }

    // ─────────────────────────────────────────
    // 2. BREATHING PARALLAX
    // ─────────────────────────────────────────
    let breathingOffset = 0;
    if (this.config.enableBreathingParallax) {
      // Advance breathing phase
      const breathingSpeed = (this.config.breathingFrequency / 60) * (2 * Math.PI); // rad/s
      this.breathingPhase += breathingSpeed * (deltaTime / 1000);
      this.breathingPhase = this.breathingPhase % (2 * Math.PI);

      // Calculate Y offset (sine wave)
      breathingOffset = Math.sin(this.breathingPhase) * this.config.breathingAmplitude;
    }

    // ─────────────────────────────────────────
    // 3. VOCAL ZOOM
    // ─────────────────────────────────────────
    let vocalZoomOffset = 0;
    if (this.config.enableVocalZoom) {
      // Vocal intensity → FOV reduction (zoom in)
      vocalZoomOffset =
        -this.vocalIntensity *
        this.config.vocalZoomSensitivity *
        this.config.vocalZoomMax;
    }

    // ─────────────────────────────────────────
    // 4. APPLY TO CAMERA
    // ─────────────────────────────────────────
    const finalPosition = this.currentPosition.clone();
    finalPosition.y += breathingOffset;

    const finalLookAt = this.currentLookAt.clone();
    finalLookAt.y += breathingOffset; // Sync look-at with breathing

    const finalFOV = this.currentFOV + vocalZoomOffset;

    this.camera.position.copy(finalPosition);
    this.camera.lookAt(finalLookAt);
    this.camera.fov = finalFOV;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Reset to initial state
   */
  public reset(): void {
    this.setMode(this.config.initialMode);
    this.vocalIntensity = 0;
    this.breathingPhase = 0;
    this.transitionProgress = 1.0;
  }

  /**
   * Enable/disable breathing parallax
   */
  public setBreathingParallaxEnabled(enabled: boolean): void {
    this.config.enableBreathingParallax = enabled;
  }

  /**
   * Enable/disable vocal zoom
   */
  public setVocalZoomEnabled(enabled: boolean): void {
    this.config.enableVocalZoom = enabled;
  }

  /**
   * Set breathing amplitude
   */
  public setBreathingAmplitude(amplitude: number): void {
    this.config.breathingAmplitude = amplitude;
  }

  /**
   * Set vocal zoom sensitivity
   */
  public setVocalZoomSensitivity(sensitivity: number): void {
    this.config.vocalZoomSensitivity = sensitivity;
  }

  /**
   * Manual camera position override
   */
  public setCameraPosition(x: number, y: number, z: number): void {
    this.currentPosition.set(x, y, z);
    this.targetPosition.copy(this.currentPosition);
    this.applyCameraState();
  }

  /**
   * Manual look-at override
   */
  public setLookAt(x: number, y: number, z: number): void {
    this.currentLookAt.set(x, y, z);
    this.targetLookAt.copy(this.currentLookAt);
    this.applyCameraState();
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Apply current camera state
   */
  private applyCameraState(): void {
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);
    this.camera.fov = this.currentFOV;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Ease-in-out cubic
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default CameraDynamismEngine;
