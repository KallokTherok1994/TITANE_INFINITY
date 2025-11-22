/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ Design System — Thèmes Officiels
 * 4 thèmes premium: Rubis, Saphir, Émeraude, Diamant
 * ═══════════════════════════════════════════════════════════════
 */

import type { Theme } from './types';

/**
 * 🔴 RUBIS — Intensité & Passion
 * Palette rouge intense, énergie maximale, focus performance
 */
export const rubisTheme: Theme = {
  name: 'rubis',
  displayName: 'Rubis',
  colors: {
    primary: '#E11D48', // Ruby red
    secondary: '#F43F5E',
    accent: '#FB7185',
    
    background: {
      base: '#0F0A0D',
      elevated: '#1A0F14',
      overlay: '#2D1721',
    },
    
    surface: {
      base: '#1F0E17',
      elevated: '#2A1520',
      hover: '#3A1F2E',
    },
    
    text: {
      primary: '#FFF1F2',
      secondary: '#FFD1D9',
      tertiary: '#FFB3BE',
      muted: '#9F3A4D',
    },
    
    border: {
      base: '#4C1D2F',
      focus: '#E11D48',
      error: '#DC2626',
    },
    
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#DC2626',
      info: '#3B82F6',
    },
  },
  
  effects: {
    glow: 'rgba(225, 29, 72, 0.4)',
    shadow: 'rgba(225, 29, 72, 0.2)',
    glass: 'rgba(31, 14, 23, 0.85)',
  },
};

/**
 * 🔵 SAPHIR — Fluidité & Clarté
 * Palette bleue apaisante, focus productivité
 */
export const saphirTheme: Theme = {
  name: 'saphir',
  displayName: 'Saphir',
  colors: {
    primary: '#2563EB', // Sapphire blue
    secondary: '#3B82F6',
    accent: '#60A5FA',
    
    background: {
      base: '#0A0E14',
      elevated: '#0F1419',
      overlay: '#171D28',
    },
    
    surface: {
      base: '#111826',
      elevated: '#1A2332',
      hover: '#243447',
    },
    
    text: {
      primary: '#F0F9FF',
      secondary: '#DBEAFE',
      tertiary: '#BFDBFE',
      muted: '#60A5FA',
    },
    
    border: {
      base: '#1E3A5F',
      focus: '#2563EB',
      error: '#DC2626',
    },
    
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#DC2626',
      info: '#3B82F6',
    },
  },
  
  effects: {
    glow: 'rgba(37, 99, 235, 0.4)',
    shadow: 'rgba(37, 99, 235, 0.2)',
    glass: 'rgba(17, 24, 38, 0.85)',
  },
};

/**
 * 🟢 ÉMERAUDE — Équilibre & Croissance
 * Palette verte harmonieuse, focus bien-être
 */
export const emeraudeTheme: Theme = {
  name: 'emeraude',
  displayName: 'Émeraude',
  colors: {
    primary: '#10B981', // Emerald green
    secondary: '#14B8A6',
    accent: '#34D399',
    
    background: {
      base: '#061109',
      elevated: '#0A1612',
      overlay: '#122420',
    },
    
    surface: {
      base: '#0D1F17',
      elevated: '#15291F',
      hover: '#1F3D2F',
    },
    
    text: {
      primary: '#ECFDF5',
      secondary: '#D1FAE5',
      tertiary: '#A7F3D0',
      muted: '#6EE7B7',
    },
    
    border: {
      base: '#1E4D3B',
      focus: '#10B981',
      error: '#DC2626',
    },
    
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#DC2626',
      info: '#3B82F6',
    },
  },
  
  effects: {
    glow: 'rgba(16, 185, 129, 0.4)',
    shadow: 'rgba(16, 185, 129, 0.2)',
    glass: 'rgba(13, 31, 23, 0.85)',
  },
};

/**
 * ⚪ DIAMANT — Clarté & Précision
 * Palette gris premium, focus élégance
 */
export const diamantTheme: Theme = {
  name: 'diamant',
  displayName: 'Diamant',
  colors: {
    primary: '#8B5CF6', // Violet premium
    secondary: '#A78BFA',
    accent: '#C4B5FD',
    
    background: {
      base: '#09090B',
      elevated: '#0F0F12',
      overlay: '#18181B',
    },
    
    surface: {
      base: '#131316',
      elevated: '#1C1C21',
      hover: '#27272A',
    },
    
    text: {
      primary: '#FAFAFA',
      secondary: '#E4E4E7',
      tertiary: '#D4D4D8',
      muted: '#A1A1AA',
    },
    
    border: {
      base: '#3F3F46',
      focus: '#8B5CF6',
      error: '#DC2626',
    },
    
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#DC2626',
      info: '#3B82F6',
    },
  },
  
  effects: {
    glow: 'rgba(139, 92, 246, 0.4)',
    shadow: 'rgba(139, 92, 246, 0.2)',
    glass: 'rgba(19, 19, 22, 0.85)',
  },
};

/**
 * Tous les thèmes exportés
 */
export const themes = {
  rubis: rubisTheme,
  saphir: saphirTheme,
  emeraude: emeraudeTheme,
  diamant: diamantTheme,
} as const;

export type ThemeName = keyof typeof themes;

/**
 * Thème par défaut
 */
export const defaultTheme: ThemeName = 'saphir';
