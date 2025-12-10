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
import { XP } from '../../core/experience/XP_ENGINE';
import { useState, useEffect } from 'react';
import './XPBar.css';

export const XPBar = (): JSX.Element => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [level, setLevel] = useState(1);
  const [xpToNext, setXpToNext] = useState(500);
  const [isLevelUp, setIsLevelUp] = useState(false);

  // Mettre à jour la barre toutes les secondes
  useEffect(() => {
    const updateBar = () => {
      const newLevel = XP.state.level;
      const oldLevel = level;

      setProgress(XP.getProgressToNextLevel());
      setLevel(newLevel);
      setXpToNext(XP.getXPToNextLevel());

      // Détection level up
      if (newLevel > oldLevel) {
        setIsLevelUp(true);
        setTimeout(() => setIsLevelUp(false), 600);
      }
    };

    updateBar();
    const interval = setInterval(updateBar, 1000);
    return () => clearInterval(interval);
  }, [level]);

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
      aria-label={`Progression XP : Niveau ${level}, ${progress.toFixed(0)}% vers niveau ${level + 1}`}
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
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="xp-bar" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};
