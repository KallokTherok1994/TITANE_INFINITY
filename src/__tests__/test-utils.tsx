/**
 * Test Utilities - Helpers pour rendering avec providers
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { AnimationProvider } from '@/contexts/AnimationContext';

interface ProvidersWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper avec AnimationProvider (requis pour certains composants)
 */
function ProvidersWrapper({ children }: ProvidersWrapperProps) {
  return (
    <AnimationProvider>
      {children}
    </AnimationProvider>
  );
}

/**
 * Render avec providers automatiques
 * Usage: renderWithProviders(<Component />)
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: ProvidersWrapper, ...options });
}

// Re-export tout de @testing-library/react
export * from '@testing-library/react';
