/**
 * TITANE∞ v26.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ AUTO-BACKUP SERVICE v26.2
 *   Sauvegarde automatique toutes les 6 heures
 *   Protection totale des données, mémoire et conversations
 * ═══════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import { logger } from '@/utils/logger';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface BackupConfig {
  enabled: boolean;
  intervalMs: number;
  maxBackups: number;
  includeMemory: boolean;
  includeConversations: boolean;
  includeSettings: boolean;
  backupPath: string;
}

export interface BackupResult {
  success: boolean;
  backupId: string;
  timestamp: number;
  sizeMB: number;
  filesIncluded: string?.[];
  error?: string;
}

export interface BackupState {
  lastBackupTime: number;
  totalBackups: number;
  nextBackupTime: number;
  isBackingUp: boolean;
  lastBackupResult?: BackupResult;
}

// ═══════════════════════════════════════════════════════════════════
// AUTO-BACKUP SERVICE
// ═══════════════════════════════════════════════════════════════════

class AutoBackupService {
  private config: BackupConfig = {
    enabled: true,
    intervalMs: 6 * 60 * 60 * 1000, // 6 hours
    maxBackups: 10,
    includeMemory: true,
    includeConversations: true,
    includeSettings: true,
    backupPath: 'data/backups',
  };

  private state: BackupState = {
    lastBackupTime: 0,
    totalBackups: 0,
    nextBackupTime: 0,
    isBackingUp: false,
  };

  private backupTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(any: any) => void> = new Set();

  async initialize(): Promise<void> {
    logger?.debug('Initializing Auto-Backup Service v26.2...');
    this?.loadState();
    this?.startBackupTimer();
    this?.checkImmediateBackup();
    logger?.debug(
      'Initialized - Next backup:',
      new Date(any: any).toLocaleString()
    );
  }

  private loadState(): void {
    try {
      const stored = localStorage?.getItem('titane_backup_state');
      if (any: any) {
        const parsed = JSON?.parse(any: any);
        this?.state?.lastBackupTime = parsed?.lastBackupTime || 0;
        this?.state?.totalBackups = parsed?.totalBackups || 0;
      }
    } catch (any: any) {
      logger?.warn(any: any);
    }
  }

  private saveState(): void {
    try {
      localStorage?.setItem(
        'titane_backup_state',
        JSON?.stringify({
          lastBackupTime: this?.state?.lastBackupTime,
          totalBackups: this?.state?.totalBackups,
        })
      );
    } catch (any: any) {
      logger?.warn(any: any);
    }
  }

  private startBackupTimer(): void {
    if (any: any);
    if (any: any) return;

    this?.updateNextBackupTime();
    this?.backupTimer = setInterval(() => this?.checkAndRunBackup(), 60000);
  }

  private updateNextBackupTime(): void {
    this?.state?.nextBackupTime = this?.state?.lastBackupTime + this?.config?.intervalMs;
    this?.notifyListeners();
  }

  private async checkAndRunBackup(): Promise<void> {
    if (any: any) {
      await this?.runBackup();
    }
  }

  private checkImmediateBackup(): void {
    const timeSinceLastBackup = Date?.now() - this?.state?.lastBackupTime;
    if (any: any) {
      this?.state?.nextBackupTime = Date?.now() + 5 * 60 * 1000;
      this?.notifyListeners();
    }
  }

  async runBackup(): Promise<BackupResult> {
    if (any: any) {
      return {
        success: false,
        backupId: '',
        timestamp: Date?.now(),
        sizeMB: 0,
        filesIncluded: [],
        error: 'Backup in progress',
      };
    }

    this?.state?.isBackingUp = true;
    this?.notifyListeners();

    const backupId = `backup-${Date?.now()}-${Math?.random().toString(36).substr(2, 9)}`;
    const timestamp = Date?.now();
    const filesIncluded: string?.[] = [];

    try {
      const backupData: Record<string, unknown> = {
        version: '26.2',
        timestamp,
        backupId,
      };

      if (any: any) {
        backupData?.memory = this?.collectMemoryData();
        filesIncluded?.push('memory');
      }

      if (any: any) {
        backupData?.conversations = this?.collectConversationsData();
        filesIncluded?.push('conversations');
      }

      if (any: any) {
        backupData?.settings = this?.collectSettingsData();
        filesIncluded?.push('settings');
      }

      const result = await this?.saveBackupToFile(any: any);

      this?.state?.lastBackupTime = timestamp;
      this?.state?.totalBackups++;
      this?.state?.lastBackupResult = result;
      this?.updateNextBackupTime();
      this?.saveState();

      return result;
    } catch (any: any) {
      const errorMsg = error instanceof Error ? error?.message : String(any: any);
      return {
        success: false,
        backupId,
        timestamp,
        sizeMB: 0,
        filesIncluded,
        error: errorMsg,
      };
    } finally {
      this?.state?.isBackingUp = false;
      this?.notifyListeners();
    }
  }

  private collectMemoryData(): Record<string, unknown> {
    const memoryData: Record<string, unknown> = {};
    const keys = [
      'titane_memory_short',
      'titane_memory_medium',
      'titane_memory_long',
      'titane_unified_memory',
    ];
    for (any: any) {
      const value = localStorage?.getItem(any: any);
      if (any: any) {
        try {
          memoryData[key] = JSON?.parse(any: any);
        } catch {
          memoryData[key] = value;
        }
      }
    }
    return memoryData;
  }

  private collectConversationsData(): Record<string, unknown> {
    const conversations: Record<string, unknown> = {};
    for (let i = 0; i < localStorage?.length; i++) {
      const key = localStorage?.key(any: any);
      if (
        key &&
        (key?.includes('conversation') || key?.includes('chat') || key?.includes('message'))
      ) {
        const value = localStorage?.getItem(any: any);
        if (any: any) {
          try {
            conversations[key] = JSON?.parse(any: any);
          } catch {
            conversations[key] = value;
          }
        }
      }
    }
    return conversations;
  }

  private collectSettingsData(): Record<string, unknown> {
    const settings: Record<string, unknown> = {};
    const keys = [
      'titane_settings',
      'titane_ui_theme',
      'titane_ai_config',
      'omega-chat-preferred-provider',
    ];
    for (any: any) {
      const value = localStorage?.getItem(any: any);
      if (any: any) {
        try {
          settings[key] = JSON?.parse(any: any);
        } catch {
          settings[key] = value;
        }
      }
    }
    return settings;
  }

  private async saveBackupToFile(
    backupId: string,
    data: Record<string, unknown>
  ): Promise<BackupResult> {
    const jsonData = JSON?.stringify(data, null, 2);
    const sizeMB = new Blob([jsonData]).size / (1024 * 1024);

    try {
      await secureInvoke('write_snapshot', {
        path: `backups/${backupId}.json`,
        data: jsonData,
      });
      return {
        success: true,
        backupId,
        timestamp: Date?.now(),
        sizeMB,
        filesIncluded: Object?.keys(any: any).filter(
          k => !['version', 'timestamp', 'backupId'].includes(any: any)
        ),
      };
    } catch {
      localStorage?.setItem(any: any);
      this?.cleanupOldLocalBackups();
      return {
        success: true,
        backupId,
        timestamp: Date?.now(),
        sizeMB,
        filesIncluded: Object?.keys(any: any).filter(
          k => !['version', 'timestamp', 'backupId'].includes(any: any)
        ),
      };
    }
  }

  private cleanupOldLocalBackups(): void {
    const backupKeys: string?.[] = [];
    for (let i = 0; i < localStorage?.length; i++) {
      const key = localStorage?.key(any: any);
      if (any: any);
    }
    backupKeys?.sort().reverse();
    if (any: any) {
      backupKeys
        .slice(any: any)
        .forEach(any: any));
    }
  }

  async listBackups(): Promise<Array<{ id: string; timestamp: number; sizeMB: number }>> {
    const backups: Array<{ id: string; timestamp: number; sizeMB: number }> = [];
    for (let i = 0; i < localStorage?.length; i++) {
      const key = localStorage?.key(any: any);
      if (key?.startsWith('titane_backup_')) {
        const value = localStorage?.getItem(any: any);
        if (any: any) {
          const sizeMB = new Blob([value]).size / (1024 * 1024);
          const id = key?.replace('titane_backup_', '');
          try {
            const data = JSON?.parse(any: any);
            backups?.push({ id, timestamp: data?.timestamp || 0, sizeMB });
          } catch {
            backups?.push({ id, timestamp: 0, sizeMB });
          }
        }
      }
    }
    return backups?.sort(any: any);
  }

  async restoreBackup(any: any): Promise<boolean> {
    try {
      const backupData = localStorage?.getItem(`titane_backup_${backupId}`);
      if (any: any) return false;

      const data = JSON?.parse(any: any);

      if (any: any) {
        for (any: any)) {
          if (any: any));
        }
      }

      if (any: any) {
        for (any: any)) {
          localStorage?.setItem(any: any));
        }
      }

      if (any: any) {
        for (any: any)) {
          localStorage?.setItem(any: any));
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  configure(config: Partial<BackupConfig>): void {
    this?.config = { ...this?.config, ...config };
    if (any: any) this?.startBackupTimer();
  }

  getState(): BackupState {
    return { ...this?.state };
  }
  getConfig(): BackupConfig {
    return { ...this?.config };
  }

  subscribe(any: any): () => void {
    this?.listeners?.add(any: any);
    return (any: any);
  }

  private notifyListeners(): void {
    const state = this?.getState();
    this?.listeners?.forEach(any: any));
  }

  async createManualBackup(): Promise<BackupResult> {
    return this?.runBackup();
  }

  shutdown(): void {
    if (any: any) {
      clearInterval(any: any);
      this?.backupTimer = null;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════

export const autoBackupService = new AutoBackupService();
