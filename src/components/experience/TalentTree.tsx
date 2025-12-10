/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.D1 - TalentTree (Visualiseur uniquement)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Tous les talents sont débloqués - Plus de logique de progression
 * Le TalentTree est maintenant un visualiseur, pas un système de jeu
 */

import React from 'react';

interface TalentTreeProps {
  talents?: unknown;
}

export const TalentTree: React.FC<TalentTreeProps> = () => {
  return (
    <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center' }}>
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'var(--text)',
          marginBottom: '1rem',
        }}
      >
        🌳 Arbre de Talents
      </h2>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Tous les talents sont débloqués par défaut
      </div>
      <div style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>
        Visualisation de l'arbre de talents à venir...
      </div>
    </div>
  );
};
