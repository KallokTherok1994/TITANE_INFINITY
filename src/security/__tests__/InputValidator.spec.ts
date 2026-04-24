/**
 * @module src/security/__tests__/InputValidator.spec.ts
 * @description Input Validator tests
 */

import { describe, it, expect } from 'vitest';
import { InputValidator } from '../InputValidator';

describe('InputValidator', () => {
  describe('API Key validation', () => {
    it('should accept valid API keys', () => {
      const result = InputValidator.validateApiKey('sk-1234567890abcdef');
      expect(result.valid).toBe(true);
    });

    it('should reject empty API keys', () => {
      const result = InputValidator.validateApiKey('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject API keys that are too long', () => {
      const longKey = 'a'.repeat(2100);
      const result = InputValidator.validateApiKey(longKey);
      expect(result.valid).toBe(false);
    });

    it('should reject API keys with invalid characters', () => {
      const result = InputValidator.validateApiKey('key\x00with\x01control');
      expect(result.valid).toBe(false);
    });
  });

  describe('Chat message validation', () => {
    it('should accept normal messages', () => {
      const result = InputValidator.validateChatMessage('Hello, how are you?');
      expect(result.valid).toBe(true);
    });

    it('should reject empty messages', () => {
      const result = InputValidator.validateChatMessage('');
      expect(result.valid).toBe(false);
    });

    it('should reject XSS attempts', () => {
      const result = InputValidator.validateChatMessage('<script>alert("XSS")</script>');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('XSS');
    });

    it('should reject onerror XSS', () => {
      const result = InputValidator.validateChatMessage('<img src=x onerror="alert(1)">');
      expect(result.valid).toBe(false);
    });

    it('should reject messages that are too long', () => {
      const longMsg = 'a'.repeat(10100);
      const result = InputValidator.validateChatMessage(longMsg);
      expect(result.valid).toBe(false);
    });
  });

  describe('URL validation', () => {
    it('should accept valid HTTP URLs', () => {
      const result = InputValidator.validateUrl('https://example.com/api');
      expect(result.valid).toBe(true);
    });

    it('should accept blob URLs', () => {
      const result = InputValidator.validateUrl('blob:https://example.com/abc123');
      expect(result.valid).toBe(true);
    });

    it('should reject javascript: URLs', () => {
      const result = InputValidator.validateUrl('javascript:alert("XSS")');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('should reject data: HTML URLs', () => {
      const result = InputValidator.validateUrl(
        'data:text/html,<script>alert(1)</script>'
      );
      expect(result.valid).toBe(false);
    });

    it('should reject vbscript: URLs', () => {
      const result = InputValidator.validateUrl('vbscript:msgbox("XSS")');
      expect(result.valid).toBe(false);
    });

    it('should reject malformed URLs', () => {
      const result = InputValidator.validateUrl('not a url');
      expect(result.valid).toBe(false);
    });
  });

  describe('User name validation', () => {
    it('should accept valid usernames', () => {
      const result = InputValidator.validateUserName('john_doe-123');
      expect(result.valid).toBe(true);
    });

    it('should reject usernames with spaces', () => {
      const result = InputValidator.validateUserName('john doe');
      expect(result.valid).toBe(false);
    });

    it('should reject usernames with special chars', () => {
      const result = InputValidator.validateUserName('john@doe');
      expect(result.valid).toBe(false);
    });

    it('should reject empty usernames', () => {
      const result = InputValidator.validateUserName('');
      expect(result.valid).toBe(false);
    });
  });

  describe('Command validation', () => {
    it('should accept simple commands', () => {
      const result = InputValidator.validateCommand('list files');
      expect(result.valid).toBe(true);
    });

    it('should reject command injection attempts', () => {
      const result = InputValidator.validateCommand('list; rm -rf /');
      expect(result.valid).toBe(false);
    });

    it('should reject pipe injections', () => {
      const result = InputValidator.validateCommand('list | malicious');
      expect(result.valid).toBe(false);
    });

    it('should reject backtick injection', () => {
      const result = InputValidator.validateCommand('list `evil command`');
      expect(result.valid).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should throw on non-string input', () => {
      const result = InputValidator.validateApiKey(123 as any);
      expect(result.valid).toBe(false);
    });

    it('should handle null input', () => {
      const result = InputValidator.validateApiKey(null as any);
      expect(result.valid).toBe(false);
    });
  });
});
