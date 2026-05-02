/**
 * TITANE∞ — Kallok's Arts mode runtime validation
 * Rule 16: new integration must ship with dedicated tests
 */
import { describe, expect, it } from 'vitest';

import {
  CHAT_MODES_CONFIG,
  MODES_BY_CATEGORY,
  ACTIVE_MODE_IDS,
} from '@/services/ai/chatModes.config';
import { BUILT_IN_MODES } from '@/hooks/useChatModes';

describe("Kallok's Arts mode — identity & config", () => {
  const mode = CHAT_MODES_CONFIG.kalloks_arts;

  it('mode config exists and is enabled', () => {
    expect(mode).toBeDefined();
    expect(mode.enabled).toBe(true);
  });

  it('identity fields match Kallok palette and persona', () => {
    expect(mode.id).toBe('kalloks_arts');
    expect(mode.label).toBe("Kallok's Arts");
    expect(mode.icon).toBe('🎨');
    expect(mode.themeColor).toBe('#C4704A'); // terracotta palette
    expect(mode.category).toBe('creative');
  });

  it('AI parameters are tuned for high creativity', () => {
    expect(mode.temperature).toBe(0.92);
    expect(mode.maxTokens).toBe(4000);
    expect(mode.responseStyle).toBe('creative');
    expect(mode.tone).toBe('artistic');
  });

  it('memory scope is global for Kallok context persistence', () => {
    expect(mode.memoryScope).toBe('global');
    expect(mode.profileId).toBe('kallok_artist');
  });

  it('engines include cognitive, creative and memory', () => {
    expect(mode.enginesEnabled).toContain('cognitive');
    expect(mode.enginesEnabled).toContain('creative');
    expect(mode.enginesEnabled).toContain('memory');
  });

  it('sortOrder places mode near top of creative category', () => {
    expect(mode.sortOrder).toBeLessThan(10);
  });
});

describe("Kallok's Arts mode — 9 capabilities (skills)", () => {
  const { capabilities } = CHAT_MODES_CONFIG.kalloks_arts;

  it('has all 9 artistic skills', () => {
    expect(capabilities).toContain('poetry-generation');
    expect(capabilities).toContain('art-description');
    expect(capabilities).toContain('creative-writing');
    expect(capabilities).toContain('collection-concepts');
    expect(capabilities).toContain('product-copy-art');
    expect(capabilities).toContain('artistic-storytelling');
    expect(capabilities).toContain('visual-conceptualization');
    expect(capabilities).toContain('title-generation');
    expect(capabilities).toContain('artist-bio');
  });

  it('has exactly 9 capabilities (no capability drift)', () => {
    expect(capabilities).toHaveLength(9);
  });
});

describe("Kallok's Arts mode — system prompt quality gates", () => {
  const { systemPrompt } = CHAT_MODES_CONFIG.kalloks_arts;

  it('contains Kallok identity anchors', () => {
    expect(systemPrompt).toContain("KALLOK'S ARTS");
    expect(systemPrompt).toContain('artiste du vivant');
    expect(systemPrompt).toContain('Brûlure');
    expect(systemPrompt).toContain('présence');
  });

  it('contains 5-phase creative protocol', () => {
    expect(systemPrompt).toContain("ÉTAT D'ÂME");
    expect(systemPrompt).toContain('MATIÈRE BRUTE');
    expect(systemPrompt).toContain('RAFFINEMENT');
    expect(systemPrompt).toContain('ŒUVRE');
  });

  it('contains rejection rules (anti-generic gates)', () => {
    expect(systemPrompt).toContain('REJET CRÉATIF');
    expect(systemPrompt).toContain('JAMAIS');
    expect(systemPrompt).toContain('beauté éternelle');
  });

  it('contains constraint library', () => {
    expect(systemPrompt).toContain('CONTRAINTES LIBÉRATRICES');
    expect(systemPrompt).toContain('17 syllabes');
  });

  it('contains seed images for creative unblocking', () => {
    expect(systemPrompt).toContain('SEED IMAGES');
    expect(systemPrompt).toContain('sable dans un verre');
  });

  it('contains synesthesia instructions for canvas', () => {
    expect(systemPrompt).toContain('SYNESTHÉSIE CANVAS');
    expect(systemPrompt).toContain('35-50%');
  });

  it('contains Etsy SEO templates with 2025-26 keywords', () => {
    expect(systemPrompt).toContain('TEMPLATES ETSY');
    expect(systemPrompt).toContain('canvas-boho-abstract');
    expect(systemPrompt).toContain('canvas-made-canada');
  });

  it('contains artist bio templates', () => {
    expect(systemPrompt).toContain('TEMPLATES BIO ARTISTE');
    expect(systemPrompt).toContain('150 mots');
    expect(systemPrompt).toContain('400 mots');
  });

  it('contains refinement loop quick-actions', () => {
    expect(systemPrompt).toContain('REFINEMENT LOOP');
    expect(systemPrompt).toContain('Intensifier');
    expect(systemPrompt).toContain('Synesthésie');
  });

  it('contains Kallok palette colors', () => {
    expect(systemPrompt).toContain('#C4704A');
    expect(systemPrompt).toContain('#2D2D2D');
    expect(systemPrompt).toContain('#F8F5F0');
  });

  it('system prompt is substantial (not a stub)', () => {
    expect(systemPrompt.length).toBeGreaterThan(4000);
  });
});

describe("Kallok's Arts mode — registry integration", () => {
  it('is in ACTIVE_MODE_IDS', () => {
    expect(ACTIVE_MODE_IDS).toContain('kalloks_arts');
  });

  it('is in creative category', () => {
    expect(MODES_BY_CATEGORY.creative).toContain('kalloks_arts');
  });

  it('is in BUILT_IN_MODES for UI picker visibility', () => {
    const found = BUILT_IN_MODES.find(m => m.id === 'kalloks_arts');
    expect(found).toBeDefined();
    expect(found?.icon).toBe('🎨');
    expect(found?.name).toBe("Kallok's Arts");
  });

  it('total creative modes count includes kalloks_arts', () => {
    expect(MODES_BY_CATEGORY.creative.length).toBeGreaterThanOrEqual(4);
  });
});

describe("Kallok's Arts mode — type safety", () => {
  const mode = CHAT_MODES_CONFIG.kalloks_arts;

  it('responseStyle is a valid ResponseStyle value', () => {
    const validStyles = ['concise', 'moderate', 'detailed', 'exhaustive', 'creative'];
    expect(validStyles).toContain(mode.responseStyle);
  });

  it('tone is a valid CommunicationTone value', () => {
    const validTones = [
      'professional',
      'empathetic',
      'neutral',
      'technical',
      'motivational',
      'analytical',
      'artistic',
    ];
    expect(validTones).toContain(mode.tone);
  });

  it('permissionLevel is valid (0-5)', () => {
    expect(mode.permissionLevel).toBeGreaterThanOrEqual(0);
    expect(mode.permissionLevel).toBeLessThanOrEqual(5);
    expect(mode.permissionLevel).toBe(1); // accessible sans permission spéciale
  });
});
