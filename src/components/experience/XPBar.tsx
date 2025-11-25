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

export const XPBar = (): JSX.Element => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [level, setLevel] = useState(1);
  const [xpToNext, setXpToNext] = useState(500);

  // Mettre à jour la barre toutes les secondes
  useEffect(() => {
    const updateBar = () => {
      setProgress(XP.getProgressToNextLevel());
      setLevel(XP.state.level);
      setXpToNext(XP.getXPToNextLevel());
    };

    updateBar();
    const interval = setInterval(updateBar, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="xp-bar-wrapper"
      onClick={() => navigate('/experience')}
      title={`Level ${level} • ${xpToNext} XP vers niveau ${level + 1}`}
      role="button"
      tabIndex={0}
    >
      <div className="xp-bar-info">
        <span className="xp-level">Nv.{level}</span>
        <span className="xp-next">{xpToNext} XP</span>
      </div>
      <div className="xp-bar-container">
        <div
          className="xp-bar"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
