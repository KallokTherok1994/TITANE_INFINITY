/**
 * TITANE∞ v29.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * DetectionOverlay - Overlay de détection sur flux caméra
 * Affiche bounding boxes, labels, confidence scores
 */

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import { selectIsObservationActive, useVisionStore } from '@/stores/useVisionStore';
import './DetectionOverlay.css';

interface Detection {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
  color?: string;
}

interface DetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
  color: string;
}

interface DetectionOverlayProps {
  streamRef?: React.RefObject<HTMLVideoElement>;
  showLabels?: boolean;
  showConfidence?: boolean;
  minConfidence?: number;
}

export const DetectionOverlay: React.FC<DetectionOverlayProps> = memo(
  ({ streamRef, showLabels = true, showConfidence = true, minConfidence = 0.5 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [overlayEnabled, setOverlayEnabled] = useState(true);

    const isActive = useVisionStore(selectIsObservationActive);
    // Detection stream is not connected in this component yet.
    // Keep value truthful instead of rendering decorative mock detections.
    const detections: Detection[] = useMemo(() => [], []);

    // Draw detections on canvas
    useEffect(() => {
      if (!canvasRef.current || !overlayEnabled || !isActive) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Get video dimensions
      const video = streamRef?.current;
      if (video) {
        canvas.width = video.videoWidth || canvas.width;
        canvas.height = video.videoHeight || canvas.height;
      }

      // Filter detections by confidence
      const validDetections = (detections || []).filter(
        (d: Detection) => d.confidence >= minConfidence
      );

      // Draw each detection
      validDetections.forEach((detection: Detection) => {
        const box = normalizeBox(detection, canvas.width, canvas.height);
        drawBox(ctx, box, showLabels, showConfidence);
      });
    }, [
      detections,
      overlayEnabled,
      isActive,
      minConfidence,
      showLabels,
      showConfidence,
      streamRef,
    ]);

    const toggleFullscreen = useCallback(() => {
      setIsFullscreen(prev => !prev);
    }, []);

    const toggleOverlayEnabled = useCallback(() => {
      setOverlayEnabled(prev => !prev);
    }, []);

    if (!isActive) {
      return null;
    }

    return (
      <div className={`detection-overlay-container ${isFullscreen ? 'fullscreen' : ''}`}>
        {/* Canvas overlay */}
        <canvas
          ref={canvasRef}
          className={`detection-canvas ${overlayEnabled ? '' : 'hidden'}`}
          width={640}
          height={480}
        />

        {/* Controls */}
        <div className="detection-controls">
          <button
            className={`detection-control-btn ${overlayEnabled ? 'active' : ''}`}
            onClick={toggleOverlayEnabled}
            title={overlayEnabled ? 'Masquer détections' : 'Afficher détections'}
          >
            {overlayEnabled ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>

          <button
            className="detection-control-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        {/* Stats overlay */}
        {overlayEnabled && (
          <div className="detection-stats">
            <div className="stat-item">
              <span className="stat-label">Détections:</span>
              <span className="stat-value">{detections.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Confiance min:</span>
              <span className="stat-value">{Math.round(minConfidence * 100)}%</span>
            </div>
            {detections.length === 0 && (
              <div className="stat-item">
                <span className="stat-label">État:</span>
                <span className="stat-value">Aucune détection disponible</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

DetectionOverlay.displayName = 'DetectionOverlay';

// Normalize box coordinates (0-1 to pixel values)
function normalizeBox(
  detection: Detection,
  _canvasWidth: number,
  _canvasHeight: number
): DetectionBox {
  return {
    x: detection.x || 0,
    y: detection.y || 0,
    width: detection.width || 100,
    height: detection.height || 100,
    label: detection.label || 'Unknown',
    confidence: detection.confidence || 0,
    color: detection.color || getColorByLabel(detection.label),
  };
}

// Draw bounding box with label
function drawBox(
  ctx: CanvasRenderingContext2D,
  box: DetectionBox,
  showLabel: boolean,
  showConfidence: boolean
) {
  const { x, y, width, height, label, confidence, color = '#3b82f6' } = box;

  // Draw box
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, width, height);

  // Draw label background
  if (showLabel) {
    const labelText = showConfidence
      ? `${label} ${Math.round(confidence * 100)}%`
      : label;

    ctx.font = '14px Inter, system-ui, sans-serif';
    const textMetrics = ctx.measureText(labelText);
    const textWidth = textMetrics.width;
    const textHeight = 20;

    ctx.fillStyle = color;
    ctx.fillRect(x, y - textHeight - 4, textWidth + 12, textHeight + 4);

    // Draw label text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(labelText, x + 6, y - 8);
  }

  // Draw corner markers
  const cornerSize = 15;
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(x, y + cornerSize);
  ctx.lineTo(x, y);
  ctx.lineTo(x + cornerSize, y);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(x + width - cornerSize, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + cornerSize);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(x, y + height - cornerSize);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x + cornerSize, y + height);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(x + width - cornerSize, y + height);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x + width, y + height - cornerSize);
  ctx.stroke();
}

// Get color by detection label
function getColorByLabel(label: string): string {
  const colors: Record<string, string> = {
    person: '#10b981',
    face: '#3b82f6',
    hand: '#f59e0b',
    object: '#8b5cf6',
    unknown: '#64748b',
  };

  const lowerLabel = label?.toLowerCase() || 'unknown';
  return colors[lowerLabel] || colors.unknown || '#64748b';
}
