/**
 * TITANE∞ v8.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v8.0 - Header Component (Tailwind CSS)
 * Header principal avec logo, navigation et actions
 * Migration: Inline styles → Tailwind classes
 * ═══════════════════════════════════════════════════════════════
 */

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../../contexts/AnimationContext';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface HeaderProps {
  logo?: ReactNode;
  title?: string;
  subtitle?: ReactNode; // Support ReactNode pour barre XP
  navigation?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const Header = ({
  logo,
  title,
  subtitle,
  navigation,
  actions,
  className,
}: HeaderProps): JSX.Element => {
  const { animationConfig } = useAnimation();

  return (
    <motion.div
      className={cn('flex items-center gap-6 w-full', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: animationConfig.duration }}
    >
      {/* Logo */}
      {logo && (
        <div className="flex items-center gap-3">
          {logo}
        </div>
      )}

      {/* Title & Subtitle */}
      {(title || subtitle) && (
        <div className="flex flex-col">
          {title && (
            <h1 className="text-2xl font-bold text-text-primary m-0 leading-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            typeof subtitle === 'string' ? (
              <p className="text-sm text-text-muted m-0">
                {subtitle}
              </p>
            ) : (
              <div className="text-sm text-text-muted">
                {subtitle}
              </div>
            )
          )}
        </div>
      )}

      {/* Navigation */}
      {navigation && (
        <nav className="flex-1 flex items-center gap-4 ml-8">
          {navigation}
        </nav>
      )}

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-3 ml-auto">
          {actions}
        </div>
      )}
    </motion.div>
  );
};
