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
} from '../config/aiTimeouts.config';
import { API_TIMEOUTS } from '../constants/timeouts';

describe('Cloud Agent Timeout Configuration v26.2.1', () => {
  describe('Provider Timeouts', () => {
    it('should have increased cloud provider timeouts', () => {
      // OpenAI and Claude should be 75s (was 40s)
      expect(PROVIDER_TIMEOUTS.openai).toBe(75000);
      expect(PROVIDER_TIMEOUTS.claude).toBe(75000);
      
      // Gemini should be 60s (was 35s)
      expect(PROVIDER_TIMEOUTS.gemini).toBe(60000);
    });

    it('should maintain local provider timeouts', () => {
      // Local providers should remain fast
      expect(PROVIDER_TIMEOUTS['titane-local']).toBe(5000);
      expect(PROVIDER_TIMEOUTS['tauri-backend']).toBe(12000);
      expect(PROVIDER_TIMEOUTS.ollama).toBe(30000);
    });

    it('should ensure cloud timeouts > local timeouts', () => {
      const cloudProviders = ['openai', 'claude', 'gemini'];
      const localProviders = ['titane-local', 'tauri-backend', 'ollama'];

      cloudProviders.forEach(cloud => {
        localProviders.forEach(local => {
          expect(PROVIDER_TIMEOUTS[cloud as keyof typeof PROVIDER_TIMEOUTS])
            .toBeGreaterThan(PROVIDER_TIMEOUTS[local as keyof typeof PROVIDER_TIMEOUTS]);
        });
      });
    });

    it('getProviderTimeout should return correct values', () => {
      expect(getProviderTimeout('openai')).toBe(75000);
      expect(getProviderTimeout('claude')).toBe(75000);
      expect(getProviderTimeout('gemini')).toBe(60000);
      expect(getProviderTimeout('unknown')).toBe(PROVIDER_TIMEOUTS.default);
    });
  });

  describe('UI Timeouts', () => {
    it('should have increased UI cloud timeouts', () => {
      // Cloud provider timeouts should be extended
      expect(UI_TIMEOUTS.cloudProvider.short).toBe(65000);
      expect(UI_TIMEOUTS.cloudProvider.medium).toBe(80000);
      expect(UI_TIMEOUTS.cloudProvider.long).toBe(90000);
    });

    it('should have increased max request timeout', () => {
      // Max request should be 90s (was 45s)
      expect(UI_TIMEOUTS.maxRequest).toBe(90000);
    });

    it('should ensure UI timeout >= backend timeout', () => {
      // UI cloud long should be >= OpenAI/Claude backend
      expect(UI_TIMEOUTS.cloudProvider.long)
        .toBeGreaterThanOrEqual(PROVIDER_TIMEOUTS.openai);
      expect(UI_TIMEOUTS.cloudProvider.long)
        .toBeGreaterThanOrEqual(PROVIDER_TIMEOUTS.claude);
      
      // UI cloud medium should be >= Gemini backend
      expect(UI_TIMEOUTS.cloudProvider.medium)
        .toBeGreaterThanOrEqual(PROVIDER_TIMEOUTS.gemini);
    });

    it('getAdaptiveUITimeout should return appropriate values', () => {
      // Short message
      const shortTimeout = getAdaptiveUITimeout('cloud', 200);
      expect(shortTimeout).toBe(UI_TIMEOUTS.cloudProvider.short);

      // Medium message
      const mediumTimeout = getAdaptiveUITimeout('cloud', 1000);
      expect(mediumTimeout).toBe(UI_TIMEOUTS.cloudProvider.medium);

      // Long message
      const longTimeout = getAdaptiveUITimeout('cloud', 3000);
      expect(longTimeout).toBe(UI_TIMEOUTS.cloudProvider.long);
    });
  });

  describe('Streaming Timeouts', () => {
    it('should have increased streaming timeouts', () => {
      // Total stream timeout should be 3 minutes (was 2)
      expect(STREAM_CONFIG.totalTimeoutMs).toBe(180000);
      
      // Per-chunk timeout should be 15s (was 10s)
      expect(STREAM_CONFIG.perChunkTimeoutMs).toBe(15000);
    });

    it('should ensure streaming timeout > provider timeout', () => {
      const allProviders = Object.values(PROVIDER_TIMEOUTS);
      const maxProviderTimeout = Math.max(...allProviders);
      
      expect(STREAM_CONFIG.totalTimeoutMs)
        .toBeGreaterThan(maxProviderTimeout);
    });
  });

  describe('General API Timeouts', () => {
    it('should have increased AI generation timeout', () => {
      // AI generation should be 90s (was 30s)
      expect(API_TIMEOUTS.AI_GENERATION).toBe(90000);
    });

    it('should have increased long operation timeout', () => {
      // Long operations should be 120s (was 60s)
      expect(API_TIMEOUTS.LONG_OPERATION).toBe(120000);
    });

    it('should ensure AI generation timeout >= max provider timeout', () => {
      const maxProviderTimeout = Math.max(
        PROVIDER_TIMEOUTS.openai,
        PROVIDER_TIMEOUTS.claude,
        PROVIDER_TIMEOUTS.gemini
      );
      
      expect(API_TIMEOUTS.AI_GENERATION)
        .toBeGreaterThanOrEqual(maxProviderTimeout);
    });
  });

  describe('Timeout Hierarchy', () => {
    it('should maintain proper timeout hierarchy', () => {
      // UI Max > Cloud Provider Long > OpenAI/Claude Backend
      expect(UI_TIMEOUTS.maxRequest)
        .toBeGreaterThanOrEqual(UI_TIMEOUTS.cloudProvider.long);
      expect(UI_TIMEOUTS.cloudProvider.long)
        .toBeGreaterThanOrEqual(PROVIDER_TIMEOUTS.openai);
      expect(UI_TIMEOUTS.cloudProvider.long)
        .toBeGreaterThanOrEqual(PROVIDER_TIMEOUTS.claude);
    });

    it('should prevent UI from timing out before backend', () => {
      // For each cloud provider, UI timeout should be >= backend timeout
      const cloudProviders = ['openai', 'claude', 'gemini'] as const;
      
      cloudProviders.forEach(provider => {
        const backendTimeout = PROVIDER_TIMEOUTS[provider];
        
        // At least one UI timeout variant should be >= backend
        const hasValidTimeout = 
          UI_TIMEOUTS.cloudProvider.short >= backendTimeout ||
          UI_TIMEOUTS.cloudProvider.medium >= backendTimeout ||
          UI_TIMEOUTS.cloudProvider.long >= backendTimeout;
        
        expect(hasValidTimeout).toBe(true);
      });
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain default timeout for unknown providers', () => {
      expect(PROVIDER_TIMEOUTS.default).toBeDefined();
      expect(getProviderTimeout('unknown-provider')).toBe(PROVIDER_TIMEOUTS.default);
    });

    it('should not break local provider behavior', () => {
      const localTimeout = getAdaptiveUITimeout('local', 500);
      expect(localTimeout).toBeLessThan(UI_TIMEOUTS.cloudProvider.short);
    });

    it('should have reasonable timeout values', () => {
      // All timeouts should be positive numbers
      expect(UI_TIMEOUTS.maxRequest).toBeGreaterThan(0);
      expect(PROVIDER_TIMEOUTS.openai).toBeGreaterThan(0);
      expect(STREAM_CONFIG.totalTimeoutMs).toBeGreaterThan(0);
      
      // Timeouts should not be excessive (< 5 minutes)
      expect(UI_TIMEOUTS.maxRequest).toBeLessThan(300000);
      expect(PROVIDER_TIMEOUTS.openai).toBeLessThan(300000);
      expect(STREAM_CONFIG.totalTimeoutMs).toBeLessThan(300000);
    });
  });
});
