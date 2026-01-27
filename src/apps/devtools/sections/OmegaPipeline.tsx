/**
 * TITANE∞ v20.0 — OmegaPipeline Section
 * Super Prompt #3: DevTools UI Advanced Suite
 * @license MIT
 */

import React from 'react';
import { useDevToolsStore, type OmegaStep } from '../store/devtools.store';
import { SectionHeader } from '../components';

const stepIcons: Record<string, string> = {
  input: '📥',
  normalize: '🔄',
  coherence: '🧩',
  memory: '🧠',
  engines: '⚙️',
  conversation: '💬',
  output: '📤',
  enrichment: '✨',
};

const statusColors: Record<
  OmegaStep['status'],
  { bg: string; text: string; border: string }
> = {
  pending: {
    bg: 'var(--bg-surface, #181c21)',
    text: 'var(--text-muted, rgba(255,255,255,0.60))',
    border: 'var(--border, rgba(196,196,196,0.12))',
  },
  running: {
    bg: 'rgba(114, 123, 129, 0.15)',
    text: 'var(--text-info, #727b81)',
    border: 'var(--border-info, #727b81)',
  },
  complete: {
    bg: 'rgba(147, 179, 153, 0.15)',
    text: 'var(--text-success, #93b399)',
    border: 'var(--border-success, #93b399)',
  },
  error: {
    bg: 'rgba(139, 95, 95, 0.15)',
    text: 'var(--text-danger, #8b5f5f)',
    border: 'var(--border-danger, #8b5f5f)',
  },
};

/**
 * OmegaPipeline - Visualisation du pipeline OMEGA
 */
export function OmegaPipeline() {
  const { currentPipeline, pipelineHistory } = useDevToolsStore();

  const totalDuration = (currentPipeline || [])
    .filter(s => s.duration)
    .reduce((sum, s) => sum + (s.duration || 0), 0);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Omega Pipeline"
        description="Visualisation du flux de traitement TITANE∞"
        actions={
          <div className="flex items-center gap-3">
            <span
              className="text-xs"
              style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
            >
              Total: <span className="font-medium">{totalDuration}ms</span>
            </span>
            <span
              className="text-xs"
              style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
            >
              History: <span className="font-medium">{pipelineHistory.length}</span>
            </span>
          </div>
        }
      />

      {/* Current Pipeline */}
      <div>
        <h3
          className="text-base font-semibold mb-3"
          style={{ color: 'var(--text-primary, #e0e0e0)' }}
        >
          Current Execution
        </h3>

        {currentPipeline.length === 0 ? (
          <div
            className="flex items-center justify-center h-64 rounded-lg border"
            style={{
              background: 'var(--bg-panel, #101216)',
              borderColor: 'var(--border, rgba(196,196,196,0.12))',
            }}
          >
            <p
              className="text-sm"
              style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
            >
              No active pipeline execution
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentPipeline.map((step, index) => {
              const colors = statusColors[step.status];
              const icon = stepIcons[step.id] || '⚡';
              const isActive = step.status === 'running';

              return (
                <div key={step.id} className="relative">
                  {/* Connector Line */}
                  {index < currentPipeline.length - 1 && (
                    <div
                      className="absolute left-6 top-12 w-0.5 h-8 -mt-2"
                      style={{
                        background:
                          step.status === 'complete'
                            ? 'var(--bg-success, #93b399)'
                            : 'var(--border, rgba(196,196,196,0.12))',
                      }}
                    />
                  )}

                  {/* Step Card */}
                  <div
                    className={`p-4 rounded-lg border transition-all duration-300 ${isActive ? 'ring-2' : ''}`}
                    style={
                      {
                        background: colors.bg,
                        borderColor: colors.border,
                        '--tw-ring-color': isActive ? colors.border : undefined,
                      } as React.CSSProperties
                    }
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${isActive ? 'animate-pulse' : ''}`}
                        style={{
                          background: 'var(--bg-surface, #181c21)',
                          border: `2px solid ${colors.border}`,
                        }}
                      >
                        {icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4
                            className="text-base font-semibold"
                            style={{ color: 'var(--text-primary, #e0e0e0)' }}
                          >
                            {step.name}
                          </h4>
                          <span
                            className="text-xs font-medium px-2 py-1 rounded-full"
                            style={{
                              background: colors.bg,
                              color: colors.text,
                              border: `1px solid ${colors.border}`,
                            }}
                          >
                            {step.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Duration */}
                        {step.duration !== undefined && (
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="text-xs"
                              style={{
                                color: 'var(--text-muted, rgba(255,255,255,0.60))',
                              }}
                            >
                              Duration:
                            </span>
                            <span
                              className="text-xs font-medium"
                              style={{ color: 'var(--text-primary, #e0e0e0)' }}
                            >
                              {step.duration}ms
                            </span>
                            {step.duration > 0 && (
                              <div
                                className="flex-1 h-1.5 rounded-full overflow-hidden"
                                style={{ background: 'var(--bg-surface, #181c21)' }}
                              >
                                <div
                                  className="h-full transition-all duration-300"
                                  style={{
                                    width: `${Math.min((step.duration / totalDuration) * 100, 100)}%`,
                                    background: colors.border,
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Engines */}
                        {step.engines && step.engines.length > 0 && (
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="text-xs"
                              style={{
                                color: 'var(--text-muted, rgba(255,255,255,0.60))',
                              }}
                            >
                              Engines:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {step.engines.map(engine => (
                                <span
                                  key={engine}
                                  className="text-xs px-2 py-0.5 rounded-full"
                                  style={{
                                    background: 'var(--bg-surface, #181c21)',
                                    color: 'var(--text-primary, #e0e0e0)',
                                  }}
                                >
                                  {engine}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Error */}
                        {step.error && (
                          <div
                            className="text-xs p-2 rounded-md mt-2 font-mono"
                            style={{
                              background: 'rgba(139, 95, 95, 0.10)',
                              color: 'var(--text-danger, #8b5f5f)',
                            }}
                          >
                            {step.error}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pipeline History */}
      {pipelineHistory.length > 0 && (
        <div>
          <h3
            className="text-base font-semibold mb-3"
            style={{ color: 'var(--text-primary, #e0e0e0)' }}
          >
            Recent Executions
          </h3>
          <div
            className="rounded-lg border overflow-hidden"
            style={{
              background: 'var(--bg-panel, #101216)',
              borderColor: 'var(--border, rgba(196,196,196,0.12))',
            }}
          >
            {pipelineHistory.slice(0, 5).map((pipeline, historyIndex) => {
              const duration = pipeline
                .filter(s => s.duration)
                .reduce((sum, s) => sum + (s.duration || 0), 0);
              const hasErrors = pipeline.some(s => s.status === 'error');

              return (
                <div
                  key={historyIndex}
                  className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0 hover:bg-white hover:bg-opacity-5 transition-colors"
                  style={{
                    borderColor: 'var(--border, rgba(196,196,196,0.08))',
                  }}
                >
                  <span
                    className="text-xs font-mono"
                    style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
                  >
                    #{pipelineHistory.length - historyIndex}
                  </span>
                  <div className="flex-1 flex items-center gap-2">
                    {pipeline.map(step => (
                      <div
                        key={step.id}
                        className="w-8 h-2 rounded-full"
                        style={{
                          background: statusColors[step.status].border,
                        }}
                        title={`${step.name}: ${step.status}`}
                      />
                    ))}
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: 'var(--text-primary, #e0e0e0)' }}
                  >
                    {duration}ms
                  </span>
                  {hasErrors && (
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(139, 95, 95, 0.15)',
                        color: 'var(--text-danger, #8b5f5f)',
                      }}
                    >
                      ERROR
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
