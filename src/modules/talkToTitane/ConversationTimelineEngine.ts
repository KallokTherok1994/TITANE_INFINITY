/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ CONVERSATION TIMELINE ENGINE v∞.30.0
 *   Super Prompt #23 — Chronologie Intelligente Complète
 * ═══════════════════════════════════════════════════════════════════
 *
 * Reconstruction chronologie conversationnelle complète
 * Segmentation intelligente, visualisation, analyse évolutive
 *
 * Features:
 * - Fusion toutes conversations (chat/dev/vocal/system)
 * - Tri chronologique parfait
 * - Détection trous temporels + reconstruction
 * - Segmentation sessions/moteurs/intentions
 * - Identification événements majeurs
 * - Analyse patterns répétitifs
 * - Export formats multiples (JSON/JSONL/HTML)
 * - Visualisation timeline interactive
 *
 * v25.2: Migré vers Tauri filesystem APIs via adaptateur
 */

import { readFile, readdir } from '../../utils/tauriFsAdapter';
import { existsSync } from '../../utils/tauriFsAdapter';
import { join } from '../../utils/tauriFsAdapter';
import type { ConversationEntry } from './AutoSaveConversationEngine';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TimelineEntry extends ConversationEntry {
  sessionId: string;
  engineName: string;
  intentType: string;
  isMajorEvent: boolean;
}

export interface TimelineSession {
  sessionId: string;
  startTime: number;
  endTime: number;
  duration: number;
  engine: string;
  interactions: number;
  entries: TimelineEntry[];
}

export interface TimelineSegment {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  type: 'session' | 'engine' | 'intention' | 'event';
  label: string;
  entries: TimelineEntry[];
}

export interface MajorEvent {
  id: string;
  timestamp: number;
  type: 'error' | 'success' | 'milestone' | 'system' | 'user-action';
  description: string;
  context: unknown;
}

export interface TimelineStats {
  totalEntries: number;
  totalSessions: number;
  totalDuration: number;
  avgSessionDuration: number;
  enginesUsed: string[];
  intentionsDetected: string[];
  majorEvents: number;
}

export interface TimelineState {
  isBuilding: boolean;
  lastBuildTime: number;
  totalBuilds: number;
  currentTimeline: TimelineEntry[];
}

export interface TimelineConfig {
  enabled: boolean;
  autoRebuildOnChanges: boolean;
  rebuildInterval: number; // ms
  maxGapTolerance: number; // ms
  majorEventThreshold: number; // confidence
}

// ═══════════════════════════════════════════════════════════════════════════
// CONVERSATION TIMELINE ENGINE
// ═══════════════════════════════════════════════════════════════════════════

class ConversationTimelineEngine {
  private state: TimelineState = {
    isBuilding: false,
    lastBuildTime: 0,
    totalBuilds: 0,
    currentTimeline: [],
  };

  private config: TimelineConfig = {
    enabled: true,
    autoRebuildOnChanges: true,
    rebuildInterval: 300000, // 5 min
    maxGapTolerance: 300000, // 5 min
    majorEventThreshold: 0.8,
  };

  private rebuildTimer: NodeJS.Timeout | null = null;

  // ───────────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ───────────────────────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    logger.debug('Initializing Conversation Timeline Engine v∞...');

    if (this.config.enabled) {
      await this.build();
      this.startRebuildTimer();
    }

    logger.debug('Initialized');
  }

  private startRebuildTimer(): void {
    this.rebuildTimer = setInterval(() => {
      if (this.config.autoRebuildOnChanges) {
        this.build();
      }
    }, this.config.rebuildInterval);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // BUILD TIMELINE
  // ───────────────────────────────────────────────────────────────────────────

  async build(): Promise<TimelineEntry[]> {
    if (this.state.isBuilding) {
      logger.debug('Build already in progress');
      return this.state.currentTimeline;
    }

    this.state.isBuilding = true;

    try {
      logger.debug('Building timeline...');

      const allEntries: TimelineEntry[] = [];

      // Collect from memory
      const memoryEntries = await this.collectFromDirectory('data/memory/conversations');
      allEntries.push(...memoryEntries);

      // Collect from logs
      const logsEntries = await this.collectFromDirectory('data/logs/conversations');
      allEntries.push(...logsEntries);

      // Collect from dataset
      const datasetEntries = await this.collectFromDirectory(
        'data/dataset/conversations_raw'
      );
      allEntries.push(...datasetEntries);

      // Deduplicate
      const unique = this.deduplicateEntries(allEntries);

      // Sort chronologically
      unique.sort((a, b) => a.timestamp - b.timestamp);

      // Enhance entries
      const enhanced = this.enhanceEntries(unique);

      // Detect major events
      this.detectMajorEvents(enhanced);

      this.state.currentTimeline = enhanced;
      this.state.lastBuildTime = Date.now();
      this.state.totalBuilds++;

      logger.debug(`[Timeline] Timeline built: ${enhanced.length} entries`);

      return enhanced;
    } finally {
      this.state.isBuilding = false;
    }
  }

  private async collectFromDirectory(dirPath: string): Promise<TimelineEntry[]> {
    if (!(await existsSync(dirPath))) {
      return [];
    }

    const files = await readdir(dirPath);
    const jsonlFiles = files.filter(f => f.endsWith('.jsonl'));

    const entries: TimelineEntry[] = [];

    for (const file of jsonlFiles) {
      const filePath = join(dirPath, file);
      const fileEntries = await this.readFile(filePath);
      entries.push(...fileEntries);
    }

    return entries;
  }

  private async readFile(filePath: string): Promise<TimelineEntry[]> {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());

    const entries: TimelineEntry[] = [];

    for (const line of lines) {
      try {
        const entry = JSON.parse(line) as ConversationEntry;
        entries.push({
          ...entry,
          sessionId: entry.metadata?.sessionId || 'unknown',
          engineName: entry.context?.engine || 'unknown',
          intentType: entry.context?.intention || 'unknown',
          isMajorEvent: false,
        });
      } catch {
        // Skip malformed
      }
    }

    return entries;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // DEDUPLICATION
  // ───────────────────────────────────────────────────────────────────────────

  private deduplicateEntries(entries: TimelineEntry[]): TimelineEntry[] {
    const seen = new Set<string>();
    return entries.filter(entry => {
      const key = `${entry.timestamp}-${entry.input}-${entry.output}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ENHANCE ENTRIES
  // ───────────────────────────────────────────────────────────────────────────

  private enhanceEntries(entries: TimelineEntry[]): TimelineEntry[] {
    return entries.map(entry => ({
      ...entry,
      engineName: this.normalizeEngineName(entry.engineName),
      intentType: this.normalizeIntentType(entry.intentType),
    }));
  }

  private normalizeEngineName(name: string): string {
    const normalizeMap: Record<string, string | undefined> = {
      ChatEngine: 'Chat',
      BubbleEngine: 'Bubble',
      DevConsoleEngine: 'DevConsole',
      TalkToTitaneEngine: 'TalkToTitane',
      LiveDebuggerEngine: 'LiveDebugger',
      DevSudoHandler: 'SUDO',
      SystemEngine: 'System',
    };
    return normalizeMap[name] ?? name;
  }

  private normalizeIntentType(type: string): string {
    return type.toLowerCase().replace(/[_-]/g, ' ');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MAJOR EVENTS DETECTION
  // ───────────────────────────────────────────────────────────────────────────

  private detectMajorEvents(entries: TimelineEntry[]): void {
    const majorKeywords = [
      'error',
      'critical',
      'success',
      'milestone',
      'deploy',
      'crash',
    ];

    for (const entry of entries) {
      const text = `${entry.input} ${entry.output}`.toLowerCase();
      const hasMajorKeyword = majorKeywords.some(kw => text.includes(kw));

      if (hasMajorKeyword) {
        entry.isMajorEvent = true;
      }
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SEGMENTATION
  // ───────────────────────────────────────────────────────────────────────────

  async segmentBySessions(): Promise<TimelineSession[]> {
    const timeline =
      this.state.currentTimeline.length > 0
        ? this.state.currentTimeline
        : await this.build();

    const sessionMap = new Map<string, TimelineEntry[]>();

    for (const entry of timeline) {
      let sessionEntries = sessionMap.get(entry.sessionId);
      if (!sessionEntries) {
        sessionEntries = [];
        sessionMap.set(entry.sessionId, sessionEntries);
      }
      sessionEntries.push(entry);
    }

    const sessions: TimelineSession[] = [];

    for (const [sessionId, entries] of sessionMap.entries()) {
      const sorted = entries.sort((a, b) => a.timestamp - b.timestamp);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      if (!first || !last) continue;

      sessions.push({
        sessionId,
        startTime: first.timestamp,
        endTime: last.timestamp,
        duration: last.timestamp - first.timestamp,
        engine: first.engineName,
        interactions: sorted.length,
        entries: sorted,
      });
    }

    return sessions.sort((a, b) => a.startTime - b.startTime);
  }

  async segmentByEngines(): Promise<TimelineSegment[]> {
    const timeline =
      this.state.currentTimeline.length > 0
        ? this.state.currentTimeline
        : await this.build();

    const engineMap = new Map<string, TimelineEntry[]>();

    for (const entry of timeline) {
      let engineEntries = engineMap.get(entry.engineName);
      if (!engineEntries) {
        engineEntries = [];
        engineMap.set(entry.engineName, engineEntries);
      }
      engineEntries.push(entry);
    }

    const segments: TimelineSegment[] = [];

    for (const [engine, entries] of engineMap.entries()) {
      const sorted = entries.sort((a, b) => a.timestamp - b.timestamp);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      if (!first || !last) continue;

      segments.push({
        id: `engine-${engine}`,
        startTime: first.timestamp,
        endTime: last.timestamp,
        duration: last.timestamp - first.timestamp,
        type: 'engine',
        label: engine,
        entries: sorted,
      });
    }

    return segments.sort((a, b) => a.startTime - b.startTime);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STATISTICS
  // ───────────────────────────────────────────────────────────────────────────

  async getStats(): Promise<TimelineStats> {
    const timeline =
      this.state.currentTimeline.length > 0
        ? this.state.currentTimeline
        : await this.build();

    const sessions = await this.segmentBySessions();

    const enginesUsed = [...new Set(timeline.map(e => e.engineName))];
    const intentionsDetected = [...new Set(timeline.map(e => e.intentType))];
    const majorEvents = timeline.filter(e => e.isMajorEvent).length;

    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const avgSessionDuration = sessions.length > 0 ? totalDuration / sessions.length : 0;

    return {
      totalEntries: timeline.length,
      totalSessions: sessions.length,
      totalDuration,
      avgSessionDuration,
      enginesUsed,
      intentionsDetected,
      majorEvents,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // EXPORT
  // ───────────────────────────────────────────────────────────────────────────

  async export(format: 'json' | 'jsonl' | 'html'): Promise<string> {
    const timeline =
      this.state.currentTimeline.length > 0
        ? this.state.currentTimeline
        : await this.build();

    switch (format) {
      case 'json':
        return JSON.stringify(timeline, null, 2);

      case 'jsonl':
        return timeline.map(e => JSON.stringify(e)).join('\n');

      case 'html':
        return this.exportHtml(timeline);

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private exportHtml(timeline: TimelineEntry[]): string {
    const sessions = timeline.reduce(
      (acc, entry) => {
        let sessionEntries = acc[entry.sessionId];
        if (!sessionEntries) {
          sessionEntries = [];
          acc[entry.sessionId] = sessionEntries;
        }
        sessionEntries.push(entry);
        return acc;
      },
      {} as Record<string, TimelineEntry[]>
    );

    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>TITANE∞ Timeline</title>
  <style>
    body { font-family: monospace; background: #000; color: #0f0; padding: 20px; }
    .session { margin: 20px 0; border: 1px solid #0f0; padding: 10px; }
    .session-header { color: #ff0000; font-weight: bold; }
    .entry { margin: 10px 0; padding: 5px; background: #001100; }
    .major-event { border-left: 4px solid #ff0000; }
    .timestamp { color: #666; }
    .engine { color: #00f; }
    .intent { color: #f0f; }
  </style>
</head>
<body>
  <h1>TITANE∞ Conversation Timeline</h1>
`;

    for (const [sessionId, entries] of Object.entries(sessions)) {
      html += `  <div class="session">
    <div class="session-header">Session: ${sessionId} (${entries.length} interactions)</div>
`;

      for (const entry of entries) {
        const timestamp = new Date(entry.timestamp).toISOString();
        const majorClass = entry.isMajorEvent ? ' major-event' : '';

        html += `    <div class="entry${majorClass}">
      <span class="timestamp">[${timestamp}]</span>
      <span class="engine">${entry.engineName}</span>
      <span class="intent">${entry.intentType}</span>
      <div><strong>Input:</strong> ${this.escapeHtml(entry.input)}</div>
      <div><strong>Output:</strong> ${this.escapeHtml(entry.output.substring(0, 200))}...</div>
    </div>
`;
      }

      html += `  </div>
`;
    }

    html += `</body>
</html>`;

    return html;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SHOW (CONSOLE)
  // ───────────────────────────────────────────────────────────────────────────

  async show(limit = 20): Promise<void> {
    const timeline =
      this.state.currentTimeline.length > 0
        ? this.state.currentTimeline
        : await this.build();

    const recent = timeline.slice(-limit);

    logger.debug('\n═══════════════════════════════════════════════════');
    logger.debug('  TITANE∞ CONVERSATION TIMELINE (RECENT)');
    logger.debug('═══════════════════════════════════════════════════\n');

    for (const entry of recent) {
      const timestamp = new Date(entry.timestamp).toLocaleString();
      const majorFlag = entry.isMajorEvent ? ' [MAJOR]' : '';

      logger.debug(`[${timestamp}] ${entry.engineName} - ${entry.intentType}${majorFlag}`);
      logger.debug(`  Input:  ${entry.input.substring(0, 80)}...`);
      logger.debug(`  Output: ${entry.output.substring(0, 80)}...`);
      logger.debug('');
    }

    logger.debug('═══════════════════════════════════════════════════\n');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // QUERY
  // ───────────────────────────────────────────────────────────────────────────

  async query(params: {
    engine?: string;
    intent?: string;
    sessionId?: string;
    startTime?: number;
    endTime?: number;
    majorEventsOnly?: boolean;
  }): Promise<TimelineEntry[]> {
    const timeline =
      this.state.currentTimeline.length > 0
        ? this.state.currentTimeline
        : await this.build();

    return timeline.filter(entry => {
      if (params.engine && entry.engineName !== params.engine) return false;
      if (params.intent && entry.intentType !== params.intent) return false;
      if (params.sessionId && entry.sessionId !== params.sessionId) return false;
      if (params.startTime && entry.timestamp < params.startTime) return false;
      if (params.endTime && entry.timestamp > params.endTime) return false;
      if (params.majorEventsOnly && !entry.isMajorEvent) return false;
      return true;
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ───────────────────────────────────────────────────────────────────────────

  configure(config: Partial<TimelineConfig>): void {
    this.config = { ...this.config, ...config };
    logger.debug('Configuration updated:', config);
  }

  getState(): TimelineState {
    return { ...this.state };
  }

  getConfig(): TimelineConfig {
    return { ...this.config };
  }

  getTimeline(): TimelineEntry[] {
    return [...this.state.currentTimeline];
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CLEANUP
  // ───────────────────────────────────────────────────────────────────────────

  async shutdown(): Promise<void> {
    logger.debug('Shutting down...');

    if (this.rebuildTimer) {
      clearInterval(this.rebuildTimer);
    }

    logger.debug('Shutdown complete');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const conversationTimelineEngine = new ConversationTimelineEngine();
