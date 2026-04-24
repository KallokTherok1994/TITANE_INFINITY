import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
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
        chat: {
          id: 'chat',
          label: 'Chat IA',
          description: 'Interactions conversationnelles',
          xp: 100,
          level: 1,
          category: 'cognitive',
          lastUpdated: Date.now(),
          icon: '💬',
        },
      },
      history: [
        {
          id: 'evt-1',
          domainId: 'chat',
          amount: 5,
          source: 'chat_message',
          timestamp: Date.now(),
        },
        {
          id: 'evt-2',
          domainId: 'chat',
          amount: 8,
          source: 'chat_quality_bonus',
          timestamp: Date.now(),
        },
        {
          id: 'evt-3',
          domainId: 'cognitive',
          amount: 5,
          source: 'chat_titane_response',
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
      {
        id: 'chat',
        label: 'Chat IA',
        description: 'Interactions conversationnelles',
        xp: 100,
        level: 1,
        category: 'cognitive',
        lastUpdated: Date.now(),
        icon: '💬',
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
    expect(screen.getAllByTestId('experience-history-item')).toHaveLength(3);
    expect(screen.getByTestId('experience-runtime-source')).toHaveTextContent(
      /Tauri IPC \+ localStorage fallback/i
    );
    expect(screen.getByTestId('experience-total-xp')).toHaveTextContent('245');
    expect(screen.getByTestId('experience-level')).toHaveTextContent('1');
    expect(screen.getByTestId('experience-chat-sync-summary')).toBeInTheDocument();
    expect(screen.getByTestId('experience-chat-xp-total')).toHaveTextContent('+18 XP');
    expect(screen.getByTestId('experience-chat-event-count')).toHaveTextContent(
      '3 gains'
    );
    expect(screen.getByTestId('experience-chat-last-gain')).toHaveTextContent('+5 XP');
  });

  it('filtre les événements XP générés par le chat', () => {
    renderWithProviders(<Experience />);

    expect(screen.getAllByTestId('experience-history-item')).toHaveLength(3);

    fireEvent.click(screen.getByTestId('experience-filter-chat_quality_bonus'));

    expect(screen.getAllByTestId('experience-history-item')).toHaveLength(1);
    expect(screen.getByTestId('experience-history-item')).toHaveTextContent('+8 XP');
    expect(screen.getByTestId('experience-history-item')).toHaveTextContent(
      /Bonus qualité/i
    );
  });
});
