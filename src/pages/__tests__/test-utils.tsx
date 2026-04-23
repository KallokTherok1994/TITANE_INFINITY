import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AnimationProvider } from '../../contexts/AnimationContext';

// Permet d'injecter AnimationProvider autour du composant testé
export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(<AnimationProvider>{ui}</AnimationProvider>, options);
}
