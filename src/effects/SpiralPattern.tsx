/**
 * TITANE_INFINITY v19.3.0 — Spiral Pattern Effect
 * Rotating spiral visualization
 *
 * Features:
 * - SVG-based spiral generation
 * - Smooth rotation animation
 * - Customizable arms and density
 * - Color gradients
 */

import React from 'react';

export interface SpiralPatternProps {
  className?: string;
  color?: string;
  secondaryColor?: string;
  armCount?: number;
  rotationSpeed?: number;
  size?: string;
}

export const SpiralPattern: React.FC<SpiralPatternProps> = ({
  className = '',
  color = '#a78bfa',
  secondaryColor = '#c4b5fd',
  armCount = 3,
  rotationSpeed = 4,
  size = '200px',
}) => {
  /**
   * Generate spiral arm path
   */
  const generateSpiralArm = (armIndex: number, totalArms: number): string => {
    const points: string[] = [];
    const angleOffset = (armIndex / totalArms) * Math.PI * 2;
    const centerX = 100;
    const centerY = 100;

    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const angle = angleOffset + t * Math.PI * 4;
      const radius = t * 80;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }

    return points.join(' ');
  };

  return (
    <div
      className={`spiral-pattern ${className}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
      }}
    >
      <svg
        viewBox="0 0 200 200"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        className="spiral-rotate"
        data-rotation-speed={rotationSpeed}
      >
        <defs>
          {/* Gradient for spiral arms */}
          <linearGradient id="spiralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="50%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={secondaryColor} stopOpacity="1" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="spiralGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Spiral arms */}
        {Array.from({ length: armCount }).map((_, index) => (
          <path
            key={`arm-${index}`}
            d={generateSpiralArm(index, armCount)}
            fill="none"
            stroke="url(#spiralGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#spiralGlow)"
            opacity="0.8"
          />
        ))}

        {/* Center glow */}
        <circle
          cx="100"
          cy="100"
          r="8"
          fill={color}
          opacity="0.6"
          filter="url(#spiralGlow)"
        />
      </svg>

      <style>
        {`
          .spiral-rotate {
            animation: spiral-rotate ${rotationSpeed}s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default SpiralPattern;
