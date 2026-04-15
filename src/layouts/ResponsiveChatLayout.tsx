/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v30.0.0 — RESPONSIVE CHAT LAYOUT
 *   Wrapper responsive pour Chat.tsx (1356 lignes)
 *   Strategy: Progressive enhancement sans breaking changes
 * ═══════════════════════════════════════════════════════════════
 */

import React, { type ReactNode } from 'react';
import { useResponsive } from '@/hooks/useResponsive';

interface ResponsiveChatLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * ResponsiveChatLayout - Layout wrapper pour Chat page
 *
 * Features:
 * - Mobile-first responsive container
 * - Safe-area support (iOS notch)
 * - Touch-optimized spacing
 * - Orientation adaptive
 * - Max-width progressive (mobile → tablet → desktop)
 *
 * @example
 * ```tsx
 * <ResponsiveChatLayout>
 *   <Chat />
 * </ResponsiveChatLayout>
 * ```
 */
export const ResponsiveChatLayout: React.FC<ResponsiveChatLayoutProps> = ({
  children,
  className = '',
}) => {
  const {
    isMobile,
    isTablet,
    isDesktop: _isDesktop,
    isPortrait,
    isLandscape,
    width,
  } = useResponsive();

  // Responsive max-width
  const maxWidth = isMobile ? '100%' : isTablet ? '768px' : '1280px';

  // Patch: si la classe "no-padding" est présente, on force le padding à 0
  const isNoPadding = className?.includes('no-padding');
  const padding = isNoPadding
    ? '0'
    : isMobile
      ? isLandscape
        ? 'var(--space-xs) var(--space-sm)'
        : 'var(--space-sm)'
      : isTablet
        ? 'var(--space-md)'
        : 'var(--space-lg)';

  return (
    <div
      className={`chat-layout-responsive${isNoPadding ? ' no-padding' : ''} ${className}`}
      data-device={isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}
      data-orientation={isPortrait ? 'portrait' : 'landscape'}
      data-width={width}
      style={{
        width: '100vw',
        height: '100vh',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        overflow: 'hidden',
        maxWidth,
        padding: 0,
        margin: 0,
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  );
};

export default ResponsiveChatLayout;
