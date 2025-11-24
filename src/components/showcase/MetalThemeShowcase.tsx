/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ METAL THEME SHOWCASE
 * Composant de démonstration du thème métallique
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';
import { colors, spacing, radius } from '@themes/tokens';

/**
 * Showcase du thème TITANE∞ METAL
 * Démontre toutes les couleurs, surfaces et effets disponibles
 */
export const MetalThemeShowcase: React.FC = () => {
  return (
    <div style={{
      padding: spacing[8],
      background: 'var(--bg-base)',
      minHeight: '100vh',
      color: 'var(--text-primary)',
    }}>
      {/* Header */}
      <header style={{ marginBottom: spacing[8] }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          background: `linear-gradient(90deg, ${colors.saphir.primary.main}, ${colors.diamant.primary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: spacing[4],
        }}>
          TITANE∞ METAL THEME
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
          Design system métallique unifié — 3 couleurs, infini de possibilités
        </p>
      </header>

      {/* Section 1: Couleurs de base */}
      <section style={{ marginBottom: spacing[12] }}>
        <h2 style={{
          fontSize: '1.75rem',
          marginBottom: spacing[6],
          color: 'var(--text-primary)',
        }}>
          🎨 Couleurs de base
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: spacing[6],
        }}>
          {/* Métal primaire */}
          <ColorCard
            title="Métal Primaire"
            color="#727b81"
            description="Cœur du thème, métal chaud"
            token="--titane-metal-primary"
          />

          {/* Silver Bullet */}
          <ColorCard
            title="Silver Bullet"
            color="#c4c4c4"
            description="Surfaces claires, structure"
            token="--titane-metal-secondary"
          />

          {/* Accent organique */}
          <ColorCard
            title="Accent Organique"
            color="#93b399"
            description="Accent doux, naturel"
            token="--titane-metal-accent"
          />
        </div>
      </section>

      {/* Section 2: Surfaces & Backgrounds */}
      <section style={{ marginBottom: spacing[12] }}>
        <h2 style={{
          fontSize: '1.75rem',
          marginBottom: spacing[6],
          color: 'var(--text-primary)',
        }}>
          🌑 Surfaces & Backgrounds
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: spacing[4],
        }}>
          <SurfaceCard label="Base" token="--bg-base" />
          <SurfaceCard label="Elevated" token="--bg-elevated" />
          <SurfaceCard label="Panel" token="--bg-panel" />
          <SurfaceCard label="Card" token="--bg-card" />
          <SurfaceCard label="Surface" token="--bg-surface" />
        </div>
      </section>

      {/* Section 3: États sémantiques */}
      <section style={{ marginBottom: spacing[12] }}>
        <h2 style={{
          fontSize: '1.75rem',
          marginBottom: spacing[6],
          color: 'var(--text-primary)',
        }}>
          🎯 États Sémantiques
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: spacing[4],
        }}>
          <StatusCard
            label="Success"
            color={colors.emeraude.primary.main}
            description="Accent organique"
          />
          <StatusCard
            label="Info"
            color={colors.saphir.primary.main}
            description="Métal primaire"
          />
          <StatusCard
            label="Warning"
            color={colors.diamant.primary.main}
            description="Silver Bullet"
          />
          <StatusCard
            label="Error"
            color={colors.rubis.primary.main}
            description="Métal rouillé"
          />
        </div>
      </section>

      {/* Section 4: Boutons */}
      <section style={{ marginBottom: spacing[12] }}>
        <h2 style={{
          fontSize: '1.75rem',
          marginBottom: spacing[6],
          color: 'var(--text-primary)',
        }}>
          🔘 Boutons
        </h2>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: spacing[4],
        }}>
          <MetalButton variant="primary">Primary</MetalButton>
          <MetalButton variant="secondary">Secondary</MetalButton>
          <MetalButton variant="ghost">Ghost</MetalButton>
          <MetalButton variant="accent">Accent</MetalButton>
        </div>
      </section>

      {/* Section 5: Cartes & Panneaux */}
      <section style={{ marginBottom: spacing[12] }}>
        <h2 style={{
          fontSize: '1.75rem',
          marginBottom: spacing[6],
          color: 'var(--text-primary)',
        }}>
          🎴 Cartes & Panneaux
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: spacing[6],
        }}>
          <MetalCard title="Carte Standard" />
          <MetalCard title="Carte Élevée" elevated />
          <MetalCard title="Carte Interactive" interactive />
        </div>
      </section>

      {/* Section 6: Effets Glass */}
      <section style={{ marginBottom: spacing[12] }}>
        <h2 style={{
          fontSize: '1.75rem',
          marginBottom: spacing[6],
          color: 'var(--text-primary)',
        }}>
          ✨ Effets Glass & Glow
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: spacing[6],
        }}>
          <div className="panel-metal" style={{ padding: spacing[6] }}>
            <h4 style={{ marginBottom: spacing[3] }}>Panel Metal</h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              Effet glass métallique avec backdrop-filter blur
            </p>
          </div>

          <div className="glow-metal" style={{
            padding: spacing[6],
            background: 'var(--bg-card)',
            borderRadius: radius.xl,
          }}>
            <h4 style={{ marginBottom: spacing[3] }}>Glow Metal</h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              Glow métal doux et subtil
            </p>
          </div>

          <div className="glow-organic" style={{
            padding: spacing[6],
            background: 'var(--bg-card)',
            borderRadius: radius.xl,
          }}>
            <h4 style={{ marginBottom: spacing[3] }}>Glow Organic</h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              Glow accent organique
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANTS UTILITAIRES
// ═══════════════════════════════════════════════════════════════

interface ColorCardProps {
  title: string;
  color: string;
  description: string;
  token: string;
}

const ColorCard: React.FC<ColorCardProps> = ({ title, color, description, token }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: radius.xl,
    overflow: 'hidden',
  }}>
    <div style={{
      height: 120,
      background: color,
    }} />
    <div style={{ padding: spacing[4] }}>
      <h3 style={{
        fontSize: '1.125rem',
        marginBottom: spacing[2],
        color: 'var(--text-primary)',
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        marginBottom: spacing[2],
      }}>
        {description}
      </p>
      <code style={{
        fontSize: '0.75rem',
        color: color,
        background: 'var(--bg-elevated)',
        padding: `${spacing[1]} ${spacing[2]}`,
        borderRadius: radius.sm,
        display: 'block',
      }}>
        {token}
      </code>
      <code style={{
        fontSize: '0.75rem',
        color: 'var(--text-tertiary)',
        marginTop: spacing[1],
        display: 'block',
      }}>
        {color}
      </code>
    </div>
  </div>
);

interface SurfaceCardProps {
  label: string;
  token: string;
}

const SurfaceCard: React.FC<SurfaceCardProps> = ({ label, token }) => (
  <div style={{
    background: `var(${token})`,
    border: '1px solid var(--border-default)',
    borderRadius: radius.lg,
    padding: spacing[6],
    minHeight: 100,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  }}>
    <h4 style={{
      fontSize: '1rem',
      marginBottom: spacing[1],
      color: 'var(--text-primary)',
    }}>
      {label}
    </h4>
    <code style={{
      fontSize: '0.75rem',
      color: 'var(--text-tertiary)',
    }}>
      {token}
    </code>
  </div>
);

interface StatusCardProps {
  label: string;
  color: string;
  description: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ label, color, description }) => (
  <div style={{
    background: `${color}15`,
    border: `1px solid ${color}40`,
    borderRadius: radius.lg,
    padding: spacing[4],
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      marginBottom: spacing[2],
    }}>
      <div style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: color,
      }} />
      <h4 style={{ color }}>{label}</h4>
    </div>
    <p style={{
      fontSize: '0.875rem',
      color: 'var(--text-secondary)',
    }}>
      {description}
    </p>
  </div>
);

interface MetalButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'accent';
  children: React.ReactNode;
}

const MetalButton: React.FC<MetalButtonProps> = ({ variant, children }) => {
  const styles = {
    primary: {
      background: `linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))`,
      color: 'var(--text-primary)',
      border: 'none',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-default)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: 'none',
    },
    accent: {
      background: 'var(--color-accent-500)',
      color: 'var(--text-inverse)',
      border: 'none',
    },
  };

  return (
    <button style={{
      ...styles[variant],
      padding: `${spacing[3]} ${spacing[6]}`,
      borderRadius: radius.lg,
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 500,
      transition: 'all 0.2s ease',
    }}>
      {children}
    </button>
  );
};

interface MetalCardProps {
  title: string;
  elevated?: boolean;
  interactive?: boolean;
}

const MetalCard: React.FC<MetalCardProps> = ({ title, elevated, interactive }) => (
  <div style={{
    background: elevated ? 'var(--bg-elevated)' : 'var(--bg-card)',
    border: `1px solid ${elevated ? 'var(--border-strong)' : 'var(--border-default)'}`,
    borderRadius: radius.xl,
    padding: spacing[6],
    boxShadow: elevated ? 'var(--glow-subtle)' : 'none',
    cursor: interactive ? 'pointer' : 'default',
    transition: interactive ? 'all 0.3s ease' : 'none',
  }}>
    <h4 style={{
      fontSize: '1.125rem',
      marginBottom: spacing[3],
      color: 'var(--text-primary)',
    }}>
      {title}
    </h4>
    <p style={{
      color: 'var(--text-secondary)',
      lineHeight: 1.6,
    }}>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </p>
    <div style={{
      marginTop: spacing[4],
      paddingTop: spacing[4],
      borderTop: '1px solid var(--border-subtle)',
      color: 'var(--text-tertiary)',
      fontSize: '0.875rem',
    }}>
      {elevated && '✨ Elevated'}
      {interactive && '🖱️ Interactive'}
      {!elevated && !interactive && '📄 Standard'}
    </div>
  </div>
);

export default MetalThemeShowcase;
