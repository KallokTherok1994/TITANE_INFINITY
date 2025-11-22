/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Grid Layout System
 * Système de grille 12 colonnes responsive
 * ═══════════════════════════════════════════════════════════════
 */

import { type HTMLAttributes, forwardRef, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { spacing } from '@themes/tokens';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export type GridColumns = 1 | 2 | 3 | 4 | 6 | 12;
export type GridGap = keyof typeof spacing;
export type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto';

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: GridColumns;
  gap?: GridGap;
  children: ReactNode;
}

export interface ColProps extends HTMLAttributes<HTMLDivElement> {
  span?: ColSpan;
  spanSm?: ColSpan;
  spanMd?: ColSpan;
  spanLg?: ColSpan;
  children: ReactNode;
}

// ─────────────────────────────────────────────────────────────────
// GRID COMPONENT
// ─────────────────────────────────────────────────────────────────

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ columns = 12, gap = 4, className, style, children, ...props }, ref) => {
    const gridStyles: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: spacing[gap],
      ...style,
    };

    return (
      <div
        ref={ref}
        className={clsx('titane-grid', className)}
        style={gridStyles}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

// ─────────────────────────────────────────────────────────────────
// COL COMPONENT
// ─────────────────────────────────────────────────────────────────

export const Col = forwardRef<HTMLDivElement, ColProps>(
  ({ span = 'auto', spanSm, spanMd, spanLg, className, style, children, ...props }, ref) => {
    const getGridColumn = (colSpan: ColSpan): string => {
      if (colSpan === 'auto') {
        return 'auto';
      }
      return `span ${colSpan}`;
    };

    const colStyles: React.CSSProperties = {
      gridColumn: getGridColumn(span),
      ...style,
    };

    // Responsive breakpoints via media queries inline
    const responsiveStyle = `
      ${spanSm ? `@media (min-width: 640px) { grid-column: ${getGridColumn(spanSm)}; }` : ''}
      ${spanMd ? `@media (min-width: 768px) { grid-column: ${getGridColumn(spanMd)}; }` : ''}
      ${spanLg ? `@media (min-width: 1024px) { grid-column: ${getGridColumn(spanLg)}; }` : ''}
    `;

    return (
      <>
        {responsiveStyle && (
          <style>
            {`.titane-col-${span} { ${responsiveStyle} }`}
          </style>
        )}
        <div
          ref={ref}
          className={clsx('titane-col', `titane-col-${span}`, className)}
          style={colStyles}
          {...props}
        >
          {children}
        </div>
      </>
    );
  }
);

Col.displayName = 'Col';
