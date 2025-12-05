/**
 * TITANE∞ vΩΩΩ — TTS Engine Configuration
 * © 2025 TITANE Team. All rights reserved.
 *
 * Configuration complète du système TTS:
 * - Types et interfaces
 * - Emotion Map
 * - Voice Settings
 * - Cache Configuration
 */

// =============================================================================
// TYPES: ÉMOTIONS
// =============================================================================

/** Émotions TTS supportées */
export type TTSEmotion =
  | 'neutral'
  | 'calm'
  | 'focusing'
  | 'excited'
  | 'soft'
  | 'grounded'
  | 'uplifting'
  | 'empathetic'
  | 'disciplined'
  | 'inspired';

/** Profil d'émotion avec paramètres vocaux */
export interface EmotionProfile {
  /** Identifiant de l'émotion */
  emotion: TTSEmotion;
  /** Multiplicateur de pitch (0.5 - 2.0) */
  pitch: number;
  /** Multiplicateur de vitesse (0.5 - 2.0) */
  speed: number;
  /** Stabilité ElevenLabs (0.0 - 1.0) */
  stability: number;
  /** Similarity boost ElevenLabs (0.0 - 1.0) */
  similarityBoost: number;
  /** Style exageration ElevenLabs (0.0 - 1.0) */
  styleExaggeration: number;
  /** Mots-clés déclencheurs */
  keywords: string[];
  /** Description pour UI */
  description: string;
}

// =============================================================================
// TYPES: PROVIDER & ENGINE
// =============================================================================

/** Providers TTS disponibles */
export type TTSProvider = 'elevenlabs' | 'piper' | 'espeak' | 'webspeech';

/** Statut d'un provider */
export type TTSProviderStatus = 'available' | 'unavailable' | 'error' | 'unknown';

/** Configuration d'un provider */
export interface TTSProviderConfig {
  provider: TTSProvider;
  priority: number;
  enabled: boolean;
  fallbackOrder: number;
  requiresInternet: boolean;
  requiresApiKey: boolean;
  quality: 'high' | 'medium' | 'low';
  averageLatencyMs: number;
}

// =============================================================================
// TYPES: REQUÊTES
// =============================================================================

/** Requête TTS complète */
export interface TTSRequest {
  /** ID unique de la requête */
  id: string;
  /** Texte à synthétiser */
  text: string;
  /** Émotion détectée ou forcée */
  emotion: TTSEmotion;
  /** Provider préféré (optionnel) */
  preferredProvider?: TTSProvider;
  /** ID du message source (pour cache) */
  messageId?: string;
  /** Configuration vocale custom */
  voiceSettings?: TTSVoiceSettings;
  /** Priorité dans la queue (1-10) */
  priority: number;
  /** Timestamp de création */
  createdAt: number;
  /** Forcer régénération (ignorer cache) */
  forceRegenerate?: boolean;
}

/** Paramètres vocaux */
export interface TTSVoiceSettings {
  /** ID de la voix (ElevenLabs voice_id ou nom local) */
  voiceId: string;
  /** Vitesse (0.5 - 2.0) */
  speed: number;
  /** Pitch (0.5 - 2.0) */
  pitch: number;
  /** Volume (0.0 - 1.0) */
  volume: number;
  /** Langue */
  language: string;
  /** Paramètres ElevenLabs spécifiques */
  elevenLabsSettings?: ElevenLabsVoiceSettings;
}

/** Paramètres spécifiques ElevenLabs */
export interface ElevenLabsVoiceSettings {
  /** Stabilité vocale (0.0 - 1.0) */
  stability: number;
  /** Similarity boost (0.0 - 1.0) */
  similarityBoost: number;
  /** Style exaggeration (0.0 - 1.0) */
  style: number;
  /** Use speaker boost */
  useSpeakerBoost: boolean;
}

// =============================================================================
// TYPES: RÉPONSES
// =============================================================================

/** Réponse TTS */
export interface TTSResponse {
  /** ID de la requête */
  requestId: string;
  /** Succès */
  success: boolean;
  /** Provider utilisé */
  provider: TTSProvider;
  /** Chemin du fichier audio */
  audioPath?: string;
  /** Données audio (base64) si streaming */
  audioData?: string;
  /** Format audio */
  format: 'wav' | 'mp3' | 'ogg';
  /** Durée en millisecondes */
  durationMs: number;
  /** Latence de génération */
  latencyMs: number;
  /** Émotion appliquée */
  emotionApplied: TTSEmotion;
  /** Erreur si échec */
  error?: string;
  /** Timestamp */
  timestamp: number;
}

/** Résultat de génération audio */
export interface AudioGenerationResult {
  /** Fichier généré */
  filePath: string;
  /** Taille en bytes */
  sizeBytes: number;
  /** Durée en ms */
  durationMs: number;
  /** Sample rate */
  sampleRate: number;
  /** Canaux audio */
  channels: number;
  /** Depuis cache */
  fromCache: boolean;
}

// =============================================================================
// TYPES: ÉTAT
// =============================================================================

/** État global du système TTS */
export interface TTSState {
  /** En cours de synthèse */
  isSpeaking: boolean;
  /** En pause */
  isPaused: boolean;
  /** Provider actif */
  activeProvider: TTSProvider | null;
  /** Requête en cours */
  currentRequest: TTSRequest | null;
  /** Progress (0-100) */
  progress: number;
  /** Queue de requêtes */
  queueSize: number;
  /** Statut des providers */
  providerStatus: Record<TTSProvider, TTSProviderStatus>;
  /** Dernière erreur */
  lastError: string | null;
  /** Volume global (0-1) */
  globalVolume: number;
  /** Voix sélectionnée */
  selectedVoice: string;
  /** Émotion auto-détectée */
  autoEmotion: boolean;
}

/** Item dans la queue TTS */
export interface TTSQueueItem {
  /** Requête */
  request: TTSRequest;
  /** Statut */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  /** Tentatives */
  attempts: number;
  /** Max tentatives */
  maxAttempts: number;
  /** Résultat si complété */
  result?: TTSResponse;
  /** Callback on complete */
  onComplete?: (result: TTSResponse) => void;
  /** Callback on error */
  onError?: (error: string) => void;
}

/** Audio attaché à un message */
export interface TTSMessageAudio {
  /** ID du message */
  messageId: string;
  /** Chemin audio */
  audioPath: string;
  /** Durée */
  durationMs: number;
  /** Émotion */
  emotion: TTSEmotion;
  /** Provider utilisé */
  provider: TTSProvider;
  /** Timestamp génération */
  generatedAt: number;
  /** En cours de lecture */
  isPlaying: boolean;
}

// =============================================================================
// TYPES: PRÉFÉRENCES UTILISATEUR
// =============================================================================

/** Préférences TTS utilisateur */
export interface TTSPreferences {
  /** TTS activé */
  enabled: boolean;
  /** Auto-play réponses IA */
  autoPlayResponses: boolean;
  /** Provider préféré */
  preferredProvider: TTSProvider;
  /** ID voix ElevenLabs */
  elevenLabsVoiceId: string;
  /** Vitesse globale */
  globalSpeed: number;
  /** Pitch global */
  globalPitch: number;
  /** Volume global */
  globalVolume: number;
  /** Langue */
  language: string;
  /** Adaptation émotionnelle auto */
  emotionalAdaptation: boolean;
  /** Émotion par défaut */
  defaultEmotion: TTSEmotion;
  /** Cache activé */
  cacheEnabled: boolean;
  /** Durée cache (jours) */
  cacheDurationDays: number;
}

// =============================================================================
// TYPES: MICROPHONE
// =============================================================================

/** État du microphone */
export interface MicrophoneState {
  /** Disponible */
  available: boolean;
  /** En enregistrement */
  isRecording: boolean;
  /** Permission accordée */
  permissionGranted: boolean;
  /** Permission demandée */
  permissionRequested: boolean;
  /** Device ID actif */
  activeDeviceId: string | null;
  /** Niveau audio (0-1) */
  audioLevel: number;
  /** Erreur */
  error: string | null;
}

/** Device audio d'entrée */
export interface AudioInputDevice {
  deviceId: string;
  label: string;
  groupId: string;
  isDefault: boolean;
}

// =============================================================================
// CONSTANTES: EMOTION MAP
// =============================================================================

/** Map des profils émotionnels */
export const EMOTION_PROFILES: Record<TTSEmotion, EmotionProfile> = {
  neutral: {
    emotion: 'neutral',
    pitch: 1.0,
    speed: 1.0,
    stability: 0.80,
    similarityBoost: 0.85,
    styleExaggeration: 0.0,
    keywords: [],
    description: 'Voix neutre et équilibrée',
  },
  calm: {
    emotion: 'calm',
    pitch: 0.95,
    speed: 0.90,
    stability: 0.85,
    similarityBoost: 0.80,
    styleExaggeration: 0.1,
    keywords: ['calme', 'tranquille', 'serein', 'paisible', 'relaxe', 'zen', 'apaisé'],
    description: 'Voix calme et apaisante',
  },
  focusing: {
    emotion: 'focusing',
    pitch: 1.0,
    speed: 1.05,
    stability: 0.90,
    similarityBoost: 0.85,
    styleExaggeration: 0.05,
    keywords: ['concentre', 'focus', 'attention', 'précis', 'méthodique', 'analyse'],
    description: 'Voix concentrée et précise',
  },
  excited: {
    emotion: 'excited',
    pitch: 1.15,
    speed: 1.20,
    stability: 0.60,
    similarityBoost: 0.75,
    styleExaggeration: 0.4,
    keywords: ['génial', 'super', 'incroyable', 'fantastique', 'wow', 'excellent', '!'],
    description: 'Voix excitée et enthousiaste',
  },
  soft: {
    emotion: 'soft',
    pitch: 0.90,
    speed: 0.85,
    stability: 0.90,
    similarityBoost: 0.90,
    styleExaggeration: 0.15,
    keywords: ['doux', 'gentil', 'tendre', 'délicat', 'subtil', 'léger'],
    description: 'Voix douce et tendre',
  },
  grounded: {
    emotion: 'grounded',
    pitch: 0.95,
    speed: 0.95,
    stability: 0.95,
    similarityBoost: 0.85,
    styleExaggeration: 0.0,
    keywords: ['stable', 'ancré', 'solide', 'terre', 'concret', 'réaliste'],
    description: 'Voix ancrée et stable',
  },
  uplifting: {
    emotion: 'uplifting',
    pitch: 1.10,
    speed: 1.10,
    stability: 0.70,
    similarityBoost: 0.80,
    styleExaggeration: 0.3,
    keywords: ['motivant', 'courage', 'force', 'capable', 'réussir', 'bravo', 'félicitations'],
    description: 'Voix motivante et encourageante',
  },
  empathetic: {
    emotion: 'empathetic',
    pitch: 0.98,
    speed: 0.92,
    stability: 0.85,
    similarityBoost: 0.88,
    styleExaggeration: 0.2,
    keywords: ['comprends', 'désolé', 'difficile', 'soutien', 'ensemble', 'écoute'],
    description: 'Voix empathique et compréhensive',
  },
  disciplined: {
    emotion: 'disciplined',
    pitch: 1.02,
    speed: 1.0,
    stability: 0.92,
    similarityBoost: 0.82,
    styleExaggeration: 0.0,
    keywords: ['important', 'strict', 'règle', 'discipline', 'structure', 'ordre'],
    description: 'Voix disciplinée et structurée',
  },
  inspired: {
    emotion: 'inspired',
    pitch: 1.08,
    speed: 1.05,
    stability: 0.75,
    similarityBoost: 0.78,
    styleExaggeration: 0.25,
    keywords: ['créatif', 'idée', 'inspiration', 'vision', 'imagine', 'rêve', 'possible'],
    description: 'Voix inspirée et créative',
  },
};

// =============================================================================
// CONSTANTES: CONFIGURATION PROVIDERS
// =============================================================================

/** Configuration des providers TTS */
export const TTS_PROVIDER_CONFIG: Record<TTSProvider, TTSProviderConfig> = {
  elevenlabs: {
    provider: 'elevenlabs',
    priority: 1,
    enabled: true,
    fallbackOrder: 1,
    requiresInternet: true,
    requiresApiKey: true,
    quality: 'high',
    averageLatencyMs: 800,
  },
  piper: {
    provider: 'piper',
    priority: 2,
    enabled: true,
    fallbackOrder: 2,
    requiresInternet: false,
    requiresApiKey: false,
    quality: 'medium',
    averageLatencyMs: 200,
  },
  espeak: {
    provider: 'espeak',
    priority: 3,
    enabled: true,
    fallbackOrder: 3,
    requiresInternet: false,
    requiresApiKey: false,
    quality: 'low',
    averageLatencyMs: 50,
  },
  webspeech: {
    provider: 'webspeech',
    priority: 4,
    enabled: true,
    fallbackOrder: 4,
    requiresInternet: false,
    requiresApiKey: false,
    quality: 'medium',
    averageLatencyMs: 100,
  },
};

// =============================================================================
// CONSTANTES: VOIX OFFICIELLE TITANE
// =============================================================================

/** Voice ID officielle TITANE (ElevenLabs) */
export const TITANE_VOICE_ID = 'FvmvwvObRqIHojkEGh5N';

/** Configuration voix par défaut */
export const DEFAULT_VOICE_SETTINGS: TTSVoiceSettings = {
  voiceId: TITANE_VOICE_ID,
  speed: 1.0,
  pitch: 1.0,
  volume: 1.0,
  language: 'fr-FR',
  elevenLabsSettings: {
    stability: 0.75,
    similarityBoost: 0.85,
    style: 0.0,
    useSpeakerBoost: true,
  },
};

/** Préférences TTS par défaut */
export const DEFAULT_TTS_PREFERENCES: TTSPreferences = {
  enabled: true,
  autoPlayResponses: false,
  preferredProvider: 'elevenlabs',
  elevenLabsVoiceId: TITANE_VOICE_ID,
  globalSpeed: 1.0,
  globalPitch: 1.0,
  globalVolume: 0.8,
  language: 'fr-FR',
  emotionalAdaptation: true,
  defaultEmotion: 'neutral',
  cacheEnabled: true,
  cacheDurationDays: 7,
};

// =============================================================================
// CONSTANTES: CACHE
// =============================================================================

/** Configuration du cache TTS */
export const TTS_CACHE_CONFIG = {
  /** Dossier de cache */
  cacheDir: 'data/tts',
  /** Extension fichiers */
  fileExtension: '.wav',
  /** Préfixe fichiers */
  filePrefix: 'msg_',
  /** Taille max cache (Mo) */
  maxCacheSizeMB: 500,
  /** Durée de vie max (jours) */
  maxAgeDays: 30,
  /** Nettoyage auto (heures) */
  cleanupIntervalHours: 24,
};

// =============================================================================
// CONSTANTES: LIMITES
// =============================================================================

/** Limites TTS */
export const TTS_LIMITS = {
  /** Longueur max texte */
  maxTextLength: 5000,
  /** Longueur min texte */
  minTextLength: 1,
  /** Taille max queue */
  maxQueueSize: 50,
  /** Timeout requête (ms) */
  requestTimeoutMs: 30000,
  /** Max tentatives */
  maxRetries: 3,
  /** Délai entre tentatives (ms) */
  retryDelayMs: 1000,
  /** Rate limit (requêtes/min) */
  rateLimitPerMinute: 30,
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Génère un ID unique pour une requête TTS
 */
export function generateTTSRequestId(): string {
  return `tts_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Génère le chemin de cache pour un message
 */
export function getCacheFilePath(messageId: string): string {
  return `${TTS_CACHE_CONFIG.cacheDir}/${TTS_CACHE_CONFIG.filePrefix}${messageId}${TTS_CACHE_CONFIG.fileExtension}`;
}

/**
 * Crée une requête TTS par défaut
 */
export function createTTSRequest(
  text: string,
  options: Partial<TTSRequest> = {}
): TTSRequest {
  return {
    id: generateTTSRequestId(),
    text,
    emotion: options.emotion ?? 'neutral',
    preferredProvider: options.preferredProvider,
    messageId: options.messageId,
    voiceSettings: options.voiceSettings ?? DEFAULT_VOICE_SETTINGS,
    priority: options.priority ?? 5,
    createdAt: Date.now(),
    forceRegenerate: options.forceRegenerate ?? false,
  };
}

/**
 * Crée un état TTS initial
 */
export function createInitialTTSState(): TTSState {
  return {
    isSpeaking: false,
    isPaused: false,
    activeProvider: null,
    currentRequest: null,
    progress: 0,
    queueSize: 0,
    providerStatus: {
      elevenlabs: 'unknown',
      piper: 'unknown',
      espeak: 'unknown',
      webspeech: 'unknown',
    },
    lastError: null,
    globalVolume: DEFAULT_TTS_PREFERENCES.globalVolume,
    selectedVoice: TITANE_VOICE_ID,
    autoEmotion: true,
  };
}

/**
 * Crée un état microphone initial
 */
export function createInitialMicrophoneState(): MicrophoneState {
  return {
    available: false,
    isRecording: false,
    permissionGranted: false,
    permissionRequested: false,
    activeDeviceId: null,
    audioLevel: 0,
    error: null,
  };
}
