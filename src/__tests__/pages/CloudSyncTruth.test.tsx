import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SyncConfig from '@/pages/CloudCenter/SyncConfig';
import VaultStatus from '@/pages/CloudCenter/VaultStatus';
import type { CloudStatus } from '@/pages/CloudCenter/types';

const {
  cloudListBackups,
  cloudAutoHeal,
  cloudBackupVault,
  cloudRestoreVault,
  cloudUpdateConfig,
} = vi.hoisted(() => ({
  cloudListBackups: vi.fn(),
  cloudAutoHeal: vi.fn(),
  cloudBackupVault: vi.fn(),
  cloudRestoreVault: vi.fn(),
  cloudUpdateConfig: vi.fn(),
}));

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    cloudListBackups,
    cloudAutoHeal,
    cloudBackupVault,
    cloudRestoreVault,
    cloudUpdateConfig,
  },
}));

const baseStatus: CloudStatus = {
  initialized: true,
  status: 'Idle',
  vault_loaded: true,
  vault_revision: 7,
  vault_size_bytes: 2048,
  last_sync: '2026-03-25T12:00:00.000Z',
  device_id: 'device-1',
  device_name: 'TITANE Test',
  backend: 'LocalFolder',
  sync_mode: 'Manual',
};

describe('Cloud sync truth surfaces', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cloudListBackups.mockResolvedValue([]);
    cloudAutoHeal.mockResolvedValue({
      vault_healthy: true,
      issues_found: [],
      actions_taken: [],
      backup_created: false,
      backup_path: null,
    });
    cloudBackupVault.mockResolvedValue('/tmp/vault-backup.enc');
    cloudRestoreVault.mockResolvedValue(true);
    cloudUpdateConfig.mockResolvedValue(undefined);
  });

  it('marks auto-sync as unproven and disables selecting it in the config UI', () => {
    render(<SyncConfig status={baseStatus} onUpdate={vi.fn()} />);

    expect(
      screen.getByRole('radio', { name: /Automatique \(non prouve\)/i })
    ).toBeDisabled();
    expect(
      screen.getByText(
        /La synchronisation automatique reste non prouvee en runtime dans cette build/i
      )
    ).toBeInTheDocument();
  });

  it('shows a blocked warning when legacy auto mode is present in config state', () => {
    render(
      <SyncConfig
        status={{
          ...baseStatus,
          sync_mode: 'Auto',
        }}
        onUpdate={vi.fn()}
      />
    );

    expect(
      screen.getByText(/Mode automatique detecte dans la configuration/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Sauvegarder la configuration/i })
    ).toBeDisabled();
  });

  it('labels auto mode as config-only in the vault status panel', async () => {
    render(
      <VaultStatus
        status={{
          ...baseStatus,
          sync_mode: 'Auto',
        }}
        onRefresh={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(cloudListBackups).toHaveBeenCalled();
    });

    expect(
      screen.getByText(/Automatique \(config seule, non prouve\)/i)
    ).toBeInTheDocument();
  });
});
