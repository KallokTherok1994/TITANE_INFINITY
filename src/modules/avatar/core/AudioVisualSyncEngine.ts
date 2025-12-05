// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v25.0 — AUDIO-VISUAL SYNC ENGINE
//   Central coordination pipeline: Audio → Phonemes → Morphs → Expressions → Render
// ═══════════════════════════════════════════════════════════════════════════

import * as THREE from 'three';
import { LipSyncPrecisionEngine, type Phoneme, type MorphWeights } from '../lipsync/LipSyncPrecisionEngine';
import { FacialExpressionEngine, type ExpressionMode, type ExpressionWeights } from '../expressions/FacialExpressionEngine';
import { VoiceReactionSystem, type VoiceAnalysis, type PhysicalReactions, analyzeAudioBuffer } from '../voice/VoiceReactionSystem';
import { BodyGestureFluidityEngine, type VocalTone, detectVocalTone } from '../gesture/BodyGestureFluidityEngine';
import { CameraDynamismEngine, type CameraMode } from '../camera/CameraDynamismEngine';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AudioVisualState {
  // Lip-sync
  lipSyncMorphs: MorphWeights;
  currentPhoneme: Phoneme | null;

  // Expressions
  expressionWeights: ExpressionWeights;
  currentExpression: ExpressionMode;

  // Voice reactions
  physicalReactions: PhysicalReactions;
  voiceAnalysis: VoiceAnalysis;

  // Body gestures
  currentVocalTone: VocalTone;

  // Camera
  cameraMode: CameraMode;

  // Timing
  timestamp: number;
  latency: number;  // Audio-to-visual latency (ms)
}

export interface SyncConfig {
  targetLatency: number;        // Target latency (ms) - default 50ms
  enableLipSync: boolean;
  enableExpressions: boolean;
  enableVoiceReactions: boolean;
  enableBodyGestures: boolean;
  enableCameraDynamism: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class AudioVisualSyncEngine {
  private config: SyncConfig;

  // Sub-engines
  private lipSyncEngine: LipSyncPrecisionEngine;
  private expressionEngine: FacialExpressionEngine;
  private voiceReactionSystem: VoiceReactionSystem;
  private bodyGestureEngine: BodyGestureFluidityEngine;
  private cameraEngine: CameraDynamismEngine | null = null;

  // State
  private currentState: AudioVisualState;
  private lastAudioTimestamp: number = 0;
  private lastVisualTimestamp: number = 0;

  // Performance tracking
  private frameCount: number = 0;
  private startTime: number = Date.now();

  constructor(
    cameraEngine: CameraDynamismEngine | null = null,
    config: Partial<SyncConfig> = {}
  ) {
    this.config = {
      targetLatency: 50,              // 50ms target
      enableLipSync: true,
      enableExpressions: true,
      enableVoiceReactions: true,
      enableBodyGestures: true,
      enableCameraDynamism: true,
      ...config,
    };

    // Initialize engines
    this.lipSyncEngine = new LipSyncPrecisionEngine({
      anticipationMs: 90,
      smoothingFactor: 0.2,
    });

    this.expressionEngine = new FacialExpressionEngine({
      expressionTransitionSpeed: 0.15,
      blinkFrequency: [3, 8],
    });

    this.voiceReactionSystem = new VoiceReactionSystem({
      headMovementMax: 2.86,
      torsoVibrationMax: 0.002,
      breathingAmplitude: 0.015,
    });

    this.bodyGestureEngine = new BodyGestureFluidityEngine({
      smoothingFactor: 0.15,
      vocalToneInfluence: 0.7,
    });

    this.cameraEngine = cameraEngine;

    // Initialize state
    this.currentState = this.createInitialState();
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Process audio buffer (main input)
   */
  public processAudio(audioBuffer: Float32Array, sampleRate: number = 48000): void {
    this.lastAudioTimestamp = Date.now();

    // ─────────────────────────────────────────
    // 1. ANALYZE AUDIO
    // ─────────────────────────────────────────
    const voiceAnalysis = analyzeAudioBuffer(audioBuffer, sampleRate);
    this.currentState.voiceAnalysis = voiceAnalysis;

    // ─────────────────────────────────────────
    // 2. EXTRACT PHONEMES (Lip-Sync)
    // ─────────────────────────────────────────
    if (this.config.enableLipSync) {
      const phonemes = this.lipSyncEngine.analyzePhonemes(audioBuffer);

      // Enqueue phonemes
      for (const phoneme of phonemes) {
        this.lipSyncEngine.enqueuePhoneme(phoneme);
      }
    }

    // ─────────────────────────────────────────
    // 3. UPDATE VOICE REACTIONS
    // ─────────────────────────────────────────
    if (this.config.enableVoiceReactions) {
      this.voiceReactionSystem.updateVoiceAnalysis(voiceAnalysis);
    }

    // ─────────────────────────────────────────
    // 4. DETECT VOCAL TONE (Body Gestures)
    // ─────────────────────────────────────────
    if (this.config.enableBodyGestures) {
      const vocalTone = detectVocalTone(voiceAnalysis);
      this.bodyGestureEngine.setVocalTone(vocalTone);
      this.currentState.currentVocalTone = vocalTone;

      // Sync gesture amplitude with vocal energy
      this.bodyGestureEngine.setGestureAmplitude(voiceAnalysis.intensity * 1.5);
    }

    // ─────────────────────────────────────────
    // 5. UPDATE CAMERA (Vocal Zoom)
    // ─────────────────────────────────────────
    if (this.config.enableCameraDynamism && this.cameraEngine) {
      this.cameraEngine.setVocalIntensity(voiceAnalysis.intensity);
    }
  }

  /**
   * Update visual state (called each frame ~60 FPS)
   */
  public update(deltaTime: number): AudioVisualState {
    this.lastVisualTimestamp = Date.now();
    this.frameCount++;

    // Calculate latency
    this.currentState.latency = this.lastVisualTimestamp - this.lastAudioTimestamp;
    this.currentState.timestamp = this.lastVisualTimestamp;

    // ─────────────────────────────────────────
    // 1. UPDATE LIP-SYNC
    // ─────────────────────────────────────────
    if (this.config.enableLipSync) {
      this.currentState.lipSyncMorphs = this.lipSyncEngine.update(deltaTime);
      // TODO: Get current phoneme from engine
      this.currentState.currentPhoneme = null;
    }

    // ─────────────────────────────────────────
    // 2. UPDATE EXPRESSIONS
    // ─────────────────────────────────────────
    if (this.config.enableExpressions) {
      // Modulate expression with vocal intensity
      this.expressionEngine.updateWithVocalIntensity(
        this.currentState.voiceAnalysis.intensity
      );

      this.currentState.expressionWeights = this.expressionEngine.update(deltaTime);
      this.currentState.currentExpression = this.expressionEngine.getCurrentMode();
    }

    // ─────────────────────────────────────────
    // 3. UPDATE VOICE REACTIONS
    // ─────────────────────────────────────────
    if (this.config.enableVoiceReactions) {
      this.currentState.physicalReactions = this.voiceReactionSystem.update(deltaTime);
    }

    // ─────────────────────────────────────────
    // 4. UPDATE BODY GESTURES
    // ─────────────────────────────────────────
    if (this.config.enableBodyGestures) {
      this.bodyGestureEngine.update(deltaTime);
    }

    // ─────────────────────────────────────────
    // 5. UPDATE CAMERA
    // ─────────────────────────────────────────
    if (this.config.enableCameraDynamism && this.cameraEngine) {
      this.cameraEngine.update(deltaTime);
      this.currentState.cameraMode = this.cameraEngine.getCurrentMode();
    }

    return this.getCurrentState();
  }

  /**
   * Set expression mode manually
   */
  public setExpression(mode: ExpressionMode): void {
    this.expressionEngine.setExpressionMode(mode);
  }

  /**
   * Set camera mode manually
   */
  public setCameraMode(mode: CameraMode): void {
    if (this.cameraEngine) {
      this.cameraEngine.setMode(mode);
    }
  }

  /**
   * Get current synchronized state
   */
  public getCurrentState(): AudioVisualState {
    return { ...this.currentState };
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): {
    fps: number;
    averageLatency: number;
    frameCount: number;
  } {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const fps = this.frameCount / elapsed;

    return {
      fps,
      averageLatency: this.currentState.latency,
      frameCount: this.frameCount,
    };
  }

  /**
   * Reset all systems
   */
  public reset(): void {
    this.lipSyncEngine.reset();
    this.expressionEngine.reset();
    this.voiceReactionSystem.reset();
    this.bodyGestureEngine.reset();
    if (this.cameraEngine) {
      this.cameraEngine.reset();
    }

    this.currentState = this.createInitialState();
    this.frameCount = 0;
    this.startTime = Date.now();
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS
  // ═════════════════════════════════════════════════════════════════════════

  private createInitialState(): AudioVisualState {
    return {
      lipSyncMorphs: {
        jawOpen: 0,
        lipsPucker: 0,
        lipsSpread: 0,
        lipUpperUp: 0,
        lipLowerDown: 0,
        cheekPuff: 0,
        tongueOut: 0,
        mouthPress: 0,
      },
      currentPhoneme: null,
      expressionWeights: {
        smileMouth: 0,
        mouthOpen: 0,
        eyeBrowRaise: 0,
        eyeBrowFurrow: 0,
        eyeWiden: 0,
        eyeSquint: 0,
        eyeLidLowerLeft: 0,
        eyeLidLowerRight: 0,
        cheekRaise: 0,
        noseWrinkle: 0,
        headTilt: 0,
      },
      currentExpression: 'soft-smile',
      physicalReactions: {
        headRotation: new THREE.Euler(0, 0, 0),
        torsoPosition: new THREE.Vector3(0, 0, 0),
        shoulderOffset: 0,
        chestExpansion: 0,
      },
      voiceAnalysis: {
        rms: 0,
        pitch: 0,
        intensity: 0,
        isVoiced: false,
        phraseDuration: 0,
      },
      currentVocalTone: 'calm',
      cameraMode: 'torso',
      timestamp: Date.now(),
      latency: 0,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default AudioVisualSyncEngine;
