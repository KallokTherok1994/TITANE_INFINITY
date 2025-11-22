/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - AppShell Layout
 * Layout principal avec sidebar, header, et contenu
 * ═══════════════════════════════════════════════════════════════
 */

import { type ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, spacing, shadows } from '@themes/tokens';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface AppShellProps {
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

const SIDEBAR_WIDTH = 280;
const SIDEBAR_WIDTH_COLLAPSED = 64;
const HEADER_HEIGHT = 64;

// ─────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────

const shellStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
  background: colors.neutral[950],
};

const headerStyles: React.CSSProperties = {
  height: `${HEADER_HEIGHT}px`,
  background: colors.rubis.surface.glass,
  backdropFilter: 'blur(20px)',
  borderBottom: `1px solid ${colors.rubis.primary[900]}`,
  boxShadow: shadows.md,
  display: 'flex',
  alignItems: 'center',
  padding: `0 ${spacing[6]}`,
  zIndex: 100,
};

const bodyStyles: React.CSSProperties = {
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
};

const sidebarStyles: React.CSSProperties = {
  background: colors.rubis.surface.solid,
  borderRight: `1px solid ${colors.rubis.primary[900]}`,
  boxShadow: shadows.lg,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  zIndex: 90,
};

const mainStyles: React.CSSProperties = {
  flex: 1,
  overflow: 'auto',
  position: 'relative',
};

const contentStyles: React.CSSProperties = {
  padding: spacing[6],
  minHeight: '100%',
};

const footerStyles: React.CSSProperties = {
  height: '48px',
  background: colors.rubis.surface.glass,
  backdropFilter: 'blur(20px)',
  borderTop: `1px solid ${colors.rubis.primary[900]}`,
  display: 'flex',
  alignItems: 'center',
  padding: `0 ${spacing[6]}`,
  fontSize: '0.875rem',
  color: colors.neutral[400],
  zIndex: 100,
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const AppShell = ({
  children,
  header,
  sidebar,
  footer,
  sidebarCollapsed: controlledCollapsed,
}: AppShellProps): JSX.Element => {
  const [internalCollapsed] = useState(false);

  const collapsed = controlledCollapsed ?? internalCollapsed;
  const sidebarWidth = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH;

  return (
    <div style={shellStyles}>
      {/* Header */}
      {header && (
        <motion.header
          style={headerStyles}
          initial={{ y: -HEADER_HEIGHT }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {header}
        </motion.header>
      )}

      {/* Body: Sidebar + Main */}
      <div style={bodyStyles}>
        {/* Sidebar */}
        {sidebar && (
          <AnimatePresence mode="wait">
            <motion.aside
              style={sidebarStyles}
              initial={{ x: -sidebarWidth }}
              animate={{ 
                x: 0,
                width: sidebarWidth,
              }}
              transition={{ 
                duration: 0.3, 
                ease: 'easeInOut',
              }}
            >
              {sidebar}
            </motion.aside>
          </AnimatePresence>
        )}

        {/* Main Content */}
        <main style={mainStyles}>
          <div style={contentStyles}>{children}</div>
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <motion.footer
          style={footerStyles}
          initial={{ y: 48 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {footer}
        </motion.footer>
      )}
    </div>
  );
};
