/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 - Modal Component
 * Dialogue modal avec overlay et animations
 * ═══════════════════════════════════════════════════════════════
 */

import { type HTMLAttributes, useEffect, forwardRef, useRef } from 'react';
import { clsx } from 'clsx';
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
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(6px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 'var(--z-modal-backdrop)' as unknown as number,
  padding: 'var(--space-4)',
};

const modalBaseStyles: React.CSSProperties = {
  background: 'var(--color-bg-secondary)',
  border: '1px solid var(--color-border-default)',
  borderRadius: 'var(--radius-xl)',
  boxShadow: 'var(--shadow-2xl)',
  maxHeight: 'calc(100vh - 2rem)',
  overflow: 'auto',
  position: 'relative',
  zIndex: 'var(--z-modal)' as unknown as number,
  animation: 'modalEnter 200ms cubic-bezier(0, 0, 0.2, 1) forwards',
};

const sizeStyles: Record<ModalSize, React.CSSProperties> = {
  sm: { maxWidth: '400px', width: '100%' },
  md: { maxWidth: '600px', width: '100%' },
  lg: { maxWidth: '800px', width: '100%' },
  xl: { maxWidth: '1200px', width: '100%' },
  full: { maxWidth: '100%', width: '100%', maxHeight: '100vh' },
};

const headerStyles: React.CSSProperties = {
  padding: 'var(--space-6)',
  borderBottom: '1px solid var(--color-border-subtle)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const titleStyles: React.CSSProperties = {
  fontSize: 'var(--text-xl)',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
  margin: 0,
};

const contentStyles: React.CSSProperties = {
  padding: 'var(--space-6)',
};

const closeButtonStyles: React.CSSProperties = {
  position: 'absolute',
  top: 'var(--space-4)',
  right: 'var(--space-4)',
  background: 'transparent',
  border: 'none',
  color: 'var(--color-text-muted)',
  fontSize: '1.25rem',
  cursor: 'pointer',
  width: '32px',
  height: '32px',
  borderRadius: 'var(--radius-md)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color 150ms ease, background-color 150ms ease',
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
          ref={node => {
            if (typeof ref === 'function') ref(node);
            else if (ref)
              (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
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
              aria-label="Fermer la fenêtre modale"
              title="Fermer (Esc)"
              className="titane-modal-close"
            >
              <span aria-hidden="true">×</span>
            </button>
          )}
          {title && (
            <div style={headerStyles}>
              <h2 id="modal-title" style={titleStyles}>
                {title}
              </h2>
            </div>
          )}
          <div id="modal-content" style={contentStyles}>
            {children}
          </div>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';
