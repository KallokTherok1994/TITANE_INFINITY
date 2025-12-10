/**
 * TITANE∞ vΩ∞ — COMPOSANT BARRE XP
 * Super Prompt #2: Affichage compact de la progression
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import React, { useMemo } from 'react';
import {
  useLevelInfo,
  useStreak,
  useAutomationXPStore,
} from '@/stores/useAutomationXPStore';
import './XPProgressBar.css';

interface XPProgressBarProps {
  compact?: boolean;
  showStreak?: boolean;
  showXPText?: boolean;
  className?: string;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  compact = false,
  showStreak = true,
  showXPText = true,
  className = '',
}) => {
  const levelInfo = useLevelInfo();
  const streak = useStreak();
  const xpAnimationQueue = useAutomationXPStore(state => state.xpAnimationQueue);

  const formattedXP = useMemo(() => {
    if (levelInfo.totalXP >= 1000000) {
      return `${(levelInfo.totalXP / 1000000).toFixed(1)}M`;
    }
    if (levelInfo.totalXP >= 1000) {
      return `${(levelInfo.totalXP / 1000).toFixed(1)}K`;
    }
    return levelInfo.totalXP.toString();
  }, [levelInfo.totalXP]);

  const formattedXPToNext = useMemo(() => {
    if (levelInfo.xpToNext >= 1000) {
      return `${(levelInfo.xpToNext / 1000).toFixed(1)}K`;
    }
    return levelInfo.xpToNext.toString();
  }, [levelInfo.xpToNext]);

  if (compact) {
    return (
      <div className={`xp-progress-bar xp-progress-bar--compact ${className}`}>
        <div
          className="xp-level-badge"
          style={{ '--level-color': levelInfo.color } as React.CSSProperties}
        >
          <span className="xp-level-icon">{levelInfo.icon}</span>
        </div>
        <div className="xp-progress-track">
          <div
            className="xp-progress-fill"
            style={
              {
                width: `${levelInfo.progress}%`,
                '--fill-color': levelInfo.color,
              } as React.CSSProperties
            }
          />
        </div>
        {xpAnimationQueue.length > 0 && (
          <span className="xp-gain-animation">+{xpAnimationQueue[0]}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`xp-progress-bar ${className}`}>
      <div className="xp-header">
        <div
          className="xp-level-badge"
          style={{ '--level-color': levelInfo.color } as React.CSSProperties}
        >
          <span className="xp-level-icon">{levelInfo.icon}</span>
          <span className="xp-level-label">{levelInfo.label}</span>
        </div>

        {showStreak && streak.current > 0 && (
          <div className="xp-streak-badge">
            <span className="xp-streak-icon">🔥</span>
            <span className="xp-streak-count">{streak.current}</span>
            {streak.multiplier > 1 && (
              <span className="xp-streak-multiplier">
                ×{streak.multiplier.toFixed(1)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="xp-progress-container">
        <div className="xp-progress-track">
          <div
            className="xp-progress-fill"
            style={
              {
                width: `${levelInfo.progress}%`,
                '--fill-color': levelInfo.color,
              } as React.CSSProperties
            }
          />
          <div
            className="xp-progress-glow"
            style={
              {
                width: `${levelInfo.progress}%`,
                '--glow-color': levelInfo.color,
              } as React.CSSProperties
            }
          />
        </div>

        {showXPText && (
          <div className="xp-text">
            <span className="xp-current">{formattedXP} XP</span>
            <span className="xp-separator">•</span>
            <span className="xp-remaining">{formattedXPToNext} restant</span>
          </div>
        )}
      </div>

      {xpAnimationQueue.length > 0 && (
        <div className="xp-gain-popup">+{xpAnimationQueue[0]} XP</div>
      )}
    </div>
  );
};

export default XPProgressBar;
