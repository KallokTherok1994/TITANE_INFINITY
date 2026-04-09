import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryEvolutionSection } from '@/components/sections/MemoryEvolutionSection';

const detectEnvironmentMock = vi.hoisted(() => vi.fn());

vi.mock('@/core/tauri/environment', () => ({
  detectEnvironment: detectEnvironmentMock,
}));

vi.mock('@/components/MemoryEvolution/MemoryEvolutionCenter', () => ({
  default: () => <div data-testid="memory-evolution-center">mock-memory-evolution-center</div>,
}));

vi.mock('@/features/evolution/EvolutionTimeline', () => ({
  EvolutionTimeline: () => <div data-testid="evolution-timeline">mock-evolution-timeline</div>,
}));

vi.mock('@/ui', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/design-system', () => ({
  TSectionHeader: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  ),
}));

vi.mock('@themes/tokens', () => ({
  colors: { neutral: { 400: '#999' } },
  spacing: { 4: '1rem' },
  fontSizes: { sm: '0.875rem' },
}));

describe('MemoryEvolutionSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes a stable root marker and browser fallback state outside Tauri', async () => {
    detectEnvironmentMock.mockReturnValue({ isTauri: false });

    render(<MemoryEvolutionSection />);

    expect(screen.getByTestId('memory-evolution-section-root')).toHaveAttribute(
      'data-memory-evolution-mode',
      'browser'
    );
    expect(screen.getByText(/disponible en mode tauri uniquement/i)).toBeInTheDocument();
    expect(await screen.findByTestId('evolution-timeline')).toBeInTheDocument();
  });

  it('exposes a stable root marker and Tauri state when the live center is available', async () => {
    detectEnvironmentMock.mockReturnValue({ isTauri: true });

    render(<MemoryEvolutionSection />);

    expect(screen.getByTestId('memory-evolution-section-root')).toHaveAttribute(
      'data-memory-evolution-mode',
      'tauri'
    );
    expect(await screen.findByTestId('memory-evolution-center')).toBeInTheDocument();
  });
});
