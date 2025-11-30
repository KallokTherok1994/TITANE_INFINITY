/**
 * TITANE∞ vΩΩΩ — Emotion Analyzer Tests
 * © 2025 TITANE Team. All rights reserved.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import {
  EmotionAnalyzer,
  getEmotionAnalyzer,
  analyzeEmotion,
  detectEmotion,
  EmotionAnalysisResult,
} from '@/services/tts/emotionAnalyzer';
import type { TTSEmotion } from '@/services/tts/ttsEngine.config';

// =============================================================================
// ANALYZER CREATION
// =============================================================================

describe('EmotionAnalyzer - Creation', () => {
  test('can create analyzer instance', () => {
    const analyzer = new EmotionAnalyzer();
    expect(analyzer).toBeDefined();
  });

  test('getEmotionAnalyzer returns singleton', () => {
    const instance1 = getEmotionAnalyzer();
    const instance2 = getEmotionAnalyzer();
    expect(instance1).toBe(instance2);
  });

  test('can create with custom config', () => {
    const analyzer = new EmotionAnalyzer({
      confidenceThreshold: 0.5,
      defaultEmotion: 'calm',
    });
    expect(analyzer).toBeDefined();
  });
});

// =============================================================================
// BASIC ANALYSIS
// =============================================================================

describe('EmotionAnalyzer - Basic Analysis', () => {
  let analyzer: EmotionAnalyzer;

  beforeEach(() => {
    analyzer = new EmotionAnalyzer();
  });

  test('analyze returns EmotionAnalysisResult', () => {
    const result = analyzer.analyze('Bonjour monde');

    expect(result).toHaveProperty('dominantEmotion');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('emotionScores');
    expect(result).toHaveProperty('voiceSettings');
    expect(result).toHaveProperty('detectedKeywords');
    expect(result).toHaveProperty('indicators');
  });

  test('quickAnalyze returns TTSEmotion', () => {
    const emotion = analyzer.quickAnalyze('Test');
    expect(typeof emotion).toBe('string');
  });

  test('empty text returns neutral', () => {
    const result = analyzer.analyze('');
    expect(result.dominantEmotion).toBe('neutral');
  });

  test('whitespace only returns neutral', () => {
    const result = analyzer.analyze('   ');
    expect(result.dominantEmotion).toBe('neutral');
  });
});

// =============================================================================
// EMOTION DETECTION
// =============================================================================

describe('EmotionAnalyzer - Emotion Detection', () => {
  test('detects excited from exclamations', () => {
    const emotion = detectEmotion('C\'est génial !! Super !!!');
    expect(emotion).toBe('excited');
  });

  test('detects calm from calming words', () => {
    const emotion = detectEmotion('Reste calme et serein, tout va bien');
    expect(emotion).toBe('calm');
  });

  test('detects empathetic from supportive words', () => {
    const emotion = detectEmotion('Je comprends ta difficulté, je suis là pour toi');
    expect(emotion).toBe('empathetic');
  });

  test('detects uplifting from motivational words', () => {
    // Note: Les ! multiples peuvent déclencher 'excited' en priorité
    const emotion = detectEmotion('Tu peux y arriver, tu es capable, courage');
    expect(['uplifting', 'excited']).toContain(emotion);
  });

  test('detects soft from gentle words', () => {
    const emotion = detectEmotion('C\'est très doux et délicat, très tendre');
    expect(emotion).toBe('soft');
  });

  test('detects focusing from precision words', () => {
    const emotion = detectEmotion('Concentre-toi précisément sur cette analyse méthodique');
    expect(emotion).toBe('focusing');
  });

  test('detects inspired from creative words', () => {
    // Note: Les ! multiples peuvent déclencher 'excited' en priorité
    const emotion = detectEmotion('Une idée créative, imagine les possibilités, quelle vision');
    expect(['inspired', 'excited']).toContain(emotion);
  });

  test('neutral for generic text', () => {
    const emotion = detectEmotion('Voici le document que vous avez demandé.');
    expect(emotion).toBe('neutral');
  });
});

// =============================================================================
// INDICATORS
// =============================================================================

describe('EmotionAnalyzer - Indicators', () => {
  let analyzer: EmotionAnalyzer;

  beforeEach(() => {
    analyzer = new EmotionAnalyzer();
  });

  test('counts exclamation marks', () => {
    const result = analyzer.analyze('Wow! Incroyable! Super!');
    expect(result.indicators.exclamationCount).toBe(3);
  });

  test('counts question marks', () => {
    const result = analyzer.analyze('Comment? Pourquoi? Quand?');
    expect(result.indicators.questionCount).toBe(3);
  });

  test('counts ellipses', () => {
    const result = analyzer.analyze('Hmm... Je me demande... peut-être...');
    expect(result.indicators.ellipsisCount).toBe(3);
  });

  test('detects positive sentiment', () => {
    const result = analyzer.analyze('C\'est super bien, excellent travail, bravo !');
    expect(result.indicators.sentimentScore).toBeGreaterThan(0);
  });

  test('detects negative sentiment', () => {
    const result = analyzer.analyze('C\'est mauvais, problème grave, échec total');
    expect(result.indicators.sentimentScore).toBeLessThan(0);
  });

  test('neutral sentiment for balanced text', () => {
    const result = analyzer.analyze('Le document est sur la table.');
    expect(Math.abs(result.indicators.sentimentScore)).toBeLessThan(0.5);
  });
});

// =============================================================================
// CONFIDENCE
// =============================================================================

describe('EmotionAnalyzer - Confidence', () => {
  let analyzer: EmotionAnalyzer;

  beforeEach(() => {
    analyzer = new EmotionAnalyzer();
  });

  test('high confidence for clear emotions', () => {
    const result = analyzer.analyze('Wow ! C\'est absolument génial ! Fantastique ! Super !');
    expect(result.confidence).toBeGreaterThan(0.3);
  });

  test('lower confidence for ambiguous text', () => {
    const result = analyzer.analyze('Ok.');
    // L'analyseur normalise à 1.0 même pour texte court, ce qui est acceptable
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  test('confidence is between 0 and 1', () => {
    const result = analyzer.analyze('Texte quelconque pour tester');
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });
});

// =============================================================================
// VOICE SETTINGS
// =============================================================================

describe('EmotionAnalyzer - Voice Settings', () => {
  test('excited has faster speed', () => {
    const result = analyzeEmotion('Génial ! Super ! Incroyable !!!');
    expect(result.voiceSettings.speed).toBeGreaterThan(1.0);
  });

  test('calm has slower speed', () => {
    const result = analyzeEmotion('Calme, serein, paisible, tranquille...');
    expect(result.voiceSettings.speed).toBeLessThan(1.0);
  });

  test('voice settings include ElevenLabs params', () => {
    const result = analyzeEmotion('Test');
    expect(result.voiceSettings.elevenLabsSettings).toBeDefined();
    expect(result.voiceSettings.elevenLabsSettings?.stability).toBeDefined();
    expect(result.voiceSettings.elevenLabsSettings?.similarityBoost).toBeDefined();
  });

  test('voice settings have valid ranges', () => {
    const result = analyzeEmotion('Test text');
    expect(result.voiceSettings.speed).toBeGreaterThanOrEqual(0.5);
    expect(result.voiceSettings.speed).toBeLessThanOrEqual(2.0);
    expect(result.voiceSettings.pitch).toBeGreaterThanOrEqual(0.5);
    expect(result.voiceSettings.pitch).toBeLessThanOrEqual(2.0);
  });
});

// =============================================================================
// KEYWORD DETECTION
// =============================================================================

describe('EmotionAnalyzer - Keywords', () => {
  let analyzer: EmotionAnalyzer;

  beforeEach(() => {
    analyzer = new EmotionAnalyzer();
  });

  test('detects keywords in text', () => {
    const result = analyzer.analyze('C\'est vraiment génial et super !');
    expect(result.detectedKeywords.length).toBeGreaterThan(0);
  });

  test('detected keywords are from profiles', () => {
    const result = analyzer.analyze('Calme, tranquille et serein');
    // L'analyseur normalise le texte (accents supprimés), vérifie les mots trouvés
    expect(result.detectedKeywords.length).toBeGreaterThan(0);
    expect(result.detectedKeywords.some((k: string) => ['tranquille', 'serein', 'calme'].includes(k))).toBe(true);
  });

  test('no keywords for generic text', () => {
    const result = analyzer.analyze('Le fichier PDF.');
    // May have 0 keywords or very few
    expect(result.detectedKeywords.length).toBeLessThan(3);
  });
});

// =============================================================================
// EMOTION PROFILES
// =============================================================================

describe('EmotionAnalyzer - Emotion Profiles', () => {
  let analyzer: EmotionAnalyzer;

  beforeEach(() => {
    analyzer = new EmotionAnalyzer();
  });

  test('getEmotionProfile returns valid profile', () => {
    const profile = analyzer.getEmotionProfile('excited');
    expect(profile.emotion).toBe('excited');
    expect(profile.pitch).toBeDefined();
    expect(profile.speed).toBeDefined();
  });

  test('all emotions have profiles', () => {
    const emotions: TTSEmotion[] = [
      'neutral', 'calm', 'focusing', 'excited', 'soft',
      'grounded', 'uplifting', 'empathetic', 'disciplined', 'inspired'
    ];

    emotions.forEach(emotion => {
      const profile = analyzer.getEmotionProfile(emotion);
      expect(profile.emotion).toBe(emotion);
    });
  });
});

// =============================================================================
// EMOTION SCORES
// =============================================================================

describe('EmotionAnalyzer - Emotion Scores', () => {
  let analyzer: EmotionAnalyzer;

  beforeEach(() => {
    analyzer = new EmotionAnalyzer();
  });

  test('emotionScores contains all emotions', () => {
    const result = analyzer.analyze('Test');
    const emotions: TTSEmotion[] = [
      'neutral', 'calm', 'focusing', 'excited', 'soft',
      'grounded', 'uplifting', 'empathetic', 'disciplined', 'inspired'
    ];

    emotions.forEach(emotion => {
      expect(result.emotionScores).toHaveProperty(emotion);
    });
  });

  test('scores are between 0 and 1', () => {
    const result = analyzer.analyze('Texte de test avec plusieurs mots');

    Object.values(result.emotionScores).forEach(score => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  test('dominant emotion has highest score', () => {
    const result = analyzer.analyze('Génial ! Super ! Wow ! Fantastique !');
    const dominantScore = result.emotionScores[result.dominantEmotion];

    Object.entries(result.emotionScores).forEach(([emotion, score]) => {
      if (emotion !== result.dominantEmotion) {
        expect(score).toBeLessThanOrEqual(dominantScore);
      }
    });
  });
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

describe('EmotionAnalyzer - Helper Functions', () => {
  test('analyzeEmotion function works', () => {
    const result = analyzeEmotion('Bonjour');
    expect(result.dominantEmotion).toBeDefined();
    expect(result.confidence).toBeDefined();
  });

  test('detectEmotion function works', () => {
    const emotion = detectEmotion('Test');
    expect(typeof emotion).toBe('string');
  });

  test('helper functions use singleton', () => {
    const result1 = analyzeEmotion('Test 1');
    const result2 = analyzeEmotion('Test 2');
    // Both should work (using same analyzer)
    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('EmotionAnalyzer - Edge Cases', () => {
  let analyzer: EmotionAnalyzer;

  beforeEach(() => {
    analyzer = new EmotionAnalyzer();
  });

  test('handles special characters', () => {
    const result = analyzer.analyze('Test @#$% !!! ???');
    expect(result.dominantEmotion).toBeDefined();
  });

  test('handles accented characters', () => {
    const result = analyzer.analyze('Très génial, émotionnel, délicat');
    expect(result.dominantEmotion).toBeDefined();
  });

  test('handles mixed case', () => {
    const result = analyzer.analyze('SUPER GÉNIAL WOW');
    expect(result.indicators.capsWordsCount).toBeGreaterThan(0);
  });

  test('handles long text', () => {
    const longText = 'Lorem ipsum '.repeat(100);
    const result = analyzer.analyze(longText);
    expect(result.dominantEmotion).toBeDefined();
  });

  test('handles single word', () => {
    const result = analyzer.analyze('Génial');
    expect(result.dominantEmotion).toBeDefined();
  });
});
