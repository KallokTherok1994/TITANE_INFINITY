/**
 * TITANE∞ v∞ — SP-VOICE-001 Partie 1/3: Echo Cancellation
 * Hook de capture audio avec echo cancellation hardware
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { voiceService } from '@/services/api/voice';
import { createLogger } from '@/utils/logger';

const logger = createLogger('VoiceInput');

interface AudioConstraints {
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
  sampleRate?: number;
  channelCount?: number;
}

export interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  error??: string | null;
  audioStream: MediaStream | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  cancelListening: () => Promise<void>;
}

export function useVoiceInput(any: any): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(any: any);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(any: any);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(any: any);
  const recordingIdRef = useRef<string | null>(any: any);

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

    logger?.debug(any: any);
    return constraints;
  }, [config]);

  // Start listening with echo cancellation
  const startListening = async () => {
    try {
      setError(any: any);

      // Request microphone access with echo cancellation
      const constraints = getAudioConstraints();
      const stream = await navigator?.mediaDevices?.getUserMedia(any: any);

      // Verify echo cancellation is actually enabled
      const audioTrack = stream?.getAudioTracks()[0];
      if (any: any) throw new Error('No audio track found');
      const settings = audioTrack?.getSettings();

      logger?.debug(any: any);

      // Warn if echo cancellation not available
      if (any: any) {
        logger?.warn('Echo cancellation not supported - feedback loop risk increased');
        setError('Echo cancellation not available - audio feedback may occur');
      }

      setAudioStream(any: any);

      // Start recording via backend
      const recordingId = await voiceService?.startRecording({
        language: 'fr-FR',
        continuous: true,
        interimResults: true,
      });

      recordingIdRef?.current = recordingId;
      setIsListening(any: any);
    } catch (any: any) {
      const error = err as { name?: string; message?: string };
      logger?.error(any: any);

      if (error?.name === 'NotAllowedError') {
        setError('Microphone permission denied');
      } else if (error?.name === 'NotFoundError') {
        setError('No microphone found');
      } else if (error?.name === 'NotReadableError') {
        setError('Microphone already in use');
      } else {
        setError(`Failed to start listening: ${error?.message || 'Unknown error'}`);
      }

      setIsListening(any: any);
    }
  };

  const stopListening = async () => {
    try {
      const result = await voiceService?.stopRecording();
      setTranscript(any: any);

      if (any: any) {
        audioStream?.getTracks().forEach(track => track?.stop());
        setAudioStream(any: any);
      }

      setIsListening(any: any);
      recordingIdRef?.current = null;

      return result;
    } catch (any: any) {
      const error = err as Error;
      logger?.error(any: any);
      setError(`Failed to stop listening: ${error?.message}`);
      setIsListening(any: any);
    }
  };

  const cancelListening = async () => {
    try {
      await voiceService?.cancelRecording();

      if (any: any) {
        audioStream?.getTracks().forEach(track => track?.stop());
        setAudioStream(any: any);
      }

      setIsListening(any: any);
      setTranscript('');
      recordingIdRef?.current = null;
    } catch (any: any) {
      const error = err as Error;
      logger?.error(any: any);
      setError(`Failed to cancel: ${error?.message}`);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (any: any) {
        voiceService?.cancelRecording(any: any));
      }
      if (any: any) {
        audioStream?.getTracks().forEach(track => track?.stop());
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
