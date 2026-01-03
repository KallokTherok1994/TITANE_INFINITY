// TITANE_INFINITY v26.2.0 — Window Controls Hook
// Zoom (CTRL+Scroll) & Fullscreen (F11) keyboard shortcuts

import { useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

export interface WindowControlsOptions {
  enableZoom?: boolean;
  enableFullscreen?: boolean;
  zoomStep?: number;
  minZoom?: number;
  maxZoom?: number;
}

const DEFAULT_OPTIONS: WindowControlsOptions = {
  enableZoom: true,
  enableFullscreen: true,
  zoomStep: 0.1,
  minZoom: 0.5,
  maxZoom: 5.0,
};

/**
 * Apply CSS zoom to document root
 */
function applyZoom(level: number): void {
  const root = document.documentElement;
  root.style.zoom = `${level}`;
  console.log(`[WindowControls] Applied zoom: ${Math.round(level * 100)}%`);
}

/**
 * Hook to enable window controls (zoom + fullscreen)
 * - CTRL + Scroll Up/Down: Zoom in/out
 * - CTRL + 0: Reset zoom to 100%
 * - F11: Toggle fullscreen
 */
export function useWindowControls(options: WindowControlsOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const handleZoomIn = useCallback(async () => {
    try {
      const newLevel = await invoke<number>('window_zoom_in');
      applyZoom(newLevel);
      return newLevel;
    } catch (error) {
      console.error('[WindowControls] Failed to zoom in:', error);
    }
  }, []);

  const handleZoomOut = useCallback(async () => {
    try {
      const newLevel = await invoke<number>('window_zoom_out');
      applyZoom(newLevel);
      return newLevel;
    } catch (error) {
      console.error('[WindowControls] Failed to zoom out:', error);
    }
  }, []);

  const handleZoomReset = useCallback(async () => {
    try {
      await invoke('window_zoom_reset');
      applyZoom(1.0);
      console.log('[WindowControls] Zoom reset: 100%');
    } catch (error) {
      console.error('[WindowControls] Failed to reset zoom:', error);
    }
  }, []);

  const handleToggleFullscreen = useCallback(async () => {
    try {
      const isFullscreen = await invoke<boolean>('window_toggle_fullscreen');
      console.log(`[WindowControls] Fullscreen: ${isFullscreen ? 'ON' : 'OFF'}`);
      return isFullscreen;
    } catch (error) {
      console.error('[WindowControls] Failed to toggle fullscreen:', error);
    }
  }, []);

  useEffect(() => {
    if (!opts.enableZoom && !opts.enableFullscreen) {
      return;
    }

    // Listen to zoom-change events from Tauri backend
    const unlisten = listen<number>('zoom-change', (event) => {
      applyZoom(event.payload);
    });

    // Zoom with CTRL + Scroll
    const handleWheel = (e: WheelEvent) => {
      if (!opts.enableZoom) return;
      
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        
        if (e.deltaY < 0) {
          // Scroll up = zoom in
          handleZoomIn();
        } else if (e.deltaY > 0) {
          // Scroll down = zoom out
          handleZoomOut();
        }
      }
    };

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12: Toggle DevTools (in development mode)
      if (e.key === 'F12') {
        e.preventDefault();
        // DevTools handled by Tauri automatically in dev mode
        // In production, requires explicit permission in tauri.conf.json
        console.log('[WindowControls] F12 pressed - DevTools should toggle');
        return;
      }

      // F11: Toggle fullscreen
      if (opts.enableFullscreen && e.key === 'F11') {
        e.preventDefault();
        handleToggleFullscreen();
        return;
      }

      // CTRL + 0: Reset zoom
      if (opts.enableZoom && (e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        handleZoomReset();
        return;
      }

      // CTRL + Plus: Zoom in
      if (opts.enableZoom && (e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        handleZoomIn();
        return;
      }

      // CTRL + Minus: Zoom out
      if (opts.enableZoom && (e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        handleZoomOut();
        return;
      }
    };

    // Add event listeners
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      unlisten.then((fn) => fn());
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [opts.enableZoom, opts.enableFullscreen, handleZoomIn, handleZoomOut, handleZoomReset, handleToggleFullscreen]);

  return {
    zoomIn: handleZoomIn,
    zoomOut: handleZoomOut,
    zoomReset: handleZoomReset,
    toggleFullscreen: handleToggleFullscreen,
  };
}

/**
 * Manual window control functions (no hooks)
 */
export const windowControls = {
  async getZoom(): Promise<number> {
    return invoke<number>('window_get_zoom');
  },

  async setZoom(level: number): Promise<void> {
    return invoke('window_set_zoom', { level });
  },

  async zoomIn(): Promise<number> {
    return invoke<number>('window_zoom_in');
  },

  async zoomOut(): Promise<number> {
    return invoke<number>('window_zoom_out');
  },

  async zoomReset(): Promise<void> {
    return invoke('window_zoom_reset');
  },

  async toggleFullscreen(): Promise<boolean> {
    return invoke<boolean>('window_toggle_fullscreen');
  },

  async setFullscreen(fullscreen: boolean): Promise<void> {
    return invoke('window_set_fullscreen', { fullscreen });
  },

  async isFullscreen(): Promise<boolean> {
    return invoke<boolean>('window_is_fullscreen');
  },
};

export default useWindowControls;
