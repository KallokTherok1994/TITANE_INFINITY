/**
 * TITANE_INFINITY v∞.37 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ EXPRESSION ENGINE v∞.XVII (Ω)
 *   Orchestration Expressive · Voix + Halo + Narratif · Synchronisation Totale
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * L'Expression Engine orchestre la cohérence expressive entre:
 * - Voix (prosody, warmth, micro-intonations)
 * - Halo (patterns, colors, intensity)
 * - Narratif (style, posture, inner monologue)
 *
 * Il utilise l'Identity Kernel comme source d'identité unifiée et synchronise
 * tous les canaux expressifs en temps réel.
 */

import {
  unifiedIdentityKernel,
  type IdentityExpressionPackage,
} from '../identity/unifiedIdentityKernel';
import { auraEngine, type AuraAnimationPattern } from '../aura/auraEngine';
import { internalNarrativeEngine } from '../narrative/internalNarrativeEngine';
import { voiceProsodyEngine } from '../voice/voiceProsodyEngine';
import type { OrchestratedVoice } from '../voice/types';

// ═════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

// Export re-exported from voice/types for compatibility
export type { OrchestratedVoice } from '../voice/types';

/**
 * Configuration halo orchestré
 */
export interface OrchestratedHalo {
  pattern: string; // Pattern name
  colors: {
    primary: string; // Hex color
    secondary: string; // Hex color
    accent: string; // Hex color
  };
  dynamics: {
    intensity: number; // 0-1 - Overall intensity
    pulsation: number; // 0-1 - Pulsation strength
    flowSpeed: number; // 0-1 - Animation speed
    reactivity: number; // 0-1 - Reactivity to events
  };
  spatial: {
    radius: number; // 0-1 - Halo size
    diffusion: number; // 0-1 - Edge softness
    layering: number; // 0-1 - Multi-layer depth
  };
}

/**
 * Configuration narratif orchestré
 */
export interface OrchestratedNarrative {
  style: {
    primary: string; // fluid | architectural | empathic | visionary | technical
    tonality: number; // 0-1 - Formal → Casual
    density: number; // 0-1 - Concise → Elaborate
    poeticism: number; // 0-1 - Literal → Poetic
  };
  structure: {
    paragraphFlow: string; // linear | branching | circular
    transitionStyle: string; // abrupt | smooth | organic
    argumentationDepth: number; // 0-1 - Surface → Deep
  };
  emphasis: {
    metaphorUse: number; // 0-1 - Literal → Metaphoric
    technicalPrecision: number; // 0-1 - Casual → Precise
    emotionalResonance: number; // 0-1 - Neutral → Empathic
  };
}

/**
 * Package d'expression unifiée
 */
export interface UnifiedExpression {
  voice: OrchestratedVoice;
  halo: OrchestratedHalo;
  narrative: OrchestratedNarrative;
  coherenceScore: number;
  timestamp: number;
}

/**
 * État du moteur d'expression
 */
export interface ExpressionEngineState {
  currentExpression: UnifiedExpression;
  identitySource: IdentityExpressionPackage | null;

  // Synchronization state
  voiceHaloSync: number; // 0-1 - Voice ↔ Halo sync
  voiceNarrativeSync: number; // 0-1 - Voice ↔ Narrative sync
  haloNarrativeSync: number; // 0-1 - Halo ↔ Narrative sync
  globalSync: number; // 0-1 - Overall sync

  // Adaptation state
  contextAdaptation: number; // 0-1 - Context responsiveness
  emotionalAlignment: number; // 0-1 - Emotional coherence
  cognitiveAlignment: number; // 0-1 - Cognitive coherence

  lastUpdate: number;
}

/**
 * Mapping de signature identitaire vers expression
 */
export interface ExpressionMapping {
  tone: {
    voiceRate: number;
    haloPulsation: number;
    narrativeTonality: number;
  };
  energy: {
    voiceVolume: number;
    haloIntensity: number;
    narrativeDensity: number;
  };
  warmth: {
    voiceWarmth: number;
    haloColors: string[];
    narrativeEmotionalResonance: number;
  };
  clarity: {
    voiceClarity: number;
    haloDiffusion: number;
    narrativePrecision: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPRESSION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class ExpressionEngine {
  private state: ExpressionEngineState;
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: ((state: ExpressionEngineState) => void)[] = [];

  // Configuration
  private readonly UPDATE_RATE = 15; // 15 Hz (66ms) - Between voice (20Hz) and halo (10Hz)
  private readonly SYNC_THRESHOLD = 0.85;
  private readonly ADAPTATION_SPEED = 0.05;

  constructor() {
    this.state = this.getDefaultState();
    console.log('🎭 [EXPRESSION ENGINE] Initializing Expression Engine...');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ───────────────────────────────────────────────────────────────────────────

  start(): void {
    if (this.updateInterval) return;

    console.log('🎭 [EXPRESSION ENGINE] Starting expression engine at 15Hz...');

    // Subscribe to Identity Kernel
    this.subscribeToIdentityKernel();

    // Start update loop
    this.updateInterval = setInterval(() => this.tick(), 1000 / this.UPDATE_RATE);
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('🎭 [EXPRESSION ENGINE] Expression engine stopped.');
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SUBSCRIPTION
  // ───────────────────────────────────────────────────────────────────────────

  private subscribeToIdentityKernel(): void {
    unifiedIdentityKernel.subscribe(_identityState => {
      const expression = unifiedIdentityKernel.exportToOutput();
      this.state.identitySource = expression;
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // UPDATE LOOP
  // ───────────────────────────────────────────────────────────────────────────

  private tick(): void {
    if (!this.state.identitySource) return;

    // 1. Map identity to expression
    this.mapIdentityToExpression();

    // 2. Calculate synchronization scores
    this.calculateSynchronization();

    // 3. Apply expression to engines
    this.applyExpressionToEngines();

    // 4. Verify coherence
    this.verifyCoherence();

    // 5. Notify subscribers
    this.state.lastUpdate = Date.now();
    this.notifySubscribers();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // IDENTITY → EXPRESSION MAPPING
  // ───────────────────────────────────────────────────────────────────────────

  private mapIdentityToExpression(): void {
    if (!this.state.identitySource) return;

    const { signature, cognitive, emotive, attention } = this.state.identitySource;

    // Voice mapping
    this.state.currentExpression.voice = {
      prosody: {
        rate: this.mapToProsodyRate(signature.energy, cognitive.speed),
        pitch: this.mapToPitch(signature.tone, emotive.intensity),
        volume: this.mapToVolume(signature.energy, attention.focus),
        emphasis: this.mapToEmphasis(cognitive.precision, attention.focus),
      },
      timbre: {
        warmth: emotive.vocalWarmth,
        breathiness: this.mapToBreathiness(signature.warmth, emotive.intensity),
        resonance: this.mapToResonance(cognitive.depth, signature.clarity),
        clarity: signature.clarity,
      },
      microDynamics: {
        intonationVariation: emotive.microIntonations,
        rhythmicFlow: this.mapToRhythmicFlow(cognitive.speed, signature.energy),
        pausePlacement: this.mapToPausePlacement(
          cognitive.precision,
          attention.cognitiveLoad
        ),
        emotionalColoring: emotive.intensity,
      },
      emotionalState: {
        valence: (signature.warmth - 0.5) * 2,
        activation: signature.energy,
        dominance: signature.tone,
      },
    };

    // Halo mapping
    this.state.currentExpression.halo = {
      pattern: this.mapToHaloPattern(
        signature.narrativeStyle,
        signature.cognitivePosture
      ),
      colors: this.mapToHaloColors(signature.warmth, emotive.intensity, signature.tone),
      dynamics: {
        intensity: emotive.intensity,
        pulsation: emotive.haloReactivity,
        flowSpeed: this.mapToFlowSpeed(signature.energy, cognitive.speed),
        reactivity: emotive.haloReactivity,
      },
      spatial: {
        radius: this.mapToHaloRadius(signature.energy, attention.focus),
        diffusion: this.mapToHaloDiffusion(signature.clarity, cognitive.precision),
        layering: this.mapToHaloLayering(cognitive.depth, signature.clarity),
      },
    };

    // Narrative mapping
    this.state.currentExpression.narrative = {
      style: {
        primary: signature.narrativeStyle,
        tonality: this.mapToNarrativeTonality(signature.tone, signature.warmth),
        density: this.mapToNarrativeDensity(cognitive.depth, cognitive.precision),
        poeticism: this.mapToPoeticISM(
          signature.narrativeStyle,
          cognitive.analogicalCapacity
        ),
      },
      structure: {
        paragraphFlow: this.mapToParagraphFlow(
          signature.cognitivePosture,
          cognitive.structure
        ),
        transitionStyle: this.mapToTransitionStyle(cognitive.speed, signature.energy),
        argumentationDepth: cognitive.depth,
      },
      emphasis: {
        metaphorUse: cognitive.analogicalCapacity,
        technicalPrecision: cognitive.precision,
        emotionalResonance: emotive.intensity,
      },
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MAPPING HELPERS
  // ───────────────────────────────────────────────────────────────────────────

  private mapToProsodyRate(energy: number, speed: number): number {
    // 0.5-2.0 range
    const base = 1.0;
    const factor = (energy + speed) / 2;
    return base + (factor - 0.5) * 0.8; // 0.6-1.4 range
  }

  private mapToPitch(tone: number, intensity: number): number {
    // 0.5-2.0 range
    const base = 1.0;
    const factor = (tone + intensity) / 2;
    return base + (factor - 0.5) * 0.4; // 0.8-1.2 range
  }

  private mapToVolume(energy: number, focus: number): number {
    return energy * 0.7 + focus * 0.3;
  }

  private mapToEmphasis(precision: number, focus: number): number {
    return (precision + focus) / 2;
  }

  private mapToBreathiness(warmth: number, intensity: number): number {
    return warmth * 0.6 + (1 - intensity) * 0.4;
  }

  private mapToResonance(depth: number, clarity: number): number {
    return (depth + clarity) / 2;
  }

  private mapToRhythmicFlow(speed: number, energy: number): number {
    return (speed + energy) / 2;
  }

  private mapToPausePlacement(precision: number, load: number): number {
    return precision * 0.6 + (1 - load) * 0.4;
  }

  private mapToHaloPattern(narrativeStyle: string, cognitivePosture: string): string {
    const patterns: Record<string, string> = {
      'fluid-observer': 'flowing_waves',
      'fluid-guide': 'empathy_warm',
      'architectural-architect': 'focus_sharp',
      'architectural-analyzer': 'analytical_grid',
      'empathic-guide': 'empathy_warm',
      'empathic-observer': 'listening_pulse',
      'visionary-synthesizer': 'insight_burst',
      'technical-analyzer': 'focus_sharp',
    };

    const key = `${narrativeStyle}-${cognitivePosture}`;
    return patterns[key] || 'balanced_flow';
  }

  private mapToHaloColors(
    warmth: number,
    intensity: number,
    tone: number
  ): {
    primary: string;
    secondary: string;
    accent: string;
  } {
    // Warm colors for high warmth
    if (warmth > 0.7) {
      return {
        primary: intensity > 0.7 ? '#ff6b35' : '#ffaa5a',
        secondary: '#ffd97d',
        accent: '#f4a261',
      };
    }

    // Cool colors for low warmth, high precision
    if (tone > 0.7) {
      return {
        primary: '#4a90e2',
        secondary: '#7cb3f5',
        accent: '#a8d5ff',
      };
    }

    // Balanced colors
    return {
      primary: '#9b59b6',
      secondary: '#bb8fce',
      accent: '#d7bde2',
    };
  }

  private mapToFlowSpeed(energy: number, speed: number): number {
    return (energy + speed) / 2;
  }

  private mapToHaloRadius(energy: number, focus: number): number {
    // Focused = smaller, energetic = larger
    return energy * 0.7 + (1 - focus) * 0.3;
  }

  private mapToHaloDiffusion(clarity: number, precision: number): number {
    // High clarity = sharp edges (low diffusion)
    return 1 - (clarity + precision) / 2;
  }

  private mapToHaloLayering(depth: number, clarity: number): number {
    // Deep + clear = rich layering
    return (depth + clarity) / 2;
  }

  private mapToNarrativeTonality(tone: number, warmth: number): number {
    // Formal (0) to Casual (1)
    return (1 - tone) * 0.5 + warmth * 0.5;
  }

  private mapToNarrativeDensity(depth: number, precision: number): number {
    // Concise (0) to Elaborate (1)
    return (depth + precision) / 2;
  }

  private mapToPoeticISM(narrativeStyle: string, analogicalCapacity: number): number {
    const basePoeticism: Record<string, number> = {
      fluid: 0.8,
      architectural: 0.3,
      empathic: 0.6,
      visionary: 0.9,
      technical: 0.1,
    };

    const base = basePoeticism[narrativeStyle] || 0.5;
    return base * 0.6 + analogicalCapacity * 0.4;
  }

  private mapToParagraphFlow(cognitivePosture: string, structure: number): string {
    if (structure > 0.8) return 'linear';
    if (structure > 0.5) return 'branching';
    return 'circular';
  }

  private mapToTransitionStyle(speed: number, energy: number): string {
    const combined = (speed + energy) / 2;
    if (combined > 0.7) return 'abrupt';
    if (combined > 0.4) return 'smooth';
    return 'organic';
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SYNCHRONIZATION CALCULATION
  // ───────────────────────────────────────────────────────────────────────────

  private calculateSynchronization(): void {
    const { voice, halo, narrative } = this.state.currentExpression;

    // Voice ↔ Halo sync
    const voiceHaloMatch = this.compareDynamics(
      voice.prosody.rate,
      halo.dynamics.flowSpeed,
      voice.timbre.warmth,
      this.warmthFromColors(halo.colors)
    );

    // Voice ↔ Narrative sync
    const voiceNarrativeMatch = this.compareDynamics(
      voice.prosody.rate,
      narrative.structure.argumentationDepth,
      voice.timbre.warmth,
      narrative.emphasis.emotionalResonance
    );

    // Halo ↔ Narrative sync
    const haloNarrativeMatch = this.compareDynamics(
      halo.dynamics.intensity,
      narrative.emphasis.emotionalResonance,
      halo.spatial.radius,
      narrative.style.density
    );

    // Update sync scores
    this.state.voiceHaloSync = voiceHaloMatch;
    this.state.voiceNarrativeSync = voiceNarrativeMatch;
    this.state.haloNarrativeSync = haloNarrativeMatch;
    this.state.globalSync =
      (voiceHaloMatch + voiceNarrativeMatch + haloNarrativeMatch) / 3;
  }

  private compareDynamics(a1: number, a2: number, b1: number, b2: number): number {
    const diff1 = Math.abs(a1 - a2);
    const diff2 = Math.abs(b1 - b2);
    const avgDiff = (diff1 + diff2) / 2;
    return 1 - avgDiff; // Convert distance to similarity
  }

  private warmthFromColors(colors: {
    primary: string;
    secondary: string;
    accent: string;
  }): number {
    // Simple heuristic: warm colors (red/orange/yellow) = high warmth
    const primary = colors.primary.toLowerCase();
    if (primary.includes('ff') && primary.includes('6')) return 0.8; // Orange-ish
    if (primary.includes('4a') && primary.includes('90')) return 0.3; // Blue-ish
    return 0.5; // Balanced
  }

  // ───────────────────────────────────────────────────────────────────────────
  // APPLY TO ENGINES
  // ───────────────────────────────────────────────────────────────────────────

  private applyExpressionToEngines(): void {
    const { voice, halo, narrative } = this.state.currentExpression;

    // Apply to Voice Prosody Engine (v∞.38+)
    voiceProsodyEngine.updateState(voice);

    // Apply to Aura Engine (v∞.38+)
    auraEngine.setPattern(halo.pattern as AuraAnimationPattern);
    auraEngine.setColors({
      primary: halo.colors.primary,
      secondary: halo.colors.secondary,
      accent: halo.colors.accent,
    });
    auraEngine.setDynamics({
      intensity: halo.dynamics.intensity,
      pulsation: halo.dynamics.pulsation,
      flowSpeed: halo.dynamics.flowSpeed,
      reactivity: halo.dynamics.reactivity,
    });
    auraEngine.setSpatial({
      radius: halo.spatial.radius,
      diffusion: halo.spatial.diffusion,
      layering: halo.spatial.layering,
    });

    // Apply to Internal Narrative Engine
    internalNarrativeEngine.setNarrativeAnchor(narrative.style.primary);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // COHERENCE VERIFICATION
  // ───────────────────────────────────────────────────────────────────────────

  private verifyCoherence(): void {
    if (this.state.globalSync < this.SYNC_THRESHOLD) {
      console.warn(
        `⚠️ [EXPRESSION ENGINE] Low synchronization: ${(this.state.globalSync * 100).toFixed(1)}%`
      );
      this.boostSynchronization();
    }

    // Update expression coherence score
    this.state.currentExpression.coherenceScore = this.state.globalSync;
  }

  private boostSynchronization(): void {
    // Slightly adjust values to improve sync
    // This is a simplified version - full implementation would be more sophisticated
    const adjustment = this.ADAPTATION_SPEED;

    // Nudge voice rate towards halo flow speed
    const targetRate = this.state.currentExpression.halo.dynamics.flowSpeed;
    this.state.currentExpression.voice.prosody.rate +=
      (targetRate - this.state.currentExpression.voice.prosody.rate) * adjustment;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ───────────────────────────────────────────────────────────────────────────

  getState(): ExpressionEngineState {
    return { ...this.state };
  }

  getCurrentExpression(): UnifiedExpression {
    return { ...this.state.currentExpression };
  }

  getSyncScore(): number {
    return this.state.globalSync;
  }

  /**
   * Force expression update (for immediate response needs)
   */
  forceUpdate(): void {
    this.tick();
  }

  /**
   * Override expression component (advanced use)
   */
  overrideVoice(voice: Partial<OrchestratedVoice>): void {
    this.state.currentExpression.voice = {
      ...this.state.currentExpression.voice,
      ...voice,
    };
  }

  overrideHalo(halo: Partial<OrchestratedHalo>): void {
    this.state.currentExpression.halo = {
      ...this.state.currentExpression.halo,
      ...halo,
    };
  }

  overrideNarrative(narrative: Partial<OrchestratedNarrative>): void {
    this.state.currentExpression.narrative = {
      ...this.state.currentExpression.narrative,
      ...narrative,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // DEFAULT STATE
  // ───────────────────────────────────────────────────────────────────────────

  private getDefaultState(): ExpressionEngineState {
    return {
      currentExpression: {
        voice: {
          prosody: {
            rate: 1.0,
            pitch: 1.0,
            volume: 0.7,
            emphasis: 0.5,
          },
          timbre: {
            warmth: 0.7,
            breathiness: 0.3,
            resonance: 0.6,
            clarity: 0.8,
          },
          microDynamics: {
            intonationVariation: 0.5,
            rhythmicFlow: 0.6,
            pausePlacement: 0.5,
            emotionalColoring: 0.5,
          },
          emotionalState: {
            valence: 0,
            activation: 0.5,
            dominance: 0.5,
          },
        },
        halo: {
          pattern: 'balanced_flow',
          colors: {
            primary: '#9b59b6',
            secondary: '#bb8fce',
            accent: '#d7bde2',
          },
          dynamics: {
            intensity: 0.6,
            pulsation: 0.5,
            flowSpeed: 0.6,
            reactivity: 0.5,
          },
          spatial: {
            radius: 0.7,
            diffusion: 0.4,
            layering: 0.6,
          },
        },
        narrative: {
          style: {
            primary: 'architectural',
            tonality: 0.5,
            density: 0.7,
            poeticism: 0.5,
          },
          structure: {
            paragraphFlow: 'linear',
            transitionStyle: 'smooth',
            argumentationDepth: 0.7,
          },
          emphasis: {
            metaphorUse: 0.5,
            technicalPrecision: 0.7,
            emotionalResonance: 0.6,
          },
        },
        coherenceScore: 0.8,
        timestamp: Date.now(),
      },
      identitySource: null,
      voiceHaloSync: 0.8,
      voiceNarrativeSync: 0.8,
      haloNarrativeSync: 0.8,
      globalSync: 0.8,
      contextAdaptation: 0.7,
      emotionalAlignment: 0.7,
      cognitiveAlignment: 0.7,
      lastUpdate: Date.now(),
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SUBSCRIPTION
  // ───────────────────────────────────────────────────────────────────────────

  subscribe(callback: (state: ExpressionEngineState) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.state));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const expressionEngine = new ExpressionEngine();
