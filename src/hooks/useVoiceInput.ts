/**
 * TITANE∞ v∞ — SP-VOICE-001 Partie 1/3: Echo Cancellation
 * Hook de capture audio avec echo cancellation hardware
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { voiceService } from '@/services/api/voice';

interface AudioConstraints {
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
  sampleRate?: number;
  channelCount?: number;
}

export function useVoiceInput(config?: AudioConstraints) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const recordingIdRef = useRef<string | null>(null);

  // Get optimal audio constraints with echo cancellation
  const getAudioConstraints = useCallback((): MediaStreamConstraints => {
    const constraints: MediaStreamConstraints = {
      audio: {
        echoCancellation: config?.echoCancellation ?? true, // ✅ CRITICAL
        noiseSuppression: config?.noiseSuppression ?? true, // ✅ CRITICAL
        autoGainControl: config?.autoGainControl ?? true, // ✅ CRITICAL
        sampleRate: config?.sampleRate ?? 16000,
        channelCount: config?.channelCount ?? 1, // Mono for voice
      },
    };

    console.log('[useVoiceInput] Audio constraints:', constraints.audio);
    return constraints;
  }, [config]);

  // Start listening with echo cancellation
  const startListening = async () => {
    try {
      setError(null);

      // Request microphone access with echo cancellation
      const constraints = getAudioConstraints();
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Verify echo cancellation is actually enabled
      const audioTrack = stream.getAudioTracks()[0];
      const settings = audioTrack.getSettings();

      console.log('[useVoiceInput] Audio track settings:', {
        echoCancellation: settings.echoCancellation,
        noiseSuppression: settings.noiseSuppression,
        autoGainControl: settings.autoGainControl,
        sampleRate: settings.sampleRate,
        channelCount: settings.channelCount,
      });

      // Warn if echo cancellation not available
      if (!settings.echoCancellation) {
        console.warn(
          '[useVoiceInput] ⚠️ Echo cancellation not supported on this device/browser. ' +
            'Feedback loop risk increased!'
        );
        setError('Echo cancellation not available - audio feedback may occur');
      }

      setAudioStream(stream);

      // Start recording via backend
      const recordingId = await voiceService.startRecording({
        language: 'fr-FR',
        continuous: true,
        interimResults: true,
      });

      recordingIdRef.current = recordingId;
      setIsListening(true);
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      console.error('[useVoiceInput] Failed to start listening:', error);

      if (error.name === 'NotAllowedError') {
        setError('Microphone permission denied');
      } else if (error.name === 'NotFoundError') {
        setError('No microphone found');
      } else if (error.name === 'NotReadableError') {
        setError('Microphone already in use');
      } else {
        setError(`Failed to start listening: ${error.message || 'Unknown error'}`);
      }

      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      const result = await voiceService.stopRecording();
      setTranscript(result.transcript);

      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      }

      setIsListening(false);
      recordingIdRef.current = null;

      return result;
    } catch (err: unknown) {
      const error = err as Error;
      console.error('[useVoiceInput] Failed to stop listening:', error);
      setError(`Failed to stop listening: ${error.message}`);
      setIsListening(false);
    }
  };

  const cancelListening = async () => {
    try {
      await voiceService.cancelRecording();

      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      }

      setIsListening(false);
      setTranscript('');
      recordingIdRef.current = null;
    } catch (err: unknown) {
      const error = err as Error;
      console.error('[useVoiceInput] Failed to cancel listening:', error);
      setError(`Failed to cancel: ${error.message}`);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIdRef.current) {
        voiceService.cancelRecording().catch(console.error);
      }
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioStream]);

  return {
    isListening,
    transcript,
    error,
    audioStream,
    startListening,
    stopListening,
    cancelListening,
  };
}
