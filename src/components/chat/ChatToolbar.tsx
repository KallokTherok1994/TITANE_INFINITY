/**
 * TITANE∞ v35.1.8 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v35.1.8 — CHAT TOOLBAR COMPLET
 *   Barre d'outils complète pour le Chat IA avec TOUTES les fonctions:
 *   - Import fichiers (📎)
 *   - Capture d'écran (📸)
 *   - Analyse d'image/Vision IA (👁️)
 *   - Dictée vocale (🎙️)
 *   - Enregistrement audio (🔴)
 *   - Mode conversation audio (🔊)
 *   - Partage caméra live (📷)
 *   - Transcription audio (📝)
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState, useCallback, useRef, memo, useEffect } from 'react';
import {
  Paperclip,
  Mic,
  Volume2,
  VolumeX,
  Video,
  VideoOff,
  Image,
  FileAudio,
  MonitorUp,
  Headphones,
  Eye,
  Disc,
  Square,
} from 'lucide-react';
import {
  useDisableVision,
  useEnableVision,
  useVisionObservationActive,
} from '@/stores/useVisionStore.selectors';
import { useVoiceEngine } from '@/hooks/useVoiceEngine';
import {
  useAutoTimeout,
  useElapsedTime,
  formatElapsedTime,
} from '@/hooks/useAutoTimeout';
import { useTTSPreference, useAudioConversationPreference } from '@/hooks/usePreferences';
import { useToast } from '@/hooks/useToast';
import { APISupport } from '@/utils/APISupport';
import { audioTranscriptionService } from '@/services/audioTranscriptionService';
import { resolveImportedFileContent } from './fileImportSupport';
import { RecordingTimer } from './RecordingTimer';
import type { AnalyzedFile } from './FileUploadButton';
import './ChatToolbar.css';
import { createLogger } from '@/utils/logger';

const logger = createLogger('ChatToolbar');

const isDev = process.env.NODE_ENV === 'development';

// ═══ TYPES ═══
export interface ChatToolbarProps {
  /** Callback pour les fichiers analysés via FileUploadButton */
  onFilesAnalyzed?: (files: AnalyzedFile[]) => void;
  /** Callback pour l'import de fichiers */
  onFileImport?: (files: FileList) => void;
  /** Callback pour la capture d'écran */
  onScreenCapture?: (imageData: string) => void;
  /** Callback pour l'analyse d'image */
  onImageAnalysis?: (imageData: string, prompt?: string) => void;
  /** Callback pour le texte dicté */
  onDictationResult?: (text: string) => void;
  /** Callback pour l'enregistrement audio terminé */
  onAudioRecorded?: (audioBlob: Blob) => void;
  /** Callback pour la transcription audio */
  onTranscriptionResult?: (text: string) => void;
  /** Callback toggle mode conversation audio */
  onToggleAudioConversation?: (active: boolean) => void;
  /** Callback toggle caméra live */
  onToggleCameraLive?: (active: boolean) => void;
  /** Callback toggle TTS auto */
  onToggleTTS?: (active: boolean) => void;
  /** Désactivé */
  disabled?: boolean;
  /** Mode compact (icônes seulement) */
  compact?: boolean;
  /** Classe CSS additionnelle */
  className?: string;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  label: string;
  tooltip: string;
  active?: boolean;
  recording?: boolean;
  disabled?: boolean;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success' | 'warning';
  /** data-testid for E2E testing */
  testId?: string;
}

// ═══ COMPOSANT BOUTON ═══
const ToolbarButton: React.FC<ToolbarButtonProps> = memo(
  ({
    icon,
    activeIcon,
    label,
    tooltip,
    active = false,
    recording = false,
    disabled = false,
    onClick,
    variant = 'default',
    testId,
  }) => (
    <button
      type="button"
      className={`chat-toolbar-btn ${active ? 'active' : ''} ${recording ? 'recording' : ''} ${variant}`}
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      aria-label={label}
      aria-pressed={active}
      data-testid={testId}
    >
      <span className="toolbar-btn-icon">{active && activeIcon ? activeIcon : icon}</span>
      {recording && <span className="toolbar-btn-pulse" />}
    </button>
  )
);

ToolbarButton.displayName = 'ToolbarButton';

// ═══ COMPOSANT PRINCIPAL ═══
export const ChatToolbar: React.FC<ChatToolbarProps> = memo(
  ({
    onFilesAnalyzed,
    onFileImport,
    onScreenCapture,
    onImageAnalysis,
    onDictationResult,
    onAudioRecorded,
    onTranscriptionResult,
    onToggleAudioConversation,
    onToggleCameraLive,
    onToggleTTS,
    disabled = false,
    compact = false,
    className = '',
  }) => {
    // ═══ IMPORTS HOOKS ═══
    const { isTTSEnabled: persistedTTS, setTTSEnabled } = useTTSPreference();
    const {
      isAudioConversationPreferred: persistedAudioConv,
      setAudioConversationPreferred,
    } = useAudioConversationPreference();
    const { success, error, info, warning } = useToast(); // ✅ NOUVEAU - Toast notifications

    // ═══ ÉTATS ═══
    const [isRecordingAudio, setIsRecordingAudio] = useState(false);
    const [isDictating, setIsDictating] = useState(false);
    const [isAudioConversationActive, setIsAudioConversationActive] =
      useState(persistedAudioConv);
    const [isTTSEnabled, setIsTTSEnabledLocal] = useState(persistedTTS);

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Stores & Hooks
    const isCameraActive = useVisionObservationActive();
    const enableVision = useEnableVision();
    const disableVision = useDisableVision();

    // Cleanup au démontage : arrêter tout enregistrement en cours
    useEffect(() => {
      return () => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
      };
    }, []);

    const voiceEngine = useVoiceEngine({
      onTranscript: text => {
        if (text.trim() && onDictationResult) {
          onDictationResult(text);
        }
      },
    });

    // ═══ HELPERS - FICHIERS ═══
    function detectAnalyzedFileCategory(
      name: string,
      mime: string
    ): AnalyzedFile['category'] {
      const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
      if (['.pdf', '.doc', '.docx', '.txt', '.md', '.log'].includes(ext))
        return 'document';
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'].includes(ext))
        return 'image';
      if (['.json', '.yaml', '.yml', '.csv', '.xml'].includes(ext)) return 'data';
      if (
        [
          '.ts',
          '.tsx',
          '.js',
          '.jsx',
          '.py',
          '.rs',
          '.go',
          '.java',
          '.cpp',
          '.c',
        ].includes(ext)
      )
        return 'code';
      if (mime.startsWith('image/')) return 'image';
      return 'document';
    }

    // ═══ HANDLERS - FICHIERS ═══
    const handleFileImportClick = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        // Si onFilesAnalyzed est disponible, analyser les fichiers
        if (e.target.files && onFilesAnalyzed) {
          try {
            const filesArray = Array.from(e.target.files);
            const analyzedFiles: AnalyzedFile[] = [];

            for (const file of filesArray) {
              // Utilise resolveImportedFileContent pour PDF/DOCX (parsing Tauri)
              // et détection binaire intégrée — fallback metadata si non parsable
              const content = await resolveImportedFileContent(file).catch(
                (err: unknown) => {
                  logger.debug('File content resolution failed', {
                    error: String(err),
                    file: file.name,
                  });
                  return null;
                }
              );

              const analyzed: AnalyzedFile = {
                id: `${Date.now()}-${Math.random()}`,
                name: file.name,
                size: file.size,
                type: file.type,
                category: detectAnalyzedFileCategory(file.name, file.type),
                content,
                preview: content ? content.slice(0, 200) : '',
                status: 'done',
              };

              analyzedFiles.push(analyzed);
            }

            onFilesAnalyzed(analyzedFiles);
            e.target.value = ''; // Reset
          } catch (err) {
            isDev && logger.error('[ChatToolbar] File analysis error:', err);
          }
          return;
        }

        if (e.target.files && onFileImport) {
          onFileImport(e.target.files);
          e.target.value = ''; // Reset pour permettre re-sélection du même fichier
        }
      },
      [onFileImport, onFilesAnalyzed]
    );

    // ═══ HANDLERS - CAPTURE D'ÉCRAN ═══
    const handleScreenCapture = useCallback(async () => {
      if (!onScreenCapture) return;

      const supported = await APISupport.supportsScreenCapture();
      if (!supported) {
        error(APISupport.getErrorMessage('screen-capture'));
        return;
      }

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: 'monitor' } as MediaTrackConstraints,
        });

        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);

        const imageData = canvas.toDataURL('image/png');
        onScreenCapture(imageData);
        isDev && logger.info('[ChatToolbar] Screenshot captured');
      } catch (err) {
        const code = err instanceof Error ? err.name : 'Unknown';
        if (code === 'NotAllowedError') {
          logger.info('[ChatToolbar] Screen capture cancelled by user');
        } else if (code === 'NotFoundError') {
          error('Aucun écran à capturer trouvé');
        } else if (code === 'NotSecureError') {
          error("La capture d'écran nécessite une connexion HTTPS");
        } else {
          logger.error('[ChatToolbar] Screen capture error:', err);
        }
      } finally {
        stream?.getTracks().forEach(track => track.stop());
      }
    }, [onScreenCapture, error]);

    // ═══ HANDLERS - IMAGE/VISION ═══
    const handleImageUploadClick = useCallback(() => {
      imageInputRef.current?.click();
    }, []);

    const handleImageChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || !onImageAnalysis) return;

        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = () => {
          const imageData = reader.result as string;
          onImageAnalysis(imageData, `Analyse cette image: ${file.name}`);
        };

        reader.readAsDataURL(file);
        e.target.value = '';
      },
      [onImageAnalysis]
    );

    const handleCameraCapture = useCallback(async () => {
      if (!onImageAnalysis) return;

      const supported = await APISupport.supportsGetUserMedia();
      if (!supported) {
        error(APISupport.getErrorMessage('camera'));
        return;
      }
      const hasCamera = await APISupport.hasCamera();
      if (!hasCamera) {
        error(
          'Aucune caméra détectée. Vérifiez la connexion du matériel et les permissions.'
        );
        return;
      }

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();

        // Petit délai pour laisser la caméra s'ajuster
        await new Promise(resolve => setTimeout(resolve, 500));

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);

        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onImageAnalysis(imageData, 'Analyse cette capture de ma caméra');
        isDev && logger.info('[ChatToolbar] Camera snapshot captured');
      } catch (err) {
        const code = err instanceof Error ? err.name : 'Unknown';
        if (code === 'NotAllowedError') {
          error(
            "Permission caméra refusée. Autorisez l'accès dans les paramètres du navigateur."
          );
        } else if (code === 'NotFoundError') {
          error('Aucune caméra trouvée ou caméra non accessible.');
        } else {
          logger.error('[ChatToolbar] Camera capture error:', err);
          error(`Erreur caméra: ${(err as Error).message || 'Erreur inconnue'}`);
        }
      } finally {
        stream?.getTracks().forEach(track => track.stop());
      }
    }, [onImageAnalysis, error]);

    // ═══ HANDLERS - DICTÉE ═══
    const handleDictationToggle = useCallback(async () => {
      if (isDictating) {
        setIsDictating(false);
        const result = await voiceEngine.stopDictation();
        if (result.trim() && onDictationResult) {
          onDictationResult(result);
        }
      } else {
        try {
          // ✅ NOUVEAU - Vérifier microphone disponible
          const hasMic = await APISupport.hasMicrophone();
          if (!hasMic) {
            error(
              'Aucun microphone détecté. Vérifiez la connexion du matériel et les permissions.'
            );
            isDev && logger.warn('[ChatToolbar] No microphone found for dictation');
            return;
          }

          setIsDictating(true);
          await voiceEngine.startDictation();
        } catch (err) {
          setIsDictating(false);
          logger.error('[ChatToolbar] Dictation error:', err);
          error(`Erreur dictation: ${(err as Error).message || 'Erreur inconnue'}`);
        }
      }
    }, [isDictating, voiceEngine, onDictationResult]);

    // ✅ NOUVEAU - Auto-stop dictation après 60 secondes
    useAutoTimeout({
      id: 'dictation',
      timeoutMs: 60 * 1000,
      isActive: isDictating,
      onTimeout: () => {
        logger.warn('[ChatToolbar] Dictation auto-stopped after 60s');
        setIsDictating(false);
        onDictationResult?.('[Dictation arrêtée automatiquement après 60s]');
      },
      isDev,
    });

    // ═══ HANDLERS - ENREGISTREMENT AUDIO ═══

    /** Détecte le meilleur MIME type supporté par le navigateur/OS */
    const detectAudioMimeType = (): string => {
      const candidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
      ];
      return candidates.find(t => MediaRecorder.isTypeSupported(t)) ?? '';
    };

    const handleAudioRecordToggle = useCallback(async () => {
      if (isRecordingAudio) {
        setIsRecordingAudio(false);
        mediaRecorderRef.current?.stop();
        return;
      }

      if (!APISupport.supportsMediaRecorder()) {
        error(APISupport.getErrorMessage('media-recorder'));
        return;
      }
      const hasMic = await APISupport.hasMicrophone();
      if (!hasMic) {
        error(
          'Aucun microphone détecté. Vérifiez la connexion du matériel et les permissions.'
        );
        return;
      }

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = detectAudioMimeType();
        const mediaRecorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = e => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blobType = mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
          // Libérer le micro dès l'arrêt — quelle que soit la suite
          stream?.getTracks().forEach(track => track.stop());
          stream = null;
          onAudioRecorded?.(audioBlob);
          isDev &&
            logger.info(
              '[ChatToolbar] Audio recorded:',
              audioBlob.size,
              'bytes',
              blobType
            );
        };

        mediaRecorder.start();
        setIsRecordingAudio(true);
        isDev &&
          logger.info(
            '[ChatToolbar] Audio recording started, mimeType:',
            mimeType || '(default)'
          );
      } catch (err) {
        // Libérer le stream si start() a échoué avant onstop
        stream?.getTracks().forEach(track => track.stop());
        setIsRecordingAudio(false);
        const code = err instanceof Error ? err.name : 'Unknown';
        if (code === 'NotAllowedError') {
          error(
            "Permission microphone refusée. Autorisez l'accès dans les paramètres du navigateur."
          );
        } else {
          logger.error('[ChatToolbar] Audio recording error:', err);
          error(`Erreur enregistrement: ${(err as Error).message || 'Erreur inconnue'}`);
        }
      }
    }, [isRecordingAudio, onAudioRecorded, error]);

    // ✅ NOUVEAU - Auto-stop recording après 5 minutes
    useAutoTimeout({
      id: 'audio-record',
      timeoutMs: 5 * 60 * 1000,
      isActive: isRecordingAudio,
      onTimeout: () => {
        logger.warn('[ChatToolbar] Audio recording auto-stopped after 5 minutes');
        setIsRecordingAudio(false);
        mediaRecorderRef.current?.stop();
      },
      isDev,
    });

    // ═══ HANDLERS - TRANSCRIPTION FICHIER AUDIO ═══
    const handleAudioTranscriptionClick = useCallback(() => {
      audioInputRef.current?.click();
    }, []);

    const handleAudioFileChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || !onTranscriptionResult) return;

        const file = e.target.files[0];

        try {
          isDev && logger.info('[ChatToolbar] Audio transcription started:', file.name);

          // Afficher message de traitement
          onTranscriptionResult(`[Transcription de "${file.name}" en cours...]`);

          // ✅ NOUVEAU - Utiliser le vrai service de transcription Whisper
          const result = await audioTranscriptionService.transcribeFile(file, percent => {
            isDev && logger.info(`[ChatToolbar] Transcription progress: ${percent}%`);
          });

          if (result.error) {
            logger.error('[ChatToolbar] Transcription error:', result.error);
            onTranscriptionResult(
              `[Erreur transcription: ${result.error}]\n\nVérifiez:\n- Backend Tauri disponible\n- Fichier audio valide (<25MB)`
            );
          } else if (result.text) {
            isDev &&
              logger.info(
                '[ChatToolbar] Transcription complete:',
                result.text.length,
                'chars'
              );
            onTranscriptionResult(result.text);
          } else {
            onTranscriptionResult('[Transcription vide - vérifiez le fichier audio]');
          }
        } catch (err) {
          logger.error('[ChatToolbar] Transcription exception:', err);
          onTranscriptionResult(
            `[Erreur: ${(err as Error).message || 'Erreur inconnue'}]`
          );
        }

        e.target.value = ''; // Reset pour permettre le même fichier
      },
      [onTranscriptionResult]
    );

    // ═══ HANDLERS - CONVERSATION AUDIO ═══
    const handleAudioConversationToggle = useCallback(async () => {
      const newState = !isAudioConversationActive;

      try {
        // ✅ NOUVEAU - Vérifier support si on active
        if (newState) {
          const hasMic = await APISupport.hasMicrophone();
          if (!hasMic) {
            error('Aucun microphone détecté. Mode conversation audio non disponible.');
            isDev && logger.warn('[ChatToolbar] No microphone for audio conversation');
            return;
          }

          await voiceEngine.startTurn();
          setIsAudioConversationActive(true);
          setAudioConversationPreferred(true); // ✅ NOUVEAU - Sauvegarder la préférence
          onToggleAudioConversation?.(true);
        } else {
          await voiceEngine.cancelTurn();
          setIsAudioConversationActive(false);
          setAudioConversationPreferred(false);
          onToggleAudioConversation?.(false);
        }

        isDev &&
          logger.info('[ChatToolbar] Audio conversation:', newState ? 'ON' : 'OFF');
      } catch (err) {
        setIsAudioConversationActive(false);
        setAudioConversationPreferred(false);
        logger.error('[ChatToolbar] Audio conversation toggle error:', err);
        error(`Erreur: ${(err as Error).message || 'Erreur inconnue'}`);
      }
    }, [
      isAudioConversationActive,
      voiceEngine,
      setAudioConversationPreferred,
      onToggleAudioConversation,
      error,
    ]);

    // ✅ NOUVEAU - Auto-stop audio conversation après 10 minutes
    useAutoTimeout({
      id: 'audio-conversation',
      timeoutMs: 10 * 60 * 1000,
      isActive: isAudioConversationActive,
      onTimeout: () => {
        logger.warn('[ChatToolbar] Audio conversation auto-stopped after 10 minutes');
        setIsAudioConversationActive(false);
        voiceEngine.cancelTurn();
        onToggleAudioConversation?.(false);
      },
      isDev,
    });

    // ═══ HANDLERS - CAMÉRA LIVE ═══
    const handleCameraLiveToggle = useCallback(async () => {
      if (isCameraActive) {
        disableVision();
        onToggleCameraLive?.(false);
      } else {
        try {
          // ✅ NOUVEAU - Vérifier support et disponibilité caméra
          const supported = await APISupport.supportsGetUserMedia();
          if (!supported) {
            const errorMsg = APISupport.getErrorMessage('camera');
            error(errorMsg);
            isDev && logger.warn('[ChatToolbar] Camera not supported for live mode');
            return;
          }

          const hasCamera = await APISupport.hasCamera();
          if (!hasCamera) {
            error('Aucune caméra détectée. Caméra live non disponible.');
            isDev && logger.warn('[ChatToolbar] No camera found for live mode');
            return;
          }

          await enableVision(30 * 60 * 1000); // 30 minutes
          onToggleCameraLive?.(true);
        } catch (err) {
          logger.error('[ChatToolbar] Camera live toggle error:', err);
          error(`Erreur: ${(err as Error).message || 'Erreur inconnue'}`);
        }
      }
      isDev && logger.info('[ChatToolbar] Camera live:', !isCameraActive ? 'ON' : 'OFF');
    }, [isCameraActive, enableVision, disableVision, onToggleCameraLive]);

    // ═══ HANDLERS - TTS ═══
    const handleTTSToggle = useCallback(() => {
      const newState = !isTTSEnabled;
      setIsTTSEnabledLocal(newState);
      setTTSEnabled(newState); // ✅ NOUVEAU - Sauvegarder la préférence
      onToggleTTS?.(newState);
      isDev && logger.info('[ChatToolbar] TTS:', newState ? 'ON' : 'OFF');
    }, [isTTSEnabled, setTTSEnabled, onToggleTTS]);

    // ═══ RENDER ═══
    return (
      <div className={`chat-toolbar ${compact ? 'compact' : ''} ${className}`}>
        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.md,.json,.yaml,.yml,.js,.ts,.tsx,.jsx,.py,.rs,.cpp,.java,.go,.xml,.csv,.png,.jpg,.jpeg,.gif,.svg,.webp,.pdf,.doc,.docx"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          onChange={handleAudioFileChange}
          style={{ display: 'none' }}
        />

        {/* Toolbar principal - TOUS LES BOUTONS TOUJOURS VISIBLES */}
        <div className="chat-toolbar-main">
          {/* Section 1: Fichiers & Import */}
          <div className="toolbar-section">
            <span className="toolbar-section-label">Fichiers</span>
            <div className="toolbar-buttons">
              <ToolbarButton
                icon={<Paperclip size={18} />}
                label="Importer fichiers"
                tooltip="Importer des fichiers pour analyse (📎)"
                onClick={handleFileImportClick}
                disabled={disabled}
                testId="chat-toolbar-file-import-btn"
              />

              <ToolbarButton
                icon={<MonitorUp size={18} />}
                label="Capture d'écran"
                tooltip="Prendre une capture d'écran (📸)"
                onClick={handleScreenCapture}
                disabled={disabled || !onScreenCapture}
                testId="chat-toolbar-screen-capture-btn"
              />
            </div>
          </div>

          {/* Section 2: Vision & Image */}
          <div className="toolbar-section">
            <span className="toolbar-section-label">Vision</span>
            <div className="toolbar-buttons">
              <ToolbarButton
                icon={<Image size={18} />}
                label="Analyser image"
                tooltip="Importer une image pour analyse IA (👁️)"
                onClick={handleImageUploadClick}
                disabled={disabled || !onImageAnalysis}
                testId="chat-toolbar-image-analysis-btn"
              />

              <ToolbarButton
                icon={<Eye size={18} />}
                label="Capture caméra"
                tooltip="Prendre une photo avec la caméra (📷)"
                onClick={handleCameraCapture}
                disabled={disabled || !onImageAnalysis}
                testId="chat-toolbar-camera-capture-btn"
              />

              <ToolbarButton
                icon={isCameraActive ? <Video size={18} /> : <VideoOff size={18} />}
                activeIcon={<Video size={18} />}
                label="Caméra live"
                tooltip={
                  isCameraActive ? 'Désactiver caméra live' : 'Activer caméra live'
                }
                active={isCameraActive}
                onClick={handleCameraLiveToggle}
                disabled={disabled}
                testId="chat-toolbar-camera-live-btn"
              />
            </div>
          </div>

          {/* Section 3: Audio & Voice - TOUJOURS VISIBLE */}
          <div className="toolbar-section">
            <span className="toolbar-section-label">Audio</span>
            <div className="toolbar-buttons">
              <ToolbarButton
                icon={<Mic size={18} />}
                activeIcon={<Square size={18} />}
                label="Dictée vocale"
                tooltip={
                  isDictating ? 'Arrêter la dictée' : 'Démarrer la dictée vocale (🎙️)'
                }
                active={isDictating}
                recording={isDictating}
                onClick={handleDictationToggle}
                disabled={disabled}
                variant={isDictating ? 'danger' : 'default'}
                testId="chat-toolbar-dictation-btn"
              />

              <ToolbarButton
                icon={<Disc size={18} />}
                activeIcon={<Square size={18} />}
                label="Enregistrer audio"
                tooltip={
                  isRecordingAudio
                    ? "Arrêter l'enregistrement"
                    : 'Enregistrer un message audio (🔴)'
                }
                active={isRecordingAudio}
                recording={isRecordingAudio}
                onClick={handleAudioRecordToggle}
                disabled={disabled}
                variant={isRecordingAudio ? 'danger' : 'default'}
                testId="chat-toolbar-audio-record-btn"
              />

              <ToolbarButton
                icon={<FileAudio size={18} />}
                label="Transcrire audio"
                tooltip="Importer un fichier audio pour transcription (📝)"
                onClick={handleAudioTranscriptionClick}
                disabled={disabled}
                testId="chat-toolbar-audio-transcribe-btn"
              />
            </div>
          </div>

          {/* Section 4: Modes de conversation - TOUJOURS VISIBLE */}
          <div className="toolbar-section">
            <span className="toolbar-section-label">Conversation</span>
            <div className="toolbar-buttons">
              <ToolbarButton
                icon={<Headphones size={18} />}
                activeIcon={<Headphones size={18} />}
                label="Mode conversation audio"
                tooltip={
                  isAudioConversationActive
                    ? 'Désactiver conversation audio'
                    : 'Activer mode conversation audio (🔊)'
                }
                active={isAudioConversationActive}
                onClick={handleAudioConversationToggle}
                disabled={disabled}
                variant={isAudioConversationActive ? 'success' : 'default'}
                testId="chat-toolbar-audio-conversation-btn"
              />

              <ToolbarButton
                icon={isTTSEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                activeIcon={<Volume2 size={18} />}
                label="Synthèse vocale"
                tooltip={
                  isTTSEnabled
                    ? 'Désactiver la synthèse vocale'
                    : 'Activer la synthèse vocale (TTS)'
                }
                active={isTTSEnabled}
                onClick={handleTTSToggle}
                disabled={disabled}
                testId="chat-toolbar-tts-toggle-btn"
              />
            </div>
          </div>
        </div>

        {/* Recording Timer - NOUVEAU */}
        <RecordingTimer isRecording={isRecordingAudio} maxDuration={5 * 60} />

        {/* Indicateurs d'état */}
        <div className="chat-toolbar-status">
          {isDictating && (
            <span className="toolbar-status-item recording">🎙️ Dictée en cours...</span>
          )}
          {isRecordingAudio && (
            <span className="toolbar-status-item recording">
              🔴 Enregistrement audio...
            </span>
          )}
          {isAudioConversationActive && (
            <span className="toolbar-status-item active">
              🔊 Conversation audio active
            </span>
          )}
          {isCameraActive && (
            <span className="toolbar-status-item active">📹 Caméra active</span>
          )}
        </div>
      </div>
    );
  }
);

ChatToolbar.displayName = 'ChatToolbar';

export default ChatToolbar;
