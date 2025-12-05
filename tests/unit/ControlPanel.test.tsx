/**
 * TITANE∞ OS - Tests Unitaires ControlPanel React
 * Tests des composants React du Control Panel
 *
 * @jest-environment jsdom
 */

import React from 'react';
import { describe, test, beforeEach, expect, vi, type Mock } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ControlPanel } from '@/ui/pages/ControlPanel/ControlPanel';
import { secureInvoke } from '@/lib/security';

vi.mock('@/lib/security', () => ({
  secureInvoke: vi.fn(),
}));

// Mock sections
vi.mock('@/ui/pages/ControlPanel/sections/SystemSection', () => ({
  SystemSection: () => <div data-testid="system-section">System Section</div>,
}));

vi.mock('@/ui/pages/ControlPanel/sections/AppearanceSection', () => ({
  AppearanceSection: () => <div data-testid="appearance-section">Appearance Section</div>,
}));

vi.mock('@/ui/pages/ControlPanel/sections/SingularitySection', () => ({
  SingularitySection: () => <div data-testid="singularity-section">Singularity Section</div>,
}));

describe('ControlPanel', () => {
  const mockSystemInfo = {
    version: 'v19.1.0',
    uptime: 3600,
    memory_usage: 45.2,
    cpu_usage: 23.5,
    disk_usage: 62.8,
    singularity_active: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (secureInvoke as Mock).mockResolvedValue(mockSystemInfo);
  });

  test('affiche le chargement initial', () => {
    render(<ControlPanel />);
    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  test('charge les informations système au montage', async () => {
    render(<ControlPanel />);

    await waitFor(() => {
      expect(secureInvoke).toHaveBeenCalledWith('get_system_info');
    });
  });

  test('affiche la section système par défaut', async () => {
    render(<ControlPanel />);

    await waitFor(() => {
      expect(screen.getByTestId('system-section')).toBeInTheDocument();
    });
  });

  test('gère les erreurs de chargement', async () => {
    (secureInvoke as Mock).mockRejectedValue('Network error');

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(<ControlPanel />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  test('rafraîchit automatiquement les données', async () => {
    const intervalSpy = vi.spyOn(global, 'setInterval');

    render(<ControlPanel />);

    await waitFor(() => {
      expect(secureInvoke).toHaveBeenCalledTimes(1);
    });

    const refreshCallback = intervalSpy.mock.calls[0]?.[0] as (() => Promise<void>) | undefined;
    expect(refreshCallback).toBeDefined();

    await act(async () => {
      await refreshCallback?.();
    });

    await waitFor(() => {
      expect(secureInvoke).toHaveBeenCalledTimes(2);
    });

    intervalSpy.mockRestore();
  });
});

describe('ControlPanel - Navigation', () => {
  const mockSystemInfo = {
    version: 'v19.1.0',
    uptime: 3600,
    memory_usage: 45.2,
    cpu_usage: 23.5,
    disk_usage: 62.8,
    singularity_active: true,
  };

  beforeEach(() => {
    (secureInvoke as Mock).mockResolvedValue(mockSystemInfo);
  });

  test('permet de changer de section', async () => {
    render(<ControlPanel />);

    await waitFor(() => {
      expect(screen.getByTestId('system-section')).toBeInTheDocument();
    });

    // Note: Ce test nécessiterait l'implémentation réelle de la navigation
    // ou un mock plus complet du ControlPanelLayout
  });
});

describe('ControlPanel - Responsive', () => {
  test('adapte le layout pour mobile', () => {
    // Mock window.innerWidth
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));

    render(<ControlPanel />);

    // Vérifier que le layout mobile est appliqué
    // Ce test nécessiterait des queries CSS spécifiques
  });
});
