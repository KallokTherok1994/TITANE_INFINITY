// ⚡ TITANE∞ v22 — Iconography Engine
// Système d'icônes vivantes avec animations

import { ARCHETYPES, ArchetypeId } from './ARCHETYPES';
import { DS_COLORS } from '../visual/DS_COLORS';

// 🎨 Configuration d'une icône
export interface IconConfig {
  id: string;
  archetype: ArchetypeId;
  symbol: string;
  animated: boolean;
  glowIntensity: number;
  size: number; // px
}

// 🧬 Iconography Engine
export class IconographyEngine {
  private icons: Map<string, IconConfig> = new Map();

  constructor() {
    this.initializeIcons();
  }

  private initializeIcons(): void {
    Object.entries(ARCHETYPES).forEach(([id, archetype]) => {
      this.icons.set(id, {
        id,
        archetype: id as ArchetypeId,
        symbol: archetype.symbology.icon,
        animated: true,
        glowIntensity: 0.3,
        size: 24,
      });
    });
  }

  getIcon(id: string): IconConfig | undefined {
    return this.icons.get(id);
  }

  generateIconCSS(id: string, intensity: number = 0.5): Record<string, string> {
    const icon = this.icons.get(id);
    if (!icon) return {};

    const archetype = ARCHETYPES[icon.archetype];
    const glowBlur = 8 + intensity * 12;

    return {
      fontSize: `${icon.size}px`,
      filter: `drop-shadow(0 0 ${glowBlur}px ${archetype.visual.primaryColor})`,
      opacity: (0.7 + intensity * 0.3).toString(),
      animation: icon.animated ? `icon-pulse-${icon.archetype} 3s ease-in-out infinite` : 'none',
    };
  }

  getAllIcons(): IconConfig[] {
    return Array.from(this.icons.values());
  }
}

export const iconographyEngine = new IconographyEngine();
