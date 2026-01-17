/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ — MEMORY SHARED TYPES
 *   Break circular dependencies in memory services
 * ═══════════════════════════════════════════════════════════════════
 */

export interface MemoryContext {
  activeProjects: ProjectSummary[];
  recentDecisions: DecisionSummary[];
  relevantKnowledge: KnowledgeEntry[];
  activeRituals: RitualInfo[];
  timeline: TimelineEntry[];
}

export interface ProjectSummary {
  id: string;
  title: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  progress: number; // 0-100
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastActivity: string; // ISO date
  tags: string[];
  description?: string;
}

export interface DecisionSummary {
  id: string;
  title: string;
  timestamp: string; // ISO date
  category: 'strategic' | 'tactical' | 'operational' | 'personal';
  impact: 'low' | 'medium' | 'high';
  status: 'pending' | 'implemented' | 'revised' | 'abandoned';
  rationale?: string;
  relatedProjects?: string[];
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  category: string;
  content: string;
  relevance: number; // 0-1
  lastAccessed: string; // ISO date
  tags: string[];
  source?: string;
  relatedEntries?: string[];
}

export interface RitualInfo {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  lastExecution: string; // ISO date
  nextDue: string; // ISO date
  status: 'active' | 'paused' | 'completed';
  completionRate: number; // 0-100
  description?: string;
  tags: string[];
}

export interface TimelineEntry {
  id: string;
  timestamp: string; // ISO date
  type: 'project' | 'decision' | 'ritual' | 'knowledge' | 'event';
  title: string;
  description?: string;
  relatedEntities: string[]; // IDs of related projects/decisions/etc
  importance: 'low' | 'medium' | 'high';
}

export interface MemoryLoadConfig {
  includeProjects?: boolean;
  includeDecisions?: boolean;
  includeKnowledge?: boolean;
  includeRituals?: boolean;
  includeTimeline?: boolean;
  maxProjects?: number;
  maxDecisions?: number;
  maxKnowledge?: number;
  timeWindow?: string;
  timeRange?: {
    start?: string; // ISO date
    end?: string; // ISO date
  };
  limit?: number;
  relevanceThreshold?: number; // 0-1
}

export interface ChatInteraction {
  userMessage: string;
  aiResponse: string;
  mode: string;
  emotionState?: {
    valence: number;
    activation: number;
    dominant_emotion: string;
  };
  timestamp: string;
  metadata?: Record<string, unknown>;
}
