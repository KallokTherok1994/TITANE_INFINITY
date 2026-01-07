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
  filesIncluded: string[];
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
  private listeners: Set<(state: BackupState) => void> = new Set();

  async initialize(): Promise<void> {
    logger.debug('Initializing Auto-Backup Service v26.2...');
    this.loadState();
    this.startBackupTimer();
    this.checkImmediateBackup();
    logger.debug(
      'Initialized - Next backup:',
      new Date(this.state.nextBackupTime).toLocaleString()
    );
  }

  private loadState(): void {
    try {
      const stored = localStorage.getItem('titane_backup_state');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.state.lastBackupTime = parsed.lastBackupTime || 0;
        this.state.totalBackups = parsed.totalBackups || 0;
      }
    } catch (e) {
      logger.warn('Failed to load state:', e);
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem(
        'titane_backup_state',
        JSON.stringify({
          lastBackupTime: this.state.lastBackupTime,
          totalBackups: this.state.totalBackups,
        })
      );
    } catch (e) {
      logger.warn('Failed to save state:', e);
    }
  }

  private startBackupTimer(): void {
    if (this.backupTimer) clearInterval(this.backupTimer);
    if (!this.config.enabled) return;

    this.updateNextBackupTime();
    this.backupTimer = setInterval(() => this.checkAndRunBackup(), 60000);
  }

  private updateNextBackupTime(): void {
    this.state.nextBackupTime = this.state.lastBackupTime + this.config.intervalMs;
    this.notifyListeners();
  }

  private async checkAndRunBackup(): Promise<void> {
    if (Date.now() >= this.state.nextBackupTime && !this.state.isBackingUp) {
      await this.runBackup();
    }
  }

  private checkImmediateBackup(): void {
    const timeSinceLastBackup = Date.now() - this.state.lastBackupTime;
    if (timeSinceLastBackup >= this.config.intervalMs) {
      this.state.nextBackupTime = Date.now() + 5 * 60 * 1000;
      this.notifyListeners();
    }
  }

  async runBackup(): Promise<BackupResult> {
    if (this.state.isBackingUp) {
      return {
        success: false,
        backupId: '',
        timestamp: Date.now(),
        sizeMB: 0,
        filesIncluded: [],
        error: 'Backup in progress',
      };
    }

    this.state.isBackingUp = true;
    this.notifyListeners();

    const backupId = `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();
    const filesIncluded: string[] = [];

    try {
      const backupData: Record<string, unknown> = {
        version: '26.2',
        timestamp,
        backupId,
      };

      if (this.config.includeMemory) {
        backupData.memory = this.collectMemoryData();
        filesIncluded.push('memory');
      }

      if (this.config.includeConversations) {
        backupData.conversations = this.collectConversationsData();
        filesIncluded.push('conversations');
      }

      if (this.config.includeSettings) {
        backupData.settings = this.collectSettingsData();
        filesIncluded.push('settings');
      }

      const result = await this.saveBackupToFile(backupId, backupData);

      this.state.lastBackupTime = timestamp;
      this.state.totalBackups++;
      this.state.lastBackupResult = result;
      this.updateNextBackupTime();
      this.saveState();

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        backupId,
        timestamp,
        sizeMB: 0,
        filesIncluded,
        error: errorMsg,
      };
    } finally {
      this.state.isBackingUp = false;
      this.notifyListeners();
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
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          memoryData[key] = JSON.parse(value);
        } catch {
          memoryData[key] = value;
        }
      }
    }
    return memoryData;
  }

  private collectConversationsData(): Record<string, unknown> {
    const conversations: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.includes('conversation') || key.includes('chat') || key.includes('message'))
      ) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            conversations[key] = JSON.parse(value);
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
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          settings[key] = JSON.parse(value);
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
    const jsonData = JSON.stringify(data, null, 2);
    const sizeMB = new Blob([jsonData]).size / (1024 * 1024);

    try {
      await secureInvoke('write_snapshot', {
        path: `backups/${backupId}.json`,
        data: jsonData,
      });
      return {
        success: true,
        backupId,
        timestamp: Date.now(),
        sizeMB,
        filesIncluded: Object.keys(data).filter(
          k => !['version', 'timestamp', 'backupId'].includes(k)
        ),
      };
    } catch {
      localStorage.setItem(`titane_backup_${backupId}`, jsonData);
      this.cleanupOldLocalBackups();
      return {
        success: true,
        backupId,
        timestamp: Date.now(),
        sizeMB,
        filesIncluded: Object.keys(data).filter(
          k => !['version', 'timestamp', 'backupId'].includes(k)
        ),
      };
    }
  }

  private cleanupOldLocalBackups(): void {
    const backupKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('titane_backup_')) backupKeys.push(key);
    }
    backupKeys.sort().reverse();
    if (backupKeys.length > this.config.maxBackups) {
      backupKeys
        .slice(this.config.maxBackups)
        .forEach(key => localStorage.removeItem(key));
    }
  }

  async listBackups(): Promise<Array<{ id: string; timestamp: number; sizeMB: number }>> {
    const backups: Array<{ id: string; timestamp: number; sizeMB: number }> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('titane_backup_')) {
        const value = localStorage.getItem(key);
        if (value) {
          const sizeMB = new Blob([value]).size / (1024 * 1024);
          const id = key.replace('titane_backup_', '');
          try {
            const data = JSON.parse(value);
            backups.push({ id, timestamp: data.timestamp || 0, sizeMB });
          } catch {
            backups.push({ id, timestamp: 0, sizeMB });
          }
        }
      }
    }
    return backups.sort((a, b) => b.timestamp - a.timestamp);
  }

  async restoreBackup(backupId: string): Promise<boolean> {
    try {
      const backupData = localStorage.getItem(`titane_backup_${backupId}`);
      if (!backupData) return false;

      const data = JSON.parse(backupData);

      if (data.memory) {
        for (const [key, value] of Object.entries(data.memory)) {
          if (key !== 'backend') localStorage.setItem(key, JSON.stringify(value));
        }
      }

      if (data.conversations) {
        for (const [key, value] of Object.entries(data.conversations)) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      }

      if (data.settings) {
        for (const [key, value] of Object.entries(data.settings)) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  configure(config: Partial<BackupConfig>): void {
    this.config = { ...this.config, ...config };
    if ('intervalMs' in config || 'enabled' in config) this.startBackupTimer();
  }

  getState(): BackupState {
    return { ...this.state };
  }
  getConfig(): BackupConfig {
    return { ...this.config };
  }

  subscribe(listener: (state: BackupState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }

  async createManualBackup(): Promise<BackupResult> {
    return this.runBackup();
  }

  shutdown(): void {
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
      this.backupTimer = null;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════

export const autoBackupService = new AutoBackupService();
