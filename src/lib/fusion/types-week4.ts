/**
 * TITANE∞ Fusion Backend - TypeScript Type Definitions - Week 4
 * Commands: fusion_update_state, fusion_auto_optimize
 *
 * © 2026 Kevin Thibault / TITANE Team
 */

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 7: fusion_update_state
// ═══════════════════════════════════════════════════════════════════════════

export interface UpdateStateRequest {
  current_state: Record<string, unknown>;
  intention?: Record<string, unknown>;
  activation?: Record<string, unknown>;
  style_config?: Record<string, unknown>;
  response_text?: string;
  coherence_score?: number;
}

export interface UpdateStateResponse {
  success: boolean;
  message: string;
  updated_state: Record<string, unknown>;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 8: fusion_auto_optimize
// ═══════════════════════════════════════════════════════════════════════════

export interface PipelineStatsPayload {
  step1_analyse_ms: number;
  step2_activation_ms: number;
  step3_styles_ms: number;
  step4_generation_ms: number;
  step5_tts_ms: number;
  step6_lipsync_ms: number;
  step7_animation_ms: number;
  step8_state_ms: number;
  step9_optimization_ms: number;
  total_ms: number;
}

export interface AutoOptimizeRequest {
  stats: PipelineStatsPayload;
}

export interface AutoOptimizeResponse {
  success: boolean;
  message: string;
  bottlenecks: string[];
  recommendations: string[];
  optimization_level: 'optimal' | 'elevated' | 'critical' | string;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPE GUARDS
// ═══════════════════════════════════════════════════════════════════════════

export function isUpdateStateSuccess(
  response: unknown
): response is UpdateStateResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    (response as UpdateStateResponse).success === true &&
    'updated_state' in (response as UpdateStateResponse)
  );
}

export function isAutoOptimizeSuccess(
  response: unknown
): response is AutoOptimizeResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    (response as AutoOptimizeResponse).success === true &&
    'optimization_level' in (response as AutoOptimizeResponse)
  );
}
