/**
 * TITANE∞ v8.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v8.0 - MobileNav Component (Tailwind CSS)
 * Navigation mobile responsive avec menu burger
 * Breakpoints: sm (640px), md (768px), lg (1024px)
 * ═══════════════════════════════════════════════════════════════
 */

import { type ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const handleItemClick = (item: SidebarItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header Bar - Visible only on mobile */}
      <div
        className={cn(
          'lg:hidden fixed top-0 left-0 right-0 z-fixed',
          'h-16 bg-bg-secondary border-b border-border-default',
          'flex items-center justify-between px-4',
          className
        )}
      >
        {/* Logo */}
        {logo && <div className="flex items-center">{logo}</div>}

        {/* Burger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'p-2 rounded-md text-text-primary',
            'hover:bg-bg-tertiary transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
          )}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Slide-in Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            className={cn(
              'lg:hidden fixed top-0 left-0 bottom-0 z-modal',
              'w-[280px] max-w-[85vw]',
              'bg-bg-secondary border-r border-border-default shadow-2xl',
              'flex flex-col overflow-hidden'
            )}
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {/* Header */}
            {header && (
              <div className="p-6 border-b border-border-default">
                {header}
              </div>
            )}

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto p-4 scrollbar-custom">
              {items.map(item => {
                const isActive = item.active ?? false;

                return (
                  <motion.div
                    key={item.id}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer mb-2',
                      'transition-all duration-200 text-sm',
                      isActive
                        ? 'bg-bg-tertiary text-violet-400 border-l-3 border-violet-500'
                        : 'text-text-secondary hover:bg-bg-tertiary'
                    )}
                    onClick={() => handleItemClick(item)}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Icon */}
                    {item.icon && (
                      <span className="flex text-xl">{item.icon}</span>
                    )}

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

            {/* Footer with Close Button */}
            <div className="p-4 border-t border-border-default">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full btn btn-ghost"
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
