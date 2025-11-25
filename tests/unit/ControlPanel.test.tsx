/**
 * TITANE∞ OS - Tests Unitaires ControlPanel React
 * Tests des composants React du Control Panel
 *
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ControlPanel } from '@/ui/pages/ControlPanel/ControlPanel';
import { invoke } from '@tauri-apps/api/tauri';

// Mock Tauri
jest.mock('@tauri-apps/api/tauri', () => ({
  invoke: jest.fn(),
}));

// Mock sections
jest.mock('@/ui/pages/ControlPanel/sections/SystemSection', () => ({
  SystemSection: () => <div data-testid="system-section">System Section</div>,
}));

jest.mock('@/ui/pages/ControlPanel/sections/AppearanceSection', () => ({
  AppearanceSection: () => <div data-testid="appearance-section">Appearance Section</div>,
}));

jest.mock('@/ui/pages/ControlPanel/sections/SingularitySection', () => ({
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
    jest.clearAllMocks();
    (invoke as jest.Mock).mockResolvedValue(mockSystemInfo);
  });

  test('affiche le chargement initial', () => {
    render(<ControlPanel />);
    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  test('charge les informations système au montage', async () => {
    render(<ControlPanel />);

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('cp_get_system_info');
    });
  });

  test('affiche la section système par défaut', async () => {
    render(<ControlPanel />);

    await waitFor(() => {
      expect(screen.getByTestId('system-section')).toBeInTheDocument();
    });
  });

  test('gère les erreurs de chargement', async () => {
    (invoke as jest.Mock).mockRejectedValue('Network error');

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<ControlPanel />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  test('rafraîchit automatiquement les données', async () => {
    jest.useFakeTimers();

    render(<ControlPanel />);

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledTimes(1);
    });

    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledTimes(2);
    });

    jest.useRealTimers();
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
    (invoke as jest.Mock).mockResolvedValue(mockSystemInfo);
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
