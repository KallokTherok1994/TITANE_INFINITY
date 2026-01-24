// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v24.12 — AVATAR FLOATING WINDOW COMPONENT
//   React Component for Floating Avatar Window with Three.js Rendering
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useFloatingWindow } from './useFloatingWindow';
import { AvatarDisplayMode, type AvatarDisplayState } from './AvatarDisplayState';
import AvatarFloatingPopup from './AvatarFloatingPopup';
import ThreeJSAvatarRenderer from './ThreeJSAvatarRenderer';
import { useFullBodyAvatar } from '../fullbody/useFullBodyAvatar';
import type { SkeletonSnapshot } from '../fullbody/fullbody_engine';
import { AppearanceFloatingIntegration } from './appearanceFloatingIntegration';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface AvatarFloatingWindowProps {
  /** Enable popup controls */
  showPopup?: boolean;
  /** Auto-hide popup after delay (ms) */
  popupAutoHide?: number;
  /** Enable drag & drop */
  enableDrag?: boolean;
  /** Enable resize handles */
  enableResize?: boolean;
  /** Callback when window state changes */
  onStateChange?: (state: AvatarDisplayState) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const AvatarFloatingWindow: React.FC<AvatarFloatingWindowProps> = ({
  showPopup = true,
  popupAutoHide = 3000,
  enableDrag = true,
  enableResize = true,
  onStateChange,
}) => {
  // ═════════════════════════════════════════════════════════════════
  // STATE & HOOKS
  // ═════════════════════════════════════════════════════════════════

  const { displayState, loading, error, setModeFloating, setModeEmbed } =
    useFloatingWindow();

  // Three.js renderer
  const rendererRef = useRef<ThreeJSAvatarRenderer | null>(null);
  const appearanceRef = useRef<AppearanceFloatingIntegration | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, _setIsDragging] = useState(false);
  const [isResizing, _setIsResizing] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Auto-hide popup timeout
  const hideTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // FullBody avatar hook with skeleton update callback
  const handleSkeletonUpdate = useCallback((snapshot: SkeletonSnapshot) => {
    if (rendererRef.current) {
      rendererRef.current.updateSkeleton(snapshot);
    }
  }, []);

  // Connect to FullBody engine (starts 60 FPS animation)
  const __fullBodyAvatar = useFullBodyAvatar({
    autoStart: true,
    onSkeletonUpdate: handleSkeletonUpdate,
  });

  // ═════════════════════════════════════════════════════════════════
  // EFFECTS
  // ═════════════════════════════════════════════════════════════════

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    console.log('[AvatarFloatingWindow] Initializing Three.js renderer');

    // Create renderer
    const renderer = new ThreeJSAvatarRenderer(canvasRef.current, {
      width: displayState.width,
      height: displayState.height,
      antialias: true,
      alpha: true,
    });

    renderer.initializeAvatar();
    renderer.startRenderLoop();

    rendererRef.current = renderer;

    // Create appearance integration
    const appearance = new AppearanceFloatingIntegration(renderer);
    appearanceRef.current = appearance;

    // Fetch and apply initial appearance
    void appearance
      .fetchAppearance()
      .then(state => {
        appearance.applyAppearance(state);
        console.log('[AvatarFloatingWindow] Initial appearance applied');
      })
      .catch(error => {
        console.error('[AvatarFloatingWindow] Failed to load appearance:', error);
      });

    // Start appearance sync (every 2 seconds)
    void appearance.startAppearanceSync(2000).then(stopSync => {
      // Cleanup will call stopSync
      return () => {
        stopSync();
      };
    });

    console.log('[AvatarFloatingWindow] Three.js renderer initialized');

    return () => {
      console.log('[AvatarFloatingWindow] Disposing Three.js renderer');
      if (appearanceRef.current) {
        appearanceRef.current.dispose();
        appearanceRef.current = null;
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, [displayState.width, displayState.height]);

  // Update renderer on window resize
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.updateAspect(displayState.width, displayState.height);
    }
  }, [displayState.width, displayState.height]);

  // Notify state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange(displayState);
    }
  }, [displayState, onStateChange]);

  // Show popup on hover
  useEffect(() => {
    if (!showPopup) return;

    if (isHovered && !displayState.locked) {
      setShowControls(true);

      // Clear existing timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      // Auto-hide after delay
      if (popupAutoHide > 0) {
        hideTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, popupAutoHide);
      }
    } else if (!isHovered) {
      setShowControls(false);
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isHovered, displayState.locked, showPopup, popupAutoHide]);

  // ═════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═════════════════════════════════════════════════════════════════

  const handleMouseEnter = useCallback(() => {
    if (!displayState.click_through) {
      setIsHovered(true);
    }
  }, [displayState.click_through]);

  const handleMouseLeave = useCallback(() => {
    if (!isDragging && !isResizing) {
      setIsHovered(false);
    }
  }, [isDragging, isResizing]);

  const handleDoubleClick = useCallback(() => {
    // Toggle between floating and embed mode
    if (displayState.mode === AvatarDisplayMode.Floating) {
      void setModeEmbed();
    } else {
      void setModeFloating();
    }
  }, [displayState.mode, setModeFloating, setModeEmbed]);

  // ═════════════════════════════════════════════════════════════════
  // RENDER CONDITIONS
  // ═════════════════════════════════════════════════════════════════

  // Don&apos;t render if not in floating mode
  if (displayState.mode !== AvatarDisplayMode.Floating) {
    return null;
  }

  // Don&apos;t render if hidden
  if (!displayState.visible) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-900/50 backdrop-blur-sm rounded-lg">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
          <p className="text-sm text-gray-400 font-medium">Chargement avatar...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-red-900/20 backdrop-blur-sm rounded-lg border border-red-500/30">
        <div className="flex flex-col items-center gap-2 p-4">
          <div className="text-red-500 text-2xl">⚠️</div>
          <p className="text-sm text-red-400 font-medium text-center">{error}</p>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // STYLES
  // ═════════════════════════════════════════════════════════════════

  const containerStyle: React.CSSProperties = {
    opacity: displayState.opacity,
    transform: `scale(${displayState.scale}) ${displayState.mirror_mode ? 'scaleX(-1)' : ''}`,
    filter: `brightness(${displayState.brightness})`,
    pointerEvents: displayState.click_through ? 'none' : 'auto',
    cursor: displayState.locked ? 'default' : enableDrag ? 'move' : 'default',
  };

  // ═════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={containerStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={handleDoubleClick}
    >
      {/* Canvas for Three.js rendering */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          display: 'block',
          background: 'transparent',
        }}
      />

      {/* Hover indicator */}
      {isHovered && !displayState.locked && (
        <div className="absolute top-2 right-2 pointer-events-none">
          <div className="px-2 py-1 bg-gray-900/80 backdrop-blur-sm rounded text-xs text-gray-300 font-medium">
            Double-clic pour ancrer
          </div>
        </div>
      )}

      {/* Controls popup */}
      {showPopup && showControls && (
        <AvatarFloatingPopup
          position="top-right"
          onClose={() => setShowControls(false)}
        />
      )}

      {/* Resize handles (if enabled and not locked) */}
      {enableResize && !displayState.locked && isHovered && (
        <>
          {/* Corner handles */}
          <div className="absolute top-0 left-0 w-3 h-3 bg-primary-500/50 cursor-nwse-resize rounded-tl" />
          <div className="absolute top-0 right-0 w-3 h-3 bg-primary-500/50 cursor-nesw-resize rounded-tr" />
          <div className="absolute bottom-0 left-0 w-3 h-3 bg-primary-500/50 cursor-nesw-resize rounded-bl" />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary-500/50 cursor-nwse-resize rounded-br" />

          {/* Edge handles */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-2 bg-primary-500/30 cursor-ns-resize" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-2 bg-primary-500/30 cursor-ns-resize" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-12 bg-primary-500/30 cursor-ew-resize" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-12 bg-primary-500/30 cursor-ew-resize" />
        </>
      )}

      {/* Lock indicator */}
      {displayState.locked && (
        <div className="absolute bottom-2 left-2 pointer-events-none">
          <div className="px-2 py-1 bg-yellow-900/80 backdrop-blur-sm rounded text-xs text-yellow-300 font-medium flex items-center gap-1">
            <span>🔒</span>
            <span>Verrouillé</span>
          </div>
        </div>
      )}

      {/* Always on top indicator */}
      {displayState.always_on_top && (
        <div className="absolute top-2 left-2 pointer-events-none">
          <div className="px-2 py-1 bg-blue-900/80 backdrop-blur-sm rounded text-xs text-blue-300 font-medium flex items-center gap-1">
            <span>📌</span>
            <span>Toujours visible</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default AvatarFloatingWindow;
