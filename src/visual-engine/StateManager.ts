/**
 * TITANE_INFINITY v19.3.0 — Visual State Manager
 * Manages visual state transitions with smooth 500ms interpolation
 *
 * Features:
 * - Smooth state transitions (500ms)
 * - State validation and constraints
 * - Event emission for state changes
 * - History tracking for debugging
 */

import EventEmitter from 'eventemitter3';
import type { VisualState, StateVisualConfig } from '@/design-system/visual-states';
import { visualStates, interpolateStates, canTransition } from '@/design-system/visual-states';

export interface StateTransition {
  from: VisualState;
  to: VisualState;
  startTime: number;
  duration: number;
  progress: number;
}

export interface StateHistoryEntry {
  state: VisualState;
  timestamp: number;
  duration: number;
}

export class StateManager extends EventEmitter {
  private currentState: VisualState = 'idle';
  private targetState: VisualState = 'idle';
  private transitionState: StateTransition | null = null;
  private stateHistory: StateHistoryEntry[] = [];
  private maxHistoryLength = 100;
  private animationFrameId: number | null = null;

  constructor(initialState: VisualState = 'idle') {
    super();
    this.currentState = initialState;
    this.targetState = initialState;
    this.addToHistory(initialState);
  }

  /**
   * Get current visual state
   */
  getCurrentState(): VisualState {
    return this.currentState;
  }

  /**
   * Get current visual configuration
   * Returns interpolated config if in transition
   */
  getCurrentVisuals(): StateVisualConfig {
    if (this.transitionState) {
      return interpolateStates(
        this.transitionState.from,
        this.transitionState.to,
        this.transitionState.progress
      );
    }
    return visualStates[this.currentState];
  }

  /**
   * Transition to a new state
   * @param newState - Target state
   * @param duration - Transition duration in ms (default: 500ms)
   * @param force - Force transition even if not normally allowed
   */
  setState(newState: VisualState, duration = 500, force = false): void {
    // Prevent unnecessary transitions
    if (newState === this.targetState && !this.transitionState) {
      return;
    }

    // Check if transition is allowed
    if (!force && !canTransition(this.currentState, newState)) {
      console.warn(
        `Transition from ${this.currentState} to ${newState} is not allowed. Use force=true to override.`
      );
      return;
    }

    // Cancel any ongoing transition
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Set up new transition
    this.targetState = newState;
    this.transitionState = {
      from: this.currentState,
      to: newState,
      startTime: performance.now(),
      duration,
      progress: 0,
    };

    // Emit transition start event
    this.emit('transitionStart', {
      from: this.currentState,
      to: newState,
      duration,
    });

    // Start transition animation
    this.animateTransition();
  }

  /**
   * Animate state transition using RAF
   */
  private animateTransition(): void {
    if (!this.transitionState) {
      return;
    }

    const now = performance.now();
    const elapsed = now - this.transitionState.startTime;
    const progress = Math.min(elapsed / this.transitionState.duration, 1);

    // Update progress with easing
    this.transitionState.progress = this.easeInOutCubic(progress);

    // Emit progress event
    this.emit('transitionProgress', {
      from: this.transitionState.from,
      to: this.transitionState.to,
      progress: this.transitionState.progress,
    });

    // Check if transition is complete
    if (progress >= 1) {
      this.completeTransition();
    } else {
      this.animationFrameId = requestAnimationFrame(() => this.animateTransition());
    }
  }

  /**
   * Complete the current transition
   */
  private completeTransition(): void {
    if (!this.transitionState) {
      return;
    }

    const from = this.currentState;
    const to = this.transitionState.to;

    // Update current state
    this.currentState = to;
    this.transitionState = null;
    this.animationFrameId = null;

    // Add to history
    this.addToHistory(to);

    // Emit completion event
    this.emit('transitionComplete', {
      from,
      to,
    });

    this.emit('stateChange', to);
  }

  /**
   * Immediately set state without transition
   */
  setStateImmediate(newState: VisualState): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const from = this.currentState;
    this.currentState = newState;
    this.targetState = newState;
    this.transitionState = null;

    this.addToHistory(newState);
    this.emit('stateChange', newState);
    this.emit('transitionComplete', { from, to: newState });
  }

  /**
   * Get current transition progress (0-1)
   */
  getTransitionProgress(): number {
    return this.transitionState?.progress ?? 1;
  }

  /**
   * Check if currently transitioning
   */
  isTransitioning(): boolean {
    return this.transitionState !== null;
  }

  /**
   * Get state history
   */
  getHistory(): StateHistoryEntry[] {
    return [...this.stateHistory];
  }

  /**
   * Clear state history
   */
  clearHistory(): void {
    this.stateHistory = [];
  }

  /**
   * Add state to history
   */
  private addToHistory(state: VisualState): void {
    const now = Date.now();
    const lastEntry = this.stateHistory[this.stateHistory.length - 1];
    const duration = lastEntry ? now - lastEntry.timestamp : 0;

    // Update duration of previous entry
    if (lastEntry) {
      lastEntry.duration = duration;
    }

    // Add new entry
    this.stateHistory.push({
      state,
      timestamp: now,
      duration: 0,
    });

    // Trim history if too long
    if (this.stateHistory.length > this.maxHistoryLength) {
      this.stateHistory.shift();
    }
  }

  /**
   * Easing function for smooth transitions
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.removeAllListeners();
    this.stateHistory = [];
  }

  /**
   * Get statistics about state usage
   */
  getStats(): {
    currentState: VisualState;
    totalTransitions: number;
    averageDuration: number;
    stateDistribution: Record<VisualState, number>;
  } {
    const stateDistribution: Record<string, number> = {};
    let totalDuration = 0;

    for (const entry of this.stateHistory) {
      stateDistribution[entry.state] = (stateDistribution[entry.state] || 0) + 1;
      totalDuration += entry.duration;
    }

    return {
      currentState: this.currentState,
      totalTransitions: this.stateHistory.length,
      averageDuration: totalDuration / this.stateHistory.length || 0,
      stateDistribution: stateDistribution as Record<VisualState, number>,
    };
  }
}

export default StateManager;
