// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v24.12 — AVATAR DISPLAY STATE (Frontend)
//   TypeScript Types & State Management
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Mode d'affichage avatar
 */
export enum AvatarDisplayMode {
  Floating = 'floating',  // Fenêtre flottante indépendante
  Embed = 'embed',        // Intégré dans fenêtre principale
  Hidden = 'hidden',      // Caché
}

/**
 * Position d'ancrage pour la fenêtre flottante
 */
export enum AnchorPosition {
  TopLeft = 'top_left',
  TopCenter = 'top_center',
  TopRight = 'top_right',
  CenterLeft = 'center_left',
  Center = 'center',
  CenterRight = 'center_right',
  BottomLeft = 'bottom_left',
  BottomCenter = 'bottom_center',
  BottomRight = 'bottom_right',
  Free = 'free',  // Position libre (drag)
}

/**
 * État d'affichage complet de l'avatar
 */
export interface AvatarDisplayState {
  // Mode & Position
  mode: AvatarDisplayMode;
  position: [number, number];  // [x, y] en pixels
  anchor: AnchorPosition;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  screen_index: number;   // Index de l'écran (0 = principal)

  // Dimensions
  width: number;
  height: number;
  scale: number;            // 0.1 à 2.0

  // Apparence
  opacity: number;          // 0.0 à 1.0
  brightness: number;       // 0.0 à 2.0

  // Comportement
  // eslint-disable-next-line @typescript-eslint/naming-convention
  always_on_top: boolean;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  mirror_mode: boolean;     // Effet miroir horizontal
  locked: boolean;          // Verrouillage drag & resize
  // eslint-disable-next-line @typescript-eslint/naming-convention
  click_through: boolean;   // Passthrough des clics

  // État
  visible: boolean;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  last_updated: number;     // Timestamp
}

/**
 * Mise à jour partielle de l'état d'affichage
 */
export interface AvatarDisplayStateUpdate {
  mode?: AvatarDisplayMode;
  position?: [number, number];
  anchor?: AnchorPosition;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  screen_index?: number;
  width?: number;
  height?: number;
  scale?: number;
  opacity?: number;
  brightness?: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  always_on_top?: boolean;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  mirror_mode?: boolean;
  locked?: boolean;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  click_through?: boolean;
  visible?: boolean;
}

/**
 * Informations d'écran (multi-screen)
 */
export interface ScreenInfo {
  index: number;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  scale_factor: number;
}

/**
 * État par défaut
 */
export const DEFAULT_DISPLAY_STATE: AvatarDisplayState = {
  mode: AvatarDisplayMode.Embed,
  position: [0, 0],
  anchor: AnchorPosition.BottomRight,
  screen_index: 0,
  width: 400,
  height: 600,
  scale: 1.0,
  opacity: 1.0,
  brightness: 1.0,
  always_on_top: false,
  mirror_mode: false,
  locked: false,
  click_through: false,
  visible: true,
  last_updated: Date.now(),
};

/**
 * Parseur de position d'ancrage depuis texte
 */
export function parseAnchorPosition(anchorStr: string): AnchorPosition | null {
  const normalized = anchorStr.toLowerCase().trim();

  const mapping: Record<string, AnchorPosition> = {
    'top-left': AnchorPosition.TopLeft,
    'topleft': AnchorPosition.TopLeft,
    'haut-gauche': AnchorPosition.TopLeft,
    'coin haut gauche': AnchorPosition.TopLeft,

    'top-center': AnchorPosition.TopCenter,
    'topcenter': AnchorPosition.TopCenter,
    'haut-centre': AnchorPosition.TopCenter,
    'haut centre': AnchorPosition.TopCenter,

    'top-right': AnchorPosition.TopRight,
    'topright': AnchorPosition.TopRight,
    'haut-droite': AnchorPosition.TopRight,
    'coin haut droite': AnchorPosition.TopRight,

    'center-left': AnchorPosition.CenterLeft,
    'centerleft': AnchorPosition.CenterLeft,
    'centre-gauche': AnchorPosition.CenterLeft,

    'center': AnchorPosition.Center,
    'centre': AnchorPosition.Center,
    'milieu': AnchorPosition.Center,

    'center-right': AnchorPosition.CenterRight,
    'centerright': AnchorPosition.CenterRight,
    'centre-droite': AnchorPosition.CenterRight,

    'bottom-left': AnchorPosition.BottomLeft,
    'bottomleft': AnchorPosition.BottomLeft,
    'bas-gauche': AnchorPosition.BottomLeft,
    'coin bas gauche': AnchorPosition.BottomLeft,

    'bottom-center': AnchorPosition.BottomCenter,
    'bottomcenter': AnchorPosition.BottomCenter,
    'bas-centre': AnchorPosition.BottomCenter,
    'bas centre': AnchorPosition.BottomCenter,

    'bottom-right': AnchorPosition.BottomRight,
    'bottomright': AnchorPosition.BottomRight,
    'bas-droite': AnchorPosition.BottomRight,
    'coin bas droite': AnchorPosition.BottomRight,

    'free': AnchorPosition.Free,
    'libre': AnchorPosition.Free,
    'custom': AnchorPosition.Free,
  };

  return mapping[normalized] || null;
}

/**
 * Calcule la position ancrée pour une résolution donnée
 */
export function calculateAnchoredPosition(
  anchor: AnchorPosition,
  screenWidth: number,
  screenHeight: number,
  windowWidth: number,
  windowHeight: number,
  margin: number = 20
): [number, number] {
  switch (anchor) {
    case AnchorPosition.TopLeft:
      return [margin, margin];
    case AnchorPosition.TopCenter:
      return [
        Math.floor((screenWidth / 2) - (windowWidth / 2)),
        margin,
      ];
    case AnchorPosition.TopRight:
      return [
        screenWidth - windowWidth - margin,
        margin,
      ];
    case AnchorPosition.CenterLeft:
      return [
        margin,
        Math.floor((screenHeight / 2) - (windowHeight / 2)),
      ];
    case AnchorPosition.Center:
      return [
        Math.floor((screenWidth / 2) - (windowWidth / 2)),
        Math.floor((screenHeight / 2) - (windowHeight / 2)),
      ];
    case AnchorPosition.CenterRight:
      return [
        screenWidth - windowWidth - margin,
        Math.floor((screenHeight / 2) - (windowHeight / 2)),
      ];
    case AnchorPosition.BottomLeft:
      return [
        margin,
        screenHeight - windowHeight - margin,
      ];
    case AnchorPosition.BottomCenter:
      return [
        Math.floor((screenWidth / 2) - (windowWidth / 2)),
        screenHeight - windowHeight - margin,
      ];
    case AnchorPosition.BottomRight:
      return [
        screenWidth - windowWidth - margin,
        screenHeight - windowHeight - margin,
      ];
    case AnchorPosition.Free:
    default:
      return [0, 0]; // Position libre
  }
}

/**
 * Valide et applique les contraintes sur un état d'affichage
 */
export function validateDisplayState(state: AvatarDisplayState): AvatarDisplayState {
  return {
    ...state,
    scale: Math.max(0.1, Math.min(2.0, state.scale)),
    opacity: Math.max(0.0, Math.min(1.0, state.opacity)),
    brightness: Math.max(0.0, Math.min(2.0, state.brightness)),
    width: Math.max(200, state.width),
    height: Math.max(300, state.height),
    last_updated: Date.now(),
  };
}
