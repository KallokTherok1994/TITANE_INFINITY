import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/telemetry/useProductionHealthTelemetry', () => ({
  useProductionHealthTelemetry: vi.fn(),
}));

import { ProductionHealthPanel } from '../ProductionHealthPanel';
import { useProductionHealthTelemetry } from '@/services/telemetry/useProductionHealthTelemetry';

const mockUseProductionHealthTelemetry = vi.mocked(useProductionHealthTelemetry);

describe('ProductionHealthPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows runtime unavailable copy when Tauri runtime cannot be queried', () => {
    mockUseProductionHealthTelemetry.mockReturnValue({
      data: null,
      loading: false,
      error:
        'SOURCE_UNAVAILABLE: Tauri runtime non disponible — Tauri not available (cached)',
      errorKind: 'SOURCE_UNAVAILABLE',
      refresh: vi.fn(),
      isHealthy: false,
      isWarning: false,
    });

    render(<ProductionHealthPanel />);

    expect(screen.getByText(/Runtime Tauri indisponible/i)).toBeInTheDocument();
    expect(
      screen.getByText(/La source production n'a pas pu être interrogée/i)
    ).toBeInTheDocument();
  });

  it('keeps missing-source copy for a real absent telemetry file', () => {
    mockUseProductionHealthTelemetry.mockReturnValue({
      data: null,
      loading: false,
      error: 'SOURCE_UNAVAILABLE: /tmp/titane_production_week1.csv absent',
      errorKind: 'SOURCE_UNAVAILABLE',
      refresh: vi.fn(),
      isHealthy: false,
      isWarning: false,
    });

    render(<ProductionHealthPanel />);

    expect(screen.getByText(/Source absente/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Le fichier de télémétrie production est absent/i)
    ).toBeInTheDocument();
  });
});
