/**
 * TITANE∞ v20.0 — EngineCard Component
 * Super Prompt #3: DevTools UI Advanced Suite
 * @license MIT
 */

import React from 'react';
import { StatusPill, type StatusVariant } from './StatusPill';
import type { Engine, EngineStatus } from '../store/devtools.store';

export interface EngineCardProps {
  engine: Engine;
  onRestart?: (id: string) => void;
  onInspect?: (id: string) => void;
  onViewLogs?: (id: string) => void;
  compact?: boolean;
  className?: string;
}

const statusToVariant: Record<EngineStatus, StatusVariant> = {
  running: 'success',
  idle: 'idle',
  error: 'error',
  starting: 'warning',
  stopped: 'error',
};

/**
 * EngineCard - Carte d'état d'un moteur cognitif
 * 
 * @example
 * ```tsx
 * <EngineCard
 *   engine={heliosEngine}
 *   onRestart={(id) => console.log('Restart', id)}
 *   onInspect={(id) => console.log('Inspect', id)}
 * />
 * ```
 */
export function EngineCard({
  engine,
  onRestart,
  onInspect,
  onViewLogs,
  compact = false,
  className = '',
}: EngineCardProps) {
  const statusVariant = statusToVariant[engine.status];

  return (
    <div
      className={`rounded-lg p-4 border transition-all duration-200 hover:border-opacity-30 ${className}`}
      style={{
        background: 'var(--bg-panel, #101216)',
        borderColor:
          engine.status === 'error'
            ? 'var(--border-danger, #8b5f5f)'
            : 'var(--border, rgba(196,196,196,0.12))',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3
            className="text-base font-semibold mb-1"
            style={{ color: 'var(--text-primary, #e0e0e0)' }}
          >
            {engine.name}
          </h3>
          <StatusPill status={statusVariant} label={engine.status} size="sm" />
        </div>

        {engine.errorCount > 0 && (
          <span
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{
              background: 'rgba(139, 95, 95, 0.15)',
              color: 'var(--text-danger, #8b5f5f)',
            }}
          >
            {engine.errorCount} errors
          </span>
        )}
      </div>

      {/* Metrics */}
      {!compact && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div
              className="text-xs mb-1"
              style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
            >
              CPU
            </div>
            <div className="flex items-center gap-2">
              <div
                className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{ background: 'var(--bg-surface, #181c21)' }}
              >
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${engine.cpu}%`,
                    background:
                      engine.cpu > 80
                        ? 'var(--bg-danger, #8b5f5f)'
                        : engine.cpu > 50
                          ? 'var(--bg-warning, #e3d5d5)'
                          : 'var(--bg-success, #93b399)',
                  }}
                />
              </div>
              <span
                className="text-xs font-medium w-8 text-right"
                style={{ color: 'var(--text-primary, #e0e0e0)' }}
              >
                {engine.cpu}%
              </span>
            </div>
          </div>

          <div>
            <div
              className="text-xs mb-1"
              style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
            >
              Memory
            </div>
            <div className="flex items-center gap-2">
              <div
                className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{ background: 'var(--bg-surface, #181c21)' }}
              >
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${Math.min((engine.memory / 200) * 100, 100)}%`,
                    background: 'var(--bg-primary, #727b81)',
                  }}
                />
              </div>
              <span
                className="text-xs font-medium w-12 text-right"
                style={{ color: 'var(--text-primary, #e0e0e0)' }}
              >
                {engine.memory}MB
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Last Execution */}
      {engine.lastExecution && !compact && (
        <div className="mb-4">
          <div
            className="text-xs mb-1"
            style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
          >
            Dernière exécution
          </div>
          <div
            className="text-sm font-medium"
            style={{ color: 'var(--text-primary, #e0e0e0)' }}
          >
            {engine.executionDuration ? `${engine.executionDuration}ms` : 'N/A'}
            <span className="text-xs ml-2" style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}>
              ({new Date(engine.lastExecution).toLocaleTimeString()})
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      {!compact && (
        <div className="flex items-center gap-2">
          {onRestart && (
            <button
              onClick={() => onRestart(engine.id)}
              className="flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150"
              style={{
                background: 'var(--bg-surface, #181c21)',
                color: 'var(--text-primary, #e0e0e0)',
                border: '1px solid var(--border, rgba(196,196,196,0.12))',
              }}
            >
              Restart
            </button>
          )}
          {onInspect && (
            <button
              onClick={() => onInspect(engine.id)}
              className="flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150"
              style={{
                background: 'var(--bg-surface, #181c21)',
                color: 'var(--text-primary, #e0e0e0)',
                border: '1px solid var(--border, rgba(196,196,196,0.12))',
              }}
            >
              Inspect
            </button>
          )}
          {onViewLogs && (
            <button
              onClick={() => onViewLogs(engine.id)}
              className="flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150"
              style={{
                background: 'var(--bg-surface, #181c21)',
                color: 'var(--text-primary, #e0e0e0)',
                border: '1px solid var(--border, rgba(196,196,196,0.12))',
              }}
            >
              Logs
            </button>
          )}
        </div>
      )}
    </div>
  );
}
