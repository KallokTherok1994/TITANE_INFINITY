/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v24 - Knowledge Domains
 * Cartographie de connaissances (remplace TalentTree gamifié)
 * ═══════════════════════════════════════════════════════════════════
 */

import { motion } from 'framer-motion';
import { Card } from '../../ui';
import type { ExperienceDomain } from '../../types/experience';
import { xpForNextLevel } from '../../types/experience';
import { useAnimation } from '../../contexts/AnimationContext';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface KnowledgeDomainsProps {
  domains: ExperienceDomain[];
  onDomainClick?: (domain: ExperienceDomain) => void;
}

// ─────────────────────────────────────────────────────────────────
// CATEGORY COLORS
// ─────────────────────────────────────────────────────────────────

const categoryColors: Record<ExperienceDomain['category'], string> = {
  cognitive: '#93b399',   // Vert métal
  business: '#c4c4c4',    // Argent
  project: '#727b81',     // Gris métal
  system: '#8a9ba8',      // Bleu métal
  memory: '#a8986f',      // Or terni
};

// ─────────────────────────────────────────────────────────────────
// DOMAIN CARD COMPONENT
// ─────────────────────────────────────────────────────────────────

interface DomainCardProps {
  domain: ExperienceDomain;
  onClick?: () => void;
}

const DomainCard = ({ domain, onClick }: DomainCardProps): JSX.Element => {
  const { animationConfig, shouldReduceMotion } = useAnimation();
  const progress = domain.level > 0
    ? ((domain.xp - domain.level ** 2 * 100) / ((domain.level + 1) ** 2 * 100 - domain.level ** 2 * 100))
    : domain.xp / 100;

  const nextLevelXp = xpForNextLevel(domain.level);
  const color = categoryColors[domain.category];

  return (
    <motion.div
      onClick={onClick}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.02, y: -4 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: animationConfig.duration }}
      style={{
        padding: '20px',
        background: 'rgba(114, 123, 129, 0.1)',
        border: `2px solid ${color}33`,
        borderRadius: '12px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            fontSize: '2rem',
            filter: 'grayscale(0.2)',
          }}
        >
          {domain.icon}
        </div>
        <div style={{ flex: 1 }}>
          <h4
            style={{
              margin: 0,
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#c4c4c4',
            }}
          >
            {domain.label}
          </h4>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '0.8125rem',
              color: '#727b81',
            }}
          >
            {domain.description}
          </p>
        </div>
      </div>

      {/* XP Stats */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              padding: '4px 10px',
              background: `${color}22`,
              border: `1px solid ${color}55`,
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: color,
            }}
          >
            NIV. {domain.level}
          </span>
          <span
            style={{
              fontSize: '0.875rem',
              color: '#727b81',
            }}
          >
            {domain.xp.toLocaleString()} XP
          </span>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            color: '#93b399',
          }}
        >
          +{(nextLevelXp - domain.xp).toLocaleString()} vers {domain.level + 1}
        </span>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '8px',
          background: 'rgba(114, 123, 129, 0.2)',
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <motion.div
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            borderRadius: '4px',
            boxShadow: `0 0 12px ${color}66`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress * 100, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Last Updated */}
      <div
        style={{
          marginTop: '12px',
          fontSize: '0.6875rem',
          color: '#727b81',
          textAlign: 'right',
        }}
      >
        Mis à jour {new Date(domain.lastUpdated).toLocaleDateString('fr-FR')}
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────

export const KnowledgeDomains = ({
  domains,
  onDomainClick,
}: KnowledgeDomainsProps): JSX.Element => {
  return (
    <Card variant="glass" elevation="lg" padding={6}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: '32px',
            textAlign: 'center',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '1.75rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #c4c4c4, #93b399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            🗺️ Cartographie des Connaissances
          </h3>
          <p
            style={{
              marginTop: '8px',
              fontSize: '0.9375rem',
              color: '#727b81',
            }}
          >
            Progression continue dans tous les domaines • Aucun déblocage requis
          </p>
        </div>

        {/* Domains Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {domains.map(domain => (
            <DomainCard
              key={domain.id}
              domain={domain}
              onClick={onDomainClick ? () => onDomainClick(domain) : undefined}
            />
          ))}
        </div>

        {/* Info Footer */}
        <div
          style={{
            marginTop: '32px',
            padding: '16px',
            background: 'rgba(147, 179, 153, 0.1)',
            border: '1px solid rgba(147, 179, 153, 0.2)',
            borderRadius: '8px',
            fontSize: '0.875rem',
            color: '#93b399',
            textAlign: 'center',
          }}
        >
          💡 <strong>Astuce</strong> : Gagnez de l'XP en envoyant des messages (💬 +5 XP),
          en important des fichiers (📂 +20 XP) ou via des événements système (⚙️ +10 XP)
        </div>
      </motion.div>
    </Card>
  );
};
