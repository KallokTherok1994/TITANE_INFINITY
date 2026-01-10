/**
 * TITANE∞ v20.0 — AppShell with DevTools
 * Super Prompt #3: DevTools UI Advanced Suite — Phase 5
 * @license MIT
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell, type AppShellProps } from './AppShell';
import { DevToolsApp } from '@/apps/devtools';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface AppShellWithDevToolsProps extends AppShellProps {
  /**
   * Active les DevTools (défaut: true en DEV, false en PROD)
   */
  devToolsEnabled?: boolean;
  /**
   * DevTools ouverts par défaut
   */
  devToolsDefaultOpen?: boolean;
  /**
   * Section DevTools par défaut
   */
  devToolsDefaultSection?:
    | 'dashboard'
    | 'metrics'
    | 'logs'
    | 'engines'
    | 'memory'
    | 'pipeline'
    | 'errors';
}

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

const DEVTOOLS_WIDTH_DESKTOP = 480;
const DEVTOOLS_WIDTH_TABLET = 400;

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

/**
 * AppShellWithDevTools - Layout avec DevTools intégrés
 *
 * Desktop: 3-panel layout (sidebar | content | devtools)
 * Tablet: Drawer coulissant depuis la droite
 * Mobile: Modal fullscreen
 *
 * @example
 * ```tsx
 * <AppShellWithDevTools
 *   header={<Header />}
 *   sidebar={<Sidebar />}
 *   devToolsEnabled={import.meta.env.DEV}
 * >
 *   <MainContent />
 * </AppShellWithDevTools>
 * ```
 */
export const AppShellWithDevTools = ({
  children,
  devToolsEnabled = import.meta.env.DEV,
  devToolsDefaultOpen = false,
  devToolsDefaultSection = 'dashboard',
  className,
  ...appShellProps
}: AppShellWithDevToolsProps): JSX.Element => {
  const [devToolsOpen, setDevToolsOpen] = useState(devToolsDefaultOpen);

  // Si DevTools désactivés, retourner AppShell standard
  if (!devToolsEnabled) {
    return (
      <AppShell {...appShellProps} className={className}>
        {children}
      </AppShell>
    );
  }

  return (
    <div className={cn('relative h-screen w-screen overflow-hidden', className)}>
      {/* Toggle Button (Fixed Top-Right) */}
      <motion.button
        onClick={() => setDevToolsOpen(!devToolsOpen)}
        className={cn(
          'fixed top-4 right-4 z-9999',
          'w-12 h-12 rounded-full',
          'flex items-center justify-center',
          'transition-all duration-200',
          'shadow-lg hover:shadow-xl',
          'border-2',
          devToolsOpen
            ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
            : 'bg-gray-700/80 border-gray-600/50 text-gray-300 hover:bg-gray-600/80'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={devToolsOpen ? 'Fermer DevTools' : 'Ouvrir DevTools'}
      >
        <span className="text-xl">{devToolsOpen ? '✕' : '🛠️'}</span>
      </motion.button>

      {/* Desktop Layout (≥1024px): 3-panel layout */}
      <div className="hidden lg:flex h-full">
        {/* Main App (AppShell) */}
        <div
          className="transition-all duration-300 ease-in-out"
          style={{
            width: devToolsOpen ? `calc(100% - ${DEVTOOLS_WIDTH_DESKTOP}px)` : '100%',
          }}
        >
          <AppShell {...appShellProps}>{children}</AppShell>
        </div>

        {/* DevTools Panel (Right) */}
        <AnimatePresence>
          {devToolsOpen && (
            <motion.div
              className="border-l shadow-2xl"
              style={{
                width: DEVTOOLS_WIDTH_DESKTOP,
                background: 'var(--bg-base, #050607)',
                borderColor: 'var(--border, rgba(196,196,196,0.12))',
              }}
              initial={{ x: DEVTOOLS_WIDTH_DESKTOP }}
              animate={{ x: 0 }}
              exit={{ x: DEVTOOLS_WIDTH_DESKTOP }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <DevToolsApp defaultSection={devToolsDefaultSection} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tablet Layout (768px-1023px): Drawer from right */}
      <div className="hidden md:flex lg:hidden h-full relative">
        {/* Main App */}
        <div className="w-full">
          <AppShell {...appShellProps}>{children}</AppShell>
        </div>

        {/* DevTools Drawer */}
        <AnimatePresence>
          {devToolsOpen && (
            <>
              {/* Overlay */}
              <motion.div
                className="absolute inset-0 bg-black/50 z-[9990]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDevToolsOpen(false)}
              />

              {/* Drawer */}
              <motion.div
                className="absolute top-0 right-0 h-full shadow-2xl z-[9991] border-l"
                style={{
                  width: DEVTOOLS_WIDTH_TABLET,
                  background: 'var(--bg-base, #050607)',
                  borderColor: 'var(--border, rgba(196,196,196,0.12))',
                }}
                initial={{ x: DEVTOOLS_WIDTH_TABLET }}
                animate={{ x: 0 }}
                exit={{ x: DEVTOOLS_WIDTH_TABLET }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <DevToolsApp defaultSection={devToolsDefaultSection} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Layout (<768px): Modal fullscreen */}
      <div className="flex md:hidden h-full relative">
        {/* Main App */}
        <div className="w-full">
          <AppShell {...appShellProps}>{children}</AppShell>
        </div>

        {/* DevTools Modal */}
        <AnimatePresence>
          {devToolsOpen && (
            <motion.div
              className="absolute inset-0 z-[9990]"
              style={{
                background: 'var(--bg-base, #050607)',
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DevToolsApp defaultSection={devToolsDefaultSection} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AppShellWithDevTools;
