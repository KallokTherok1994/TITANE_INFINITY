/**
 * TITANE∞ v20Ω — Live Debugger
 * Système d'inspection dynamique
 */

export interface DebugBreakpoint {
  id: string;
  type: 'before_engine' | 'after_engine' | 'before_merge' | 'after_merge' | 'guardrails';
  enabled: boolean;
  hitCount: number;
  lastHit: number | null;
  condition?: string;
}

export interface DebugInspection {
  breakpointId: string;
  timestamp: number;
  data: unknown;
  stage: string;
}

/**
 * Debugger interactif
 */
export class Debugger {
  private breakpoints: Map<string, DebugBreakpoint> = new Map();
  private inspections: DebugInspection[] = [];
  private paused = false;
  private maxInspections = 50;

  /**
   * Définit un breakpoint
   */
  setBreakpoint(id: string, type: DebugBreakpoint['type'], condition?: string): void {
    this.breakpoints.set(id, {
      id,
      type,
      enabled: true,
      hitCount: 0,
      lastHit: null,
      condition,
    });
  }

  /**
   * Supprime un breakpoint
   */
  removeBreakpoint(id: string): void {
    this.breakpoints.delete(id);
  }

  /**
   * Active/désactive un breakpoint
   */
  toggleBreakpoint(id: string): boolean {
    const bp = this.breakpoints.get(id);
    if (bp) {
      bp.enabled = !bp.enabled;
      return bp.enabled;
    }
    return false;
  }

  /**
   * Vérifie si un breakpoint doit être déclenché
   */
  shouldBreak(type: DebugBreakpoint['type'], engineId?: string): boolean {
    if (this.paused) return false;

    for (const bp of this.breakpoints.values()) {
      if (!bp.enabled) continue;

      if (bp.type === type) {
        // Si c'est un breakpoint moteur, vérifier l'ID
        if (type === 'before_engine' || type === 'after_engine') {
          if (engineId && bp.id.includes(engineId)) {
            this.hitBreakpoint(bp.id);
            return true;
          }
        } else {
          this.hitBreakpoint(bp.id);
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Enregistre un hit de breakpoint
   */
  private hitBreakpoint(id: string): void {
    const bp = this.breakpoints.get(id);
    if (bp) {
      bp.hitCount++;
      bp.lastHit = Date.now();
    }
  }

  /**
   * Inspecte des données à un point donné
   */
  inspect(breakpointId: string, stage: string, data: unknown): void {
    this.inspections.push({
      breakpointId,
      timestamp: Date.now(),
      data: JSON.parse(JSON.stringify(data)), // Deep clone
      stage,
    });

    if (this.inspections.length > this.maxInspections) {
      this.inspections.shift();
    }
  }

  /**
   * Retourne la dernière inspection pour un breakpoint
   */
  getLastInspection(breakpointId: string): DebugInspection | null {
    for (let i = this.inspections.length - 1; i >= 0; i--) {
      if (this.inspections[i].breakpointId === breakpointId) {
        return this.inspections[i];
      }
    }
    return null;
  }

  /**
   * Liste tous les breakpoints
   */
  listBreakpoints(): DebugBreakpoint[] {
    return Array.from(this.breakpoints.values());
  }

  /**
   * Retourne toutes les inspections
   */
  getInspections(): DebugInspection[] {
    return [...this.inspections];
  }

  /**
   * Pause le debugger
   */
  pause(): void {
    this.paused = true;
  }

  /**
   * Resume le debugger
   */
  resume(): void {
    this.paused = false;
  }

  /**
   * État pause
   */
  isPaused(): boolean {
    return this.paused;
  }

  /**
   * Efface tout
   */
  clearAll(): void {
    this.breakpoints.clear();
    this.inspections = [];
    this.paused = false;
  }
}

export default Debugger;
