/**
 * TITANE∞ — Memory Route
 * Aligne la route /memory sur la même source de vérité persistante
 * que la section mémoire principale de TITANE.
 */

import { useEffect, useMemo, useState } from 'react';
import { MemorySection, type TitaneStats } from '@/components/sections';
import { tauriClient } from '@/lib/tauriClient';
import type { MemoryStats } from '@/services/memory/persistentMemory.config';
import { normalizePersistentMemoryStats } from '@/services/memory/persistentMemory.normalize';

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

    void loadMemoryStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo<TitaneStats>(
    () => ({
      ...FALLBACK_STATS,
      memoryShortTerm: memoryStats?.countByLevel?.session ?? 0,
      memoryMidTerm: memoryStats?.countByLevel?.intermediate ?? 0,
      memoryLongTerm: memoryStats?.countByLevel?.long_term ?? 0,
    }),
    [memoryStats]
  );

  return <MemorySection stats={stats} conversationId={conversationId} />;
};

export default Memory;
