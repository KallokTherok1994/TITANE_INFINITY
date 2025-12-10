/**
 * TITANE_INFINITY v∞.29.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞ — LiveDebuggerConsole Component
 *   Real-time debugging console with streaming diagnostics
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLiveDebugger } from '@/hooks/useLiveDebugger';
import './LiveDebuggerConsole.css';

export function LiveDebuggerConsole() {
  const {
    state: _unusedState,
    config,
    activate,
    deactivate,
    startListening,
    stopListening,
    isListening,
    isAnalyzing,
    isPatching,
    diagnostics,
    recentDiagnostics: _recentDiagnostics,
    lastDiagnostic: _lastDiagnostic,
    appliedPatches,
    mode,
    setMode,
    healthScore,
    currentTranscript,
    segmentBuffer,
    stats,
    reset,
    clearDiagnostics,
    configure,
  } = useLiveDebugger();

  const [isExpanded, setIsExpanded] = useState(false);
  const diagnosticsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new diagnostic
  useEffect(() => {
    if (diagnosticsEndRef.current) {
      diagnosticsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [diagnostics.length]);

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const handleActivate = async () => {
    try {
      await activate(mode);
    } catch (error) {
      console.error('Failed to activate Live Debugger:', error);
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivate();
    } catch (error) {
      console.error('Failed to deactivate Live Debugger:', error);
    }
  };

  const handleToggleListening = async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  const handleModeChange = (newMode: typeof mode) => {
    setMode(newMode);
  };

  const handleToggleAutoHeal = () => {
    configure({ autoHealEnabled: !config.autoHealEnabled });
  };

  const handleToggleTTS = () => {
    configure({ ttsEnabled: !config.ttsEnabled });
  };

  const handleToggleExplain = () => {
    configure({ explainWhileDebugging: !config.explainWhileDebugging });
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  if (!config.enabled && !isExpanded) {
    return (
      <button
        className="live-debugger-toggle-button"
        onClick={() => setIsExpanded(true)}
        title="Open Live Debugger"
      >
        🔴 Live Debugger
      </button>
    );
  }

  return (
    <div className={`live-debugger-console ${isExpanded ? 'expanded' : 'minimized'}`}>
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="live-debugger-header">
        <div className="header-left">
          <h3>🔴 LIVE DEBUGGER v∞</h3>
          <span className={`mode-badge mode-${mode}`}>{mode.toUpperCase()}</span>
          {isListening && <span className="listening-indicator pulse">🎤 LISTENING</span>}
          {isAnalyzing && <span className="analyzing-indicator">🔍 ANALYZING</span>}
          {isPatching && <span className="patching-indicator">🔧 PATCHING</span>}
        </div>

        <div className="header-right">
          {!config.enabled ? (
            <button className="btn-activate" onClick={handleActivate}>
              ⚡ ACTIVATE
            </button>
          ) : (
            <>
              <button className="btn-deactivate" onClick={handleDeactivate}>
                ⏹️ STOP
              </button>
              <button
                className="btn-clear"
                onClick={clearDiagnostics}
                title="Clear diagnostics"
              >
                🗑️
              </button>
              <button className="btn-reset" onClick={reset} title="Reset session">
                ♻️
              </button>
            </>
          )}
          <button className="btn-minimize" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? '📕' : '📖'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* HEALTH BAR */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="health-section">
            <div className="health-label">
              <span>System Health: {healthScore}%</span>
              <span className="stats-summary">
                {stats.totalDiagnostics} diagnostics · {stats.totalPatches} patches ·{' '}
                {(stats.sessionDuration / 1000).toFixed(0)}s
              </span>
            </div>
            <div className="health-bar-container">
              <div
                className={`health-bar health-${healthScore >= 80 ? 'good' : healthScore >= 50 ? 'medium' : 'low'}`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* MODE SELECTOR */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="mode-selector-section">
            <label>Mode:</label>
            <div className="mode-buttons">
              {(['shadow', 'active', 'auto-heal', 'explain', 'draft'] as const).map(m => (
                <button
                  key={m}
                  className={`mode-btn ${mode === m ? 'active' : ''}`}
                  onClick={() => handleModeChange(m)}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="mode-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.autoHealEnabled}
                  onChange={handleToggleAutoHeal}
                />
                <span>Auto-Heal</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.ttsEnabled}
                  onChange={handleToggleTTS}
                />
                <span>TTS</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.explainWhileDebugging}
                  onChange={handleToggleExplain}
                />
                <span>Explain</span>
              </label>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TRANSCRIPT STREAM */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="transcript-section">
            <div className="transcript-header">
              <span>🎙️ Transcript Stream</span>
              {segmentBuffer.length > 0 && (
                <span className="segment-count">{segmentBuffer.length} segments</span>
              )}
            </div>
            <div className="transcript-display">
              {currentTranscript || (
                <span className="transcript-placeholder">
                  {isListening ? 'Listening...' : 'Not listening'}
                </span>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* DIAGNOSTICS STREAM */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="diagnostics-section">
            <div className="diagnostics-header">
              <span>🔍 Diagnostics ({diagnostics.length})</span>
              {isAnalyzing && <span className="analyzing-dot pulse">●</span>}
            </div>

            <div className="diagnostics-list">
              {diagnostics.length === 0 ? (
                <div className="empty-state">
                  <p>No diagnostics yet</p>
                  <p className="hint">Start listening to analyze voice input</p>
                </div>
              ) : (
                diagnostics
                  .slice(-10)
                  .map((diagnostic, index) => (
                    <DiagnosticItem
                      key={`${diagnostic.timestamp}-${index}`}
                      diagnostic={diagnostic}
                    />
                  ))
              )}
              <div ref={diagnosticsEndRef} />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* APPLIED PATCHES */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {appliedPatches.length > 0 && (
            <div className="patches-section">
              <div className="patches-header">
                <span>✅ Applied Patches ({appliedPatches.length})</span>
              </div>
              <div className="patches-list">
                {appliedPatches.slice(-5).map((patch, index) => (
                  <div key={index} className="patch-item">
                    <span className="patch-module">{patch.module}</span>
                    <span className="patch-reason">{patch.reason}</span>
                    <span
                      className={`patch-confidence confidence-${Math.round(patch.confidence * 100)}`}
                    >
                      {(patch.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* CONTROLS */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="controls-section">
            <button
              className={`btn-listen ${isListening ? 'listening' : ''}`}
              onClick={handleToggleListening}
              disabled={!config.enabled}
            >
              {isListening ? '⏹️ STOP LISTENING' : '🎤 START LISTENING'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DIAGNOSTIC ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface DiagnosticItemProps {
  diagnostic: {
    timestamp: number;
    intent: {
      type: string;
      confidence: number;
      severity: string;
    };
    analysis: string;
    rootCause: string | null;
    suggestedFix: string | null;
    microPatch: { module: string; safe: boolean } | null;
    macroPatch: { description: string; requiresReview: boolean } | null;
  };
}

function DiagnosticItem({ diagnostic }: DiagnosticItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const severityIcon =
    {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴',
    }[diagnostic.intent.severity] || '⚪';

  const intentIcon =
    {
      dev: '💻',
      bug: '🐛',
      ui: '🎨',
      backend: '🦀',
      heal: '🔧',
      diagnostic: '🔍',
      question: '❓',
      command: '⚡',
    }[diagnostic.intent.type] || '📋';

  const time = new Date(diagnostic.timestamp).toLocaleTimeString('fr-FR');

  return (
    <div className={`diagnostic-item severity-${diagnostic.intent.severity}`}>
      <div className="diagnostic-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="diagnostic-time">{time}</span>
        <span className="diagnostic-icon">
          {severityIcon} {intentIcon}
        </span>
        <span className="diagnostic-type">{diagnostic.intent.type}</span>
        <span className="diagnostic-confidence">
          {(diagnostic.intent.confidence * 100).toFixed(0)}%
        </span>
        <button className="diagnostic-expand">{isExpanded ? '▼' : '▶'}</button>
      </div>

      {isExpanded && (
        <div className="diagnostic-details">
          <div className="diagnostic-analysis">
            <strong>Analysis:</strong> {diagnostic.analysis}
          </div>

          {diagnostic.rootCause && (
            <div className="diagnostic-root-cause">
              <strong>Root Cause:</strong> {diagnostic.rootCause}
            </div>
          )}

          {diagnostic.suggestedFix && (
            <div className="diagnostic-fix">
              <strong>Suggested Fix:</strong> {diagnostic.suggestedFix}
            </div>
          )}

          {diagnostic.microPatch && (
            <div className="diagnostic-patch micro-patch">
              <strong>🔧 Micro Patch:</strong> {diagnostic.microPatch.module}
              {diagnostic.microPatch.safe && <span className="patch-safe">✅ SAFE</span>}
            </div>
          )}

          {diagnostic.macroPatch && (
            <div className="diagnostic-patch macro-patch">
              <strong>📦 Macro Patch:</strong> {diagnostic.macroPatch.description}
              {diagnostic.macroPatch.requiresReview && (
                <span className="patch-review">⚠️ REQUIRES REVIEW</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
