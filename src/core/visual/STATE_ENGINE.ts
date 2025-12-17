/**
 * TITANE∞ PHASE 1 (OPTION B) - Stub pour STATE_ENGINE
 */

export type SystemState =
  | 'idle'
  | 'active'
  | 'focus'
  | 'flow'
  | 'processing'
  | 'error'
  | 'warning'
  | 'danger'
  | 'stable'
  | 'offline';

export interface StateConfig {
  colors: Record<SystemState, string>;
  transitions: Record<SystemState, number>;
}

const defaultConfig: StateConfig = {
  colors: {
    idle: '#808080',
    active: '#00ff00',
    focus: '#0088ff',
    flow: '#ff00ff',
    processing: '#ffff00',
    error: '#ff0000',
    warning: '#ff8800',
    danger: '#ff0000',
    stable: '#10b981',
    offline: '#444444',
  },
  transitions: {
    idle: 300,
    active: 200,
    focus: 250,
    flow: 400,
    processing: 150,
    error: 100,
    warning: 150,
    danger: 100,
    stable: 300,
    offline: 500,
  },
};

let currentState: SystemState = 'idle';
const subscribers: ((state: SystemState, config: StateConfig) => void)[] = [];

export const stateEngine = {
  getState: (): SystemState => currentState,
  getCurrentState: (): SystemState => currentState,
  setState: (state: SystemState) => {
    currentState = state;
    subscribers.forEach(cb => cb(currentState, defaultConfig));
  },
  subscribe: (callback: (state: SystemState) => void) => {
    subscribers.push(state => callback(state));
    return () => {
      const idx = subscribers.findIndex(cb => cb === callback);
      if (idx > -1) subscribers.splice(idx, 1);
    };
  },
  onStateChange: (callback: (state: SystemState, config: StateConfig) => void) => {
    subscribers.push(callback);
    return () => {
      const idx = subscribers.indexOf(callback);
      if (idx > -1) subscribers.splice(idx, 1);
    };
  },
  getStateConfig: (
    state: SystemState
  ): {
    color: string;
    transition: number;
    intensity: number;
    blur: number;
    opacity: number;
    colorRgb: string;
  } => ({
    color: defaultConfig.colors[state] || defaultConfig.colors.idle,
    transition: defaultConfig.transitions[state] || defaultConfig.transitions.idle,
    intensity: 1.0,
    blur: 0,
    opacity: 1.0,
    colorRgb: '255, 255, 255',
  }),
  determineStateFromMetrics: (_metrics: Record<string, number>): SystemState => {
    // Stub - returns current state
    return currentState;
  },
  reset: () => {
    currentState = 'idle';
    subscribers.forEach(cb => cb(currentState, defaultConfig));
  },
};

export default stateEngine;
