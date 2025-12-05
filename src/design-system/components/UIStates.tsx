/**
 * TITANE∞ v∞ — UI States Components
 * Super Prompt #3 - Phase 4: États loading/empty/error/ready
 *
 * Pattern générique pour tous les modules:
 * - LoadingState avec skeletons
 * - EmptyState avec message + CTA
 * - ErrorState avec retry
 * - ReadyState wrapper
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { colors, spacing, typography, borders, text, backgrounds, radius } from '../tokens';

// ═══════════════════════════════════════════════════════════════
// LOADING STATE
// ═══════════════════════════════════════════════════════════════

export interface LoadingStateProps {
  message?: string;
  children?: React.ReactNode;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Chargement...',
  children,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: spacing[4],
      }}
    >
      {children ? (
        children
      ) : (
        <>
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              width: '48px',
              height: '48px',
              border: `4px solid ${borders.default}`,
              borderTopColor: colors.primary[300],
              borderRadius: '50%',
            }}
          />
          <span
            style={{
              fontSize: typography.fontSize.base,
              color: text.secondary,
            }}
          >
            {message}
          </span>
        </>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title = 'Aucune donnée',
  message,
  action,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: spacing[4],
        padding: spacing[8],
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '4rem',
          opacity: 0.5,
        }}
      >
        {icon}
      </div>
      <div>
        <h3
          style={{
            margin: 0,
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: text.primary,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: 0,
            marginTop: spacing[2],
            fontSize: typography.fontSize.base,
            color: text.tertiary,
            maxWidth: '400px',
          }}
        >
          {message}
        </p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            padding: `${spacing[2]} ${spacing[4]}`,
            background: colors.primary[600],
            color: text.primary,
            border: 'none',
            borderRadius: radius.md,
            fontFamily: typography.fontFamily.sans,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            cursor: 'pointer',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ERROR STATE
// ═══════════════════════════════════════════════════════════════

export interface ErrorStateProps {
  error?: Error | string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  message = 'Une erreur est survenue',
  onRetry,
}) => {
  const errorMessage = error instanceof Error ? error.message : error || message;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: spacing[4],
        padding: spacing[8],
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '4rem',
        }}
      >
        ⚠️
      </div>
      <div>
        <h3
          style={{
            margin: 0,
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: colors.semantic.danger[600],
          }}
        >
          Erreur
        </h3>
        <p
          style={{
            margin: 0,
            marginTop: spacing[2],
            fontSize: typography.fontSize.base,
            color: text.secondary,
            maxWidth: '500px',
          }}
        >
          {errorMessage}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: `${spacing[2]} ${spacing[4]}`,
            background: backgrounds.elevated,
            color: text.primary,
            border: `1px solid ${borders.default}`,
            borderRadius: radius.md,
            fontFamily: typography.fontFamily.sans,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            cursor: 'pointer',
          }}
        >
          Réessayer
        </button>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// READY STATE (wrapper)
// ═══════════════════════════════════════════════════════════════

export interface ReadyStateProps {
  children: React.ReactNode;
  animate?: boolean;
}

export const ReadyState: React.FC<ReadyStateProps> = ({ children, animate = true }) => {
  if (!animate) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SKELETON COMPONENTS
// ═══════════════════════════════════════════════════════════════

const pulseAnimation = {
  animate: {
    opacity: [0.5, 1, 0.5],
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
};

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: keyof typeof radius;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  radius: radiusKey = 'md',
  style,
}) => {
  return (
    <motion.div
      {...pulseAnimation}
      style={{
        width,
        height,
        background: backgrounds.card,
        borderRadius: radius[radiusKey],
        ...style,
      }}
    />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div
      style={{
        padding: spacing[4],
        background: backgrounds.panel,
        borderRadius: radius.lg,
        border: `1px solid ${borders.default}`,
      }}
    >
      <Skeleton width="60%" height="24px" style={{ marginBottom: spacing[3] }} />
      <Skeleton width="100%" height="16px" style={{ marginBottom: spacing[2] }} />
      <Skeleton width="90%" height="16px" style={{ marginBottom: spacing[2] }} />
      <Skeleton width="80%" height="16px" />
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[2],
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          gap: spacing[4],
          padding: spacing[3],
          background: backgrounds.panel,
          borderRadius: radius.md,
        }}
      >
        <Skeleton width="30%" height="16px" />
        <Skeleton width="40%" height="16px" />
        <Skeleton width="30%" height="16px" />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: spacing[4],
            padding: spacing[3],
            borderBottom: `1px solid ${borders.subtle}`,
          }}
        >
          <Skeleton width="30%" height="16px" />
          <Skeleton width="40%" height="16px" />
          <Skeleton width="30%" height="16px" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonList: React.FC<{ items?: number }> = ({ items = 6 }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[3],
      }}
    >
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3],
            padding: spacing[3],
            background: backgrounds.panel,
            borderRadius: radius.md,
          }}
        >
          <Skeleton width="48px" height="48px" radius="md" />
          <div style={{ flex: 1 }}>
            <Skeleton width="70%" height="16px" style={{ marginBottom: spacing[2] }} />
            <Skeleton width="50%" height="14px" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonMetric: React.FC = () => {
  return (
    <div
      style={{
        padding: spacing[4],
        background: backgrounds.panel,
        borderRadius: radius.lg,
        border: `1px solid ${borders.default}`,
      }}
    >
      <Skeleton width="40%" height="14px" style={{ marginBottom: spacing[3] }} />
      <Skeleton width="60%" height="32px" style={{ marginBottom: spacing[2] }} />
      <Skeleton width="30%" height="12px" />
    </div>
  );
};
