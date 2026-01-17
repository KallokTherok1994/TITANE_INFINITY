/**
 * TITANE∞ v20Ω — UI/UX Adaptive Engine Types
 * Définitions de types pour le système adaptatif
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT & STATE
// ═══════════════════════════════════════════════════════════════════════════

export interface UIContext {
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  orientation: 'portrait' | 'landscape';
  platform: 'desktop' | 'tablet' | 'mobile';
  inputMode: 'mouse' | 'touch' | 'keyboard' | 'hybrid';
  colorScheme: 'light' | 'dark' | 'system';
  reducedMotion: boolean;
  highContrast: boolean;
  timestamp: number;
}

export interface UserBehavior {
  scrollVelocity: number;
  clickFrequency: number;
  mouseIdleTime: number;
  typingSpeed: number;
  focusDuration: number;
  navigationPattern: 'linear' | 'explorative' | 'focused';
  engagementLevel: number; // 0-1
  frustrationSignals: number;
}

export interface CognitiveLoad {
  overallLoad: number; // 0-1
  visualComplexity: number;
  informationDensity: number;
  interactionDemand: number;
  decisionPoints: number;
  taskProgress: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// ADAPTATION TARGETS
// ═══════════════════════════════════════════════════════════════════════════

export interface LayoutAdaptation {
  gridColumns: number;
  spacing: 'compact' | 'normal' | 'relaxed';
  sidebarVisible: boolean;
  sidebarWidth: number;
  headerHeight: number;
  footerVisible: boolean;
  panelLayout: 'stack' | 'side-by-side' | 'grid';
}

export interface DensityAdaptation {
  fontSize: 'small' | 'medium' | 'large';
  lineHeight: number;
  padding: 'tight' | 'normal' | 'loose';
  iconSize: number;
  buttonSize: 'sm' | 'md' | 'lg';
  cardDensity: 'compact' | 'standard' | 'expanded';
}

export interface VisibilityAdaptation {
  showAdvancedOptions: boolean;
  showMetrics: boolean;
  showDebugInfo: boolean;
  tooltipsEnabled: boolean;
  labelsVisible: boolean;
  helpersVisible: boolean;
  progressIndicatorsVisible: boolean;
}

export interface MotionAdaptation {
  animationsEnabled: boolean;
  transitionDuration: number;
  parallaxEnabled: boolean;
  loadingAnimations: 'spinner' | 'skeleton' | 'pulse' | 'none';
  hoverEffects: boolean;
  scrollBehavior: 'smooth' | 'auto';
}

export interface ThemeAdaptation {
  colorScheme: 'light' | 'dark' | 'auto';
  accentColor: string;
  surfaceOpacity: number;
  borderRadius: 'sharp' | 'soft' | 'round';
  shadowIntensity: 'none' | 'subtle' | 'medium' | 'strong';
  contrastMode: 'normal' | 'high';
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSITE ADAPTATION STATE
// ═══════════════════════════════════════════════════════════════════════════

export interface AdaptationState {
  layout: LayoutAdaptation;
  density: DensityAdaptation;
  visibility: VisibilityAdaptation;
  motion: MotionAdaptation;
  theme: ThemeAdaptation;
  timestamp: number;
  confidence: number;
  source: 'auto' | 'user' | 'policy';
}

// ═══════════════════════════════════════════════════════════════════════════
// USER MODE & PROFILE
// ═══════════════════════════════════════════════════════════════════════════

export type UserMode =
  | 'novice' // Utilisateur débutant - guidage maximal
  | 'standard' // Utilisateur normal - équilibre
  | 'power' // Utilisateur avancé - fonctionnalités complètes
  | 'focus' // Mode concentration - distractions minimales
  | 'accessibility'; // Mode accessibilité renforcée

export interface UserProfile {
  mode: UserMode;
  expertise: number; // 0-1
  preferences: Partial<AdaptationState>;
  history: AdaptationHistoryEntry?.[];
  lastSeen: number;
}

export interface AdaptationHistoryEntry {
  timestamp: number;
  trigger: string;
  before: Partial<AdaptationState>;
  after: Partial<AdaptationState>;
  userAccepted: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// DETECTION SIGNALS
// ═══════════════════════════════════════════════════════════════════════════

export interface DetectionSignal {
  type: 'context' | 'overload' | 'behavior' | 'performance' | 'mode';
  confidence: number; // 0-1
  value: unknown;
  timestamp: number;
  source: string;
}

export interface OverloadSignal extends DetectionSignal {
  type: 'overload';
  value: {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string?.[];
    recommendation: 'simplify' | 'reduce' | 'pause' | 'none';
  };
}

export interface PerformanceSignal extends DetectionSignal {
  type: 'performance';
  value: {
    fps: number;
    frameDrops: number;
    memoryUsage: number;
    renderTime: number;
    recommendation: 'optimize' | 'degrade' | 'none';
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// POLICY DECISIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface PolicyDecision {
  policy: string;
  action: string;
  priority: number;
  adaptation: Partial<AdaptationState>;
  reason: string;
  overridable: boolean;
}

export interface PolicyContext {
  uiContext: UIContext;
  userBehavior: UserBehavior;
  cognitiveLoad: CognitiveLoad;
  userProfile: UserProfile;
  currentState: AdaptationState;
  signals: DetectionSignal?.[];
}

// ═══════════════════════════════════════════════════════════════════════════
// ENGINE EVENTS
// ═══════════════════════════════════════════════════════════════════════════

export type UIUXEventType =
  | 'adaptation:started'
  | 'adaptation:completed'
  | 'adaptation:rejected'
  | 'signal:detected'
  | 'policy:applied'
  | 'user:override'
  | 'mode:changed'
  | 'error';

export interface UIUXEvent {
  type: UIUXEventType;
  timestamp: number;
  data: unknown;
}

export type UIUXEventHandler = (any: any) => void;
