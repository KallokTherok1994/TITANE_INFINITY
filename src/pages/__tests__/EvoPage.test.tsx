/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import { EvoPage } from '../EvoPage';

describe('EvoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche le header EVO', () => {
    renderWithProviders(<EvoPage />);
    expect(screen.getByText(/centre d'évolution totale/i)).toBeInTheDocument();
    expect(screen.getByText(/fusion ultime/i)).toBeInTheDocument();
  });

  it('affiche le tab Transform & Évo', () => {
    renderWithProviders(<EvoPage />);
    expect(screen.getByText(/transform & évo/i)).toBeInTheDocument();
  });

  it("affiche la section Lignes d'Évolution", () => {
    renderWithProviders(<EvoPage />);
    const tab = screen.getByText(/transform & évo/i);
    fireEvent.click(tab);
    expect(screen.getByText(/lignes d'évolution par thème/i)).toBeInTheDocument();
  });

  it('affiche la section Paliers Franchis', () => {
    renderWithProviders(<EvoPage />);
    const tab = screen.getByText(/transform & évo/i);
    fireEvent.click(tab);
    expect(screen.getByText(/paliers franchis/i)).toBeInTheDocument();
  });
});
