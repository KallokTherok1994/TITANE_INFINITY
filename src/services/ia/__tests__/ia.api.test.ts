/**
 * TITANE∞ v19.3Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3Ω — IA SERVICE API TESTS
 *   AUTOFIX Phase D: Proactive tests for API key validation
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from 'vitest';
import { IAService } from '../ia.api';
import type { IAProvider } from '../ia.types';

describe('IAService', () => {
  describe('validateKeyFormat', () => {
    describe('OpenAI keys', () => {
      it('should accept valid OpenAI key starting with sk-', () => {
        const result = IAService.validateKeyFormat('openai', 'sk-1234567890123456');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should accept valid OpenAI project key starting with sk-proj-', () => {
        const result = IAService.validateKeyFormat('openai', 'sk-proj-1234567890123456');
        expect(result.valid).toBe(true);
      });

      it('should reject OpenAI key not starting with sk-', () => {
        const result = IAService.validateKeyFormat('openai', 'invalid-key-format');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('sk-');
      });
    });

    describe('Claude/Anthropic keys', () => {
      it('should accept valid Claude key starting with sk-ant-', () => {
        const result = IAService.validateKeyFormat('claude', 'sk-ant-1234567890123456');
        expect(result.valid).toBe(true);
      });

      it('should reject Claude key not starting with sk-ant-', () => {
        const result = IAService.validateKeyFormat('claude', 'sk-1234567890123456');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('sk-ant-');
      });

      it('should reject Claude key starting with just sk-', () => {
        const result = IAService.validateKeyFormat('claude', 'sk-proj-1234567890123456');
        expect(result.valid).toBe(false);
      });
    });

    describe('Gemini keys', () => {
      it('should accept valid Gemini alphanumeric key', () => {
        const result = IAService.validateKeyFormat('gemini', 'AIzaSyA1234567890abcdef');
        expect(result.valid).toBe(true);
      });

      it('should accept Gemini key with underscores and hyphens', () => {
        const result = IAService.validateKeyFormat('gemini', 'AIza_Sy-A1234567890');
        expect(result.valid).toBe(true);
      });

      it('should reject Gemini key with special characters', () => {
        const result = IAService.validateKeyFormat('gemini', 'AIza$Sy@A1234567890');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('alphanumériques');
      });
    });

    describe('Ollama provider', () => {
      it('should always accept Ollama (no API key required, min 16 chars)', () => {
        // Ollama still checks minimum length but allows any format
        const result = IAService.validateKeyFormat('ollama', 'http://localhost:11434');
        expect(result.valid).toBe(true);
      });
    });

    describe('Local provider', () => {
      it('should always accept local (no format validation, min 16 chars)', () => {
        // Local still checks minimum length but allows any format
        const result = IAService.validateKeyFormat('local', 'local-config-token');
        expect(result.valid).toBe(true);
      });
    });

    describe('Key length validation', () => {
      it('should reject key shorter than 16 characters', () => {
        const result = IAService.validateKeyFormat('openai', 'sk-short');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('16');
      });

      it('should reject key longer than 512 characters', () => {
        const longKey = 'sk-' + 'a'.repeat(520);
        const result = IAService.validateKeyFormat('openai', longKey);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('512');
      });

      it('should accept key exactly at 16 characters', () => {
        const result = IAService.validateKeyFormat('ollama', 'a'.repeat(16));
        expect(result.valid).toBe(true);
      });
    });

    describe('Unknown provider handling', () => {
      it('should reject unknown provider', () => {
        const result = IAService.validateKeyFormat('unknown-provider' as IAProvider, 'sk-1234567890123456');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Provider inconnu');
      });
    });
  });

  describe('maskAPIKey', () => {
    it('should mask long keys showing first and last 3 chars', () => {
      const masked = IAService.maskAPIKey('sk-ant-api123456789xyz');
      expect(masked).toMatch(/^sk-\*+xyz$/);
      expect(masked).not.toContain('api');
    });

    it('should return **** for very short keys (<= 10 chars)', () => {
      const masked = IAService.maskAPIKey('short');
      expect(masked).toBe('****');
    });

    it('should handle 10-character key edge case', () => {
      const masked = IAService.maskAPIKey('1234567890');
      expect(masked).toBe('****');
    });

    it('should handle 11-character key (just above threshold)', () => {
      const masked = IAService.maskAPIKey('12345678901');
      expect(masked.length).toBeGreaterThan(4);
      expect(masked).toContain('*');
    });
  });
});
