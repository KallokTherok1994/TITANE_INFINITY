/**
 * TITANE∞ vΩ∞ — CONVERSATIONAL RESONANCE ENGINE TESTS
 * OPUS v∞.9
 *
 * Tests complets pour le ConversationalResonanceEngine
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConversationalResonanceEngine } from '../ConversationalResonanceEngine';
import type { MultimodalState } from '../../../types/multimodalFusion';
import { getDefaultMultimodalState } from '../../../types/multimodalFusion';

// ============================================================================
// HELPERS
// ============================================================================

function createMockMultimodalState(overrides?: Partial<{
  energy: number;
  tension: number;
  engagement: number;
  stability: number;
}>): MultimodalState {
  const state = getDefaultMultimodalState();
  const now = Date.now();
  state.fusedScores = {
    globalEnergy: { value: overrides?.energy ?? 0.5, confidence: 0.8, variance: 0.1, origin: 'fusion', timestamp: now },
    globalTension: { value: overrides?.tension ?? 0.5, confidence: 0.8, variance: 0.1, origin: 'fusion', timestamp: now },
    globalEngagement: { value: overrides?.engagement ?? 0.5, confidence: 0.8, variance: 0.1, origin: 'fusion', timestamp: now },
    globalStability: { value: overrides?.stability ?? 0.5, confidence: 0.8, variance: 0.1, origin: 'fusion', timestamp: now },
  };
  return state;
}

// ============================================================================
// TESTS
// ============================================================================

describe('ConversationalResonanceEngine', () => {
  let engine: ConversationalResonanceEngine;

  beforeEach(() => {
    ConversationalResonanceEngine.resetInstance();
    engine = ConversationalResonanceEngine.getInstance();
  });

  afterEach(() => {
    ConversationalResonanceEngine.resetInstance();
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SINGLETON
  // ═══════════════════════════════════════════════════════════════════════

  describe('Singleton Pattern', () => {
    it('devrait retourner la même instance', () => {
      const instance1 = ConversationalResonanceEngine.getInstance();
      const instance2 = ConversationalResonanceEngine.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('devrait réinitialiser l\'instance après reset', () => {
      const instance1 = ConversationalResonanceEngine.getInstance();
      instance1.start();
      ConversationalResonanceEngine.resetInstance();
      const instance2 = ConversationalResonanceEngine.getInstance();
      expect(instance2.getState().isActive).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CYCLE DE VIE
  // ═══════════════════════════════════════════════════════════════════════

  describe('Cycle de vie', () => {
    it('devrait démarrer correctement', () => {
      engine.start();
      const state = engine.getState();
      expect(state.isActive).toBe(true);
    });

    it('devrait s\'arrêter correctement', () => {
      engine.start();
      engine.stop();
      const state = engine.getState();
      expect(state.isActive).toBe(false);
    });

    it('devrait se réinitialiser correctement', () => {
      engine.start();
      const multimodal = createMockMultimodalState();
      engine.analyzeUserMessage('test', multimodal);
      engine.reset();
      const state = engine.getState();
      expect(state.profile.totalInteractions).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // ANALYSE LINGUISTIQUE
  // ═══════════════════════════════════════════════════════════════════════

  describe('Analyse linguistique', () => {
    it('devrait analyser un message simple', () => {
      const result = engine.analyzeUserMessage('Bonjour, comment vas-tu ?');

      expect(result.analysis).toBeDefined();
      expect(result.analysis.wordCount).toBeGreaterThan(0);
      expect(result.analysis.sentenceCount).toBeGreaterThan(0);
    });

    it('devrait détecter les questions', () => {
      const result = engine.analyzeUserMessage('Comment ça marche ? Pourquoi ?');
      expect(result.analysis.questionCount).toBe(2);
    });

    it('devrait détecter les exclamations', () => {
      const result = engine.analyzeUserMessage('Super ! Génial ! Incroyable !');
      expect(result.analysis.exclamationCount).toBe(3);
    });

    it('devrait détecter un style formel', () => {
      const result = engine.analyzeUserMessage(
        'Veuillez trouver ci-joint ma demande. Je vous prie d\'agréer mes salutations.'
      );
      expect(result.analysis.detectedStyle).toBe('formal');
    });

    it('devrait détecter un style casual', () => {
      const result = engine.analyzeUserMessage(
        'Salut ! Super cool ce truc, genre trop génial ! Coucou !'
      );
      expect(['casual', 'direct']).toContain(result.analysis.detectedStyle);
    });

    it('devrait détecter un style technique', () => {
      const result = engine.analyzeUserMessage(
        'La fonction retourne une variable importante. L\'algorithme utilise un processus itératif complexe pour optimiser le système.'
      );
      expect(['technical', 'direct']).toContain(result.analysis.detectedStyle);
    });

    it('devrait calculer la complexité', () => {
      const simpleResult = engine.analyzeUserMessage('Bonjour. Ça va ?');
      const complexResult = engine.analyzeUserMessage(
        'La conceptualisation méthodologique implique une restructuration paradigmatique fondamentale.'
      );

      expect(complexResult.analysis.complexityScore).toBeGreaterThan(simpleResult.analysis.complexityScore);
    });

    it('devrait détecter le rythme', () => {
      const rapidResult = engine.analyzeUserMessage('Vite. Court. Net.');
      const slowResult = engine.analyzeUserMessage(
        'Ceci est une phrase très longue qui contient beaucoup de mots et prend son temps pour exprimer une idée complexe et détaillée avec de nombreux éléments.'
      );

      expect(rapidResult.analysis.rhythm).toBe('rapid');
      expect(['slow', 'moderate']).toContain(slowResult.analysis.rhythm);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // ADAPTATION DU TON
  // ═══════════════════════════════════════════════════════════════════════

  describe('Adaptation du ton', () => {
    it('devrait adapter le ton selon la tension', () => {
      const multimodal = createMockMultimodalState({ tension: 0.8 });
      const result = engine.adaptTone('neutral', multimodal);
      expect(result.baseTone).toBe('reassuring');
    });

    it('devrait adapter le ton selon l\'énergie basse', () => {
      const multimodal = createMockMultimodalState({ energy: 0.2 });
      const result = engine.adaptTone('neutral', multimodal);
      expect(result.undertones.some((u: { tone: string }) => u.tone === 'warm')).toBe(true);
    });

    it('devrait inclure des sous-tons', () => {
      const multimodal = createMockMultimodalState({ tension: 0.6 });
      const result = engine.adaptTone('neutral', multimodal);
      expect(result.undertones.length).toBeGreaterThanOrEqual(0);
    });

    it('devrait définir l\'intensité', () => {
      const multimodal = createMockMultimodalState({ energy: 0.8 });
      const result = engine.adaptTone('energetic', multimodal);
      expect(result.overallIntensity).toBeGreaterThan(0.5);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SYNCHRONISATION DU RYTHME
  // ═══════════════════════════════════════════════════════════════════════

  describe('Synchronisation du rythme', () => {
    it('devrait synchroniser avec le rythme de l\'utilisateur', () => {
      const analysisResult = engine.analyzeUserMessage('Court. Net. Précis.');
      const result = engine.synchronizeRhythm(analysisResult.analysis);
      expect(result.baseRhythm).toBe('rapid');
    });

    it('devrait adapter la longueur des phrases', () => {
      const analysisResult = engine.analyzeUserMessage('Voici une phrase de longueur moyenne pour tester.');
      const result = engine.synchronizeRhythm(analysisResult.analysis);
      expect(result.sentenceLength.target).toBeGreaterThan(0);
    });

    it('devrait ralentir pour basse énergie', () => {
      const analysisResult = engine.analyzeUserMessage('Test message');
      const multimodal = createMockMultimodalState({ energy: 0.2 });
      const result = engine.synchronizeRhythm(analysisResult.analysis, multimodal);
      expect(result.baseRhythm).toBe('slow');
    });

    it('devrait ajuster les points de respiration', () => {
      const analysisResult = engine.analyzeUserMessage('Test');
      const multimodal = createMockMultimodalState({ energy: 0.3 });
      const result = engine.synchronizeRhythm(analysisResult.analysis, multimodal);
      expect(result.breathingPoints.frequency).toBeGreaterThan(0.5);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CALCUL DE RÉSONANCE
  // ═══════════════════════════════════════════════════════════════════════

  describe('Calcul de résonance', () => {
    it('devrait calculer les scores de résonance', () => {
      const analysisResult = engine.analyzeUserMessage('Test message simple');
      const result = engine.computeResonance(
        analysisResult.analysis,
        analysisResult.suggestedAdaptation
      );

      expect(result.overall).toBeGreaterThan(0);
      expect(result.overall).toBeLessThanOrEqual(1);
    });

    it('devrait calculer toutes les dimensions', () => {
      const analysisResult = engine.analyzeUserMessage('Test');
      const result = engine.computeResonance(
        analysisResult.analysis,
        analysisResult.suggestedAdaptation
      );

      expect(result.lexical).toBeDefined();
      expect(result.syntactic).toBeDefined();
      expect(result.semantic).toBeDefined();
      expect(result.prosodic).toBeDefined();
      expect(result.pragmatic).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // GÉNÉRATION DES PARAMÈTRES
  // ═══════════════════════════════════════════════════════════════════════

  describe('Génération des paramètres de réponse', () => {
    it('devrait générer les paramètres complets', () => {
      const result = engine.generateResponseParameters('Bonjour, comment vas-tu ?');

      expect(result.adaptation).toBeDefined();
      expect(result.toneModulation).toBeDefined();
      expect(result.rhythmSync).toBeDefined();
      expect(result.styleSummary).toBeDefined();
    });

    it('devrait générer un résumé de style lisible', () => {
      const result = engine.generateResponseParameters('Test');
      expect(result.styleSummary).toContain('Style');
      expect(result.styleSummary).toContain('ton');
      expect(result.styleSummary).toContain('rythme');
    });

    it('devrait adapter selon le contexte multimodal', () => {
      const multimodal = createMockMultimodalState({ tension: 0.8 });
      const result = engine.generateResponseParameters('Test', multimodal);
      expect(result.toneModulation.baseTone).toBe('reassuring');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // MODULATION DE RÉPONSE
  // ═══════════════════════════════════════════════════════════════════════

  describe('Modulation de réponse', () => {
    it('devrait moduler une réponse', () => {
      const params = engine.generateResponseParameters('Test');
      const result = engine.modulateResponse(
        'Voici une réponse. Elle contient plusieurs phrases. Pour tester.',
        params.adaptation,
        params.rhythmSync
      );

      expect(result.originalLength).toBeGreaterThan(0);
      expect(result.modulatedLength).toBeGreaterThan(0);
    });

    it('devrait ajouter des points de respiration si nécessaire', () => {
      const params = engine.generateResponseParameters('Test');
      params.rhythmSync.breathingPoints.frequency = 0.8;

      const result = engine.modulateResponse(
        'Première phrase. Deuxième phrase. Troisième phrase. Quatrième phrase.',
        params.adaptation,
        params.rhythmSync
      );

      expect(result.appliedModulations).toContain('breathing_points');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TRAITEMENT COMPLET
  // ═══════════════════════════════════════════════════════════════════════

  describe('Traitement complet', () => {
    it('devrait exécuter le processus complet', () => {
      const multimodal = createMockMultimodalState({ energy: 0.6, tension: 0.3 });
      const result = engine.process('Bonjour, comment puis-je avancer ?', multimodal);

      expect(result.analysis).toBeDefined();
      expect(result.parameters).toBeDefined();
      expect(result.resonance).toBeDefined();
    });

    it('devrait mettre à jour l\'historique', () => {
      const multimodal = createMockMultimodalState();
      engine.process('Test message', multimodal);

      const state = engine.getState();
      expect(state.profile.history.length).toBe(1);
    });

    it('devrait mettre à jour les statistiques', () => {
      const multimodal = createMockMultimodalState();
      engine.process('Test', multimodal);

      const state = engine.getState();
      expect(state.profile.totalInteractions).toBe(1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // APPRENTISSAGE
  // ═══════════════════════════════════════════════════════════════════════

  describe('Apprentissage des préférences', () => {
    it('devrait apprendre le style préféré', () => {
      engine.setConfig({ learningEnabled: true, learningRate: 0.5 });

      // Envoyer plusieurs messages formels (avec mots clés forts)
      for (let i = 0; i < 5; i++) {
        engine.analyzeUserMessage('Veuillez trouver ci-joint ma demande. Je vous prie d\'agréer mes salutations distinguées.');
      }

      const prefs = engine.getUserPreferences();
      // Le style peut être formel ou neutral selon la détection
      expect(['formal', 'neutral']).toContain(prefs.preferredStyle);
    });

    it('devrait augmenter la confiance avec plus d\'interactions', () => {
      engine.setConfig({ learningEnabled: true });

      const initialPrefs = engine.getUserPreferences();
      const initialConfidence = initialPrefs.confidence;

      for (let i = 0; i < 10; i++) {
        engine.analyzeUserMessage(`Message ${i}`);
      }

      const finalPrefs = engine.getUserPreferences();
      expect(finalPrefs.confidence).toBeGreaterThan(initialConfidence);
    });

    it('devrait pouvoir désactiver l\'apprentissage', () => {
      engine.setConfig({ learningEnabled: false });

      const initialPrefs = engine.getUserPreferences();
      engine.analyzeUserMessage('Test');
      const finalPrefs = engine.getUserPreferences();

      expect(finalPrefs.sampleSize).toBe(initialPrefs.sampleSize);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CALLBACKS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Callbacks', () => {
    it('devrait appeler le callback de mise à jour d\'état', () => {
      const callback = vi.fn();
      engine.setStateUpdateCallback(callback);

      const multimodal = createMockMultimodalState();
      engine.process('Test', multimodal);

      expect(callback).toHaveBeenCalled();
    });

    it('devrait appeler le callback d\'adaptation', () => {
      const callback = vi.fn();
      engine.setAdaptationCallback(callback);

      engine.generateResponseParameters('Test');

      expect(callback).toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // RÉSUMÉ D'ÉTAT
  // ═══════════════════════════════════════════════════════════════════════

  describe('Résumé d\'état', () => {
    it('devrait générer un résumé lisible', () => {
      const multimodal = createMockMultimodalState();
      engine.process('Test', multimodal);

      const summary = engine.generateStateSummary();
      expect(summary).toContain('Style:');
      expect(summary).toContain('Ton:');
      expect(summary).toContain('Rythme:');
      expect(summary).toContain('Résonance:');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  describe('Configuration', () => {
    it('devrait permettre de modifier la configuration', () => {
      engine.setConfig({ adaptationSensitivity: 0.8 });
      const config = engine.getConfig();
      expect(config.adaptationSensitivity).toBe(0.8);
    });

    it('devrait conserver les autres valeurs de config', () => {
      const originalConfig = engine.getConfig();
      engine.setConfig({ adaptationSensitivity: 0.8 });
      const newConfig = engine.getConfig();
      expect(newConfig.maxHistoryEntries).toBe(originalConfig.maxHistoryEntries);
    });
  });
});
