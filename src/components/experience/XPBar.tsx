/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.D - XP Bar Component
 * ═══════════════════════════════════════════════════════════════════
 *
 * Barre de progression XP pour le Header
 */

import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useExperience } from '../../hooks/useExperience';
import './XPBar.css';

export const XPBar = (): JSX.Element => {
  const navigate = useNavigate();
  const { level, progress, xpForNextLevel, totalXp } = useExperience();
  const [previousLevel, setPreviousLevel] = useState(level);
  const [isLevelUp, setIsLevelUp] = useState(false);
  const progressPercent = progress * 100;
  const xpToNext = Math.max(0, xpForNextLevel - totalXp);

  useEffect(() => {
    if (level > previousLevel) {
      setIsLevelUp(true);
      const timeout = setTimeout(() => setIsLevelUp(false), 600);
      setPreviousLevel(level);
      return () => clearTimeout(timeout);
    }

    if (level !== previousLevel) {
      setPreviousLevel(level);
    }

    return undefined;
  }, [level, previousLevel]);

  return (
    <div
      className={`xp-bar-wrapper ${isLevelUp ? 'level-up' : ''}`}
      onClick={() => navigate('/experience')}
      onKeyPress={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate('/experience');
        }
      }}
      title={`Niveau ${level} • ${xpToNext} XP vers niveau ${level + 1}`}
      role="button"
      tabIndex={0}
      aria-label={`Progression XP : Niveau ${level}, ${progressPercent.toFixed(0)}% vers niveau ${level + 1}`}
    >
      <div className="xp-bar-info">
        <span className="xp-level" aria-hidden="true">
          Nv.{level}
        </span>
        <span className="xp-next" aria-hidden="true">
          {xpToNext} XP
        </span>
      </div>
      <div
        className="xp-bar-container"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="xp-bar" style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  );
};
