/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * 🌊 FullDuplexWave.tsx - Visualisation combinée entrée/sortie duplex
 * Affiche simultanément les flux audio user + IA
 */

import React, { useEffect, useRef } from 'react';

interface FullDuplexWaveProps {
  /** Données audio entrée (user) */
  inputData?: number[];
  /** Données audio sortie (IA) */
  outputData?: number[];
  /** Hauteur */
  height?: number;
  /** Mode affichage */
  mode?: 'split' | 'overlay' | 'mirror';
  /** Afficher labels */
  showLabels?: boolean;
}

export const FullDuplexWave: React.FC<FullDuplexWaveProps> = ({
  inputData = [],
  outputData = [],
  height = 300,
  mode = 'split',
  showLabels = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      if (mode === 'split') {
        drawSplitMode(ctx, rect.width, rect.height, inputData, outputData);
      } else if (mode === 'overlay') {
        drawOverlayMode(ctx, rect.width, rect.height, inputData, outputData);
      } else if (mode === 'mirror') {
        drawMirrorMode(ctx, rect.width, rect.height, inputData, outputData);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [inputData, outputData, mode]);

  return (
    <div className="full-duplex-wave">
      {showLabels && (
        <div className="duplex-labels">
          <div className="duplex-label input">
            <span className="label-dot" style={{ backgroundColor: '#06b6d4' }} />
            Entrée (Vous)
          </div>
          <div className="duplex-label output">
            <span className="label-dot" style={{ backgroundColor: '#8b5cf6' }} />
            Sortie (IA)
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="duplex-canvas"
        style={{ width: '100%', height }}
      />
    </div>
  );
};

// ===== MODES DE RENDU =====

function drawSplitMode(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  inputData: number[],
  outputData: number[]
) {
  const centerY = height / 2;
  const quarterHeight = height / 4;

  // Ligne séparatrice
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(width, centerY);
  ctx.stroke();

  // Entrée (haut)
  drawWaveform(ctx, inputData, 64, width, quarterHeight, centerY / 2, '#06b6d4');

  // Sortie (bas)
  drawWaveform(ctx, outputData, 64, width, quarterHeight, centerY + centerY / 2, '#8b5cf6');
}

function drawOverlayMode(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  inputData: number[],
  outputData: number[]
) {
  const centerY = height / 2;
  const waveHeight = height * 0.4;

  // Sortie (arrière-plan)
  drawWaveform(ctx, outputData, 64, width, waveHeight, centerY, '#8b5cf6', 0.5);

  // Entrée (premier plan)
  drawWaveform(ctx, inputData, 64, width, waveHeight, centerY, '#06b6d4', 0.8);
}

function drawMirrorMode(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  inputData: number[],
  outputData: number[]
) {
  const centerY = height / 2;
  const waveHeight = height * 0.35;

  // Entrée (haut)
  drawWaveform(ctx, inputData, 64, width, waveHeight, centerY, '#06b6d4');

  // Sortie (bas, miroir)
  ctx.save();
  ctx.scale(1, -1);
  ctx.translate(0, -height);
  drawWaveform(ctx, outputData, 64, width, waveHeight, centerY, '#8b5cf6');
  ctx.restore();
}

function drawWaveform(
  ctx: CanvasRenderingContext2D,
  data: number[],
  barCount: number,
  width: number,
  maxHeight: number,
  centerY: number,
  color: string,
  opacity: number = 1
) {
  if (data.length === 0) return;

  const barWidth = width / barCount;
  const gap = barWidth * 0.2;
  const actualBarWidth = barWidth - gap;

  // Interpoler données
  const interpolated = interpolateArray(data, barCount);

  interpolated.forEach((value, i) => {
    const normalizedValue = value / 255;
    const barHeight = normalizedValue * maxHeight;
    const x = i * barWidth + gap / 2;
    const y = centerY - barHeight / 2;

    // Gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, `${color}40`);

    ctx.globalAlpha = opacity;
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, actualBarWidth, barHeight);

    // Glow
    ctx.shadowBlur = 8 * normalizedValue;
    ctx.shadowColor = color;
    ctx.fillRect(x, y, actualBarWidth, barHeight);
    ctx.shadowBlur = 0;
  });

  ctx.globalAlpha = 1;
}

function interpolateArray(data: number[], targetLength: number): number[] {
  if (data.length === 0) return new Array(targetLength).fill(0);
  
  const result: number[] = [];
  const ratio = data.length / targetLength;

  for (let i = 0; i < targetLength; i++) {
    const index = Math.floor(i * ratio);
    result.push(data[index] || 0);
  }

  return result;
}

export default FullDuplexWave;
