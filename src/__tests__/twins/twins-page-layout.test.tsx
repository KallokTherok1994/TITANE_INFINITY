import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TwinsPage } from '@/pages/TwinsPage';

vi.mock('@/components/twin/TwinEvolutionPanel', () => ({
  TwinEvolutionPanel: () => <div data-testid="twin-evolution-panel">Twin evolution panel</div>,
}));

vi.mock('@/hooks/useTwinIdentity', () => ({
  useTwinIdentity: () => ({
    identity: {
      name: 'TITANE',
      signature: 'Twin signature',
    },
    isLoading: false,
    coreValues: [{ name: 'Clarity' }],
    humanStyle: {
      calmPrecision: 0.92,
      organicFluidity: 0.88,
      sincerity: 0.95,
    },
    fusionIndex: 0.84,
    refresh: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('@/hooks/useTwinEvolution', () => ({
  useTwinEvolution: () => ({
    evolutionProfile: { level: 'stable' },
    fusionIndex: 0.84,
    syncScore: 0.91,
    currentPhase: 'Integration',
    chatContextStatus: 'active',
    growthTrends: {
      coherence: 0.92,
      empathy: 0.89,
    },
    ownerThemes: ['Alignment'],
    sourceCount: 6,
    isLoading: false,
    refresh: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe('TwinsPage layout contract', () => {
  it('keeps the dedicated TWINS surface stretchable so the AppShell scroll host can scroll it', () => {
    render(<TwinsPage />);

    const page = screen.getByTestId('page-twins');

    expect(page.className).toContain('twins-root');
    expect(page.className).toContain('flex');
    expect(page.className).toContain('flex-col');
    expect(page.className).toContain('min-h-full');
    expect(page.className).toContain('w-full');
  });
});
