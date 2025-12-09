/**
 * TITANE∞ v20.0 — Errors Section
 * Super Prompt #3: DevTools UI Advanced Suite
 * @license MIT
 */

import React, { useState } from 'react';
import { useDevToolsStore, type ErrorEntry } from '../store/devtools.store';
import { SectionHeader } from '../components';

/**
 * Errors - Gestion et visualisation des erreurs système
 */
export function Errors() {
  const { errors, resolveError, updateEngine } = useDevToolsStore();
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');
  const [selectedError, setSelectedError] = useState<ErrorEntry | null>(null);

  const filteredErrors = errors.filter((e) => {
    if (filter === 'unresolved') return !e.resolved;
    if (filter === 'resolved') return e.resolved;
    return true;
  });

  const handleRetry = (error: ErrorEntry) => {
    updateEngine(error.engine, { status: 'starting', errorCount: 0 });
    resolveError(error.id);
    setTimeout(() => {
      updateEngine(error.engine, { status: 'running' });
    }, 1000);
  };

  const handleResolve = (id: string) => {
    resolveError(id);
  };

  const impactColors = {
    high: { bg: 'rgba(139, 95, 95, 0.20)', text: 'var(--text-danger, #8b5f5f)', border: 'var(--border-danger, #8b5f5f)' },
    medium: { bg: 'rgba(227, 213, 213, 0.15)', text: 'var(--text-warning, #e3d5d5)', border: 'var(--border-warning, #e3d5d5)' },
    low: { bg: 'rgba(114, 123, 129, 0.15)', text: 'var(--text-info, #727b81)', border: 'var(--border-info, #727b81)' },
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Error Management"
        description="Erreurs système et diagnostics"
        actions={
          <div className="flex gap-2">
            {(['all', 'unresolved', 'resolved'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                  filter === status ? 'ring-1' : ''
                }`}
                style={{
                  background:
                    filter === status
                      ? 'var(--bg-primary, #727b81)'
                      : 'var(--bg-panel, #101216)',
                  color:
                    filter === status
                      ? 'var(--text-inverse, #ffffff)'
                      : 'var(--text-primary, #e0e0e0)',
                  borderColor: 'var(--border, rgba(196,196,196,0.12))',
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div
          className="p-4 rounded-lg border"
          style={{
            background: 'var(--bg-panel, #101216)',
            borderColor: 'var(--border, rgba(196,196,196,0.12))',
          }}
        >
          <div
            className="text-sm mb-1"
            style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
          >
            Total Errors
          </div>
          <div
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary, #e0e0e0)' }}
          >
            {errors.length}
          </div>
        </div>

        <div
          className="p-4 rounded-lg border"
          style={{
            background: 'var(--bg-panel, #101216)',
            borderColor: 'var(--border-danger, #8b5f5f)',
          }}
        >
          <div
            className="text-sm mb-1"
            style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
          >
            Unresolved
          </div>
          <div
            className="text-2xl font-bold"
            style={{ color: 'var(--text-danger, #8b5f5f)' }}
          >
            {errors.filter((e) => !e.resolved).length}
          </div>
        </div>

        <div
          className="p-4 rounded-lg border"
          style={{
            background: 'var(--bg-panel, #101216)',
            borderColor: 'var(--border, rgba(196,196,196,0.12))',
          }}
        >
          <div
            className="text-sm mb-1"
            style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
          >
            High Impact
          </div>
          <div
            className="text-2xl font-bold"
            style={{ color: 'var(--text-danger, #8b5f5f)' }}
          >
            {errors.filter((e) => e.impact === 'high' && !e.resolved).length}
          </div>
        </div>

        <div
          className="p-4 rounded-lg border"
          style={{
            background: 'var(--bg-panel, #101216)',
            borderColor: 'var(--border-success, #93b399)',
          }}
        >
          <div
            className="text-sm mb-1"
            style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
          >
            Resolved
          </div>
          <div
            className="text-2xl font-bold"
            style={{ color: 'var(--text-success, #93b399)' }}
          >
            {errors.filter((e) => e.resolved).length}
          </div>
        </div>
      </div>

      {/* Errors List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3
            className="text-base font-semibold mb-3"
            style={{ color: 'var(--text-primary, #e0e0e0)' }}
          >
            Error List
          </h3>
          <div className="space-y-3">
            {filteredErrors.length === 0 ? (
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
                  {filter === 'unresolved' ? 'No unresolved errors 🎉' : 'No errors match the filter'}
                </p>
              </div>
            ) : (
              filteredErrors.map((error) => {
                const colors = impactColors[error.impact];
                return (
                  <button
                    key={error.id}
                    onClick={() => setSelectedError(error)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-150 ${
                      selectedError?.id === error.id ? 'ring-2' : ''
                    } ${error.resolved ? 'opacity-50' : ''}`}
                    style={{
                      background: colors.bg,
                      borderColor: colors.border,
                      '--tw-ring-color': colors.border,
                    } as React.CSSProperties}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            background: 'var(--bg-surface, #181c21)',
                            color: colors.text,
                          }}
                        >
                          [{error.engine}]
                        </span>
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            background: colors.bg,
                            color: colors.text,
                            border: `1px solid ${colors.border}`,
                          }}
                        >
                          {error.impact.toUpperCase()}
                        </span>
                      </div>
                      {error.resolved && (
                        <span
                          className="text-xs font-medium"
                          style={{ color: 'var(--text-success, #93b399)' }}
                        >
                          ✓ Resolved
                        </span>
                      )}
                    </div>
                    <p
                      className="text-sm font-medium mb-1"
                      style={{ color: 'var(--text-primary, #e0e0e0)' }}
                    >
                      {error.message}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
                    >
                      {new Date(error.timestamp).toLocaleString()}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Error Details */}
        <div>
          <h3
            className="text-base font-semibold mb-3"
            style={{ color: 'var(--text-primary, #e0e0e0)' }}
          >
            Error Details
          </h3>
          {selectedError ? (
            <div
              className="p-4 rounded-lg border space-y-4"
              style={{
                background: 'var(--bg-panel, #101216)',
                borderColor: impactColors[selectedError.impact].border,
              }}
            >
              <div>
                <div
                  className="text-xs mb-1"
                  style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
                >
                  Message
                </div>
                <div
                  className="text-base font-semibold"
                  style={{ color: 'var(--text-primary, #e0e0e0)' }}
                >
                  {selectedError.message}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div
                    className="text-xs mb-1"
                    style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
                  >
                    Engine
                  </div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary, #e0e0e0)' }}
                  >
                    {selectedError.engine}
                  </div>
                </div>

                <div>
                  <div
                    className="text-xs mb-1"
                    style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
                  >
                    Impact
                  </div>
                  <span
                    className="text-sm font-medium px-2 py-0.5 rounded-full inline-block"
                    style={{
                      background: impactColors[selectedError.impact].bg,
                      color: impactColors[selectedError.impact].text,
                    }}
                  >
                    {selectedError.impact.toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <div
                  className="text-xs mb-1"
                  style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
                >
                  Timestamp
                </div>
                <div
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary, #e0e0e0)' }}
                >
                  {new Date(selectedError.timestamp).toLocaleString()}
                </div>
              </div>

              {selectedError.stack && (
                <div>
                  <div
                    className="text-xs mb-1"
                    style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
                  >
                    Stack Trace
                  </div>
                  <div
                    className="text-xs p-3 rounded-md font-mono overflow-x-auto"
                    style={{
                      background: 'var(--bg-surface, #181c21)',
                      color: 'var(--text-primary, #e0e0e0)',
                      maxHeight: '200px',
                      overflowY: 'auto',
                    }}
                  >
                    <pre>{selectedError.stack}</pre>
                  </div>
                </div>
              )}

              {!selectedError.resolved && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleRetry(selectedError)}
                    className="flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors duration-150 hover:bg-opacity-80"
                    style={{
                      background: 'var(--bg-surface, #181c21)',
                      color: 'var(--text-primary, #e0e0e0)',
                      borderColor: 'var(--border, rgba(196,196,196,0.12))',
                    }}
                  >
                    Retry Engine
                  </button>
                  <button
                    onClick={() => handleResolve(selectedError.id)}
                    className="flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors duration-150 hover:bg-opacity-80"
                    style={{
                      background: 'var(--bg-success, #93b399)',
                      color: 'var(--text-inverse, #ffffff)',
                      borderColor: 'var(--border-success, #93b399)',
                    }}
                  >
                    Mark Resolved
                  </button>
                </div>
              )}
            </div>
          ) : (
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
                Select an error to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
