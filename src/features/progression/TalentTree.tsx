/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 - Talent Tree
 * Arbre de compétences interactif avec déblocage progressif
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Badge, Button, Modal } from '../../ui';
import { useAnimation } from '../../contexts/AnimationContext';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface TalentNode {
  id: string;
  name: string;
  description: string;
  tier: number;
  cost: number;
  category: 'chat' | 'voice' | 'code' | 'projects' | 'system';
  unlocked: boolean;
  requirements: string[];
  x: number;
  y: number;
}

export interface TalentTreeProps {
  talents: TalentNode[];
  availablePoints: number;
  onUnlock?: (talentId: string) => void;
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

const categoryColors: Record<TalentNode['category'], string> = {
  chat: 'var(--color-text-secondary)',
  voice: 'var(--color-info-500)',
  code: 'var(--color-success-500)',
  projects: 'var(--color-text-muted)',
  system: 'var(--color-text-muted)',
};

const categoryLabels: Record<TalentNode['category'], string> = {
  chat: 'Chat IA',
  voice: 'Voix',
  code: 'Code',
  projects: 'Projets',
  system: 'Système',
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const TalentTree = ({
  talents,
  availablePoints,
  onUnlock,
}: TalentTreeProps): JSX.Element => {
  const { animationConfig: _animationConfig, shouldReduceMotion: _shouldReduceMotion } =
    useAnimation();
  const [selectedTalent, setSelectedTalent] = useState<TalentNode | null>(null);
  const [hoveredTalent, setHoveredTalent] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw connections between talents
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    talents.forEach(talent => {
      talent.requirements.forEach(reqId => {
        const requirement = talents.find(t => t.id === reqId);
        if (!requirement) {
          return;
        }

        ctx.beginPath();
        ctx.moveTo(requirement.x + 30, requirement.y + 30);
        ctx.lineTo(talent.x + 30, talent.y + 30);
        ctx.strokeStyle = talent.unlocked
          ? 'var(--color-text-disabled)'
          : 'var(--color-border-subtle)';
        ctx.lineWidth = talent.unlocked ? 3 : 2;
        ctx.stroke();
      });
    });
  }, [talents]);

  const canUnlock = (talent: TalentNode): boolean => {
    if (talent.unlocked) {
      return false;
    }
    if (talent.cost > availablePoints) {
      return false;
    }
    if (talent.requirements.length === 0) {
      return true;
    }
    return talent.requirements.every(
      reqId => talents.find(t => t.id === reqId)?.unlocked
    );
  };

  const handleUnlock = (talent: TalentNode): void => {
    if (canUnlock(talent) && onUnlock) {
      onUnlock(talent.id);
      setSelectedTalent(null);
    }
  };

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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-6)',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            🌳 Arbre de Talents
          </h3>
          <Badge variant="primary" size="lg">
            {availablePoints} points disponibles
          </Badge>
        </div>

        {/* Tree Canvas */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '600px',
            background: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-bg-secondary)',
            overflow: 'hidden',
          }}
        >
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          />

          {/* Talent Nodes */}
          <AnimatePresence>
            {talents.map(talent => {
              const isHovered = hoveredTalent === talent.id;
              const isUnlockable = canUnlock(talent);

              return (
                <motion.div
                  key={talent.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    position: 'absolute',
                    left: `${talent.x}px`,
                    top: `${talent.y}px`,
                    width: '60px',
                    height: '60px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedTalent(talent)}
                  onMouseEnter={() => setHoveredTalent(talent.id)}
                  onMouseLeave={() => setHoveredTalent(null)}
                >
                  {/* Node Circle */}
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: talent.unlocked
                        ? categoryColors[talent.category]
                        : 'var(--color-border-subtle)',
                      border: `3px solid ${isUnlockable ? 'var(--color-text-secondary)' : talent.unlocked ? 'var(--color-text-primary)' : 'var(--color-border-default)'}`,
                      boxShadow: talent.unlocked
                        ? 'var(--shadow-sm)'
                        : isUnlockable
                          ? '0 0 0 2px var(--color-violet-500)'
                          : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      transition: 'all 0.3s',
                      opacity: talent.unlocked ? 1 : isUnlockable ? 0.8 : 0.4,
                    }}
                  >
                    {talent.unlocked ? '✓' : talent.tier}
                  </div>

                  {/* Tier Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: categoryColors[talent.category],
                      border: '2px solid var(--color-bg-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {talent.tier}
                  </div>

                  {/* Hover Tooltip */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        position: 'absolute',
                        top: '70px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: 'var(--space-3)',
                        background: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border-default)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        whiteSpace: 'nowrap',
                        zIndex: 1000,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {talent.name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--color-text-muted)',
                          marginTop: 'var(--space-1)',
                        }}
                      >
                        Coût: {talent.cost} points
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div
          style={{
            marginTop: 'var(--space-6)',
            display: 'flex',
            gap: 'var(--space-4)',
            flexWrap: 'wrap',
          }}
        >
          {Object.entries(categoryLabels).map(([key, label]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: categoryColors[key as TalentNode['category']],
                }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Talent Detail Modal */}
      <Modal
        isOpen={selectedTalent !== null}
        onClose={() => setSelectedTalent(null)}
        size="md"
        title={selectedTalent?.name}
      >
        {selectedTalent && (
          <div>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <Badge
                variant="primary"
                size="md"
                style={{
                  background: `${categoryColors[selectedTalent.category]}33`,
                  color: categoryColors[selectedTalent.category],
                }}
              >
                {categoryLabels[selectedTalent.category]} - Tier {selectedTalent.tier}
              </Badge>
            </div>

            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                marginBottom: 'var(--space-4)',
              }}
            >
              {selectedTalent.description}
            </p>

            <div
              style={{
                padding: 'var(--space-4)',
                background: 'var(--color-bg-primary)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <div style={{ marginBottom: 'var(--space-2)' }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>Coût:</strong>{' '}
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {selectedTalent.cost} points
                </span>
              </div>
              {selectedTalent.requirements.length > 0 && (
                <div>
                  <strong style={{ color: 'var(--color-text-primary)' }}>
                    Prérequis:
                  </strong>
                  <ul
                    style={{
                      margin: 'var(--space-2) 0 0',
                      paddingLeft: 'var(--space-5)',
                    }}
                  >
                    {selectedTalent.requirements.map(reqId => {
                      const req = talents.find(t => t.id === reqId);
                      return (
                        <li
                          key={reqId}
                          style={{
                            color: req?.unlocked
                              ? 'var(--color-success-500)'
                              : 'var(--color-error-500)',
                          }}
                        >
                          {req?.name} {req?.unlocked ? '✓' : '✗'}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <Button
              variant={selectedTalent.unlocked ? 'secondary' : 'primary'}
              fullWidth
              disabled={!canUnlock(selectedTalent)}
              onClick={() => handleUnlock(selectedTalent)}
            >
              {selectedTalent.unlocked
                ? 'Déjà débloqué'
                : canUnlock(selectedTalent)
                  ? `Débloquer (${selectedTalent.cost} points)`
                  : 'Prérequis non remplis'}
            </Button>
          </div>
        )}
      </Modal>
    </Card>
  );
};
