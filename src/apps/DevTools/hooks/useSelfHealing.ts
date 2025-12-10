/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║   TITANE∞ v20.0 — useSelfHealing Hook                             ║
 * ║   Monitor self-healing incidents and actions                       ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import type { SelfHealingSnapshot, HealingEvent } from '../types';

export function useSelfHealing() {
  const [snapshot, setSnapshot] = useState<SelfHealingSnapshot | null>(null);
  const [recentEvents, setRecentEvents] = useState<HealingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshot = async () => {
    try {
      setLoading(true);
      const data = await invoke<SelfHealingSnapshot>('get_self_healing_history');
      setSnapshot(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch self-healing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshot();

    let unlisten: UnlistenFn | null = null;

    const setupListener = async () => {
      unlisten = await listen<HealingEvent>('self_healing_event', event => {
        const healingEvent = event.payload;
        setRecentEvents(prev => [healingEvent, ...prev].slice(0, 50));
        // Refresh snapshot to get updated stats
        fetchSnapshot();
      });
    };

    setupListener();

    return () => {
      unlisten?.();
    };
  }, []);

  const triggerHeal = async (action: string) => {
    try {
      await invoke('self_healing_trigger', { action });
    } catch (err) {
      console.error('Failed to trigger healing:', err);
    }
  };

  return {
    snapshot,
    recentEvents,
    loading,
    error,
    refreshSnapshot: fetchSnapshot,
    triggerHeal,
  };
}
