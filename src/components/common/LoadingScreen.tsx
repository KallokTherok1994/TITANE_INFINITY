/**
 * TITANE_INFINITY v17.3 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Loading Screen
 * Écran de chargement élégant pendant l'initialisation
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
}

/**
 * LoadingScreen - Affiche un écran de chargement pendant l'initialisation
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Initialisation de TITANE∞...',
  progress
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: 'var(--bg-base, #0a0a0a)',
        color: 'var(--text-primary, #ffffff)',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      {/* Logo / Icône */}
      <div
        style={{
          fontSize: '4rem',
          marginBottom: '2rem',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      >
        🌌
      </div>

      {/* Titre */}
      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 600,
          margin: 0,
          marginBottom: '1rem',
          background: 'linear-gradient(90deg, var(--color-primary-400, #818cf8), var(--color-accent-400, #e879f9))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        TITANE∞ v15
      </h1>

      {/* Message */}
      <p
        style={{
          fontSize: '1rem',
          color: 'var(--text-secondary, rgba(255, 255, 255, 0.7))',
          margin: 0,
          marginBottom: '2rem',
        }}
      >
        {message}
      </p>

      {/* Spinner */}
      <div
        style={{
          width: '48px',
          height: '48px',
          border: '3px solid rgba(255, 255, 255, 0.1)',
          borderTop: '3px solid var(--color-primary-500, #6366f1)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '2rem',
        }}
      />

      {/* Progress bar (optionnel) */}
      {typeof progress === 'number' && (
        <div
          style={{
            width: '300px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--color-primary-500, #6366f1), var(--color-accent-500, #d946ef))',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}

      {typeof progress === 'number' && (
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-tertiary, rgba(255, 255, 255, 0.5))',
            margin: 0,
          }}
        >
          {Math.round(progress)}%
        </p>
      )}

      {/* Styles d'animation injectés */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};
