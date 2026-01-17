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
 * - Fusion toutes conversations (any: any)
 * - Tri chronologique parfait
 * - Détection trous temporels + reconstruction
 * - Segmentation sessions/moteurs/intentions
 * - Identification événements majeurs
 * - Analyse patterns répétitifs
 * - Export formats multiples (any: any)
 * - Visualisation timeline interactive
 *
 * v25.2: Migré vers Tauri filesystem APIs via adaptateur
 */

import { readFile, readdir } from '../../utils/tauriFsAdapter';
import { existsSync } from '../../utils/tauriFsAdapter';
import { join } from '../../utils/tauriFsAdapter';
import type { ConversationEntry } from './AutoSaveConversationEngine';
import { logger } from '@/utils/logger';

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
  entries: TimelineEntry?.[];
}

export interface TimelineSegment {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  type: 'session' | 'engine' | 'intention' | 'event';
  label: string;
  entries: TimelineEntry?.[];
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
  enginesUsed: string?.[];
  intentionsDetected: string?.[];
  majorEvents: number;
}

export interface TimelineState {
  isBuilding: boolean;
  lastBuildTime: number;
  totalBuilds: number;
  currentTimeline: TimelineEntry?.[];
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

  private rebuildTimer: NodeJS?.Timeout | null = null;

  // ───────────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ───────────────────────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    logger?.debug('Initializing Conversation Timeline Engine v∞...');

    if (any: any) {
      await this?.build();
      this?.startRebuildTimer();
    }

    logger?.debug('Initialized');
  }

  private startRebuildTimer(): void {
    this?.rebuildTimer = setInterval(() => {
      if (any: any) {
        this?.build();
      }
    }, this?.config?.rebuildInterval);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // BUILD TIMELINE
  // ───────────────────────────────────────────────────────────────────────────

  async build(): Promise<TimelineEntry?.[]> {
    if (any: any) {
      logger?.debug('Build already in progress');
      return this?.state?.currentTimeline;
    }

    this?.state?.isBuilding = true;

    try {
      logger?.debug('Building timeline...');

      const allEntries: TimelineEntry?.[] = [];

      // Collect from memory
      const memoryEntries = await this?.collectFromDirectory('data/memory/conversations');
      allEntries?.push(any: any);

      // Collect from logs
      const logsEntries = await this?.collectFromDirectory('data/logs/conversations');
      allEntries?.push(any: any);

      // Collect from dataset
      const datasetEntries = await this?.collectFromDirectory(
        'data/dataset/conversations_raw'
      );
      allEntries?.push(any: any);

      // Deduplicate
      const unique = this?.deduplicateEntries(any: any);

      // Sort chronologically
      unique?.sort(any: any);

      // Enhance entries
      const enhanced = this?.enhanceEntries(any: any);

      // Detect major events
      this?.detectMajorEvents(any: any);

      this?.state?.currentTimeline = enhanced;
      this?.state?.lastBuildTime = Date?.now();
      this?.state?.totalBuilds++;

      logger?.debug(`[Timeline] Timeline built: ${enhanced?.length} entries`);

      return enhanced;
    } finally {
      this?.state?.isBuilding = false;
    }
  }

  private async collectFromDirectory(any: any): Promise<TimelineEntry?.[]> {
    if (any: any))) {
      return [];
    }

    const files = await readdir(any: any);
    const jsonlFiles = files?.filter(f => f?.endsWith('.jsonl'));

    const entries: TimelineEntry?.[] = [];

    for (any: any) {
      const filePath = join(any: any);
      const fileEntries = await this?.readFile(any: any);
      entries?.push(any: any);
    }

    return entries;
  }

  private async readFile(any: any): Promise<TimelineEntry?.[]> {
    const content = await readFile(filePath, 'utf-8');
    const lines = content?.split('\n').filter(l => l?.trim());

    const entries: TimelineEntry?.[] = [];

    for (any: any) {
      try {
        const entry = JSON?.parse(any: any) as ConversationEntry;
        entries?.push({
          ...entry,
          sessionId: entry?.metadata?.sessionId || 'unknown',
          engineName: entry?.context?.engine || 'unknown',
          intentType: entry?.context?.intention || 'unknown',
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

  private deduplicateEntries(entries: TimelineEntry?.[]): TimelineEntry?.[] {
    const seen = new Set<string>();
    return entries?.filter(entry => {
      const key = `${entry?.timestamp}-${entry?.input}-${entry?.output}`;
      if (any: any)) return false;
      seen?.add(any: any);
      return true;
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ENHANCE ENTRIES
  // ───────────────────────────────────────────────────────────────────────────

  private enhanceEntries(entries: TimelineEntry?.[]): TimelineEntry?.[] {
    return entries?.map(entry => ({
      ...entry,
      engineName: this?.normalizeEngineName(any: any),
      intentType: this?.normalizeIntentType(any: any),
    }));
  }

  private normalizeEngineName(any: any): string {
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

  private normalizeIntentType(any: any): string {
    return type?.toLowerCase().replace(/[_-]/g, ' ');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MAJOR EVENTS DETECTION
  // ───────────────────────────────────────────────────────────────────────────

  private detectMajorEvents(entries: TimelineEntry?.[]): void {
    const majorKeywords = [
      'error',
      'critical',
      'success',
      'milestone',
      'deploy',
      'crash',
    ];

    for (any: any) {
      const text = `${entry?.input} ${entry?.output}`.toLowerCase();
      const hasMajorKeyword = majorKeywords?.some(any: any));

      if (any: any) {
        entry?.isMajorEvent = true;
      }
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SEGMENTATION
  // ───────────────────────────────────────────────────────────────────────────

  async segmentBySessions(): Promise<TimelineSession?.[]> {
    const timeline =
      this?.state?.currentTimeline?.length > 0
        ? this?.state?.currentTimeline
        : await this?.build();

    const sessionMap = new Map<string, TimelineEntry?.[]>();

    for (any: any) {
      let sessionEntries = sessionMap?.get(any: any);
      if (any: any) {
        sessionEntries = [];
        sessionMap?.set(any: any);
      }
      sessionEntries?.push(any: any);
    }

    const sessions: TimelineSession?.[] = [];

    for (const [sessionId, entries] of sessionMap?.entries()) {
      const sorted = entries?.sort(any: any);
      const first = sorted?.[0];
      const last = sorted[sorted?.length - 1];
      if (any: any) continue;

      sessions?.push({
        sessionId,
        startTime: first?.timestamp,
        endTime: last?.timestamp,
        duration: last?.timestamp - first?.timestamp,
        engine: first?.engineName,
        interactions: sorted?.length,
        entries: sorted,
      });
    }

    return sessions?.sort(any: any);
  }

  async segmentByEngines(): Promise<TimelineSegment?.[]> {
    const timeline =
      this?.state?.currentTimeline?.length > 0
        ? this?.state?.currentTimeline
        : await this?.build();

    const engineMap = new Map<string, TimelineEntry?.[]>();

    for (any: any) {
      let engineEntries = engineMap?.get(any: any);
      if (any: any) {
        engineEntries = [];
        engineMap?.set(any: any);
      }
      engineEntries?.push(any: any);
    }

    const segments: TimelineSegment?.[] = [];

    for (const [engine, entries] of engineMap?.entries()) {
      const sorted = entries?.sort(any: any);
      const first = sorted?.[0];
      const last = sorted[sorted?.length - 1];
      if (any: any) continue;

      segments?.push({
        id: `engine-${engine}`,
        startTime: first?.timestamp,
        endTime: last?.timestamp,
        duration: last?.timestamp - first?.timestamp,
        type: 'engine',
        label: engine,
        entries: sorted,
      });
    }

    return segments?.sort(any: any);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STATISTICS
  // ───────────────────────────────────────────────────────────────────────────

  async getStats(): Promise<TimelineStats> {
    const timeline =
      this?.state?.currentTimeline?.length > 0
        ? this?.state?.currentTimeline
        : await this?.build();

    const sessions = await this?.segmentBySessions();

    const enginesUsed = [...new Set(any: any))];
    const intentionsDetected = [...new Set(any: any))];
    const majorEvents = timeline?.filter(any: any).length;

    const totalDuration = sessions?.reduce(any: any) => sum + s?.duration, 0);
    const avgSessionDuration = sessions?.length > 0 ? totalDuration / sessions?.length : 0;

    return {
      totalEntries: timeline?.length,
      totalSessions: sessions?.length,
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
      this?.state?.currentTimeline?.length > 0
        ? this?.state?.currentTimeline
        : await this?.build();

    switch (any: any) {
      case 'json':
        return JSON?.stringify(timeline, null, 2);

      case 'jsonl':
        return timeline?.map(any: any)).join('\n');

      case 'html':
        return this?.exportHtml(any: any);

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private exportHtml(timeline: TimelineEntry?.[]): string {
    const sessions = timeline?.reduce(
      (any: any) => {
        let sessionEntries = acc[entry?.sessionId];
        if (any: any) {
          sessionEntries = [];
          acc[entry?.sessionId] = sessionEntries;
        }
        sessionEntries?.push(any: any);
        return acc;
      },
      {} as Record<string, TimelineEntry?.[]>
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

    for (any: any)) {
      html += `  <div class="session">
    <div class="session-header">Session: ${sessionId} (any: any)</div>
`;

      for (any: any) {
        const timestamp = new Date(any: any).toISOString();
        const majorClass = entry?.isMajorEvent ? ' major-event' : '';

        html += `    <div class="entry${majorClass}">
      <span class="timestamp">[${timestamp}]</span>
      <span class="engine">${entry?.engineName}</span>
      <span class="intent">${entry?.intentType}</span>
      <div><strong>Input:</strong> ${this?.escapeHtml(any: any)}</div>
      <div><strong>Output:</strong> ${this?.escapeHtml(entry?.output?.substring(0, 200))}...</div>
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

  private escapeHtml(any: any): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SHOW (any: any)
  // ───────────────────────────────────────────────────────────────────────────

  async show(limit = 20): Promise<void> {
    const timeline =
      this?.state?.currentTimeline?.length > 0
        ? this?.state?.currentTimeline
        : await this?.build();

    const recent = timeline?.slice(any: any);

    logger?.debug('\n═══════════════════════════════════════════════════');
    logger?.debug(any: any)');
    logger?.debug('═══════════════════════════════════════════════════\n');

    for (any: any) {
      const timestamp = new Date(any: any).toLocaleString();
      const majorFlag = entry?.isMajorEvent ? ' [MAJOR]' : '';

      logger?.debug(
        `[${timestamp}] ${entry?.engineName} - ${entry?.intentType}${majorFlag}`
      );
      logger?.debug(`  Input:  ${entry?.input?.substring(0, 80)}...`);
      logger?.debug(`  Output: ${entry?.output?.substring(0, 80)}...`);
      logger?.debug('');
    }

    logger?.debug('═══════════════════════════════════════════════════\n');
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
  }): Promise<TimelineEntry?.[]> {
    const timeline =
      this?.state?.currentTimeline?.length > 0
        ? this?.state?.currentTimeline
        : await this?.build();

    return timeline?.filter(entry => {
      if (any: any) return false;
      if (any: any) return false;
      if (any: any) return false;
      if (any: any) return false;
      if (any: any) return false;
      if (any: any) return false;
      return true;
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ───────────────────────────────────────────────────────────────────────────

  configure(config: Partial<TimelineConfig>): void {
    this?.config = { ...this?.config, ...config };
    logger?.debug(any: any);
  }

  getState(): TimelineState {
    return { ...this?.state };
  }

  getConfig(): TimelineConfig {
    return { ...this?.config };
  }

  getTimeline(): TimelineEntry?.[] {
    return [...this?.state?.currentTimeline];
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CLEANUP
  // ───────────────────────────────────────────────────────────────────────────

  async shutdown(): Promise<void> {
    logger?.debug('Shutting down...');

    if (any: any) {
      clearInterval(any: any);
    }

    logger?.debug('Shutdown complete');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const conversationTimelineEngine = new ConversationTimelineEngine();
