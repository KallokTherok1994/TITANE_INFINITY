/**
 * TITANE∞ v21 — Visual Event Model (VEM)
 * Modèle événementiel unifié pour le système visuel
 *
 * Le VEM déclare TOUS les événements visuels de TITANE∞ :
 * - Événements cognitifs (thinking, processing, etc.)
 * - Événements conversationnels (message received/sent)
 * - Événements émotionnels (emotion shift, empathy boost)
 * - Événements système (load increase/decrease, performance)
 * - Événements pipeline OMEGA (step start/end, error)
 * - Événements auto-réparation (healing start/wave/complete)
 *
 * Chaque événement possède :
 * - Nom unique
 * - Priorité (pour résolution de conflits)
 * - Effets visuels associés
 * - Règles d'inhibition/préemption
 * - Durées minimales
 *
 * Architecture:
 * Event → VEM → VisualConductor → Visual Effects → Render
 */

// ═════════════════════════════════════════════════════════════════
// TYPES — ÉVÉNEMENTS
// ═════════════════════════════════════════════════════════════════

export type VisualEventType =
  | 'cognitive'
  | 'conversational'
  | 'emotional'
  | 'system'
  | 'pipeline'
  | 'healing'
  | 'user_interaction'
  | 'notification';

export type VisualEffectType =
  | 'pulse'
  | 'glow'
  | 'particle_burst'
  | 'energy_arc'
  | 'orbital_shift'
  | 'color_shift'
  | 'glitch'
  | 'healing_wave'
  | 'audio_waveform'
  | 'ripple'
  | 'trail'
  | 'vortex';

export enum EventPriority {
  CRITICAL = 100, // Highest priority (errors, healing critical)
  HIGH = 75, // Important (processing, pipeline steps)
  MEDIUM = 50, // Normal (thinking, messages)
  LOW = 25, // Background (idle, listening)
  AMBIENT = 10, // Lowest (ambient effects)
}

export interface VisualEffect {
  type: VisualEffectType;
  intensity: number; // 0-1
  duration: number; // ms (0 = infinite)
  delay: number; // ms (delay before starting)
  color?: string;
  parameters?: Record<string, unknown>;
}

export interface VisualEvent {
  // Identity
  name: string;
  type: VisualEventType;
  priority: EventPriority;

  // Effects
  effects: VisualEffect[];

  // Timing
  minDuration: number; // ms (minimum duration before preemption)
  maxDuration: number; // ms (0 = infinite)

  // Conflict resolution
  inhibits: string[]; // Events that cannot run with this one
  preempts: string[]; // Events that this one replaces

  // Metadata
  description: string;
  tags: string[];
}

// ═════════════════════════════════════════════════════════════════
// VISUAL EVENT MODEL — EVENT DEFINITIONS
// ═════════════════════════════════════════════════════════════════

export const VISUAL_EVENTS: Record<string, VisualEvent> = {
  // ═══════════════════════════════════════════════════════════════
  // COGNITIVE EVENTS
  // ═══════════════════════════════════════════════════════════════

  thinking_start: {
    name: 'thinking_start',
    type: 'cognitive',
    priority: EventPriority.MEDIUM,
    effects: [
      {
        type: 'pulse',
        intensity: 0.6,
        duration: 0,
        delay: 0,
      },
      {
        type: 'particle_burst',
        intensity: 0.5,
        duration: 500,
        delay: 0,
      },
      {
        type: 'orbital_shift',
        intensity: 0.4,
        duration: 1000,
        delay: 0,
      },
    ],
    minDuration: 300,
    maxDuration: 0,
    inhibits: ['idle'],
    preempts: ['listening'],
    description: 'TITANE∞ begins thinking/reasoning',
    tags: ['cognitive', 'processing'],
  },

  thinking_progress: {
    name: 'thinking_progress',
    type: 'cognitive',
    priority: EventPriority.MEDIUM,
    effects: [
      {
        type: 'pulse',
        intensity: 0.7,
        duration: 0,
        delay: 0,
      },
      {
        type: 'trail',
        intensity: 0.6,
        duration: 0,
        delay: 0,
      },
    ],
    minDuration: 100,
    maxDuration: 0,
    inhibits: [],
    preempts: [],
    description: 'Thinking process progressing',
    tags: ['cognitive', 'continuous'],
  },

  thinking_peak: {
    name: 'thinking_peak',
    type: 'cognitive',
    priority: EventPriority.HIGH,
    effects: [
      {
        type: 'glow',
        intensity: 0.9,
        duration: 500,
        delay: 0,
      },
      {
        type: 'particle_burst',
        intensity: 0.8,
        duration: 300,
        delay: 0,
      },
      {
        type: 'energy_arc',
        intensity: 0.7,
        duration: 600,
        delay: 0,
      },
    ],
    minDuration: 300,
    maxDuration: 800,
    inhibits: [],
    preempts: [],
    description: 'Peak cognitive intensity',
    tags: ['cognitive', 'peak'],
  },

  thinking_end: {
    name: 'thinking_end',
    type: 'cognitive',
    priority: EventPriority.MEDIUM,
    effects: [
      {
        type: 'pulse',
        intensity: 0.3,
        duration: 500,
        delay: 0,
      },
      {
        type: 'ripple',
        intensity: 0.4,
        duration: 800,
        delay: 0,
      },
    ],
    minDuration: 500,
    maxDuration: 1000,
    inhibits: [],
    preempts: ['thinking_start', 'thinking_progress'],
    description: 'Thinking process complete',
    tags: ['cognitive', 'transition'],
  },

  processing: {
    name: 'processing',
    type: 'cognitive',
    priority: EventPriority.HIGH,
    effects: [
      {
        type: 'vortex',
        intensity: 0.8,
        duration: 0,
        delay: 0,
      },
      {
        type: 'orbital_shift',
        intensity: 0.7,
        duration: 0,
        delay: 0,
      },
      {
        type: 'glow',
        intensity: 0.7,
        duration: 0,
        delay: 0,
      },
    ],
    minDuration: 500,
    maxDuration: 0,
    inhibits: ['idle', 'listening'],
    preempts: ['thinking_start'],
    description: 'Intensive processing/computation',
    tags: ['cognitive', 'high-intensity'],
  },

  // ═══════════════════════════════════════════════════════════════
  // CONVERSATIONAL EVENTS
  // ═══════════════════════════════════════════════════════════════

  message_received: {
    name: 'message_received',
    type: 'conversational',
    priority: EventPriority.MEDIUM,
    effects: [
      {
        type: 'ripple',
        intensity: 0.5,
        duration: 600,
        delay: 0,
        color: '#44A5FF',
      },
      {
        type: 'pulse',
        intensity: 0.4,
        duration: 300,
        delay: 0,
      },
    ],
    minDuration: 300,
    maxDuration: 800,
    inhibits: [],
    preempts: [],
    description: 'User message received',
    tags: ['conversation', 'input'],
  },

  message_sent: {
    name: 'message_sent',
    type: 'conversational',
    priority: EventPriority.MEDIUM,
    effects: [
      {
        type: 'ripple',
        intensity: 0.5,
        duration: 600,
        delay: 0,
        color: '#4ECDC4',
      },
      {
        type: 'particle_burst',
        intensity: 0.4,
        duration: 500,
        delay: 0,
      },
    ],
    minDuration: 300,
    maxDuration: 800,
    inhibits: [],
    preempts: [],
    description: 'TITANE∞ message sent',
    tags: ['conversation', 'output'],
  },

  conversation_start: {
    name: 'conversation_start',
    type: 'conversational',
    priority: EventPriority.MEDIUM,
    effects: [
      {
        type: 'glow',
        intensity: 0.6,
        duration: 1000,
        delay: 0,
      },
      {
        type: 'orbital_shift',
        intensity: 0.5,
        duration: 1500,
        delay: 0,
      },
    ],
    minDuration: 800,
    maxDuration: 2000,
    inhibits: ['idle'],
    preempts: [],
    description: 'New conversation initiated',
    tags: ['conversation', 'start'],
  },

  conversation_end: {
    name: 'conversation_end',
    type: 'conversational',
    priority: EventPriority.LOW,
    effects: [
      {
        type: 'pulse',
        intensity: 0.3,
        duration: 1000,
        delay: 0,
      },
    ],
    minDuration: 800,
    maxDuration: 1500,
    inhibits: [],
    preempts: ['conversation_start'],
    description: 'Conversation concluded',
    tags: ['conversation', 'end'],
  },

  // ═══════════════════════════════════════════════════════════════
  // EMOTIONAL EVENTS
  // ═══════════════════════════════════════════════════════════════

  emotion_shift: {
    name: 'emotion_shift',
    type: 'emotional',
    priority: EventPriority.MEDIUM,
    effects: [
      {
        type: 'color_shift',
        intensity: 0.7,
        duration: 1500,
        delay: 0,
      },
      {
        type: 'glow',
        intensity: 0.5,
        duration: 1000,
        delay: 0,
      },
    ],
    minDuration: 1000,
    maxDuration: 2000,
    inhibits: [],
    preempts: [],
    description: 'Emotional tone transition',
    tags: ['emotional', 'transition'],
  },

  empathy_boost: {
    name: 'empathy_boost',
    type: 'emotional',
    priority: EventPriority.MEDIUM,
    effects: [
      {
        type: 'glow',
        intensity: 0.8,
        duration: 1200,
        delay: 0,
        color: '#FF6B9D',
      },
      {
        type: 'particle_burst',
        intensity: 0.6,
        duration: 800,
        delay: 0,
      },
    ],
    minDuration: 800,
    maxDuration: 1500,
    inhibits: [],
    preempts: [],
    description: 'Empathetic response triggered',
    tags: ['emotional', 'empathy'],
  },

  analytic_focus: {
    name: 'analytic_focus',
    type: 'emotional',
    priority: EventPriority.MEDIUM,
    effects: [
      {
        type: 'orbital_shift',
        intensity: 0.7,
        duration: 1000,
        delay: 0,
      },
      {
        type: 'color_shift',
        intensity: 0.5,
        duration: 800,
        delay: 0,
        color: '#4ECDC4',
      },
    ],
    minDuration: 800,
    maxDuration: 0,
    inhibits: [],
    preempts: [],
    description: 'Analytical mode activated',
    tags: ['emotional', 'analytical'],
  },

  // ═══════════════════════════════════════════════════════════════
  // SYSTEM EVENTS
  // ═══════════════════════════════════════════════════════════════

  load_increase: {
    name: 'load_increase',
    type: 'system',
    priority: EventPriority.LOW,
    effects: [
      {
        type: 'pulse',
        intensity: 0.6,
        duration: 0,
        delay: 0,
      },
      {
        type: 'trail',
        intensity: 0.4,
        duration: 0,
        delay: 0,
      },
    ],
    minDuration: 0,
    maxDuration: 0,
    inhibits: [],
    preempts: [],
    description: 'System load increasing',
    tags: ['system', 'performance'],
  },

  load_decrease: {
    name: 'load_decrease',
    type: 'system',
    priority: EventPriority.LOW,
    effects: [
      {
        type: 'pulse',
        intensity: 0.3,
        duration: 500,
        delay: 0,
      },
    ],
    minDuration: 300,
    maxDuration: 800,
    inhibits: [],
    preempts: ['load_increase'],
    description: 'System load decreasing',
    tags: ['system', 'performance'],
  },

  performance_drop: {
    name: 'performance_drop',
    type: 'system',
    priority: EventPriority.HIGH,
    effects: [
      {
        type: 'glitch',
        intensity: 0.3,
        duration: 200,
        delay: 0,
      },
    ],
    minDuration: 150,
    maxDuration: 400,
    inhibits: [],
    preempts: [],
    description: 'Performance degradation detected',
    tags: ['system', 'warning'],
  },

  performance_recover: {
    name: 'performance_recover',
    type: 'system',
    priority: EventPriority.MEDIUM,
    effects: [
      {
        type: 'ripple',
        intensity: 0.5,
        duration: 600,
        delay: 0,
      },
      {
        type: 'glow',
        intensity: 0.4,
        duration: 500,
        delay: 0,
      },
    ],
    minDuration: 500,
    maxDuration: 1000,
    inhibits: [],
    preempts: ['performance_drop'],
    description: 'Performance recovered',
    tags: ['system', 'recovery'],
  },

  // ═══════════════════════════════════════════════════════════════
  // PIPELINE OMEGA EVENTS
  // ═══════════════════════════════════════════════════════════════

  omega_step_start: {
    name: 'omega_step_start',
    type: 'pipeline',
    priority: EventPriority.MEDIUM,
    effects: [
      {
        type: 'pulse',
        intensity: 0.5,
        duration: 300,
        delay: 0,
      },
      {
        type: 'ripple',
        intensity: 0.4,
        duration: 500,
        delay: 0,
      },
    ],
    minDuration: 200,
    maxDuration: 600,
    inhibits: [],
    preempts: [],
    description: 'OMEGA pipeline step started',
    tags: ['pipeline', 'omega'],
  },

  omega_step_end: {
    name: 'omega_step_end',
    type: 'pipeline',
    priority: EventPriority.MEDIUM,
    effects: [
      {
        type: 'particle_burst',
        intensity: 0.4,
        duration: 400,
        delay: 0,
      },
    ],
    minDuration: 200,
    maxDuration: 500,
    inhibits: [],
    preempts: ['omega_step_start'],
    description: 'OMEGA pipeline step completed',
    tags: ['pipeline', 'omega'],
  },

  omega_error: {
    name: 'omega_error',
    type: 'pipeline',
    priority: EventPriority.CRITICAL,
    effects: [
      {
        type: 'glitch',
        intensity: 0.7,
        duration: 300,
        delay: 0,
      },
      {
        type: 'pulse',
        intensity: 0.5,
        duration: 500,
        delay: 0,
        color: '#FF4444',
      },
    ],
    minDuration: 400,
    maxDuration: 1000,
    inhibits: [],
    preempts: [],
    description: 'OMEGA pipeline error occurred',
    tags: ['pipeline', 'error', 'critical'],
  },

  omega_complete: {
    name: 'omega_complete',
    type: 'pipeline',
    priority: EventPriority.MEDIUM,
    effects: [
      {
        type: 'ripple',
        intensity: 0.7,
        duration: 800,
        delay: 0,
      },
      {
        type: 'glow',
        intensity: 0.6,
        duration: 1000,
        delay: 0,
      },
    ],
    minDuration: 800,
    maxDuration: 1500,
    inhibits: [],
    preempts: ['omega_step_start', 'omega_step_end'],
    description: 'OMEGA pipeline complete',
    tags: ['pipeline', 'complete'],
  },

  // ═══════════════════════════════════════════════════════════════
  // AUTO-HEALING EVENTS
  // ═══════════════════════════════════════════════════════════════

  healing_start: {
    name: 'healing_start',
    type: 'healing',
    priority: EventPriority.HIGH,
    effects: [
      {
        type: 'healing_wave',
        intensity: 0.7,
        duration: 0,
        delay: 0,
        color: '#FFD700',
      },
      {
        type: 'glow',
        intensity: 0.6,
        duration: 0,
        delay: 0,
        color: '#FFD700',
      },
    ],
    minDuration: 1000,
    maxDuration: 0,
    inhibits: [],
    preempts: [],
    description: 'Self-healing sequence initiated',
    tags: ['healing', 'self-repair'],
  },

  healing_wave: {
    name: 'healing_wave',
    type: 'healing',
    priority: EventPriority.HIGH,
    effects: [
      {
        type: 'healing_wave',
        intensity: 0.8,
        duration: 1500,
        delay: 0,
      },
      {
        type: 'ripple',
        intensity: 0.6,
        duration: 1200,
        delay: 0,
      },
    ],
    minDuration: 1000,
    maxDuration: 2000,
    inhibits: [],
    preempts: [],
    description: 'Healing wave propagating',
    tags: ['healing', 'wave'],
  },

  healing_complete: {
    name: 'healing_complete',
    type: 'healing',
    priority: EventPriority.MEDIUM,
    effects: [
      {
        type: 'particle_burst',
        intensity: 0.8,
        duration: 1000,
        delay: 0,
        color: '#FFD700',
      },
      {
        type: 'glow',
        intensity: 0.7,
        duration: 1500,
        delay: 0,
        color: '#FFD700',
      },
      {
        type: 'ripple',
        intensity: 0.6,
        duration: 1200,
        delay: 0,
      },
    ],
    minDuration: 1200,
    maxDuration: 2000,
    inhibits: [],
    preempts: ['healing_start', 'healing_wave'],
    description: 'Self-healing complete',
    tags: ['healing', 'complete'],
  },

  // ═══════════════════════════════════════════════════════════════
  // USER INTERACTION EVENTS
  // ═══════════════════════════════════════════════════════════════

  user_click: {
    name: 'user_click',
    type: 'user_interaction',
    priority: EventPriority.LOW,
    effects: [
      {
        type: 'ripple',
        intensity: 0.4,
        duration: 400,
        delay: 0,
      },
    ],
    minDuration: 200,
    maxDuration: 500,
    inhibits: [],
    preempts: [],
    description: 'User clicked',
    tags: ['interaction', 'click'],
  },

  user_hover: {
    name: 'user_hover',
    type: 'user_interaction',
    priority: EventPriority.AMBIENT,
    effects: [
      {
        type: 'glow',
        intensity: 0.2,
        duration: 0,
        delay: 0,
      },
    ],
    minDuration: 0,
    maxDuration: 0,
    inhibits: [],
    preempts: [],
    description: 'User hovering',
    tags: ['interaction', 'hover'],
  },

  // ═══════════════════════════════════════════════════════════════
  // NOTIFICATION EVENTS
  // ═══════════════════════════════════════════════════════════════

  notification: {
    name: 'notification',
    type: 'notification',
    priority: EventPriority.MEDIUM,
    effects: [
      {
        type: 'pulse',
        intensity: 0.6,
        duration: 600,
        delay: 0,
      },
      {
        type: 'ripple',
        intensity: 0.5,
        duration: 800,
        delay: 0,
      },
    ],
    minDuration: 500,
    maxDuration: 1000,
    inhibits: [],
    preempts: [],
    description: 'System notification',
    tags: ['notification', 'alert'],
  },

  // ═══════════════════════════════════════════════════════════════
  // IDLE STATE
  // ═══════════════════════════════════════════════════════════════

  idle: {
    name: 'idle',
    type: 'cognitive',
    priority: EventPriority.AMBIENT,
    effects: [
      {
        type: 'pulse',
        intensity: 0.3,
        duration: 0,
        delay: 0,
      },
    ],
    minDuration: 0,
    maxDuration: 0,
    inhibits: [],
    preempts: [],
    description: 'Idle state (ambient)',
    tags: ['idle', 'ambient'],
  },
};

// ═════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════

/**
 * Get event by name
 */
export function getEvent(name: string): VisualEvent | undefined {
  return VISUAL_EVENTS[name];
}

/**
 * Get all events of a given type
 */
export function getEventsByType(type: VisualEventType): VisualEvent[] {
  return Object.values(VISUAL_EVENTS).filter(event => event.type === type);
}

/**
 * Get all events with priority >= threshold
 */
export function getEventsByPriority(minPriority: EventPriority): VisualEvent[] {
  return Object.values(VISUAL_EVENTS).filter(event => event.priority >= minPriority);
}

/**
 * Check if event1 inhibits event2
 */
export function isInhibited(event1: string, event2: string): boolean {
  const e1 = VISUAL_EVENTS[event1];
  if (!e1) return false;
  return e1.inhibits.includes(event2);
}

/**
 * Check if event1 preempts event2
 */
export function preempts(event1: string, event2: string): boolean {
  const e1 = VISUAL_EVENTS[event1];
  if (!e1) return false;
  return e1.preempts.includes(event2);
}

/**
 * List all event names
 */
export function getAllEventNames(): string[] {
  return Object.keys(VISUAL_EVENTS);
}

export default VISUAL_EVENTS;
