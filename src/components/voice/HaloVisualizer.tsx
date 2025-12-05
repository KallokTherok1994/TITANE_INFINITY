/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ — Halo Visualizer v∞.7
 *   Visual feedback component for voice pipeline states
 * ═══════════════════════════════════════════════════════════════════
 *
 *   States:
 *   - idle      : Static blue ring
 *   - breathing : Slow cyan pulse (VAD speech detected)
 *   - pulsing   : Fast purple pulse (AI thinking)
 *   - shimmer   : Rapid gold shimmer (TTS speaking)
 *   - error     : Red pulse (error state)
 *
 *   Usage:
 *   <HaloVisualizer size="lg" showLabel={true} />
 *
 * ═══════════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { haloEngine, onHaloChange, type HaloState } from '@/services/voice/haloEngine';

interface HaloVisualizerProps {
  /** Size of the halo ring */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /** Show state label below ring */
  showLabel?: boolean;

  /** Custom className */
  className?: string;

  /** Show duration counter */
  showDuration?: boolean;
}

export function HaloVisualizer({
  size = 'md',
  showLabel = false,
  className = '',
  showDuration = false,
}: HaloVisualizerProps) {
  const [state, setState] = useState<HaloState>('idle');
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    // Subscribe to halo state changes
    const unsubscribe = onHaloChange((status) => {
      setState(status.state);
      setDuration(status.duration);
    });

    // Get initial state
    const status = haloEngine.getStatus();
    setState(status.state);
    setDuration(status.duration);

    return unsubscribe;
  }, []);

  // Size mapping
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  // State labels
  const stateLabels: Record<HaloState, string> = {
    idle: 'Inactif',
    breathing: 'Écoute...',
    pulsing: 'Réflexion...',
    shimmer: 'Parole...',
    error: 'Erreur',
  };

  // State emojis
  const stateEmojis: Record<HaloState, string> = {
    idle: '○',
    breathing: '🌊',
    pulsing: '⚡',
    shimmer: '✨',
    error: '🔴',
  };

  return (
    <div className={`halo-visualizer flex flex-col items-center gap-2 ${className}`}>
      {/* Halo Ring */}
      <div className={`halo-ring ${sizeClasses[size]} halo-${state}`}>
        <div className="halo-inner">
          <span className="halo-emoji">{stateEmojis[state]}</span>
        </div>
      </div>

      {/* State Label */}
      {showLabel && (
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {stateLabels[state]}
        </div>
      )}

      {/* Duration Counter */}
      {showDuration && duration > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {(duration / 1000).toFixed(1)}s
        </div>
      )}
    </div>
  );
}

/**
 * Compact inline halo indicator (for toolbar/status bar)
 */
export function HaloIndicator() {
  const [state, setState] = useState<HaloState>('idle');

  useEffect(() => {
    const unsubscribe = onHaloChange((status) => setState(status.state));
    return unsubscribe;
  }, []);

  const stateColors: Record<HaloState, string> = {
    idle: 'bg-blue-500',
    breathing: 'bg-cyan-500',
    pulsing: 'bg-purple-500',
    shimmer: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  return (
    <div className="halo-indicator inline-flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${stateColors[state]} halo-indicator-dot halo-${state}`}
      />
    </div>
  );
}
