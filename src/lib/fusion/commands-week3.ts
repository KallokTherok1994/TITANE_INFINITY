/**
 * TITANE∞ Fusion Backend - Tauri Command Wrappers - Week 3
 * Type-safe async bindings for lip-sync commands
 *
 * © 2026 Kevin Thibault / TITANE Team
 */

import { secureInvoke } from '@/lib/security';
import type {
  LipSyncProcessRequest,
  LipSyncProcessResponse,
} from './types-week3';
import { isLipSyncProcessSuccess } from './types-week3';

/**
 * Process lip-sync data from text
 */
export async function processLipSync(
  request: LipSyncProcessRequest
): Promise<LipSyncProcessResponse> {
  try {
    const response = await secureInvoke<LipSyncProcessResponse>(
      'fusion_process_lipsync',
      { request }
    );

    if (!isLipSyncProcessSuccess(response)) {
      throw new Error(typeof response === 'string' ? response : 'Unknown error');
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
