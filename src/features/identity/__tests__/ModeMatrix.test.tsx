/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModeMatrix } from '../ModeMatrix';

describe('ModeMatrix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<ModeMatrix />);
    expect(screen.getByText(/modes débloqués:/i)).toBeInTheDocument();
  });

  it('should display all 36 modes', () => {
    render(<ModeMatrix />);
    const modeCards = screen.getAllByTestId(/mode-card/i);
    expect(modeCards).toHaveLength(36);
  });

  it('should display all 6 categories', () => {
    render(<ModeMatrix />);
    expect(
      screen.getByRole('button', { name: /filtrer par catégorie:\s*création/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /filtrer par catégorie:\s*analyse/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /filtrer par catégorie:\s*communication/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /filtrer par catégorie:\s*optimisation/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /filtrer par catégorie:\s*apprentissage/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /filtrer par catégorie:\s*leadership/i })
    ).toBeInTheDocument();
  });

  it('should filter modes by category', async () => {
    render(<ModeMatrix />);

    const creationButton = screen.getByRole('button', {
      name: /filtrer par catégorie:\s*création/i,
    });
    fireEvent.click(creationButton);

    await waitFor(() => {
      const visibleModes = screen.getAllByTestId(/mode-card/i);
      expect(visibleModes.length).toBeLessThan(36);
    });
  });

  it('should select a mode on click', async () => {
    render(<ModeMatrix />);

    const designerCard = screen.getByTestId('mode-card-designer');
    fireEvent.click(designerCard);

    await waitFor(() => {
      expect(screen.getByText(/activer ce mode/i)).toBeInTheDocument();
    });
  });

  it('should display mode details when selected', async () => {
    render(<ModeMatrix />);

    const designerCard = screen.getByTestId('mode-card-designer');
    fireEvent.click(designerCard);

    await waitFor(() => {
      expect(screen.getByText(/activer ce mode/i)).toBeInTheDocument();
    });
  });

  it('should show locked overlay for locked modes', () => {
    render(<ModeMatrix />);
    const lockedModes = screen.getAllByTestId(/lock-overlay/i);
    expect(lockedModes.length).toBeGreaterThan(0);
  });

  it('should activate mode when "Activate Mode" button is clicked', async () => {
    render(<ModeMatrix />);

    const mentorCard = screen.getByTestId('mode-card-mentor');
    fireEvent.click(mentorCard);

    await waitFor(() => {
      const activateButton = screen.getByRole('button', {
        name: /activer le mode\s+mentor/i,
      });
      expect(activateButton).toBeInTheDocument();
      fireEvent.click(activateButton);
    });
  });

  it('should reset filters to show all modes', async () => {
    render(<ModeMatrix />);

    // Click category filter
    const analysisButton = screen.getByRole('button', {
      name: /filtrer par catégorie:\s*analyse/i,
    });
    fireEvent.click(analysisButton);

    // Click "All" to reset
    const allButton = screen.getByRole('button', {
      name: /filtrer par catégorie:\s*tous/i,
    });
    fireEvent.click(allButton);

    await waitFor(() => {
      const allModes = screen.getAllByTestId(/mode-card/i);
      expect(allModes).toHaveLength(36);
    });
  });

  it('should display mode level badges correctly', () => {
    render(<ModeMatrix />);

    // Check for different levels
    expect(
      screen.getAllByText(/débutant|intermédiaire|avancé|expert/i).length
    ).toBeGreaterThan(0);
  });

  it('should have accessible ARIA labels', () => {
    render(<ModeMatrix />);

    const categoryFilters = screen.getAllByRole('button');
    categoryFilters.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
    });
  });
});
