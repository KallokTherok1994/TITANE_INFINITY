/**
 * TITANE∞ v26.2.0 — Proprietary License (Titanium Dark)
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v26.2.0 - Sidebar Component (Titanium Dark + WCAG 2.2)
 * Sidebar intelligente avec navigation adaptive
 * v26.2.0: Titanium Dark design system, WCAG 2.2 AA compliant
 * CRITICAL FIX: div → button for keyboard accessibility
 * ═══════════════════════════════════════════════════════════════
 */

import { type ReactNode, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../../contexts/AnimationContext';
import { useIsMobile, useIsTablet, useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/utils/cn';

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
  className?: string;
}

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

// v26.0: Breakpoint-based sidebar widths
const SIDEBAR_WIDTHS = {
  mobile: '100%',
  tablet: '240px',
  desktop: '260px',
  desktopLarge: '280px',
  desktopXL: '300px',
} as const;

export const Sidebar = ({
  items,
  onItemClick,
  collapsed = false,
  header,
  footer,
  className,
}: SidebarProps): JSX.Element => {
  const { animationConfig, shouldReduceMotion } = useAnimation();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const { width } = useResponsive();

  // v26.0: Adaptive sidebar width based on exact breakpoint
  const _sidebarWidth = useMemo(() => {
    if (isMobile) return SIDEBAR_WIDTHS.mobile;
    if (isTablet) return SIDEBAR_WIDTHS.tablet;
    if (width >= 1536) return SIDEBAR_WIDTHS.desktopXL;
    if (width >= 1280) return SIDEBAR_WIDTHS.desktopLarge;
    return SIDEBAR_WIDTHS.desktop;
  }, [isMobile, isTablet, width]);

  // v26.2.0: Memoized render function for performance
  const renderItem = useCallback(
    (item: SidebarItem): JSX.Element => {
      const handleClick = (item: SidebarItem): void => {
        if (onItemClick) {
          onItemClick(item);
        }
      };
      const isActive = item.active ?? false;

      return (
        <motion.button
          key={item.id}
          type="button"
          aria-label={item.label}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            // Base styles - v26.2.0: Titanium Dark + WCAG 2.2
            'w-full flex items-center gap-3 px-4 py-3 rounded cursor-pointer',
            'transition-all duration-200 text-sm font-medium',
            'min-h-[44px]', // v26.0: WCAG touch target
            // Focus indicator (WCAG 2.2: 3px solid, 3:1 contrast)
            'focus-visible:outline-none focus-visible:shadow-focus',
            // Inactive state
            !isActive && [
              'bg-transparent',
              'text-titanium-text-secondary',
              'hover:bg-titanium-bg-interactive hover:text-titanium-text-primary',
            ],
            // Active state
            isActive && [
              'bg-titanium-bg-overlay',
              'text-titanium-text-primary',
              'border-l-4 border-titanium-accent-cool',
            ]
          )}
          onClick={() => handleClick(item)}
          whileHover={
            shouldReduceMotion
              ? undefined
              : {
                  backgroundColor: isActive ? undefined : 'rgba(36, 36, 36, 0.8)', // titanium-bg-interactive
                }
          }
          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          transition={{ duration: animationConfig.duration }}
        >
          {/* Icon */}
          {item.icon && (
            <span className="flex text-xl" aria-hidden="true">
              {item.icon}
            </span>
          )}

          {/* Label & Badge (hidden when collapsed) */}
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span
                  className="ml-auto px-2 py-1 rounded-full text-xs font-semibold bg-titanium-accent-bg-default text-titanium-accent-cool"
                  aria-label={`${item.badge} notifications`}
                >
                  {item.badge}
                </span>
              )}
            </>
          )}
        </motion.button>
      );
    },
    [collapsed, shouldReduceMotion, animationConfig.duration, onItemClick]
  );

  return (
    <div
      className={cn(
        'flex flex-col h-full overflow-hidden bg-titanium-bg-elevated',
        className
      )}
    >
      {/* Header */}
      {header && (
        <div className="p-6 border-b border-titanium-border-default">{header}</div>
      )}

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 titanium-scrollbar space-y-1"
        aria-label="Main navigation"
      >
        {items.map(item => renderItem(item))}
      </nav>

      {/* Footer */}
      {footer && (
        <div className="p-6 border-t border-titanium-border-default">{footer}</div>
      )}
    </div>
  );
};
