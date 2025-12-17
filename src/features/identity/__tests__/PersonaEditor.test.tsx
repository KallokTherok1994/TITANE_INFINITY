/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { PersonaEditor } from '../PersonaEditor';

describe('PersonaEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<PersonaEditor />);
    expect(screen.getByText(/éditeur de persona/i)).toBeInTheDocument();
  });

  it('should display tone presets', () => {
    render(<PersonaEditor />);

    const presetsContainer = document.querySelector('.tone-presets');
    expect(presetsContainer).not.toBeNull();

    const presets = within(presetsContainer as HTMLElement);
    expect(presets.getByText('Équilibré')).toBeInTheDocument();
    expect(presets.getByText('Formel')).toBeInTheDocument();
    expect(presets.getByText('Décontracté')).toBeInTheDocument();
    expect(presets.getByText('Technique')).toBeInTheDocument();
    expect(presets.getByText('Créatif')).toBeInTheDocument();
    expect(presets.getByText('Amical')).toBeInTheDocument();
  });

  it('should select tone preset on click', async () => {
    render(<PersonaEditor />);

    const casualPresetButton = screen.getByRole('button', { name: /décontracté/i });
    fireEvent.click(casualPresetButton);

    await waitFor(() => {
      expect(casualPresetButton).toHaveClass('active');
    });
  });

  it('should display all 4 personality sliders', () => {
    render(<PersonaEditor />);

    expect(screen.getByText(/formalité/i)).toBeInTheDocument();
    expect(screen.getByText(/créativité/i)).toBeInTheDocument();
    expect(screen.getByText(/empathie/i)).toBeInTheDocument();
    expect(screen.getByText(/technicité/i)).toBeInTheDocument();

    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(4);
  });

  it('should update slider value on change', async () => {
    render(<PersonaEditor />);

    const sliders = screen.getAllByRole('slider') as HTMLInputElement[];
    const formalitySlider = sliders[0];
    fireEvent.change(formalitySlider, { target: { value: '75' } });

    await waitFor(() => {
      expect(formalitySlider.value).toBe('75');
    });
  });

  it('should display verbosity options', () => {
    render(<PersonaEditor />);

    expect(screen.getByLabelText(/concis/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/équilibré/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/détaillé/i)).toBeInTheDocument();
  });

  it('should display explanation level options', () => {
    render(<PersonaEditor />);

    expect(screen.getByLabelText(/minimales/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/modérées/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/étendues/i)).toBeInTheDocument();
  });

  it('should toggle emoji checkbox', async () => {
    render(<PersonaEditor />);

    const emojiCheckbox = screen.getByLabelText(
      /utiliser des emojis/i
    ) as HTMLInputElement;
    const initialState = emojiCheckbox.checked;

    fireEvent.click(emojiCheckbox);

    await waitFor(() => {
      expect(emojiCheckbox.checked).toBe(!initialState);
    });
  });

  it('should toggle code examples checkbox', async () => {
    render(<PersonaEditor />);

    const codeCheckbox = screen.getByLabelText(
      /inclure des exemples de code/i
    ) as HTMLInputElement;
    const initialState = codeCheckbox.checked;

    fireEvent.click(codeCheckbox);

    await waitFor(() => {
      expect(codeCheckbox.checked).toBe(!initialState);
    });
  });

  it('should display live preview panel', () => {
    render(<PersonaEditor />);
    expect(screen.getByText(/aperçu du style/i)).toBeInTheDocument();
  });

  it('should update preview when settings change', async () => {
    render(<PersonaEditor />);

    const creativePresetButton = screen.getByRole('button', { name: /créatif/i });
    fireEvent.click(creativePresetButton);

    await waitFor(() => {
      expect(screen.getByText(/aperçu du style/i)).toBeInTheDocument();
    });
  });

  it('should enable save button when changes are made', async () => {
    render(<PersonaEditor />);

    const sliders = screen.getAllByRole('slider') as HTMLInputElement[];
    fireEvent.change(sliders[0], { target: { value: '80' } });

    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: /sauvegarder/i });
      expect(saveButton).not.toBeDisabled();
    });
  });

  it('should reset settings on reset button click', async () => {
    render(<PersonaEditor />);

    const sliders = screen.getAllByRole('slider') as HTMLInputElement[];
    const formalitySlider = sliders[0];
    const originalValue = formalitySlider.value;

    fireEvent.change(formalitySlider, { target: { value: '90' } });

    const resetButton = screen.getByRole('button', { name: /réinitialiser/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(formalitySlider.value).toBe(originalValue);
    });
  });

  it('should have accessible ARIA labels on all interactive elements', () => {
    render(<PersonaEditor />);

    expect(screen.getAllByRole('slider').length).toBe(4);
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });
});
