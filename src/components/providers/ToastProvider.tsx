/**
 * TITANE∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TOAST PROVIDER COMPONENT
 *   Provider Sonner à ajouter à la racine de l'app
 * ═══════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { Toaster } from 'sonner';

/**
 * Composant provider pour les toasts
 * À placer une seule fois à la racine de l'app (ex: App.tsx)
 */
export const ToastProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>
    {children}
    <Toaster
      position="bottom-right"
      richColors
      closeButton
      expand
      visibleToasts={5}
      style={
        {
          '--toast-padding': '12px',
          '--toast-width': '360px',
          '--toast-border-radius': '6px',
        } as React.CSSProperties
      }
    />
  </>
);

export default ToastProvider;
