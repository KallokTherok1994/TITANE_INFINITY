/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Container Component
 * Container responsive avec max-width
 * ═══════════════════════════════════════════════════════════════
 */

import { type HTMLAttributes, forwardRef, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { spacing } from '@themes/tokens';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
  centered?: boolean;
  padding?: keyof typeof spacing;
  children: ReactNode;
}

// ─────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────

const sizeStyles: Record<ContainerSize, React.CSSProperties> = {
  sm: { maxWidth: '640px' },
  md: { maxWidth: '768px' },
  lg: { maxWidth: '1024px' },
  xl: { maxWidth: '1280px' },
  full: { maxWidth: '100%' },
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    { size = 'xl', centered = true, padding = 4, className, style, children, ...props },
    ref
  ) => {
    const containerStyles: React.CSSProperties = {
      width: '100%',
      ...sizeStyles[size],
      ...(centered && { marginLeft: 'auto', marginRight: 'auto' }),
      padding: spacing[padding],
      ...style,
    };

    return (
      <div
        ref={ref}
        className={clsx('titane-container', className)}
        style={containerStyles}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';
