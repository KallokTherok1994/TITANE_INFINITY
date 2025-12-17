/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v26.0 - MobileNav Component (Responsive Optimized)
 * Navigation mobile avec:
 * - Touch targets 44px WCAG AAA
 * - Safe area support (iOS notch)
 * - Reduced blur for performance
 * - GPU acceleration
 * ═══════════════════════════════════════════════════════════════
 */

import { type ReactNode, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile, useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/utils/cn';
import type { SidebarItem } from './Sidebar';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface MobileNavProps {
  items: SidebarItem[];
  onItemClick?: (item: SidebarItem) => void;
  logo?: ReactNode;
  header?: ReactNode;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const MobileNav = ({
  items,
  onItemClick,
  logo,
  header,
  className,
}: MobileNavProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  // v26.0: Enhanced responsive hooks
  const isMobile = useIsMobile();
  const { reducedMotion } = useResponsive();

  // Close menu on route change
  useEffect(() => {
    const handleRouteChange = () => setIsOpen(false);
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Close on ESC key and prevent body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // v26.0: Memoized handlers
  const handleItemClick = useCallback(
    (item: SidebarItem) => {
      if (onItemClick) {
        onItemClick(item);
      }
      setIsOpen(false);
    },
    [onItemClick]
  );

  const toggleMenu = useCallback(() => setIsOpen(prev => !prev), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  return (
    <>
      {/* Mobile Header Bar - Visible only on mobile */}
      <div
        className={cn(
          'lg:hidden fixed top-0 left-0 right-0 z-fixed',
          // v26.0: Safe area support for iOS notch
          'h-16 bg-bg-secondary border-b border-border-default',
          'flex items-center justify-between px-4',
          // v26.0: GPU acceleration + reduced blur on mobile
          'backdrop-blur-sm will-change-transform',
          className
        )}
        style={{
          // v26.0: Safe area padding for notch
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        {/* Logo */}
        {logo && <div className="flex items-center">{logo}</div>}

        {/* Burger Button - v26.0: 44px touch target */}
        <button
          onClick={toggleMenu}
          className={cn(
            // v26.0: WCAG AAA touch target 44x44px
            'min-w-[44px] min-h-[44px] p-2 rounded-md text-text-primary',
            'hover:bg-bg-tertiary transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500',
            'flex items-center justify-center'
          )}
          aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-nav-menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              // X icon (close)
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              // Burger icon (open)
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 bg-black/50 z-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.2 }}
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Slide-in Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            id="mobile-nav-menu"
            role="navigation"
            aria-label="Menu principal mobile"
            className={cn(
              'lg:hidden fixed top-0 left-0 bottom-0 z-modal',
              'w-[280px] max-w-[85vw]',
              'bg-bg-secondary border-r border-border-default shadow-2xl',
              'flex flex-col overflow-hidden',
              // v26.0: GPU acceleration
              'will-change-transform'
            )}
            style={{
              // v26.0: Safe area support
              paddingTop: 'env(safe-area-inset-top, 0px)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{
              duration: reducedMotion ? 0.01 : 0.3,
              ease: 'easeInOut',
            }}
          >
            {/* Header */}
            {header && <div className="p-6 border-b border-border-default">{header}</div>}

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto p-4 scrollbar-custom">
              {items.map(item => {
                const isActive = item.active ?? false;

                return (
                  <motion.div
                    key={item.id}
                    className={cn(
                      // v26.0: 44px min-height for touch targets
                      'flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer mb-2',
                      'min-h-[44px] transition-all duration-200 text-sm',
                      isActive
                        ? 'bg-bg-tertiary text-violet-400 border-l-3 border-violet-500'
                        : 'text-text-secondary hover:bg-bg-tertiary'
                    )}
                    onClick={() => handleItemClick(item)}
                    whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                  >
                    {/* Icon */}
                    {item.icon && <span className="flex text-xl">{item.icon}</span>}

                    {/* Label */}
                    <span className="flex-1">{item.label}</span>

                    {/* Badge */}
                    {item.badge && (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-violet-700/50 text-violet-300">
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </nav>

            {/* Footer with Close Button - v26.0: 44px touch target */}
            <div
              className="p-4 border-t border-border-default"
              style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
            >
              <button
                onClick={closeMenu}
                className="w-full btn btn-ghost min-h-[44px]"
                aria-label="Fermer le menu"
              >
                Fermer le menu
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
