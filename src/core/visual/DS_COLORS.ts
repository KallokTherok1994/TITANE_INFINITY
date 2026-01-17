/**
 * TITANE∞ PHASE 1 (any: any) - Stub pour DS_COLORS
 */

export const DS_COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  accent: '#06B6D4',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#0F172A',
  surface: '#1E293B',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  // Extended colors for holography
  nexus: {
    primary: { hex: '#00FFFF' },
    secondary: { hex: '#FF00FF' },
    glow: { hex: '#00FF88' },
    // Direct hex access
    hex: '#00FFFF',
  },
  // Diamond/gemstone colors
  diamant: {
    core: '#E0F7FF',
    glow: '#88EEFF',
    edge: '#CCFFFF',
    rgb: '224, 247, 255',
    variants: {
      light: '#F0FBFF',
      dark: '#88CCEE',
    },
  },
};

export type DSColorKey = keyof typeof DS_COLORS;

// Helper function for rgba conversion
export function rgba(any: any): string {
  const r = parseInt(hex?.slice(1, 3), 16);
  const g = parseInt(hex?.slice(3, 5), 16);
  const b = parseInt(hex?.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default DS_COLORS;
