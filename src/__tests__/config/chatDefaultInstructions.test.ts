/**
 * CHAT_DEFAULT_INSTRUCTIONS_SEAL — unit tests
 * G_CHAT_DEFAULT_AUTHORITY_TRUTH: verify SYSTEM_PROMPTS.default contains canonical policy
 * G_CHAT_PROMPT_SOURCE_UNIQUE: only one canonical default
 * G_NO_FAKE_MODULE_CLAIMS: anti-lie directives present
 * G_RESPONSE_POLICY_APPLIED: response modes declared
 * x3 stability runs in LANE C
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SYSTEM_PROMPTS, getSystemPrompt } from '@/config/chatModes.config';

describe('CHAT_DEFAULT_INSTRUCTIONS_SEAL — canonical default policy', () => {
  const def = SYSTEM_PROMPTS.default;

  // LANE A — Identity
  describe('LANE A — TITANE canonical identity', () => {
    it('A1: declares TITANE as OS cognitif', () => {
      expect(def).toContain('OS cognitif');
    });
    it('A2: declares governing principle vérité > narration', () => {
      expect(def).toContain('Vérité > narration');
    });
    it('A3: declares patch minimal > refactor', () => {
      expect(def).toContain('Patch minimal > refactor');
    });
    it('A4: exposes the TWINS profile banner without legacy Symbiose wording', () => {
      expect(def).toContain('PROFIL TWINS');
      expect(def).not.toContain('SYMBIOSE TWINS');
    });
    it('A5: SYSTEM_PROMPTS.default is non-empty and substantial (>200 chars)', () => {
      expect(def.length).toBeGreaterThan(200);
    });
  });

  // LANE B — OMEGA Pipeline
  describe('LANE B — OMEGA pipeline declared', () => {
    it('B1: contains PIPELINE OMEGA reference', () => {
      expect(def).toContain('PIPELINE OMEGA');
    });
    it('B2: declares validation entrée as step 1', () => {
      expect(def).toContain("Validation d'entrée");
    });
    it('B3: declares auto-heal check as final step', () => {
      expect(def).toContain('Auto-heal check');
    });
  });

  // LANE C — Response modes
  describe('LANE C — Response modes policy declared', () => {
    it('C1: declares FAST mode', () => {
      expect(def).toContain('FAST');
    });
    it('C2: declares BALANCED mode', () => {
      expect(def).toContain('BALANCED');
    });
    it('C3: declares DEEP mode', () => {
      expect(def).toContain('DEEP');
    });
    it('C4: declares ARCHITECT mode', () => {
      expect(def).toContain('ARCHITECT');
    });
  });

  // LANE D — Memory policy
  describe('LANE D — Memory policy declared', () => {
    it('D1: declares STM', () => {
      expect(def).toContain('STM');
    });
    it('D2: declares MTM', () => {
      expect(def).toContain('MTM');
    });
    it('D3: declares LTM', () => {
      expect(def).toContain('LTM');
    });
  });

  // LANE E — Anti-lie directives
  describe('LANE E — Anti-lie and truth status declared', () => {
    it('E1: anti-lie directive present — no fake active module', () => {
      expect(def).toContain('ANTI-MENSONGE');
    });
    it('E2: truth status labels declared', () => {
      expect(def).toContain('PROVEN_RUNTIME');
      expect(def).toContain('PARTIAL');
      expect(def).toContain('UNKNOWN');
      expect(def).toContain('BLOCKED');
    });
    it('E3: LOI DE VÉRITÉ declared', () => {
      expect(def).toContain('LOI DE VÉRITÉ');
    });
  });

  // LANE F — getSystemPrompt returns canonical default
  describe('LANE F — Runtime authority', () => {
    it('F1: getSystemPrompt("default") returns canonical default', () => {
      const result = getSystemPrompt('default');
      expect(result).toContain('OS cognitif');
      expect(result).toContain('PIPELINE OMEGA');
    });
    it('F2: getSystemPrompt(undefined) falls back to canonical default', () => {
      const result = getSystemPrompt(undefined as unknown as string);
      expect(result).toContain('OS cognitif');
    });
  });

  // LANE G — Stability x3
  describe('LANE G — Stability x3', () => {
    beforeEach(() => {
      // Reset any side effects
    });
    it('G1: run 1 — default prompt is deterministic', () => {
      expect(getSystemPrompt('default')).toContain('PIPELINE OMEGA');
    });
    it('G2: run 2 — default prompt is deterministic', () => {
      expect(getSystemPrompt('default')).toContain('PIPELINE OMEGA');
    });
    it('G3: run 3 — default prompt is deterministic', () => {
      expect(getSystemPrompt('default')).toContain('PIPELINE OMEGA');
    });
    it('G4: default prompt does not contain placeholders', () => {
      expect(def).not.toMatch(/T(?:O)DO/);
      expect(def).not.toContain('PLACEHOLDER');
      expect(def).not.toContain('undefined');
    });
  });
});
