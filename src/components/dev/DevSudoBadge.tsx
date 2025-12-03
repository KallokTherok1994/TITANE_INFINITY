/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.ONE — UNIFIED BRAIN + MASTER DEV + SINGULARITY + VISION + BACKEND + MEMORY
 *   Badge visuel pour indiquer tous les moteurs experts actifs
 *   Super Prompts #7 à #11 + #SINGULARITY: Full IDE + Singularity + Vision + Backend + Memory + TITANE∞ ONE
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
    <div className={`dev-sudo-badge ${compact ? 'compact' : ''}`} title="TITANE∞ ONE UNIFIED v∞ — 98 commandes totales (TITANE∞ ONE 11 + IDE 19 + Singularity 6 + Vision 5 + Backend 7 + Memory 8 + Base 42)">
      <Terminal size={compact ? 12 : 14} className="dev-sudo-icon" />
      {!compact && <span className="dev-sudo-label">TITANE∞ ONE</span>}
      <span className="dev-sudo-pulse" />
    </div>
  );
};
