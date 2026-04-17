/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ vΩ — AppShell Layout (Sans Sidebar)
 * Layout principal TopNav + contenu centré
 * UI/UX Rework vΩ: Suppression sidebar, navigation horizontale uniquement
 * ═══════════════════════════════════════════════════════════════
 */

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn'; // Utility for conditional classes
import AgentDashboardsPanel from '@/components/AgentDashboardsPanel';

const APP_SHELL_ZOOM_VAR = 'var(--titane-ui-scale, 1)';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface AppShellProps {
  children: ReactNode;
  topNav?: ReactNode;
  footer?: ReactNode;
  footerOverlay?: boolean;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const AppShell = ({
  children,
  topNav,
  footer,
  footerOverlay = false,
  className,
}: AppShellProps): JSX.Element => {
  return (
    <div
      className={cn(
        'flex h-full min-h-0 w-full min-w-0 max-w-full flex-col overflow-hidden bg-titanium-bg-base',
        className
      )}
      style={{
        height: `calc(100% / ${APP_SHELL_ZOOM_VAR})`,
        minHeight: `calc(100% / ${APP_SHELL_ZOOM_VAR})`,
      }}
    >
      {/* TopNav (remplace header + sidebar) */}
      {topNav && (
        <div className="relative z-10000" style={{ zIndex: 'var(--z-dev-tools)' }}>
          {topNav}
        </div>
      )}

      {/* Main Content (plein écran, sans sidebar) */}
      <main
        role="main"
        className="relative flex h-full min-h-0 max-w-full min-w-0 flex-1 flex-col overflow-hidden"
        style={
          topNav
            ? {
                paddingTop: `calc((4rem + env(safe-area-inset-top, 0px)) / ${APP_SHELL_ZOOM_VAR})`,
              }
            : undefined
        }
      >
        <div
          className="scrollbar-custom flex h-full min-h-0 w-full min-w-0 max-w-full flex-1 flex-col overflow-auto"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {children}
        </div>
        <AgentDashboardsPanel />
      </main>

      {/* Footer */}
      {footer && (
        <motion.footer
          className={cn(
            'glass-strong border-t border-titanium-border-default flex items-center px-6 text-sm text-titanium-text-tertiary z-fixed',
            footerOverlay
              ? 'absolute bottom-0 left-0 right-0 min-h-0 h-auto py-1 pointer-events-none'
              : 'h-footer'
          )}
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
