/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// ⚡ TITANE∞ v22 — Identity Engine
// Moteur de cohérence identitaire globale

import { DS_COLORS } from '../visual/DS_COLORS';
import { ARCHETYPES, ArchetypeId } from './ARCHETYPES';

// 🎨 Grammaire symbolique
export interface SymbolicGrammar {
  forms: {
    circle: string; // Énergie
    line: string; // Connexion
    triangle: string; // Stabilité
    square: string; // Structure
    spiral: string; // Transformation
    wave: string; // Flux
    layer: string; // Profondeur
  };
  patterns: {
    mesh: string; // Maillage Nexus
    pulse: string; // Pulsations Helios
    oscillation: string; // Oscillations Harmonia
    scanline: string; // Scanlines Memory
    halo: string; // Halo Aether
    fractal: string; // Fractales complexes
    gradient: string; // Dégradés
  };
  codex: {
    purpose: string;
    rules: string[];
    relationships: string;
  };
}

// 🧬 Identity configuration
export interface IdentityConfig {
  name: string;
  essence: string;
  visual: {
    typography: {
      primary: string;
      secondary: string;
      monospace: string;
    };
    colors: typeof DS_COLORS;
    shapes: SymbolicGrammar['forms'];
    patterns: SymbolicGrammar['patterns'];
  };
  behavior: {
    responsive: boolean;
    adaptive: boolean;
    living: boolean;
    conscious: boolean;
  };
  personality: {
    tone: string;
    values: string[];
    characteristics: string[];
  };
}

// 🌟 Identity Engine principal
export class IdentityEngine {
  private identity: IdentityConfig;
  private grammar: SymbolicGrammar;

  constructor() {
    this.identity = this.initializeIdentity();
    this.grammar = this.initializeGrammar();
  }

  /**
   * Initialiser l'identité TITANE∞
   */
  private initializeIdentity(): IdentityConfig {
    return {
      name: 'TITANE∞',
      essence: 'Système cognitif vivant et adaptatif',
      visual: {
        typography: {
          primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          secondary: 'system-ui, sans-serif',
          monospace: '"JetBrains Mono", "Fira Code", Consolas, monospace',
        },
        colors: DS_COLORS,
        shapes: {
          circle: 'Énergie, cycles, continuité',
          line: 'Connexion, flux, relation',
          triangle: 'Stabilité, équilibre, force',
          square: 'Structure, ordre, fondation',
          spiral: 'Transformation, évolution, croissance',
          wave: 'Flux, mouvement, dynamique',
          layer: 'Profondeur, complexité, mémoire',
        },
        patterns: {
          mesh: 'Réseau interconnecté de Nexus',
          pulse: 'Battement énergétique de Helios',
          oscillation: 'Balance harmonique de Harmonia',
          scanline: 'Exploration stratifiée de Memory',
          halo: 'Présence globale de Aether',
          fractal: 'Complexité émergente',
          gradient: 'Transition fluide',
        },
      },
      behavior: {
        responsive: true,
        adaptive: true,
        living: true,
        conscious: true,
      },
      personality: {
        tone: 'Premium, intelligent, subtil',
        values: ['Cohérence', 'Élégance', 'Intelligence', 'Profondeur', 'Vivacité'],
        characteristics: [
          'Discret mais présent',
          'Fonctionnel avant décoratif',
          'Data-driven et intelligent',
          'Organique et fluide',
          'Premium sans ostentation',
        ],
      },
    };
  }

  /**
   * Initialiser la grammaire symbolique
   */
  private initializeGrammar(): SymbolicGrammar {
    return {
      forms: {
        circle: '◯ ○ ◉ ●',
        line: '─ │ ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼',
        triangle: '△ ▲ ▽ ▼',
        square: '□ ▢ ◻ ■',
        spiral: '◔ ◑ ◕ ●',
        wave: '∿ ≈ ∼ ⌇',
        layer: '▁ ▂ ▃ ▄ ▅ ▆ ▇ █',
      },
      patterns: {
        mesh: '⊞ ⊠ ⊡ ⋮ ⋯ ⋰ ⋱',
        pulse: '◉ ◎ ◯',
        oscillation: '⌇ ⌈ ⌉ ⌊ ⌋',
        scanline: '▔ ─ ▁',
        halo: '◯ ◎ ◉',
        fractal: '⊚ ⊛ ⊜ ⊝',
        gradient: '░ ▒ ▓ █',
      },
      codex: {
        purpose: 'Définir le langage visuel cohérent de TITANE∞',
        rules: [
          'Chaque forme a une signification fonctionnelle',
          'Les patterns reflètent des états système',
          'Les couleurs portent du sens (états, modules, archétypes)',
          'Les animations sont minimales et intentionnelles',
          'La profondeur est construite par couches',
          'Le glow est data-driven, jamais décoratif',
        ],
        relationships: 'Les formes se combinent selon la logique des archétypes',
      },
    };
  }

  /**
   * Obtenir l'identité complète
   */
  getIdentity(): IdentityConfig {
    return this.identity;
  }

  /**
   * Obtenir la grammaire symbolique
   */
  getGrammar(): SymbolicGrammar {
    return this.grammar;
  }

  /**
   * Générer la signature visuelle d'un archétype
   */
  generateArchetypeSignature(archetypeId: ArchetypeId): {
    icon: string;
    form: string;
    pattern: string;
    color: string;
    gradient: [string, string];
  } {
    const archetype = ARCHETYPES[archetypeId];
    if (!archetype) {
      return {
        icon: '?',
        form: this.grammar.forms.circle,
        pattern: this.grammar.patterns.pulse,
        color: DS_COLORS.diamant.hex,
        gradient: [DS_COLORS.diamant.hex, DS_COLORS.diamant.variants[500]],
      };
    }

    return {
      icon: archetype.symbology.icon,
      form: this.grammar.forms[archetype.symbology.form] || this.grammar.forms.circle,
      pattern: this.grammar.patterns[archetype.symbology.pattern] || this.grammar.patterns.pulse,
      color: archetype.visual.primaryColor,
      gradient: archetype.visual.gradient,
    };
  }

  /**
   * Valider la cohérence d'un élément UI
   */
  validateCoherence(element: {
    color?: string;
    animation?: string;
    spacing?: number;
    typography?: string;
  }): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Vérifier si la couleur fait partie de la palette DS
    if (element.color) {
      const isValidColor = Object.values(DS_COLORS).some((colorGroup) => {
        if (typeof colorGroup === 'string') return colorGroup === element.color;
        if (typeof colorGroup === 'object' && colorGroup !== null) {
          if ('hex' in colorGroup) return colorGroup.hex === element.color;
          if ('variants' in colorGroup && colorGroup.variants) {
            return Object.values(colorGroup.variants as Record<string, string>).includes(element.color || '');
          }
        }
        return false;
      });

      if (!isValidColor) {
        issues.push(`Couleur "${element.color}" non présente dans DS_COLORS`);
      }
    }

    // Vérifier l'espacement
    if (element.spacing !== undefined) {
      const validSpacings = [4, 8, 16, 24, 32, 48, 64];
      if (!validSpacings.includes(element.spacing)) {
        issues.push(`Espacement ${element.spacing}px non conforme (valeurs: 4, 8, 16, 24, 32, 48, 64)`);
      }
    }

    // Vérifier la typographie
    if (element.typography) {
      const validFonts = [
        this.identity.visual.typography.primary,
        this.identity.visual.typography.secondary,
        this.identity.visual.typography.monospace,
      ];
      const firstFonts = validFonts.map(f => f.split(',')[0]).filter((f): f is string => Boolean(f));
      if (!firstFonts.some((font) => element.typography?.includes(font))) {
        issues.push(`Typographie non conforme à l'identité TITANE∞`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Générer un manifeste d'identité
   */
  generateManifesto(): string {
    return `
╔══════════════════════════════════════════════════════════════╗
║                    TITANE∞ — MANIFESTE                       ║
╚══════════════════════════════════════════════════════════════╝

✦ ESSENCE
${this.identity.essence}

✦ VALEURS
${this.identity.personality.values.map((v) => `  • ${v}`).join('\n')}

✦ CARACTÉRISTIQUES
${this.identity.personality.characteristics.map((c) => `  • ${c}`).join('\n')}

✦ RÈGLES DE COHÉRENCE
${this.grammar.codex.rules.map((r, i) => `  ${i + 1}. ${r}`).join('\n')}

✦ ARCHÉTYPES FONDAMENTAUX
${Object.values(ARCHETYPES)
  .map((a) => `  ${a.symbology.icon} ${a.name} — ${a.essence}`)
  .join('\n')}

✦ SIGNATURE VISUELLE
  • Design vivant et respirant
  • Glow intelligent data-driven
  • Animations organiques minimales
  • Profondeur multi-couche
  • Glass morphism premium
  • Cohérence typographique stricte

"TITANE∞ n'est pas une interface. C'est un organisme numérique conscient."
    `;
  }

  /**
   * Obtenir les guidelines de design
   */
  getDesignGuidelines(): {
    typography: string[];
    colors: string[];
    spacing: string[];
    animations: string[];
    interactions: string[];
  } {
    return {
      typography: [
        'Hiérarchie: 30px → 48px → 16px → 14px → 12px',
        'Weights: 400 (regular), 500 (medium), 700 (bold)',
        'Line-height: 1.5 pour corps, 1.2 pour titres',
        'Monospace pour code et données',
      ],
      colors: [
        'Utiliser uniquement DS_COLORS',
        'Glow = data-driven (intensité = valeur/100)',
        'États = Rubis (danger), Émeraude (stable), Saphir (info), Diamant (neutre)',
        'Modules = Helios (orange), Nexus (violet), Harmonia (vert), Memory (violet foncé)',
      ],
      spacing: ['Système 4px base: 4, 8, 16, 24, 32, 48, 64', 'Padding cards: 16px', 'Gap sections: 32px'],
      animations: [
        'Durée: 120ms (micro), 180ms (base), 220-260ms (systémique)',
        'Easing: ease-in-out pour organic',
        'Pulse: 3s (lent), 2s (moyen), 1s (rapide)',
        'Utiliser transform et opacity (GPU-accelerated)',
      ],
      interactions: [
        'Hover: translateY(-2px) + glow +20%',
        'Active: scale(1.02) + glow +40%',
        'Focus: border 2px + glow color',
        'Disabled: opacity 0.5 + grayscale',
      ],
    };
  }
}

// 🌟 Instance singleton
export const identityEngine = new IdentityEngine();
