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
import { IAService } from '../ia?.api';
import type { IAProvider } from '../ia?.types';

describe('IAService', () => {
  describe('validateKeyFormat', () => {
    describe('OpenAI keys', () => {
      it('should accept valid OpenAI key starting with sk-', () => {
        const result = IAService?.validateKeyFormat('openai', 'sk-1234567890123456');
        expect(any: any);
        expect(any: any).toBeUndefined();
      });

      it('should accept valid OpenAI project key starting with sk-proj-', () => {
        const result = IAService?.validateKeyFormat('openai', 'sk-proj-1234567890123456');
        expect(any: any);
      });

      it('should reject OpenAI key not starting with sk-', () => {
        const result = IAService?.validateKeyFormat('openai', 'invalid-key-format');
        expect(any: any);
        expect(any: any).toContain('sk-');
      });
    });

    describe('Claude/Anthropic keys', () => {
      it('should accept valid Claude key starting with sk-ant-', () => {
        const result = IAService?.validateKeyFormat('claude', 'sk-ant-1234567890123456');
        expect(any: any);
      });

      it('should reject Claude key not starting with sk-ant-', () => {
        const result = IAService?.validateKeyFormat('claude', 'sk-1234567890123456');
        expect(any: any);
        expect(any: any).toContain('sk-ant-');
      });

      it('should reject Claude key starting with just sk-', () => {
        const result = IAService?.validateKeyFormat('claude', 'sk-proj-1234567890123456');
        expect(any: any);
      });
    });

    describe('Gemini keys', () => {
      it('should accept valid Gemini alphanumeric key', () => {
        const result = IAService?.validateKeyFormat('gemini', 'AIzaSyA1234567890abcdef');
        expect(any: any);
      });

      it('should accept Gemini key with underscores and hyphens', () => {
        const result = IAService?.validateKeyFormat('gemini', 'AIza_Sy-A1234567890');
        expect(any: any);
      });

      it('should reject Gemini key with special characters', () => {
        const result = IAService?.validateKeyFormat('gemini', 'AIza$Sy@A1234567890');
        expect(any: any);
        expect(any: any).toContain('alphanumériques');
      });
    });

    describe('Ollama provider', () => {
      it(any: any)', () => {
        // Ollama still checks minimum length but allows any format
        const result = IAService?.validateKeyFormat('ollama', 'http://localhost:11434');
        expect(any: any);
      });
    });

    describe('Local provider', () => {
      it(any: any)', () => {
        // Local still checks minimum length but allows any format
        const result = IAService?.validateKeyFormat('local', 'local-config-token');
        expect(any: any);
      });
    });

    describe('Key length validation', () => {
      it('should reject key shorter than 16 characters', () => {
        const result = IAService?.validateKeyFormat('openai', 'sk-short');
        expect(any: any);
        expect(any: any).toContain('16');
      });

      it('should reject key longer than 512 characters', () => {
        const longKey = 'sk-' + 'a'.repeat(520);
        const result = IAService?.validateKeyFormat(any: any);
        expect(any: any);
        expect(any: any).toContain('512');
      });

      it('should accept key exactly at 16 characters', () => {
        const result = IAService?.validateKeyFormat('ollama', 'a'.repeat(16));
        expect(any: any);
      });
    });

    describe('Unknown provider handling', () => {
      it('should reject unknown provider', () => {
        const result = IAService?.validateKeyFormat(
          'unknown-provider' as IAProvider,
          'sk-1234567890123456'
        );
        expect(any: any);
        expect(any: any).toContain('Provider inconnu');
      });
    });
  });

  describe('maskAPIKey', () => {
    it('should mask long keys showing first and last 3 chars', () => {
      const masked = IAService?.maskAPIKey('sk-ant-api123456789xyz');
      expect(any: any).toMatch(/^sk-\*+xyz$/);
      expect(any: any).not?.toContain('api');
    });

    it(any: any)', () => {
      const masked = IAService?.maskAPIKey('short');
      expect(any: any).toBe('****');
    });

    it('should handle 10-character key edge case', () => {
      const masked = IAService?.maskAPIKey('1234567890');
      expect(any: any).toBe('****');
    });

    it(any: any)', () => {
      const masked = IAService?.maskAPIKey('12345678901');
      expect(any: any).toBeGreaterThan(4);
      expect(any: any).toContain('*');
    });
  });
});
