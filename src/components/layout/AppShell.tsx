/**
 * TITANE∞ v8.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v8.0 - AppShell Layout (Tailwind CSS)
 * Layout principal avec sidebar, header, et contenu
 * Migration: Inline styles → Tailwind classes
 * ═══════════════════════════════════════════════════════════════
 */

import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn'; // Utility for conditional classes

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
  className?: string;
}

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

const SIDEBAR_WIDTH = 280;
const SIDEBAR_WIDTH_COLLAPSED = 64;

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const AppShell = ({
  children,
  header,
  sidebar,
  footer,
  sidebarCollapsed = false,
  className,
}: AppShellProps): JSX.Element => {
  const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH;

  return (
    <div
      className={cn(
        'flex flex-col h-screen w-screen overflow-hidden bg-bg-primary',
        className
      )}
    >
      {/* Header */}
      {header && (
        <motion.header
          className="h-header glass-strong border-b border-border-default shadow-md flex items-center px-6 z-fixed"
          initial={{ y: -64 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {header}
        </motion.header>
      )}

      {/* Body: Sidebar + Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebar && (
          <AnimatePresence mode="wait">
            <motion.aside
              className="bg-bg-secondary border-r border-border-default shadow-lg flex flex-col overflow-hidden z-sticky"
              style={{ width: sidebarWidth }}
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
        <main className="flex-1 overflow-hidden relative flex flex-col">
          <div className="p-6 flex-1 overflow-auto scrollbar-custom">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <motion.footer
          className="h-footer glass-strong border-t border-border-default flex items-center px-6 text-sm text-text-muted z-fixed"
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
