// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v25.0 — BODY GESTURE FLUIDITY ENGINE
//   Enhanced IK smoother, posture dynamics, gesture-voice synchronization
// ═══════════════════════════════════════════════════════════════════════════

import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface BoneTransform {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

export interface PostureDynamicsConfig {
  vocalToneInfluence: number;           // How much vocal tone affects posture (0-1)
  gestureAmplitudeMultiplier: number;   // Global gesture amplitude scale
  smoothingFactor: number;              // IK interpolation smoothness
  maxArmRotation: number;               // Max arm rotation per frame (degrees)
  maxHandSpeed: number;                 // Max hand movement speed (m/s)
}

export type VocalTone = 'soft' | 'assertive' | 'rapid' | 'calm';

export interface PosturePreset {
  spineRotation: number;      // Spine forward/back lean (degrees)
  shoulderHeight: number;     // Shoulder Y offset (meters)
  armRelaxation: number;      // Arm tension 0-1 (0=tense, 1=relaxed)
  gestureScale: number;       // Gesture amplitude multiplier
}

// ═══════════════════════════════════════════════════════════════════════════
// POSTURE PRESETS
// ═══════════════════════════════════════════════════════════════════════════

const POSTURE_PRESETS: Record<VocalTone, PosturePreset> = {
  // ─────────────────────────────────────────
  // SOFT (gentle, relaxed)
  // ─────────────────────────────────────────
  soft: {
    spineRotation: 2,           // Slight forward lean
    shoulderHeight: -0.01,      // Shoulders slightly down
    armRelaxation: 0.8,         // Very relaxed
    gestureScale: 0.7,          // Gentle gestures
  },

  // ─────────────────────────────────────────
  // ASSERTIVE (confident, upright)
  // ─────────────────────────────────────────
  assertive: {
    spineRotation: -1,          // Slight back lean (confident)
    shoulderHeight: 0.02,       // Shoulders up
    armRelaxation: 0.4,         // Tense
    gestureScale: 1.2,          // Pronounced gestures
  },

  // ─────────────────────────────────────────
  // RAPID (energetic, animated)
  // ─────────────────────────────────────────
  rapid: {
    spineRotation: 0,           // Neutral
    shoulderHeight: 0.01,       // Slightly elevated
    armRelaxation: 0.3,         // Very tense (ready to move)
    gestureScale: 1.5,          // Large gestures
  },

  // ─────────────────────────────────────────
  // CALM (peaceful, centered)
  // ─────────────────────────────────────────
  calm: {
    spineRotation: 1,           // Very slight forward
    shoulderHeight: 0,          // Neutral
    armRelaxation: 1.0,         // Fully relaxed
    gestureScale: 0.6,          // Minimal gestures
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class BodyGestureFluidityEngine {
  private config: PostureDynamicsConfig;
  private currentVocalTone: VocalTone = 'calm';
  private currentPosture: PosturePreset;
  private targetPosture: PosturePreset;

  // Bone state (for IK smoothing)
  private boneTargets: Map<string, BoneTransform> = new Map();
  private boneCurrent: Map<string, BoneTransform> = new Map();

  // Velocity tracking (for glitch prevention)
  private boneVelocities: Map<string, THREE.Vector3> = new Map();
  private lastUpdateTime: number = Date.now();

  constructor(config: Partial<PostureDynamicsConfig> = {}) {
    this.config = {
      vocalToneInfluence: 0.7,
      gestureAmplitudeMultiplier: 1.0,
      smoothingFactor: 0.15,            // Smooth IK interpolation
      maxArmRotation: 30,               // 30° max per frame
      maxHandSpeed: 0.5,                // 0.5 m/s max
      ...config,
    };

    // Initialize posture
    this.currentPosture = { ...POSTURE_PRESETS.calm };
    this.targetPosture = { ...POSTURE_PRESETS.calm };
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Set vocal tone (affects posture)
   */
  public setVocalTone(tone: VocalTone): void {
    if (this.currentVocalTone === tone) return;

    this.currentVocalTone = tone;
    this.targetPosture = { ...POSTURE_PRESETS[tone] };
  }

  /**
   * Update bone target position (IK target)
   */
  public setBoneTarget(boneName: string, transform: Partial<BoneTransform>): void {
    const existing = this.boneTargets.get(boneName) || {
      position: new THREE.Vector3(),
      rotation: new THREE.Euler(),
      scale: new THREE.Vector3(1, 1, 1),
    };

    this.boneTargets.set(boneName, {
      position: transform.position || existing.position,
      rotation: transform.rotation || existing.rotation,
      scale: transform.scale || existing.scale,
    });

    // Initialize current if not exists
    if (!this.boneCurrent.has(boneName)) {
      this.boneCurrent.set(boneName, {
        position: existing.position.clone(),
        rotation: existing.rotation.clone(),
        scale: existing.scale.clone(),
      });
    }
  }

  /**
   * Main update loop
   */
  public update(_deltaTime: number): void {
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000; // seconds
    this.lastUpdateTime = now;

    // ─────────────────────────────────────────
    // 1. INTERPOLATE POSTURE
    // ─────────────────────────────────────────
    const influence = this.config.vocalToneInfluence;

    this.currentPosture.spineRotation = THREE.MathUtils.lerp(
      this.currentPosture.spineRotation,
      this.targetPosture.spineRotation,
      this.config.smoothingFactor * influence
    );

    this.currentPosture.shoulderHeight = THREE.MathUtils.lerp(
      this.currentPosture.shoulderHeight,
      this.targetPosture.shoulderHeight,
      this.config.smoothingFactor * influence
    );

    this.currentPosture.armRelaxation = THREE.MathUtils.lerp(
      this.currentPosture.armRelaxation,
      this.targetPosture.armRelaxation,
      this.config.smoothingFactor * influence
    );

    this.currentPosture.gestureScale = THREE.MathUtils.lerp(
      this.currentPosture.gestureScale,
      this.targetPosture.gestureScale,
      this.config.smoothingFactor * influence
    );

    // ─────────────────────────────────────────
    // 2. SMOOTH BONE TRANSFORMS (IK)
    // ─────────────────────────────────────────
    for (const [boneName, target] of this.boneTargets.entries()) {
      const current = this.boneCurrent.get(boneName);
      if (!current) continue;

      // Calculate velocity
      const velocity = this.boneVelocities.get(boneName) || new THREE.Vector3();

      // Position interpolation with velocity limit
      const positionDelta = new THREE.Vector3().subVectors(target.position, current.position);
      const distance = positionDelta.length();

      if (distance > 0.001) {
        // Clamp speed
        const maxDistance = this.config.maxHandSpeed * dt;
        if (distance > maxDistance) {
          positionDelta.normalize().multiplyScalar(maxDistance);
        }

        current.position.add(positionDelta.multiplyScalar(this.config.smoothingFactor));
        velocity.copy(positionDelta).divideScalar(dt);
      } else {
        velocity.set(0, 0, 0);
      }

      this.boneVelocities.set(boneName, velocity);

      // Rotation interpolation (slerp for smooth rotation)
      const currentQuat = new THREE.Quaternion().setFromEuler(current.rotation);
      const targetQuat = new THREE.Quaternion().setFromEuler(target.rotation);
      currentQuat.slerp(targetQuat, this.config.smoothingFactor);
      current.rotation.setFromQuaternion(currentQuat);

      // Scale interpolation
      current.scale.lerp(target.scale, this.config.smoothingFactor);
    }
  }

  /**
   * Get current bone transform (smoothed)
   */
  public getBoneTransform(boneName: string): BoneTransform | null {
    const current = this.boneCurrent.get(boneName);
    if (!current) return null;

    return {
      position: current.position.clone(),
      rotation: current.rotation.clone(),
      scale: current.scale.clone(),
    };
  }

  /**
   * Get current posture state
   */
  public getCurrentPosture(): PosturePreset {
    return { ...this.currentPosture };
  }

  /**
   * Apply gesture amplitude scale (from vocal energy)
   */
  public setGestureAmplitude(amplitude: number): void {
    this.config.gestureAmplitudeMultiplier = THREE.MathUtils.clamp(amplitude, 0.5, 2.0);
  }

  /**
   * Reset to neutral posture
   */
  public reset(): void {
    this.setVocalTone('calm');
    this.boneTargets.clear();
    this.boneCurrent.clear();
    this.boneVelocities.clear();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Detect vocal tone from audio analysis
 */
export function detectVocalTone(voiceAnalysis: {
  rms: number;
  pitch: number;
  intensity: number;
}): VocalTone {
  const { rms, pitch, intensity } = voiceAnalysis;

  // Rapid: high intensity + high RMS
  if (intensity > 0.7 && rms > 0.5) {
    return 'rapid';
  }

  // Assertive: medium-high intensity + stable pitch
  if (intensity > 0.5 && pitch > 150) {
    return 'assertive';
  }

  // Soft: low intensity
  if (intensity < 0.3) {
    return 'soft';
  }

  // Default: calm
  return 'calm';
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default BodyGestureFluidityEngine;
