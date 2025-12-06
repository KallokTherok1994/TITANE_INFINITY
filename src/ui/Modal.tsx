/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Modal Component
 * Dialogue modal avec overlay et animations
 * ═══════════════════════════════════════════════════════════════
 */

import { type HTMLAttributes, useEffect, forwardRef, useRef } from 'react';
import { clsx } from 'clsx';
import { colors, spacing, radius, shadows } from '@themes/tokens';
import { trapFocus } from '@/lib/accessibility';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  title?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

// ─────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────

const overlayStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: spacing[4],
};

const modalBaseStyles: React.CSSProperties = {
  background: colors.rubis.surface.solid,
  border: `1px solid ${colors.rubis.primary[800]}`,
  borderRadius: radius.xl,
  boxShadow: shadows['2xl'],
  maxHeight: '90vh',
  overflow: 'auto',
  position: 'relative',
};

const sizeStyles: Record<ModalSize, React.CSSProperties> = {
  sm: { maxWidth: '400px', width: '100%' },
  md: { maxWidth: '600px', width: '100%' },
  lg: { maxWidth: '800px', width: '100%' },
  xl: { maxWidth: '1200px', width: '100%' },
  full: { maxWidth: '95vw', width: '100%', maxHeight: '95vh' },
};

const headerStyles: React.CSSProperties = {
  padding: spacing[6],
  borderBottom: `1px solid ${colors.neutral[800]}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const titleStyles: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 600,
  color: colors.neutral[100],
  margin: 0,
};

const contentStyles: React.CSSProperties = {
  padding: spacing[6],
};

const closeButtonStyles: React.CSSProperties = {
  position: 'absolute',
  top: spacing[4],
  right: spacing[4],
  background: 'transparent',
  border: 'none',
  color: colors.neutral[400],
  fontSize: '1.5rem',
  cursor: 'pointer',
  width: '32px',
  height: '32px',
  borderRadius: radius.base,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      size = 'md',
      title,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      showCloseButton = true,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLElement | null>(null);

    // Gérer la touche Escape
    useEffect(() => {
      if (!isOpen || !closeOnEscape) {
        return;
      }

      const handleEscape = (e: KeyboardEvent): void => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }, [isOpen, closeOnEscape, onClose]);

    // Bloquer le scroll du body
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }

      return () => {
        document.body.style.overflow = '';
      };
    }, [isOpen]);

    // Focus trap et focus initial
    useEffect(() => {
      if (!isOpen || !modalRef.current) return;

      // Sauvegarder l'élément qui avait le focus
      triggerRef.current = document.activeElement as HTMLElement;

      // Implémenter focus trap
      const cleanup = trapFocus(modalRef.current);

      // Focus sur le premier élément focusable
      requestAnimationFrame(() => {
        const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      });

      // Restaurer focus à la fermeture
      return () => {
        cleanup();
        requestAnimationFrame(() => {
          triggerRef.current?.focus();
        });
      };
    }, [isOpen]);

    if (!isOpen) {
      return null;
    }

    const modalStyles: React.CSSProperties = {
      ...modalBaseStyles,
      ...sizeStyles[size],
      ...style,
    };

    return (
      <div
        style={overlayStyles}
        onClick={e => {
          if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          ref={(node) => {
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
            (modalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={title ? undefined : 'modal-content'}
          className={clsx('titane-modal', className)}
          style={modalStyles}
          onClick={e => e.stopPropagation()}
          {...props}
        >
          {showCloseButton && (
            <button
              type="button"
              style={closeButtonStyles}
              onClick={onClose}
              onMouseEnter={e => {
                e.currentTarget.style.background = colors.neutral[800];
                e.currentTarget.style.color = colors.neutral[100];
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = colors.neutral[400];
              }}
              aria-label="Fermer la fenêtre modale"
              title="Fermer (Esc)"
            >
              <span aria-hidden="true">×</span>
            </button>
          )}
          {title && (
            <div style={headerStyles}>
              <h2 id="modal-title" style={titleStyles}>{title}</h2>
            </div>
          )}
          <div id="modal-content" style={contentStyles}>{children}</div>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';
