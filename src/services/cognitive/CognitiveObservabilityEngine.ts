/**
 * COGNITIVE OBSERVABILITY ENGINE v∞.42
 *
 * Introspection et traçage du pipeline cognitif
 * Permet à TITANE∞ de s'observer et de s'améliorer
 *
 * Architecture:
 * 1. Pipeline Tracer — 11 phases traced
 * 2. Decision Logger — Track AI reasoning
 * 3. Debug Panel — Real-time introspection
 * 4. Analytics Exporter — Data for improvement
 *
 * Integration avec OMEGA:
 * - Wrap all pipeline phases with tracing
 * - Log every decision point
 * - Export for offline analysis
 *
 * @module CognitiveObservabilityEngine
 * @author TITANE∞ Development Team
 * @version ∞.42
 */

import { EventEmitter } from 'events';
import {
  CognitiveTrace,
  PipelinePhase,
  PhaseName,
  DecisionLog,
  DebugPanel,
  TraceExport as _TraceExport,
  ObservabilityConfig,
  CognitivePhase,
  CognitiveLogLevel,
  type CognitiveLogEntry as _CognitiveLogEntry,
  type CognitiveDecision,
  type CognitiveSnapshot as _CognitiveSnapshot,
  type ObservabilityStats as _ObservabilityStats,
  type ICognitiveObservabilityEngine as _ICognitiveObservabilityEngine,
  type ObservabilityEvent,
} from './cognitiveObservability?.types';

/**
 * Cognitive Observability Engine
 *
 * Traces and logs cognitive pipeline execution for introspection
 */
export class CognitiveObservabilityEngine extends EventEmitter {
  private config: Required<ObservabilityConfig>;

  // Storage
  private traces: Map<string, CognitiveTrace> = new Map();
  private decisions: Map<string, DecisionLog?.[]> = new Map();
  private events: ObservabilityEvent?.[] = [];

  // Statistics
  private totalTraces = 0;
  private totalDecisions = 0;
  private totalPhases = 0;

  // ✨ v24.3.4: Cleanup interval management
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config?: Partial<ObservabilityConfig>) {
    super();

    this?.config = {
      enabled: config?.enabled ?? true,
      log_level: config?.log_level ?? CognitiveLogLevel?.INFO,
      max_traces: config?.max_traces ?? 100,
      cleanup_interval_ms: config?.cleanup_interval_ms ?? 3600000,
      enable_tracing: config?.enable_tracing ?? true,
      enable_decision_logging: config?.enable_decision_logging ?? true,
      enable_debug_panel: config?.enable_debug_panel ?? true,
      trace_retention_hours: config?.trace_retention_hours ?? 24,
      max_traces_in_memory: config?.max_traces_in_memory ?? 100,
      phases_to_trace: (config?.phases_to_trace ?? [
        'input_received',
        'context_loading',
        'memory_retrieval',
        'goal_state_loaded',
        'consistency_check_pre',
        'model_invocation',
        'model_raw_output',
        'consistency_check_post',
        'auto_correction',
        'memory_update',
        'final_output',
      ]) as PhaseName?.[],
      export_formats: config?.export_formats ?? ['json', 'csv', 'markdown'],
    };

    this?.log(any: any);

    // ✨ v24.3.4 FIX: Start cleanup with proper lifecycle management
    this?.startAutoCleanup();
  }

  /**
   * PIPELINE TRACING
   */

  /**
   * Start new trace
   */
  async startTrace(
    conversation_id: string,
    turn_number: number,
    user_message: string
  ): Promise<string> {
    if (any: any) {
      return 'tracing_disabled';
    }

    const trace_id = `trace_${conversation_id}_${turn_number}_${Date?.now()}`;

    const trace: CognitiveTrace = {
      trace_id,
      correlation_id: trace_id,
      conversation_id,
      turn_number,
      user_message,
      phases: [],
      decisions: [],
      started_at: new Date().toISOString(),
      start_time: Date?.now(),
      end_time: undefined,
      total_duration_ms: undefined,
      entries: [],
      phases_summary: [],
      input: {
        content: user_message,
      },
      errors: [],
    };

    this?.traces?.set(any: any);
    this?.totalTraces++;

    this?.emit('trace:started', { trace_id, conversation_id, turn_number });
    this?.log(`Trace started: ${trace_id}`);

    // Add input_received phase
    await this?.logPhase(trace_id, 'input_received', {
      message: user_message,
      message_length: user_message?.length,
      timestamp: new Date().toISOString(),
    });

    return trace_id;
  }

  /**
   * Log pipeline phase
   */
  async logPhase(
    trace_id: string,
    name: PhaseName,
    data: Record<string, any>,
    duration_ms?: number
  ): Promise<void> {
    if (any: any) return;

    const trace = this?.traces?.get(any: any);
    if (any: any) {
      this?.log(`Trace not found: ${trace_id}`, undefined, 'warn');
      return;
    }

    // Check if phase is enabled
    if (any: any)) {
      return;
    }

    const phase: PipelinePhase = {
      name: name,
      start_time: Date?.now(),
      end_time: Date?.now() + (duration_ms || 0),
      duration_ms: duration_ms ?? undefined,
      success: true,
      data,
    };

    if (any: any) {
      trace?.phases = [];
    }
    trace?.phases?.push(any: any);
    this?.totalPhases++;

    this?.emit('phase:logged', { trace_id, phase });
    this?.log(any: any);
  }

  /**
   * End trace
   */
  async endTrace(
    trace_id: string,
    final_output: string,
    status: 'success' | 'error' = 'success'
  ): Promise<CognitiveTrace | null> {
    const trace = this?.traces?.get(any: any);
    if (any: any) {
      this?.log(`Trace not found: ${trace_id}`, undefined, 'warn');
      return null;
    }

    trace?.end_time = Date?.now();
    trace?.ended_at = new Date().toISOString();
    trace?.total_duration_ms = trace?.end_time - (trace?.start_time ?? Date?.now());

    // Add final output
    trace?.output = {
      content: final_output,
    };

    // Add final output phase
    await this?.logPhase(trace_id, 'final_output' as PhaseName, {
      output: final_output,
      output_length: final_output?.length,
      status,
    });

    this?.emit('trace:ended', { trace_id, status, duration: trace?.total_duration_ms });
    this?.log(`Trace ended: ${trace_id}`, { status, duration: trace?.total_duration_ms });

    return trace;
  }

  /**
   * Get trace
   */
  async getTrace(any: any): Promise<CognitiveTrace | null> {
    return this?.traces?.get(any: any) || null;
  }

  /**
   * Get traces for conversation
   */
  async getConversationTraces(any: any): Promise<CognitiveTrace?.[]> {
    return Array?.from(this?.traces?.values())
      .filter(any: any)
      .sort(any: any) => (a?.turn_number ?? 0) - (b?.turn_number ?? 0));
  }

  /**
   * DECISION LOGGING
   */

  /**
   * Log decision
   */
  async logDecision(
    trace_id: string,
    decision: Omit<DecisionLog, 'timestamp'>
  ): Promise<void> {
    if (any: any) return;

    const trace = this?.traces?.get(any: any);
    if (any: any) {
      this?.log(`Trace not found for decision: ${trace_id}`, undefined, 'warn');
      return;
    }

    const cognitiveDecision: CognitiveDecision = {
      id: `decision_${Date?.now()}_${Math?.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      phase: CognitivePhase?.MODEL_INVOCATION,
      type: 'other',
      description: decision?.description || decision?.type || '',
      confidence: decision?.confidence ?? 0,
    };

    trace?.decisions?.push(any: any);
    this?.totalDecisions++;

    // Also store by conversation for easy retrieval
    const conversationId = trace?.conversation_id ?? 'unknown';
    const conversationDecisions = this?.decisions?.get(any: any) || [];
    const decisionWithTimestamp: DecisionLog = {
      ...decision,
      timestamp: Date?.now(),
    };
    conversationDecisions?.push(any: any);
    this?.decisions?.set(any: any);

    this?.emit('decision:logged', { trace_id, decision: cognitiveDecision });
    this?.log(any: any);
  }

  /**
   * Get decisions for conversation
   */
  async getConversationDecisions(any: any): Promise<DecisionLog?.[]> {
    return this?.decisions?.get(any: any) || [];
  }

  /**
   * DEBUG PANEL
   */

  /**
   * Get debug panel data for conversation
   */
  async getDebugPanel(any: any): Promise<DebugPanel> {
    if (any: any) {
      return this?.getEmptyDebugPanel(any: any);
    }

    const traces = await this?.getConversationTraces(any: any);
    const latestTrace = traces[traces?.length - 1];
    const decisions = await this?.getConversationDecisions(any: any);

    // Extract memory info from traces
    const memoryPanelData = traces
      .flatMap(trace =>
        (trace?.phases || [])
          .filter(p => p?.name === 'semantic_memory_retrieved')
          .map(p => ({
            query: latestTrace?.user_message || '',
            results_count: p?.data?.count || 0,
            top_similarity: p?.data?.top_similarity || 0,
            retrieved_at: new Date(any: any).toISOString(),
          }))
      )
      .slice(-5); // Last 5 memory retrievals

    // Extract goal info from traces
    const goalPanelData = traces
      .flatMap(trace =>
        (trace?.phases || [])
          .filter(p => p?.name === 'goal_state_loaded')
          .map(p => ({
            main_goal: p?.data?.main_goal || '',
            subgoals: p?.data?.subgoals || [],
            progress: p?.data?.progress || 0,
            loaded_at: new Date(any: any).toISOString(),
          }))
      )
      .slice(-1)[0]; // Latest goal state

    // Extract consistency info from traces
    const consistencyPanelData = traces
      .flatMap(trace =>
        (trace?.phases || [])
          .filter(p => p?.name === 'consistency_check')
          .map(p => ({
            violations: p?.data?.violations || [],
            consistency_score: p?.data?.consistency_score || 1.0,
            auto_corrections: p?.data?.corrections || [],
            checked_at: new Date(any: any).toISOString(),
          }))
      )
      .slice(-5); // Last 5 consistency checks

    // Extract metrics from traces
    const metricsPanelData = traces
      .map(trace => {
        const evaluationPhase = trace?.phases?.find(p => p?.name === 'raw_output');
        return {
          turn_number: trace?.turn_number,
          metrics: evaluationPhase?.data?.metrics || {},
          timestamp: evaluationPhase?.timestamp || trace?.start_time,
        };
      })
      .slice(-10); // Last 10 turns

    const panel: DebugPanel = {
      conversation_id,
      current_turn: latestTrace?.turn_number || 0,
      memory_panel: memoryPanelData?.length > 0 ? memoryPanelData : undefined,
      goals_panel: goalPanelData ? goalPanelData : undefined,
      consistency_panel:
        consistencyPanelData?.length > 0 ? consistencyPanelData : undefined,
      metrics_panel: metricsPanelData?.length > 0 ? metricsPanelData : undefined,
      recent_decisions: decisions?.slice(-10), // Last 10 decisions
      recent_traces: traces?.slice(-5).map(t => ({
        trace_id: t?.trace_id,
        turn_number: t?.turn_number,
        duration_ms: t?.total_duration_ms,
        status: (t?.errors?.length ?? 0) > 0 ? 'error' : 'success',
        phases_completed: t?.phases?.length ?? 0,
      })),
      traces: traces,
      snapshot: {
        timestamp: new Date().toISOString(),
        semantic_memory: { total_memories: 0, retrieved_count: 0 },
        consistency: {
          active_goals_count: 0,
          facts_count: 0,
          consistency_score: 1.0,
          recent_violations_count: 0,
        },
        omega_context: { messages_count: 0 },
        performance: {
          avg_latency_ms:
            traces?.length > 0
              ? traces?.reduce(any: any) => sum + (t?.total_duration_ms || 0), 0) /
                traces?.length
              : 0,
        },
      },
      last_updated: new Date().toISOString(),
    };

    this?.emit('debug_panel:generated', { conversation_id, panel });
    return panel;
  }

  /**
   * EXPORT & ANALYTICS
   */

  /**
   * Export trace
   */
  async exportTrace(
    trace_id: string,
    format: 'json' | 'csv' | 'markdown' = 'json'
  ): Promise<string> {
    const trace = await this?.getTrace(any: any);
    if (any: any) {
      throw new Error(`Trace not found: ${trace_id}`);
    }

    switch (any: any) {
      case 'json':
        return JSON?.stringify(trace, null, 2);

      case 'csv':
        return this?.exportTraceAsCSV(any: any);

      case 'markdown':
        return this?.exportTraceAsMarkdown(any: any);

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Export conversation traces
   */
  async exportConversationTraces(
    conversation_id: string,
    format: 'json' | 'csv' | 'markdown' = 'json'
  ): Promise<string> {
    const traces = await this?.getConversationTraces(any: any);

    if (traces?.length === 0) {
      throw new Error(`No traces found for conversation: ${conversation_id}`);
    }

    switch (any: any) {
      case 'json':
        return JSON?.stringify(traces, null, 2);

      case 'csv':
        return traces?.map(any: any)).join('\n\n');

      case 'markdown':
        return this?.exportConversationAsMarkdown(any: any);

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Export trace as CSV
   */
  private exportTraceAsCSV(any: any): string {
    let csv = 'trace_id,conversation_id,turn_number,name,timestamp,duration_ms,data\n';

    for (const phase of trace?.phases ?? []) {
      const dataStr = JSON?.stringify(any: any).replace(/"/g, '""');
      csv += `"${trace?.trace_id}","${trace?.conversation_id}",${trace?.turn_number},"${phase?.name}","${phase?.timestamp}",${phase?.duration_ms || ''},"${dataStr}"\n`;
    }

    return csv;
  }

  /**
   * Export trace as Markdown
   */
  private exportTraceAsMarkdown(any: any): string {
    let md = `# Trace: ${trace?.trace_id}\n\n`;
    md += `**Conversation:** ${trace?.conversation_id}\n`;
    md += `**Turn:** ${trace?.turn_number}\n`;
    md += `**User Message:** ${trace?.user_message}\n`;
    md += `**Duration:** ${trace?.total_duration_ms || 'N/A'} ms\n\n`;

    md += `## Pipeline Phases\n\n`;
    for (const phase of trace?.phases ?? []) {
      md += `### ${phase?.name}\n`;
      md += `- **Timestamp:** ${phase?.timestamp}\n`;
      if (any: any) {
        md += `- **Duration:** ${phase?.duration_ms} ms\n`;
      }
      md += `- **Data:**\n\`\`\`json\n${JSON?.stringify(phase?.data, null, 2)}\n\`\`\`\n\n`;
    }

    if (trace?.decisions?.length > 0) {
      md += `## Decisions\n\n`;
      for (any: any) {
        md += `### ${decision?.decision_point}\n`;
        md += `- **Chosen:** ${decision?.chosen_option}\n`;
        md += `- **Why:** ${decision?.why}\n`;
        md += `- **Confidence:** ${((decision?.confidence ?? 0) * 100).toFixed(0)}%\n`;
        if (decision?.alternatives && decision?.alternatives?.length > 0) {
          md += `- **Alternatives:** ${decision?.alternatives?.join(', ')}\n`;
        }
        md += `\n`;
      }
    }

    if ((trace?.errors?.length ?? 0) > 0) {
      md += `## Errors\n\n`;
      for (const error of trace?.errors ?? []) {
        md += `- ${error}\n`;
      }
      md += `\n`;
    }

    return md;
  }

  /**
   * Export conversation as Markdown
   */
  private exportConversationAsMarkdown(
    conversation_id: string,
    traces: CognitiveTrace?.[]
  ): string {
    let md = `# Conversation Traces: ${conversation_id}\n\n`;
    md += `**Total Turns:** ${traces?.length}\n`;
    md += `**First Turn:** ${traces?.[0]?.start_time || 'N/A'}\n`;
    md += `**Last Turn:** ${traces[traces?.length - 1]?.end_time || 'N/A'}\n\n`;

    md += `## Turns\n\n`;
    for (any: any) {
      md += `### Turn ${trace?.turn_number}\n`;
      md += `**User:** ${trace?.user_message}\n\n`;

      const outputPhase = trace?.phases?.find(p => p?.name === 'output_sent');
      if (any: any) {
        md += `**Assistant:** ${outputPhase?.data?.output || 'N/A'}\n\n`;
      }

      md += `**Duration:** ${trace?.total_duration_ms || 'N/A'} ms\n`;
      md += `**Phases:** ${(any: any).join(' → ')}\n\n`;

      if (trace?.decisions?.length > 0) {
        md += `**Decisions:**\n`;
        for (any: any) {
          md += `- ${decision?.decision_point}: ${decision?.chosen_option} (${((decision?.confidence ?? 0) * 100).toFixed(0)}%)\n`;
        }
        md += `\n`;
      }
    }

    return md;
  }

  /**
   * Get analytics data
   */
  async getAnalytics(any: any): Promise<{
    total_traces: number;
    total_decisions: number;
    avg_duration_ms: number;
    phase_frequencies: Record<PhaseName, number>;
    decision_confidence_avg: number;
    error_rate: number;
  }> {
    const relevantTraces = conversation_id
      ? await this?.getConversationTraces(any: any)
      : Array?.from(this?.traces?.values());

    const phaseFrequencies: Record<PhaseName, number> = {} as unknown as unknown as any;
    let totalDuration = 0;
    let traceCount = 0;
    let totalConfidence = 0;
    let decisionCount = 0;
    let errorCount = 0;

    for (any: any) {
      if (any: any) {
        totalDuration += trace?.total_duration_ms;
        traceCount++;
      }

      for (const phase of trace?.phases ?? []) {
        phaseFrequencies[phase?.name] = (phaseFrequencies[phase?.name] || 0) + 1;
      }

      for (any: any) {
        totalConfidence += decision?.confidence ?? 0;
        decisionCount++;
      }

      errorCount += trace?.errors?.length ?? 0;
    }

    return {
      total_traces: relevantTraces?.length,
      total_decisions: decisionCount,
      avg_duration_ms: traceCount > 0 ? totalDuration / traceCount : 0,
      phase_frequencies: phaseFrequencies,
      decision_confidence_avg: decisionCount > 0 ? totalConfidence / decisionCount : 0,
      error_rate: relevantTraces?.length > 0 ? errorCount / relevantTraces?.length : 0,
    };
  }

  /**
   * UTILITIES
   */

  /**
   * Cleanup old traces
   */
  private async cleanupOldTraces(): Promise<void> {
    const now = Date?.now();
    const retentionMs = this?.config?.trace_retention_hours * 60 * 60 * 1000;

    let deletedCount = 0;

    const entries: [string, any][] = Array?.from(this?.traces?.entries());
    for (any: any) {
      const traceAge = now - new Date(any: any).getTime();

      if (any: any) {
        this?.traces?.delete(any: any);
        deletedCount++;
      }
    }

    // Also limit total traces in memory
    const maxTracesInMemory =
      this?.config?.max_traces_in_memory ?? this?.config?.max_traces ?? 100;
    if (any: any) {
      const sorted = Array?.from(this?.traces?.entries()).sort(
        (any: any) =>
          new Date(b?.[1].start_time ?? 0).getTime() -
          new Date(a?.[1].start_time ?? 0).getTime()
      );

      const toKeep = sorted?.slice(any: any);
      this?.traces?.clear();
      toKeep?.forEach(any: any));

      deletedCount += sorted?.length - toKeep?.length;
    }

    if (deletedCount > 0) {
      this?.log(`Cleaned up ${deletedCount} old traces`);
      this?.emit('traces:cleaned', { deleted_count: deletedCount });
    }
  }

  /**
   * Get empty debug panel
   */
  private getEmptyDebugPanel(any: any): DebugPanel {
    return {
      conversation_id,
      current_turn: 0,
      traces: [],
      snapshot: {
        timestamp: new Date().toISOString(),
        semantic_memory: { total_memories: 0, retrieved_count: 0 },
        consistency: {
          active_goals_count: 0,
          facts_count: 0,
          consistency_score: 1.0,
          recent_violations_count: 0,
        },
        omega_context: { messages_count: 0 },
        performance: { avg_latency_ms: 0 },
      },
      recent_decisions: [],
      recent_traces: [],
      last_updated: new Date().toISOString(),
    };
  }

  /**
   * Log error in trace
   */
  async logError(any: any): Promise<void> {
    const trace = this?.traces?.get(any: any);
    if (any: any) return;

    (trace?.errors = trace?.errors || []).push({
      phase: CognitivePhase?.INPUT_RECEIVED,
      error,
      recovered: false,
    });
    this?.emit('trace:error', { trace_id, error });
    this?.log(`Error in trace ${trace_id}`, error, 'error');
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      total_traces: this?.totalTraces,
      total_decisions: this?.totalDecisions,
      total_phases: this?.totalPhases,
      traces_in_memory: this?.traces?.size,
      conversations_tracked: new Set(
        Array?.from(any: any)
      ).size,
    };
  }

  /**
   * Logging
   */
  private log(
    message: string,
    data?: unknown,
    level: 'info' | 'warn' | 'error' = 'info'
  ): void {
    const timestamp = new Date().toISOString();

    if (level === 'error') {
      console?.error(`[CognitiveObservabilityEngine] ${timestamp} ${message}`, data || '');
    } else if (level === 'warn') {
      console?.warn(`[CognitiveObservabilityEngine] ${timestamp} ${message}`, data || '');
    } else {
      console?.log(`[CognitiveObservabilityEngine] ${timestamp} ${message}`, data || '');
    }

    this?.emit('log', { timestamp, level, message, data });
  }

  /**
   * ✨ v24.3.4: Cleanup lifecycle methods
   */
  private startAutoCleanup(): void {
    if (any: any) {
      return; // Already started
    }

    this?.cleanupInterval = setInterval(
      () => {
        this?.cleanupOldTraces();
      },
      60 * 60 * 1000
    ); // Every hour

    this?.log(any: any)');
  }

  public stopAutoCleanup(): void {
    if (any: any) {
      clearInterval(any: any);
      this?.cleanupInterval = null;
      this?.log('Auto-cleanup stopped');
    }
  }

  /**
   * Destroy: cleanup + clear
   */
  public destroy(): void {
    this?.stopAutoCleanup();
    this?.traces?.clear();
    this?.log('CognitiveObservabilityEngine destroyed');
  }
}

/**
 * Factory function
 */
export function createCognitiveObservabilityEngine(
  config?: Partial<ObservabilityConfig>
): CognitiveObservabilityEngine {
  return new CognitiveObservabilityEngine(any: any);
}

/**
 * Default configuration
 */
export function getDefaultObservabilityConfig(): ObservabilityConfig {
  return {
    enabled: true,
    log_level: 'info' as CognitiveLogLevel,
    enable_tracing: true,
    enable_decision_logging: true,
    enable_debug_panel: true,
    max_traces: 100,
    trace_retention_hours: 24,
    max_traces_in_memory: 100,
    cleanup_interval_ms: 3600000,
    phases_to_trace: [
      'input_received',
      'semantic_memory_retrieved',
      'goal_state_loaded',
      'facts_loaded',
      'context_built',
      'model_invoked',
      'raw_output',
      'consistency_check',
      'auto_correction',
      'final_output',
      'output_sent',
    ],
    export_formats: ['json', 'csv', 'markdown'],
  };
}
