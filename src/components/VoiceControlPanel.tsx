/**
 * TITANE_INFINITY v17.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — VOICE CONTROL PANEL
 *   Panneau de contrôle TTS avec status et configuration
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { hybridTTS, type TTSStatus } from '../services/tts/hybridTTS';
import './VoiceControlPanel.css';

export interface VoiceControlPanelProps {
  enabled: boolean;
  onToggle: () => void;
}

export const VoiceControlPanel: React.FC<VoiceControlPanelProps> = ({ enabled, onToggle }) => {
  const [status, setStatus] = useState<TTSStatus>({
    provider: 'none',
    available: false,
    speaking: false,
  });

  const [testInProgress, setTestInProgress] = useState(false);

  // Charge status au montage
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    const currentStatus = await hybridTTS.getStatus();
    setStatus(currentStatus);
  };

  const handleTest = async () => {
    if (testInProgress) return;

    setTestInProgress(true);

    try {
      await hybridTTS.speak('Test de synthèse vocale TITANE Infinity. Système opérationnel.', {
        lang: 'fr-FR',
        rate: 1.0,
        pitch: 1.0,
      });
    } catch (error) {
      console.error('Test TTS failed:', error);
    } finally {
      setTestInProgress(false);
      await loadStatus();
    }
  };

  const handleStop = async () => {
    await hybridTTS.stop();
    await loadStatus();
  };

  const getProviderLabel = () => {
    switch (status.provider) {
      case 'tauri':
        return 'Tauri Backend (Optimal)';
      case 'webspeech':
        return 'Web Speech API (Fallback)';
      default:
        return 'Non disponible';
    }
  };

  const getProviderIcon = () => {
    switch (status.provider) {
      case 'tauri':
        return '🎤';
      case 'webspeech':
        return '🌐';
      default:
        return '🔇';
    }
  };

  return (
    <div className={`voice-control-panel ${enabled ? 'enabled' : 'disabled'}`}>
      <div className="voice-header">
        <button className={`voice-toggle ${enabled ? 'active' : ''}`} onClick={onToggle}>
          {enabled ? '🔊' : '🔇'}
          <span>{enabled ? 'Mode Voix Actif' : 'Mode Voix Inactif'}</span>
        </button>
      </div>

      {enabled && (
        <div className="voice-details">
          <div className="voice-status">
            <span className="voice-provider">
              {getProviderIcon()} {getProviderLabel()}
            </span>
            <span className={`voice-indicator ${status.available ? 'available' : 'unavailable'}`}>
              {status.available ? '✅ Disponible' : '❌ Indisponible'}
            </span>
          </div>

          <div className="voice-actions">
            <button
              className="voice-test-button"
              onClick={handleTest}
              disabled={!status.available || testInProgress || status.speaking}
            >
              {testInProgress ? '⏳ Test...' : '🔊 Tester'}
            </button>

            {status.speaking && (
              <button className="voice-stop-button" onClick={handleStop}>
                ⏹️ Arrêter
              </button>
            )}
          </div>

          <div className="voice-help">
            <small>
              {status.provider === 'tauri' && '💡 Backend Rust optimal activé'}
              {status.provider === 'webspeech' && '💡 Fallback navigateur utilisé'}
              {status.provider === 'none' && '⚠️ Aucun provider TTS disponible'}
            </small>
          </div>
        </div>
      )}
    </div>
  );
};
