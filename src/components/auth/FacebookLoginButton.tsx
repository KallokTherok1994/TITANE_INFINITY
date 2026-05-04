// TITANE_INFINITY v∞ — Proprietary License
// © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   FacebookLoginButton — PKCE OAuth login button
//   data-testid: "facebook-login-button"
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { useOAuthStore } from '@/core/auth/oauthStore';

interface FacebookLoginButtonProps {
  /** Custom label (default: "Se connecter avec Facebook") */
  label?: string;
  /** Callback after successful login */
  onSuccess?: () => void;
  className?: string;
}

export const FacebookLoginButton: React.FC<FacebookLoginButtonProps> = ({
  label = 'Se connecter avec Facebook',
  onSuccess,
  className = '',
}) => {
  const { isLoading, error, profile, initiateFacebook } = useOAuthStore();

  const handleClick = async () => {
    await initiateFacebook();
    if (!error && onSuccess) {
      onSuccess();
    }
  };

  if (profile) {
    return null; // Already logged in — show OAuthProfileCard instead
  }

  return (
    <div
      className={`facebook-login-wrapper ${className}`}
      data-testid="facebook-login-button"
    >
      <button
        type="button"
        disabled={isLoading}
        onClick={handleClick}
        aria-label={label}
        aria-busy={isLoading}
        className={[
          'flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white',
          'bg-[#1877F2] hover:bg-[#166FE5] active:bg-[#1459C2]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors duration-150 select-none',
        ].join(' ')}
      >
        {/* Facebook icon (SVG inline, no external resource) */}
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.028 4.388 11.026 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.026 1.792-4.697 4.532-4.697 1.313 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.93-1.956 1.885v2.285h3.328l-.532 3.49h-2.796v8.437C19.612 23.099 24 18.101 24 12.073z" />
        </svg>
        <span>{isLoading ? 'Ouverture…' : label}</span>
      </button>

      {error && (
        <p
          role="alert"
          className="mt-1 text-xs text-red-500"
          data-testid="facebook-login-error"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default FacebookLoginButton;
