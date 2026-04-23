import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import { Experience } from '../Experience';

vi.mock('../../hooks/useExperience', () => ({
  useExperience: () => ({
    state: {
      totalXp: 245,
      level: 1,
      domains: {
        cognitive: {
          id: 'cognitive',
          label: 'Cognition',
          description: 'Analyse',
          xp: 145,
          level: 1,
          category: 'cognitive',
          lastUpdated: Date.now(),
          icon: '🧠',
        },
      },
      history: [
        {
          id: 'evt-1',
          domainId: 'cognitive',
          amount: 25,
          source: 'chat_message',
          timestamp: Date.now(),
        },
      ],
      lastUpdated: Date.now(),
      version: '1.0.0',
    },
    isLoading: false,
    totalXp: 245,
    level: 1,
    xpForNextLevel: 400,
    progress: 0.5,
    domains: [
      {
        id: 'cognitive',
        label: 'Cognition',
        description: 'Analyse',
        xp: 145,
        level: 1,
        category: 'cognitive',
        lastUpdated: Date.now(),
        icon: '🧠',
      },
    ],
    getDomainById: vi.fn(),
    award: vi.fn(),
  }),
}));

describe('Experience', () => {
  it('affiche les sections statistiques et historique XP', () => {
    renderWithProviders(<Experience />);

    expect(screen.getByTestId('page-experience')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /statistiques/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /historique xp/i })).toBeInTheDocument();
    expect(screen.getByTestId('experience-stats-advanced')).toBeInTheDocument();
    expect(screen.getByTestId('experience-history-list')).toBeInTheDocument();
    expect(screen.getByTestId('experience-history-item')).toBeInTheDocument();
  });
});
