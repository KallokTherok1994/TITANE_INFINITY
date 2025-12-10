/**
 * TITANE_INFINITY v24.1.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * Panel de test pour Parler-TTS local
 * Permet de tester la voix, modifier le style, et monitorer les performances
 */

import React, { useState, useEffect } from 'react';
import { hybridTTS } from '@/services/tts/hybridTTS';
import { parlerTTSBridge } from '@/services/tts/parlerTTSBridge';
import type { ParlerHealthStatus } from '@/services/tts/parlerTTSBridge';
import type { TTSStatus } from '@/services/tts/hybridTTS';

export const ParlerTTSTestPanel: React.FC = () => {
  const [text, setText] = useState(
    'Bonjour, je suis TITANE, votre assistant cognitif permanent.'
  );
  const [styleDescription, setStyleDescription] = useState('');
  const [health, setHealth] = useState<ParlerHealthStatus | null>(null);
  const [ttsStatus, setTTSStatus] = useState<TTSStatus | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

  // Charger statut initial
  useEffect(() => {
    checkHealth();
    checkTTSStatus();
    setStyleDescription(hybridTTS.getCurrentVoiceStyle());
  }, []);

  const checkHealth = async () => {
    try {
      const h = await parlerTTSBridge.healthCheck();
      setHealth(h);
      setLastError(null);
    } catch (error) {
      setLastError(`Health check failed: ${error}`);
    }
  };

  const checkTTSStatus = async () => {
    try {
      const status = await hybridTTS.getStatus();
      setTTSStatus(status);
    } catch (error) {
      console.error('TTS status error:', error);
    }
  };

  const handleSpeak = async () => {
    if (!text.trim()) return;

    setIsSpeaking(true);
    setLastError(null);
    const startTime = Date.now();

    try {
      await hybridTTS.speak(text);
      const duration = Date.now() - startTime;
      setGenerationTime(duration);
    } catch (error) {
      setLastError(`Speech error: ${error}`);
    } finally {
      setIsSpeaking(false);
      await checkTTSStatus();
    }
  };

  const handleStop = async () => {
    try {
      await hybridTTS.stop();
      setIsSpeaking(false);
    } catch (error) {
      setLastError(`Stop error: ${error}`);
    }
  };

  const handleUpdateStyle = async () => {
    if (!styleDescription.trim()) return;

    try {
      await hybridTTS.updateVoiceStyle(styleDescription, true);
      setLastError(null);
      alert('Style vocal mis à jour avec succès !');
      await checkHealth();
    } catch (error) {
      setLastError(`Style update error: ${error}`);
    }
  };

  const handleResetStyle = () => {
    const defaultStyle = `Une voix féminine française, chaleureuse et claire, avec une articulation précise et un rythme modéré, légèrement expressive et bienveillante.`;
    setStyleDescription(defaultStyle);
  };

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#1a1a2e',
        color: '#eee',
        borderRadius: '8px',
        fontFamily: 'monospace',
        maxWidth: '800px',
        margin: '20px auto',
      }}
    >
      <h2 style={{ margin: '0 0 20px 0' }}>🎤 Parler-TTS Test Panel v24.1</h2>

      {/* Health Status */}
      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#16213e',
          borderRadius: '6px',
          border:
            health?.status === 'healthy' ? '2px solid #2ecc71' : '2px solid #e74c3c',
        }}
      >
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Service Status</h3>
        {health ? (
          <>
            <div>
              Status:{' '}
              <strong
                style={{ color: health.status === 'healthy' ? '#2ecc71' : '#e74c3c' }}
              >
                {health.status.toUpperCase()}
              </strong>
            </div>
            <div>Model Loaded: {health.modelLoaded ? '✅ Yes' : '❌ No'}</div>
            <div>
              Device: <strong>{health.device}</strong>{' '}
              {health.gpuName && `(${health.gpuName})`}
            </div>
            {health.vramUsedGb && <div>VRAM Used: {health.vramUsedGb.toFixed(2)} GB</div>}
            <div>Cache Size: {health.cacheSizeMb.toFixed(1)} MB</div>
            <div>Uptime: {Math.floor(health.uptimeSeconds)}s</div>
          </>
        ) : (
          <div style={{ color: '#e74c3c' }}>⚠️ Service non disponible</div>
        )}
        <button
          onClick={checkHealth}
          style={{
            marginTop: '10px',
            padding: '5px 15px',
            backgroundColor: '#3498db',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* TTS Status */}
      {ttsStatus && (
        <div
          style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#16213e',
            borderRadius: '6px',
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>HybridTTS Status</h3>
          <div>
            Active Provider:{' '}
            <strong style={{ color: '#f39c12' }}>
              {ttsStatus.provider.toUpperCase()}
            </strong>
          </div>
          <div>Parler-TTS: {ttsStatus.parlerTTSAvailable ? '✅' : '❌'}</div>
          <div>Tauri Backend: {ttsStatus.tauriAvailable ? '✅' : '❌'}</div>
          <div>Web Speech API: {ttsStatus.webSpeechAvailable ? '✅' : '❌'}</div>
          <div>Speaking: {ttsStatus.speaking ? '🔊 Yes' : '🔇 No'}</div>
        </div>
      )}

      {/* Text Input */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          📝 Texte à synthétiser
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#0f1419',
            color: '#eee',
            border: '1px solid #444',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '14px',
            resize: 'vertical',
          }}
          placeholder="Entrez le texte à synthétiser..."
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={handleSpeak}
          disabled={isSpeaking || !text.trim()}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: isSpeaking ? '#95a5a6' : '#2ecc71',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: isSpeaking ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          {isSpeaking ? '🔊 Lecture en cours...' : '▶️ Parler'}
        </button>
        <button
          onClick={handleStop}
          disabled={!isSpeaking}
          style={{
            padding: '12px 20px',
            backgroundColor: '#e74c3c',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: isSpeaking ? 'pointer' : 'not-allowed',
            fontSize: '16px',
          }}
        >
          ⏹️ Stop
        </button>
      </div>

      {/* Generation Time */}
      {generationTime && (
        <div
          style={{
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#27ae60',
            borderRadius: '4px',
            textAlign: 'center',
          }}
        >
          ⚡ Génération: <strong>{generationTime}ms</strong>
        </div>
      )}

      {/* Style Description */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          🎨 Style Vocal (Description naturelle)
        </label>
        <textarea
          value={styleDescription}
          onChange={e => setStyleDescription(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#0f1419',
            color: '#eee',
            border: '1px solid #444',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '13px',
            resize: 'vertical',
          }}
          placeholder="Ex: Une voix féminine française, chaleureuse..."
        />
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            onClick={handleUpdateStyle}
            disabled={!styleDescription.trim()}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#f39c12',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: styleDescription.trim() ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
            }}
          >
            💾 Sauvegarder Style
          </button>
          <button
            onClick={handleResetStyle}
            style={{
              padding: '10px 20px',
              backgroundColor: '#34495e',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            🔄 Reset Défaut
          </button>
        </div>
      </div>

      {/* Error Display */}
      {lastError && (
        <div
          style={{
            padding: '15px',
            backgroundColor: '#e74c3c',
            color: '#fff',
            borderRadius: '4px',
            marginTop: '20px',
          }}
        >
          <strong>❌ Erreur:</strong> {lastError}
        </div>
      )}

      {/* Examples */}
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
        <strong>💡 Exemples de modifications de style via TITANE IA:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>"Rends la voix plus énergique et dynamique"</li>
          <li>"Adopte un ton plus calme et posé"</li>
          <li>"Parle plus lentement avec plus d'articulation"</li>
          <li>"Style professionnel et neutre"</li>
        </ul>
      </div>
    </div>
  );
};
