/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Stack Component
 * Layout vertical/horizontal avec espacement
 * ═══════════════════════════════════════════════════════════════
 */

import { type HTMLAttributes, forwardRef, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { spacing } from '@themes/tokens';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export type StackDirection = 'horizontal' | 'vertical';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: StackDirection;
  gap?: keyof typeof spacing;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
  children: ReactNode;
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

const alignMap: Record<StackAlign, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
};

const justifyMap: Record<StackJustify, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = 'vertical',
      gap = 4,
      align = 'stretch',
      justify = 'start',
      wrap = false,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const stackStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: direction === 'horizontal' ? 'row' : 'column',
      gap: spacing[gap],
      alignItems: alignMap[align],
      justifyContent: justifyMap[justify],
      ...(wrap && { flexWrap: 'wrap' }),
      ...style,
    };

    return (
      <div
        ref={ref}
        className={clsx('titane-stack', className)}
        style={stackStyles}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Stack.displayName = 'Stack';
