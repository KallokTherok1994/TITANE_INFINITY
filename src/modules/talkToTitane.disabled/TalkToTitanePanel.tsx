/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ TALK-TO-TITANE PANEL v∞.30.0
 *   Super Prompt #20 — UI Assistant Vocal
 * ═══════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { useTalkToTitane } from './useTalkToTitane';
import type { TalkToTitaneMode } from './TalkToTitaneEngine';
import './TalkToTitanePanel.css';

export const TalkToTitanePanel: React.FC = () => {
  const {
    state,
    config,
    isActive,
    isListening,
    currentMode,
    lastResponse,
    conversationHistory,
    activate,
    deactivate,
    stopListening,
    setMode,
    setEmotionalCalibration,
    stats,
  } = useTalkToTitane();

  const handleActivate = async () => {
    await activate('continuous');
  };

  const handleDeactivate = async () => {
    await deactivate();
  };

  const handleModeChange = (mode: TalkToTitaneMode) => {
    setMode(mode);
  };

  const handleEmotionalChange = (tone: 'analytical' | 'calm' | 'energizing' | 'motivating' | 'neutral') => {
    setEmotionalCalibration(tone);
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  };

  return (
    <div className="talk-to-titane-panel">
      {/* Header */}
      <div className="talk-header">
        <h2>🎤 TALK-TO-TITANE v∞</h2>
        <div className="talk-status">
          {isActive && (
            <span className={`status-badge ${isListening ? 'listening' : 'idle'}`}>
              {isListening ? '🎤 LISTENING' : '⏸️ IDLE'}
            </span>
          )}
          {!isActive && <span className="status-badge inactive">❌ INACTIVE</span>}
        </div>
      </div>

      {/* Wake Phrases */}
      {isActive && (
        <div className="wake-phrases">
          <div className="section-label">Wake Phrases:</div>
          <div className="phrases-list">
            {config.wakePhrases.map((phrase, i) => (
              <span key={i} className="phrase-badge">"{phrase}"</span>
            ))}
          </div>
        </div>
      )}

      {/* Mode Selector */}
      <div className="mode-selector">
        <div className="section-label">Mode:</div>
        <div className="mode-buttons">
          {(['continuous', 'whispered', 'direct', 'calibrated', 'focus'] as TalkToTitaneMode[]).map((mode) => (
            <button
              key={mode}
              className={`mode-btn ${currentMode === mode ? 'active' : ''}`}
              onClick={() => handleModeChange(mode)}
              disabled={!isActive}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Emotional Calibration */}
      <div className="emotional-selector">
        <div className="section-label">Emotional Tone:</div>
        <div className="emotional-buttons">
          {(['analytical', 'calm', 'energizing', 'motivating', 'neutral'] as const).map((tone) => (
            <button
              key={tone}
              className={`emotional-btn ${state.emotionalCalibration === tone ? 'active' : ''}`}
              onClick={() => handleEmotionalChange(tone)}
              disabled={!isActive}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      {/* Current Intent */}
      {lastResponse && (
        <div className="current-intent">
          <div className="section-label">Last Intent:</div>
          <div className="intent-card">
            <div className="intent-header">
              <span className="intent-type">{lastResponse.intent.type}</span>
              <span className="intent-confidence">{(lastResponse.intent.confidence * 100).toFixed(0)}%</span>
              <span className="intent-tone">{lastResponse.intent.emotionalTone}</span>
              <span className="intent-priority">{lastResponse.intent.priority}</span>
            </div>
            <div className="intent-text">"{lastResponse.intent.text}"</div>
            {lastResponse.intent.keywords.length > 0 && (
              <div className="intent-keywords">
                Keywords: {lastResponse.intent.keywords.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Last Response */}
      {lastResponse && (
        <div className="last-response">
          <div className="section-label">Last Response:</div>
          <div className="response-card">
            <div className="response-analysis">
              <strong>Analysis:</strong> {lastResponse.analysis}
            </div>
            <div className="response-text">
              <strong>Response:</strong> {lastResponse.response}
            </div>
            {lastResponse.vocalResponse && (
              <div className="response-vocal">
                <strong>Vocal:</strong> {lastResponse.vocalResponse}
              </div>
            )}
            {lastResponse.action && (
              <div className="response-action">
                <strong>Action:</strong> <code>{lastResponse.action}</code>
              </div>
            )}
            {lastResponse.followUpSuggestions.length > 0 && (
              <div className="response-suggestions">
                <strong>Suggestions:</strong>
                <ul>
                  {lastResponse.followUpSuggestions.map((suggestion, i) => (
                    <li key={i}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conversation History */}
      <div className="conversation-history">
        <div className="section-label">History ({conversationHistory.length}):</div>
        <div className="history-list">
          {conversationHistory.slice(-5).reverse().map((item, i) => (
            <div key={i} className="history-item">
              <div className="history-header">
                <span className="history-type">{item.intent.type}</span>
                <span className="history-confidence">{(item.intent.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="history-text">"{item.intent.text}"</div>
              <div className="history-response">{item.response.substring(0, 100)}...</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="section-label">Session Stats:</div>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">Session ID:</div>
            <div className="stat-value">{stats.sessionId || 'N/A'}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Interactions:</div>
            <div className="stat-value">{stats.totalInteractions}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Duration:</div>
            <div className="stat-value">{formatDuration(stats.sessionDuration)}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        {!isActive && (
          <button className="control-btn activate" onClick={handleActivate}>
            ▶️ START TALK-TO-TITANE
          </button>
        )}
        {isActive && (
          <>
            {isListening && (
              <button className="control-btn stop" onClick={stopListening}>
                ⏸️ STOP LISTENING
              </button>
            )}
            <button className="control-btn deactivate" onClick={handleDeactivate}>
              ⏹️ DEACTIVATE
            </button>
          </>
        )}
      </div>
    </div>
  );
};
