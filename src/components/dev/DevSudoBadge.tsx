/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.23.0 — MASTER DEV ENGINE INDICATOR
 *   Badge visuel pour indiquer le mode IDE complet actif
 *   Super Prompt #7: Full IDE Mode + Multi-Dev Senior
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
    <div className={`dev-sudo-badge ${compact ? 'compact' : ''}`} title="MASTER DEV ENGINE v∞ — 61 commandes IDE disponibles">
      <Terminal size={compact ? 12 : 14} className="dev-sudo-icon" />
      {!compact && <span className="dev-sudo-label">MASTER DEV</span>}
      <span className="dev-sudo-pulse" />
    </div>
  );
};
