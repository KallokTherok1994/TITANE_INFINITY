/**
 * TITANE∞ Fusion Backend - Tauri Command Wrappers - Week 3
 * Type-safe async bindings for lip-sync and avatar animation commands
 *
 * © 2026 Kevin Thibault / TITANE Team
 */

import { invoke } from '@tauri-apps/api/core';
import type {
  LipSyncProcessRequest,
  LipSyncProcessResponse,
  AnimateAvatarRequest,
  AnimateAvatarResponse,
  LipSyncData,
} from './types-week3';
import { isLipSyncProcessSuccess, isAnimateAvatarSuccess } from './types-week3';

/**
 * Process lip-sync data from text
 */
export async function processLipSync(
  request: LipSyncProcessRequest
): Promise<LipSyncProcessResponse> {
  try {
    const response = await invoke<LipSyncProcessResponse>(
      'fusion_process_lipsync',
      { request }
    );

    if (!isLipSyncProcessSuccess(response)) {
      throw new Error(
        typeof response === 'string' ? response : 'Unknown error'
      );
    }

    return response;
  } catch (error) {
    throw new Error(
      `Lip-sync processing failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Quick lip-sync processing from text with defaults
 */
export async function processLipSyncText(
  text: string,
  options?: {
    audio_duration_ms?: number;
    language?: string;
    intensity?: number;
    fps?: number;
    enable_smoothing?: boolean;
  }
): Promise<LipSyncProcessResponse> {
  return processLipSync({
    text,
    ...options,
  });
}

/**
 * Generate avatar animation keyframes from lip-sync data
 */
export async function animateAvatar(
  request: AnimateAvatarRequest
): Promise<AnimateAvatarResponse> {
  try {
    const response = await invoke<AnimateAvatarResponse>(
      'fusion_animate_avatar',
      { request }
    );

    if (!isAnimateAvatarSuccess(response)) {
      throw new Error(
        typeof response === 'string' ? response : 'Unknown error'
      );
    }

    return response;
  } catch (error) {
    throw new Error(
      `Avatar animation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Animate avatar from lip-sync data with defaults
 */
export async function animateFromLipSync(
  lipsync: LipSyncData,
  options?: {
    expression?: string;
    animation_style?: string;
    intensity?: number;
    fps?: number;
    include_head_motion?: boolean;
  }
): Promise<AnimateAvatarResponse> {
  return animateAvatar({
    lipsync,
    ...options,
  });
}
