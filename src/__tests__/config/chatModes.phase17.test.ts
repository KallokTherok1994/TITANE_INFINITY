/**
 * TITANE∞ v30.0.0 — Tests Phase 17: SYSTEM_PROMPTS French enforcement
 *
 * Validates that ALL SYSTEM_PROMPTS in src/config/chatModes.config.ts contain
 * the mandatory French enforcement rule added in Phase 17.
 *
 * Each system prompt MUST contain "Réponds TOUJOURS en français" to ensure
 * TITANE∞ always responds in French regardless of the user's input language.
 */

import { describe, expect, it } from 'vitest';

import { CHAT_MODES, SYSTEM_PROMPTS, getSystemPrompt } from '@/config/chatModes.config';

describe('src/config/chatModes.config — Phase 17 French Enforcement', () => {
  // ─────────────────────────────────────────────────────────────────────────
  // SYSTEM_PROMPTS object
  // ─────────────────────────────────────────────────────────────────────────

  describe('SYSTEM_PROMPTS', () => {
    it('every SYSTEM_PROMPTS entry contains "Réponds TOUJOURS en français"', () => {
      const missing: string[] = [];
      Object.entries(SYSTEM_PROMPTS).forEach(([key, prompt]) => {
        if (!prompt.includes('Réponds TOUJOURS en français')) {
          missing.push(key);
        }
      });
      expect(missing).toHaveLength(0);
    });

    it('every SYSTEM_PROMPTS entry contains the word "français"', () => {
      Object.entries(SYSTEM_PROMPTS).forEach(([key, prompt]) => {
        expect(prompt, `SYSTEM_PROMPTS.${key} missing "français"`).toContain('français');
      });
    });

    it('all 9 expected SYSTEM_PROMPTS keys are present', () => {
      const expectedKeys = [
        'coach',
        'dev_junior',
        'dev_senior',
        'admin',
        'strategist',
        'auditor',
        'creative',
        'hybrid',
        'default',
      ] as const;

      expectedKeys.forEach(key => {
        expect(SYSTEM_PROMPTS[key], `Missing SYSTEM_PROMPTS.${key}`).toBeDefined();
        expect(SYSTEM_PROMPTS[key].length).toBeGreaterThan(0);
      });
    });

    it('no SYSTEM_PROMPTS entry is empty or whitespace-only', () => {
      Object.entries(SYSTEM_PROMPTS).forEach(([key, prompt]) => {
        expect(prompt.trim().length, `SYSTEM_PROMPTS.${key} is empty`).toBeGreaterThan(0);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CHAT_MODES: all system_prompts reference a French-enforced SYSTEM_PROMPTS entry
  // ─────────────────────────────────────────────────────────────────────────

  describe('CHAT_MODES system_prompt references', () => {
    it('every CHAT_MODES entry that has a system_prompt contains "français"', () => {
      const missing: string[] = [];
      Object.entries(CHAT_MODES).forEach(([modeId, mode]) => {
        if (mode.system_prompt && !mode.system_prompt.includes('français')) {
          missing.push(modeId);
        }
      });
      expect(missing).toHaveLength(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // getSystemPrompt() helper
  // ─────────────────────────────────────────────────────────────────────────

  describe('getSystemPrompt()', () => {
    it('returns a French-enforced prompt for all known mode IDs', () => {
      const knownModeIds = Object.keys(CHAT_MODES);
      knownModeIds.forEach(modeId => {
        const prompt = getSystemPrompt(modeId);
        expect(prompt, `getSystemPrompt('${modeId}') missing "français"`).toContain(
          'français'
        );
      });
    });

    it('falls back to the default SYSTEM_PROMPTS.default for unknown modes', () => {
      const fallback = getSystemPrompt('__non_existent_mode__');
      expect(fallback).toBe(SYSTEM_PROMPTS.default);
      expect(fallback).toContain('Réponds TOUJOURS en français');
    });
  });
});
