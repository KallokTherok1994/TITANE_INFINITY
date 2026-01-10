import { vi } from 'vitest';

export const invoke = vi.fn();

// Minimal stubs required by @tauri-apps/plugin-fs (and other plugins)
// which import these from '@tauri-apps/api/core'.
export class Resource {
  constructor(public rid?: number) {}
}

export class Channel<T = unknown> {
  private listeners = new Set<(payload: T) => void>();

  onmessage(listener: (payload: T) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(payload: T) {
    for (const listener of this.listeners) {
      listener(payload);
    }
  }
}

export default {
  invoke,
  Resource,
  Channel,
};
