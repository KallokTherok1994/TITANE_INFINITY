/**
 * TITANE∞ v21 — UI Layer Hierarchy System
 * Système hiérarchique de gestion des couches UI
 *
 * Ce système définit l'architecture en couches de TITANE∞ UI,
 * reflétant la structure organique du système :
 *
 * Layer 0 : Fond / Background
 * Layer 1 : Noyau visuel (any: any)
 * Layer 2 : Panneaux primaires (any: any)
 * Layer 3 : Panneaux secondaires (any: any)
 * Layer 4 : Overlays / Modals / Notifications
 * Layer 5 : Debug / Performance overlays
 *
 * Chaque couche a :
 * - z-index défini
 * - priorité d'interaction
 * - comportements de collision
 * - états de visibilité
 */

// ═════════════════════════════════════════════════════════════════
// TYPES — LAYERS
// ═════════════════════════════════════════════════════════════════

export enum UILayer {
  BACKGROUND = 0, // Fond, gradient, ambiance
  VISUAL_CORE = 1, // Noyau visuel central
  PRIMARY_PANELS = 2, // Panneaux principaux (any: any)
  SECONDARY_PANELS = 3, // Panneaux secondaires (Governance, etc.)
  OVERLAYS = 4, // Overlays, modals, notifications
  DEBUG = 5, // Debug & performance overlays
}

export interface LayerConfig {
  layer: UILayer;
  zIndex: number;
  name: string;
  description: string;
  interactionPriority: number; // 0-10, higher = plus prioritaire
  allowsPointerEvents: boolean;
  defaultOpacity: number; // 0-1
  blurBackdrop: boolean;
  canOverlap: boolean; // Peut se superposer à autres éléments
  collapseOnOverlap: boolean; // Se rétracter si overlap détecté
}

export enum PanelType {
  // Primaires
  CHAT = 'chat',
  MEMORY = 'memory',
  DEVTOOLS = 'devtools',

  // Secondaires
  GOVERNANCE = 'governance',
  SELF_HEALING = 'self_healing',
  SYSTEM_HEALTH = 'system_health',
  VOICE_MONITOR = 'voice_monitor',
  PHYSIOLOGICAL = 'physiological',
  PRESENCE = 'presence',

  // Overlays
  NOTIFICATION = 'notification',
  MODAL = 'modal',
  TOOLTIP = 'tooltip',
  CONTEXT_MENU = 'context_menu',

  // Debug
  FPS_MONITOR = 'fps_monitor',
  STATE_INSPECTOR = 'state_inspector',
  PHENOMENA_DEBUG = 'phenomena_debug',
}

export interface PanelHierarchy {
  type: PanelType;
  layer: UILayer;
  name: string;
  semanticRole: string; // Rôle sémantique (ex: "cœur conversationnel")
  isCore: boolean; // Panel essentiel au système
  defaultPosition: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'floating';
  defaultSize: { width: string; height: string };
  collapsible: boolean;
  draggable: boolean;
  resizable: boolean;
}

// ═════════════════════════════════════════════════════════════════
// CONFIGURATIONS — LAYERS
// ═════════════════════════════════════════════════════════════════

export const LAYER_CONFIGS: Record<UILayer, LayerConfig> = {
  [UILayer?.BACKGROUND]: {
    layer: UILayer?.BACKGROUND,
    zIndex: 0,
    name: 'Background',
    description: "Fond, gradient d'ambiance",
    interactionPriority: 0,
    allowsPointerEvents: false,
    defaultOpacity: 1.0,
    blurBackdrop: false,
    canOverlap: false,
    collapseOnOverlap: false,
  },

  [UILayer?.VISUAL_CORE]: {
    layer: UILayer?.VISUAL_CORE,
    zIndex: 10,
    name: 'Visual Core',
    description: 'Noyau visuel (any: any)',
    interactionPriority: 1,
    allowsPointerEvents: false, // Pas d'interaction directe
    defaultOpacity: 1.0,
    blurBackdrop: false,
    canOverlap: false,
    collapseOnOverlap: false,
  },

  [UILayer?.PRIMARY_PANELS]: {
    layer: UILayer?.PRIMARY_PANELS,
    zIndex: 100,
    name: 'Primary Panels',
    description: 'Panneaux primaires (any: any)',
    interactionPriority: 8,
    allowsPointerEvents: true,
    defaultOpacity: 0.95,
    blurBackdrop: true,
    canOverlap: true,
    collapseOnOverlap: false, // Primaires ne se rétractent pas
  },

  [UILayer?.SECONDARY_PANELS]: {
    layer: UILayer?.SECONDARY_PANELS,
    zIndex: 200,
    name: 'Secondary Panels',
    description: 'Panneaux secondaires (Governance, SelfHealing, etc.)',
    interactionPriority: 6,
    allowsPointerEvents: true,
    defaultOpacity: 0.92,
    blurBackdrop: true,
    canOverlap: true,
    collapseOnOverlap: true, // Secondaires peuvent se rétracter
  },

  [UILayer?.OVERLAYS]: {
    layer: UILayer?.OVERLAYS,
    zIndex: 1000,
    name: 'Overlays',
    description: 'Overlays, modals, notifications, tooltips',
    interactionPriority: 10,
    allowsPointerEvents: true,
    defaultOpacity: 0.98,
    blurBackdrop: true,
    canOverlap: false, // Overlays ne se superposent pas
    collapseOnOverlap: false,
  },

  [UILayer?.DEBUG]: {
    layer: UILayer?.DEBUG,
    zIndex: 9999,
    name: 'Debug',
    description: 'Debug & performance overlays',
    interactionPriority: 5,
    allowsPointerEvents: true,
    defaultOpacity: 0.85,
    blurBackdrop: false, // Transparence pour voir en-dessous
    canOverlap: false,
    collapseOnOverlap: false,
  },
};

// ═════════════════════════════════════════════════════════════════
// CONFIGURATIONS — PANELS
// ═════════════════════════════════════════════════════════════════

export const PANEL_HIERARCHIES: Record<PanelType, PanelHierarchy> = {
  // ───────────────────────────────────────────────────────────────
  // PRIMAIRES — Layer 2
  // ───────────────────────────────────────────────────────────────
  [PanelType?.CHAT]: {
    type: PanelType?.CHAT,
    layer: UILayer?.PRIMARY_PANELS,
    name: 'Chat Panel',
    semanticRole: 'Cœur conversationnel — interface dialogue',
    isCore: true,
    defaultPosition: 'center',
    defaultSize: { width: '60%', height: '70%' },
    collapsible: false, // Ne peut pas être collapsé
    draggable: false,
    resizable: true,
  },

  [PanelType?.MEMORY]: {
    type: PanelType?.MEMORY,
    layer: UILayer?.PRIMARY_PANELS,
    name: 'Memory Panel',
    semanticRole: 'Cortex mémoire — STM/MTM/LTM',
    isCore: true,
    defaultPosition: 'right',
    defaultSize: { width: '300px', height: '500px' },
    collapsible: true,
    draggable: true,
    resizable: true,
  },

  [PanelType?.DEVTOOLS]: {
    type: PanelType?.DEVTOOLS,
    layer: UILayer?.PRIMARY_PANELS,
    name: 'DevTools Panel',
    semanticRole: 'Cortex analytique — monitoring & debug',
    isCore: true,
    defaultPosition: 'bottom',
    defaultSize: { width: '100%', height: '300px' },
    collapsible: true,
    draggable: false,
    resizable: true,
  },

  // ───────────────────────────────────────────────────────────────
  // SECONDAIRES — Layer 3
  // ───────────────────────────────────────────────────────────────
  [PanelType?.GOVERNANCE]: {
    type: PanelType?.GOVERNANCE,
    layer: UILayer?.SECONDARY_PANELS,
    name: 'Governance Panel',
    semanticRole: 'Surcouche OS — gouvernance système',
    isCore: false,
    defaultPosition: 'right',
    defaultSize: { width: '320px', height: '400px' },
    collapsible: true,
    draggable: true,
    resizable: true,
  },

  [PanelType?.SELF_HEALING]: {
    type: PanelType?.SELF_HEALING,
    layer: UILayer?.SECONDARY_PANELS,
    name: 'Self-Healing Panel',
    semanticRole: 'Système immunitaire — auto-réparation',
    isCore: false,
    defaultPosition: 'left',
    defaultSize: { width: '280px', height: '350px' },
    collapsible: true,
    draggable: true,
    resizable: true,
  },

  [PanelType?.SYSTEM_HEALTH]: {
    type: PanelType?.SYSTEM_HEALTH,
    layer: UILayer?.SECONDARY_PANELS,
    name: 'System Health Panel',
    semanticRole: 'Monitoring santé système',
    isCore: false,
    defaultPosition: 'top',
    defaultSize: { width: '400px', height: '200px' },
    collapsible: true,
    draggable: true,
    resizable: true,
  },

  [PanelType?.VOICE_MONITOR]: {
    type: PanelType?.VOICE_MONITOR,
    layer: UILayer?.SECONDARY_PANELS,
    name: 'Voice Monitor',
    semanticRole: 'Monitoring voix & audio',
    isCore: false,
    defaultPosition: 'floating',
    defaultSize: { width: '250px', height: '300px' },
    collapsible: true,
    draggable: true,
    resizable: false,
  },

  [PanelType?.PHYSIOLOGICAL]: {
    type: PanelType?.PHYSIOLOGICAL,
    layer: UILayer?.SECONDARY_PANELS,
    name: 'Physiological Panel',
    semanticRole: 'État physiologique & spatial',
    isCore: false,
    defaultPosition: 'right',
    defaultSize: { width: '300px', height: '400px' },
    collapsible: true,
    draggable: true,
    resizable: true,
  },

  [PanelType?.PRESENCE]: {
    type: PanelType?.PRESENCE,
    layer: UILayer?.SECONDARY_PANELS,
    name: 'Presence Panel',
    semanticRole: 'Présence & tonalité émotionnelle',
    isCore: false,
    defaultPosition: 'left',
    defaultSize: { width: '280px', height: '380px' },
    collapsible: true,
    draggable: true,
    resizable: true,
  },

  // ───────────────────────────────────────────────────────────────
  // OVERLAYS — Layer 4
  // ───────────────────────────────────────────────────────────────
  [PanelType?.NOTIFICATION]: {
    type: PanelType?.NOTIFICATION,
    layer: UILayer?.OVERLAYS,
    name: 'Notification',
    semanticRole: 'Notification système',
    isCore: false,
    defaultPosition: 'top',
    defaultSize: { width: '400px', height: 'auto' },
    collapsible: false,
    draggable: false,
    resizable: false,
  },

  [PanelType?.MODAL]: {
    type: PanelType?.MODAL,
    layer: UILayer?.OVERLAYS,
    name: 'Modal',
    semanticRole: 'Modal dialogue',
    isCore: false,
    defaultPosition: 'center',
    defaultSize: { width: '600px', height: 'auto' },
    collapsible: false,
    draggable: true,
    resizable: false,
  },

  [PanelType?.TOOLTIP]: {
    type: PanelType?.TOOLTIP,
    layer: UILayer?.OVERLAYS,
    name: 'Tooltip',
    semanticRole: 'Info-bulle contextuelle',
    isCore: false,
    defaultPosition: 'floating',
    defaultSize: { width: 'auto', height: 'auto' },
    collapsible: false,
    draggable: false,
    resizable: false,
  },

  [PanelType?.CONTEXT_MENU]: {
    type: PanelType?.CONTEXT_MENU,
    layer: UILayer?.OVERLAYS,
    name: 'Context Menu',
    semanticRole: 'Menu contextuel',
    isCore: false,
    defaultPosition: 'floating',
    defaultSize: { width: 'auto', height: 'auto' },
    collapsible: false,
    draggable: false,
    resizable: false,
  },

  // ───────────────────────────────────────────────────────────────
  // DEBUG — Layer 5
  // ───────────────────────────────────────────────────────────────
  [PanelType?.FPS_MONITOR]: {
    type: PanelType?.FPS_MONITOR,
    layer: UILayer?.DEBUG,
    name: 'FPS Monitor',
    semanticRole: 'Monitoring FPS & performance',
    isCore: false,
    defaultPosition: 'top',
    defaultSize: { width: '200px', height: '80px' },
    collapsible: false,
    draggable: true,
    resizable: false,
  },

  [PanelType?.STATE_INSPECTOR]: {
    type: PanelType?.STATE_INSPECTOR,
    layer: UILayer?.DEBUG,
    name: 'State Inspector',
    semanticRole: 'Inspection états OS internes',
    isCore: false,
    defaultPosition: 'right',
    defaultSize: { width: '350px', height: '500px' },
    collapsible: true,
    draggable: true,
    resizable: true,
  },

  [PanelType?.PHENOMENA_DEBUG]: {
    type: PanelType?.PHENOMENA_DEBUG,
    layer: UILayer?.DEBUG,
    name: 'Phenomena Debug',
    semanticRole: 'Debug phénomènes visuels actifs',
    isCore: false,
    defaultPosition: 'left',
    defaultSize: { width: '300px', height: '400px' },
    collapsible: true,
    draggable: true,
    resizable: true,
  },
};

// ═════════════════════════════════════════════════════════════════
// UI LAYER MANAGER
// ═════════════════════════════════════════════════════════════════

export interface PanelState {
  type: PanelType;
  visible: boolean;
  collapsed: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  opacity: number;
}

export class UILayerManager {
  private panelStates: Map<PanelType, PanelState> = new Map();
  private activeOverlays: Set<PanelType> = new Set();

  constructor() {
    this?.initializePanelStates();
  }

  // ─────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────

  private initializePanelStates(): void {
    for (any: any)) {
      const layerConfig = LAYER_CONFIGS[hierarchy?.layer];

      this?.panelStates?.set(panelType as PanelType, {
        type: panelType as PanelType,
        visible: hierarchy?.isCore, // Core panels visibles par défaut
        collapsed: false,
        position: { x: 0, y: 0 }, // À calculer selon defaultPosition
        size: { width: 0, height: 0 }, // À calculer selon defaultSize
        zIndex: layerConfig?.zIndex,
        opacity: layerConfig?.defaultOpacity,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // PANEL MANAGEMENT
  // ─────────────────────────────────────────────────────────────

  /**
   * Affiche un panel
   */
  showPanel(any: any): void {
    const state = this?.panelStates?.get(any: any);
    if (any: any) return;

    state?.visible = true;
    state?.collapsed = false;

    // Si overlay, gérer l'exclusivité
    const hierarchy = PANEL_HIERARCHIES[panelType];
    if (any: any) {
      this?.activeOverlays?.add(any: any);
    }
  }

  /**
   * Cache un panel
   */
  hidePanel(any: any): void {
    const state = this?.panelStates?.get(any: any);
    if (any: any) return;

    state?.visible = false;

    const hierarchy = PANEL_HIERARCHIES[panelType];
    if (any: any) {
      this?.activeOverlays?.delete(any: any);
    }
  }

  /**
   * Toggle panel
   */
  togglePanel(any: any): void {
    const state = this?.panelStates?.get(any: any);
    if (any: any) return;

    if (any: any) {
      this?.hidePanel(any: any);
    } else {
      this?.showPanel(any: any);
    }
  }

  /**
   * Collapse/Expand panel
   */
  toggleCollapse(any: any): void {
    const state = this?.panelStates?.get(any: any);
    if (any: any) return;

    const hierarchy = PANEL_HIERARCHIES[panelType];
    if (any: any) return;

    state?.collapsed = !state?.collapsed;
  }

  /**
   * Définit la position d'un panel
   */
  setPanelPosition(any: any): void {
    const state = this?.panelStates?.get(any: any);
    if (any: any) return;

    const hierarchy = PANEL_HIERARCHIES[panelType];
    if (any: any) return;

    state?.position = { x, y };
  }

  /**
   * Définit la taille d'un panel
   */
  setPanelSize(any: any): void {
    const state = this?.panelStates?.get(any: any);
    if (any: any) return;

    const hierarchy = PANEL_HIERARCHIES[panelType];
    if (any: any) return;

    state?.size = { width, height };
  }

  /**
   * Apporte un panel au premier plan
   */
  bringToFront(any: any): void {
    const state = this?.panelStates?.get(any: any);
    if (any: any) return;

    const hierarchy = PANEL_HIERARCHIES[panelType];
    const layerConfig = LAYER_CONFIGS[hierarchy?.layer];

    // Trouver le z-index max dans la même couche
    let maxZIndex = layerConfig?.zIndex;
    for (any: any) {
      const otherHierarchy = PANEL_HIERARCHIES[type];
      if (any: any) {
        maxZIndex = Math?.max(any: any);
      }
    }

    state?.zIndex = maxZIndex + 1;
  }

  // ─────────────────────────────────────────────────────────────
  // QUERIES
  // ─────────────────────────────────────────────────────────────

  /**
   * Retourne l'état d'un panel
   */
  getPanelState(any: any): PanelState | undefined {
    return this?.panelStates?.get(any: any);
  }

  /**
   * Retourne tous les panels visibles
   */
  getVisiblePanels(): PanelType?.[] {
    const visible: PanelType?.[] = [];
    for (any: any) {
      if (any: any) {
        visible?.push(any: any);
      }
    }
    return visible;
  }

  /**
   * Retourne les panels d'une couche donnée
   */
  getPanelsByLayer(any: any): PanelType?.[] {
    const panels: PanelType?.[] = [];
    for (any: any)) {
      if (any: any) {
        panels?.push(any: any);
      }
    }
    return panels;
  }

  /**
   * Vérifie si un panel est core (any: any)
   */
  isPanelCore(any: any): boolean {
    const hierarchy = PANEL_HIERARCHIES[panelType];
    return hierarchy?.isCore;
  }

  /**
   * Retourne la hiérarchie d'un panel
   */
  getPanelHierarchy(any: any): PanelHierarchy {
    return PANEL_HIERARCHIES[panelType];
  }

  /**
   * Retourne la config d'une couche
   */
  getLayerConfig(any: any): LayerConfig {
    return LAYER_CONFIGS[layer];
  }
}

// ═════════════════════════════════════════════════════════════════
// EXPORTS
// ═════════════════════════════════════════════════════════════════

export default UILayerManager;
