// TITANE∞ v17.3.0 - VoiceUI Component
// Voice Mode interface with VAD and waveform

import React, { useEffect, useState } from 'react';
import { useVoiceMode } from '../hooks/useVoiceMode';
import { useChat } from '../hooks/useChat';
import { VADIndicator } from './VADIndicator';
// import './VoiceUI.css';

export const VoiceUI: React.FC = () => {
  const { state, startRecording, stopRecording, getVADState, clearTranscript } =
    useVoiceMode();
  const { sendMessage } = useChat();

  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isActive) {
      interval = setInterval(() => {
        getVADState();
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isActive, getVADState]);

  const toggleVoiceMode = async () => {
    if (isActive) {
      await stopRecording();
      setIsActive(false);0
    } else {
      await startRecording();
      setIsActive(true);
    }
  };

  const handleTranscriptSubmit = async () => {
    if (state.transcript.trim()) {
      await sendMessage(state.transcript);
      clearTranscript();
    }
  };

  return (
    <div className="voice-ui">
      <div className="voice-header">
        <h3>🎤 Voice Mode</h3>
        <button
          className={`voice-toggle ${isActive ? 'active' : ''}`}
          onClick={toggleVoiceMode}
        >
          {isActive ? 'Stop' : 'Start'}
        </button>
      </div>

      <VADIndicator active={state.vadActive} />

      <div className="voice-status">
        {state.isRecording && <span className="status-badge recording">🔴 Recording</span>}
        {state.isTranscribing && (
          <span className="status-badge transcribing">⏳ Transcribing...</span>
        )}
        {state.isSpeaking && <span className="status-badge speaking">🔊 Speaking</span>}
      </div>

      {state.transcript && (
        <div className="voice-transcript">
          <h4>Transcription:</h4>
          <p>{state.transcript}</p>
          <button onClick={handleTranscriptSubmit}>Envoyer</button>
        </div>
      )}
    </div>
  );
};
