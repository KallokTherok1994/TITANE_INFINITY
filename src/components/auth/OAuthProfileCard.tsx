// TITANE_INFINITY v∞ — Proprietary License
// © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   OAuthProfileCard — Displays connected OAuth user profile
//   data-testid: "oauth-profile-card"
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { useOAuthStore } from '@/core/auth/oauthStore';

interface OAuthProfileCardProps {
  className?: string;
}

export const OAuthProfileCard: React.FC<OAuthProfileCardProps> = ({ className = '' }) => {
  const { profile, isLoading, error, logout } = useOAuthStore();

  if (!profile) {
    return null;
  }

  return (
    <div
      data-testid="oauth-profile-card"
      className={[
        'flex items-center gap-3 p-3 rounded-xl',
        'bg-white/5 border border-white/10',
        'text-sm text-white',
        className,
      ].join(' ')}
    >
      {/* Avatar */}
      {profile.picture_url ? (
        <img
          src={profile.picture_url}
          alt={profile.name}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
          data-testid="oauth-profile-avatar"
        />
      ) : (
        <div
          aria-label={profile.name}
          className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white font-bold text-lg select-none"
          data-testid="oauth-profile-avatar-placeholder"
        >
          {profile.name.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate" data-testid="oauth-profile-name">
          {profile.name}
        </p>
        {profile.email && (
          <p className="text-xs text-white/60 truncate" data-testid="oauth-profile-email">
            {profile.email}
          </p>
        )}
        <p
          className="text-xs text-[#1877F2]/80 mt-0.5"
          data-testid="oauth-profile-provider"
        >
          Facebook
        </p>
      </div>

      {/* Logout */}
      <button
        type="button"
        disabled={isLoading}
        onClick={() => void logout()}
        aria-label="Se déconnecter de Facebook"
        data-testid="oauth-logout-button"
        className={[
          'shrink-0 text-xs px-2 py-1 rounded-lg',
          'bg-white/10 hover:bg-white/20 active:bg-white/30',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors duration-150',
        ].join(' ')}
      >
        {isLoading ? '…' : 'Déconnexion'}
      </button>

      {error && (
        <p role="alert" className="sr-only" data-testid="oauth-profile-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default OAuthProfileCard;
