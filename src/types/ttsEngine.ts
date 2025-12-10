/**
 * TITANE∞ vΩ∞ — TYPES TTS ENGINE
 * Super Prompt #4: Système Text-to-Speech ElevenLabs avancé
 *
 * A. Définitions TypeScript complètes pour:
 *    - Voix ElevenLabs avec émotions
 *    - Configuration TTS avancée
 *    - Queue de synthèse vocale
 *    - État et métriques TTS
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ============================================================================
// VOIX ET ÉMOTIONS
// ============================================================================

/**
 * ID de voix ElevenLabs
 * Voice ID principale: FvmvwvObRqIHojkEGh5N (Rachel - FR)
 */
export type VoiceId = string;

/**
 * Émotions supportées par le système TTS
 */
export type TTSEmotion =
  | 'neutral' // Ton neutre, informatif
  | 'joyful' // Enthousiaste, positif
  | 'empathetic' // Compréhensif, doux
  | 'serious' // Sérieux, professionnel
  | 'curious' // Intéressé, interrogatif
  | 'confident' // Assuré, affirmé
  | 'calm' // Apaisé, relaxé
  | 'urgent' // Pressé, alerte
  | 'playful' // Ludique, taquin
  | 'thoughtful'; // Réfléchi, méditatif

/**
 * Intensité de l'émotion
 */
export type EmotionIntensity = 'subtle' | 'moderate' | 'strong';

/**
 * Configuration émotionnelle complète
 */
export interface EmotionConfig {
  emotion: TTSEmotion;
  intensity: EmotionIntensity;

  // Ajustements vocaux
  stabilityModifier: number; // -0.3 à 0.3
  clarityModifier: number; // -0.3 à 0.3
  styleModifier: number; // -0.3 à 0.3
}

// ============================================================================
// CONFIGURATION VOIX
// ============================================================================

/**
 * Configuration de voix ElevenLabs
 */
export interface VoiceConfig {
  id: VoiceId;
  name: string;
  description?: string;

  // Paramètres de base
  stability: number; // 0-1 (stabilité/consistance)
  similarityBoost: number; // 0-1 (ressemblance à la voix d'origine)
  style: number; // 0-1 (exagération du style)
  useSpeakerBoost: boolean; // Amélioration du locuteur

  // Paramètres avancés
  pitchShift?: number; // -12 à 12 demi-tons
  speakingRate?: number; // 0.5 à 2.0

  // Préférences
  preferredEmotion?: TTSEmotion;
  languageCode: string; // 'fr-FR', 'en-US', etc.
}

/**
 * Modèle TTS ElevenLabs
 */
export type TTSModel =
  | 'eleven_multilingual_v2' // Multi-langues v2 (recommandé)
  | 'eleven_multilingual_v1' // Multi-langues v1
  | 'eleven_monolingual_v1' // Anglais uniquement
  | 'eleven_turbo_v2' // Ultra-rapide
  | 'eleven_turbo_v2_5'; // Ultra-rapide v2.5

/**
 * Format audio de sortie
 */
export type AudioFormat =
  | 'mp3_44100_128'
  | 'mp3_44100_192'
  | 'pcm_16000'
  | 'pcm_22050'
  | 'pcm_24000'
  | 'pcm_44100'
  | 'ulaw_8000';

// ============================================================================
// REQUÊTES TTS
// ============================================================================

/**
 * Requête de synthèse vocale
 */
export interface TTSRequest {
  id: string;
  text: string;

  // Configuration
  voiceId: VoiceId;
  model: TTSModel;
  format: AudioFormat;

  // Paramètres vocaux
  stability: number;
  similarityBoost: number;
  style?: number;
  useSpeakerBoost?: boolean;

  // Émotion
  emotion?: EmotionConfig;

  // Priorité et timing
  priority: TTSPriority;
  createdAt: number;

  // Métadonnées
  source: TTSSource;
  metadata?: Record<string, unknown>;
}

export type TTSPriority =
  | 'low' // Peut attendre
  | 'normal' // Standard
  | 'high' // Prioritaire
  | 'immediate'; // Interrompt la file

export type TTSSource =
  | 'chat' // Message IA
  | 'notification' // Notification système
  | 'reading' // Lecture de contenu
  | 'command' // Commande vocale
  | 'alert'; // Alerte

// ============================================================================
// RÉPONSES ET RÉSULTATS
// ============================================================================

/**
 * Résultat de synthèse vocale
 */
export interface TTSResult {
  requestId: string;
  success: boolean;

  // Audio
  audioData?: ArrayBuffer;
  audioUrl?: string;
  duration?: number; // ms

  // Métriques
  generationTimeMs: number;
  characterCount: number;

  // Erreur
  error?: TTSError;
}

/**
 * Erreur TTS
 */
export interface TTSError {
  code: TTSErrorCode;
  message: string;
  retryable: boolean;
  suggestion?: string;
}

export type TTSErrorCode =
  | 'RATE_LIMIT' // Limite de taux atteinte
  | 'QUOTA_EXCEEDED' // Quota dépassé
  | 'INVALID_VOICE' // Voix invalide
  | 'TEXT_TOO_LONG' // Texte trop long
  | 'API_ERROR' // Erreur API
  | 'NETWORK_ERROR' // Erreur réseau
  | 'AUDIO_ERROR' // Erreur audio
  | 'TIMEOUT' // Timeout
  | 'UNKNOWN'; // Erreur inconnue

// ============================================================================
// QUEUE DE SYNTHÈSE
// ============================================================================

/**
 * État d'un élément de la queue
 */
export type QueueItemStatus =
  | 'pending' // En attente
  | 'processing' // En cours de synthèse
  | 'ready' // Audio prêt
  | 'playing' // En cours de lecture
  | 'completed' // Terminé
  | 'failed' // Échoué
  | 'cancelled'; // Annulé

/**
 * Élément de la queue TTS
 */
export interface TTSQueueItem {
  request: TTSRequest;
  status: QueueItemStatus;

  // Progression
  progress: number; // 0-100

  // Résultat
  result?: TTSResult;

  // Timing
  queuedAt: number;
  startedAt?: number;
  completedAt?: number;

  // Retries
  retryCount: number;
  maxRetries: number;
}

/**
 * État de la queue
 */
export interface TTSQueueState {
  items: TTSQueueItem[];
  currentItem: TTSQueueItem | null;

  // Statistiques
  totalProcessed: number;
  totalFailed: number;
  averageProcessingTime: number;

  // Contrôle
  isPaused: boolean;
  isMuted: boolean;
}

// ============================================================================
// PLAYBACK
// ============================================================================

/**
 * État de lecture audio
 */
export interface TTSPlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  isMuted: boolean;

  // Audio courant
  currentRequestId: string | null;
  currentText: string | null;

  // Progression
  currentTime: number; // ms
  duration: number; // ms
  progress: number; // 0-100

  // Volume
  volume: number; // 0-1

  // Vitesse
  playbackRate: number; // 0.5-2.0
}

/**
 * Événements de lecture
 */
export type TTSPlaybackEvent =
  | { type: 'play'; requestId: string }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'stop' }
  | { type: 'end'; requestId: string }
  | { type: 'error'; error: TTSError }
  | { type: 'progress'; progress: number; time: number };

// ============================================================================
// CACHE AUDIO
// ============================================================================

/**
 * Entrée du cache audio
 */
export interface AudioCacheEntry {
  key: string; // Hash du texte + config
  audioData: ArrayBuffer;
  duration: number;

  // Métadonnées
  text: string;
  voiceId: VoiceId;
  emotion?: TTSEmotion;

  // Timing
  createdAt: number;
  lastAccessedAt: number;
  accessCount: number;

  // Taille
  sizeBytes: number;
}

/**
 * État du cache
 */
export interface AudioCacheState {
  entries: Map<string, AudioCacheEntry>;

  // Limites
  maxEntries: number;
  maxSizeBytes: number;

  // Stats
  currentSizeBytes: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
}

// ============================================================================
// MÉTRIQUES ET MONITORING
// ============================================================================

/**
 * Métriques TTS
 */
export interface TTSMetrics {
  // Usage
  totalRequests: number;
  totalCharacters: number;
  totalDurationMs: number;

  // Performance
  averageLatencyMs: number;
  p95LatencyMs: number;
  successRate: number;

  // Par émotion
  emotionUsage: Record<TTSEmotion, number>;

  // Cache
  cacheHitRate: number;
  cacheSizeBytes: number;

  // Erreurs
  errorCounts: Record<TTSErrorCode, number>;

  // Quota
  quotaUsed: number;
  quotaLimit: number;
  quotaResetAt: number;
}

/**
 * Statut de santé TTS
 */
export interface TTSHealthStatus {
  isHealthy: boolean;
  apiAvailable: boolean;
  audioDeviceAvailable: boolean;

  // Dernière vérification
  lastCheckAt: number;

  // Issues
  issues: TTSHealthIssue[];
}

export interface TTSHealthIssue {
  severity: 'warning' | 'error';
  code: string;
  message: string;
  suggestion?: string;
}

// ============================================================================
// CONFIGURATION GLOBALE
// ============================================================================

/**
 * Configuration globale du TTS Engine
 */
export interface TTSEngineConfig {
  // API ElevenLabs
  apiKey?: string;
  apiEndpoint: string;

  // Voix par défaut
  defaultVoiceId: VoiceId;
  defaultModel: TTSModel;
  defaultFormat: AudioFormat;

  // Paramètres par défaut
  defaultStability: number;
  defaultSimilarityBoost: number;
  defaultStyle: number;

  // Queue
  maxQueueSize: number;
  maxRetries: number;
  retryDelayMs: number;

  // Cache
  cacheEnabled: boolean;
  maxCacheEntries: number;
  maxCacheSizeBytes: number;
  cacheTTLMs: number;

  // Limites
  maxTextLength: number;
  rateLimitPerMinute: number;

  // Audio
  preloadNextInQueue: boolean;
  crossfadeDurationMs: number;
}

// ============================================================================
// COMMANDES TAURI
// ============================================================================

/**
 * Types de commandes TTS
 */
export type TTSCommandType =
  | 'tts_speak'
  | 'tts_stop'
  | 'tts_pause'
  | 'tts_resume'
  | 'tts_set_volume'
  | 'tts_set_rate'
  | 'tts_get_voices'
  | 'tts_get_status'
  | 'tts_test_voice'
  | 'tts_clear_cache'
  | 'tts_get_metrics';

/**
 * Réponse backend TTS
 */
export interface TTSBackendResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: TTSError;
  timing: {
    requestedAt: number;
    respondedAt: number;
    durationMs: number;
  };
}

// ============================================================================
// HOOKS ET CALLBACKS
// ============================================================================

/**
 * Callbacks pour événements TTS
 */
export interface TTSEventCallbacks {
  onSpeakStart?: (request: TTSRequest) => void;
  onSpeakEnd?: (request: TTSRequest) => void;
  onSpeakError?: (error: TTSError, request: TTSRequest) => void;
  onQueueUpdate?: (queue: TTSQueueState) => void;
  onPlaybackUpdate?: (state: TTSPlaybackState) => void;
  onVolumeChange?: (volume: number) => void;
  onMuteChange?: (isMuted: boolean) => void;
}

/**
 * État observable du TTS Engine
 */
export interface TTSEngineState {
  isInitialized: boolean;
  isEnabled: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  isMuted: boolean;

  // Config active
  currentVoice: VoiceConfig | null;
  currentEmotion: TTSEmotion;

  // Volume
  volume: number;
  playbackRate: number;

  // Queue
  queueLength: number;
  currentRequest: TTSRequest | null;

  // Métriques
  metrics: TTSMetrics;
  health: TTSHealthStatus;

  // Erreurs récentes
  recentErrors: TTSError[];
}
