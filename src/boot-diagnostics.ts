/**
 * TITANE∞ v26.3.0 - Boot Diagnostics
 *
 * Detects and logs what's happening during application startup
 * to help diagnose unexpected shutdowns
 */

interface BootEvent {
  timestamp: number;
  stage: string;
  message: string;
  level: 'info' | 'warn' | 'error';
  data?: unknown;
}

class BootDiagnostics {
  private events: BootEvent[] = [];
  private startTime = Date.now();
  private lastStage = '';

  log(stage: string, message: string, data?: unknown) {
    const event: BootEvent = {
      timestamp: Date.now(),
      stage,
      message,
      level: 'info',
      data,
    };
    this.events.push(event);
    this.lastStage = stage;
    console.log(`[BOOT-${stage}] ${message}`, data ?? '');
  }

  warn(stage: string, message: string, data?: unknown) {
    const event: BootEvent = {
      timestamp: Date.now(),
      stage,
      message,
      level: 'warn',
      data,
    };
    this.events.push(event);
    console.warn(`[BOOT-${stage}] ⚠️  ${message}`, data ?? '');
  }

  error(stage: string, message: string, error?: unknown) {
    const event: BootEvent = {
      timestamp: Date.now(),
      stage,
      message,
      level: 'error',
      data: error instanceof Error ? error.message : String(error),
    };
    this.events.push(event);
    console.error(`[BOOT-${stage}] ❌ ${message}`, error);
  }

  getReport() {
    const uptime = Date.now() - this.startTime;
    return {
      startTime: this.startTime,
      uptime,
      lastStage: this.lastStage,
      totalEvents: this.events.length,
      events: this.events.map(e => ({
        ...e,
        relativeTime: e.timestamp - this.startTime,
      })),
      errors: this.events.filter(e => e.level === 'error'),
      warnings: this.events.filter(e => e.level === 'warn'),
    };
  }

  exportToLocalStorage() {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
      localStorage.setItem('titane_boot_diagnostics', JSON.stringify(this.getReport()));
    } catch (err) {
      console.warn('[BOOT-DIAG] Failed to export to localStorage:', err);
    }
  }
}

export const bootDiagnostics = new BootDiagnostics();

// Initialize boot diagnostics in global scope
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__TITANE_BOOT_DIAG__ = bootDiagnostics;
}
