/**
 * TITANE_INFINITY v∞.7 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.7 — VOICE EMERGENCY RESET BUTTON
 *   Bouton d'urgence pour force reset du pipeline vocal
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { useVoiceEngine } from '@/hooks/useVoiceEngine';

interface VoiceEmergencyResetProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function VoiceEmergencyReset({
  className = '',
  size = 'md',
  showLabel = true,
}: VoiceEmergencyResetProps) {
  const voice = useVoiceEngine();
  const [isResetting, setIsResetting] = useState(false);
  const [lastResetTime, setLastResetTime] = useState<Date | null>(null);

  const handleForceReset = async () => {
    try {
      setIsResetting(true);
      console.warn('🔥 User triggered force voice reset');

      await voice.forceVoiceReset();

      setLastResetTime(new Date());
      console.log('✅ Voice reset complete');

      // Show success feedback
      setTimeout(() => setIsResetting(false), 1000);
    } catch (error) {
      console.error('❌ Force reset failed:', error);
      setIsResetting(false);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={`voice-emergency-reset ${className}`}>
      <button
        onClick={handleForceReset}
        disabled={isResetting}
        className={`
          ${sizeClasses[size]}
          bg-red-600 hover:bg-red-700 disabled:bg-red-400
          text-white font-semibold rounded-lg
          flex items-center gap-2
          transition-all duration-200
          active:scale-95
          disabled:cursor-not-allowed
          shadow-lg hover:shadow-xl
          ${isResetting ? 'animate-pulse' : ''}
        `}
        title="Force reset du pipeline vocal (tue tous les processus, reset état)"
      >
        {/* Icon */}
        <svg
          className={`${iconSizes[size]} ${isResetting ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isResetting ? (
            // Loading spinner
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          ) : (
            // Emergency icon
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          )}
        </svg>

        {/* Label */}
        {showLabel && (
          <span>
            {isResetting ? 'Reset...' : 'Force Reset Voice'}
          </span>
        )}
      </button>

      {/* Last reset timestamp */}
      {lastResetTime && !isResetting && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Dernier reset : {lastResetTime.toLocaleTimeString()}
        </div>
      )}

      {/* Warning message */}
      {!isResetting && (
        <div className="mt-1 text-xs text-orange-600 dark:text-orange-400">
          ⚠️ Utiliser uniquement en cas d'erreur vocale bloquante
        </div>
      )}
    </div>
  );
}

/**
 * Compact version (icon only)
 */
export function VoiceEmergencyResetCompact({ className = '' }: { className?: string }) {
  return (
    <VoiceEmergencyReset
      className={className}
      size="sm"
      showLabel={false}
    />
  );
}

export default VoiceEmergencyReset;
