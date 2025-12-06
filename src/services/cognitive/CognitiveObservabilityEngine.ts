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
  TraceExport,
  ObservabilityConfig,
  CognitivePhase,
  CognitiveLogLevel,
  type CognitiveLogEntry,
  type CognitiveDecision,
  type CognitiveSnapshot,
  type ObservabilityStats,
  type ICognitiveObservabilityEngine,
  type ObservabilityEvent,
} from './cognitiveObservability.types';

/**
 * Cognitive Observability Engine
 * 
 * Traces and logs cognitive pipeline execution for introspection
 */
export class CognitiveObservabilityEngine extends EventEmitter {
  private config: Required<ObservabilityConfig>;
  
  // Storage
  private traces: Map<string, CognitiveTrace> = new Map();
  private decisions: Map<string, DecisionLog[]> = new Map();
  private events: ObservabilityEvent[] = [];
  
  // Statistics
  private totalTraces = 0;
  private totalDecisions = 0;
  private totalPhases = 0;

  constructor(config?: Partial<ObservabilityConfig>) {
    super();
    
    this.config = {
      enable_tracing: config?.enable_tracing ?? true,
      enable_decision_logging: config?.enable_decision_logging ?? true,
      enable_debug_panel: config?.enable_debug_panel ?? true,
      trace_retention_hours: config?.trace_retention_hours ?? 24,
      max_traces_in_memory: config?.max_traces_in_memory ?? 100,
      phases_to_trace: config?.phases_to_trace ?? [
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
        'output_sent'
      ],
      export_formats: config?.export_formats ?? ['json', 'csv', 'markdown']
    };

    this.log('CognitiveObservabilityEngine initialized', this.config);
    
    // Periodic cleanup
    setInterval(() => this.cleanupOldTraces(), 60 * 60 * 1000); // Every hour
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
    if (!this.config.enable_tracing) {
      return 'tracing_disabled';
    }

    const trace_id = `trace_${conversation_id}_${turn_number}_${Date.now()}`;
    
    const trace: CognitiveTrace = {
      trace_id,
      conversation_id,
      turn_number,
      user_message,
      phases: [],
      decisions: [],
      start_time: new Date().toISOString(),
      end_time: null,
      total_duration_ms: null,
      errors: []
    };

    this.traces.set(trace_id, trace);
    this.totalTraces++;

    this.emit('trace:started', { trace_id, conversation_id, turn_number });
    this.log(`Trace started: ${trace_id}`);

    // Add input_received phase
    await this.logPhase(trace_id, 'input_received', {
      message: user_message,
      message_length: user_message.length,
      timestamp: new Date().toISOString()
    });

    return trace_id;
  }

  /**
   * Log pipeline phase
   */
  async logPhase(
    trace_id: string,
    phase_name: PhaseName,
    data: Record<string, any>,
    duration_ms?: number
  ): Promise<void> {
    if (!this.config.enable_tracing) return;

    const trace = this.traces.get(trace_id);
    if (!trace) {
      this.log(`Trace not found: ${trace_id}`, undefined, 'warn');
      return;
    }

    // Check if phase is enabled
    if (!this.config.phases_to_trace.includes(phase_name)) {
      return;
    }

    const phase: PipelinePhase = {
      phase_name,
      data,
      timestamp: new Date().toISOString(),
      duration_ms: duration_ms || null
    };

    trace.phases.push(phase);
    this.totalPhases++;

    this.emit('phase:logged', { trace_id, phase });
    this.log(`Phase logged: ${phase_name} for trace ${trace_id}`, data);
  }

  /**
   * End trace
   */
  async endTrace(
    trace_id: string,
    final_output: string,
    status: 'success' | 'error' = 'success'
  ): Promise<CognitiveTrace | null> {
    const trace = this.traces.get(trace_id);
    if (!trace) {
      this.log(`Trace not found: ${trace_id}`, undefined, 'warn');
      return null;
    }

    trace.end_time = new Date().toISOString();
    trace.total_duration_ms = 
      new Date(trace.end_time).getTime() - new Date(trace.start_time).getTime();

    // Add final output phase
    await this.logPhase(trace_id, 'output_sent', {
      output: final_output,
      output_length: final_output.length,
      status
    });

    this.emit('trace:ended', { trace_id, status, duration: trace.total_duration_ms });
    this.log(`Trace ended: ${trace_id}`, { status, duration: trace.total_duration_ms });

    return trace;
  }

  /**
   * Get trace
   */
  async getTrace(trace_id: string): Promise<CognitiveTrace | null> {
    return this.traces.get(trace_id) || null;
  }

  /**
   * Get traces for conversation
   */
  async getConversationTraces(conversation_id: string): Promise<CognitiveTrace[]> {
    return Array.from(this.traces.values())
      .filter(trace => trace.conversation_id === conversation_id)
      .sort((a, b) => a.turn_number - b.turn_number);
  }

  /**
   * DECISION LOGGING
   */

  /**
   * Log decision
   */
  async logDecision(
    trace_id: string,
    decision: Omit<DecisionLog, 'decision_id' | 'timestamp'>
  ): Promise<void> {
    if (!this.config.enable_decision_logging) return;

    const trace = this.traces.get(trace_id);
    if (!trace) {
      this.log(`Trace not found for decision: ${trace_id}`, undefined, 'warn');
      return;
    }

    const fullDecision: DecisionLog = {
      ...decision,
      decision_id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    trace.decisions.push(fullDecision);
    this.totalDecisions++;

    // Also store by conversation for easy retrieval
    const conversationDecisions = this.decisions.get(trace.conversation_id) || [];
    conversationDecisions.push(fullDecision);
    this.decisions.set(trace.conversation_id, conversationDecisions);

    this.emit('decision:logged', { trace_id, decision: fullDecision });
    this.log(`Decision logged: ${fullDecision.decision_point}`, fullDecision);
  }

  /**
   * Get decisions for conversation
   */
  async getConversationDecisions(conversation_id: string): Promise<DecisionLog[]> {
    return this.decisions.get(conversation_id) || [];
  }

  /**
   * DEBUG PANEL
   */

  /**
   * Get debug panel data for conversation
   */
  async getDebugPanel(conversation_id: string): Promise<DebugPanel> {
    if (!this.config.enable_debug_panel) {
      return this.getEmptyDebugPanel(conversation_id);
    }

    const traces = await this.getConversationTraces(conversation_id);
    const latestTrace = traces[traces.length - 1];
    const decisions = await this.getConversationDecisions(conversation_id);

    // Extract memory info from traces
    const memoryPanelData = traces.flatMap(trace => 
      trace.phases
        .filter(p => p.phase_name === 'semantic_memory_retrieved')
        .map(p => ({
          query: latestTrace?.user_message || '',
          results_count: p.data.count || 0,
          top_similarity: p.data.top_similarity || 0,
          retrieved_at: p.timestamp
        }))
    ).slice(-5); // Last 5 memory retrievals

    // Extract goal info from traces
    const goalPanelData = traces.flatMap(trace =>
      trace.phases
        .filter(p => p.phase_name === 'goal_state_loaded')
        .map(p => ({
          main_goal: p.data.main_goal || '',
          subgoals: p.data.subgoals || [],
          progress: p.data.progress || 0,
          loaded_at: p.timestamp
        }))
    ).slice(-1)[0]; // Latest goal state

    // Extract consistency info from traces
    const consistencyPanelData = traces.flatMap(trace =>
      trace.phases
        .filter(p => p.phase_name === 'consistency_check')
        .map(p => ({
          violations: p.data.violations || [],
          consistency_score: p.data.consistency_score || 1.0,
          auto_corrections: p.data.corrections || [],
          checked_at: p.timestamp
        }))
    ).slice(-5); // Last 5 consistency checks

    // Extract metrics from traces
    const metricsPanelData = traces.map(trace => {
      const evaluationPhase = trace.phases.find(p => p.phase_name === 'raw_output');
      return {
        turn_number: trace.turn_number,
        metrics: evaluationPhase?.data.metrics || {},
        timestamp: evaluationPhase?.timestamp || trace.start_time
      };
    }).slice(-10); // Last 10 turns

    const panel: DebugPanel = {
      conversation_id,
      current_turn: latestTrace?.turn_number || 0,
      memory_panel: memoryPanelData.length > 0 ? memoryPanelData : undefined,
      goals_panel: goalPanelData ? goalPanelData : undefined,
      consistency_panel: consistencyPanelData.length > 0 ? consistencyPanelData : undefined,
      metrics_panel: metricsPanelData.length > 0 ? metricsPanelData : undefined,
      recent_decisions: decisions.slice(-10), // Last 10 decisions
      recent_traces: traces.slice(-5).map(t => ({
        trace_id: t.trace_id,
        turn_number: t.turn_number,
        duration_ms: t.total_duration_ms,
        status: t.errors.length > 0 ? 'error' : 'success',
        phases_completed: t.phases.length
      })),
      last_updated: new Date().toISOString()
    };

    this.emit('debug_panel:generated', { conversation_id, panel });
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
    const trace = await this.getTrace(trace_id);
    if (!trace) {
      throw new Error(`Trace not found: ${trace_id}`);
    }

    switch (format) {
      case 'json':
        return JSON.stringify(trace, null, 2);
      
      case 'csv':
        return this.exportTraceAsCSV(trace);
      
      case 'markdown':
        return this.exportTraceAsMarkdown(trace);
      
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
    const traces = await this.getConversationTraces(conversation_id);
    
    if (traces.length === 0) {
      throw new Error(`No traces found for conversation: ${conversation_id}`);
    }

    switch (format) {
      case 'json':
        return JSON.stringify(traces, null, 2);
      
      case 'csv':
        return traces.map(t => this.exportTraceAsCSV(t)).join('\n\n');
      
      case 'markdown':
        return this.exportConversationAsMarkdown(conversation_id, traces);
      
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Export trace as CSV
   */
  private exportTraceAsCSV(trace: CognitiveTrace): string {
    let csv = 'trace_id,conversation_id,turn_number,phase_name,timestamp,duration_ms,data\n';
    
    for (const phase of trace.phases) {
      const dataStr = JSON.stringify(phase.data).replace(/"/g, '""');
      csv += `"${trace.trace_id}","${trace.conversation_id}",${trace.turn_number},"${phase.phase_name}","${phase.timestamp}",${phase.duration_ms || ''},"${dataStr}"\n`;
    }

    return csv;
  }

  /**
   * Export trace as Markdown
   */
  private exportTraceAsMarkdown(trace: CognitiveTrace): string {
    let md = `# Trace: ${trace.trace_id}\n\n`;
    md += `**Conversation:** ${trace.conversation_id}\n`;
    md += `**Turn:** ${trace.turn_number}\n`;
    md += `**User Message:** ${trace.user_message}\n`;
    md += `**Duration:** ${trace.total_duration_ms || 'N/A'} ms\n\n`;

    md += `## Pipeline Phases\n\n`;
    for (const phase of trace.phases) {
      md += `### ${phase.phase_name}\n`;
      md += `- **Timestamp:** ${phase.timestamp}\n`;
      if (phase.duration_ms) {
        md += `- **Duration:** ${phase.duration_ms} ms\n`;
      }
      md += `- **Data:**\n\`\`\`json\n${JSON.stringify(phase.data, null, 2)}\n\`\`\`\n\n`;
    }

    if (trace.decisions.length > 0) {
      md += `## Decisions\n\n`;
      for (const decision of trace.decisions) {
        md += `### ${decision.decision_point}\n`;
        md += `- **Chosen:** ${decision.chosen_option}\n`;
        md += `- **Why:** ${decision.why}\n`;
        md += `- **Confidence:** ${(decision.confidence * 100).toFixed(0)}%\n`;
        if (decision.alternatives && decision.alternatives.length > 0) {
          md += `- **Alternatives:** ${decision.alternatives.join(', ')}\n`;
        }
        md += `\n`;
      }
    }

    if (trace.errors.length > 0) {
      md += `## Errors\n\n`;
      for (const error of trace.errors) {
        md += `- ${error}\n`;
      }
      md += `\n`;
    }

    return md;
  }

  /**
   * Export conversation as Markdown
   */
  private exportConversationAsMarkdown(conversation_id: string, traces: CognitiveTrace[]): string {
    let md = `# Conversation Traces: ${conversation_id}\n\n`;
    md += `**Total Turns:** ${traces.length}\n`;
    md += `**First Turn:** ${traces[0]?.start_time || 'N/A'}\n`;
    md += `**Last Turn:** ${traces[traces.length - 1]?.end_time || 'N/A'}\n\n`;

    md += `## Turns\n\n`;
    for (const trace of traces) {
      md += `### Turn ${trace.turn_number}\n`;
      md += `**User:** ${trace.user_message}\n\n`;
      
      const outputPhase = trace.phases.find(p => p.phase_name === 'output_sent');
      if (outputPhase) {
        md += `**Assistant:** ${outputPhase.data.output || 'N/A'}\n\n`;
      }

      md += `**Duration:** ${trace.total_duration_ms || 'N/A'} ms\n`;
      md += `**Phases:** ${trace.phases.map(p => p.phase_name).join(' → ')}\n\n`;

      if (trace.decisions.length > 0) {
        md += `**Decisions:**\n`;
        for (const decision of trace.decisions) {
          md += `- ${decision.decision_point}: ${decision.chosen_option} (${(decision.confidence * 100).toFixed(0)}%)\n`;
        }
        md += `\n`;
      }
    }

    return md;
  }

  /**
   * Get analytics data
   */
  async getAnalytics(conversation_id?: string): Promise<{
    total_traces: number;
    total_decisions: number;
    avg_duration_ms: number;
    phase_frequencies: Record<PhaseName, number>;
    decision_confidence_avg: number;
    error_rate: number;
  }> {
    const relevantTraces = conversation_id
      ? await this.getConversationTraces(conversation_id)
      : Array.from(this.traces.values());

    const phaseFrequencies: Record<PhaseName, number> = {} as any;
    let totalDuration = 0;
    let traceCount = 0;
    let totalConfidence = 0;
    let decisionCount = 0;
    let errorCount = 0;

    for (const trace of relevantTraces) {
      if (trace.total_duration_ms) {
        totalDuration += trace.total_duration_ms;
        traceCount++;
      }

      for (const phase of trace.phases) {
        phaseFrequencies[phase.phase_name] = (phaseFrequencies[phase.phase_name] || 0) + 1;
      }

      for (const decision of trace.decisions) {
        totalConfidence += decision.confidence;
        decisionCount++;
      }

      errorCount += trace.errors.length;
    }

    return {
      total_traces: relevantTraces.length,
      total_decisions: decisionCount,
      avg_duration_ms: traceCount > 0 ? totalDuration / traceCount : 0,
      phase_frequencies: phaseFrequencies,
      decision_confidence_avg: decisionCount > 0 ? totalConfidence / decisionCount : 0,
      error_rate: relevantTraces.length > 0 ? errorCount / relevantTraces.length : 0
    };
  }

  /**
   * UTILITIES
   */

  /**
   * Cleanup old traces
   */
  private async cleanupOldTraces(): Promise<void> {
    const now = Date.now();
    const retentionMs = this.config.trace_retention_hours * 60 * 60 * 1000;
    
    let deletedCount = 0;
    
    for (const [trace_id, trace] of this.traces.entries()) {
      const traceAge = now - new Date(trace.start_time).getTime();
      
      if (traceAge > retentionMs) {
        this.traces.delete(trace_id);
        deletedCount++;
      }
    }

    // Also limit total traces in memory
    if (this.traces.size > this.config.max_traces_in_memory) {
      const sorted = Array.from(this.traces.entries())
        .sort((a, b) => 
          new Date(b[1].start_time).getTime() - new Date(a[1].start_time).getTime()
        );
      
      const toKeep = sorted.slice(0, this.config.max_traces_in_memory);
      this.traces.clear();
      toKeep.forEach(([id, trace]) => this.traces.set(id, trace));
      
      deletedCount += sorted.length - toKeep.length;
    }

    if (deletedCount > 0) {
      this.log(`Cleaned up ${deletedCount} old traces`);
      this.emit('traces:cleaned', { deleted_count: deletedCount });
    }
  }

  /**
   * Get empty debug panel
   */
  private getEmptyDebugPanel(conversation_id: string): DebugPanel {
    return {
      conversation_id,
      current_turn: 0,
      recent_decisions: [],
      recent_traces: [],
      last_updated: new Date().toISOString()
    };
  }

  /**
   * Log error in trace
   */
  async logError(trace_id: string, error: string): Promise<void> {
    const trace = this.traces.get(trace_id);
    if (!trace) return;

    trace.errors.push(error);
    this.emit('trace:error', { trace_id, error });
    this.log(`Error in trace ${trace_id}`, error, 'error');
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      total_traces: this.totalTraces,
      total_decisions: this.totalDecisions,
      total_phases: this.totalPhases,
      traces_in_memory: this.traces.size,
      conversations_tracked: new Set(
        Array.from(this.traces.values()).map(t => t.conversation_id)
      ).size
    };
  }

  /**
   * Logging
   */
  private log(message: string, data?: any, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    
    if (level === 'error') {
      console.error(`[CognitiveObservabilityEngine] ${timestamp} ${message}`, data || '');
    } else if (level === 'warn') {
      console.warn(`[CognitiveObservabilityEngine] ${timestamp} ${message}`, data || '');
    } else {
      console.log(`[CognitiveObservabilityEngine] ${timestamp} ${message}`, data || '');
    }

    this.emit('log', { timestamp, level, message, data });
  }
}

/**
 * Factory function
 */
export function createCognitiveObservabilityEngine(
  config?: Partial<ObservabilityConfig>
): CognitiveObservabilityEngine {
  return new CognitiveObservabilityEngine(config);
}

/**
 * Default configuration
 */
export function getDefaultObservabilityConfig(): ObservabilityConfig {
  return {
    enable_tracing: true,
    enable_decision_logging: true,
    enable_debug_panel: true,
    trace_retention_hours: 24,
    max_traces_in_memory: 100,
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
      'output_sent'
    ],
    export_formats: ['json', 'csv', 'markdown']
  };
}
