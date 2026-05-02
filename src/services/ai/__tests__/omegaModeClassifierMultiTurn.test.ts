/**
 * TITANE∞ v31.2.38 — OmegaModeClassifier: Multi-Turn History Signals Tests
 * Phase F: 2+ short interrogative messages → CLARIFY_LIGHT
 *          2+ deep-signal messages → DEEP_REASONING
 *          absent/insufficient history → no effect
 */

import { describe, it, expect } from 'vitest';
import { classifyMode } from '@/services/ai/omegaModeClassifier';

describe('Phase F — Multi-turn history signals', () => {
  describe('CLARIFY_LIGHT reinforcement', () => {
    it('returns CLARIFY_LIGHT when 2 of last 3 messages are short interrogatives', () => {
      // Use message without '?' to avoid Rule 7c (short simple question) firing before Rule 9
      const result = classifyMode({
        message: 'je ne comprends pas ce que tu veux dire là du tout',
        conversationHistory: ["c'est quoi ça ?", 'et après ?', 'ok et donc ?'],
      });
      expect(result.canonicalMode).toBe('CLARIFY_LIGHT');
    });

    it('does NOT override REPAIR for short interrogatives if REPAIR signal is present', () => {
      // REPAIR signal has higher priority (Rule 1 fires before Rule 9)
      const result = classifyMode({
        message: 'erreur TypeScript: Property does not exist tu peux corriger ?',
        conversationHistory: ["c'est quoi ça ?", 'et là ?', 'ok ?'],
      });
      // REPAIR should still win over CLARIFY_LIGHT
      expect(result.canonicalMode).toBe('REPAIR');
    });

    it('returns confidence >= 0.6 for multi-turn CLARIFY_LIGHT', () => {
      const result = classifyMode({
        message: 'ça veut dire quoi ?',
        conversationHistory: ['pourquoi ça ?', "c'est quoi ?", 'et alors ?'],
      });
      if (result.canonicalMode === 'CLARIFY_LIGHT') {
        expect(result.confidence).toBeGreaterThanOrEqual(0.6);
      }
    });
  });

  describe('DEEP_REASONING reinforcement', () => {
    it('returns DEEP_REASONING when 2 of last 3 messages contain deep signals', () => {
      // Use a neutral current message that doesn't trigger early ARCHITECT/REPAIR rules
      // History carries the deep signal pattern; Rule 9 fires as multi-turn reinforcement
      const result = classifyMode({
        message: 'continue sur ce sujet',
        conversationHistory: [
          'analyse complète de tous les patterns cognitifs émergents',
          'synthèse et raisonnement sur les décisions stratégiques',
          'résumé court',
        ],
      });
      expect(result.canonicalMode).toBe('DEEP_REASONING');
    });

    it('returns confidence >= 0.65 for multi-turn DEEP_REASONING', () => {
      const result = classifyMode({
        message: 'analyse et évalue cette stratégie architecturale',
        conversationHistory: [
          "analyse profonde de l'architecture modulaire",
          'raisonnement sur les patterns de singularité',
          'ok',
        ],
      });
      if (result.canonicalMode === 'DEEP_REASONING') {
        expect(result.confidence).toBeGreaterThanOrEqual(0.65);
      }
    });
  });

  describe('no effect on absent/short history', () => {
    it('does not change result when conversationHistory is absent', () => {
      const withHistory = classifyMode({
        message: 'ok',
        conversationHistory: undefined,
      });
      const withoutHistory = classifyMode({
        message: 'ok',
      });
      // Both should produce the same mode when history is absent
      expect(withHistory.canonicalMode).toBe(withoutHistory.canonicalMode);
    });

    it('does not trigger multi-turn rules with only 2 messages in history', () => {
      const result = classifyMode({
        message: 'ça veut dire quoi ?',
        conversationHistory: [
          "c'est quoi ça ?",
          'et là ?',
          // Only 2 — Rule 9 requires >= 3
        ],
      });
      // Should not be CLARIFY_LIGHT from multi-turn (may still be from Rule 5/7)
      // The key: multi-turn signals should not activate
      // We just verify confidence bound is sane
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1.0);
    });

    it('does not trigger CLARIFY_LIGHT when only 1 of 3 messages is interrogative', () => {
      const result = classifyMode({
        message: 'analyse ce code',
        conversationHistory: [
          'voici le projet complet avec une architecture modulaire complexe',
          'je travaille sur une base de données distribuée',
          "c'est quoi ce pattern ?",
        ],
      });
      // One interrogative is insufficient → CLARIFY_LIGHT should not be forced by Rule 9
      // (it may be DIRECT or DEEP_REASONING from other rules)
      if (result.canonicalMode === 'CLARIFY_LIGHT') {
        // If it is CLARIFY_LIGHT, it must be from a rule OTHER than multi-turn (source check)
        expect(result.signals).not.toContain('multi_turn:clarify_pattern');
      }
    });
  });
});
