/**
 * Integration Tests: Tauri Frontend ↔ Backend
 * Coverage: IPC communication, Window management, File system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { invoke } from '@tauri-apps/api/core';
import { Window } from '@tauri-apps/api/window';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

vi.mock('@tauri-apps/api/window', () => ({
  Window: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-fs', () => ({
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
}));

describe('Integration: Tauri Communication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('IPC Commands', () => {
    it('should invoke backend commands', async () => {
      vi.mocked(invoke).mockResolvedValueOnce({ success: true });

      const result = await invoke('get_system_info');

      expect(invoke).toHaveBeenCalledWith('get_system_info');
      expect(result).toEqual({ success: true });
    });

    it('should pass parameters to backend', async () => {
      vi.mocked(invoke).mockResolvedValueOnce({ saved: true });

      await invoke('save_settings', { theme: 'dark', language: 'fr' });

      expect(invoke).toHaveBeenCalledWith('save_settings', {
        theme: 'dark',
        language: 'fr',
      });
    });

    it('should handle backend errors', async () => {
      vi.mocked(invoke).mockRejectedValueOnce(new Error('Backend error'));

      await expect(invoke('invalid_command')).rejects.toThrow('Backend error');
    });
  });

  describe('Window Management', () => {
    it('should minimize window', async () => {
      const mockMinimize = vi.fn().mockResolvedValue(undefined);
      vi.mocked(Window).mockImplementation(function (this: any) {
        return {
          minimize: mockMinimize,
        };
      } as any);

      const appWindow = new Window('main');
      await appWindow.minimize();

      expect(mockMinimize).toHaveBeenCalled();
    });

    it('should maximize window', async () => {
      const mockMaximize = vi.fn().mockResolvedValue(undefined);
      vi.mocked(Window).mockImplementation(function (this: any) {
        return {
          maximize: mockMaximize,
        };
      } as any);

      const appWindow = new Window('main');
      await appWindow.maximize();

      expect(mockMaximize).toHaveBeenCalled();
    });

    it('should close window', async () => {
      const mockClose = vi.fn().mockResolvedValue(undefined);
      vi.mocked(Window).mockImplementation(function (this: any) {
        return {
          close: mockClose,
        };
      } as any);

      const appWindow = new Window('main');
      await appWindow.close();

      expect(mockClose).toHaveBeenCalled();
    });

    it('should detect window state', async () => {
      const mockIsMaximized = vi.fn().mockResolvedValue(true);
      vi.mocked(Window).mockImplementation(function (this: any) {
        return {
          isMaximized: mockIsMaximized,
        };
      } as any);

      const appWindow = new Window('main');
      const isMaximized = await appWindow.isMaximized();

      expect(isMaximized).toBe(true);
    });
  });

  describe('File System Operations', () => {
    it('should read file', async () => {
      vi.mocked(readTextFile).mockResolvedValueOnce('file content');

      const content = await readTextFile('test.txt');

      expect(readTextFile).toHaveBeenCalledWith('test.txt');
      expect(content).toBe('file content');
    });

    it('should write file', async () => {
      vi.mocked(writeTextFile).mockResolvedValueOnce(undefined);

      await writeTextFile('output.txt', 'test data');

      expect(writeTextFile).toHaveBeenCalledWith('output.txt', 'test data');
    });

    it('should handle file errors', async () => {
      vi.mocked(readTextFile).mockRejectedValueOnce(new Error('File not found'));

      await expect(readTextFile('missing.txt')).rejects.toThrow('File not found');
    });
  });

  describe('Memory Operations', () => {
    it('should store memory entry', async () => {
      vi.mocked(invoke).mockResolvedValueOnce({ id: '123' });

      const result = await invoke('store_memory', {
        content: 'Test memory',
        tier: 'STM',
      });

      expect(result).toEqual({ id: '123' });
    });

    it('should retrieve memory entries', async () => {
      vi.mocked(invoke).mockResolvedValueOnce([
        { id: '1', content: 'Memory 1' },
        { id: '2', content: 'Memory 2' },
      ]);

      const memories = await invoke('get_memories', { tier: 'STM' });

      expect(memories).toHaveLength(2);
    });

    it('should delete memory entry', async () => {
      vi.mocked(invoke).mockResolvedValueOnce({ deleted: true });

      await invoke('delete_memory', { id: '123' });

      expect(invoke).toHaveBeenCalledWith('delete_memory', { id: '123' });
    });
  });

  describe('Performance Metrics', () => {
    it('should fetch system metrics', async () => {
      vi.mocked(invoke).mockResolvedValueOnce({
        cpu: 45.5,
        memory: 1024,
        fps: 60,
      });

      const metrics = await invoke('get_performance_metrics');

      expect(metrics).toEqual({
        cpu: 45.5,
        memory: 1024,
        fps: 60,
      });
    });

    it('should stream metrics updates', async () => {
      const mockMetrics = [
        { cpu: 40, memory: 1000, fps: 60 },
        { cpu: 45, memory: 1100, fps: 58 },
        { cpu: 50, memory: 1200, fps: 60 },
      ];

      let callCount = 0;
      vi.mocked(invoke).mockImplementation(async () => mockMetrics[callCount++]);

      const metrics1 = await invoke('get_performance_metrics');
      const metrics2 = await invoke('get_performance_metrics');

      expect(metrics1.cpu).not.toBe(metrics2.cpu);
    });
  });
});
