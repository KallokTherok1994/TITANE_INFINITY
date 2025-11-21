/**
 * 🎙️ VoiceDuplexUI.tsx - Interface complète Voice Mode Full Duplex + Wakeword
 * Conversation continue naturelle avec hotword "TITANE"
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WakewordIndicator } from './WakewordIndicator';
import { VoiceCircle } from './VoiceCircle';
import { FullDuplexWave } from './FullDuplexWave';
import { ListeningIndicator } from './ListeningIndicator';
import './VoiceDuplexUI.css';

type DuplexState = 'waiting-wakeword' | 'listening' | 'thinking' | 'speaking' | 'idle';

interface VoiceDuplexUIProps {
  /** Callback activation manuelle */
  onManualActivate?: () => void;
  /** Callback désactivation */
  onDeactivate?: () => void;
}

export const VoiceDuplexUI: React.FC<VoiceDuplexUIProps> = ({
  onManualActivate,
  onDeactivate,
}) => {
  const [state, setState] = useState<DuplexState>('waiting-wakeword');
  const [wakewordState, setWakewordState] = useState<'waiting' | 'detecting' | 'activated'>('waiting');
  const [inputAudioData, setInputAudioData] = useState<number[]>([]);
  const [outputAudioData, setOutputAudioData] = useState<number[]>([]);
  const [volume, setVolume] = useState(0);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Simuler détection wakeword
  useEffect(() => {
    if (state === 'waiting-wakeword') {
      const timer = setTimeout(() => {
        // Simuler détection aléatoire pour démo
        if (Math.random() > 0.98) {
          handleWakewordDetected();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state, wakewordState]);

  // Simuler audio data
  useEffect(() => {
    const interval = setInterval(() => {
      if (isUserSpeaking) {
        setInputAudioData(generateMockAudioData());
        setVolume(Math.random() * 0.8 + 0.2);
      } else {
        setInputAudioData([]);
        setVolume(0);
      }

      if (isAiSpeaking) {
        setOutputAudioData(generateMockAudioData());
      } else {
        setOutputAudioData([]);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isUserSpeaking, isAiSpeaking]);

  const handleWakewordDetected = () => {
    setWakewordState('activated');
    setState('listening');
    setIsUserSpeaking(true);

    setTimeout(() => {
      setWakewordState('waiting');
    }, 2000);
  };

  const handleManualActivate = () => {
    handleWakewordDetected();
    onManualActivate?.();
  };

  const handleDeactivate = () => {
    setState('waiting-wakeword');
    setIsUserSpeaking(false);
    setIsAiSpeaking(false);
    onDeactivate?.();
  };

  return (
    <div className="voice-duplex-ui">
      {/* Header */}
      <div className="duplex-header glass">
        <div className="duplex-title">
          <span className="title-icon">🎙️</span>
          <h2>TITANE∞ Voice Mode Full Duplex</h2>
        </div>
        
        <div className="duplex-status">
          <div className="status-badge" data-state={state}>
            {state === 'waiting-wakeword' && '⏳ En attente'}
            {state === 'listening' && '👂 Écoute'}
            {state === 'thinking' && '🧠 Réflexion'}
            {state === 'speaking' && '🗣️ Parole'}
            {state === 'idle' && '💤 Repos'}
          </div>
          
          <div className="latency-indicator">
            <span className="latency-value">{Math.round(volume * 100)}ms</span>
            <span className="latency-label">latence</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="duplex-content">
        <AnimatePresence mode="wait">
          {state === 'waiting-wakeword' && (
            <motion.div
              key="wakeword"
              className="duplex-section"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <WakewordIndicator
                keyword="TITANE"
                state={wakewordState}
                confidence={0.85}
                size={180}
              />
              
              <motion.button
                className="manual-activate-btn glass"
                onClick={handleManualActivate}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Activer manuellement
              </motion.button>
            </motion.div>
          )}

          {state !== 'waiting-wakeword' && (
            <motion.div
              key="active"
              className="duplex-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Visualisation principale */}
              <div className="duplex-visualization">
                {state === 'listening' && (
                  <ListeningIndicator
                    active={true}
                    mode="listening"
                    size={160}
                    intensity={volume}
                  />
                )}

                {state === 'thinking' && (
                  <ListeningIndicator
                    active={true}
                    mode="thinking"
                    size={160}
                  />
                )}

                {state === 'speaking' && (
                  <VoiceCircle
                    volume={volume}
                    state="speaking"
                    size={160}
                    audioReactive={true}
                    glowIntensity={1.2}
                  />
                )}
              </div>

              {/* Waveform duplex */}
              <div className="duplex-waveform">
                <FullDuplexWave
                  inputData={inputAudioData}
                  outputData={outputAudioData}
                  height={200}
                  mode="split"
                  showLabels={true}
                />
              </div>

              {/* Contrôles */}
              <div className="duplex-controls">
                <motion.button
                  className="control-btn deactivate glass"
                  onClick={handleDeactivate}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ⏹️ Désactiver
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer info */}
      <div className="duplex-footer">
        <div className="duplex-indicators">
          <div className={`indicator ${isUserSpeaking ? 'active' : ''}`}>
            <span className="indicator-dot" />
            Vous parlez
          </div>
          <div className={`indicator ${isAiSpeaking ? 'active' : ''}`}>
            <span className="indicator-dot" />
            IA parle
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper: Générer données audio mock
function generateMockAudioData(): number[] {
  const data: number[] = [];
  for (let i = 0; i < 64; i++) {
    data.push(Math.random() * 255);
  }
  return data;
}

export default VoiceDuplexUI;
