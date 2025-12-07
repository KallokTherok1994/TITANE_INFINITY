import React, { useEffect } from 'react';
import { useFocusTrap } from './FocusManager';

interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function Modal({ children, isOpen, onClose, title }: ModalProps) {
  const trapRef = useFocusTrap(isOpen);

  useEffect(() => {
    if (isOpen) {
      const previousFocus = document.activeElement as HTMLElement;

      return () => {
        previousFocus?.focus();
      };
    }
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="modal"
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button onClick={onClose} aria-label="Close modal" className="modal-close">
            ×
          </button>
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </>
  );
}
