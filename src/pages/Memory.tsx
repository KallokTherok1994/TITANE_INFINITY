/**
 * TITANE∞ — Memory Route
 * Aligne la route /memory sur la même source de vérité persistante
 * que la section mémoire principale de TITANE.
 */

import { useEffect, useMemo, useState } from 'react';
import { MemorySection, type TitaneStats } from '@/components/sections';
import { xpEngine } from '@/cognitive/progression/xpEngine';
import { tauriClient } from '@/lib/tauriClient';
import type { MemoryStats } from '@/services/memory/persistentMemory.config';
import { normalizePersistentMemoryStats } from '@/services/memory/persistentMemory.normalize';
import { getExperienceState, initExperienceService } from '@/services/experienceService';

const FALLBACK_STATS: TitaneStats = {
  totalXP: 0,
  level: 1,
  chatMessageCount: 0,
  memoryShortTerm: 0,
  memoryMidTerm: 0,
  memoryLongTerm: 0,
  evolutionScore: 0,
};

export const Memory = () => {
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [xpState, setXpState] = useState<{
    totalXp: number;
    level: number;
    chatMessageCount: number;
  } | null>(null);

  const conversationId =
    typeof window !== 'undefined'
      ? (window.localStorage.getItem('titane_active_conversation_id') ?? undefined)
      : undefined;

  useEffect(() => {
    let isMounted = true;

    const loadMemoryStats = async () => {
      try {
        const stats = normalizePersistentMemoryStats(
          await tauriClient.persistentMemoryGetStats()
        ) as MemoryStats;
        if (isMounted) {
          setMemoryStats(stats);
        }
      } catch {
        if (isMounted) {
          setMemoryStats(null);
        }
      }
    };

    const loadXpState = async () => {
      try {
        await initExperienceService();
        const state = getExperienceState();
        const progression = xpEngine.getState();
        if (isMounted && state) {
          setXpState({
            totalXp: state.totalXp ?? 0,
            level: state.level ?? 1,
            chatMessageCount: progression?.chatMessageCount ?? 0,
          });
        }
      } catch {
        // XP service unavailable — keep fallback values
      }
    };

    void loadMemoryStats();
    void loadXpState();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo<TitaneStats>(
    () => ({
      ...FALLBACK_STATS,
      totalXP: xpState?.totalXp ?? 0,
      level: xpState?.level ?? 1,
      chatMessageCount: xpState?.chatMessageCount ?? 0,
      memoryShortTerm: memoryStats?.countByLevel?.session ?? 0,
      memoryMidTerm: memoryStats?.countByLevel?.intermediate ?? 0,
      memoryLongTerm: memoryStats?.countByLevel?.long_term ?? 0,
      evolutionScore: xpState?.totalXp
        ? Math.min(100, Math.round((xpState.totalXp / 250000) * 100))
        : 0,
    }),
    [memoryStats, xpState]
  );

  return (
    <div data-testid="page-memory">
      <MemorySection stats={stats} conversationId={conversationId} />
    </div>
  );
};

export default Memory;
