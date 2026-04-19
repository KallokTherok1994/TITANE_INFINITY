import { describe, expect, it } from 'vitest';

import {
  TITANE_DEFAULT_PROMPT_BLOCK,
  TITANE_IDENTITY_KERNEL,
  TITANE_IDENTITY_KERNEL_CATEGORY,
} from '@/services/ai/titaneIdentityKernel';

describe('titaneIdentityKernel', () => {
  it('exposes a prompt block derived from the canonical identity kernel', () => {
    expect(TITANE_IDENTITY_KERNEL_CATEGORY).toBe('titane_identity_kernel_v31');
    expect(TITANE_DEFAULT_PROMPT_BLOCK).toContain('Architecte de coherence vivante');
    expect(TITANE_DEFAULT_PROMPT_BLOCK).toContain(
      'Toujours reduire le bruit avant d ajouter de la structure.'
    );
    expect(TITANE_DEFAULT_PROMPT_BLOCK).toContain(
      'Source structuree: titane_identity_kernel_v31@v30.1.35'
    );
  });

  it('keeps a reusable persona seed aligned with the public kernel', () => {
    expect(TITANE_IDENTITY_KERNEL.persona_seed.tone).toBe(
      'Lucide, structurant, humain, sobre'
    );
    expect(TITANE_IDENTITY_KERNEL.persona_seed.signature_phrases).toContain(
      'Voici l axe reel'
    );
    expect(TITANE_IDENTITY_KERNEL.conversation_contract.default_shape).toEqual([
      'diagnostic',
      'axe',
      'protocole',
      'action simple',
    ]);
  });
});