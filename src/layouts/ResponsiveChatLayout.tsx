/**
 * TITANE∞ v25.7.4 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v25.7.4 — RESPONSIVE CHAT LAYOUT
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

  // Responsive padding
  const padding = isMobile
    ? isLandscape
      ? 'var(--space-xs) var(--space-sm)' // Landscape mobile compact
      : 'var(--space-sm)'
    : isTablet
      ? 'var(--space-md)'
      : 'var(--space-lg)';

  return (
    <div
      className={`chat-layout-responsive ${className}`}
      data-device={isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}
      data-orientation={isPortrait ? 'portrait' : 'landscape'}
      data-width={width}
    >
      <style>{`
        .chat-layout-responsive {
          /* Container responsive */
          max-width: ${maxWidth};
          margin: 0 auto;
          padding: ${padding};
          
          /* Safe-area support (iOS notch) */
          padding-top: max(${padding.split(' ')[0] || 'var(--space-sm)'}, env(safe-area-inset-top));
          padding-bottom: max(${padding.split(' ')[0] || 'var(--space-sm)'}, env(safe-area-inset-bottom));
          padding-left: max(${padding.split(' ')[1] || padding.split(' ')[0] || 'var(--space-sm)'}, env(safe-area-inset-left));
          padding-right: max(${padding.split(' ')[1] || padding.split(' ')[0] || 'var(--space-sm)'}, env(safe-area-inset-right));
          
          /* Full height */
          min-height: 100vh;
          min-height: 100dvh; /* Dynamic viewport height (mobile address bar) */
          
          /* Flexbox layout */
          display: flex;
          flex-direction: column;
          
          /* Background */
          background: var(--bg-base, #050607);
          
          /* Overflow */
          overflow-x: hidden;
          overflow-y: auto;
          
          /* Smooth scrolling */
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        /* Mobile optimizations */
        @media (max-width: 767px) {
          .chat-layout-responsive {
            /* Compact padding mobile */
            padding: var(--space-sm);
          }
          
          /* Portrait mobile: full width */
          .chat-layout-responsive[data-orientation="portrait"] {
            padding-left: var(--space-xs);
            padding-right: var(--space-xs);
          }
          
          /* Landscape mobile: compact vertical */
          .chat-layout-responsive[data-orientation="landscape"] {
            padding-top: var(--space-xs);
            padding-bottom: var(--space-xs);
          }
        }

        /* Tablet optimizations */
        @media (min-width: 768px) and (max-width: 1023px) {
          .chat-layout-responsive {
            padding: var(--space-md);
            max-width: 768px;
          }
          
          /* Centered layout tablet */
          .chat-layout-responsive {
            margin-left: auto;
            margin-right: auto;
          }
        }

        /* Desktop optimizations */
        @media (min-width: 1024px) {
          .chat-layout-responsive {
            padding: var(--space-lg);
            max-width: 1280px;
          }
          
          /* Centered with max-width */
          .chat-layout-responsive {
            box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05);
            border-radius: 8px;
          }
        }

        /* Ultra-wide desktop */
        @media (min-width: 1536px) {
          .chat-layout-responsive {
            max-width: 1536px;
          }
        }

        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          .chat-layout-responsive {
            /* Disable hover effects */
            -webkit-tap-highlight-color: transparent;
            
            /* Touch scrolling */
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .chat-layout-responsive {
            scroll-behavior: auto;
            transition: none;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .chat-layout-responsive {
            border: 2px solid currentColor;
          }
        }

        /* Dark mode optimization */
        @media (prefers-color-scheme: dark) {
          .chat-layout-responsive {
            background: var(--bg-base, #050607);
          }
        }

        /* Print styles */
        @media print {
          .chat-layout-responsive {
            max-width: 100%;
            padding: 0;
            background: white;
            color: black;
          }
        }
      `}</style>

      {children}
    </div>
  );
};

export default ResponsiveChatLayout;
