// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v25.0 — VOICE REACTION SYSTEM
//   Real-time physical reactions to voice (head, torso, breathing)
// ═══════════════════════════════════════════════════════════════════════════

import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface VoiceAnalysis {
  rms: number; // Root Mean Square (volume) 0.0-1.0
  pitch: number; // Pitch in Hz
  intensity: number; // Overall intensity 0.0-1.0
  isVoiced: boolean; // Is currently speaking
  phraseDuration: number; // Current phrase duration (ms)
}

export interface VoiceReactionConfig {
  headMovementSensitivity: number; // Head rotation sensitivity
  headMovementMax: number; // Max head rotation (degrees)
  torsoVibrationSensitivity: number; // Torso vibration sensitivity
  torsoVibrationMax: number; // Max torso vibration (meters)
  shoulderLiftThreshold: number; // Phrase duration for shoulder lift (ms)
  shoulderLiftAmount: number; // Shoulder lift amount (meters)
  breathingAmplitude: number; // Breathing chest expansion (meters)
  breathingFrequency: number; // Breathing cycles per minute
  enableHeadMovement: boolean;
  enableTorsoVibration: boolean;
  enableShoulderLift: boolean;
  enableBreathing: boolean;
}

export interface PhysicalReactions {
  headRotation: THREE.Euler; // Head rotation (X, Y, Z)
  torsoPosition: THREE.Vector3; // Torso position offset
  shoulderOffset: number; // Shoulder Y offset
  chestExpansion: number; // Chest expansion scale
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

export class VoiceReactionSystem {
  private config: VoiceReactionConfig;
  private currentReactions: PhysicalReactions;

  // Voice state
  private currentVoiceAnalysis: VoiceAnalysis;
  private phraseStartTime: number = 0;
  private isCurrentlySpeaking: boolean = false;

  // Breathing state
  private breathingPhase: number = 0;

  // Smoothing
  private targetHeadRotation: THREE.Euler;
  private targetTorsoPosition: THREE.Vector3;

  constructor(config: Partial<VoiceReactionConfig> = {}) {
    this.config = {
      headMovementSensitivity: 0.5,
      headMovementMax: 2.86, // Max 2.86° (subtle)
      torsoVibrationSensitivity: 0.3,
      torsoVibrationMax: 0.002, // 0.2cm max
      shoulderLiftThreshold: 2000, // 2s+ phrases
      shoulderLiftAmount: 0.01, // 1cm lift
      breathingAmplitude: 0.015, // ±1.5cm
      breathingFrequency: 12, // 12 cycles/min
      enableHeadMovement: true,
      enableTorsoVibration: true,
      enableShoulderLift: true,
      enableBreathing: true,
      ...config,
    };

    // Initialize reactions
    this.currentReactions = {
      headRotation: new THREE.Euler(0, 0, 0),
      torsoPosition: new THREE.Vector3(0, 0, 0),
      shoulderOffset: 0,
      chestExpansion: 0,
    };

    this.targetHeadRotation = new THREE.Euler(0, 0, 0);
    this.targetTorsoPosition = new THREE.Vector3(0, 0, 0);

    // Initialize voice analysis
    this.currentVoiceAnalysis = {
      rms: 0,
      pitch: 0,
      intensity: 0,
      isVoiced: false,
      phraseDuration: 0,
    };
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Update voice analysis (called from audio processing)
   */
  public updateVoiceAnalysis(analysis: Partial<VoiceAnalysis>): void {
    const wasVoiced = this.currentVoiceAnalysis.isVoiced;

    this.currentVoiceAnalysis = {
      ...this.currentVoiceAnalysis,
      ...analysis,
    };

    // Track phrase start/end
    if (this.currentVoiceAnalysis.isVoiced && !wasVoiced) {
      this.phraseStartTime = Date.now();
      this.isCurrentlySpeaking = true;
    } else if (!this.currentVoiceAnalysis.isVoiced && wasVoiced) {
      this.isCurrentlySpeaking = false;
    }

    // Update phrase duration
    if (this.isCurrentlySpeaking) {
      this.currentVoiceAnalysis.phraseDuration = Date.now() - this.phraseStartTime;
    } else {
      this.currentVoiceAnalysis.phraseDuration = 0;
    }
  }

  /**
   * Main update loop (called each frame)
   */
  public update(deltaTime: number): PhysicalReactions {
    const { rms, intensity, phraseDuration } = this.currentVoiceAnalysis;

    // ─────────────────────────────────────────
    // 1. HEAD MICRO-MOVEMENTS
    // ─────────────────────────────────────────
    if (this.config.enableHeadMovement && this.isCurrentlySpeaking) {
      // RMS → subtle head rotation
      const headAmount = rms * this.config.headMovementSensitivity;
      const maxRotation = THREE.MathUtils.degToRad(this.config.headMovementMax);

      // Vary rotation on X/Y axes (natural movement)
      this.targetHeadRotation.x = Math.sin(Date.now() * 0.001) * headAmount * maxRotation;
      this.targetHeadRotation.y =
        Math.cos(Date.now() * 0.0015) * headAmount * maxRotation * 0.5;
      this.targetHeadRotation.z =
        Math.sin(Date.now() * 0.0008) * headAmount * maxRotation * 0.3;
    } else {
      // Return to neutral
      this.targetHeadRotation.set(0, 0, 0);
    }

    // ─────────────────────────────────────────
    // 2. TORSO VIBRATION
    // ─────────────────────────────────────────
    if (this.config.enableTorsoVibration && this.isCurrentlySpeaking) {
      // High-frequency micro-vibration
      const vibrationAmount = intensity * this.config.torsoVibrationSensitivity;
      const maxVibration = this.config.torsoVibrationMax;

      this.targetTorsoPosition.x = (Math.random() - 0.5) * vibrationAmount * maxVibration;
      this.targetTorsoPosition.z = (Math.random() - 0.5) * vibrationAmount * maxVibration;
    } else {
      this.targetTorsoPosition.set(0, 0, 0);
    }

    // ─────────────────────────────────────────
    // 3. SHOULDER LIFT (long phrases)
    // ─────────────────────────────────────────
    if (
      this.config.enableShoulderLift &&
      phraseDuration > this.config.shoulderLiftThreshold
    ) {
      // Gradual shoulder lift on long phrases
      const liftProgress = Math.min(
        1.0,
        (phraseDuration - this.config.shoulderLiftThreshold) / 1000
      );
      this.currentReactions.shoulderOffset =
        liftProgress * this.config.shoulderLiftAmount;
    } else {
      this.currentReactions.shoulderOffset = 0;
    }

    // ─────────────────────────────────────────
    // 4. BREATHING ANIMATION
    // ─────────────────────────────────────────
    if (this.config.enableBreathing) {
      // Advance breathing phase
      const breathingSpeed = (this.config.breathingFrequency / 60) * (2 * Math.PI);
      this.breathingPhase += breathingSpeed * (deltaTime / 1000);
      this.breathingPhase = this.breathingPhase % (2 * Math.PI);

      // Chest expansion (sine wave)
      this.currentReactions.chestExpansion =
        Math.sin(this.breathingPhase) * this.config.breathingAmplitude;
    } else {
      this.currentReactions.chestExpansion = 0;
    }

    // ─────────────────────────────────────────
    // 5. SMOOTH INTERPOLATION
    // ─────────────────────────────────────────
    // Head rotation (smooth damping)
    this.currentReactions.headRotation.x = THREE.MathUtils.lerp(
      this.currentReactions.headRotation.x,
      this.targetHeadRotation.x,
      0.1
    );
    this.currentReactions.headRotation.y = THREE.MathUtils.lerp(
      this.currentReactions.headRotation.y,
      this.targetHeadRotation.y,
      0.1
    );
    this.currentReactions.headRotation.z = THREE.MathUtils.lerp(
      this.currentReactions.headRotation.z,
      this.targetHeadRotation.z,
      0.1
    );

    // Torso position (instant for vibration effect)
    this.currentReactions.torsoPosition.copy(this.targetTorsoPosition);

    return this.getCurrentReactions();
  }

  /**
   * Get current physical reactions
   */
  public getCurrentReactions(): PhysicalReactions {
    return {
      headRotation: this.currentReactions.headRotation.clone(),
      torsoPosition: this.currentReactions.torsoPosition.clone(),
      shoulderOffset: this.currentReactions.shoulderOffset,
      chestExpansion: this.currentReactions.chestExpansion,
    };
  }

  /**
   * Reset all reactions
   */
  public reset(): void {
    this.currentReactions.headRotation.set(0, 0, 0);
    this.currentReactions.torsoPosition.set(0, 0, 0);
    this.currentReactions.shoulderOffset = 0;
    this.currentReactions.chestExpansion = 0;
    this.targetHeadRotation.set(0, 0, 0);
    this.targetTorsoPosition.set(0, 0, 0);
    this.breathingPhase = 0;
    this.isCurrentlySpeaking = false;
  }

  /**
   * Enable/disable head movement
   */
  public setHeadMovementEnabled(enabled: boolean): void {
    this.config.enableHeadMovement = enabled;
  }

  /**
   * Enable/disable torso vibration
   */
  public setTorsoVibrationEnabled(enabled: boolean): void {
    this.config.enableTorsoVibration = enabled;
  }

  /**
   * Enable/disable breathing
   */
  public setBreathingEnabled(enabled: boolean): void {
    this.config.enableBreathing = enabled;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUDIO ANALYSIS HELPER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract voice analysis from audio buffer (Web Audio API)
 */
export function analyzeAudioBuffer(
  audioData: Float32Array,
  sampleRate: number = 48000
): VoiceAnalysis {
  // Calculate RMS (Root Mean Square)
  let sum = 0;
  for (let i = 0; i < audioData.length; i++) {
    sum += audioData[i] * audioData[i];
  }
  const rms = Math.sqrt(sum / audioData.length);

  // Threshold for voiced detection
  const voicedThreshold = 0.02;
  const isVoiced = rms > voicedThreshold;

  // Simple pitch detection (zero-crossing rate)
  let zeroCrossings = 0;
  for (let i = 1; i < audioData.length; i++) {
    if (
      (audioData[i] >= 0 && audioData[i - 1] < 0) ||
      (audioData[i] < 0 && audioData[i - 1] >= 0)
    ) {
      zeroCrossings++;
    }
  }
  const pitch = (zeroCrossings / 2) * (sampleRate / audioData.length);

  // Intensity (normalized RMS)
  const intensity = Math.min(1.0, rms * 10);

  return {
    rms,
    pitch,
    intensity,
    isVoiced,
    phraseDuration: 0, // Will be updated by system
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default VoiceReactionSystem;
