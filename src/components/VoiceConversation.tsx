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
import { chatService } from '@/services/api/chat';
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

  // Générer réponse IA
  const generateAIResponse = useCallback(async (input: string): Promise<string> => {
    try {
      const messages = [{
        role: 'user' as const,
        content: input,
        timestamp: new Date().toISOString(),
      }];
      const response = await chatService.sendMessage(messages);
      return response.content || "Je n'ai pas pu générer de réponse.";
    } catch (error) {
      console.error('[VoiceConversation] Chat service error:', error);
      return generateLocalResponse(input);
    }
  }, [generateLocalResponse]);

  // Hook unifié pour la voix
  const {
    status,
    startTurn,
    cancelTurn,
    speak,
    clearError,
  } = useVoiceEngine({
    onTranscript: async (text) => {
      if (!text.trim()) return;

      setLastTranscript(text);
      onTranscript?.(text);

      try {
        const response = await generateAIResponse(text);
        setLastResponse(response);
        onResponse?.(response);

        await speak(response);

        if (autoContinue) {
          setTimeout(() => {
            startTurn();
          }, 500);
        }
      } catch (error) {
        console.error('[VoiceConversation] AI response error:', error);
      }
    },
    onError: (error) => {
      console.error('[VoiceConversation] Error:', error);
    },
  });

  // Visualisation audio - OPUS v∞.Ω: Tauri guard
  const startAudioVisualization = useCallback(async () => {
    try {
      const env = detectEnvironment();

      // En mode Tauri, vérifier d'abord le micro via backend
      if (env.isTauri) {
        const testResult = await secureInvoke<{ success: boolean }>('test_microphone');
        if (!testResult?.success) {
          console.warn('[VoiceConversation] Microphone not available in Tauri');
          return;
        }
      }

      // Vérifier que getUserMedia est disponible
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
  }, []);

  const stopAudioVisualization = useCallback(() => {
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
  }, []);

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
        return { ...base, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' };
      case 'listening':
        return { ...base, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: `0 0 ${20 + audioLevel * 30}px rgba(16, 185, 129, 0.6)`, transform: `scale(${1 + audioLevel * 0.1})` };
      case 'processing':
        return { ...base, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)' };
      case 'speaking':
        return { ...base, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', boxShadow: '0 4px 20px rgba(139, 92, 246, 0.5)' };
      case 'error':
        return { ...base, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' };
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
