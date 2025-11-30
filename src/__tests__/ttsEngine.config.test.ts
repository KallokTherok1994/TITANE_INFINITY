/**
 * TITANE∞ vΩΩΩ — TTS Engine Config Tests
 * © 2025 TITANE Team. All rights reserved.
 */

import { describe, test, expect } from 'vitest';
import {
  TITANE_VOICE_ID,
  EMOTION_PROFILES,
  DEFAULT_TTS_PREFERENCES,
  DEFAULT_VOICE_SETTINGS,
  TTS_LIMITS,
  TTS_CACHE_CONFIG,
  TTS_PROVIDER_CONFIG,
  generateTTSRequestId,
  getCacheFilePath,
  createTTSRequest,
  createInitialTTSState,
  createInitialMicrophoneState,
  TTSEmotion,
  TTSProvider,
  EmotionProfile,
} from '@/services/tts/ttsEngine.config';

// =============================================================================
// CONSTANTES
// =============================================================================

describe('TTS Engine Config - Constants', () => {
  test('TITANE_VOICE_ID is correct ElevenLabs voice', () => {
    expect(TITANE_VOICE_ID).toBe('FvmvwvObRqIHojkEGh5N');
    expect(TITANE_VOICE_ID.length).toBeGreaterThan(0);
  });

  test('EMOTION_PROFILES contains all 10 emotions', () => {
    const emotions: TTSEmotion[] = [
      'neutral', 'calm', 'focusing', 'excited', 'soft',
      'grounded', 'uplifting', 'empathetic', 'disciplined', 'inspired'
    ];

    emotions.forEach(emotion => {
      expect(EMOTION_PROFILES).toHaveProperty(emotion);
      expect(EMOTION_PROFILES[emotion].emotion).toBe(emotion);
    });
  });

  test('emotion profiles have valid parameter ranges', () => {
    (Object.values(EMOTION_PROFILES) as EmotionProfile[]).forEach((profile: EmotionProfile) => {
      expect(profile.pitch).toBeGreaterThanOrEqual(0.5);
      expect(profile.pitch).toBeLessThanOrEqual(2.0);
      expect(profile.speed).toBeGreaterThanOrEqual(0.5);
      expect(profile.speed).toBeLessThanOrEqual(2.0);
      expect(profile.stability).toBeGreaterThanOrEqual(0.0);
      expect(profile.stability).toBeLessThanOrEqual(1.0);
      expect(profile.similarityBoost).toBeGreaterThanOrEqual(0.0);
      expect(profile.similarityBoost).toBeLessThanOrEqual(1.0);
      expect(profile.styleExaggeration).toBeGreaterThanOrEqual(0.0);
      expect(profile.styleExaggeration).toBeLessThanOrEqual(1.0);
    });
  });

  test('excited emotion has faster speed than calm', () => {
    expect(EMOTION_PROFILES.excited.speed).toBeGreaterThan(EMOTION_PROFILES.calm.speed);
    expect(EMOTION_PROFILES.excited.pitch).toBeGreaterThan(EMOTION_PROFILES.calm.pitch);
  });

  test('neutral emotion has baseline parameters', () => {
    expect(EMOTION_PROFILES.neutral.pitch).toBe(1.0);
    expect(EMOTION_PROFILES.neutral.speed).toBe(1.0);
    expect(EMOTION_PROFILES.neutral.styleExaggeration).toBe(0.0);
  });
});

// =============================================================================
// DEFAULT PREFERENCES
// =============================================================================

describe('TTS Engine Config - Defaults', () => {
  test('DEFAULT_TTS_PREFERENCES has required fields', () => {
    expect(DEFAULT_TTS_PREFERENCES.enabled).toBe(true);
    expect(DEFAULT_TTS_PREFERENCES.preferredProvider).toBe('elevenlabs');
    expect(DEFAULT_TTS_PREFERENCES.elevenLabsVoiceId).toBe(TITANE_VOICE_ID);
    expect(DEFAULT_TTS_PREFERENCES.language).toBe('fr-FR');
    expect(DEFAULT_TTS_PREFERENCES.emotionalAdaptation).toBe(true);
    expect(DEFAULT_TTS_PREFERENCES.cacheEnabled).toBe(true);
  });

  test('DEFAULT_VOICE_SETTINGS uses TITANE voice', () => {
    expect(DEFAULT_VOICE_SETTINGS.voiceId).toBe(TITANE_VOICE_ID);
    expect(DEFAULT_VOICE_SETTINGS.language).toBe('fr-FR');
    expect(DEFAULT_VOICE_SETTINGS.speed).toBe(1.0);
    expect(DEFAULT_VOICE_SETTINGS.pitch).toBe(1.0);
    expect(DEFAULT_VOICE_SETTINGS.volume).toBe(1.0);
  });

  test('DEFAULT_VOICE_SETTINGS has ElevenLabs settings', () => {
    expect(DEFAULT_VOICE_SETTINGS.elevenLabsSettings).toBeDefined();
    expect(DEFAULT_VOICE_SETTINGS.elevenLabsSettings?.useSpeakerBoost).toBe(true);
  });
});

// =============================================================================
// PROVIDER CONFIG
// =============================================================================

describe('TTS Engine Config - Providers', () => {
  const providers: TTSProvider[] = ['elevenlabs', 'piper', 'espeak', 'webspeech'];

  test('TTS_PROVIDER_CONFIG contains all providers', () => {
    providers.forEach(provider => {
      expect(TTS_PROVIDER_CONFIG).toHaveProperty(provider);
    });
  });

  test('ElevenLabs has highest priority', () => {
    expect(TTS_PROVIDER_CONFIG.elevenlabs.priority).toBe(1);
    expect(TTS_PROVIDER_CONFIG.elevenlabs.fallbackOrder).toBe(1);
  });

  test('provider priorities are ordered correctly', () => {
    expect(TTS_PROVIDER_CONFIG.elevenlabs.priority).toBeLessThan(TTS_PROVIDER_CONFIG.piper.priority);
    expect(TTS_PROVIDER_CONFIG.piper.priority).toBeLessThan(TTS_PROVIDER_CONFIG.espeak.priority);
  });

  test('ElevenLabs requires internet and API key', () => {
    expect(TTS_PROVIDER_CONFIG.elevenlabs.requiresInternet).toBe(true);
    expect(TTS_PROVIDER_CONFIG.elevenlabs.requiresApiKey).toBe(true);
  });

  test('local providers do not require internet', () => {
    expect(TTS_PROVIDER_CONFIG.piper.requiresInternet).toBe(false);
    expect(TTS_PROVIDER_CONFIG.espeak.requiresInternet).toBe(false);
  });

  test('ElevenLabs has highest quality', () => {
    expect(TTS_PROVIDER_CONFIG.elevenlabs.quality).toBe('high');
    expect(TTS_PROVIDER_CONFIG.espeak.quality).toBe('low');
  });
});

// =============================================================================
// LIMITS & CACHE
// =============================================================================

describe('TTS Engine Config - Limits', () => {
  test('TTS_LIMITS has sensible values', () => {
    expect(TTS_LIMITS.maxTextLength).toBeGreaterThan(100);
    expect(TTS_LIMITS.maxQueueSize).toBeGreaterThan(10);
    expect(TTS_LIMITS.requestTimeoutMs).toBeGreaterThan(5000);
    expect(TTS_LIMITS.maxRetries).toBeGreaterThanOrEqual(1);
  });

  test('TTS_CACHE_CONFIG has valid settings', () => {
    expect(TTS_CACHE_CONFIG.cacheDir).toBe('data/tts');
    expect(TTS_CACHE_CONFIG.fileExtension).toBe('.wav');
    expect(TTS_CACHE_CONFIG.maxCacheSizeMB).toBeGreaterThan(100);
    expect(TTS_CACHE_CONFIG.maxAgeDays).toBeGreaterThan(1);
  });
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

describe('TTS Engine Config - Helpers', () => {
  test('generateTTSRequestId creates unique IDs', () => {
    const id1 = generateTTSRequestId();
    const id2 = generateTTSRequestId();

    expect(id1).toMatch(/^tts_\d+_[a-z0-9]+$/);
    expect(id2).toMatch(/^tts_\d+_[a-z0-9]+$/);
    expect(id1).not.toBe(id2);
  });

  test('generateTTSRequestId starts with tts_ prefix', () => {
    const id = generateTTSRequestId();
    expect(id.startsWith('tts_')).toBe(true);
  });

  test('getCacheFilePath returns correct format', () => {
    const path = getCacheFilePath('msg123');

    expect(path).toContain('data/tts');
    expect(path).toContain('msg_msg123');
    expect(path).toContain('.wav');
  });

  test('createTTSRequest creates valid request', () => {
    const request = createTTSRequest('Bonjour monde');

    expect(request.id).toMatch(/^tts_/);
    expect(request.text).toBe('Bonjour monde');
    expect(request.emotion).toBe('neutral');
    expect(request.priority).toBe(5);
    expect(request.createdAt).toBeLessThanOrEqual(Date.now());
    expect(request.voiceSettings).toBeDefined();
  });

  test('createTTSRequest accepts options', () => {
    const request = createTTSRequest('Test', {
      emotion: 'excited',
      priority: 10,
      messageId: 'test-123',
    });

    expect(request.emotion).toBe('excited');
    expect(request.priority).toBe(10);
    expect(request.messageId).toBe('test-123');
  });
});

// =============================================================================
// STATE CREATORS
// =============================================================================

describe('TTS Engine Config - State Creators', () => {
  test('createInitialTTSState returns valid state', () => {
    const state = createInitialTTSState();

    expect(state.isSpeaking).toBe(false);
    expect(state.isPaused).toBe(false);
    expect(state.activeProvider).toBeNull();
    expect(state.currentRequest).toBeNull();
    expect(state.progress).toBe(0);
    expect(state.queueSize).toBe(0);
    expect(state.lastError).toBeNull();
    expect(state.autoEmotion).toBe(true);
    expect(state.selectedVoice).toBe(TITANE_VOICE_ID);
  });

  test('createInitialTTSState has all provider statuses', () => {
    const state = createInitialTTSState();

    expect(state.providerStatus.elevenlabs).toBe('unknown');
    expect(state.providerStatus.piper).toBe('unknown');
    expect(state.providerStatus.espeak).toBe('unknown');
    expect(state.providerStatus.webspeech).toBe('unknown');
  });

  test('createInitialMicrophoneState returns valid state', () => {
    const state = createInitialMicrophoneState();

    expect(state.available).toBe(false);
    expect(state.isRecording).toBe(false);
    expect(state.permissionGranted).toBe(false);
    expect(state.permissionRequested).toBe(false);
    expect(state.activeDeviceId).toBeNull();
    expect(state.audioLevel).toBe(0);
    expect(state.error).toBeNull();
  });
});

// =============================================================================
// EMOTION KEYWORDS
// =============================================================================

describe('TTS Engine Config - Emotion Keywords', () => {
  test('each emotion has keywords array', () => {
    (Object.values(EMOTION_PROFILES) as EmotionProfile[]).forEach((profile: EmotionProfile) => {
      expect(Array.isArray(profile.keywords)).toBe(true);
    });
  });

  test('neutral has no keywords (catch-all)', () => {
    expect(EMOTION_PROFILES.neutral.keywords.length).toBe(0);
  });

  test('excited has appropriate keywords', () => {
    const keywords = EMOTION_PROFILES.excited.keywords;
    expect(keywords.some((k: string) => k.includes('génial') || k.includes('super'))).toBe(true);
  });

  test('calm has calming keywords', () => {
    const keywords = EMOTION_PROFILES.calm.keywords;
    expect(keywords.some((k: string) => k.includes('calme') || k.includes('serein'))).toBe(true);
  });

  test('empathetic has supportive keywords', () => {
    const keywords = EMOTION_PROFILES.empathetic.keywords;
    expect(keywords.some((k: string) => k.includes('comprends') || k.includes('soutien'))).toBe(true);
  });
});

// =============================================================================
// EMOTION DESCRIPTIONS
// =============================================================================

describe('TTS Engine Config - Emotion Descriptions', () => {
  test('each emotion has a description', () => {
    (Object.values(EMOTION_PROFILES) as EmotionProfile[]).forEach((profile: EmotionProfile) => {
      expect(profile.description).toBeDefined();
      expect(profile.description.length).toBeGreaterThan(5);
    });
  });

  test('descriptions are in French', () => {
    // Check for French articles/words
    const frenchWords = ['voix', 'et', 'de', 'la'];

    (Object.values(EMOTION_PROFILES) as EmotionProfile[]).forEach((profile: EmotionProfile) => {
      const hasfrench = frenchWords.some((w: string) =>
        profile.description.toLowerCase().includes(w)
      );
      expect(hasfrench).toBe(true);
    });
  });
});
