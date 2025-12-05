/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v22 — NARRATIVE BRIDGE
 *   TypeScript API pour le NarrativeEngine
 *   Identité expressive, symbolique et évolutive
 * ═══════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import { TAURI_COMMANDS } from '@/core/commands/TAURI_COMMANDS';

// ═══════════════════════════════════════════════════════════════════
//   INTERFACES TYPESCRIPT — SYNCHRONISÉES AVEC RUST
// ═══════════════════════════════════════════════════════════════════

export type NarrativePerspective = 'FirstPerson' | 'ThirdPerson' | 'Collective';

export interface IdentityProfile {
  name: string;
  signature: string;
  worldview: string;
  narrative_perspective: NarrativePerspective;
  core_values: string[];
}

export type ToneModulation =
  | 'Structured'
  | 'Neutral'
  | 'Fluid'
  | 'Stable'
  | 'Dynamic'
  | 'Expansive'
  | 'Clear'
  | 'Protective';

export interface NarrativeArchetype {
  name: string;
  description: string;
  qualities: string[];
  tone_modulation: ToneModulation;
}

export type StyleProfile =
  | 'Clear'
  | 'Structured'
  | 'Elegant'
  | 'Embodied'
  | 'Technical'
  | 'Synthetic';

export interface NarrativeOutput {
  text: string;
  archetype: string | null;
  tone: string;
  symbols: string[];
  modulation: string | null;
}

// ═══════════════════════════════════════════════════════════════════
//   NARRATIVE BRIDGE v22 — API PRINCIPALE
// ═══════════════════════════════════════════════════════════════════

export class NarrativeBridgeV22 {
  /**
   * Génère une expression narrative basée sur l'état interne
   */
  static async generate(
    input: string,
    cognitiveStability: number,
    syncQuality: number
  ): Promise<NarrativeOutput> {
    return await secureInvoke<NarrativeOutput>(TAURI_COMMANDS.NARRATIVE_GENERATE, {
      input,
      cognitiveStability,
      syncQuality,
    });
  }

  /**
   * Récupère le style actuel
   */
  static async getStyle(): Promise<string> {
    return await secureInvoke<string>(TAURI_COMMANDS.NARRATIVE_GET_STYLE);
  }

  /**
   * Définit le style narratif
   */
  static async setStyle(style: StyleProfile): Promise<void> {
    const styleStr = style.toLowerCase();
    await secureInvoke(TAURI_COMMANDS.NARRATIVE_SET_STYLE, { style: styleStr });
  }

  /**
   * Récupère le profil d'identité
   */
  static async getIdentity(): Promise<IdentityProfile> {
    return await secureInvoke<IdentityProfile>(TAURI_COMMANDS.NARRATIVE_GET_IDENTITY);
  }

  /**
   * Évolue l'identité narrative
   */
  static async evolve(totalInteractions: number): Promise<string> {
    return await secureInvoke<string>(TAURI_COMMANDS.NARRATIVE_EVOLVE, {
      totalInteractions,
    });
  }

  /**
   * Récupère l'archétype actif
   */
  static async getArchetype(): Promise<NarrativeArchetype | null> {
    return await secureInvoke<NarrativeArchetype | null>(TAURI_COMMANDS.NARRATIVE_GET_ARCHETYPE);
  }

  /**
   * Définit l'archétype actif
   */
  static async setArchetype(archetypeName: string): Promise<void> {
    await secureInvoke(TAURI_COMMANDS.NARRATIVE_SET_ARCHETYPE, { archetypeName });
  }

  // ═══════════════════════════════════════════════════════════════
  //   HELPERS — Fonctions utilitaires
  // ═══════════════════════════════════════════════════════════════

  /**
   * Liste des archétypes disponibles (synchronisé avec Rust)
   */
  static readonly ARCHETYPES = [
    'Architecte',
    'Observateur',
    'Tisseur',
    'Pilier',
    'Flux',
    'Horizon',
    'Cristal',
    'Gardien',
  ] as const;

  /**
   * Liste des styles disponibles
   */
  static readonly STYLES: StyleProfile[] = [
    'Clear',
    'Structured',
    'Elegant',
    'Embodied',
    'Technical',
    'Synthetic',
  ];

  /**
   * Formatte le style pour l'affichage
   */
  static formatStyle(style: StyleProfile): string {
    const labels: Record<StyleProfile, string> = {
      Clear: 'Clair',
      Structured: 'Structuré',
      Elegant: 'Élégant',
      Embodied: 'Incarné',
      Technical: 'Technique',
      Synthetic: 'Synthétique',
    };
    return labels[style] || style;
  }

  /**
   * Récupère la couleur de l'archétype pour l'UI
   */
  static getArchetypeColor(archetype: string): string {
    const colors: Record<string, string> = {
      Architecte: '#00ff88',
      Observateur: '#00ddff',
      Tisseur: '#9d7cff',
      Pilier: '#ffaa00',
      Flux: '#00ffdd',
      Horizon: '#ff88dd',
      Cristal: '#88ddff',
      Gardien: '#ff8844',
    };
    return colors[archetype] || '#00ff88';
  }

  /**
   * Récupère l'icône de l'archétype
   */
  static getArchetypeIcon(archetype: string): string {
    const icons: Record<string, string> = {
      Architecte: '🏛',
      Observateur: '👁',
      Tisseur: '🕸',
      Pilier: '⚓',
      Flux: '🌊',
      Horizon: '🌅',
      Cristal: '💎',
      Gardien: '🛡',
    };
    return icons[archetype] || '✨';
  }

  /**
   * Formatte la perspective narrative
   */
  static formatPerspective(perspective: NarrativePerspective): string {
    const labels: Record<NarrativePerspective, string> = {
      FirstPerson: 'Première Personne (Je)',
      ThirdPerson: 'Troisième Personne (Le système)',
      Collective: 'Collectif (Nous)',
    };
    return labels[perspective] || perspective;
  }
}
