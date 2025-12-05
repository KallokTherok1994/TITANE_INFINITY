/**
 * Tests for SingularityState Store (v19.0 Task 6)
 *
 * Testing:
 * - State actions (setMode, setTheme, setEngineData)
 * - State selectors (selectUIMode, selectEngineData)
 * - Persistence (localStorage)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSingularityStore } from '../hooks/useSingularityStore';

describe('SingularityState Store', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useSingularityStore());
    act(() => {
      result.current.setMode('standard');
      result.current.setTheme('dark');
      result.current.setEnginesData({});
    });

    // Clear localStorage
    localStorage.clear();
  });

  describe('UI Mode', () => {
    it('should initialize with standard mode', () => {
      const { result } = renderHook(() => useSingularityStore());
      expect(result.current.metaMode).toBe('standard');
    });

    it('should update mode', () => {
      const { result } = renderHook(() => useSingularityStore());

      act(() => {
        result.current.setMode('meta');
      });

      expect(result.current.metaMode).toBe('meta');
    });

    it('should select UI mode correctly', () => {
      const { result } = renderHook(() => useSingularityStore());

      const mode = result.current.selectUIMode();
      expect(mode).toBe('standard');
    });
  });

  describe('Theme', () => {
    it('should initialize with dark theme', () => {
      const { result } = renderHook(() => useSingularityStore());
      expect(result.current.theme).toBe('dark');
    });

    it('should toggle theme', () => {
      const { result } = renderHook(() => useSingularityStore());

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.theme).toBe('light');
    });
  });

  describe('Engine Data', () => {
    it('should initialize with empty engines data', () => {
      const { result } = renderHook(() => useSingularityStore());
      expect(result.current.enginesData).toEqual({});
    });

    it('should set engine data', () => {
      const { result } = renderHook(() => useSingularityStore());

      const engineData = {
        nexus: { status: 'active', metrics: { uptime: 1000 } },
      };

      act(() => {
        result.current.setEnginesData(engineData);
      });

      expect(result.current.enginesData).toEqual(engineData);
    });

    it('should select specific engine data', () => {
      const { result } = renderHook(() => useSingularityStore());

      const engineData = {
        nexus: { status: 'active', metrics: { uptime: 1000 } },
      };

      act(() => {
        result.current.setEnginesData(engineData);
      });

      const nexusData = result.current.selectEngineData('nexus');
      expect(nexusData).toEqual(engineData.nexus);
    });

    it('should return undefined for non-existent engine', () => {
      const { result } = renderHook(() => useSingularityStore());

      const data = result.current.selectEngineData('nonexistent');
      expect(data).toBeUndefined();
    });
  });

  describe('Persistence', () => {
    it('should persist mode to localStorage', () => {
      const { result } = renderHook(() => useSingularityStore());

      act(() => {
        result.current.setMode('meta');
      });

      const stored = JSON.parse(localStorage.getItem('singularity-storage') || '{}');
      expect(stored.state?.metaMode).toBe('meta');
    });

    it('should persist theme to localStorage', () => {
      const { result } = renderHook(() => useSingularityStore());

      act(() => {
        result.current.setTheme('light');
      });

      const stored = JSON.parse(localStorage.getItem('singularity-storage') || '{}');
      expect(stored.state?.theme).toBe('light');
    });

    it('should restore state from localStorage', () => {
      // Set initial state
      localStorage.setItem('singularity-storage', JSON.stringify({
        state: {
          metaMode: 'meta',
          theme: 'light',
          enginesData: { nexus: { status: 'active' } },
        },
        version: 0,
      }));

      const { result } = renderHook(() => useSingularityStore());

      expect(result.current.metaMode).toBe('meta');
      expect(result.current.theme).toBe('light');
      expect(result.current.enginesData).toEqual({ nexus: { status: 'active' } });
    });
  });
});
