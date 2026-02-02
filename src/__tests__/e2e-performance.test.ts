/**
 * TITANE∞ v19.2Ω — E2E Performance Tests
 * Tests for performance metrics and load handling
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { aiOrchestrator } from '../services/ai/orchestrator';
import { chatMemoryCompactor } from '../services/chatMemoryCompactor';
import { setupE2ETest, teardownE2ETest } from './e2e-setup';

describe('🟣 OMEGA Phase 7Ω - E2E: Performance', () => {
  beforeEach(() => {
    setupE2ETest();
  });

  afterEach(() => {
    teardownE2ETest();
  });

  it('should maintain response times under 30 seconds', async () => {
    const start = Date.now();
    const result = await aiOrchestrator.generate('Performance test', []);
    const elapsed = Date.now() - start;

    expect(result).toBeDefined();
    expect(elapsed).toBeLessThan(30000);
  });

  it('should handle large conversation history efficiently', async () => {
    // Create a large mock history
    const largeHistory = Array.from({ length: 100 }, (_, i) => ({
      id: `msg-${i}`,
      role: i % 2 === 0 ? ('user' as const) : ('assistant' as const),
      content: `Message ${i}: ${'x'.repeat(100)}`,
      timestamp: Date.now() - (100 - i) * 1000,
      metadata: {},
    }));

    const start = Date.now();
    const result = await aiOrchestrator.generate('Test with history', largeHistory);
    const elapsed = Date.now() - start;

    expect(result).toBeDefined();
    expect(elapsed).toBeLessThan(30000);
  });

  it('should handle rapid consecutive messages', async () => {
    const messages = Array.from({ length: 10 }, (_, i) => `Rapid message ${i}`);
    const results = [];

    const start = Date.now();
    for (const message of messages) {
      const result = await aiOrchestrator.generate(message, []);
      results.push(result);
    }
    const elapsed = Date.now() - start;

    expect(results).toHaveLength(10);
    expect(elapsed).toBeLessThan(30000);
  });

  it('should handle burst request patterns', async () => {
    const requests = Array.from({ length: 5 }, () =>
      aiOrchestrator.generate('Burst test', [])
    );

    const start = Date.now();
    const results = await Promise.allSettled(requests);
    const elapsed = Date.now() - start;

    expect(results).toHaveLength(5);
    expect(elapsed).toBeLessThan(60000); // Allow longer for concurrent requests
  });
});
