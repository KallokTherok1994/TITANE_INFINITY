/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Talent Tree
 * Arbre de compétences interactif avec déblocage progressif
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Badge, Button, Modal } from '../../ui';
import { colors, spacing, radius, shadows } from '@themes/tokens';

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
  chat: colors.rubis.primary[500],
  voice: colors.saphir.primary[500],
  code: colors.emeraude.primary[500],
  projects: colors.diamant.primary[400],
  system: colors.neutral[500],
};

const categoryLabels: Record<TalentNode['category'], string> = {
  chat: 'Chat IA',
  voice: 'Voice',
  code: 'Code',
  projects: 'Projects',
  system: 'System',
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const TalentTree = ({
  talents,
  availablePoints,
  onUnlock,
}: TalentTreeProps): JSX.Element => {
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
          ? colors.rubis.primary[600]
          : colors.neutral[800];
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
    return talent.requirements.every(reqId =>
      talents.find(t => t.id === reqId)?.unlocked
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
            marginBottom: spacing[6],
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 600,
              color: colors.neutral[100],
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
            background: colors.neutral[950],
            borderRadius: radius.lg,
            border: `1px solid ${colors.rubis.primary[900]}`,
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
                        : colors.neutral[800],
                      border: `3px solid ${isUnlockable ? colors.rubis.primary[500] : talent.unlocked ? colors.neutral[100] : colors.neutral[700]}`,
                      boxShadow: talent.unlocked
                        ? shadows.glowRubis
                        : isUnlockable
                          ? shadows.focusRubis
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
                      border: `2px solid ${colors.neutral[950]}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      color: colors.neutral[100],
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
                        padding: spacing[3],
                        background: colors.rubis.surface.solid,
                        border: `1px solid ${colors.rubis.primary[700]}`,
                        borderRadius: radius.md,
                        boxShadow: shadows.lg,
                        whiteSpace: 'nowrap',
                        zIndex: 1000,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: colors.neutral[100],
                        }}
                      >
                        {talent.name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: colors.neutral[400],
                          marginTop: spacing[1],
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
            marginTop: spacing[6],
            display: 'flex',
            gap: spacing[4],
            flexWrap: 'wrap',
          }}
        >
          {Object.entries(categoryLabels).map(([key, label]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                fontSize: '0.875rem',
                color: colors.neutral[300],
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
            <div style={{ marginBottom: spacing[4] }}>
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
                color: colors.neutral[300],
                lineHeight: 1.6,
                marginBottom: spacing[4],
              }}
            >
              {selectedTalent.description}
            </p>

            <div
              style={{
                padding: spacing[4],
                background: colors.neutral[900],
                borderRadius: radius.md,
                marginBottom: spacing[4],
              }}
            >
              <div style={{ marginBottom: spacing[2] }}>
                <strong style={{ color: colors.neutral[100] }}>Coût:</strong>{' '}
                <span style={{ color: colors.rubis.primary[400] }}>
                  {selectedTalent.cost} points
                </span>
              </div>
              {selectedTalent.requirements.length > 0 && (
                <div>
                  <strong style={{ color: colors.neutral[100] }}>Prérequis:</strong>
                  <ul style={{ margin: `${spacing[2]} 0 0`, paddingLeft: spacing[5] }}>
                    {selectedTalent.requirements.map(reqId => {
                      const req = talents.find(t => t.id === reqId);
                      return (
                        <li
                          key={reqId}
                          style={{
                            color: req?.unlocked
                              ? colors.emeraude.primary[400]
                              : colors.semantic.error[400],
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
