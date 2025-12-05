/**
 * TITANE∞ v23 — Immersive Avatar Bridge
 * TypeScript API pour AvatarEngine v23
 */

import { secureInvoke } from '@/lib/security';
import { TAURI_COMMANDS } from '@/core/commands/TAURI_COMMANDS';

// ═══════════════════════════════════════════════════════════════════════════════
//   TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ImmersiveVoiceProfile {
  voice_id: string;
  stability: number;
  clarity: number;
  similarity_boost: number;
  style: number;
  exaggeration: number;
  speech_rate: number;
  breathiness: number;
  soft_transitions: boolean;
  dynamic_range: number;
}

export interface MorphTarget {
  jaw_open: number;       // 0.0-1.0
  lip_rounding: number;   // 0.0-1.0
  tongue_position: number; // 0.0-1.0
  lip_spread: number;     // 0.0-1.0
  duration_ms: number;
}

export type FacialExpression =
  | 'neutral'
  | 'soft_smile'
  | 'attentive'
  | 'warm_focus'
  | 'explain_mode'
  | 'lifted_brows'
  | 'relaxed_brows'
  | 'tiny_nod';

export interface AvatarState {
  is_speaking: boolean;
  immersion_mode: boolean;
  wake_word_active: boolean;
  voice_profile: {
    voice_id: string;
    stability: number;
    clarity: number;
    speech_rate: number;
  };
  expression: {
    current: string;
    intensity: number;
  };
  lip_sync: {
    active: boolean;
    quality: string;
    frame: number;
    total_frames: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//   AVATAR BRIDGE V23
// ═══════════════════════════════════════════════════════════════════════════════

export class ImmersiveAvatarBridge {
  /**
   * Prépare texte pour synthèse vocale immersive
   */
  async prepareSpeech(
    text: string,
    archetype: string,
    mood: string,
    cognitiveStability: number,
    cpuLoad: number
  ): Promise<string> {
    return await secureInvoke<string>(TAURI_COMMANDS.AVATAR_PREPARE_SPEECH, {
      text,
      archetype,
      mood,
      cognitiveStability,
      cpuLoad,
    });
  }

  /**
   * Termine synthèse vocale
   */
  async finishSpeech(): Promise<void> {
    await secureInvoke(TAURI_COMMANDS.AVATAR_FINISH_SPEECH);
  }

  /**
   * Active mode immersion
   */
  async enableImmersion(): Promise<void> {
    await secureInvoke(TAURI_COMMANDS.AVATAR_ENABLE_IMMERSION);
  }

  /**
   * Réaction au wake-word "TITANE"
   */
  async onWakeWord(): Promise<void> {
    await secureInvoke(TAURI_COMMANDS.AVATAR_ON_WAKE_WORD);
  }

  /**
   * Récupère morph target actuel (lip-sync)
   */
  async getCurrentMorph(): Promise<MorphTarget> {
    return await secureInvoke<MorphTarget>(TAURI_COMMANDS.AVATAR_GET_CURRENT_MORPH);
  }

  /**
   * Avance frame lip-sync
   */
  async advanceLipSync(): Promise<void> {
    await secureInvoke(TAURI_COMMANDS.AVATAR_ADVANCE_LIP_SYNC);
  }

  /**
   * Récupère expression faciale actuelle
   */
  async getExpression(): Promise<FacialExpression> {
    return await secureInvoke<FacialExpression>(TAURI_COMMANDS.AVATAR_GET_EXPRESSION);
  }

  /**
   * Récupère état complet de l'avatar
   */
  async getState(): Promise<AvatarState> {
    return await secureInvoke<AvatarState>(TAURI_COMMANDS.AVATAR_GET_STATE);
  }

  /**
   * Lance lip-sync synchronisé avec audio
   */
  async startLipSync(durationMs: number, fps: number = 60): Promise<void> {
    const frameTime = 1000 / fps;
    const totalFrames = Math.floor(durationMs / frameTime);

    for (let i = 0; i < totalFrames; i++) {
      await this.advanceLipSync();
      await new Promise(resolve => setTimeout(resolve, frameTime));
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Mappe archetype → mood
 */
export function getArchetypeMood(archetype: string): string {
  const moodMap: Record<string, string> = {
    'Architecte': 'calm',
    'Observateur': 'grounded',
    'Tisseur': 'warm',
    'Pilier': 'calm',
    'Flux': 'energized',
    'Horizon': 'curious',
    'Cristal': 'grounded',
    'Gardien': 'determined',
  };

  return moodMap[archetype] || 'calm';
}

/**
 * Interpole entre 2 morph targets pour transition fluide
 */
export function interpolateMorph(
  from: MorphTarget,
  to: MorphTarget,
  t: number // 0.0-1.0
): MorphTarget {
  return {
    jaw_open: from.jaw_open + (to.jaw_open - from.jaw_open) * t,
    lip_rounding: from.lip_rounding + (to.lip_rounding - from.lip_rounding) * t,
    tongue_position: from.tongue_position + (to.tongue_position - from.tongue_position) * t,
    lip_spread: from.lip_spread + (to.lip_spread - from.lip_spread) * t,
    duration_ms: Math.round(from.duration_ms + (to.duration_ms - from.duration_ms) * t),
  };
}

/**
 * Couleur selon expression
 */
export function getExpressionColor(expression: FacialExpression): string {
  const colors: Record<FacialExpression, string> = {
    'neutral': '#9d7cff',
    'soft_smile': '#ff88dd',
    'attentive': '#00ddff',
    'warm_focus': '#ffaa44',
    'explain_mode': '#7799ff',
    'lifted_brows': '#ffdd88',
    'relaxed_brows': '#88ccff',
    'tiny_nod': '#99ff99',
  };

  return colors[expression] || '#9d7cff';
}

/**
 * Icône selon expression
 */
export function getExpressionIcon(expression: FacialExpression): string {
  const icons: Record<FacialExpression, string> = {
    'neutral': '😐',
    'soft_smile': '🙂',
    'attentive': '👀',
    'warm_focus': '🤗',
    'explain_mode': '🧐',
    'lifted_brows': '🤨',
    'relaxed_brows': '😌',
    'tiny_nod': '👍',
  };

  return icons[expression] || '😐';
}

// ═══════════════════════════════════════════════════════════════════════════════
//   SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const immersiveAvatarBridge = new ImmersiveAvatarBridge();
