// Mock for Node.js events module in browser environment
type Listener = (...args: unknown[]) => void;

class EventEmitter {
  private listeners: { [event: string]: Listener[] } = {};

  on(event: string, listener: Listener): this {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
    return this;
  }

  addListener(event: string, listener: Listener): this {
    return this.on(event, listener);
  }

  emit(event: string, ...args: unknown[]): boolean {
    const listeners = this.listeners[event];
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.warn('Event listener error:', error);
        }
      });
      return true;
    }
    return false;
  }

  off(event: string, listener: Listener): this {
    const listeners = this.listeners[event];
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
    return this;
  }

  removeListener(event: string, listener: Listener): this {
    return this.off(event, listener);
  }

  removeAllListeners(event?: string): this {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
    return this;
  }

  getListeners(event: string): Listener[] {
    return this.listeners[event] || [];
  }

  listenerCount(event: string): number {
    return (this.listeners[event] || []).length;
  }
}

export { EventEmitter };
export default { EventEmitter };
