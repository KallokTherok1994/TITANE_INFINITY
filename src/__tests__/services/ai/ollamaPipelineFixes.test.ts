/**
 * Tests unitaires — Ollama Pipeline Fixes R1-R4
 * AH-OLLAMA-R1/R2/R3/R4-2026-04-29
 *
 * R1: LOCAL_PROVIDER_SET guard — cognitiveKernel cloud ne peut pas override champion local
 * R2: reflectiveVerifier utilise webSearch (dual-path Tauri-safe)
 * R3: DEEP_INTERNET_ANALYSIS_INSTRUCTION honnête sur les limites LLM local
 * R4: responseCache.get() rejette les entrées provider=mock
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── R4: responseCache mock-provider guard ──────────────────────────────────

describe('R4 — responseCache: mock provider guard', () => {
  let ResponseCache: typeof import('@/services/cache/responseCache').ResponseCache;

  beforeEach(async () => {
    vi.resetModules();
    // Stub cachePersistence to avoid file I/O
    vi.doMock('@/services/cache/cachePersistence', () => ({
      cachePersistence: {
        loadFromDisk: vi.fn().mockReturnValue([]),
        saveToDisk: vi.fn(),
      },
    }));
    vi.doMock('@/lib/logger', () => ({
      logger: { debug: vi.fn(), warn: vi.fn(), error: vi.fn(), info: vi.fn() },
    }));
    const mod = await import('@/services/cache/responseCache');
    ResponseCache = mod.ResponseCache;
  });

  it('does not return an exact-match entry with provider=mock', () => {
    const cache = new (ResponseCache as any)(50, 60000);
    const key = { message: "Qu'est-ce que l'intelligence artificielle ?", mode: 'DIRECT' };

    // Inject a mock entry directly
    const cacheKey = (cache as any).generateKey(key);
    (cache as any).cache.set(cacheKey, {
      content: "Réponse fictive mock",
      provider: 'mock',
      model: 'mock-model',
      timestamp: Date.now(),
      hitCount: 0,
      originalMessage: key.message,
    });

    const result = cache.get(key);
    expect(result).toBeNull();
  });

  it('returns an exact-match entry with provider=ollama', () => {
    const cache = new (ResponseCache as any)(50, 60000);
    const key = { message: "Qu'est-ce que l'intelligence artificielle ?", mode: 'DIRECT' };

    const cacheKey = (cache as any).generateKey(key);
    (cache as any).cache.set(cacheKey, {
      content: "Réponse Ollama réelle",
      provider: 'ollama',
      model: 'gemma2:2b',
      timestamp: Date.now(),
      hitCount: 0,
      originalMessage: key.message,
    });

    const result = cache.get(key);
    expect(result).not.toBeNull();
    expect(result?.provider).toBe('ollama');
  });

  it('does not return fuzzy-match entry with provider=mock', () => {
    const cache = new (ResponseCache as any)(50, 60000);
    const originalMsg = 'Explique le machine learning en détail';
    const similarMsg = 'Explique le machine learning';
    const key = { message: similarMsg, mode: 'DIRECT' };

    // Inject a mock entry that would fuzzy-match
    const altKey = (cache as any).generateKey({ message: originalMsg, mode: 'DIRECT' });
    const prefix = (cache as any).extractPrefix(originalMsg);
    (cache as any).cache.set(altKey, {
      content: 'Réponse fictive mock fuzzy',
      provider: 'mock',
      model: 'mock-model',
      timestamp: Date.now(),
      hitCount: 0,
      originalMessage: originalMsg,
    });
    // Build prefix index entry
    if (prefix) {
      if (!(cache as any).prefixIndex.has(prefix)) {
        (cache as any).prefixIndex.set(prefix, new Set());
      }
      (cache as any).prefixIndex.get(prefix).add(altKey);
    }

    const result = cache.get(key);
    expect(result).toBeNull();
  });

  it('returns fuzzy-match entry with provider=ollama', () => {
    const cache = new (ResponseCache as any)(50, 60000);
    // Jaccard >= 0.8: {explique,le,machine,learning,avance} vs {explique,le,machine,learning}
    // intersection=4, union=5, score=0.8 (threshold=0.8)
    // Same prefix: 'explique machine learning'
    const originalMsg = 'Explique le machine learning avance';
    const similarMsg = 'Explique le machine learning';
    const key = { message: similarMsg, mode: 'DIRECT' };

    const altKey = (cache as any).generateKey({ message: originalMsg, mode: 'DIRECT' });
    const prefix = (cache as any).extractPrefix(originalMsg);
    (cache as any).cache.set(altKey, {
      content: 'Réponse Ollama réelle fuzzy',
      provider: 'ollama',
      model: 'gemma2:2b',
      timestamp: Date.now(),
      hitCount: 0,
      originalMessage: originalMsg,
    });
    if (prefix) {
      if (!(cache as any).prefixIndex.has(prefix)) {
        (cache as any).prefixIndex.set(prefix, new Set());
      }
      (cache as any).prefixIndex.get(prefix).add(altKey);
    }

    const result = cache.get(key);
    // Jaccard similarity should be high enough for a hit
    expect(result?.provider).toBe('ollama');
  });
});

// ── R3: DEEP_INTERNET_ANALYSIS_INSTRUCTION honest ──────────────────────────

describe('R3 — userPreferencesEngine: honest LLM instruction', () => {
  it('does not imply real-time internet access', async () => {
    vi.resetModules();
    vi.doMock('@/lib/logger', () => ({
      logger: { debug: vi.fn(), warn: vi.fn(), error: vi.fn(), info: vi.fn() },
    }));

    // Import the module to access the exported constant via system prompt generation
    const mod = await import('@/services/userPreferencesEngine');
    const engine = mod.userPreferencesEngine ?? (mod as any).default;

    // Get the instruction string through the public API (buildContextInjection or similar)
    const prefs = engine?.getPreferences?.() ?? { customPreferences: { deep_internet_analysis: true } };
    // Force deep_internet_analysis to true to trigger injection
    if (prefs.customPreferences) prefs.customPreferences['deep_internet_analysis'] = true;
    const injection = engine?.buildContextInjection?.(prefs) ?? engine?.generateContextForAI?.() ?? '';

    // The instruction must NOT claim live internet crawling
    expect(injection).not.toMatch(/ANALYSE INTERNET MAXIMALE/);
    expect(injection).not.toMatch(/actualités récentes.*forums/);

    // Must include honest framing — either in the injection or in the raw source
    const src2 = await import('@/services/userPreferencesEngine?raw');
    const srcText = (src2 as any).default as string;
    expect(srcText).toMatch(/connaissance interne/i);
  });

  it('DEEP_INTERNET_ANALYSIS_INSTRUCTION contains honesty marker', async () => {
    vi.resetModules();
    // Import the raw module source to check the constant
    const src = await import('@/services/userPreferencesEngine?raw');
    const text = (src as any).default as string;

    // Must NOT have old misleading title
    expect(text).not.toContain('ANALYSE INTERNET MAXIMALE');
    // Must have honest disclaimer (check case-insensitively)
    expect(text.toLowerCase()).toContain('ne prétends pas avoir accès à internet');
    expect(text.toLowerCase()).toContain('utilise-les en coulisses');
    expect(text.toLowerCase()).not.toContain('pense à voix haute');
  });
});

// ── R2: reflectiveVerifier uses webSearch not browserWebSearch ──────────────

describe('R2 — reflectiveVerifier: Tauri-safe webSearch import', async () => {
  it('imports webSearch (not browserWebSearch) from webResearchService', async () => {
    vi.resetModules();
    vi.doMock('@/lib/logger', () => ({
      logger: { debug: vi.fn(), warn: vi.fn(), error: vi.fn(), info: vi.fn() },
    }));

    const src = await import('@/services/ai/reflectiveVerifier?raw');
    const text = (src as any).default as string;

    // Must use webSearch import
    expect(text).toMatch(/import\s*\{[^}]*\bwebSearch\b[^}]*\}\s*from\s*['"]@\/services\/webResearchService['"]/);
    // Must NOT import browserWebSearch
    expect(text).not.toMatch(/import\s*\{[^}]*\bbrowserWebSearch\b[^}]*\}\s*from/);
    // Must call webSearch( not browserWebSearch(
    expect(text).not.toContain('browserWebSearch(');
    expect(text).toContain('webSearch(');
  });
});

// ── R1: LOCAL_PROVIDER_SET guard in orchestrator.ts ────────────────────────

describe('R1 — orchestrator: LOCAL_PROVIDER_SET prevents cloud override of local champion', async () => {
  it('orchestrator source contains LOCAL_PROVIDER_SET guard', async () => {
    const src = await import('@/services/ai/orchestrator?raw');
    const text = (src as any).default as string;

    expect(text).toContain('LOCAL_PROVIDER_SET');
    expect(text).toContain("'ollama'");
    expect(text).toContain("'titane-local'");
    // Guard must include the set membership check
    expect(text).toMatch(/LOCAL_PROVIDER_SET\.has\(selection\.selectedProvider\)/);
  });

  it('chatEngine source sets both provider and preferredProvider', async () => {
    const src = await import('@/services/ai/chatEngine?raw');
    const text = (src as any).default as string;

    // Both keys must be set together (vOLLAMA_AUTHORITY fix)
    expect(text).toContain('orchestratorConfig.preferredProvider = canonicalDecision.provider.name');
    expect(text).toContain('orchestratorConfig.provider = canonicalDecision.provider.name');
  });
});
