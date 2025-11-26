/**
 * TITANE_INFINITY v15.3 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - LOADING SCREEN
 * Écran de chargement pendant l'initialisation des engines
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';

interface LoadingScreenProps {
  message?: string;
  progress?: number; // 0-100
  showSpinner?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Initialisation de TITANE∞...',
  progress,
  showSpinner = true,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base, #0a0a0a)',
        color: 'var(--text-primary, #ffffff)',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        zIndex: 9999,
      }}
    >
      {/* Logo/Title */}
      <div
        style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #6366f1 0%, #d946ef 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        TITANE∞
      </div>

      {/* Spinner */}
      {showSpinner && (
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1.5rem',
          }}
        />
      )}

      {/* Message */}
      <div
        style={{
          fontSize: '1rem',
          color: 'var(--text-secondary, rgba(255, 255, 255, 0.7))',
          marginBottom: '1rem',
        }}
      >
        {message}
      </div>

      {/* Progress Bar */}
      {typeof progress === 'number' && (
        <div
          style={{
            width: '300px',
            height: '4px',
            background: 'var(--bg-elevated, #141414)',
            borderRadius: '9999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #6366f1 0%, #d946ef 100%)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}

      {/* Version */}
      <div
        style={{
          marginTop: '2rem',
          fontSize: '0.875rem',
          color: 'var(--text-tertiary, rgba(255, 255, 255, 0.5))',
        }}
      >
        v15.3.0
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
