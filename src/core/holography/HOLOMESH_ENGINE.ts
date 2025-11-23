/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// ⚡ TITANE∞ v22 — HoloMesh Engine
// Moteur de maillage holographique Nexus (réseau cognitif vivant)

import { DS_COLORS } from '../visual/DS_COLORS';
import { DS_CONSTANTS } from '../visual/DS_CONSTANTS';

// 🔷 Node (nœud du maillage)
export interface HoloNode {
  id: string;
  label: string;
  module: 'helios' | 'nexus' | 'harmonia' | 'memory' | 'aether';
  x: number; // Position 0-100%
  y: number; // Position 0-100%
  intensity: number; // 0-1
  active: boolean;
  connections: string[]; // IDs des nodes connectés
}

// 🔗 Link (lien entre nodes)
export interface HoloLink {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  strength: number; // 0-1 (largeur du lien)
  flowRate: number; // 0-1 (vitesse du flux)
  active: boolean;
}

// 🌐 Configuration du HoloMesh
export interface HoloMeshConfig {
  nodes: HoloNode[];
  links: HoloLink[];
  showParticles: boolean;
  showScanlines: boolean;
  globalIntensity: number; // 0-1
  animationSpeed: number; // ms
}

// 🧬 HoloMesh Engine principal
export class HoloMeshEngine {
  private nodes: Map<string, HoloNode> = new Map();
  private links: Map<string, HoloLink> = new Map();
  private config: Partial<HoloMeshConfig> = {
    showParticles: true,
    showScanlines: true,
    globalIntensity: 0.3,
    animationSpeed: 2000,
  };

  constructor() {
    this.initializeDefaultMesh();
  }

  /**
   * Initialiser le maillage par défaut (5 modules TITANE∞)
   */
  private initializeDefaultMesh(): void {
    // Créer les 5 nodes principaux
    const defaultNodes: HoloNode[] = [
      {
        id: 'helios',
        label: 'Helios',
        module: 'helios',
        x: 50,
        y: 20,
        intensity: 0.5,
        active: true,
        connections: ['nexus', 'aether'],
      },
      {
        id: 'nexus',
        label: 'Nexus',
        module: 'nexus',
        x: 80,
        y: 40,
        intensity: 0.7,
        active: true,
        connections: ['helios', 'harmonia', 'memory', 'aether'],
      },
      {
        id: 'harmonia',
        label: 'Harmonia',
        module: 'harmonia',
        x: 70,
        y: 70,
        intensity: 0.8,
        active: true,
        connections: ['nexus', 'memory'],
      },
      {
        id: 'memory',
        label: 'Memory',
        module: 'memory',
        x: 30,
        y: 60,
        intensity: 0.6,
        active: true,
        connections: ['nexus', 'harmonia', 'aether'],
      },
      {
        id: 'aether',
        label: 'Aether',
        module: 'aether',
        x: 50,
        y: 50,
        intensity: 0.4,
        active: true,
        connections: ['helios', 'nexus', 'memory'],
      },
    ];

    defaultNodes.forEach((node) => this.nodes.set(node.id, node));

    // Créer les liens
    this.generateLinksFromNodes();
  }

  /**
   * Générer les liens depuis les connexions des nodes
   */
  private generateLinksFromNodes(): void {
    this.links.clear();

    this.nodes.forEach((node) => {
      node.connections.forEach((targetId) => {
        const linkId = `${node.id}-${targetId}`;
        const reverseLinkId = `${targetId}-${node.id}`;

        // Éviter les doublons
        if (!this.links.has(linkId) && !this.links.has(reverseLinkId)) {
          const targetNode = this.nodes.get(targetId);
          if (targetNode) {
            const link: HoloLink = {
              id: linkId,
              source: node.id,
              target: targetId,
              strength: (node.intensity + targetNode.intensity) / 2,
              flowRate: Math.random() * 0.5 + 0.3,
              active: node.active && targetNode.active,
            };
            this.links.set(linkId, link);
          }
        }
      });
    });
  }

  /**
   * Mettre à jour l'intensité d'un node
   */
  updateNodeIntensity(nodeId: string, intensity: number): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.intensity = Math.max(0, Math.min(1, intensity));
      this.updateRelatedLinks(nodeId);
    }
  }

  /**
   * Mettre à jour les liens liés à un node
   */
  private updateRelatedLinks(nodeId: string): void {
    this.links.forEach((link) => {
      if (link.source === nodeId || link.target === nodeId) {
        const sourceNode = this.nodes.get(link.source);
        const targetNode = this.nodes.get(link.target);
        if (sourceNode && targetNode) {
          link.strength = (sourceNode.intensity + targetNode.intensity) / 2;
          link.active = sourceNode.active && targetNode.active;
        }
      }
    });
  }

  /**
   * Activer/désactiver un node
   */
  setNodeActive(nodeId: string, active: boolean): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.active = active;
      this.updateRelatedLinks(nodeId);
    }
  }

  /**
   * Obtenir la configuration complète du mesh
   */
  getMeshData(): HoloMeshConfig {
    return {
      nodes: Array.from(this.nodes.values()),
      links: Array.from(this.links.values()),
      showParticles: this.config.showParticles ?? true,
      showScanlines: this.config.showScanlines ?? true,
      globalIntensity: this.config.globalIntensity ?? 0.3,
      animationSpeed: this.config.animationSpeed ?? 2000,
    };
  }

  /**
   * Générer le SVG du HoloMesh
   */
  generateSVG(width: number = 800, height: number = 600): string {
    const nodes = Array.from(this.nodes.values());
    const links = Array.from(this.links.values());

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" class="holomesh">`;

    // Defs pour gradients et filtres
    svg += `<defs>`;

    // Glow filter
    svg += `
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    `;

    // Gradient pour chaque module
    Object.entries(DS_COLORS).forEach(([key, colorData]) => {
      if (typeof colorData !== 'string' && 'hex' in colorData) {
        svg += `
          <linearGradient id="gradient-${key}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colorData.hex};stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:${colorData.hex};stop-opacity:0.3" />
          </linearGradient>
        `;
      }
    });

    svg += `</defs>`;

    // Liens
    links.forEach((link) => {
      const sourceNode = this.nodes.get(link.source);
      const targetNode = this.nodes.get(link.target);

      if (sourceNode && targetNode && link.active) {
        const x1 = (sourceNode.x / 100) * width;
        const y1 = (sourceNode.y / 100) * height;
        const x2 = (targetNode.x / 100) * width;
        const y2 = (targetNode.y / 100) * height;

        const color = DS_COLORS.nexus.hex;
        const opacity = link.strength * 0.6;
        const strokeWidth = 1 + link.strength * 2;

        svg += `
          <line
            x1="${x1}" y1="${y1}"
            x2="${x2}" y2="${y2}"
            stroke="${color}"
            stroke-width="${strokeWidth}"
            stroke-opacity="${opacity}"
            filter="url(#glow)"
            class="holomesh-link"
          >
            <animate
              attributeName="stroke-opacity"
              values="${opacity};${opacity * 1.5};${opacity}"
              dur="${this.config.animationSpeed}ms"
              repeatCount="indefinite"
            />
          </line>
        `;
      }
    });

    // Nodes
    nodes.forEach((node) => {
      if (!node.active) return;

      const cx = (node.x / 100) * width;
      const cy = (node.y / 100) * height;
      const radius = 6 + node.intensity * 8;

      svg += `
        <circle
          cx="${cx}" cy="${cy}"
          r="${radius}"
          fill="url(#gradient-${node.module})"
          filter="url(#glow)"
          class="holomesh-node"
        >
          <animate
            attributeName="r"
            values="${radius};${radius * 1.2};${radius}"
            dur="${DS_CONSTANTS.timing.breath}ms"
            repeatCount="indefinite"
          />
        </circle>
      `;

      // Label
      svg += `
        <text
          x="${cx}" y="${cy - radius - 10}"
          text-anchor="middle"
          fill="rgba(255,255,255,0.7)"
          font-size="10"
          font-family="monospace"
          class="holomesh-label"
        >
          ${node.label}
        </text>
      `;
    });

    svg += `</svg>`;

    return svg;
  }

  /**
   * Mettre à jour la configuration globale
   */
  updateConfig(config: Partial<HoloMeshConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Réinitialiser le mesh
   */
  reset(): void {
    this.nodes.clear();
    this.links.clear();
    this.initializeDefaultMesh();
  }
}

// 🌟 Instance singleton
export const holoMeshEngine = new HoloMeshEngine();
