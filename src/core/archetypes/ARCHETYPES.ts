/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// ⚡ TITANE∞ v22 — Archetypes
// Définition des archétypes cognitifs TITANE∞

import { DS_COLORS } from '../visual/DS_COLORS';
import { MotionType } from '../visual/MOTION_ENGINE';
import { SoundType } from '../sound/SOUND_ENGINE';

// 🎭 Forme symbolique
export type SymbolicForm = 'circle' | 'line' | 'triangle' | 'square' | 'spiral' | 'wave' | 'layer';

// 🎨 Pattern visuel
export type VisualPattern = 'mesh' | 'pulse' | 'oscillation' | 'scanline' | 'halo' | 'fractal' | 'gradient';

// 🧬 Archetype complet
export interface Archetype {
  id: string;
  name: string;
  essence: string; // Description de son rôle
  symbology: {
    form: SymbolicForm;
    pattern: VisualPattern;
    icon: string;
  };
  visual: {
    primaryColor: string;
    primaryColorRgb: string;
    secondaryColor?: string;
    gradient: [string, string];
  };
  motion: {
    natural: MotionType; // Mouvement naturel
    intensity: MotionType; // Mouvement sous charge
    amplitude: number;
    speed: number;
  };
  sound: {
    signature: SoundType;
    pitch: number;
    volume: number;
  };
  emotional: {
    primary: string; // Émotion primaire
    secondary: string; // Émotion secondaire
  };
  connections: string[]; // Autres archétypes connectés
}

// 🔥 HELIOS - L'Énergie
export const ARCHETYPE_HELIOS: Archetype = {
  id: 'helios',
  name: 'Helios',
  essence: 'Le cœur énergétique du système. Dynamique, chaleur, impulsion.',
  symbology: {
    form: 'circle',
    pattern: 'pulse',
    icon: '🔥',
  },
  visual: {
    primaryColor: DS_COLORS.helios.hex,
    primaryColorRgb: DS_COLORS.helios.rgb,
    secondaryColor: DS_COLORS.rubis.hex,
    gradient: [DS_COLORS.helios.hex, DS_COLORS.rubis.hex],
  },
  motion: {
    natural: 'pulse',
    intensity: 'pulse',
    amplitude: 0.04,
    speed: 3000,
  },
  sound: {
    signature: 'pulse',
    pitch: 1.2,
    volume: 0.3,
  },
  emotional: {
    primary: 'Dynamisme',
    secondary: 'Puissance',
  },
  connections: ['nexus', 'aether'],
};

// 🔗 NEXUS - Les Connexions
export const ARCHETYPE_NEXUS: Archetype = {
  id: 'nexus',
  name: 'Nexus',
  essence: "L'intelligence connective. Réseau, liens, trames.",
  symbology: {
    form: 'line',
    pattern: 'mesh',
    icon: '🔗',
  },
  visual: {
    primaryColor: DS_COLORS.nexus.hex,
    primaryColorRgb: DS_COLORS.nexus.rgb,
    secondaryColor: DS_COLORS.saphir.hex,
    gradient: [DS_COLORS.nexus.hex, DS_COLORS.saphir.hex],
  },
  motion: {
    natural: 'flow',
    intensity: 'flow',
    amplitude: 100,
    speed: 2000,
  },
  sound: {
    signature: 'tick',
    pitch: 1.5,
    volume: 0.25,
  },
  emotional: {
    primary: 'Connexion',
    secondary: 'Fluidité',
  },
  connections: ['helios', 'harmonia', 'memory', 'aether'],
};

// ⚖️ HARMONIA - L'Équilibre
export const ARCHETYPE_HARMONIA: Archetype = {
  id: 'harmonia',
  name: 'Harmonia',
  essence: 'La cohérence du système. Stabilité, justesse, balance.',
  symbology: {
    form: 'triangle',
    pattern: 'oscillation',
    icon: '⚖️',
  },
  visual: {
    primaryColor: DS_COLORS.harmonia.hex,
    primaryColorRgb: DS_COLORS.harmonia.rgb,
    secondaryColor: DS_COLORS.emeraude.hex,
    gradient: [DS_COLORS.harmonia.hex, DS_COLORS.emeraude.hex],
  },
  motion: {
    natural: 'sway',
    intensity: 'sway',
    amplitude: 2,
    speed: 4000,
  },
  sound: {
    signature: 'pulse',
    pitch: 1.0,
    volume: 0.2,
  },
  emotional: {
    primary: 'Équilibre',
    secondary: 'Sérénité',
  },
  connections: ['nexus', 'memory'],
};

// 🧠 MEMORY - La Profondeur
export const ARCHETYPE_MEMORY: Archetype = {
  id: 'memory',
  name: 'Memory',
  essence: 'La mémoire vivante. Couches, archives, profondeur.',
  symbology: {
    form: 'layer',
    pattern: 'scanline',
    icon: '🧠',
  },
  visual: {
    primaryColor: DS_COLORS.memory.hex,
    primaryColorRgb: DS_COLORS.memory.rgb,
    secondaryColor: DS_COLORS.memory.variants[700],
    gradient: [DS_COLORS.memory.hex, DS_COLORS.memory.variants[700]],
  },
  motion: {
    natural: 'scan',
    intensity: 'scan',
    amplitude: 100,
    speed: 4000,
  },
  sound: {
    signature: 'ambient',
    pitch: 0.8,
    volume: 0.15,
  },
  emotional: {
    primary: 'Profondeur',
    secondary: 'Contemplation',
  },
  connections: ['nexus', 'harmonia', 'aether'],
};

// ⚪ AETHER - Le Global
export const ARCHETYPE_AETHER: Archetype = {
  id: 'aether',
  name: 'Aether',
  essence: 'La conscience globale. Synthèse, unité, transcendance.',
  symbology: {
    form: 'circle',
    pattern: 'halo',
    icon: '⚪',
  },
  visual: {
    primaryColor: DS_COLORS.diamant.variants[50],
    primaryColorRgb: hexToRgb(DS_COLORS.diamant.variants[50]),
    secondaryColor: DS_COLORS.diamant.variants[200],
    gradient: [DS_COLORS.diamant.variants[50], DS_COLORS.diamant.variants[200]],
  },
  motion: {
    natural: 'breathe',
    intensity: 'breathe',
    amplitude: 0.02,
    speed: 5000,
  },
  sound: {
    signature: 'ambient',
    pitch: 1.0,
    volume: 0.1,
  },
  emotional: {
    primary: 'Conscience',
    secondary: 'Harmonie',
  },
  connections: ['helios', 'nexus', 'memory'],
};

// 🎨 Helper pour convertir hex en rgb
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || !result[1] || !result[2] || !result[3]) return '255, 255, 255';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

// 📚 Collection complète des archétypes
export const ARCHETYPES: Record<string, Archetype> = {
  helios: ARCHETYPE_HELIOS,
  nexus: ARCHETYPE_NEXUS,
  harmonia: ARCHETYPE_HARMONIA,
  memory: ARCHETYPE_MEMORY,
  aether: ARCHETYPE_AETHER,
};

// 🎭 Types
export type ArchetypeId = keyof typeof ARCHETYPES;
