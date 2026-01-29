/**
 * TITANE∞ Fusion Backend - Tauri Command Wrappers - Week 4
 * Type-safe async bindings for state update and auto-optimization
 *
 * © 2026 Kevin Thibault / TITANE Team
 */

import { secureInvoke } from '@/lib/security';
import type {
  UpdateStateRequest,
  UpdateStateResponse,
  AutoOptimizeRequest,
  AutoOptimizeResponse,
  PipelineStatsPayload,
} from './types-week4';
import { isUpdateStateSuccess, isAutoOptimizeSuccess } from './types-week4';

export async function updateFusionState(
  request: UpdateStateRequest
): Promise<UpdateStateResponse> {
  try {
    const response = await secureInvoke<UpdateStateResponse>('fusion_update_state', {
      request,
    });

    if (!isUpdateStateSuccess(response)) {
      throw new Error(typeof response === 'string' ? response : 'Unknown error');
    }

    return response;
  } catch (error) {
    throw new Error(
      `Fusion state update failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function autoOptimizeFusion(
  request: AutoOptimizeRequest
): Promise<AutoOptimizeResponse> {
  try {
    const response = await secureInvoke<AutoOptimizeResponse>('fusion_auto_optimize', {
      request,
    });

    if (!isAutoOptimizeSuccess(response)) {
      throw new Error(typeof response === 'string' ? response : 'Unknown error');
    }

    return response;
  } catch (error) {
    throw new Error(
      `Fusion auto-optimization failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function autoOptimizeFromStats(
  stats: PipelineStatsPayload
): Promise<AutoOptimizeResponse> {
  return autoOptimizeFusion({ stats });
}
