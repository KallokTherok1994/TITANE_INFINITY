import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  OWNER_TWIN_RESONANCE,
  persistTwinChatContextSnapshot,
} from '@/services/api/numericTwin';

describe('numericTwin owner portrait contract', () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('keeps the owner portrait on the local fallback asset', () => {
    expect(OWNER_TWIN_RESONANCE.portraitUrl).toBe('/kevin-owner-portrait.svg');
    expect(OWNER_TWIN_RESONANCE.portraitFallbackUrl).toBe('/kevin-owner-portrait.svg');
  });

  it('persists the local owner portrait into the chat context snapshot', () => {
    persistTwinChatContextSnapshot({
      state: {
        identityCore: 'presence',
        valueMap: ['clarte'],
        cognitivePatterns: ['structure'],
        therapeuticModel: ['retour-au-centre'],
        creativeSignature: ['oeuvre-vivante'],
      } as never,
      fusion: {
        globalScore: 0.91,
        trend: 'stable',
        valueAlignment: 0.9,
        cognitiveAlignment: 0.92,
        styleAlignment: 0.88,
        therapeuticAlignment: 0.9,
        creativeAlignment: 0.94,
        evolutionAlignment: 0.89,
      } as never,
      profile: {
        currentPhase: 'integration',
        syncScore: 0.93,
      } as never,
    });

    const snapshot = window.localStorage.getItem('titane_twin_fusion_v1');
    expect(snapshot).not.toBeNull();

    const parsed = JSON.parse(snapshot as string) as {
      portraitUrl: string;
      portraitFallbackUrl: string;
    };

    expect(parsed.portraitUrl).toBe('/kevin-owner-portrait.svg');
    expect(parsed.portraitFallbackUrl).toBe('/kevin-owner-portrait.svg');
  });
});