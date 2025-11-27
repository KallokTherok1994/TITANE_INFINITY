/**
 * TITANE∞ v16.2.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v16.2.2 - Header Component
 * Validation Finale 100% ✅ - Chat IA + Cognitive Layer + Real APIs
 * ═══════════════════════════════════════════════════════════════
 */

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { colors, spacing, fontSizes } from '@themes/tokens';
import { useAnimation } from '../../contexts/AnimationContext';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface HeaderProps {
  logo?: ReactNode;
  title?: string;
  subtitle?: ReactNode; // ✨ v∞.D4 - Support ReactNode pour barre XP
  navigation?: ReactNode;
  actions?: ReactNode;
}

// ─────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────

const headerStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: spacing[6],
  width: '100%',
};

const logoStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: spacing[3],
};

const titleContainerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

const titleStyles: React.CSSProperties = {
  fontSize: fontSizes['2xl'],
  fontWeight: 700,
  color: colors.neutral[100],
  margin: 0,
  lineHeight: 1.2,
};

const subtitleStyles: React.CSSProperties = {
  fontSize: fontSizes.sm,
  color: colors.neutral[400],
  margin: 0,
};

const navStyles: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: spacing[4],
  marginLeft: spacing[8],
};

const actionsStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: spacing[3],
  marginLeft: 'auto',
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const Header = ({
  logo,
  title,
  subtitle,
  navigation,
  actions,
}: HeaderProps): JSX.Element => {
  const { animationConfig } = useAnimation();

  return (
    <motion.div
      style={headerStyles}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: animationConfig.duration }}
    >
      {/* Logo */}
      {logo && (
        <div style={logoStyles}>
          {logo}
        </div>
      )}

      {/* Title & Subtitle */}
      {(title || subtitle) && (
        <div style={titleContainerStyles}>
          {title && <h1 style={titleStyles}>{title}</h1>}
          {subtitle && (
            typeof subtitle === 'string'
              ? <p style={subtitleStyles}>{subtitle}</p>
              : <div style={subtitleStyles}>{subtitle}</div>
          )}
        </div>
      )}

      {/* Navigation */}
      {navigation && (
        <nav style={navStyles}>
          {navigation}
        </nav>
      )}

      {/* Actions */}
      {actions && (
        <div style={actionsStyles}>
          {actions}
        </div>
      )}
    </motion.div>
  );
};
