/**
 * TITANE∞ v∞.28.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ VOCAL DEV CONSOLE UI v∞
 *   Composant React pour Console Vocale Interactive
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useRef } from 'react';
import { useVocalDevConsole } from '@/hooks/useVocalDevConsole';
import type { VocalConsoleLog } from '@/modules/vocalDev/VocalDevConsoleEngine';
import './VocalDevConsole.css';

export interface VocalDevConsoleProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Console Dev Vocale Interactive
 */
export function VocalDevConsole({ className = '', style }: VocalDevConsoleProps) {
  const {
    state,
    _config,
    activate,
    deactivate,
    open,
    close,
    startRecording,
    stopRecording,
    executeCommand,
    _speak,
    stopSpeaking,
    clearLogs,
    clearHistory,
    isRecording,
    isSpeaking,
    consoleLogs,
    executionHistory,
    healthScore,
  } = useVocalDevConsole();

  const [inputText, setInputText] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLogs]);

  // ═══ HANDLERS ═══

  const handleMicrophoneClick = async () => {
    if (isRecording) {
      // Stop recording and process
      setIsExecuting(true);
      const transcript = await stopRecording();
      if (transcript) {
        await executeCommand(transcript);
      }
      setIsExecuting(false);
    } else {
      // Start recording
      await startRecording();
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isExecuting) return;

    setIsExecuting(true);
    await executeCommand(inputText);
    setInputText('');
    setIsExecuting(false);
  };

  const handleToggleTTS = async () => {
    if (isSpeaking) {
      await stopSpeaking();
    }
  };

  const handleActivateVocal = async () => {
    if (state.isActive) {
      await deactivate();
    } else {
      await activate();
    }
  };

  // ═══ RENDER ═══

  if (!state.isVisible) {
    return (
      <button className="vocal-dev-console-toggle" onClick={open} title="Open Vocal Dev Console">
        🎤 Console
      </button>
    );
  }

  return (
    <div className={`vocal-dev-console ${className}`} style={style}>
      {/* Header */}
      <div className="vocal-dev-console__header">
        <div className="vocal-dev-console__title">
          <span className="vocal-dev-console__icon">🎤</span>
          <span className="vocal-dev-console__text">TITANE∞ Vocal Dev Console</span>
          <span className={`vocal-dev-console__status vocal-dev-console__status--${state.mode}`}>
            {state.mode.toUpperCase()}
          </span>
        </div>

        <div className="vocal-dev-console__actions">
          <button
            className={`vocal-dev-console__btn ${state.isActive ? 'active' : ''}`}
            onClick={handleActivateVocal}
            title={state.isActive ? 'Deactivate vocal' : 'Activate vocal'}
          >
            {state.isActive ? '🎙️ ON' : '🎙️ OFF'}
          </button>

          <button
            className="vocal-dev-console__btn"
            onClick={clearLogs}
            title="Clear logs"
          >
            🗑️
          </button>

          <button
            className="vocal-dev-console__btn"
            onClick={close}
            title="Close console"
          >
            ✖️
          </button>
        </div>
      </div>

      {/* Health Score */}
      <div className="vocal-dev-console__health">
        <div className="vocal-dev-console__health-bar">
          <div
            className="vocal-dev-console__health-fill"
            style={{
              width: `${healthScore}%`,
              backgroundColor: healthScore > 80 ? '#4caf50' : healthScore > 50 ? '#ff9800' : '#f44336',
            }}
          />
        </div>
        <span className="vocal-dev-console__health-text">Health: {healthScore}%</span>
      </div>

      {/* Logs Container */}
      <div className="vocal-dev-console__logs">
        {consoleLogs.length === 0 ? (
          <div className="vocal-dev-console__logs-empty">
            No logs yet. Start by recording a voice command or typing below.
          </div>
        ) : (
          consoleLogs.map((log) => (
            <LogEntry key={log.id} log={log} />
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Execution History */}
      {executionHistory.length > 0 && (
        <div className="vocal-dev-console__history">
          <div className="vocal-dev-console__history-title">
            Recent Commands
            <button
              className="vocal-dev-console__btn-small"
              onClick={clearHistory}
              title="Clear history"
            >
              Clear
            </button>
          </div>
          <div className="vocal-dev-console__history-list">
            {executionHistory.slice(0, 5).map((exec, _idx) => (
              <div
                key={exec.timestamp}
                className={`vocal-dev-console__history-item vocal-dev-console__history-item--${exec.intent.type}`}
              >
                <span className="vocal-dev-console__history-icon">
                  {exec.exitCode === 0 ? '✅' : '❌'}
                </span>
                <span className="vocal-dev-console__history-command">
                  {exec.intent.rawCommand}
                </span>
                <span className="vocal-dev-console__history-time">
                  {exec.duration}ms
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Container */}
      <div className="vocal-dev-console__input-container">
        {/* Microphone Button */}
        <button
          className={`vocal-dev-console__mic ${
            isRecording ? 'vocal-dev-console__mic--recording' : ''
          } ${
            isSpeaking ? 'vocal-dev-console__mic--speaking' : ''
          }`}
          onClick={handleMicrophoneClick}
          disabled={!state.isActive || isExecuting || isSpeaking}
          title={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <>
              <span className="vocal-dev-console__mic-icon">⏹️</span>
              <span className="vocal-dev-console__mic-text">
                Stop ({Math.round(state.recordingState.duration / 1000)}s)
              </span>
            </>
          ) : (
            <>
              <span className="vocal-dev-console__mic-icon">🎤</span>
              <span className="vocal-dev-console__mic-text">Record</span>
            </>
          )}
        </button>

        {/* TTS Indicator */}
        {isSpeaking && (
          <button
            className="vocal-dev-console__tts-indicator"
            onClick={handleToggleTTS}
            title="Stop speaking"
          >
            🔊 Speaking... (Click to stop)
          </button>
        )}

        {/* Text Input */}
        <form className="vocal-dev-console__input-form" onSubmit={handleTextSubmit}>
          <input
            type="text"
            className="vocal-dev-console__input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isRecording
                ? 'Recording...'
                : state.isActive
                ? 'Type command or use microphone...'
                : 'Activate vocal mode first'
            }
            disabled={isRecording || isExecuting || !state.isActive}
          />
          <button
            type="submit"
            className="vocal-dev-console__submit"
            disabled={!inputText.trim() || isRecording || isExecuting || !state.isActive}
          >
            {isExecuting ? '⏳' : '➤'}
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Log Entry Component
 */
function LogEntry({ log }: { log: VocalConsoleLog }) {
  const iconMap = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    debug: '🐛',
  };

  const timestamp = new Date(log.timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className={`vocal-dev-console__log vocal-dev-console__log--${log.level}`}>
      <span className="vocal-dev-console__log-time">[{timestamp}]</span>
      <span className="vocal-dev-console__log-icon">{iconMap[log.level]}</span>
      <span className="vocal-dev-console__log-message">{log.message}</span>
      {log.metadata && (
        <pre className="vocal-dev-console__log-metadata">
          {JSON.stringify(log.metadata, null, 2)}
        </pre>
      )}
    </div>
  );
}
