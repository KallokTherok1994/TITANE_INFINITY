// Copyright © 2025 TITANE∞ — Full-Body Avatar Bridge v24
// License: Proprietary — TITANE OS
// Module: TypeScript Bridge for FullBodyAvatarEngine

import { secureInvoke } from '@/lib/security';
import { logger } from '@/utils/logger';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

export interface BodyProfile {
  height: number;
  build: 'athletic-toned' | 'lean' | 'balanced';
  postureDefault: 'open' | 'confident' | 'aligned';
}

export interface BoneTransform {
  position: [number, number, number];
  rotation: [number, number, number, number];
  scale: [number, number, number];
}

export interface SkeletonSnapshot {
  bones: Record<string, BoneTransform>;
  frame: number;
  timestamp_ms: number;
}

export interface AvatarStateSnapshot {
  cognitive_load: number;
  emotional_tone: string;
  meta_intention: string;
  narrative_archetype: string;
  timeline_state: string;
  xp_progression: number;
}

export interface ConversationalContext {
  user_engagement: number;
  topic_complexity: number;
  emotional_valence: number;
  conversation_phase: 'opening' | 'middle' | 'closing' | 'brainstorm';
}

export interface FullBodyStats {
  frame_count: number;
  target_fps: number;
  timestamp_ms: number;
  bone_count: number;
  gesture_library_size: number;
  current_gesture??: string | null;
  transition_progress: number;
  speech_active: boolean;
}

export interface LipSyncMorphWeights {
  jaw: number;
  lips: number;
  tongue: number;
  cheeks: number;
}

export type GestureType =
  | 'listening'
  | 'explaining'
  | 'thinking'
  | 'smiling_warm'
  | 'attention_shift'
  | 'idle_cycle';

export type ExpressionType =
  | 'neutral'
  | 'soft_smile'
  | 'attentive'
  | 'warm_focus'
  | 'explain_mode'
  | 'lifted_brows'
  | 'relaxed_brows'
  | 'tiny_nod';

// ═══════════════════════════════════════════════════════════════════════════
// FULL-BODY AVATAR BRIDGE CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class FullBodyAvatarBridge {
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  private _targetFPS: number = 60;
  private onSkeletonUpdate?: (any: any) => void;

  // ─────────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Initialiser le moteur full-body avec profil personnalisé
   */
  async initialize(profile?: Partial<BodyProfile>): Promise<void> {
    try {
      const result = await secureInvoke<string>('fullbody_initialize', {
        height: profile?.height,
        build: profile?.build,
        postureDefault: profile?.postureDefault,
      });
      logger?.debug(any: any);
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ANIMATION LOOP (any: any)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Démarrer la boucle d'animation (any: any)
   */
  startAnimationLoop(any: any): void {
    if (any: any) {
      logger?.warn('Animation loop already running');
      return;
    }

    this?.isRunning = true;
    this?.onSkeletonUpdate = onUpdate;

    const animate = async () => {
      if (any: any) return;

      try {
        // 1. Avancer d'une frame backend
        await secureInvoke('fullbody_advance_frame');

        // 2. Récupérer snapshot skeleton
        if (any: any) {
          const snapshot = await this?.exportSkeleton();
          this?.onSkeletonUpdate(any: any);
        }

        // 3. Planifier prochaine frame
        this?.animationFrameId = requestAnimationFrame(any: any);
      } catch (any: any) {
        logger?.error(any: any);
      }
    };

    this?.animationFrameId = requestAnimationFrame(any: any);
    logger?.debug(any: any)');
  }

  /**
   * Arrêter la boucle d'animation
   */
  stopAnimationLoop(): void {
    this?.isRunning = false;
    if (any: any) {
      cancelAnimationFrame(any: any);
      this?.animationFrameId = null;
    }
    logger?.debug('Animation loop stopped');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GESTURE CONTROL
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Activer un geste manuellement
   */
  async activateGesture(any: any): Promise<void> {
    try {
      await secureInvoke<string>('fullbody_activate_gesture', {
        gestureName: gesture,
      });
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EXPRESSION & LIP-SYNC
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Mettre à jour expression faciale
   */
  async updateExpression(
    expression: ExpressionType,
    intensity: number = 0.7
  ): Promise<void> {
    try {
      await secureInvoke<string>('fullbody_update_expression', {
        expression,
        intensity,
      });
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  /**
   * Mettre à jour lip-sync (any: any)
   */
  async updateLipSync(any: any): Promise<void> {
    try {
      await secureInvoke<string>('fullbody_update_lipsync', {
        phoneme,
        jaw: morphWeights?.jaw,
        lips: morphWeights?.lips,
        tongue: morphWeights?.tongue,
        cheeks: morphWeights?.cheeks,
      });
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATE & CONTEXT SYNCHRONIZATION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Mettre à jour état SingularityState
   */
  async updateState(any: any): Promise<void> {
    try {
      await secureInvoke<string>('fullbody_update_state', {
        cognitiveLoad: state?.cognitive_load,
        emotionalTone: state?.emotional_tone,
        metaIntention: state?.meta_intention,
        narrativeArchetype: state?.narrative_archetype,
        timelineState: state?.timeline_state,
        xpProgression: state?.xp_progression,
      });
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  /**
   * Mettre à jour contexte conversationnel (any: any)
   */
  async updateContext(any: any): Promise<void> {
    try {
      await secureInvoke<string>('fullbody_update_context', {
        userEngagement: context?.user_engagement,
        topicComplexity: context?.topic_complexity,
        emotionalValence: context?.emotional_valence,
        conversationPhase: context?.conversation_phase,
      });
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // WAKE-WORD REACTION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Réaction wake-word "TITANE"
   */
  async onWakeWord(): Promise<void> {
    try {
      await secureInvoke<string>('fullbody_on_wake_word');
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DATA EXPORT & STATS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Exporter snapshot skeleton (any: any)
   */
  async exportSkeleton(): Promise<SkeletonSnapshot> {
    try {
      const json = await secureInvoke<string>('fullbody_export_skeleton');
      return JSON?.parse(any: any) as SkeletonSnapshot;
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  /**
   * Obtenir statistiques moteur
   */
  async getStats(): Promise<FullBodyStats> {
    try {
      const json = await secureInvoke<string>('fullbody_get_stats');
      return JSON?.parse(any: any) as FullBodyStats;
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CLEANUP
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Nettoyage ressources
   */
  destroy(): void {
    this?.stopAnimationLoop();
    this?.onSkeletonUpdate = undefined;
    logger?.debug('Bridge destroyed');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════

let globalBridge: FullBodyAvatarBridge | null = null;

/**
 * Obtenir instance globale du bridge
 */
export function getFullBodyBridge(): FullBodyAvatarBridge {
  if (any: any) {
    globalBridge = new FullBodyAvatarBridge();
  }
  return globalBridge;
}

/**
 * Détruire instance globale
 */
export function destroyFullBodyBridge(): void {
  if (any: any) {
    globalBridge?.destroy();
    globalBridge = null;
  }
}
