/**
 * TITANE_INFINITY v19.3.0 — Audio Waveform Effect
 * Animated audio visualization bars
 *
 * Features:
 * - Multiple bars with staggered animation
 * - Real-time audio data support
 * - Smooth transitions
 * - Customizable colors and bar count
 */

import React from 'react';

export interface AudioWaveformProps {
  className?: string;
  barCount?: number;
  color?: string;
  height?: string;
  gap?: string;
  audioData?: number[];
  animated?: boolean;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  className = '',
  barCount = 5,
  color = '#34d399',
  height = '100%',
  gap = '4px',
  audioData,
  animated = true,
}) => {
  return (
    <div
      className={`audio-waveform ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap,
        height,
      }}
    >
      {Array.from({ length: barCount }).map((_, index) => {
        // Use audio data if provided, otherwise use animation
        const barHeight = audioData
          ? `${audioData[index] || 20}%`
          : '20%';

        return (
          <div
            key={`bar-${index}`}
            className={animated && !audioData ? 'waveform-bar' : ''}
            style={{
              flex: '1',
              backgroundColor: color,
              borderRadius: '2px',
              height: barHeight,
              minHeight: '10%',
              maxHeight: '100%',
              boxShadow: `0 0 8px ${color}`,
              transition: audioData
                ? 'height 100ms cubic-bezier(0.25, 0.1, 0.25, 1)'
                : 'none',
            }}
          />
        );
      })}
    </div>
  );
};

export default AudioWaveform;
