/**
 * TITANE_INFINITY v30.0.0 - Proprietary License
 * Copyright 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * XP Engine compatibility adapter.
 *
 * Runtime XP truth is owned by `experienceService` (`ExperienceState`) and the
 * canonical XP math in `services/xp/xpCanonical`. This adapter keeps legacy
 * callers on `xpEngine.*` without creating a second persisted progression
 * state.
 */

import type {
  ProgressionMilestone,
  ProgressionState,
  XPEvent,
  XPSource,
} from '@/cognitive/types';
import {
  awardExperience,
  getExperienceState,
  initExperienceService,
  resetExperienceState,
  subscribeToExperience,
} from '@/services/experienceService';
import type { ExperienceGain, ExperienceState } from '@/types/experience';
import { createLogger } from '@/utils/logger';
import {
  calculateLevel as canonicalCalculateLevel,
  calculateProgress as canonicalCalculateProgress,
  xpForLevel as canonicalXpForLevel,
  xpInCurrentLevel as canonicalXpInCurrentLevel,
  xpToNextLevel as canonicalXpToNextLevel,
} from '@/services/xp/xpCanonical';

const logger = createLogger('XPEngine');

const XP_PER_LEVEL = 500;
const MAX_HISTORY = 100;

const XP_SOURCES = new Set<string>([
  'chat_message',
  'chat_quality_bonus',
  'chat_titane_response',
  'chat_conversation_streak',
  'file_import',
  'automation_success',
  'diagnostic_pass',
  'self_repair',
  'system_fix',
  'milestone_unlock',
  'daily_login',
  'evolution_cycle',
  'knowledge_ingest',
  'manual',
]);

const XP_AMOUNTS: Record<XPSource, number> = {
  chat_message: 5,
  chat_quality_bonus: 0,
  chat_titane_response: 3,
  chat_conversation_streak: 8,
  file_import: 20,
  automation_success: 15,
  diagnostic_pass: 10,
  self_repair: 50,
  system_fix: 25,
  milestone_unlock: 0,
  daily_login: 10,
  evolution_cycle: 30,
  knowledge_ingest: 15,
  manual: 0,
};

const DEFAULT_MILESTONES: ProgressionMilestone[] = [
  {
    id: 'first_message',
    name: 'Premier Contact',
    description: 'Envoyez votre premier message a TITANE',
    requiredXP: 5,
    requiredLevel: 1,
    icon: 'message',
    reward: '+10 XP bonus',
  },
  {
    id: 'first_file',
    name: 'Importateur',
    description: 'Importez votre premier fichier',
    requiredXP: 20,
    requiredLevel: 1,
    icon: 'file',
    reward: '+25 XP bonus',
  },
  {
    id: 'level_5',
    name: 'Apprenti',
    description: 'Atteignez le niveau 5',
    requiredXP: 2500,
    requiredLevel: 5,
    icon: 'level',
    reward: 'Badge Apprenti',
  },
  {
    id: 'level_10',
    name: 'Initie',
    description: 'Atteignez le niveau 10',
    requiredXP: 5000,
    requiredLevel: 10,
    icon: 'level',
    reward: 'Badge Initie',
  },
  {
    id: 'level_25',
    name: 'Expert',
    description: 'Atteignez le niveau 25',
    requiredXP: 12500,
    requiredLevel: 25,
    icon: 'expert',
    reward: 'Badge Expert',
  },
  {
    id: 'level_50',
    name: 'Maitre TITANE',
    description: 'Atteignez le niveau 50',
    requiredXP: 25000,
    requiredLevel: 50,
    icon: 'master',
    reward: 'Badge Maitre',
  },
  {
    id: 'streak_7',
    name: 'Perseverant',
    description: "7 jours consecutifs d'utilisation",
    requiredXP: 0,
    requiredLevel: 1,
    icon: 'streak',
    reward: '+100 XP bonus',
  },
  {
    id: 'knowledge_10',
    name: 'Bibliothecaire',
    description: 'Importez 10 documents',
    requiredXP: 200,
    requiredLevel: 1,
    icon: 'knowledge',
    reward: '+50 XP bonus',
  },
  {
    id: 'auto_repair',
    name: 'Auto-guerison',
    description: "TITANE s'auto-repare avec succes",
    requiredXP: 0,
    requiredLevel: 1,
    icon: 'repair',
    reward: '+75 XP bonus',
  },
  {
    id: 'evolution_cycle',
    name: 'Evolution',
    description: "Completez un cycle d'evolution",
    requiredXP: 0,
    requiredLevel: 1,
    icon: 'evolution',
    reward: '+100 XP bonus',
  },
];

function normalizeSource(source: string): XPSource {
  return XP_SOURCES.has(source) ? (source as XPSource) : 'manual';
}

function mapSourceToDomain(source: string): string {
  const map: Record<string, string> = {
    message_user: 'chat',
    chat_message: 'chat',
    chat_quality_bonus: 'chat',
    chat_conversation_streak: 'chat',
    response_ai: 'cognitive',
    chat_titane_response: 'cognitive',
    file_import: 'memory',
    file_analysis: 'memory',
    memory_ingestion: 'memory',
    memory_promote: 'memory',
    memory_archive: 'memory',
    knowledge_ingest: 'memory',
    system_event: 'system',
    system_update: 'system',
    engine_load: 'system',
    automation_success: 'system',
    diagnostic_pass: 'system',
    self_repair: 'system',
    system_fix: 'system',
    evolution_cycle: 'system',
    daily_login: 'system',
  };
  return map[source] || 'system';
}

function toProgressionEvent(event: ExperienceGain): XPEvent {
  return {
    id: event.id,
    timestamp: event.timestamp,
    amount: event.amount,
    source: normalizeSource(event.source),
    description:
      typeof event.metadata?.description === 'string'
        ? event.metadata.description
        : event.domainId,
    metadata: event.metadata,
  };
}

function countChatMessages(history: ExperienceGain[]): number {
  return history.filter(event => event.source === 'chat_message').length;
}

function countKnowledgeEvents(history: ExperienceGain[]): number {
  return history.filter(event =>
    ['knowledge_ingest', 'file_import', 'memory_ingestion'].includes(event.source)
  ).length;
}

function countConsecutiveActiveDays(history: ExperienceGain[]): number {
  const days = Array.from(
    new Set(
      history.map(event => new Date(event.timestamp).toISOString().slice(0, 10))
    )
  ).sort((a, b) => b.localeCompare(a));

  if (days.length === 0) {
    return 0;
  }

  let streak = 1;
  let cursor = new Date(`${days[0]}T00:00:00.000Z`).getTime();

  for (let index = 1; index < days.length; index += 1) {
    const expected = new Date(cursor - 86_400_000).toISOString().slice(0, 10);
    if (days[index] !== expected) {
      break;
    }
    streak += 1;
    cursor -= 86_400_000;
  }

  return streak;
}

function deriveQualityState(history: ExperienceGain[]): {
  lastQualityTier: string | null;
  qualityTierCounts: Record<string, number>;
} {
  const qualityTierCounts: Record<string, number> = {};
  let lastQualityTier: string | null = null;

  for (const event of history) {
    if (event.source !== 'chat_quality_bonus') {
      continue;
    }

    const tier = event.metadata?.qualityTier;
    if (typeof tier !== 'string') {
      continue;
    }

    qualityTierCounts[tier] = (qualityTierCounts[tier] ?? 0) + 1;
    if (lastQualityTier === null) {
      lastQualityTier = tier;
    }
  }

  return { lastQualityTier, qualityTierCounts };
}

function deriveMilestones(input: {
  state: ExperienceState;
  level: number;
  totalXP: number;
  chatMessageCount: number;
  streakDays: number;
}): { milestones: ProgressionMilestone[]; unlockedMilestones: string[] } {
  const knowledgeEvents = countKnowledgeEvents(input.state.history);
  const hasFileImport = input.state.history.some(event => event.source === 'file_import');
  const sourceSet = new Set(input.state.history.map(event => event.source));

  const unlockedMilestones: string[] = [];
  const milestones = DEFAULT_MILESTONES.map(milestone => {
    let unlocked = input.level >= milestone.requiredLevel && input.totalXP >= milestone.requiredXP;

    if (milestone.id === 'first_message') {
      unlocked = input.chatMessageCount >= 1;
    } else if (milestone.id === 'first_file') {
      unlocked = hasFileImport;
    } else if (milestone.id === 'streak_7') {
      unlocked = input.streakDays >= 7;
    } else if (milestone.id === 'knowledge_10') {
      unlocked = knowledgeEvents >= 10;
    } else if (milestone.id === 'auto_repair') {
      unlocked = sourceSet.has('self_repair');
    } else if (milestone.id === 'evolution_cycle') {
      unlocked = sourceSet.has('evolution_cycle');
    }

    if (unlocked) {
      unlockedMilestones.push(milestone.id);
    }

    return {
      ...milestone,
      unlockedAt: unlocked ? input.state.lastUpdated : undefined,
    };
  });

  return { milestones, unlockedMilestones };
}

export function createProgressionStateFromExperience(
  experienceState: ExperienceState
): ProgressionState {
  const totalXP = experienceState.totalXp;
  const level = canonicalCalculateLevel(totalXP);
  const chatMessageCount = countChatMessages(experienceState.history);
  const streakDays = countConsecutiveActiveDays(experienceState.history);
  const qualityState = deriveQualityState(experienceState.history);
  const milestoneState = deriveMilestones({
    state: experienceState,
    level,
    totalXP,
    chatMessageCount,
    streakDays,
  });

  return {
    level,
    totalXP,
    xpInCurrentLevel: canonicalXpInCurrentLevel(totalXP, level),
    xpToNextLevel: canonicalXpToNextLevel(totalXP, level),
    chatMessageCount,
    lastQualityTier: qualityState.lastQualityTier,
    qualityTierCounts: qualityState.qualityTierCounts,
    milestones: milestoneState.milestones,
    unlockedMilestones: milestoneState.unlockedMilestones,
    lastXPGain: experienceState.history[0]
      ? toProgressionEvent(experienceState.history[0])
      : null,
    streakDays,
    lastActiveDate:
      experienceState.history[0] != null
        ? new Date(experienceState.history[0].timestamp).toISOString().slice(0, 10)
        : new Date(experienceState.lastUpdated).toISOString().slice(0, 10),
    createdAt:
      experienceState.history[experienceState.history.length - 1]?.timestamp ??
      experienceState.lastUpdated,
    updatedAt: experienceState.lastUpdated,
  };
}

function createDefaultState(): ProgressionState {
  return createProgressionStateFromExperience(getExperienceState());
}

class XPEngine {
  private state: ProgressionState = createDefaultState();
  private initialized = false;
  private serviceUnsubscribe: (() => void) | null = null;
  private listeners: Set<(state: ProgressionState) => void> = new Set();

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await initExperienceService();
    this.syncFromExperience(getExperienceState());

    if (this.serviceUnsubscribe === null) {
      this.serviceUnsubscribe = subscribeToExperience(state => {
        this.syncFromExperience(state);
        this.notifyListeners();
      });
    }

    this.initialized = true;
    this.notifyListeners();
  }

  async addXP(
    amount: number,
    source: XPSource,
    description: string,
    metadata?: Record<string, unknown>
  ): Promise<XPEvent> {
    const actualAmount = amount || XP_AMOUNTS[source] || 0;

    if (actualAmount <= 0) {
      throw new Error('Amount must be positive');
    }

    await initExperienceService();
    await awardExperience(mapSourceToDomain(source), actualAmount, source, {
      ...metadata,
      description,
    });
    this.syncFromExperience(getExperienceState());
    this.notifyListeners();

    const event =
      this.state.lastXPGain ??
      ({
        id: `xp_${Date.now()}`,
        timestamp: Date.now(),
        amount: actualAmount,
        source,
        description,
        metadata,
      } satisfies XPEvent);

    logger.info(
      `+${actualAmount} XP (${source}) -> Level ${this.state.level}, Total: ${this.state.totalXP}`
    );
    return event;
  }

  async gain(source: XPSource, description?: string): Promise<XPEvent> {
    const amount = XP_AMOUNTS[source] ?? 0;
    return this.addXP(amount, source, description || `Gain XP: ${source}`);
  }

  getProgressToNextLevel(): number {
    this.refreshSnapshot();
    return canonicalCalculateProgress(this.state.totalXP, this.state.level) * 100;
  }

  getState(): ProgressionState {
    this.refreshSnapshot();
    return { ...this.state };
  }

  getStats(): ProgressionState {
    return this.getState();
  }

  getLevel(): number {
    return this.getState().level;
  }

  getTotalXP(): number {
    return this.getState().totalXP;
  }

  getHistory(): XPEvent[] {
    return getExperienceState().history.slice(0, MAX_HISTORY).map(toProgressionEvent);
  }

  getMilestones(): ProgressionMilestone[] {
    return this.getState().milestones.map(milestone => ({ ...milestone }));
  }

  getUnlockedMilestones(): string[] {
    return [...this.getState().unlockedMilestones];
  }

  getStreak(): number {
    return this.getState().streakDays;
  }

  subscribe(listener: (state: ProgressionState) => void): () => void {
    this.listeners.add(listener);
    void this.initialize().catch(error =>
      logger.warn('Unable to initialize XP adapter subscription', error)
    );
    return () => this.listeners.delete(listener);
  }

  async reset(): Promise<void> {
    await resetExperienceState();
    this.syncFromExperience(getExperienceState());
    this.notifyListeners();
    logger.info('Etat XP reinitialise via experienceService');
  }

  private refreshSnapshot(): void {
    this.syncFromExperience(getExperienceState());
  }

  private syncFromExperience(state: ExperienceState): void {
    this.state = createProgressionStateFromExperience(state);
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }
}

export const xpEngine = new XPEngine();

if (typeof window !== 'undefined') {
  void xpEngine.initialize().catch(error =>
    logger.error('Erreur initialisation XP adapter:', error)
  );
}

export default xpEngine;

export function calculateLevel(totalXP: number): number {
  return canonicalCalculateLevel(totalXP);
}

export function xpForLevel(level: number): number {
  return canonicalXpForLevel(level);
}

export function xpToNextLevel(totalXP: number): number {
  const level = canonicalCalculateLevel(totalXP);
  return canonicalXpToNextLevel(totalXP, level);
}

export function levelProgress(totalXP: number): number {
  const level = canonicalCalculateLevel(totalXP);
  return canonicalCalculateProgress(totalXP, level) * 100;
}

export { XP_PER_LEVEL };
