/**
 * TITANE_INFINITY v19.3.0 — Energy Arcs Effect
 * Animated energy arcs between points
 *
 * Features:
 * - SVG-based arc rendering
 * - Smooth flow animation
 * - Multiple arc support
 * - Customizable colors and intensities
 */

import React, { useEffect, useRef } from 'react';

export interface ArcPoint {
  x: number;
  y: number;
}

export interface EnergyArc {
  id: string;
  start: ArcPoint;
  end: ArcPoint;
  color: string;
  intensity: number;
}

export interface EnergyArcsProps {
  arcs: EnergyArc[];
  className?: string;
  animated?: boolean;
}

export const EnergyArcs: React.FC<EnergyArcsProps> = ({
  arcs,
  className = '',
  animated = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Update viewBox to match container
    const updateViewBox = () => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      svgRef.current.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    };

    updateViewBox();
    window.addEventListener('resize', updateViewBox);

    return () => {
      window.removeEventListener('resize', updateViewBox);
    };
  }, []);

  /**
   * Generate SVG path for arc with control point
   */
  const generateArcPath = (start: ArcPoint, end: ArcPoint): string => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    // Control point for curved arc (perpendicular offset)
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const perpX = -dy * 0.3;
    const perpY = dx * 0.3;
    const controlX = midX + perpX;
    const controlY = midY + perpY;

    return `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`;
  };

  return (
    <svg
      ref={svgRef}
      className={`energy-arcs ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <defs>
        {/* Glow filter for arcs */}
        <filter id="arcGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Animated gradient for flow effect */}
        <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      {arcs.map(arc => {
        const path = generateArcPath(arc.start, arc.end);
        const strokeWidth = 2 + arc.intensity * 2;

        return (
          <g key={arc.id}>
            {/* Base arc (glow) */}
            <path
              d={path}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth + 2}
              opacity={0.3}
              filter="url(#arcGlow)"
            />

            {/* Main arc */}
            <path
              d={path}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              opacity={0.8}
              strokeLinecap="round"
            />

            {/* Animated flow */}
            {animated && (
              <path
                d={path}
                fill="none"
                stroke="url(#arcGradient)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                style={{
                  color: arc.color,
                }}
                className="arc-flow"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default EnergyArcs;
