/**
 * TITANE∞ vΩ∞ — CAMERA PREVIEW COMPONENT
 * Super Prompt #9: Prévisualisation flux caméra (optionnel, mini-fenêtre)
 *
 * ⚠️ GARDE-FOUS:
 * - Preview optionnel, peut être masqué
 * - Pas d'enregistrement
 * - Indicateur visuel clair quand actif
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useVisionStore, selectIsCameraActive } from '@/stores/useVisionStore';
import './CameraPreview.css';

// ============================================================================
// TYPES
// ============================================================================

export interface CameraPreviewProps {
  /** Taille du preview */
  size?: 'small' | 'medium' | 'large';
  /** Position dans l'UI */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Afficher les contrôles */
  showControls?: boolean;
  /** Callback quand fermé */
  onClose?: () => void;
  /** Afficher overlay landmarks (debug) */
  showLandmarksOverlay?: boolean;
  /** Mirroir (selfie mode) */
  mirrored?: boolean;
  /** Class CSS additionnelle */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  size = 'small',
  position = 'bottom-right',
  showControls = true,
  onClose,
  showLandmarksOverlay = false,
  mirrored = true,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [customPosition, setCustomPosition] = useState<{ x: number; y: number } | null>(null);

  // Store
  const isCameraActive = useVisionStore(selectIsCameraActive);
  const toggleCameraPreview = useVisionStore((s) => s.toggleCameraPreview);
  const stopCamera = useVisionStore((s) => s.stopCamera);

  // Connecter le stream vidéo au ref
  useEffect(() => {
    if (!videoRef.current || !isCameraActive) return;

    const stream = (
      window as unknown as { __titaneVisionStream?: MediaStream }
    ).__titaneVisionStream;

    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isCameraActive]);

  // Drag & Drop
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDrag = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      setCustomPosition({
        x: e.clientX - 80,
        y: e.clientY - 60,
      });
    },
    [isDragging]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, handleDrag, handleDragEnd]);

  // Handler fermeture
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      toggleCameraPreview();
    }
  }, [onClose, toggleCameraPreview]);

  // Handler stop
  const handleStopCamera = useCallback(() => {
    stopCamera();
  }, [stopCamera]);

  // Ne pas afficher si caméra inactive
  if (!isCameraActive) {
    return null;
  }

  // Classes
  const sizeClass = `camera-preview--${size}`;
  const positionClass = customPosition ? '' : `camera-preview--${position}`;
  const stateClass = isMinimized ? 'camera-preview--minimized' : '';

  // Style custom position
  const customStyle = customPosition
    ? {
        left: `${customPosition.x}px`,
        top: `${customPosition.y}px`,
        position: 'fixed' as const,
      }
    : {};

  return (
    <div
      className={`camera-preview ${sizeClass} ${positionClass} ${stateClass} ${className}`}
      style={customStyle}
    >
      {/* Header draggable */}
      <div
        className="camera-preview__header"
        onMouseDown={handleDragStart}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="camera-preview__indicator">
          <span className="camera-preview__dot camera-preview__dot--recording" />
          <span className="camera-preview__label">VISION</span>
        </div>

        {showControls && (
          <div className="camera-preview__controls">
            <button
              className="camera-preview__btn camera-preview__btn--minimize"
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? 'Agrandir' : 'Réduire'}
              aria-label={isMinimized ? 'Agrandir la preview' : 'Réduire la preview'}
            >
              {isMinimized ? '□' : '–'}
            </button>
            <button
              className="camera-preview__btn camera-preview__btn--close"
              onClick={handleClose}
              title="Masquer la preview"
              aria-label="Masquer la preview caméra"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Video */}
      {!isMinimized && (
        <div className="camera-preview__video-container">
          <video
            ref={videoRef}
            className={`camera-preview__video ${mirrored ? 'camera-preview__video--mirrored' : ''}`}
            autoPlay
            playsInline
            muted
          />

          {/* Landmarks Overlay (debug) */}
          {showLandmarksOverlay && (
            <canvas className="camera-preview__landmarks-canvas" />
          )}

          {/* Privacy indicator */}
          <div className="camera-preview__privacy-badge" title="Traitement 100% local">
            🔒 Local
          </div>
        </div>
      )}

      {/* Footer avec bouton stop */}
      {!isMinimized && showControls && (
        <div className="camera-preview__footer">
          <button
            className="camera-preview__btn camera-preview__btn--stop"
            onClick={handleStopCamera}
            title="Arrêter la caméra"
          >
            ⏹ Arrêter
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraPreview;
