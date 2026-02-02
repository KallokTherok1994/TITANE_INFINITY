/**
 * TITANE∞ v24.3.0 — Proprietary License
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

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface AppShellProps {
  children: ReactNode;
  topNav?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const AppShell = ({
  children,
  topNav,
  footer,
  className,
}: AppShellProps): JSX.Element => {
  // TEST VIOLATION: Modification UI sans entry registry (doit échouer GATE_UI_INDEX)
  return (
    <div
      className={cn(
        'flex flex-col h-screen w-screen overflow-hidden bg-titanium-bg-base',
        className
      )}
    >
      {/* TopNav (remplace header + sidebar) */}
      {topNav && (
        <motion.div
          initial={{ y: -64 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {topNav}
        </motion.div>
      )}

      {/* Main Content (plein écran, sans sidebar) */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        <div className="flex-1 overflow-auto scrollbar-custom w-full">
          {children}
        </div>
      </main>

      {/* Footer */}
      {footer && (
        <motion.footer
          className="h-footer glass-strong border-t border-titanium-border-default flex items-center px-6 text-sm text-titanium-text-tertiary z-fixed"
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
