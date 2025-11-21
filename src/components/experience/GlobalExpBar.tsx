// 🎮 GlobalExpBar — Barre XP toujours visible (HUD premium)
// Cliquer → ouvre ExpPanel complet

import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import '../../styles/exp-fusion.css';

interface GlobalExpState {
  total_exp: number;
  level: number;
  exp_to_next_level: number;
  exp_current_level: number;
  level_progress: number;
}

export const GlobalExpBar: React.FC<{ onOpenPanel: () => void }> = ({ onOpenPanel }) => {
  const [expState, setExpState] = useState<GlobalExpState>({
    total_exp: 0,
    level: 1,
    exp_to_next_level: 100,
    exp_current_level: 0,
    level_progress: 0,
  });

  useEffect(() => {
    fetchExpState();
    const interval = setInterval(fetchExpState, 5000); // Refresh toutes les 5s
    return () => clearInterval(interval);
  }, []);

  const fetchExpState = async () => {
    try {
      const state = await invoke<GlobalExpState>('exp_get_global_state');
      setExpState(state);
    } catch (error) {
      console.error('Erreur fetch EXP state:', error);
    }
  };

  return (
    <div className="exp-global-bar" onClick={onOpenPanel} title="Cliquer pour ouvrir le panneau EXP">
      <div className="exp-level-badge">
        <span>💎</span>
        <span>NIV {expState.level}</span>
      </div>

      <div className="exp-progress-container">
        <div
          className="exp-progress-fill"
          style={{ width: `${expState.level_progress * 100}%` }}
        />
      </div>

      <div className="exp-progress-text">
        {expState.exp_current_level.toLocaleString()} / {expState.exp_to_next_level.toLocaleString()} XP
      </div>
    </div>
  );
};

export default GlobalExpBar;
