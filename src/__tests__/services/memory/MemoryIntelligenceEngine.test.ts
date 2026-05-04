/**
 * IT5 — Tests MemoryIntelligenceEngine
 * Vérifie le fix du cast (theme as any).domain → theme.domain dans categorize()
 */
import { describe, expect, it } from 'vitest';
import MemoryIntelligenceEngine from '@/services/memory/MemoryIntelligenceEngine';

describe('MemoryIntelligenceEngine: theme.domain — no (theme as any) cast', () => {
  it('capture() runs categorize without error when content matches a theme domain', async () => {
    const engine = new MemoryIntelligenceEngine();
    // "titane" and "système cognitif" should trigger domain/theme categories in DEFAULT_TAXONOMY
    const result = await engine.capture(
      'TITANE∞ est un système cognitif IA local — architecture Rust + TypeScript.',
      { sourceType: 'chat_message', forceCapture: true }
    );
    // Should produce a valid entry without throwing (theme.domain path exercised)
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('id');
  });

  it('capture() does not throw when content matches multiple themes across domains', async () => {
    const engine = new MemoryIntelligenceEngine();
    const result = await engine.capture(
      'Architecture technique: développement TypeScript, optimisation performance, sécurité réseau.',
      { sourceType: 'chat_message', forceCapture: true }
    );
    expect(result).not.toBeNull();
  });
});
