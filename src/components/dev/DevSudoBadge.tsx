/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.21.0 — DEV-SUDO MODE INDICATOR
 *   Badge visuel pour indiquer le mode développeur actif dans le chat
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
    <div className={`dev-sudo-badge ${compact ? 'compact' : ''}`}>
      <Terminal size={compact ? 12 : 14} className="dev-sudo-icon" />
      {!compact && <span className="dev-sudo-label">DEV-SUDO</span>}
      <span className="dev-sudo-pulse" />
    </div>
  );
};
