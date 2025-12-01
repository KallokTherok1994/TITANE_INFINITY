/**
 * TITANE_INFINITY v19.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2 — VOICE CONVERSATION COMPONENT
 *   Mode conversation audio live avec TITANE
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useRef, useEffect } from 'react';
import { audioService } from '@/features/audio-center/services/audioService';

interface VoiceConversationProps {
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
  className?: string;
}

type ConversationState = 'idle' | 'listening' | 'processing' | 'speaking';

// Fonction utilitaire pour obtenir SpeechRecognition
function getSpeechRecognition() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  return win.SpeechRecognition || win.webkitSpeechRecognition;
}

export const VoiceConversation = ({
  onTranscript,
  onResponse,
  className = '',
}: VoiceConversationProps) => {
  const [state, setState] = useState<ConversationState>('idle');
  const [transcript, setTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSupported, setIsSupported] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const stateRef = useRef(state);

  // Sync state ref
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Vérifier le support
  useEffect(() => {
    if (!getSpeechRecognition()) {
      setIsSupported(false);
    }
  }, []);

  const stopAudioVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  const startAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const updateLevel = () => {
        if (!analyserRef.current || stateRef.current === 'idle') return;

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
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }
    stopAudioVisualization();
    setState('idle');
    setTranscript('');
  };

  // Nettoyage
  useEffect(() => {
    return () => {
      stopListening();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Générer réponse IA (mock pour l'instant)
  const generateAIResponse = async (input: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 300));

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
  };

  const processUserInput = async (text: string) => {
    setState('processing');
    setTranscript('');

    try {
      const response = await generateAIResponse(text);
      onResponse?.(response);

      setState('speaking');
      await audioService.speak(response);

      // Revenir en écoute
      setState('listening');
      startListening();
    } catch (error) {
      console.error('[VoiceConversation] Error:', error);
      setState('idle');
    }
  };

  const startListening = () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'fr-FR';

    recognitionRef.current.onstart = () => {
      setState('listening');
      startAudioVisualization();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognitionRef.current.onresult = (event: any) => {
      const last = event.results.length - 1;
      const result = event.results[last];
      const text = result[0].transcript;

      setTranscript(text);

      if (result.isFinal) {
        onTranscript?.(text);
        processUserInput(text);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognitionRef.current.onerror = (event: any) => {
      console.error('[VoiceConversation] Error:', event.error);
      if (event.error !== 'no-speech') {
        stopListening();
      }
    };

    recognitionRef.current.onend = () => {
      if (stateRef.current === 'listening') {
        try {
          recognitionRef.current?.start();
        } catch {
          // Ignore
        }
      }
    };

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('[VoiceConversation] Start error:', error);
    }
  };

  const toggleConversation = () => {
    if (state === 'idle') {
      startListening();
    } else {
      stopListening();
    }
  };

  const getButtonStyle = () => {
    const base = {
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      fontSize: '24px',
      transition: 'all 0.3s ease',
      position: 'relative' as const,
    };

    switch (state) {
      case 'idle':
        return { ...base, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' };
      case 'listening':
        return { ...base, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: `0 0 ${20 + audioLevel * 30}px rgba(16, 185, 129, 0.6)`, transform: `scale(${1 + audioLevel * 0.1})` };
      case 'processing':
        return { ...base, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)' };
      case 'speaking':
        return { ...base, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', boxShadow: '0 4px 20px rgba(139, 92, 246, 0.5)' };
      default:
        return base;
    }
  };

  const getStatusText = () => {
    switch (state) {
      case 'idle': return 'Cliquez pour parler';
      case 'listening': return transcript || 'Je vous écoute...';
      case 'processing': return 'Réflexion...';
      case 'speaking': return 'TITANE parle...';
      default: return '';
    }
  };

  const getIcon = () => {
    switch (state) {
      case 'idle': return '🎤';
      case 'listening': return '👂';
      case 'processing': return '🧠';
      case 'speaking': return '🔊';
      default: return '🎤';
    }
  };

  if (!isSupported) {
    return (
      <div className={className} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
        <span>🚫</span>
        <p style={{ fontSize: '0.8rem', margin: '0.5rem 0 0' }}>Reconnaissance vocale non supportée</p>
      </div>
    );
  }

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <button onClick={toggleConversation} style={getButtonStyle()} title={state === 'idle' ? 'Activer la conversation vocale' : 'Arrêter'}>
        <span>{getIcon()}</span>
      </button>

      {state === 'listening' && (
        <div style={{ width: '100px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${audioLevel * 100}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', transition: 'width 0.1s ease' }} />
        </div>
      )}

      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: '200px' }}>
        {getStatusText()}
      </span>
    </div>
  );
};

export default VoiceConversation;
