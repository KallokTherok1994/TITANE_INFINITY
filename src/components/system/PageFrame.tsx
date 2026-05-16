/**
 * TITANE∞ — PageFrame
 * Canonical full-viewport page container.
 * Ensures pages use the full available viewport without dead zones.
 */

import React from 'react';

interface PageFrameProps {
  /** Unique surface identity — used as data-testid and data-surface-frame */
  id: string;
  /** Optional extra CSS classes */
  className?: string;
  /** Padding variant */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Layout direction */
  layout?: 'vertical' | 'horizontal' | 'grid';
  children: React.ReactNode;
}

const PADDING_CLASSES: Record<NonNullable<PageFrameProps['padding']>, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-6',
  lg: 'p-8',
};

export const PageFrame: React.FC<PageFrameProps> = ({
  id,
  className = '',
  padding = 'md',
  layout = 'vertical',
  children,
}) => {
  const layoutClass =
    layout === 'horizontal'
      ? 'flex flex-row gap-4'
      : layout === 'grid'
        ? 'grid'
        : 'flex flex-col gap-4';

  return (
    <div
      data-testid={`page-frame-${id}`}
      data-surface-frame={id}
      className={`
        w-full min-h-0 flex-1
        bg-titanium-bg-base text-titanium-text-primary
        ${PADDING_CLASSES[padding]}
        ${layoutClass}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      {children}
    </div>
  );
};

/** Compact section within a PageFrame */
export const PageSection: React.FC<{
  title?: string;
  subtitle?: string;
  testId?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, testId, className = '', children }) => (
  <section
    data-testid={testId}
    className={`flex flex-col gap-3 ${className}`}
  >
    {(title || subtitle) && (
      <div>
        {title && (
          <h2 className="text-base font-semibold text-titanium-text-primary">{title}</h2>
        )}
        {subtitle && (
          <p className="text-xs text-titanium-text-secondary mt-0.5">{subtitle}</p>
        )}
      </div>
    )}
    {children}
  </section>
);
