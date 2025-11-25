/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Sidebar Component
 * Sidebar intelligente avec navigation
 * ═══════════════════════════════════════════════════════════════
 */

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { colors, spacing, fontSizes, radius } from '@themes/tokens';
import { useAnimation } from '../../contexts/AnimationContext';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface SidebarItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  active?: boolean;
  badge?: string | number;
  children?: SidebarItem[];
}

export interface SidebarProps {
  items: SidebarItem[];
  onItemClick?: (item: SidebarItem) => void;
  collapsed?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
}

// ─────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────

const sidebarStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
};

const headerStyles: React.CSSProperties = {
  padding: spacing[6],
  borderBottom: `1px solid ${colors.rubis.primary[900]}`,
};

const navStyles: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: spacing[4],
};

const itemBaseStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: spacing[3],
  padding: `${spacing[3]} ${spacing[4]}`,
  borderRadius: radius.md,
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontSize: fontSizes.sm,
  color: colors.neutral[300],
  textDecoration: 'none',
  marginBottom: spacing[1],
};

const itemActiveStyles: React.CSSProperties = {
  background: colors.rubis.surface.translucent,
  color: colors.rubis.primary[400],
  borderLeft: `3px solid ${colors.rubis.primary[500]}`,
};

const badgeStyles: React.CSSProperties = {
  marginLeft: 'auto',
  padding: `${spacing[1]} ${spacing[2]}`,
  borderRadius: radius.full,
  fontSize: fontSizes.xs,
  fontWeight: 600,
  background: colors.rubis.primary[700],
  color: colors.rubis.primary[300],
};

const footerStyles: React.CSSProperties = {
  padding: spacing[6],
  borderTop: `1px solid ${colors.rubis.primary[900]}`,
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const Sidebar = ({
  items,
  onItemClick,
  collapsed = false,
  header,
  footer,
}: SidebarProps): JSX.Element => {
  const { animationConfig, shouldReduceMotion } = useAnimation();

  const handleClick = (item: SidebarItem): void => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const renderItem = (item: SidebarItem): JSX.Element => {
    const isActive = item.active ?? false;

    return (
      <motion.div
        key={item.id}
        style={{
          ...itemBaseStyles,
          ...(isActive && itemActiveStyles),
        }}
        onClick={() => handleClick(item)}
        whileHover={shouldReduceMotion ? undefined : {
          background: colors.rubis.surface.glass,
          paddingLeft: spacing[5],
        }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: animationConfig.duration }}
      >
        {item.icon && (
          <span style={{ display: 'flex', fontSize: '1.25rem' }}>
            {item.icon}
          </span>
        )}
        {!collapsed && (
          <>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span style={badgeStyles}>{item.badge}</span>
            )}
          </>
        )}
      </motion.div>
    );
  };

  return (
    <div style={sidebarStyles}>
      {header && <div style={headerStyles}>{header}</div>}

      <nav style={navStyles}>
        {items.map(item => renderItem(item))}
      </nav>

      {footer && <div style={footerStyles}>{footer}</div>}
    </div>
  );
};
