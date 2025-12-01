/**
 * TITANE_INFINITY v19.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3 — NATIVE VOICE RECORDER COMPONENT
 *   Enregistrement audio via backend Tauri (arecord) + transcription
 *   Pour WebKitGTK qui ne supporte pas Web Speech API
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useRef } from 'react';
import { audioService } from '@/features/audio-center/services/audioService';
import { secureInvoke } from '@/lib/security';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

interface NativeVoiceRecorderProps {
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
  className?: string;
}

type RecorderState = 'idle' | 'recording' | 'processing' | 'speaking';

interface MicrophoneTestResult {
  success: boolean;
  peakLevel: number;
  noiseFloor: number;
  signalToNoise: number;
  errorMessage?: string;
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export const NativeVoiceRecorder: React.FC<NativeVoiceRecorderProps> = ({
  onTranscript,
  onResponse,
  className = '',
}) => {
  const [state, setState] = useState<RecorderState>('idle');
  const [status, setStatus] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  const recordingRef = useRef(false);

  // Test microphone
  const testMicrophone = useCallback(async () => {
    try {
      setStatus('🎤 Test microphone...');
      // Tauri 2.0: camelCase params (durationMs, not duration_ms)
      const result = await secureInvoke<MicrophoneTestResult>('test_microphone', { durationMs: 2000 });

      if (result.success) {
        setStatus(`✓ Micro OK (SNR: ${result.signalToNoise.toFixed(1)}dB)`);
        await audioService.speak("Microphone fonctionnel.");
      } else {
        setStatus(`✗ ${result.errorMessage || 'Échec test micro'}`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur';
      setStatus(`✗ ${msg}`);
      console.error('[NativeVoiceRecorder] Test error:', error);
    }
  }, []);

  // Générer réponse IA
  const generateResponse = useCallback(async (input: string): Promise<string> => {
    const lower = input.toLowerCase();

    if (lower.includes('bonjour') || lower.includes('salut')) {
      return "Bonjour ! Je suis TITANE, votre assistant intelligent.";
    }
    if (lower.includes('heure')) {
      return `Il est ${new Date().toLocaleTimeString('fr-FR')}.`;
    }
    if (lower.includes('date')) {
      return `Nous sommes le ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.`;
    }
    if (lower.includes('merci')) {
      return "Je vous en prie !";
    }
    if (lower.includes('test') || lower.includes('écoute')) {
      return "Je vous entends parfaitement. Le système fonctionne.";
    }

    return `J'ai compris : "${input}". Comment puis-je vous aider ?`;
  }, []);

  // Enregistrer et transcrire (v19.3.0 - simplifié)
  const recordAndTranscribe = useCallback(async () => {
    if (recordingRef.current) return;

    recordingRef.current = true;
    setState('recording');
    setTranscript('');

    try {
      setStatus('🎤 Parlez maintenant (4 sec)...');

      // Enregistrement via backend natif - Tauri 2.0: camelCase
      const micResult = await secureInvoke<MicrophoneTestResult>('test_microphone', { durationMs: 4000 });

      if (!micResult.success) {
        throw new Error(micResult.errorMessage || 'Échec enregistrement');
      }

      // Transcription
      setState('processing');
      setStatus('🧠 Transcription...');

      // v19.3.0: Envoyer un tableau vide - le backend utilisera
      // automatiquement le fichier titane_mic_test.wav créé par test_microphone
      const transcription = await secureInvoke<string>('transcribe_audio', {
        audioData: []
      });

      if (transcription && transcription.trim() && !transcription.includes('Aucune parole')) {
        const text = transcription.trim();
        setTranscript(text);
        onTranscript?.(text);

        // Générer et parler la réponse
        const response = await generateResponse(text);
        onResponse?.(response);

        setState('speaking');
        setStatus('🔊 TITANE parle...');
        await audioService.speak(response);

        setState('idle');
        setStatus('');
      } else {
        setStatus('⚠️ Aucune parole détectée');
        setTimeout(() => setStatus(''), 3000);
        setState('idle');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur';
      console.error('[NativeVoiceRecorder] Record error:', error);
      setStatus(`✗ ${msg}`);
      setState('idle');
    } finally {
      recordingRef.current = false;
    }
  }, [onTranscript, onResponse, generateResponse]);

  // Styles du bouton selon l'état
  const getButtonStyle = () => {
    const base: React.CSSProperties = {
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      border: 'none',
      cursor: state === 'processing' ? 'wait' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      transition: 'all 0.3s ease',
    };

    switch (state) {
      case 'idle':
        return { ...base, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' };
      case 'recording':
        return { ...base, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 0 25px rgba(239, 68, 68, 0.6)', animation: 'pulse 1s infinite' };
      case 'processing':
        return { ...base, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)' };
      case 'speaking':
        return { ...base, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', boxShadow: '0 4px 20px rgba(139, 92, 246, 0.5)' };
      default:
        return base;
    }
  };

  const getIcon = () => {
    switch (state) {
      case 'idle': return '🎤';
      case 'recording': return '⏺️';
      case 'processing': return '🧠';
      case 'speaking': return '🔊';
      default: return '🎤';
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────

  return (
    <div className={className} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem',
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
      borderRadius: '16px',
      border: '1px solid rgba(102, 126, 234, 0.2)'
    }}>
      {/* Mode indicator */}
      <div style={{
        fontSize: '0.65rem',
        color: 'rgba(16, 185, 129, 0.8)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}>
        🦀 Mode Natif Tauri
      </div>

      {/* Main button */}
      <button
        onClick={state === 'idle' ? recordAndTranscribe : undefined}
        style={getButtonStyle()}
        disabled={state !== 'idle'}
        title={state === 'idle' ? 'Cliquez pour enregistrer' : 'En cours...'}
      >
        <span>{getIcon()}</span>
      </button>

      {/* Status text */}
      <span style={{
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        minHeight: '1.2em'
      }}>
        {status || (state === 'idle' ? 'Cliquez pour parler' : '')}
      </span>

      {/* Transcript display */}
      {transcript && (
        <div style={{
          padding: '0.5rem 0.75rem',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.85)',
          maxWidth: '200px',
          textAlign: 'center'
        }}>
          "{transcript}"
        </div>
      )}

      {/* Auxiliary buttons */}
      {state === 'idle' && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
          <button
            onClick={testMicrophone}
            style={{
              padding: '0.4rem 0.8rem',
              background: 'rgba(102, 126, 234, 0.2)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '6px',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.7rem',
              cursor: 'pointer',
            }}
            title="Tester le microphone"
          >
            🎙️ Test Micro
          </button>
          <button
            onClick={() => audioService.speak("Test de synthèse vocale. TITANE est opérationnel.")}
            style={{
              padding: '0.4rem 0.8rem',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '6px',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.7rem',
              cursor: 'pointer',
            }}
            title="Tester TTS"
          >
            🔊 Test TTS
          </button>
        </div>
      )}

      {/* Info */}
      <p style={{
        fontSize: '0.6rem',
        color: 'rgba(255,255,255,0.35)',
        margin: '0.5rem 0 0',
        textAlign: 'center',
        maxWidth: '180px',
        lineHeight: 1.3
      }}>
        💡 Utilise arecord + Whisper pour la reconnaissance vocale native.
      </p>

      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default NativeVoiceRecorder;
