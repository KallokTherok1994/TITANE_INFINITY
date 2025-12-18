/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * LISTENING INDICATOR — Indicateur d&apos;écoute active
 * Visualisation audio avec barres animées
 */

import React from 'react';
import { Mic } from 'lucide-react';

interface ListeningIndicatorProps {
  isActive: boolean;
  transcript?: string;
}

export const ListeningIndicator: React.FC<ListeningIndicatorProps> = React.memo(
  ({ isActive, transcript }) => {
    if (!isActive) return null;

    return (
      <div
        style={{
          padding: '1rem',
          background:
            'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          animation: 'fade-in 0.3s ease-out',
        }}
      >
        {/* Header avec icône et barres audio */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <Mic
            size={16}
            style={{
              color: 'rgba(59, 130, 246, 1)',
              animation: 'pulse-glow 1.5s ease-in-out infinite',
            }}
          />

          {/* Barres audio animées */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              height: '20px',
            }}
          >
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: '3px',
                  height: '100%',
                  background: 'linear-gradient(180deg, #3b82f6 0%, #60a5fa 100%)',
                  borderRadius: '2px',
                  animation: `audio-bar ${0.6 + i * 0.1}s ease-in-out infinite`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>

          <span
            style={{
              fontSize: '0.875rem',
              color: 'rgba(59, 130, 246, 1)',
              fontWeight: 500,
              letterSpacing: '0.025em',
            }}
          >
            Écoute active...
          </span>
        </div>

        {/* Transcript en temps réel */}
        {transcript && transcript.length > 0 && (
          <div
            style={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.9)',
              padding: '0.5rem 0.75rem',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              borderLeft: '3px solid rgba(59, 130, 246, 0.6)',
              fontStyle: 'italic',
            }}
          >
            &quot;{transcript}&quot;
          </div>
        )}
      </div>
    );
  }
);

ListeningIndicator.displayName = 'ListeningIndicator';

/* ═══════════════════════════════════════════════════════════════
   ANIMATIONS CSS
   ═══════════════════════════════════════════════════════════════ */

const style = document.createElement('style');
style.textContent = `
  @keyframes audio-bar {
    0%, 100% {
      height: 30%;
      opacity: 0.6;
    }
    50% {
      height: 100%;
      opacity: 1;
    }
  }

  @keyframes pulse-glow {
    0%, 100% {
      filter: drop-shadow(0 0 3px rgba(59, 130, 246, 0.6));
      transform: scale(1);
    }
    50% {
      filter: drop-shadow(0 0 8px rgba(59, 130, 246, 1));
      transform: scale(1.1);
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

if (typeof document !== 'undefined') {
  document.head.appendChild(style);
}
