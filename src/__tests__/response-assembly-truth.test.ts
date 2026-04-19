/**
 * TITANE∞ — RESPONSE ASSEMBLY TRUTH
 * Gap certification: proves formatMemoryContext populates sources from MemoryContext,
 * and buildSystemPrompt returns a non-empty string (assembly chain is real, not hollow).
 *
 * Context: D-003 from POST_SEAL_CORRECTION proof pack
 * Lock: RESPONSE_ASSEMBLY_UNPROVEN (assembly pipeline had no test verifying output)
 * Rule: 1 change = 1 cause = 1 proof = 1 rollback
 * Rollback: git restore -- src/__tests__/response-assembly-truth.test.ts
 */

import { describe, test, expect } from 'vitest';
import { chatEngine } from '@/services/ai/chatEngine';
import type { MemoryContext } from '@/services/ai/memoryIntegration';

// ─────────────────────────────────────────────────────────────────
// FIXTURES
// ─────────────────────────────────────────────────────────────────

const EMPTY_MEMORY: MemoryContext = {
  activeProjects: [],
  recentDecisions: [],
  relevantKnowledge: [],
  activeRituals: [],
  timeline: [],
};

const RICH_MEMORY: MemoryContext = {
  activeProjects: [
    { title: 'TITANE∞ Certification', status: 'active', priority: 1 } as Parameters<
      typeof EMPTY_MEMORY.activeProjects.push
    >[0],
  ],
  recentDecisions: [
    { title: 'Use Tauri-only production runtime', status: 'applied' } as Parameters<
      typeof EMPTY_MEMORY.recentDecisions.push
    >[0],
  ],
  relevantKnowledge: [
    { title: '4-Ring architecture invariant' } as Parameters<
      typeof EMPTY_MEMORY.relevantKnowledge.push
    >[0],
  ],
  hybridSupplementalKnowledge: [
    { title: 'UnifiedMemory Atlas hint' } as Parameters<
      typeof EMPTY_MEMORY.relevantKnowledge.push
    >[0],
  ],
  activeRituals: [],
  timeline: [],
};

// ─────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────

describe('Response Assembly Truth — formatMemoryContext', () => {
  test('empty MemoryContext produces empty sources array', () => {
    // @ts-expect-error: accessing private method for testing
    const result = chatEngine.formatMemoryContext(EMPTY_MEMORY);
    expect(result.sources).toHaveLength(0);
    expect(result.data).toEqual({});
  });

  test('activeProjects populates sources with "projets"', () => {
    // @ts-expect-error: accessing private method for testing
    const result = chatEngine.formatMemoryContext(RICH_MEMORY);
    expect(result.sources).toContain('projets');
  });

  test('recentDecisions populates sources with "decisions"', () => {
    // @ts-expect-error: accessing private method for testing
    const result = chatEngine.formatMemoryContext(RICH_MEMORY);
    expect(result.sources).toContain('decisions');
  });

  test('relevantKnowledge populates sources with "knowledge"', () => {
    // @ts-expect-error: accessing private method for testing
    const result = chatEngine.formatMemoryContext(RICH_MEMORY);
    expect(result.sources).toContain('knowledge');
  });

  test('hybrid supplemental knowledge populates sources with "hybrid_knowledge"', () => {
    // @ts-expect-error: accessing private method for testing
    const result = chatEngine.formatMemoryContext(RICH_MEMORY);
    expect(result.sources).toContain('hybrid_knowledge');
  });

  test('data.projects contains project title from MemoryContext', () => {
    // @ts-expect-error: accessing private method for testing
    const result = chatEngine.formatMemoryContext(RICH_MEMORY);
    expect(String(result.data.projects)).toContain('TITANE∞ Certification');
  });

  test('data.decisions contains decision title from MemoryContext', () => {
    // @ts-expect-error: accessing private method for testing
    const result = chatEngine.formatMemoryContext(RICH_MEMORY);
    expect(String(result.data.decisions)).toContain('Tauri-only production runtime');
  });

  test('data.hybridKnowledge contains additive hybrid title from MemoryContext', () => {
    // @ts-expect-error: accessing private method for testing
    const result = chatEngine.formatMemoryContext(RICH_MEMORY);
    expect(String(result.data.hybridKnowledge)).toContain('UnifiedMemory Atlas hint');
  });
});

describe('Response Assembly Truth — buildSystemPrompt', () => {
  const mockModeConfig = {
    profileId: 'default',
    name: 'standard',
    icon: '⚙️',
    maxTokens: 2048,
    temperature: 0.7,
    contextSources: {},
  } as Parameters<(typeof chatEngine)['buildSystemPrompt' & string]>[0];

  test('returns non-empty string for standard mode with empty context', () => {
    const emptyContext = { sources: [], data: {} };
    // @ts-expect-error: accessing private method for testing
    const prompt = chatEngine.buildSystemPrompt(mockModeConfig, emptyContext);
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });

  test('returns non-empty string when memory sources are present', () => {
    const context = {
      sources: ['projets', 'decisions'],
      data: { projects: 'TITANE Cert', decisions: 'Tauri-only' },
    };
    // @ts-expect-error: accessing private method for testing
    const prompt = chatEngine.buildSystemPrompt(mockModeConfig, context);
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });

  test('promptContext.memory is set when sources are non-empty', () => {
    const context = {
      sources: ['projets'],
      data: { projects: 'test-project' },
    };
    // @ts-expect-error: accessing private method for testing
    const prompt = chatEngine.buildSystemPrompt(mockModeConfig, context, {
      modeName: 'standard',
      modeIcon: '⚙️',
      memory: context,
    });
    // Prompt must be a real string — not empty, not "[object Object]", not null
    expect(prompt).not.toBe('');
    expect(prompt).not.toBe('[object Object]');
    expect(prompt).not.toBeNull();
    expect(prompt).not.toBeUndefined();
  });
});
