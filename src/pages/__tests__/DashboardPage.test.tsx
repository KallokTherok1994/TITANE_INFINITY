import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardPage } from '../DashboardPage';
import { renderWithProviders } from './test-utils';

vi.mock('@/hooks/useVisualEngines', () => ({
  useVisualEngines: vi.fn(),
}));

vi.mock('@/hooks/useExperience', () => ({
  useExperience: () => ({
    totalXp: 245,
    level: 1,
    xpForNextLevel: 400,
  }),
}));

vi.mock('@/components/PersonaMoodIndicator', () => ({
  PersonaMoodIndicator: () => <div data-testid="persona-mood-indicator" />,
}));

describe('DashboardPage', () => {
  it('renders without crashing and exposes data-testid', () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByTestId('page-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('persona-mood-indicator')).toBeInTheDocument();
  });
});
