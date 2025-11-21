/**
 * 🌊 WaveformVisualizer.tsx - Oscillateur audio premium style EQ
 * Visualisation temps réel avec détection tonalité → couleur dynamique
 * 60fps GPU-accelerated
 */

import React, { useEffect, useRef, useState } from 'react';
// import './WaveformVisualizer.css';

interface WaveformVisualizerProps {
  /** Données audio (fréquences 0-255) */
  audioData?: number[];
  /** Nombre de barres */
  barCount?: number;
  /** Hauteur maximale */
  maxHeight?: number;
  /** Mode de visualisation */
  mode?: 'bars' | 'lines' | 'particles' | 'hybrid';
  /** Activer couleurs dynamiques selon fréquence */
  dynamicColors?: boolean;
  /** Activer effet miroir */
  mirror?: boolean;
  /** Smoothing factor (0-1) */
  smoothing?: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  audioData = [],
  barCount = 64,
  maxHeight = 200,
  mode = 'hybrid',
  dynamicColors = true,
  mirror = true,
  smoothing = 0.7,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [smoothedData, setSmoothedData] = useState<number[]>(new Array(barCount).fill(0));
  const animationRef = useRef<number>();

  // Interpoler les données audio au nombre de barres souhaité
  const interpolateData = (data: number[], targetLength: number): number[] => {
    if (data.length === 0) return new Array(targetLength).fill(0);
    
    const result: number[] = [];
    const ratio = data.length / targetLength;

    for (let i = 0; i < targetLength; i++) {
      const index = Math.floor(i * ratio);
      result.push(data[index] || 0);
    }

    return result;
  };

  // Obtenir couleur selon fréquence
  const getFrequencyColor = (index: number, value: number): string => {
    if (!dynamicColors) return '#3b82f6';

    const ratio = index / barCount;
    const intensity = value / 255;

    if (ratio < 0.3) {
      // Graves - Cyan vers Bleu
      return `hsl(${190 + ratio * 30}, 100%, ${50 + intensity * 20}%)`;
    } else if (ratio < 0.7) {
      // Médiums - Bleu vers Violet
      return `hsl(${220 + (ratio - 0.3) * 100}, 100%, ${50 + intensity * 20}%)`;
    } else {
      // Aigus - Violet vers Rose
      return `hsl(${280 + (ratio - 0.7) * 60}, 100%, ${50 + intensity * 20}%)`;
    }
  };

  // Animation canvas
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

      const interpolated = interpolateData(audioData, barCount);
      
      // Smoothing pour mouvement fluide
      const newSmoothedData = smoothedData.map((prev, i) => {
        const target = interpolated[i] || 0;
        return prev + (target - prev) * (1 - smoothing);
      });
      setSmoothedData(newSmoothedData);

      const barWidth = rect.width / barCount;
      const gap = barWidth * 0.2;
      const actualBarWidth = barWidth - gap;

      newSmoothedData.forEach((value, i) => {
        const normalizedValue = value / 255;
        const barHeight = normalizedValue * maxHeight;
        const x = i * barWidth + gap / 2;
        const y = (rect.height - barHeight) / 2;

        const color = getFrequencyColor(i, value);

        // Mode bars
        if (mode === 'bars' || mode === 'hybrid') {
          // Gradient vertical
          const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, `${color}40`);

          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, actualBarWidth, barHeight);

          // Glow effect
          ctx.shadowBlur = 10 * normalizedValue;
          ctx.shadowColor = color;
        }

        // Mode lines
        if (mode === 'lines' || mode === 'hybrid') {
          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.moveTo(x, rect.height / 2 - barHeight / 2);
          ctx.lineTo(x + actualBarWidth, rect.height / 2 - barHeight / 2);
          ctx.stroke();
        }

        // Mode particles
        if (mode === 'particles' || mode === 'hybrid') {
          const particleCount = Math.ceil(normalizedValue * 5);
          for (let p = 0; p < particleCount; p++) {
            const px = x + actualBarWidth / 2 + (Math.random() - 0.5) * actualBarWidth;
            const py = y + Math.random() * barHeight;
            const size = 2 + Math.random() * 2;

            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fillStyle = `${color}80`;
            ctx.fill();
          }
        }

        // Effet miroir
        if (mirror) {
          ctx.globalAlpha = 0.3;
          ctx.fillRect(x, rect.height / 2 + barHeight / 2, actualBarWidth, barHeight);
          ctx.globalAlpha = 1;
        }
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioData, barCount, maxHeight, mode, dynamicColors, mirror, smoothing, smoothedData]);

  return (
    <div className="waveform-visualizer">
      <canvas
        ref={canvasRef}
        className="waveform-canvas"
        style={{ width: '100%', height: maxHeight }}
      />
      
      {/* Overlay gradient pour effet depth */}
      <div className="waveform-overlay" />
    </div>
  );
};

export default WaveformVisualizer;
