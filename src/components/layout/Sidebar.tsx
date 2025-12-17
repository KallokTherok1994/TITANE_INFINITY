/**
 * TITANE∞ v8.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v8.0 - Sidebar Component (Tailwind CSS)
 * Sidebar intelligente avec navigation
 * Migration: Inline styles → Tailwind classes
 * ═══════════════════════════════════════════════════════════════
 */

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../../contexts/AnimationContext';
import { useIsMobile, useIsTablet } from '@/hooks/useResponsive';
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

  // ✨ v25.7.4 - Responsive width
  const sidebarWidth = isMobile ? '100%' : isTablet ? '240px' : '280px';

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
        className={cn(
          // Base styles
          'flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer',
          'transition-all duration-200 text-sm text-text-secondary mb-1',
          // Active state
          isActive && 'bg-bg-tertiary text-violet-400 border-l-3 border-violet-500',
          // Hover state (not active)
          !isActive && 'hover:bg-bg-tertiary hover:pl-5'
        )}
        onClick={() => handleClick(item)}
        whileHover={
          shouldReduceMotion
            ? undefined
            : {
                backgroundColor: 'rgba(51, 65, 85, 0.5)', // bg-tertiary with opacity
              }
        }
        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: animationConfig.duration }}
      >
        {/* Icon */}
        {item.icon && <span className="flex text-xl">{item.icon}</span>}

        {/* Label & Badge (hidden when collapsed) */}
        {!collapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="ml-auto px-2 py-1 rounded-full text-xs font-semibold bg-violet-700/50 text-violet-300">
                {item.badge}
              </span>
            )}
          </>
        )}
      </motion.div>
    );
  };

  return (
    <div className={cn('flex flex-col h-full overflow-hidden', className)}>
      {/* Header */}
      {header && <div className="p-6 border-b border-border-default">{header}</div>}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 scrollbar-custom">
        {items.map(item => renderItem(item))}
      </nav>

      {/* Footer */}
      {footer && <div className="p-6 border-t border-border-default">{footer}</div>}
    </div>
  );
};
