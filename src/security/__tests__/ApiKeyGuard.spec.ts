/**
 * @module src/security/__tests__/ApiKeyGuard.spec.ts
 * @description API Key Guard tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ApiKeyGuard } from '../ApiKeyGuard';

describe('ApiKeyGuard', () => {
  beforeEach(() => {
    ApiKeyGuard.clearAll();
  });

  afterEach(() => {
    ApiKeyGuard.clearAll();
  });

  describe('Key registration and masking', () => {
    it('should register a key', () => {
      ApiKeyGuard.registerKey('openai', 'sk-1234567890abcdef');
      expect(ApiKeyGuard.hasKey('openai')).toBe(true);
    });

    it('should mask keys correctly', () => {
      const masked = ApiKeyGuard.maskKey('sk-1234567890abcdef');
      expect(masked).toBe('***cdef');
      expect(masked).not.toContain('1234567890ab');
    });

    it('should get masked key', () => {
      ApiKeyGuard.registerKey('anthropic', 'sk-ant-1234567890abcdef');
      const masked = ApiKeyGuard.getMaskedKey('anthropic');
      expect(masked).toBe('***cdef');
    });

    it('should reject short keys', () => {
      const callback = vi.fn();
      ApiKeyGuard.onKeyEvent(callback);
      
      ApiKeyGuard.registerKey('invalid', 'short');
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'warning',
          message: expect.stringContaining('suspiciously short')
        })
      );
    });
  });

  describe('Key listing and metadata', () => {
    it('should list all providers', () => {
      ApiKeyGuard.registerKey('openai', 'sk-openai-1234567890abcdef');
      ApiKeyGuard.registerKey('anthropic', 'sk-ant-1234567890abcdef');
      
      const providers = ApiKeyGuard.listProviders();
      expect(providers).toContain('openai');
      expect(providers).toContain('anthropic');
      expect(providers).toHaveLength(2);
    });

    it('should get key metadata', () => {
      ApiKeyGuard.registerKey('openai', 'sk-1234567890abcdef', {
        lastUsed: 12345
      });
      
      const metadata = ApiKeyGuard.getMetadata('openai');
      expect(metadata).toBeDefined();
      expect(metadata?.provider).toBe('openai');
      expect(metadata?.masked).toBe('***cdef');
    });

    it('should track usage', () => {
      ApiKeyGuard.registerKey('openai', 'sk-1234567890abcdef');
      
      const before = ApiKeyGuard.getMetadata('openai')?.lastUsed;
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);
      
      ApiKeyGuard.recordUsage('openai');
      const after = ApiKeyGuard.getMetadata('openai')?.lastUsed;
      
      expect(after).toBeGreaterThan(before || 0);
      vi.useRealTimers();
    });

    it('should get summary', () => {
      ApiKeyGuard.registerKey('openai', 'sk-openai-1234567890abcdef');
      ApiKeyGuard.registerKey('anthropic', 'sk-ant-1234567890abcdef');
      
      const summary = ApiKeyGuard.getSummary();
      expect(summary.openai).toBeDefined();
      expect(summary.anthropic).toBeDefined();
      expect(summary.openai.masked).toBe('***cdef');
    });
  });

  describe('Exposure detection', () => {
    it('should detect key tail in content', () => {
      const key = 'sk-1234567890abcdef';
      const callback = vi.fn();
      ApiKeyGuard.onKeyEvent(callback);
      
      const result = ApiKeyGuard.validateNotInContent('Error: abcdef', key);
      
      expect(result).toBe(false);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'critical',
          message: expect.stringContaining('potentially exposed')
        })
      );
    });

    it('should allow safe content', () => {
      const key = 'sk-1234567890abcdef';
      const result = ApiKeyGuard.validateNotInContent('Error: something went wrong', key);
      
      expect(result).toBe(true);
    });

    it('should handle missing key gracefully', () => {
      const result = ApiKeyGuard.validateNotInContent('some content', '');
      expect(result).toBe(true);
    });

    it('should handle non-string content', () => {
      const result = ApiKeyGuard.validateNotInContent(null as any, 'sk-key');
      expect(result).toBe(true);
    });
  });

  describe('Event emission', () => {
    it('should emit registration event', () => {
      const callback = vi.fn();
      ApiKeyGuard.onKeyEvent(callback);
      
      ApiKeyGuard.registerKey('openai', 'sk-1234567890abcdef');
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'api_key',
          severity: 'info',
          message: expect.stringContaining('registered')
        })
      );
    });

    it('should emit clear event', () => {
      ApiKeyGuard.registerKey('openai', 'sk-1234567890abcdef');
      
      const callback = vi.fn();
      ApiKeyGuard.onKeyEvent(callback);
      
      ApiKeyGuard.clearAll();
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'api_key',
          severity: 'info',
          message: expect.stringContaining('Cleared')
        })
      );
    });

    it('should support unsubscribe', () => {
      const callback = vi.fn();
      const unsubscribe = ApiKeyGuard.onKeyEvent(callback);
      
      ApiKeyGuard.registerKey('openai', 'sk-key');
      const callCount = callback.mock.calls.length;
      
      unsubscribe();
      
      ApiKeyGuard.registerKey('anthropic', 'sk-key2');
      expect(callback.mock.calls.length).toBe(callCount);
    });
  });

  describe('Edge cases', () => {
    it('should handle non-existent provider', () => {
      expect(ApiKeyGuard.getMaskedKey('nonexistent')).toBe(null);
      expect(ApiKeyGuard.getMetadata('nonexistent')).toBe(null);
    });

    it('should mask very short keys', () => {
      const masked = ApiKeyGuard.maskKey('ab');
      expect(masked).toBe('***');
    });

    it('should clear multiple keys', () => {
      ApiKeyGuard.registerKey('key1', 'sk-1234567890abcdef');
      ApiKeyGuard.registerKey('key2', 'sk-1234567890abcdef');
      ApiKeyGuard.registerKey('key3', 'sk-1234567890abcdef');
      
      ApiKeyGuard.clearAll();
      
      expect(ApiKeyGuard.listProviders()).toHaveLength(0);
    });
  });
});
