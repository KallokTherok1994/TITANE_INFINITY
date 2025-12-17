/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { EvolutionTimeline } from '../EvolutionTimeline';

vi.mock('react-chrono', () => {
  return {
    Chrono: (props: { onItemSelected?: (item: { index: number }) => void }) => (
      <button
        type="button"
        aria-label="chrono-mock"
        onClick={() => props.onItemSelected?.({ index: 0 })}
      >
        ChronoMock
      </button>
    ),
  };
});

describe('EvolutionTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<EvolutionTimeline />);
    expect(
      screen.getByRole('button', { name: /filtrer les événements:\s*tous/i })
    ).toBeInTheDocument();
  });

  it('should display event type filters', () => {
    render(<EvolutionTimeline />);

    expect(
      screen.getByRole('button', { name: /filtrer les événements:\s*tous/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /filtrer les événements:\s*milestones/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /filtrer les événements:\s*consolidations/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /filtrer les événements:\s*achievements/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /filtrer les événements:\s*apprentissages/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /filtrer les événements:\s*optimisations/i,
      })
    ).toBeInTheDocument();
  });

  it('should filter events by type', async () => {
    render(<EvolutionTimeline />);

    const milestoneButton = screen.getByRole('button', { name: /milestones/i });
    fireEvent.click(milestoneButton);

    await waitFor(() => {
      expect(milestoneButton).toHaveClass('active');
    });
  });

  it('should display event counts in filters', () => {
    render(<EvolutionTimeline />);

    // Should show numbers like "Milestone (3)" or similar
    const filterButtons = screen.getAllByRole('button');
    expect(filterButtons.length).toBeGreaterThan(0);
  });

  it('should render react-chrono timeline', () => {
    render(<EvolutionTimeline />);

    // Rendered via mocked Chrono component
    expect(screen.getByRole('button', { name: /chrono-mock/i })).toBeInTheDocument();
  });

  it('should display event details on selection', async () => {
    render(<EvolutionTimeline />);

    fireEvent.click(screen.getByRole('button', { name: /chrono-mock/i }));

    await waitFor(() => {
      expect(screen.getByText(/phase 1:\s*achievements & charts/i)).toBeInTheDocument();

      const detailsPanel = document.querySelector('.event-details-panel');
      expect(detailsPanel).toBeTruthy();
      expect(
        within(detailsPanel as HTMLElement).getByText(/^milestones$/i)
      ).toBeInTheDocument();
    });
  });

  it('should show importance badges', () => {
    render(<EvolutionTimeline />);

    // No details shown until a timeline item is selected
    fireEvent.click(screen.getByRole('button', { name: /chrono-mock/i }));
    expect(screen.getByText(/critique|haute|moyenne|faible/i)).toBeInTheDocument();
  });

  it('should display mock events correctly', () => {
    render(<EvolutionTimeline />);

    // Stats reflect that some events exist
    expect(screen.getByText(/événements/i)).toBeInTheDocument();
  });

  it('should reset filters when "All" is clicked', async () => {
    render(<EvolutionTimeline />);

    // Filter first
    const achievementButton = screen.getByRole('button', { name: /achievements/i });
    fireEvent.click(achievementButton);

    // Then reset
    const allButton = screen.getByRole('button', { name: /tous/i });
    fireEvent.click(allButton);

    await waitFor(() => {
      expect(allButton).toHaveClass('active');
    });
  });

  it('should handle empty state gracefully', () => {
    render(<EvolutionTimeline events={[]} />);

    expect(screen.getByText(/aucun événement/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /réinitialiser les filtres/i })
    ).toBeInTheDocument();
  });

  it('should have accessible ARIA labels', () => {
    render(<EvolutionTimeline />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
    });
  });
});
