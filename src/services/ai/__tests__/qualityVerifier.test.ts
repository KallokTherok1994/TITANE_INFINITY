/**
 * TITANE∞ v31.2.38 — Quality Verifier Unit Tests
 * Phase E: alignmentScore, completenessScore, depthMatchScore, shouldEnhance
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateResponseQuality,
  QUALITY_THRESHOLD,
} from '@/services/ai/qualityVerifier';

describe('Phase E — evaluateResponseQuality', () => {
  describe('alignmentScore', () => {
    it('scores high when response contains question keywords', () => {
      const question = "Explique l'architecture modulaire de TypeScript";
      const response =
        "L'architecture de TypeScript repose sur des modules bien définis. " +
        'Chaque module encapsule une fonctionnalité et expose une interface claire. ' +
        "L'architecture modulaire permet de réduire le couplage et d'augmenter la cohésion.";
      const critique = evaluateResponseQuality(question, response, 'BALANCED');
      expect(critique.alignmentScore).toBeGreaterThan(0.55);
    });

    it('scores low when response is off-topic', () => {
      const question = 'Comment configurer Webpack pour TypeScript ?';
      const response =
        "La météo est agréable aujourd'hui. Il fait beau. Je vous recommande une promenade.";
      const critique = evaluateResponseQuality(question, response, 'BALANCED');
      expect(critique.alignmentScore).toBeLessThan(0.35);
    });
  });

  describe('completenessScore', () => {
    it('returns 1.0 when message has no sub-questions', () => {
      const question = "Qu'est-ce que TypeScript";
      const response =
        'TypeScript est un langage de programmation fortement typé basé sur JavaScript.';
      const critique = evaluateResponseQuality(question, response, 'BALANCED');
      expect(critique.completenessScore).toBe(1.0);
    });

    it('scores partial coverage when only some sub-questions are addressed', () => {
      // Two sub-questions separated by '?'
      const question = 'Comment installer TypeScript? Et comment configurer tsconfig?';
      // Response only covers installation
      const response =
        'Pour installer TypeScript, lancez npm install typescript. ' +
        'La commande npm est disponible via Node.js.';
      const critique = evaluateResponseQuality(question, response, 'BALANCED');
      // Should be less than 1 (second sub-question about tsconfig not covered)
      expect(critique.completenessScore).toBeLessThan(1.0);
    });
  });

  describe('depthMatchScore', () => {
    it('scores 1.0 when response length exceeds profile minimum', () => {
      // DIRECT requires only ~40 words — this response has ~55 words
      const question = "Qu'est-ce que TypeScript ?";
      const response =
        'TypeScript est un surensemble typé de JavaScript développé par Microsoft. ' +
        'Il ajoute un système de types statiques optionnel qui permet de détecter des erreurs à la compilation. ' +
        'TypeScript est compilé vers JavaScript standard compatible avec tous les navigateurs et environnements Node.';
      const critique = evaluateResponseQuality(question, response, 'DIRECT');
      expect(critique.depthMatchScore).toBe(1.0);
    });

    it('scores low when response is far too short for a DEEP profile', () => {
      const question = "Analyse en profondeur l'architecture de TypeScript";
      const response = 'TypeScript est bien.';
      const critique = evaluateResponseQuality(question, response, 'DEEP');
      expect(critique.depthMatchScore).toBeLessThan(0.15);
    });
  });

  describe('overallScore and shouldEnhance', () => {
    it('sets shouldEnhance = true when overall score is below threshold', () => {
      const question =
        "Analyse complète et détaillée des patterns d'architecture modulaire dans TypeScript";
      const response = 'TypeScript est bien.';
      const critique = evaluateResponseQuality(question, response, 'ARCHITECT');
      expect(critique.overallScore).toBeLessThan(QUALITY_THRESHOLD);
      expect(critique.shouldEnhance).toBe(true);
    });

    it('sets shouldEnhance = false for a quality response', () => {
      const question = "Qu'est-ce que TypeScript ?";
      const response =
        'TypeScript est un langage de programmation open-source développé par Microsoft. ' +
        'Il est un surensemble syntaxique de JavaScript qui ajoute un typage statique optionnel. ' +
        "Il est compilé en JavaScript et peut être utilisé dans n'importe quel environnement JavaScript. " +
        "TypeScript améliore la maintenabilité et la détection d'erreurs au moment de la compilation.";
      const critique = evaluateResponseQuality(question, response, 'DIRECT');
      expect(critique.shouldEnhance).toBe(false);
    });

    it('provides a non-empty enhancementHint', () => {
      const critique = evaluateResponseQuality('Analyse TypeScript', 'ok', 'DEEP');
      expect(critique.enhancementHint).toBeTruthy();
      expect(critique.enhancementHint.length).toBeGreaterThan(10);
    });
  });

  describe('score bounds', () => {
    it('all scores are between 0 and 1', () => {
      const critique = evaluateResponseQuality(
        'test question ?',
        'test response for quality check',
        'BALANCED'
      );
      expect(critique.alignmentScore).toBeGreaterThanOrEqual(0);
      expect(critique.alignmentScore).toBeLessThanOrEqual(1);
      expect(critique.completenessScore).toBeGreaterThanOrEqual(0);
      expect(critique.completenessScore).toBeLessThanOrEqual(1);
      expect(critique.depthMatchScore).toBeGreaterThanOrEqual(0);
      expect(critique.depthMatchScore).toBeLessThanOrEqual(1);
      expect(critique.overallScore).toBeGreaterThanOrEqual(0);
      expect(critique.overallScore).toBeLessThanOrEqual(1);
    });
  });
});
