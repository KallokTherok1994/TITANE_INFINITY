/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.25.0 — MASTER DEV + SINGULARITY + VISION + BACKEND + MEMORY
 *   Badge visuel pour indiquer tous les moteurs experts actifs
 *   Super Prompts #7 à #11: Full IDE + Singularity + Vision + Backend + Memory
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { Terminal } from 'lucide-react';
import './DevSudoBadge.css';

interface DevSudoBadgeProps {
  active?: boolean;
  compact?: boolean;
}

export const DevSudoBadge: React.FC<DevSudoBadgeProps> = ({
  active = true,
  compact = false,
}) => {
  if (!active) return null;

  return (
    <div className={`dev-sudo-badge ${compact ? 'compact' : ''}`} title="TITANE∞ MASTER ENGINES v∞.25.0 — 87 commandes totales (IDE 19 + Singularity 6 + Vision 5 + Backend 7 + Memory 8 + Base 42)">
      <Terminal size={compact ? 12 : 14} className="dev-sudo-icon" />
      {!compact && <span className="dev-sudo-label">MASTER DEV</span>}
      <span className="dev-sudo-pulse" />
    </div>
  );
};
