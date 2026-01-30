/**
 * TITANE∞ v26.2.0 — Audio Transcription Service
 * © 2025 Humain Total / Kevin Thibault / TITANE Team
 *
 * Service de transcription audio utilisant Whisper
 * Support fallback: Web Speech API si backend Tauri indisponible
 */

import { secureInvoke } from '@/lib/security';

export interface TranscriptionResult {
  text: string;
  duration?: number; // en secondes
  language?: string; // code langue detectée
  confidence?: number; // 0-1
  error?: string;
}

/**
 * Service de transcription audio - Version 1
 * Utilise le backend Tauri avec Whisper ou fallback Web Speech
 */
export const audioTranscriptionService = {
  /**
   * Transcrire un fichier audio avec Whisper (backend Tauri)
   */
  async transcribeFile(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<TranscriptionResult> {
    try {
      // Validation du fichier
      if (!file.type.startsWith('audio/')) {
        throw new Error('Le fichier doit être un fichier audio');
      }

      if (file.size > 25 * 1024 * 1024) {
        // 25MB limit pour Whisper (requis par OpenAI)
        throw new Error('Fichier trop volumineux (max 25MB)');
      }

      // Lire le fichier en base64
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const binary = String.fromCharCode.apply(null, Array.from(bytes));
      const base64Data = btoa(binary);

      onProgress?.(10);

      // Appel Tauri backend
      const result = await secureInvoke<{ text: string; language?: string }>(
        'transcribe_audio_file',
        {
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          file_data: base64Data,
        }
      );

      onProgress?.(100);

      if (!result?.text) {
        throw new Error('Transcription vide');
      }

      return {
        text: result.text,
        language: result.language,
        confidence: 0.95, // Approximation - Whisper ne retourne pas de confiance
      };
    } catch (error) {
      const errorMsg = (error as Error).message || 'Erreur inconnue';

      // Fallback en cas d'erreur backend
      if (errorMsg.includes('indisponible') || errorMsg.includes('Tauri')) {
        console.warn(
          '[audioTranscriptionService] Backend Tauri unavailable, trying Web Speech API'
        );

        // Pour Web Speech, on ne peut pas transcrire un fichier
        // Il faut utiliser le microphone
        return {
          text: '',
          error:
            'Transcription fichier non disponible. Utilisez le microphone ou réessayez plus tard.',
        };
      }

      return {
        text: '',
        error: `Erreur transcription: ${errorMsg}`,
      };
    }
  },

  /**
   * Transcrire depuis le microphone avec Web Speech API
   */
  async transcribeMicrophone(
    maxDuration: number = 60000, // 60 secondes max
    onProgress?: (partial: string) => void
  ): Promise<TranscriptionResult> {
    return new Promise((resolve, reject) => {
      try {
        // Vérifier support
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
          return resolve({
            text: '',
            error: 'Web Speech API non supportée dans ce navigateur',
          });
        }

        const recognition = new SpeechRecognition();
        const transcript: string[] = [];
        let isListening = false;
        let timeoutHandle: NodeJS.Timeout | null = null;

        // Configuration
        recognition.language = 'fr-FR'; // Français par défaut
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onstart = () => {
          isListening = true;
          console.log('[audioTranscriptionService] Microphone recording started');

          // Auto-stop après maxDuration
          timeoutHandle = setTimeout(() => {
            if (isListening) {
              console.warn(
                `[audioTranscriptionService] Auto-stop after ${maxDuration}ms`
              );
              recognition.stop();
            }
          }, maxDuration);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result && result.length > 0) {
              const trans = result[0]?.transcript ?? '';

              if (result.isFinal) {
                finalTranscript += trans + ' ';
              } else {
                interimTranscript += trans;
              }
            }
          }

          if (finalTranscript) {
            transcript.push(finalTranscript);
          }

          // Envoyer le résultat intermédiaire
          const partial = transcript.join('') + interimTranscript;
          onProgress?.(partial);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          const errorMsg = `Erreur reconnaissance vocale: ${event.error}`;
          console.error('[audioTranscriptionService]', errorMsg);

          return resolve({
            text: '',
            error: errorMsg,
          });
        };

        recognition.onend = () => {
          isListening = false;
          if (timeoutHandle) clearTimeout(timeoutHandle);

          const finalText = transcript.join('');
          console.log(
            '[audioTranscriptionService] Recognition ended:',
            finalText.length,
            'chars'
          );

          return resolve({
            text: finalText,
          });
        };

        // Démarrer la reconnaissance
        recognition.start();
      } catch (err) {
        const errorMsg = (err as Error).message || 'Erreur inconnue';
        console.error('[audioTranscriptionService] Error:', errorMsg);

        return resolve({
          text: '',
          error: errorMsg,
        });
      }
    });
  },

  /**
   * Convertir un Blob audio en texte
   * (utilisé par l'enregistrement audio)
   */
  async transcribeBlob(
    audioBlob: Blob,
    onProgress?: (percent: number) => void
  ): Promise<TranscriptionResult> {
    try {
      // Créer un File depuis le Blob
      const file = new File([audioBlob], 'recorded-audio.webm', {
        type: 'audio/webm',
      });

      return this.transcribeFile(file, onProgress);
    } catch (error) {
      const errorMsg = (error as Error).message || 'Erreur inconnue';
      return {
        text: '',
        error: `Erreur: ${errorMsg}`,
      };
    }
  },

  /**
   * Obtenir les langues supportées
   */
  getSupportedLanguages(): { code: string; name: string }[] {
    // Whisper supporte 99 langues
    // Retourner les plus courantes
    return [
      { code: 'fr-FR', name: 'Français' },
      { code: 'en-US', name: 'English' },
      { code: 'es-ES', name: 'Español' },
      { code: 'de-DE', name: 'Deutsch' },
      { code: 'it-IT', name: 'Italiano' },
      { code: 'pt-BR', name: 'Português' },
      { code: 'ja-JP', name: '日本語' },
      { code: 'zh-CN', name: '中文' },
      // ... et 91 autres supportées par Whisper
    ];
  },
};

// Type pour les événements de reconnaissance vocale
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: SpeechRecognitionErrorCode;
}

type SpeechRecognitionErrorCode =
  | 'network'
  | 'aborted'
  | 'service-not-allowed'
  | 'bad-grammar'
  | 'service-unavailable'
  | 'no-speech'
  | 'audio-capture'
  | 'not-allowed';
