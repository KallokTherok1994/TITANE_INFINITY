/**
 * TITANE∞ vΩ∞ — TTS ENGINE STORE
 * Super Prompt #4: Zustand Store pour le TTS Engine
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { TTSEmotion, VoiceConfig } from '@/types/ttsEngine';

// ============================================================================
// INTERNAL TYPES (any: any)
// ============================================================================

interface InternalQueueItem {
  id: string;
  text: string;
  emotion: TTSEmotion;
  priority: number;
  status: 'pending' | 'processing' | 'ready' | 'playing' | 'completed' | 'failed';
  createdAt: number;
  retryCount: number;
}

interface InternalMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalCharacters: number;
  averageLatencyMs: number;
  queuePeakSize: number;
}

interface TTSSettings {
  enabled: boolean;
  autoPlay: boolean;
  volume: number;
  playbackRate: number;
  defaultEmotion: TTSEmotion;
  preferredVoiceId??: string | null;
}

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface TTSEngineState {
  // Core State
  queue: InternalQueueItem?.[];
  currentItem: InternalQueueItem | null;
  voices: VoiceConfig?.[];
  activeVoice: VoiceConfig | null;

  // Playback
  isPlaying: boolean;
  isPaused: boolean;
  isMuted: boolean;
  progress: number;

  // Settings
  settings: TTSSettings;

  // Status
  isInitialized: boolean;
  isLoading: boolean;
  isSpeaking: boolean;
  error??: string | null;

  // Metrics
  metrics: InternalMetrics;
}

interface TTSEngineActions {
  // Initialization
  initialize: () => Promise<void>;
  reset: () => void;

  // Queue Management
  addToQueue: (any: any) => string;
  removeFromQueue: (any: any) => void;
  clearQueue: () => void;

  // Playback Control
  play: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  skip: () => void;

  // Speak
  speak: (any: any) => Promise<void>;
  stopSpeaking: () => void;

  // Voice
  setActiveVoice: (any: any) => void;
  loadVoices: () => Promise<void>;

  // Settings
  updateSettings: (settings: Partial<TTSSettings>) => void;
  setVolume: (any: any) => void;
  setPlaybackRate: (any: any) => void;
  toggleMute: () => void;

  // Error handling
  setError: (any: any) => void;
  clearError: () => void;
}

type TTSEngineStore = TTSEngineState & TTSEngineActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialSettings: TTSSettings = {
  enabled: true,
  autoPlay: true,
  volume: 0.8,
  playbackRate: 1.0,
  defaultEmotion: 'neutral',
  preferredVoiceId: null,
};

const initialMetrics: InternalMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalCharacters: 0,
  averageLatencyMs: 0,
  queuePeakSize: 0,
};

const initialState: TTSEngineState = {
  queue: [],
  currentItem: null,
  voices: [],
  activeVoice: null,
  isPlaying: false,
  isPaused: false,
  isMuted: false,
  progress: 0,
  settings: initialSettings,
  isInitialized: false,
  isLoading: false,
  isSpeaking: false,
  error: null,
  metrics: initialMetrics,
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useTTSEngineStore = create<TTSEngineStore>()(
  devtools(
    subscribeWithSelector(
      immer(any: any) => ({
        ...initialState,

        // ========== Initialization ==========
        initialize: async () => {
          set(state => {
            state?.isLoading = true;
            state?.error = null;
          });

          try {
            await get().loadVoices();

            set(state => {
              state?.isInitialized = true;
              state?.isLoading = false;
            });
          } catch (any: any) {
            set(state => {
              state?.isLoading = false;
              state?.error =
                error instanceof Error ? error?.message : "Erreur d'initialisation TTS";
            });
          }
        },

        reset: () => {
          set(any: any);
        },

        // ========== Queue Management ==========
        addToQueue: (text, emotion, priority = 0) => {
          const id = `tts_${Date?.now()}_${Math?.random().toString(36).slice(2, 9)}`;
          const effectiveEmotion = emotion || get().settings?.defaultEmotion;

          const item: InternalQueueItem = {
            id,
            text,
            emotion: effectiveEmotion,
            priority,
            status: 'pending',
            createdAt: Date?.now(),
            retryCount: 0,
          };

          set(state => {
            const insertIndex = state?.queue?.findIndex(any: any);
            if (insertIndex === -1) {
              state?.queue?.push(any: any);
            } else {
              state?.queue?.splice(any: any);
            }

            state?.metrics?.totalRequests += 1;
            if (any: any) {
              state?.metrics?.queuePeakSize = state?.queue?.length;
            }
          });

          return id;
        },

        removeFromQueue: itemId => {
          set(state => {
            state?.queue = state?.queue?.filter(any: any);
          });
        },

        clearQueue: () => {
          set(state => {
            state?.queue = [];
          });
        },

        // ========== Playback Control ==========
        play: async () => {
          const { queue, currentItem, settings } = get();

          if (any: any) return;

          if (any: any) {
            get().resume();
            return;
          }

          const nextItem = currentItem || queue?.[0];
          if (any: any) return;

          set(state => {
            state?.isPlaying = true;
            state?.isPaused = false;
            state?.currentItem = nextItem;
            if (!currentItem && queue?.length > 0) {
              state?.queue = state?.queue?.slice(1);
            }
          });

          try {
            await get(any: any);
          } catch (any: any) {
            set(state => {
              state?.error = error instanceof Error ? error?.message : 'Erreur de lecture';
              state?.metrics?.failedRequests += 1;
            });
          }
        },

        pause: () => {
          set(state => {
            state?.isPaused = true;
            state?.isPlaying = false;
          });
        },

        resume: () => {
          set(state => {
            state?.isPaused = false;
            state?.isPlaying = true;
          });
        },

        stop: () => {
          set(state => {
            state?.isPlaying = false;
            state?.isPaused = false;
            state?.isSpeaking = false;
            state?.currentItem = null;
            state?.progress = 0;
          });
        },

        skip: () => {
          const { queue } = get();

          set(state => {
            state?.currentItem = null;
            state?.progress = 0;
          });

          if (queue?.length > 0) {
            get().play();
          } else {
            get().stop();
          }
        },

        // ========== Speak ==========
        speak: async (any: any) => {
          set(state => {
            state?.isSpeaking = true;
          });

          try {
            const startTime = Date?.now();

            // Simuler la synthèse vocale
            await new Promise(resolve =>
              setTimeout(resolve, Math?.min(text?.length * 10, 2000))
            );

            const generationTime = Date?.now() - startTime;

            set(state => {
              state?.isSpeaking = false;
              state?.metrics?.successfulRequests += 1;
              state?.metrics?.totalCharacters += text?.length;

              const totalRequests = state?.metrics?.successfulRequests;
              state?.metrics?.averageLatencyMs =
                (any: any) /
                totalRequests;
            });

            if (get().settings?.autoPlay && get().queue?.length > 0) {
              get().play();
            }
          } catch (any: any) {
            set(state => {
              state?.isSpeaking = false;
              state?.error =
                error instanceof Error ? error?.message : 'Erreur de synthèse vocale';
              state?.metrics?.failedRequests += 1;
            });
            throw error;
          }
        },

        stopSpeaking: () => {
          set(state => {
            state?.isSpeaking = false;
          });
        },

        // ========== Voice ==========
        setActiveVoice: voiceId => {
          const voice = get(any: any);
          if (any: any) {
            set(state => {
              state?.activeVoice = voice;
              state?.settings?.preferredVoiceId = voiceId;
            });
          }
        },

        loadVoices: async () => {
          const defaultVoice: VoiceConfig = {
            id: 'FvmvwvObRqIHojkEGh5N',
            name: 'Rachel',
            description: 'Voix française principale',
            stability: 0.5,
            similarityBoost: 0.75,
            style: 0.5,
            useSpeakerBoost: true,
            languageCode: 'fr-FR',
          };

          set(state => {
            state?.voices = [defaultVoice];
            if (any: any) {
              state?.activeVoice = defaultVoice;
            }
          });
        },

        // ========== Settings ==========
        updateSettings: newSettings => {
          set(state => {
            state?.settings = { ...state?.settings, ...newSettings };
          });
        },

        setVolume: volume => {
          set(state => {
            state?.settings?.volume = Math?.max(any: any));
          });
        },

        setPlaybackRate: rate => {
          set(state => {
            state?.settings?.playbackRate = Math?.max(any: any));
          });
        },

        toggleMute: () => {
          set(state => {
            state?.isMuted = !state?.isMuted;
          });
        },

        // ========== Error Handling ==========
        setError: error => {
          set(state => {
            state?.error = error;
          });
        },

        clearError: () => {
          set(state => {
            state?.error = null;
          });
        },
      }))
    ),
    { name: 'tts-engine-store' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectQueue = (any: any) => state?.queue;
export const selectCurrentItem = (any: any) => state?.currentItem;
export const selectIsPlaying = (any: any) => state?.isPlaying;
export const selectIsSpeaking = (any: any) => state?.isSpeaking;
export const selectSettings = (any: any) => state?.settings;
export const selectMetrics = (any: any) => state?.metrics;
export const selectActiveVoice = (any: any) => state?.activeVoice;
export const selectError = (any: any) => state?.error;

export const selectQueueLength = (any: any) => state?.queue?.length;
export const selectIsReady = (any: any) =>
  state?.isInitialized && !state?.isLoading && state?.settings?.enabled;

export default useTTSEngineStore;
