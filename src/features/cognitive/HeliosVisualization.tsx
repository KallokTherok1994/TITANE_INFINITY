/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Helios Visualization
 * Module de visualisation du système Helios (analyse d'état)
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../ui';
import { colors, spacing } from '@themes/tokens';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface HeliosMetrics {
  emotional_tone: string;
  stress_level: number;
  clarity_level: number;
  energy_level: number;
  focus_level: number;
  cognitive_load: number;
}

export interface HeliosVisualizationProps {
  metrics: HeliosMetrics;
  animated?: boolean;
}

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const HeliosVisualization = ({
  metrics,
}: HeliosVisualizationProps): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions] = useState({ width: 400, height: 400 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(dimensions.width, dimensions.height) / 3;

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = colors.rubis.primary[900];
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw metrics as radar chart
    const metricsArray = [
      { label: 'Stress', value: metrics.stress_level },
      { label: 'Clarity', value: metrics.clarity_level },
      { label: 'Energy', value: metrics.energy_level },
      { label: 'Focus', value: metrics.focus_level },
      { label: 'Load', value: metrics.cognitive_load },
    ];

    const angleStep = (2 * Math.PI) / metricsArray.length;

    // Draw radar lines
    ctx.beginPath();
    metricsArray.forEach((metric, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const value = metric.value * radius;
      const x = centerX + Math.cos(angle) * value;
      const y = centerY + Math.sin(angle) * value;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.fillStyle = `${colors.rubis.primary[500]}33`;
    ctx.fill();
    ctx.strokeStyle = colors.rubis.primary[500];
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw axis lines and labels
    ctx.strokeStyle = colors.neutral[700];
    ctx.lineWidth = 1;
    ctx.fillStyle = colors.neutral[300];
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';

    metricsArray.forEach((metric, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // Axis line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Label
      const labelX = centerX + Math.cos(angle) * (radius + 30);
      const labelY = centerY + Math.sin(angle) * (radius + 30);
      ctx.fillText(metric.label, labelX, labelY);
    });

    // Draw center point
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
    ctx.fillStyle = colors.rubis.primary[500];
    ctx.fill();
  }, [metrics, dimensions]);

  return (
    <Card variant="glass" elevation="lg" padding={6}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3
          style={{
            margin: `0 0 ${spacing[4]} 0`,
            fontSize: '1.25rem',
            fontWeight: 600,
            color: colors.neutral[100],
          }}
        >
          🌅 Helios - État Cognitif
        </h3>

        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{ width: '100%', height: 'auto' }}
        />

        <div
          style={{
            marginTop: spacing[4],
            padding: spacing[4],
            background: colors.rubis.surface.translucent,
            borderRadius: '8px',
          }}
        >
          <p style={{ margin: 0, color: colors.neutral[300], fontSize: '0.875rem' }}>
            <strong>Tone émotionnel:</strong> {metrics.emotional_tone}
          </p>
        </div>
      </motion.div>
    </Card>
  );
};
