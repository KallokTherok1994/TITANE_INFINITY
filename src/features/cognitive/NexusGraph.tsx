/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Nexus Graph Visualization
 * Visualisation du graphe de connaissances Nexus
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../ui';
import { colors, spacing } from '@themes/tokens';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface NexusNode {
  id: string;
  label: string;
  type: 'concept' | 'fact' | 'skill' | 'memory';
  connections: number;
  importance: number;
}

export interface NexusEdge {
  source: string;
  target: string;
  strength: number;
}

export interface NexusGraphProps {
  nodes: NexusNode[];
  edges: NexusEdge[];
  onNodeClick?: (node: NexusNode) => void;
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

const nodeColors: Record<NexusNode['type'], string> = {
  concept: colors.rubis.primary[500],
  fact: colors.saphir.primary[500],
  skill: colors.emeraude.primary[500],
  memory: colors.diamant.primary[500],
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const NexusGraph = ({ nodes, edges, onNodeClick }: NexusGraphProps): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Simple force-directed layout (circular)
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    const positions = nodes.map((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      return {
        id: node.id,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        node,
      };
    });

    // Draw edges
    ctx.strokeStyle = colors.neutral[700];
    ctx.lineWidth = 1;
    edges.forEach(edge => {
      const source = positions.find(p => p.id === edge.source);
      const target = positions.find(p => p.id === edge.target);

      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.globalAlpha = edge.strength;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });

    // Draw nodes
    positions.forEach(({ x, y, node }) => {
      const nodeRadius = 8 + node.importance * 12;

      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
      ctx.fillStyle = nodeColors[node.type];
      ctx.fill();

      // Node border
      ctx.strokeStyle = colors.neutral[100];
      ctx.lineWidth = 2;
      ctx.stroke();

      // Connections badge
      if (node.connections > 0) {
        ctx.beginPath();
        ctx.arc(x + nodeRadius - 4, y - nodeRadius + 4, 8, 0, 2 * Math.PI);
        ctx.fillStyle = colors.rubis.primary[700];
        ctx.fill();

        ctx.fillStyle = colors.neutral[100];
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.connections.toString(), x + nodeRadius - 4, y - nodeRadius + 4);
      }

      // Label
      ctx.fillStyle = colors.neutral[300];
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(node.label, x, y + nodeRadius + 4);
    });
  }, [nodes, edges]);

  return (
    <Card variant="glass" elevation="lg" padding={6}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3
          style={{
            margin: `0 0 ${spacing[4]} 0`,
            fontSize: '1.25rem',
            fontWeight: 600,
            color: colors.neutral[100],
          }}
        >
          🧠 Nexus - Graphe de Connaissances
        </h3>

        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          style={{
            width: '100%',
            height: 'auto',
            cursor: onNodeClick ? 'pointer' : 'default',
          }}
        />

        <div
          style={{
            marginTop: spacing[4],
            display: 'flex',
            gap: spacing[4],
            flexWrap: 'wrap',
          }}
        >
          {Object.entries(nodeColors).map(([type, color]) => (
            <div
              key={type}
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
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: color,
                }}
              />
              <span style={{ textTransform: 'capitalize' }}>{type}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </Card>
  );
};
