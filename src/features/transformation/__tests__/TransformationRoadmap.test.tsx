/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransformationRoadmap } from '../TransformationRoadmap';

describe('TransformationRoadmap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<TransformationRoadmap />);
    expect(screen.getByText(/roadmap de transformation/i)).toBeTruthy();
  });

  it('should display status filters', () => {
    render(<TransformationRoadmap />);

    expect(
      screen.getByRole('button', {
        name: 'Afficher tous les milestones de la roadmap',
      })
    ).toBeTruthy();

    expect(
      screen.getByRole('button', { name: 'Filtrer par statut: Complété' })
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Filtrer par statut: En cours' })
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Filtrer par statut: Planifié' })
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Filtrer par statut: Futur' })
    ).toBeTruthy();
  });

  it('should filter milestones by status', async () => {
    render(<TransformationRoadmap />);

    const completedButton = screen.getByRole('button', {
      name: 'Filtrer par statut: Complété',
    });

    fireEvent.click(completedButton);
    await waitFor(() => {
      expect(completedButton.classList.contains('active')).toBe(true);
    });
  });

  it('should display all mock milestones', () => {
    render(<TransformationRoadmap />);

    const milestones = document.querySelectorAll('.milestone-item');
    expect(milestones.length).toBeGreaterThan(0);
  });

  it('should show milestone details on click', async () => {
    render(<TransformationRoadmap />);

    const firstMilestoneCard = document.querySelectorAll('.milestone-card')[0] as
      | HTMLElement
      | undefined;

    if (firstMilestoneCard) {
      fireEvent.click(firstMilestoneCard);

      await waitFor(() => {
        expect(screen.getByText(/features clés/i)).toBeTruthy();
      });
    }
  });

  it('should display version badges correctly', () => {
    render(<TransformationRoadmap />);

    // Should have version numbers like v25.0, v26.0, etc.
    const versionBadges = document.querySelectorAll('.milestone-version');
    expect(versionBadges.length).toBeGreaterThan(0);
  });

  it('should show progress bars for non-future milestones', () => {
    render(<TransformationRoadmap />);

    const progressBars = document.querySelectorAll('.progress-bar-fill');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('should display connector lines between milestones', () => {
    render(<TransformationRoadmap />);

    const connectors = document.querySelectorAll('.milestone-connector');
    expect(connectors.length).toBeGreaterThan(0);
  });

  it('should show quarter information for each milestone', () => {
    render(<TransformationRoadmap />);

    expect(screen.getAllByText(/Q[1-4] 202[4-5]/i).length).toBeGreaterThan(0);
  });

  it('should display features count', () => {
    render(<TransformationRoadmap />);

    expect(screen.getAllByText(/\d+\s*features/i).length).toBeGreaterThan(0);
  });

  it('should show importance badges in details panel', async () => {
    render(<TransformationRoadmap />);

    const firstMilestoneCard = document.querySelectorAll('.milestone-card')[0] as
      | HTMLElement
      | undefined;

    if (firstMilestoneCard) {
      fireEvent.click(firstMilestoneCard);

      await waitFor(() => {
        expect(screen.getByText(/importance:/i)).toBeTruthy();
      });
    }
  });

  it('should display roadmap stats', () => {
    render(<TransformationRoadmap />);

    const stats = screen.getByTestId('roadmap-stats');
    expect(stats).toBeTruthy();

    const statsText = stats.textContent || '';
    expect(statsText).toMatch(/Total Milestones/i);
    expect(statsText).toMatch(/Complétés/i);
    expect(statsText).toMatch(/En cours/i);
    expect(statsText).toMatch(/Planifiés/i);
  });

  it('should highlight selected milestone', async () => {
    render(<TransformationRoadmap />);

    const secondMilestoneCard = document.querySelectorAll('.milestone-card')[1] as
      | HTMLElement
      | undefined;

    if (secondMilestoneCard) {
      fireEvent.click(secondMilestoneCard);

      await waitFor(() => {
        const milestoneItem = secondMilestoneCard.closest('.milestone-item');
        expect(milestoneItem).toHaveClass('selected');
      });
    }
  });

  it('should show status badges with correct colors', () => {
    render(<TransformationRoadmap />);

    const statusBadges = document.querySelectorAll('.milestone-status-badge');
    statusBadges.forEach(badge => {
      const styleAttr = badge.getAttribute('style') || '';
      expect(styleAttr).toMatch(/background:/);
      expect(styleAttr).toMatch(/color:/);
    });
  });

  it('should reset filters when "Tous" is clicked', async () => {
    render(<TransformationRoadmap />);

    // Filter first
    const plannedButton = screen.getByRole('button', {
      name: 'Filtrer par statut: Planifié',
    });
    fireEvent.click(plannedButton);

    // Then reset
    const allButton = screen.getByRole('button', {
      name: 'Afficher tous les milestones de la roadmap',
    });
    fireEvent.click(allButton);

    await waitFor(() => {
      expect(allButton.classList.contains('active')).toBe(true);
    });
  });

  it('should be operable via accessible button names', () => {
    render(<TransformationRoadmap />);

    expect(
      screen.getByRole('button', {
        name: 'Afficher tous les milestones de la roadmap',
      })
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Filtrer par statut: Complété' })
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Filtrer par statut: En cours' })
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Filtrer par statut: Planifié' })
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Filtrer par statut: Futur' })
    ).toBeTruthy();
  });

  it('should handle custom milestones prop', () => {
    const customMilestones = [
      {
        id: 'custom-1',
        version: 'v99.0',
        name: 'Custom Milestone',
        description: 'Test milestone',
        status: 'completed' as const,
        progress: 100,
        features: ['Feature 1', 'Feature 2'],
        quarter: 'Q1 2099',
        importance: 'high' as const,
      },
    ];

    render(<TransformationRoadmap milestones={customMilestones} />);
    expect(screen.getByText(/Custom Milestone/i)).toBeTruthy();
  });
});
