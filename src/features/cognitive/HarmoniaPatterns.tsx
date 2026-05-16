/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 - Harmonia Patterns Visualization
 * Visualisation des patterns comportementaux Harmonia
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge } from '../../ui';
import { useAnimation } from '../../contexts/AnimationContext';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface HarmoniaPattern {
  id: string;
  name: string;
  frequency: number;
  lastOccurrence: Date;
  confidence: number;
  category: 'productivity' | 'learning' | 'rest' | 'creative';
}

export interface HarmoniaPatternsProps {
  patterns: HarmoniaPattern[];
  selectedPattern?: string;
  onPatternSelect?: (patternId: string) => void;
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

const categoryColors: Record<HarmoniaPattern['category'], string> = {
  productivity: 'var(--color-text-secondary)',
  learning: 'var(--color-info-500)',
  rest: 'var(--color-success-500)',
  creative: 'var(--color-text-muted)',
};

const categoryLabels: Record<HarmoniaPattern['category'], string> = {
  productivity: 'Productivité',
  learning: 'Apprentissage',
  rest: 'Repos',
  creative: 'Créativité',
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const HarmoniaPatterns = ({
  patterns,
  selectedPattern,
  onPatternSelect,
}: HarmoniaPatternsProps): JSX.Element => {
  const {
    shouldReduceMotion: _shouldReduceMotion,
    shouldThrottle: _shouldThrottle,
    animationConfig: _animationConfig,
  } = useAnimation();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw frequency bars
    const barWidth = width / patterns.length;
    const maxFrequency = Math.max(...patterns.map(p => p.frequency), 1);

    patterns.forEach((pattern, index) => {
      const barHeight = (pattern.frequency / maxFrequency) * (height - 60);
      const x = index * barWidth;
      const y = height - barHeight - 30;

      // Bar background
      ctx.fillStyle = 'var(--color-border-subtle)';
      ctx.fillRect(x + 5, y, barWidth - 10, barHeight);

      // Bar fill
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, categoryColors[pattern.category]);
      gradient.addColorStop(1, `${categoryColors[pattern.category]}66`);
      ctx.fillStyle = gradient;
      ctx.fillRect(x + 5, y, (barWidth - 10) * pattern.confidence, barHeight);

      // Pattern name
      ctx.save();
      ctx.translate(x + barWidth / 2, height - 10);
      ctx.rotate(-Math.PI / 6);
      ctx.fillStyle = 'var(--color-text-muted)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(pattern.name, 0, 0);
      ctx.restore();
    });
  }, [patterns]);

  return (
    <Card variant="glass" elevation="lg" padding={6}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3
          style={{
            margin: '0 0 var(--space-4) 0',
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          🎵 Harmonia - Patterns Comportementaux
        </h3>

        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          style={{ width: '100%', height: 'auto' }}
        />

        <div
          style={{
            marginTop: 'var(--space-6)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: 'var(--space-3)',
          }}
        >
          {patterns.map(pattern => (
            <motion.div
              key={pattern.id}
              style={{
                padding: 'var(--space-4)',
                background:
                  selectedPattern === pattern.id
                    ? 'rgba(148,163,184,0.08)'
                    : 'var(--color-bg-primary)',
                borderRadius: '8px',
                border: `1px solid ${selectedPattern === pattern.id ? 'var(--color-border-default)' : 'var(--color-border-subtle)'}`,
                cursor: onPatternSelect ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
              onClick={() => onPatternSelect?.(pattern.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: 'var(--space-2)',
                }}
              >
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {pattern.name}
                </span>
                <Badge
                  variant="primary"
                  size="sm"
                  style={{
                    background: `${categoryColors[pattern.category]}33`,
                    color: categoryColors[pattern.category],
                  }}
                >
                  {categoryLabels[pattern.category]}
                </Badge>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 'var(--space-4)',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                <span>Fréquence: {pattern.frequency}</span>
                <span>Confiance: {Math.round(pattern.confidence * 100)}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Card>
  );
};
