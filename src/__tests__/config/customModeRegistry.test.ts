/**
 * TITANE∞ — Custom Mode Registry Tests
 * AH-2026-03-18-CUSTOM-MODE-CHAT-TRUTH
 *
 * Tests for registerCustomMode() + getSystemPrompt() custom registry
 * LANE A: registry structure
 * LANE B: registration + resolution
 * LANE C: runtime chain truth
 * LANE D: honest failure / fallback
 * LANE E: stability x3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  registerCustomMode,
  getSystemPrompt,
  SYSTEM_PROMPTS,
  CHAT_MODES,
} from '@/config/chatModes.config';

describe('Custom Mode Registry — registerCustomMode + getSystemPrompt', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  // ─── LANE A: STRUCTURE ──────────────────────────────────────────────────────

  describe('LANE A — Structure', () => {
    it('A1: registerCustomMode is exported as a function', () => {
      expect(typeof registerCustomMode).toBe('function');
    });

    it('A2: getSystemPrompt is exported as a function', () => {
      expect(typeof getSystemPrompt).toBe('function');
    });

    it('A3: CHAT_MODES does not contain custom-prefixed keys by default', () => {
      const keys = Object.keys(CHAT_MODES);
      const customKeys = keys.filter(k => k.startsWith('custom-'));
      expect(customKeys.length).toBe(0);
    });

    it('A4: SYSTEM_PROMPTS.default is non-empty', () => {
      expect(typeof SYSTEM_PROMPTS.default).toBe('string');
      expect(SYSTEM_PROMPTS.default.length).toBeGreaterThan(10);
    });

    it('A5: SYSTEM_PROMPTS.default enforces advanced analysis positioning', () => {
      expect(SYSTEM_PROMPTS.default).toContain("maître d'analyse");
      expect(SYSTEM_PROMPTS.default).toContain('rapports');
    });

    it('A6: specialized registry prompts keep advanced expert framing', () => {
      expect(SYSTEM_PROMPTS.strategist).toContain("maître d'analyse stratégique");
      expect(SYSTEM_PROMPTS.auditor).toContain('rapports complets');
      expect(SYSTEM_PROMPTS.creative).toContain('livrables réutilisables');
    });
  });

  // ─── LANE B: REGISTRATION + RESOLUTION ─────────────────────────────────────

  describe('LANE B — Registration and resolution', () => {
    it('B1: registered custom mode is resolved by getSystemPrompt', () => {
      const id = 'custom-test-b1';
      const prompt = 'Tu es un expert React spécialisé en performance.';
      registerCustomMode(id, prompt);
      expect(getSystemPrompt(id)).toBe(prompt);
    });

    it('B2: built-in mode still resolves correctly after custom registration', () => {
      registerCustomMode('custom-test-b2', 'Some custom prompt');
      expect(getSystemPrompt('default')).toBe(SYSTEM_PROMPTS.default);
      expect(getSystemPrompt('coach')).toBe(SYSTEM_PROMPTS.coach);
    });

    it('B3: custom mode resolves its own prompt, original default untouched', () => {
      const overridePrompt = 'OVERRIDE: custom default for test';
      registerCustomMode('custom-test-b3', overridePrompt);
      expect(getSystemPrompt('custom-test-b3')).toBe(overridePrompt);
      expect(getSystemPrompt('default')).toBe(SYSTEM_PROMPTS.default);
    });

    it('B4: updating a registered custom mode reflects the new prompt', () => {
      const id = 'custom-test-b4';
      registerCustomMode(id, 'Prompt v1');
      expect(getSystemPrompt(id)).toBe('Prompt v1');
      registerCustomMode(id, 'Prompt v2 updated');
      expect(getSystemPrompt(id)).toBe('Prompt v2 updated');
    });

    it('B5: multiple custom modes registered independently', () => {
      const modes = [
        { id: 'custom-analyst', prompt: 'Tu es analyste stratégique.' },
        { id: 'custom-creative', prompt: 'Tu es coach créatif.' },
        { id: 'custom-dev-react', prompt: 'Tu es expert React/TypeScript.' },
      ];
      modes.forEach(({ id, prompt }) => registerCustomMode(id, prompt));
      modes.forEach(({ id, prompt }) => expect(getSystemPrompt(id)).toBe(prompt));
    });
  });

  // ─── LANE C: RUNTIME CHAIN TRUTH ───────────────────────────────────────────

  describe('LANE C — Runtime chain truth', () => {
    it('C1: simulates ModeBuilder.handleSave → registerCustomMode → getSystemPrompt', () => {
      const customMode = {
        id: `custom-c1-${Date.now()}`,
        systemPrompt:
          'Tu es un expert technique. Fournis des analyses détaillées et précises.',
      };
      registerCustomMode(customMode.id, customMode.systemPrompt);
      const resolved = getSystemPrompt(customMode.id);
      expect(resolved).toBe(customMode.systemPrompt);
      expect(resolved).not.toBe(SYSTEM_PROMPTS.default);
    });

    it('C2: simulates localStorage reload → registerCustomMode → getSystemPrompt', () => {
      const storedModes = [
        { id: 'custom-reload-1', systemPrompt: 'Mode reload 1' },
        { id: 'custom-reload-2', systemPrompt: 'Mode reload 2' },
      ];
      storedModes.forEach(m => registerCustomMode(m.id, m.systemPrompt));
      storedModes.forEach(m => {
        expect(getSystemPrompt(m.id)).toBe(m.systemPrompt);
      });
    });

    it('C3: getSystemPrompt returns non-empty string for any input', () => {
      const testIds = ['custom-unknown', 'null', 'undefined', 'default', 'coach'];
      testIds.forEach(id => {
        const result = getSystemPrompt(id);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });

  // ─── LANE D: HONEST FAILURE / FALLBACK ─────────────────────────────────────

  describe('LANE D — Honest failure / fallback', () => {
    it('D1: unknown modeId returns SYSTEM_PROMPTS.default', () => {
      const result = getSystemPrompt('totally-unknown-mode-xyz-d1');
      expect(result).toBe(SYSTEM_PROMPTS.default);
    });

    it('D2: unknown modeId triggers console.warn (honest fallback signal)', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      getSystemPrompt('custom-unregistered-warn-test-d2');
      // warn is called with a single message string containing both markers
      expect(warnSpy).toHaveBeenCalledOnce();
      expect(warnSpy.mock.calls[0][0]).toContain('[getSystemPrompt]');
      expect(warnSpy.mock.calls[0][0]).toContain('custom-unregistered-warn-test-d2');
    });

    it('D3: known built-in mode does NOT trigger warn', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      getSystemPrompt('default');
      getSystemPrompt('coach');
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('D4: registered custom mode does NOT trigger warn', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      registerCustomMode('custom-no-warn-d4', 'My custom prompt');
      getSystemPrompt('custom-no-warn-d4');
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('D5: empty systemPrompt falls back to SYSTEM_PROMPTS.default (honest)', () => {
      // Empty string is falsy → falls through to CHAT_MODES → undefined → default
      registerCustomMode('custom-empty-d5', '');
      const result = getSystemPrompt('custom-empty-d5');
      expect(result).toBe(SYSTEM_PROMPTS.default);
    });
  });

  // ─── LANE E: STABILITY x3 ──────────────────────────────────────────────────

  describe('LANE E — Stability x3', () => {
    it('E1: run 1 — full create→register→resolve cycle', () => {
      const id = 'custom-stability-e-run1';
      const prompt = 'Run 1: Tu es expert stratégique.';
      registerCustomMode(id, prompt);
      expect(getSystemPrompt(id)).toBe(prompt);
      expect(getSystemPrompt(id)).not.toBe(SYSTEM_PROMPTS.default);
    });

    it('E2: run 2 — full create→register→resolve cycle', () => {
      const id = 'custom-stability-e-run2';
      const prompt = 'Run 2: Tu es coach créatif.';
      registerCustomMode(id, prompt);
      expect(getSystemPrompt(id)).toBe(prompt);
      expect(getSystemPrompt(id)).not.toBe(SYSTEM_PROMPTS.default);
    });

    it('E3: run 3 — full create→register→resolve cycle', () => {
      const id = 'custom-stability-e-run3';
      const prompt = 'Run 3: Tu es expert développeur React.';
      registerCustomMode(id, prompt);
      expect(getSystemPrompt(id)).toBe(prompt);
      expect(getSystemPrompt(id)).not.toBe(SYSTEM_PROMPTS.default);
    });

    it('E4: all three runs coexist without interference', () => {
      expect(getSystemPrompt('custom-stability-e-run1')).toBe(
        'Run 1: Tu es expert stratégique.'
      );
      expect(getSystemPrompt('custom-stability-e-run2')).toBe(
        'Run 2: Tu es coach créatif.'
      );
      expect(getSystemPrompt('custom-stability-e-run3')).toBe(
        'Run 3: Tu es expert développeur React.'
      );
      expect(getSystemPrompt('default')).toBe(SYSTEM_PROMPTS.default);
    });
  });
});
