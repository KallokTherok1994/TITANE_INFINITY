/**
 * TITANE∞ v20.0 — TrendGraph Component
 * Super Prompt #3: DevTools UI Advanced Suite
 * @license MIT
 */

import React, { useEffect, useRef } from 'react';

export interface TrendGraphProps {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}

/**
 * TrendGraph - Mini graphique sparkline SVG
 * 
 * @example
 * ```tsx
 * <TrendGraph data={[10, 15, 12, 18, 20]} color="#93b399" height={40} />
 * ```
 */
export function TrendGraph({ data, color = '#727b81', height = 48, className = '' }: TrendGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const h = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, h);

    // Calculate min/max for normalization
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    // Draw line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    data.forEach((value, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = h - ((value - min) / range) * (h - 10) - 5;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw gradient fill
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = color;
    ctx.lineTo(width, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }, [data, color, height]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={height}
      className={`w-full ${className}`}
      style={{ display: 'block' }}
    />
  );
}
