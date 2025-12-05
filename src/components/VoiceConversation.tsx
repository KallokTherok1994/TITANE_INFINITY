/**
 * TITANE_INFINITY v19.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3 — VOICE CONVERSATION COMPONENT (UNIFIED)
 *   Mode conversation audio live avec TITANE
 *   Utilise useVoiceEngine (100% Tauri backend, pas de Web Speech API)
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useVoiceEngine } from '@/hooks/useVoiceEngine';
import { useAudioStreaming } from '@/hooks/useAudioStreaming'; // ✅ v∞.8: Real audio streaming
import { chatEngineCommands } from '@/services/tauri/chatEngine.commands';
import { detectEnvironment } from '@/core/tauri/environment';
import { secureInvoke } from '@/lib/security';

interface VoiceConversationProps {
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
  className?: string;
  /** Mode auto-conversation (continue après chaque réponse) */
  autoContinue?: boolean;
}

export const VoiceConversation = ({
  onTranscript,
  onResponse,
  className = '',
  autoContinue = true,
}: VoiceConversationProps) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [lastTranscript, setLastTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ✅ v∞.8: Real-time audio streaming hook (CPAL backend)
  const {
    isStreaming,
    stats: audioStats,
    startStreaming,
    stopStreaming,
  } = useAudioStreaming({
    onAudioChunk: (chunk) => {
      // Calculate audio level from real audio data
      if (chunk.length === 0) return;
      const sum = chunk.reduce((acc, val) => acc + Math.abs(val), 0);
      const avgLevel = sum / chunk.length;
      // Normalize to 0-1 range (assuming 16-bit audio: -32768 to 32767)
      const normalizedLevel = Math.min(avgLevel / 32768, 1);
      setAudioLevel(normalizedLevel);
    },
  });

  // Réponses locales de fallback
  const generateLocalResponse = useCallback((input: string): string => {
    const lower = input.toLowerCase();

    if (lower.includes('bonjour') || lower.includes('salut')) {
      return "Bonjour ! Je suis TITANE, votre assistant intelligent. Comment puis-je vous aider ?";
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
    if (lower.includes('au revoir')) {
      return "Au revoir ! À bientôt.";
    }

    return "Je comprends. Je suis en mode conversation vocale et prêt à vous aider.";
  }, []);

  // Générer réponse IA via OMEGA
  const generateAIResponse = useCallback(async (input: string): Promise<string> => {
    try {
      // Récupérer ou créer conversation_id
      let conversationId = localStorage.getItem('titane_voice_conversation_id');
      if (!conversationId) {
        conversationId = await chatEngineCommands.createNewConversation();
        if (conversationId) {
          localStorage.setItem('titane_voice_conversation_id', conversationId);
        } else {
          throw new Error('Failed to create conversation ID');
        }
      }

      const response = await chatEngineCommands.generate({
        message: input,
        conversationId,
        mode: 'default',
        provider: 'ollama',
      });
      return response.content || "Je n'ai pas pu générer de réponse.";
    } catch (error) {
      console.error('[VoiceConversation] OMEGA error:', error);
      return generateLocalResponse(input);
    }
  }, [generateLocalResponse]);

  // Hook unifié pour la voix
  const {
    status,
    startTurn,
    completeTurn, // ✅ NOUVEAU : pipeline complet IA + TTS
    cancelTurn,
    speak,
    clearError,
  } = useVoiceEngine({
    onTranscript: (text) => {
      // Juste notifier la transcription (le pipeline IA+TTS est dans completeTurn)
      if (!text.trim()) return;
      setLastTranscript(text);
      onTranscript?.(text);
    },
    onError: (error) => {
      console.error('[VoiceConversation] Error:', error);
    },
  });

  // ✅ NOUVEAU : Auto-complete turn when recording stops
  const prevStateRef = useRef<string>(status.state);
  useEffect(() => {
    const prevState = prevStateRef.current;
    const currentState = status.state;

    // Détecter la fin d'enregistrement (listening → processing)
    if (prevState === 'listening' && currentState === 'processing') {
      console.log('[VoiceConversation] 🎯 Recording stopped, triggering completeTurn');
      completeTurn();
    }

    prevStateRef.current = currentState;
  }, [status.state, completeTurn]);

  // ✅ v∞.8 REFACTOR: Use real CPAL audio streaming for visualization
  const startAudioVisualization = useCallback(async () => {
    try {
      const env = detectEnvironment();

      // En mode Tauri: utiliser CPAL audio streaming (real backend audio)
      if (env.isTauri) {
        console.log('[VoiceConversation] ✅ Starting REAL audio streaming (CPAL)');
        await startStreaming(); // ✅ Connecte au vrai flux audio CPAL
        return;
      }

      // ✅ En browser uniquement: utiliser getUserMedia pour la visualisation
      if (!navigator.mediaDevices?.getUserMedia) {
        console.warn('[VoiceConversation] getUserMedia not available');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const updateLevel = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);

        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (error) {
      console.error('[VoiceConversation] Audio visualization error:', error);
    }
  }, [startStreaming]);

  const stopAudioVisualization = useCallback(async () => {
    const env = detectEnvironment();

    // Stop CPAL streaming in Tauri mode
    if (env.isTauri && isStreaming) {
      console.log('[VoiceConversation] Stopping CPAL audio streaming');
      await stopStreaming();
    }

    // Cleanup browser audio visualization
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setAudioLevel(0);
  }, [isStreaming, stopStreaming]);

  // Sync visualisation avec état
  useEffect(() => {
    if (status.isRecording) {
      startAudioVisualization();
    } else {
      stopAudioVisualization();
    }

    return () => {
      stopAudioVisualization();
    };
  }, [status.isRecording, startAudioVisualization, stopAudioVisualization]);

  // Nettoyage
  useEffect(() => {
    return () => {
      stopAudioVisualization();
      cancelTurn();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleConversation = () => {
    if (status.state === 'idle') {
      clearError();
      startTurn();
    } else {
      cancelTurn();
    }
  };

  const getButtonStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      border: 'none',
      cursor: status.isMicAvailable ? 'pointer' : 'not-allowed',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      transition: 'all 0.3s ease',
      position: 'relative',
      opacity: status.isMicAvailable ? 1 : 0.5,
    };

    switch (status.state) {
      case 'idle':
        return { ...base, background: 'linear-gradient(135deg, #727b81 0%, #5a6167 100%)', boxShadow: '0 4px 15px rgba(114, 123, 129, 0.4)' };
      case 'listening':
        return { ...base, background: 'linear-gradient(135deg, #93b399 0%, #7a9a80 100%)', boxShadow: `0 0 ${20 + audioLevel * 30}px rgba(147, 179, 153, 0.6)`, transform: `scale(${1 + audioLevel * 0.1})` };
      case 'processing':
        return { ...base, background: 'linear-gradient(135deg, #a89f91 0%, #9a8a7d 100%)', boxShadow: '0 4px 15px rgba(168, 159, 145, 0.4)' };
      case 'speaking':
        return { ...base, background: 'linear-gradient(135deg, #727b81 0%, #5a6167 100%)', boxShadow: '0 4px 20px rgba(114, 123, 129, 0.5)' };
      case 'error':
        return { ...base, background: 'linear-gradient(135deg, #8f7a7a 0%, #7a6868 100%)', boxShadow: '0 4px 15px rgba(143, 122, 122, 0.4)' };
      default:
        return base;
    }
  };

  const getStatusText = () => {
    if (status.lastError) return `⚠️ ${status.lastError}`;

    switch (status.state) {
      case 'idle': return status.isMicAvailable ? 'Cliquez pour parler' : 'Microphone non disponible';
      case 'listening': return status.interimTranscript || lastTranscript || 'Je vous écoute...';
      case 'processing': return 'Réflexion...';
      case 'speaking': return lastResponse ? `TITANE: "${lastResponse.substring(0, 50)}..."` : 'TITANE parle...';
      case 'error': return 'Erreur - Réessayez';
      default: return '';
    }
  };

  const getIcon = () => {
    switch (status.state) {
      case 'idle': return '🎤';
      case 'listening': return '👂';
      case 'processing': return '🧠';
      case 'speaking': return '🔊';
      case 'error': return '⚠️';
      default: return '🎤';
    }
  };

  return (
    <div className={`voice-conversation ${className}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <button
        onClick={toggleConversation}
        style={getButtonStyle()}
        title={status.state === 'idle' ? 'Activer la conversation vocale' : 'Arrêter'}
        disabled={!status.isMicAvailable && status.state === 'idle'}
      >
        <span>{getIcon()}</span>
      </button>

      {status.isRecording && (
        <div style={{ width: '100px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${audioLevel * 100}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', transition: 'width 0.1s ease' }} />
        </div>
      )}

      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: '200px' }}>
        {getStatusText()}
      </span>

      {/* Indicateur TTS/Mic */}
      <div style={{ display: 'flex', gap: '8px', fontSize: '10px', opacity: 0.5 }}>
        <span title="Microphone">{status.isMicAvailable ? '🎤✓' : '🎤✗'}</span>
        <span title="TTS">{status.isTTSAvailable ? '🔊✓' : '🔊✗'}</span>
      </div>
    </div>
  );
};

export default VoiceConversation;
