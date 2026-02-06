/**
 * Tests pour SingularityDashboard Component
 * Coverage: Dashboard principal, Metrics, Core health, États système
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SingularityDashboard } from '@/components/monitoring/SingularityDashboard';
import { secureInvoke } from '@/lib/security';
import { useSingularity } from '@/hooks/useSingularity';

vi.mock('@/lib/security', () => ({
  secureInvoke: vi.fn(),
}));

vi.mock('@/hooks/useSingularity', () => ({
  useSingularity: vi.fn(),
}));

describe('SingularityDashboard Component', () => {
  const mockSecureInvoke = secureInvoke as unknown as ReturnType<typeof vi.fn>;
  const mockUseSingularity = useSingularity as unknown as ReturnType<typeof vi.fn>;

  const mockMetrics = {
    cpu_usage_percent: 45,
    memory_used_mb: 8192,
    memory_total_mb: 16384,
    uptime_seconds: 3600,
  };

  beforeEach(() => {
    mockSecureInvoke.mockReset();
    mockUseSingularity.mockReset();

    mockSecureInvoke.mockResolvedValue(mockMetrics);

    mockUseSingularity.mockReturnValue({
      isInitialized: true,
      formStability: 0.82,
      autoCoherence: 0.9,
      consciousness: 3.2,
      expressionQuality: 0.7,
      field: {
        energy: 0.5,
        motion: 0.4,
        symbolism: 0.6,
        depth: 0.7,
        presence: 0.8,
      },
      unity: {
        globalHarmony: 0.9,
        globalEntropy: 0.1,
        systemHealth: 0.95,
        persona: { presenceLevel: 0.8 },
      },
      convergence: { convergenceLevel: 0.7 },
      overmind: { selfUnderstanding: 0.8 },
      timestamp: Date.now(),
    });
  });

  describe('Rendering', () => {
    it('should render dashboard header', () => {
      render(<SingularityDashboard />);
      expect(screen.getByText(/singularity dashboard/i)).toBeInTheDocument();
    });

    it('should render system metrics card', async () => {
      render(<SingularityDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/system metrics/i)).toBeInTheDocument();
      });
    });

    it('should display CPU and Memory metrics', async () => {
      render(<SingularityDashboard />);

      await waitFor(() => {
        expect(screen.getAllByText(/cpu/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/memory/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/45\.0%/i)).toBeInTheDocument();
      });
    });
  });

  describe('Singularity Indicators', () => {
    it('should render consciousness level', () => {
      render(<SingularityDashboard />);
      expect(screen.getByText(/consciousness level/i)).toBeInTheDocument();
    });

    it('should render singularity field', () => {
      render(<SingularityDashboard />);
      expect(screen.getByText(/singularity field/i)).toBeInTheDocument();
    });
  });
});
