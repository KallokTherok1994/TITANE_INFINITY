/**
 * TITANE_INFINITY v19.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2 — AUDIO SETTINGS COMPONENT
 *   Configuration audio avec TTS, périphériques et tests
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { audioService } from '@/features/audio-center/services/audioService';
import type { TTSSettings, AudioDevice } from '@/features/audio-center/types';

const cardStyle = {
  padding: '1.5rem',
  background: 'rgba(255,255,255,0.03)',
  borderRadius: '12px',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.08)',
};

const headingStyle = {
  marginBottom: '1rem',
  color: 'white',
  fontSize: '1rem',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const labelStyle = {
  color: 'rgba(255,255,255,0.7)',
  fontSize: '0.9rem',
};

const sliderStyle = {
  flex: 1,
  accentColor: '#667eea',
};

const selectStyle = {
  flex: 1,
  padding: '0.5rem',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: 'white',
  fontSize: '0.9rem',
};

const buttonStyle = {
  padding: '0.5rem 1rem',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  border: 'none',
  borderRadius: '8px',
  color: 'white',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

// Style pour boutons de succès (réservé pour usage futur)
const _successButtonStyle = {
  ...buttonStyle,
  background: 'linear-gradient(135deg, #93b399 0%, #7a9a80 100%)',
};

export const AudioSettings = () => {
  const [ttsSettings, setTTSSettings] = useState<TTSSettings>(audioService.getTTSSettings());
  const [outputDevices, setOutputDevices] = useState<AudioDevice[]>([]);
  const [inputDevices, setInputDevices] = useState<AudioDevice[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // Charger les périphériques audio
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const outputs = await audioService.getOutputDevices();
      const inputs = await audioService.getInputDevices();
      setOutputDevices(outputs);
      setInputDevices(inputs);
    } catch (error) {
      console.error('Erreur chargement périphériques:', error);
    }
  };

  const handleTTSSettingChange = async (key: keyof TTSSettings, _value: TTSSettings[keyof TTSSettings]) => {
    const newSettings = { ...ttsSettings, [key]: _value };
    setTTSSettings(newSettings);
    await audioService.updateTTSSettings({ [key]: _value });
  };

  const handleTestTTS = async () => {
    setIsTesting(true);
    setTestStatus('idle');
    setErrorMessage('');

    try {
      const testText = "Bonjour, je suis TITANE, votre assistant intelligent. La synthèse vocale fonctionne parfaitement.";
      console.log('[AudioSettings] Testing TTS with:', testText);
      await audioService.speak(testText);
      setTestStatus('success');
    } catch (error) {
      console.error('[AudioSettings] TTS test error:', error);
      setTestStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestMicrophone = async () => {
    setIsTesting(true);
    try {
      const result = await audioService.testMicrophone();
      if (result.success) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
        setErrorMessage(result.errorMessage || 'Test microphone échoué');
      }
    } catch (error) {
      setTestStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Section TTS */}
      <div style={cardStyle}>
        <h3 style={headingStyle}>
          <span>🔊</span>
          Synthèse Vocale (TTS)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Moteur TTS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={labelStyle}>Moteur</span>
            <select
              value={ttsSettings.engine}
              onChange={(e) => handleTTSSettingChange('engine', e.target.value as TTSSettings['engine'])}
              style={{ ...selectStyle, maxWidth: '200px' }}
            >
              <option value="piper">Piper (Local)</option>
              <option value="espeak">eSpeak (Fallback)</option>
              <option value="webspeech">Web Speech API</option>
            </select>
          </div>

          {/* Voix */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={labelStyle}>Voix</span>
            <select
              value={ttsSettings.voiceId}
              onChange={(e) => handleTTSSettingChange('voiceId', e.target.value)}
              style={{ ...selectStyle, maxWidth: '200px' }}
            >
              <option value="fr_FR-siwis-medium">Siwis (FR Féminin)</option>
              <option value="fr_FR-upmc-medium">UPMC (FR Masculin)</option>
              <option value="en_US-amy-medium">Amy (EN Féminin)</option>
            </select>
          </div>

          {/* Vitesse */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ ...labelStyle, minWidth: '80px' }}>Vitesse</span>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={ttsSettings.rate}
              onChange={(e) => handleTTSSettingChange('rate', parseFloat(e.target.value))}
              style={sliderStyle}
            />
            <span style={{ ...labelStyle, minWidth: '40px', textAlign: 'right' }}>
              {ttsSettings.rate.toFixed(1)}x
            </span>
          </div>

          {/* Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ ...labelStyle, minWidth: '80px' }}>Volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={ttsSettings.volume}
              onChange={(e) => handleTTSSettingChange('volume', parseFloat(e.target.value))}
              style={sliderStyle}
            />
            <span style={{ ...labelStyle, minWidth: '40px', textAlign: 'right' }}>
              {Math.round(ttsSettings.volume * 100)}%
            </span>
          </div>

          {/* Bouton Test */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              onClick={handleTestTTS}
              disabled={isTesting}
              style={isTesting ? { ...buttonStyle, opacity: 0.7 } : buttonStyle}
            >
              {isTesting ? (
                <>
                  <span className="spinner">⏳</span>
                  Test en cours...
                </>
              ) : (
                <>
                  <span>🔊</span>
                  Tester la voix
                </>
              )}
            </button>

            {testStatus === 'success' && (
              <span style={{ color: '#93b399', fontSize: '0.9rem' }}>✅ TTS fonctionne !</span>
            )}
            {testStatus === 'error' && (
              <span style={{ color: '#f87171', fontSize: '0.9rem' }}>❌ {errorMessage}</span>
            )}
          </div>
        </div>
      </div>

      {/* Section Périphériques Audio */}
      <div style={cardStyle}>
        <h3 style={headingStyle}>
          <span>🎧</span>
          Périphériques Audio
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Sortie Audio */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={labelStyle}>Sortie audio</span>
            <select
              onChange={(e) => audioService.setOutputDevice(e.target.value)}
              style={{ ...selectStyle, maxWidth: '300px' }}
            >
              {outputDevices.length === 0 ? (
                <option>Chargement...</option>
              ) : (
                outputDevices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name} {device.isDefault ? '(Défaut)' : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Entrée Audio */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={labelStyle}>Microphone</span>
            <select
              onChange={(e) => audioService.setInputDevice(e.target.value)}
              style={{ ...selectStyle, maxWidth: '300px' }}
            >
              {inputDevices.length === 0 ? (
                <option>Chargement...</option>
              ) : (
                inputDevices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name} {device.isDefault ? '(Défaut)' : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Bouton Test Micro */}
          <div style={{ marginTop: '0.5rem' }}>
            <button onClick={handleTestMicrophone} disabled={isTesting} style={buttonStyle}>
              <span>🎤</span>
              Tester le microphone
            </button>
          </div>
        </div>
      </div>

      {/* Section Options Avancées */}
      <div style={cardStyle}>
        <h3 style={headingStyle}>
          <span>⚙️</span>
          Options Avancées
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Auto-fallback */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={labelStyle}>Fallback automatique</span>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                Utiliser eSpeak si Piper échoue
              </p>
            </div>
            <button
              onClick={() => handleTTSSettingChange('autoFallback', !ttsSettings.autoFallback)}
              style={{
                padding: '0.5rem 1rem',
                background: ttsSettings.autoFallback ? 'rgba(147,179,153,0.15)' : 'rgba(143,122,122,0.15)',
                border: `1px solid ${ttsSettings.autoFallback ? 'rgba(147,179,153,0.3)' : 'rgba(143,122,122,0.3)'}`,
                borderRadius: '8px',
                color: ttsSettings.autoFallback ? '#93b399' : '#8f7a7a',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              {ttsSettings.autoFallback ? 'Activé' : 'Désactivé'}
            </button>
          </div>

          {/* Émotions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={labelStyle}>Détection d'émotions</span>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                Adapter l'intonation au contexte
              </p>
            </div>
            <button
              onClick={() => handleTTSSettingChange('emotionEnabled', !ttsSettings.emotionEnabled)}
              style={{
                padding: '0.5rem 1rem',
                background: ttsSettings.emotionEnabled ? 'rgba(147,179,153,0.15)' : 'rgba(143,122,122,0.15)',
                border: `1px solid ${ttsSettings.emotionEnabled ? 'rgba(147,179,153,0.3)' : 'rgba(143,122,122,0.3)'}`,
                borderRadius: '8px',
                color: ttsSettings.emotionEnabled ? '#93b399' : '#8f7a7a',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              {ttsSettings.emotionEnabled ? 'Activé' : 'Désactivé'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioSettings;
