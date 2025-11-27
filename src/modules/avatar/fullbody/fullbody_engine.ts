// Copyright © 2025 TITANE∞ — Full-Body Avatar Bridge v24
// License: Proprietary — TITANE OS
// Module: TypeScript Bridge for FullBodyAvatarEngine

import { invoke } from '@tauri-apps/api/core';

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
  current_gesture: string | null;
  transition_progress: number;
  speech_active: boolean;
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
  private targetFPS: number = 60;
  private onSkeletonUpdate?: (snapshot: SkeletonSnapshot) => void;

  // ─────────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Initialiser le moteur full-body avec profil personnalisé
   */
  async initialize(profile?: Partial<BodyProfile>): Promise<void> {
    try {
      const result = await invoke<string>('fullbody_initialize', {
        height: profile?.height,
        build: profile?.build,
        postureDefault: profile?.postureDefault,
      });
      console.log('[FullBodyAvatarBridge] Initialized:', result);
    } catch (error) {
      console.error('[FullBodyAvatarBridge] Initialization failed:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ANIMATION LOOP (60 FPS)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Démarrer la boucle d'animation (60 FPS)
   */
  startAnimationLoop(onUpdate?: (snapshot: SkeletonSnapshot) => void): void {
    if (this.isRunning) {
      console.warn('[FullBodyAvatarBridge] Animation loop already running');
      return;
    }

    this.isRunning = true;
    this.onSkeletonUpdate = onUpdate;

    const animate = async () => {
      if (!this.isRunning) return;

      try {
        // 1. Avancer d'une frame backend
        await invoke('fullbody_advance_frame');

        // 2. Récupérer snapshot skeleton
        if (this.onSkeletonUpdate) {
          const snapshot = await this.exportSkeleton();
          this.onSkeletonUpdate(snapshot);
        }

        // 3. Planifier prochaine frame
        this.animationFrameId = requestAnimationFrame(animate);
      } catch (error) {
        console.error('[FullBodyAvatarBridge] Animation loop error:', error);
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
    console.log('[FullBodyAvatarBridge] Animation loop started (60 FPS)');
  }

  /**
   * Arrêter la boucle d'animation
   */
  stopAnimationLoop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    console.log('[FullBodyAvatarBridge] Animation loop stopped');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GESTURE CONTROL
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Activer un geste manuellement
   */
  async activateGesture(gesture: GestureType): Promise<void> {
    try {
      await invoke<string>('fullbody_activate_gesture', {
        gestureName: gesture,
      });
    } catch (error) {
      console.error('[FullBodyAvatarBridge] Gesture activation failed:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EXPRESSION & LIP-SYNC
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Mettre à jour expression faciale
   */
  async updateExpression(expression: ExpressionType, intensity: number = 0.7): Promise<void> {
    try {
      await invoke<string>('fullbody_update_expression', {
        expression,
        intensity,
      });
    } catch (error) {
      console.error('[FullBodyAvatarBridge] Expression update failed:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour lip-sync (appelé depuis ImmersiveAvatarBridge v23)
   */
  async updateLipSync(
    phoneme: string,
    morphWeights: { jaw: number; lips: number; tongue: number; cheeks: number }
  ): Promise<void> {
    try {
      await invoke<string>('fullbody_update_lipsync', {
        phoneme,
        jaw: morphWeights.jaw,
        lips: morphWeights.lips,
        tongue: morphWeights.tongue,
        cheeks: morphWeights.cheeks,
      });
    } catch (error) {
      console.error('[FullBodyAvatarBridge] Lip-sync update failed:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATE & CONTEXT SYNCHRONIZATION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Mettre à jour état SingularityState
   */
  async updateState(state: AvatarStateSnapshot): Promise<void> {
    try {
      await invoke<string>('fullbody_update_state', {
        cognitiveLoad: state.cognitive_load,
        emotionalTone: state.emotional_tone,
        metaIntention: state.meta_intention,
        narrativeArchetype: state.narrative_archetype,
        timelineState: state.timeline_state,
        xpProgression: state.xp_progression,
      });
    } catch (error) {
      console.error('[FullBodyAvatarBridge] State update failed:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour contexte conversationnel (pour BodyPostureAI)
   */
  async updateContext(context: ConversationalContext): Promise<void> {
    try {
      await invoke<string>('fullbody_update_context', {
        userEngagement: context.user_engagement,
        topicComplexity: context.topic_complexity,
        emotionalValence: context.emotional_valence,
        conversationPhase: context.conversation_phase,
      });
    } catch (error) {
      console.error('[FullBodyAvatarBridge] Context update failed:', error);
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
      await invoke<string>('fullbody_on_wake_word');
    } catch (error) {
      console.error('[FullBodyAvatarBridge] Wake-word reaction failed:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DATA EXPORT & STATS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Exporter snapshot skeleton (pour rendu)
   */
  async exportSkeleton(): Promise<SkeletonSnapshot> {
    try {
      const json = await invoke<string>('fullbody_export_skeleton');
      return JSON.parse(json) as SkeletonSnapshot;
    } catch (error) {
      console.error('[FullBodyAvatarBridge] Skeleton export failed:', error);
      throw error;
    }
  }

  /**
   * Obtenir statistiques moteur
   */
  async getStats(): Promise<FullBodyStats> {
    try {
      const json = await invoke<string>('fullbody_get_stats');
      return JSON.parse(json) as FullBodyStats;
    } catch (error) {
      console.error('[FullBodyAvatarBridge] Stats retrieval failed:', error);
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
    this.stopAnimationLoop();
    this.onSkeletonUpdate = undefined;
    console.log('[FullBodyAvatarBridge] Bridge destroyed');
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
  if (!globalBridge) {
    globalBridge = new FullBodyAvatarBridge();
  }
  return globalBridge;
}

/**
 * Détruire instance globale
 */
export function destroyFullBodyBridge(): void {
  if (globalBridge) {
    globalBridge.destroy();
    globalBridge = null;
  }
}
