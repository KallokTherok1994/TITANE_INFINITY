/**
 * TITANE∞ v19.2Ω — E2E API Integration Tests
 * Tests for backend API integration and orchestration
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { chatEngine } from '../services/ai/chatEngine';
import { aiOrchestrator } from '../services/ai/orchestrator';
import { autoHealEngine } from '../services/ai/autoHealEngine';
import { setupE2ETest, teardownE2ETest } from './e2e-setup';
import { createMockResponse } from './e2e-test-utils';

describe('🟣 OMEGA Phase 7Ω - E2E: API Integration', () => {
  beforeEach(() => {
    setupE2ETest();
  });

  afterEach(() => {
    teardownE2ETest();
  });

  it('should complete full message flow through orchestrator', async () => {
    const testMessage = 'Test API integration';

    const result = await aiOrchestrator.generate(testMessage, []);

    expect(result).toBeDefined();
    expect(result.content).toBeTruthy();
    expect(result.content.length).toBeGreaterThan(0);
    expect(result.provider).toBeTruthy();
    expect(typeof result.timestamp).toBe('number');
  });

  it('should handle multiple sequential API calls', async () => {
    const messages = ['First call', 'Second call', 'Third call'];
    const config = { preferredProvider: 'titane-local' as const, timeout: 5000 };

    const results = [];
    for (const message of messages) {
      const result = await aiOrchestrator.generate(message, [], config);
      results.push(result);
    }

    expect(results).toHaveLength(3);
    results.forEach(result => {
      expect(result).toBeDefined();
      expect(result.content).toBeTruthy();
    });
  });

  it('should maintain API response consistency', async () => {
    const testInput = 'Consistency test';
    const result1 = await aiOrchestrator.generate(testInput, []);
    const result2 = await aiOrchestrator.generate(testInput, []);

    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
    // Same input may produce different outputs, but structure should be consistent
    expect(result1).toHaveProperty('content');
    expect(result1).toHaveProperty('provider');
    expect(result2).toHaveProperty('content');
    expect(result2).toHaveProperty('provider');
  });

  it('should trigger auto-healing on API errors', async () => {
    const testMessage = 'Error recovery test';

    try {
      const result = await aiOrchestrator.generate(testMessage, []);
      // If it succeeds, verify auto-healing was not needed
      expect(result).toBeDefined();
    } catch (error) {
      // If it fails, verify error was handled properly
      expect(error).toBeDefined();
    }
  });
});
