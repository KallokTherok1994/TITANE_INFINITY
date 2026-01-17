interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp: number;
}

export class Analytics {
  private enabled: boolean = false;
  private events: AnalyticsEvent[] = [];

  enable() {
    this.enabled = true;
    console.log('📊 Analytics enabled');
  }

  disable() {
    this.enabled = false;
    this.events = [];
    console.log('📊 Analytics disabled');
  }

  track(name: string, properties?: Record<string, unknown>) {
    if (!this.enabled) return;

    this.events.push({
      name,
      properties,
      timestamp: Date.now(),
    });
  }

  async flush() {
    if (!this.enabled || this.events.length === 0) return;

    // Send events (implementation depends on analytics provider)
    console.log('Flushing events:', this.events.length);
    this.events = [];
  }
}

export const analytics = new Analytics();
