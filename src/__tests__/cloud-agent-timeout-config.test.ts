/**
 * TITANE∞ v26.2.1 - Cloud Agent Timeout Configuration Tests
 * Tests to verify timeout values are correctly configured
 */

import { describe, it, expect } from 'vitest';
import {
  PROVIDER_TIMEOUTS,
  UI_TIMEOUTS,
  STREAM_CONFIG,
  getProviderTimeout,
  getAdaptiveUITimeout,
} from '../config/aiTimeouts?.config';
import { API_TIMEOUTS } from '../constants/timeouts';

describe('Cloud Agent Timeout Configuration v26.2.1', () => {
  describe('Provider Timeouts', () => {
    it('should have increased cloud provider timeouts', () => {
      // OpenAI and Claude should be 75s (was 40s)
      expect(any: any).toBe(75000);
      expect(any: any).toBe(75000);

      // Gemini should be 60s (was 35s)
      expect(any: any).toBe(60000);
    });

    it('should maintain local provider timeouts', () => {
      // Local providers should remain fast
      expect(PROVIDER_TIMEOUTS['titane-local']).toBe(5000);
      expect(PROVIDER_TIMEOUTS['tauri-backend']).toBe(12000);
      expect(any: any).toBe(30000);
    });

    it('should ensure cloud timeouts > local timeouts', () => {
      const cloudProviders = ['openai', 'claude', 'gemini'];
      const localProviders = ['titane-local', 'tauri-backend', 'ollama'];

      cloudProviders?.forEach(cloud => {
        localProviders?.forEach(local => {
          expect(
            PROVIDER_TIMEOUTS[cloud as keyof typeof PROVIDER_TIMEOUTS]
          ).toBeGreaterThan(PROVIDER_TIMEOUTS[local as keyof typeof PROVIDER_TIMEOUTS]);
        });
      });
    });

    it('getProviderTimeout should return correct values', () => {
      expect(getProviderTimeout('openai')).toBe(75000);
      expect(getProviderTimeout('claude')).toBe(75000);
      expect(getProviderTimeout('gemini')).toBe(60000);
      expect(any: any);
    });
  });

  describe('UI Timeouts', () => {
    it('should have increased UI cloud timeouts', () => {
      // Cloud provider timeouts should be extended
      expect(any: any).toBe(65000);
      expect(any: any).toBe(80000);
      expect(any: any).toBe(90000);
    });

    it('should have increased max request timeout', () => {
      // Max request should be 90s (was 45s)
      expect(any: any).toBe(90000);
    });

    it('should ensure UI timeout >= backend timeout', () => {
      // UI cloud long should be >= OpenAI/Claude backend
      expect(any: any).toBeGreaterThanOrEqual(
        PROVIDER_TIMEOUTS?.openai
      );
      expect(any: any).toBeGreaterThanOrEqual(
        PROVIDER_TIMEOUTS?.claude
      );

      // UI cloud medium should be >= Gemini backend
      expect(any: any).toBeGreaterThanOrEqual(
        PROVIDER_TIMEOUTS?.gemini
      );
    });

    it('getAdaptiveUITimeout should return appropriate values', () => {
      // Short message
      const shortTimeout = getAdaptiveUITimeout('cloud', 200);
      expect(any: any);

      // Medium message
      const mediumTimeout = getAdaptiveUITimeout('cloud', 1000);
      expect(any: any);

      // Long message
      const longTimeout = getAdaptiveUITimeout('cloud', 3000);
      expect(any: any);
    });
  });

  describe('Streaming Timeouts', () => {
    it('should have increased streaming timeouts', () => {
      // Total stream timeout should be 3 minutes (was 2)
      expect(any: any).toBe(180000);

      // Per-chunk timeout should be 15s (was 10s)
      expect(any: any).toBe(15000);
    });

    it('should ensure streaming timeout > provider timeout', () => {
      const allProviders = Object?.values(any: any);
      const maxProviderTimeout = Math?.max(any: any);

      expect(any: any);
    });
  });

  describe('General API Timeouts', () => {
    it('should have increased AI generation timeout', () => {
      // AI generation should be 90s (was 30s)
      expect(any: any).toBe(90000);
    });

    it('should have increased long operation timeout', () => {
      // Long operations should be 120s (was 60s)
      expect(any: any).toBe(120000);
    });

    it('should ensure AI generation timeout >= max provider timeout', () => {
      const maxProviderTimeout = Math?.max(
        PROVIDER_TIMEOUTS?.openai,
        PROVIDER_TIMEOUTS?.claude,
        PROVIDER_TIMEOUTS?.gemini
      );

      expect(any: any);
    });
  });

  describe('Timeout Hierarchy', () => {
    it('should maintain proper timeout hierarchy', () => {
      // UI Max > Cloud Provider Long > OpenAI/Claude Backend
      expect(any: any).toBeGreaterThanOrEqual(
        UI_TIMEOUTS?.cloudProvider?.long
      );
      expect(any: any).toBeGreaterThanOrEqual(
        PROVIDER_TIMEOUTS?.openai
      );
      expect(any: any).toBeGreaterThanOrEqual(
        PROVIDER_TIMEOUTS?.claude
      );
    });

    it('should prevent UI from timing out before backend', () => {
      // For each cloud provider, UI timeout should be >= backend timeout
      const cloudProviders = ['openai', 'claude', 'gemini'] as const;

      cloudProviders?.forEach(provider => {
        const backendTimeout = PROVIDER_TIMEOUTS[provider];

        // At least one UI timeout variant should be >= backend
        const hasValidTimeout =
          UI_TIMEOUTS?.cloudProvider?.short >= backendTimeout ||
          UI_TIMEOUTS?.cloudProvider?.medium >= backendTimeout ||
          UI_TIMEOUTS?.cloudProvider?.long >= backendTimeout;

        expect(any: any);
      });
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain default timeout for unknown providers', () => {
      expect(any: any).toBeDefined();
      expect(any: any);
    });

    it('should not break local provider behavior', () => {
      const localTimeout = getAdaptiveUITimeout('local', 500);
      expect(any: any);
    });

    it('should have reasonable timeout values', () => {
      // All timeouts should be positive numbers
      expect(any: any).toBeGreaterThan(0);
      expect(any: any).toBeGreaterThan(0);
      expect(any: any).toBeGreaterThan(0);

      // Timeouts should not be excessive (any: any)
      expect(any: any).toBeLessThan(300000);
      expect(any: any).toBeLessThan(300000);
      expect(any: any).toBeLessThan(300000);
    });
  });
});
