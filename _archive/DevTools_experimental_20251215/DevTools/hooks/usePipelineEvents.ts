/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║   TITANE∞ v20.0 — usePipelineEvents Hook                          ║
 * ║   Listen to OMEGA pipeline events from Rust backend                ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect } from 'react';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import type { OmegaStepEvent, OmegaCompleteEvent } from '../types';

interface PipelineState {
  current_step: OmegaStepEvent | null;
  completed_steps: OmegaStepEvent[];
  pipeline_completed: boolean;
  pipeline_duration_ms: number;
  error: string | null;
}

export function usePipelineEvents() {
  const [state, setState] = useState<PipelineState>({
    current_step: null,
    completed_steps: [],
    pipeline_completed: false,
    pipeline_duration_ms: 0,
    error: null,
  });

  useEffect(() => {
    let unlistenStep: UnlistenFn | null = null;
    let unlistenComplete: UnlistenFn | null = null;

    const setupListeners = async () => {
      // Listen to OMEGA step events
      unlistenStep = await listen<OmegaStepEvent>('omega_step', event => {
        const step = event.payload;

        setState(prev => {
          const isCompleted = step.status === 'completed' || step.status === 'failed';

          return {
            ...prev,
            current_step: isCompleted ? null : step,
            completed_steps: isCompleted
              ? [...prev.completed_steps, step]
              : prev.completed_steps,
            error: step.status === 'failed' ? step.error || 'Unknown error' : prev.error,
          };
        });
      });

      // Listen to OMEGA complete events
      unlistenComplete = await listen<OmegaCompleteEvent>('omega_complete', event => {
        const complete = event.payload;

        setState(prev => ({
          ...prev,
          pipeline_completed: true,
          pipeline_duration_ms: complete.total_duration_ms,
          completed_steps: complete.steps,
          error: complete.success ? null : complete.error || 'Pipeline failed',
        }));
      });
    };

    setupListeners();

    return () => {
      unlistenStep?.();
      unlistenComplete?.();
    };
  }, []);

  const resetPipeline = () => {
    setState({
      current_step: null,
      completed_steps: [],
      pipeline_completed: false,
      pipeline_duration_ms: 0,
      error: null,
    });
  };

  return {
    ...state,
    resetPipeline,
  };
}
