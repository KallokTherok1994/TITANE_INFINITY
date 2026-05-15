import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TwinsPage } from '@/pages/TwinsPage';

vi.mock('@/hooks/useTwinIdentity', () => ({
  useTwinIdentity: () => ({
    identity: { name: 'Twin', signature: 'sig' },
    isLoading: false,
    coreValues: [{ name: 'Authenticite' }],
    humanStyle: { calmPrecision: 0.7, organicFluidity: 0.6, sincerity: 0.8 },
    fusionIndex: 0.65,
    refresh: vi.fn(),
  }),
}));

vi.mock('@/hooks/useTwinEvolution', () => ({
  useTwinEvolution: () => ({
    evolutionProfile: { active: true },
    fusionIndex: 0.64,
    syncScore: 0.82,
    currentPhase: 'Integration',
    chatContextStatus: 'active',
    growthTrends: { coherence: 0.7 },
    ownerThemes: ['Memoire'],
    sourceCount: 3,
    isLoading: false,
    refresh: vi.fn(),
  }),
}));

vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: vi.fn().mockResolvedValue({ ok: true, content: { harmonia: {} } }),
}));

describe('TwinsPage a11y contrast', () => {
  it('renders owner themes label with hardened contrast token', () => {
    render(
      <MemoryRouter>
        <TwinsPage />
      </MemoryRouter>
    );

    const label = screen.getByText('Thèmes propriétaire');
    expect(label).toHaveClass('text-gray-300');
    expect(label).not.toHaveClass('text-gray-500');
  });
});
