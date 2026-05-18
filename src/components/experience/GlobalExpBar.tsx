/**
 * TITANE∞ v35.1.8 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// GlobalExpBar — Barre XP toujours visible (HUD premium)
// Cliquer → ouvre ExpPanel complet

import React from 'react';
import { useExperience } from '@/hooks/useExperience';
import '../../styles/exp-fusion.css';

export const GlobalExpBar: React.FC<{ onOpenPanel: () => void }> = ({ onOpenPanel }) => {
  const { totalXp, level, xpForNextLevel, progress } = useExperience();

  return (
    <div
      className="exp-global-bar"
      onClick={onOpenPanel}
      title="Cliquer pour ouvrir le panneau EXP"
    >
      <div className="exp-level-badge">
        <span>XP</span>
        <span>NIV {level}</span>
      </div>

      <div className="exp-progress-container">
        <div
          className="exp-progress-fill"
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </div>

      <div className="exp-progress-text">
        {totalXp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
      </div>
    </div>
  );
};

export default GlobalExpBar;
