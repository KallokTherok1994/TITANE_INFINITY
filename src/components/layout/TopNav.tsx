/**
 * TITANE∞ vΩ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ vΩ — TopNav Component
 * Navigation principale horizontale (remplace sidebar)
 * Max 5 entrées visibles + menu "Plus" pour le reste
 * WCAG 2.2 AA compliant, responsive
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Atom,
  Timer,
  TrendingUp,
  Settings,
  Wrench,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { TitaneLogo } from '@/components/branding/TitaneLogo';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface TopNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  route: string;
  description?: string;
}

export interface TopNavProps {
  items: TopNavItem[];
  currentRoute: string;
  onNavigate: (route: string) => void;
  maxVisibleItems?: number;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

const DEFAULT_MAX_VISIBLE = 5;

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const TopNav: React.FC<TopNavProps> = ({
  items,
  currentRoute,
  onNavigate,
  maxVisibleItems = DEFAULT_MAX_VISIBLE,
  className,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Séparer items visibles vs menu "Plus"
  const visibleItems = items.slice(0, maxVisibleItems);
  const moreItems = items.slice(maxVisibleItems);

  // Fermer menu "Plus" si clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };

    if (isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMoreMenuOpen]);

  // Fermer menu sur navigation
  useEffect(() => {
    setIsMoreMenuOpen(false);
  }, [currentRoute]);

  const handleKeyDown = (event: React.KeyboardEvent, route: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onNavigate(route);
    }
  };

  const isActive = (route: string): boolean => {
    return currentRoute === route || currentRoute.startsWith(route);
  };

  return (
    <nav
      className={cn(
        'app-topnav fixed top-0 inset-x-0 z-10000 flex items-center justify-between h-16 px-6 bg-titanium-bg-elevated border-b border-titanium-border-default pointer-events-auto',
        'shadow-sm backdrop-blur-md',
        className
      )}
      role="navigation"
      aria-label="Navigation principale"
    >
      {/* Logo */}
      <div className="flex items-center gap-4 shrink-0">
        <TitaneLogo size={32} />
        <span className="text-lg font-semibold text-titanium-text-primary hidden sm:inline">
          TITANE∞
        </span>
      </div>

      {/* Navigation Items */}
      <div className="flex items-center gap-3 flex-1 justify-center max-w-5xl">
        {/* Visible Items */}
        {visibleItems.map(item => {
          const active = isActive(item.route);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.route)}
              onKeyDown={e => handleKeyDown(e, item.route)}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                'transition-colors duration-150 focus:outline-none focus:ring-2',
                'focus:ring-titanium-accent-cool focus:ring-offset-1',
                active
                  ? 'text-titanium-accent-cool bg-titanium-bg-interactive'
                  : 'text-titanium-text-secondary hover:text-titanium-text-primary hover:bg-titanium-bg-interactive/50'
              )}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="hidden md:inline">{item.label}</span>
              {active && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-titanium-accent-cool rounded-full"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}

        {/* Menu "Plus" */}
        {moreItems.length > 0 && (
          <div className="relative" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              aria-label="Plus d'options"
              aria-expanded={isMoreMenuOpen}
              aria-haspopup="true"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 text-titanium-text-secondary hover:text-titanium-text-primary hover:bg-titanium-bg-interactive/50 focus:outline-none focus:ring-2 focus:ring-titanium-accent-cool"
            >
              <MoreHorizontal size={18} />
              <span className="hidden md:inline">Plus</span>
              <ChevronDown
                size={14}
                className={cn(
                  'transition-transform duration-200',
                  isMoreMenuOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isMoreMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'absolute top-full right-0 mt-2 w-56',
                    'bg-titanium-bg-elevated border border-titanium-border-default rounded-lg shadow-lg',
                    'backdrop-blur-md z-50 overflow-hidden'
                  )}
                  role="menu"
                >
                  {moreItems.map(item => {
                    const active = isActive(item.route);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="menuitem"
                        onClick={() => onNavigate(item.route)}
                        onKeyDown={e => handleKeyDown(e, item.route)}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150',
                          'hover:bg-titanium-bg-interactive focus:outline-none focus:bg-titanium-bg-interactive',
                          active
                            ? 'text-titanium-accent-cool bg-titanium-bg-interactive/50'
                            : 'text-titanium-text-secondary hover:text-titanium-text-primary'
                        )}
                      >
                        <span className="shrink-0">{item.icon}</span>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{item.label}</div>
                          {item.description && (
                            <div className="text-xs text-titanium-text-tertiary mt-0.5">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Actions secondaires (slot réservé) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Placeholder pour actions futures (settings, user menu, etc.) */}
      </div>
    </nav>
  );
};

/**
 * ═══════════════════════════════════════════════════════════════
 * HELPER: Créer items TopNav depuis anciennes sections Menu
 * ═══════════════════════════════════════════════════════════════
 */

const ICON_MAP: Record<string, React.ReactNode> = {
  titane: <Atom size={18} />,
  time: <Timer size={18} />,
  stats: <TrendingUp size={18} />,
  admin: <Settings size={18} />,
  dev: <Wrench size={18} />,
};

export const createTopNavItems = (
  menuSections: Array<{
    id: string;
    label: string;
    route: string;
    description?: string;
  }>
): TopNavItem[] => {
  return menuSections.map(section => ({
    id: section.id,
    label: section.label,
    icon: ICON_MAP[section.id] || <Atom size={18} />,
    route: section.route,
    description: section.description,
  }));
};
