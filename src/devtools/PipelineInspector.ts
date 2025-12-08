/**
 * TITANE∞ v20Ω — Pipeline Inspector
 * Reconstruction et analyse du pipeline
 */

export interface PipelineStage {
  name: string;
  startTime: number;
  endTime: number | null;
  duration: number;
  input: unknown;
  output: unknown | null;
  status: 'pending' | 'running' | 'completed' | 'error';
  error?: string;
}

export interface PipelineTrace {
  id: string;
  startTime: number;
  endTime: number | null;
  stages: PipelineStage[];
  totalDuration: number;
  success: boolean;
}

/**
 * Inspecteur de pipeline
 */
export class PipelineInspector {
  private traces: PipelineTrace[] = [];
  private currentTrace: PipelineTrace | null = null;
  private maxTraces = 20;

  /**
   * Démarre une nouvelle trace
   */
  startTrace(): string {
    const id = `trace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    this.currentTrace = {
      id,
      startTime: Date.now(),
      endTime: null,
      stages: [],
      totalDuration: 0,
      success: true,
    };

    return id;
  }

  /**
   * Enregistre un stage
   */
  record(stageName: string, data: unknown): void {
    if (!this.currentTrace) {
      this.startTrace();
    }

    const stage: PipelineStage = {
      name: stageName,
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      input: data,
      output: null,
      status: 'running',
    };

    this.currentTrace!.stages.push(stage);
  }

  /**
   * Termine un stage
   */
  completeStage(stageName: string, output: unknown): void {
    if (!this.currentTrace) return;

    const stage = this.currentTrace.stages.find(
      s => s.name === stageName && s.status === 'running'
    );

    if (stage) {
      stage.endTime = Date.now();
      stage.duration = stage.endTime - stage.startTime;
      stage.output = output;
      stage.status = 'completed';
    }
  }

  /**
   * Marque un stage en erreur
   */
  errorStage(stageName: string, error: string): void {
    if (!this.currentTrace) return;

    const stage = this.currentTrace.stages.find(
      s => s.name === stageName && s.status === 'running'
    );

    if (stage) {
      stage.endTime = Date.now();
      stage.duration = stage.endTime - stage.startTime;
      stage.status = 'error';
      stage.error = error;
      this.currentTrace.success = false;
    }
  }

  /**
   * Termine la trace actuelle
   */
  endTrace(): PipelineTrace | null {
    if (!this.currentTrace) return null;

    this.currentTrace.endTime = Date.now();
    this.currentTrace.totalDuration =
      this.currentTrace.endTime - this.currentTrace.startTime;

    // Fermer les stages en cours
    for (const stage of this.currentTrace.stages) {
      if (stage.status === 'running') {
        stage.endTime = Date.now();
        stage.duration = stage.endTime - stage.startTime;
        stage.status = 'completed';
      }
    }

    const trace = this.currentTrace;
    this.traces.push(trace);

    if (this.traces.length > this.maxTraces) {
      this.traces.shift();
    }

    this.currentTrace = null;
    return trace;
  }

  /**
   * Retourne la trace actuelle
   */
  getCurrentTrace(): PipelineTrace | null {
    return this.currentTrace;
  }

  /**
   * Retourne toutes les traces
   */
  getAllTraces(): PipelineTrace[] {
    return [...this.traces];
  }

  /**
   * Retourne la dernière trace complète
   */
  getLastTrace(): PipelineTrace | null {
    return this.traces.length > 0 ? this.traces[this.traces.length - 1] : null;
  }

  /**
   * Analyse des performances
   */
  analyze(): PipelineAnalysis {
    if (this.traces.length === 0) {
      return {
        averageDuration: 0,
        successRate: 1,
        slowestStage: null,
        bottlenecks: [],
      };
    }

    const durations = this.traces.map(t => t.totalDuration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const successRate =
      this.traces.filter(t => t.success).length / this.traces.length;

    // Trouver le stage le plus lent
    const stageDurations: Record<string, number[]> = {};
    for (const trace of this.traces) {
      for (const stage of trace.stages) {
        if (!stageDurations[stage.name]) {
          stageDurations[stage.name] = [];
        }
        stageDurations[stage.name].push(stage.duration);
      }
    }

    let slowestStage: string | null = null;
    let maxAvg = 0;
    const bottlenecks: string[] = [];

    for (const [name, durs] of Object.entries(stageDurations)) {
      const avg = durs.reduce((a, b) => a + b, 0) / durs.length;
      if (avg > maxAvg) {
        maxAvg = avg;
        slowestStage = name;
      }
      if (avg > 100) {
        bottlenecks.push(name);
      }
    }

    return {
      averageDuration: avgDuration,
      successRate,
      slowestStage,
      bottlenecks,
    };
  }

  /**
   * Efface tout
   */
  clear(): void {
    this.traces = [];
    this.currentTrace = null;
  }
}

export interface PipelineAnalysis {
  averageDuration: number;
  successRate: number;
  slowestStage: string | null;
  bottlenecks: string[];
}

export default PipelineInspector;
