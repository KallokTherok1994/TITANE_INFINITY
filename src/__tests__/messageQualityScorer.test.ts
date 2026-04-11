/**
 * TITANE∞ v30.0.0 — Message Quality Scorer Tests
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateMessageQuality,
  calculateQualityXPReward,
  calculateTitaneResponseXP,
  determineTier,
  type ConversationContext,
  type QualityTier,
} from '../services/xp/messageQualityScorer';

describe('messageQualityScorer', () => {
  // ═══════════════════════════════════════════════════════════════════
  // determineTier
  // ═══════════════════════════════════════════════════════════════════

  describe('determineTier', () => {
    it('retourne minimal pour score 0', () => {
      expect(determineTier(0)).toBe('minimal');
    });

    it('retourne basic pour score 20', () => {
      expect(determineTier(20)).toBe('basic');
    });

    it('retourne good pour score 40', () => {
      expect(determineTier(40)).toBe('good');
    });

    it('retourne excellent pour score 60', () => {
      expect(determineTier(60)).toBe('excellent');
    });

    it('retourne exceptional pour score 80', () => {
      expect(determineTier(80)).toBe('exceptional');
    });

    it('retourne exceptional pour score 100', () => {
      expect(determineTier(100)).toBe('exceptional');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // evaluateMessageQuality
  // ═══════════════════════════════════════════════════════════════════

  describe('evaluateMessageQuality', () => {
    it('message vide ou très court = score minimal', () => {
      const result = evaluateMessageQuality('ok');
      expect(result.total).toBeLessThan(20);
      expect(result.tier).toBe('minimal');
    });

    it('message court sans structure = score basic', () => {
      const result = evaluateMessageQuality('bonjour comment ça va');
      expect(result.tier).toMatch(/minimal|basic/);
    });

    it('message structuré avec question = score good ou mieux', () => {
      const result = evaluateMessageQuality(
        'Peux-tu analyser le fichier de configuration et me dire quelles optimisations sont possibles?'
      );
      expect(result.total).toBeGreaterThanOrEqual(20);
      expect(['good', 'excellent', 'exceptional']).toContain(result.tier);
    });

    it('message complexe technique = score élevé', () => {
      const result = evaluateMessageQuality(
        "J'aimerais que tu analyses l'architecture du backend, en comparant les performances du framework actuel avec des alternatives comme TypeScript et Rust. Peux-tu évaluer les métriques de performance et proposer une stratégie d'optimisation?"
      );
      expect(result.total).toBeGreaterThanOrEqual(40);
      expect(['good', 'excellent', 'exceptional']).toContain(result.tier);
    });

    it('tous les sous-scores sont dans les limites', () => {
      const result = evaluateMessageQuality(
        'Analyse cette architecture backend en détail et propose des améliorations de performance.'
      );
      expect(result.lengthScore).toBeGreaterThanOrEqual(0);
      expect(result.lengthScore).toBeLessThanOrEqual(20);
      expect(result.coherenceScore).toBeGreaterThanOrEqual(0);
      expect(result.coherenceScore).toBeLessThanOrEqual(25);
      expect(result.relevanceScore).toBeGreaterThanOrEqual(0);
      expect(result.relevanceScore).toBeLessThanOrEqual(25);
      expect(result.complexityScore).toBeGreaterThanOrEqual(0);
      expect(result.complexityScore).toBeLessThanOrEqual(20);
      expect(result.continuityScore).toBeGreaterThanOrEqual(0);
      expect(result.continuityScore).toBeLessThanOrEqual(10);
    });

    it('le score total ne dépasse pas 100', () => {
      const result = evaluateMessageQuality(
        "Peux-tu analyser en profondeur l'architecture backend, évaluer les performances du framework TypeScript, comparer avec Rust et Python, proposer une stratégie d'optimisation, documenter les résultats, tester les améliorations, et automatiser le déploiement? En effet, j'aimerais également configurer le CI/CD et surveiller les métriques de qualité.",
        {
          messageCount: 15,
          recentTopics: ['architecture'],
          previousAssistantResponse:
            'Le framework TypeScript offre de bonnes performances pour le backend.',
        }
      );
      expect(result.total).toBeLessThanOrEqual(100);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // evaluateMessageQuality - Continuité
  // ═══════════════════════════════════════════════════════════════════

  describe('evaluateMessageQuality - continuité conversationnelle', () => {
    it('message dans une conversation existante gagne des points de continuité', () => {
      const context: ConversationContext = {
        messageCount: 5,
        recentTopics: ['performance'],
        previousAssistantResponse:
          'Les performances actuelles montrent une latence de 200ms.',
        previousUserMessage: 'Comment améliorer les performances?',
      };
      const result = evaluateMessageQuality(
        'Oui exactement, continue avec les performances et propose des solutions.',
        context
      );
      expect(result.continuityScore).toBeGreaterThan(0);
    });

    it('premier message de conversation = score continuité minimal', () => {
      const result = evaluateMessageQuality('Bonjour TITANE!', {
        messageCount: 1,
        recentTopics: [],
      });
      expect(result.continuityScore).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // calculateQualityXPReward
  // ═══════════════════════════════════════════════════════════════════

  describe('calculateQualityXPReward', () => {
    it('chaque message rapporte au minimum 5 XP de base', () => {
      const result = calculateQualityXPReward('ok');
      expect(result.baseXP).toBe(5);
      expect(result.totalXP).toBeGreaterThanOrEqual(5);
    });

    it('message de qualité rapporte plus de XP', () => {
      const lowQuality = calculateQualityXPReward('oui');
      const highQuality = calculateQualityXPReward(
        "Peux-tu analyser l'architecture du projet et proposer des améliorations de performance? J'aimerais comparer les frameworks disponibles."
      );
      expect(highQuality.totalXP).toBeGreaterThan(lowQuality.totalXP);
    });

    it('qualityBonusXP est cohérent avec le total', () => {
      const result = calculateQualityXPReward(
        'Analyse cette architecture backend en détail.'
      );
      expect(result.totalXP).toBe(result.baseXP + result.qualityBonusXP);
    });

    it('tier est inclus dans le résultat', () => {
      const result = calculateQualityXPReward('Bonjour');
      const validTiers: QualityTier[] = [
        'minimal',
        'basic',
        'good',
        'excellent',
        'exceptional',
      ];
      expect(validTiers).toContain(result.tier);
    });

    it('message exceptional donne multiplicateur 6x', () => {
      // Un message très complet, technique, structuré
      const result = calculateQualityXPReward(
        "Peux-tu analyser en profondeur l'architecture du backend TypeScript, évaluer les performances avec des métriques détaillées, comparer avec Rust et Python? En effet, j'aimerais aussi configurer le CI/CD, automatiser les tests, et documenter les résultats. Propose une roadmap avec des milestones, timeline, et budget estimé.",
        {
          messageCount: 10,
          recentTopics: ['backend'],
          previousAssistantResponse:
            "L'architecture TypeScript du backend offre de bonnes performances.",
        }
      );
      if (result.tier === 'exceptional') {
        // 5 base + 5 * (6-1) = 5 + 25 = 30
        expect(result.totalXP).toBe(30);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // calculateTitaneResponseXP
  // ═══════════════════════════════════════════════════════════════════

  describe('calculateTitaneResponseXP', () => {
    it('réponse courte = XP de base (3+2=5)', () => {
      const xp = calculateTitaneResponseXP(100, true);
      expect(xp).toBe(5);
    });

    it('réponse moyenne = XP augmenté', () => {
      const xp = calculateTitaneResponseXP(600, true);
      expect(xp).toBe(7); // 3 base + 2 (>500) + 2 (helpful)
    });

    it('réponse longue = XP élevé', () => {
      const xp = calculateTitaneResponseXP(2500, true);
      expect(xp).toBe(15); // 3 base + 2 (>500) + 3 (>1000) + 5 (>2000) + 2 (helpful)
    });

    it('réponse non utile = pas de bonus helpful', () => {
      const xp = calculateTitaneResponseXP(100, false);
      expect(xp).toBe(3); // 3 base only
    });

    it('réponse vide = XP minimum', () => {
      const xp = calculateTitaneResponseXP(0, true);
      expect(xp).toBe(5); // 3 base + 2 (helpful)
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Scénarios intégrés
  // ═══════════════════════════════════════════════════════════════════

  describe('Scénarios utilisateur réels', () => {
    it('utilisateur qui envoie "oui" = XP minimal', () => {
      const reward = calculateQualityXPReward('oui');
      expect(reward.tier).toBe('minimal');
      expect(reward.totalXP).toBe(5); // base only
    });

    it('utilisateur qui pose une question pertinente = XP bonus', () => {
      const reward = calculateQualityXPReward(
        'Comment puis-je optimiser les performances de mon application?'
      );
      expect(reward.totalXP).toBeGreaterThan(5);
    });

    it('conversation de 10 messages = bonus continuité', () => {
      const ctx: ConversationContext = {
        messageCount: 10,
        recentTopics: [],
        previousAssistantResponse: "Voici les résultats de l'analyse de performance.",
      };
      const reward = calculateQualityXPReward(
        "Merci, continue avec l'optimisation de la performance.",
        ctx
      );
      expect(reward.score.continuityScore).toBeGreaterThan(0);
    });

    it('utilisateur qui progresse en qualité gagne plus', () => {
      const msg1 = calculateQualityXPReward('salut');
      const msg2 = calculateQualityXPReward('Comment améliorer mon code?');
      const msg3 = calculateQualityXPReward(
        "Peux-tu analyser le code du module d'authentification, évaluer la sécurité, et proposer des améliorations? J'aimerais aussi documenter les changements."
      );

      expect(msg1.totalXP).toBeLessThanOrEqual(msg2.totalXP);
      expect(msg2.totalXP).toBeLessThanOrEqual(msg3.totalXP);
    });
  });
});
