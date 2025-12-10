/**
 * TITANE_INFINITY v19.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3 — VOICE UI (Migré vers useVoiceEngine)
 *   Interface Voice Mode avec VAD - Version unifiée Tauri
 * ═══════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { useVoiceEngine } from '@/hooks/useVoiceEngine';
import { useChat } from '../hooks/useChat';
import { VADIndicator } from './VADIndicator';
// import './VoiceUI.css';

export const VoiceUI: React.FC = () => {
  const { status, startDictation, stopDictation, clearTranscript } = useVoiceEngine();
  const { sendMessage } = useChat({ voiceEnabled: true });

  const toggleVoiceMode = async () => {
    if (status.isRecording) {
      await stopDictation();
    } else {
      await startDictation();
    }
  };

  const handleTranscriptSubmit = async () => {
    if (status.transcript.trim()) {
      await sendMessage(status.transcript);
      clearTranscript();
    }
  };

  // Dérive l'état VAD du status
  const isVadActive = status.state === 'listening';

  return (
    <div className="voice-ui">
      <div className="voice-header">
        <h3>🎤 Voice Mode</h3>
        <button
          className={`voice-toggle ${status.isRecording ? 'active' : ''}`}
          onClick={toggleVoiceMode}
        >
          {status.isRecording ? 'Stop' : 'Start'}
        </button>
      </div>

      <VADIndicator active={isVadActive} />

      <div className="voice-status">
        {status.isRecording && (
          <span className="status-badge recording">🔴 Recording</span>
        )}
        {status.state === 'processing' && (
          <span className="status-badge transcribing">⏳ Transcribing...</span>
        )}
        {status.state === 'speaking' && (
          <span className="status-badge speaking">🔊 Speaking</span>
        )}
      </div>

      {status.transcript && (
        <div className="voice-transcript">
          <h4>Transcription:</h4>
          <p>{status.transcript}</p>
          <button onClick={handleTranscriptSubmit}>Envoyer</button>
        </div>
      )}
    </div>
  );
};
