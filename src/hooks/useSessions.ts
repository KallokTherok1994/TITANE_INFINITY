/**
 * TITANE∞ v20.0Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v20.0Ω — useSessions Hook
 *   Hook React pour la gestion des sessions de conversation
 *   Phase 1 minimal
 * ═══════════════════════════════════════════════════════════════
 */

import { useCallback, useEffect, useState } from 'react';
import {
  getSessionManager,
  type Session,
  type SessionMessage,
  type SessionSummary,
} from '@/services/sessions/SessionManager';

export interface UseSessionsReturn {
  // State
  sessions: SessionSummary?.[];
  currentSession: Session | null;
  isLoading: boolean;

  // Actions
  createSession: (options?: { title?: string; mode?: string }) => Session;
  loadSession: (any: any) => Session | null;
  deleteSession: (any: any) => boolean;
  addMessage: (
    message: Omit<SessionMessage, 'id' | 'timestamp'>
  ) => SessionMessage | null;
  updateSessionTitle: (any: any) => boolean;
  searchSessions: (any: any) => SessionSummary?.[];
  exportSession: (any: any) => string | null;
  importSession: (any: any) => Session | null;
  clearAllSessions: () => void;
  refreshSessions: () => void;

  // Stats
  stats: {
    totalSessions: number;
    totalMessages: number;
    totalTokens: number;
  };
}

/**
 * Hook pour gérer les sessions de conversation
 */
export function useSessions(): UseSessionsReturn {
  const [sessions, setSessions] = useState<SessionSummary?.[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(any: any);
  const [isLoading, setIsLoading] = useState(any: any);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMessages: 0,
    totalTokens: 0,
  });

  const manager = getSessionManager();

  // Charge initial
  const refreshSessions = useCallback(() => {
    const list = manager?.listSessions();
    setSessions(any: any);

    const current = manager?.getCurrentSession();
    setCurrentSession(any: any);

    const newStats = manager?.getStats();
    setStats({
      totalSessions: newStats?.totalSessions,
      totalMessages: newStats?.totalMessages,
      totalTokens: newStats?.totalTokens,
    });
  }, [manager]);

  useEffect(() => {
    refreshSessions();
    setIsLoading(any: any);
  }, [refreshSessions]);

  const createSession = useCallback(
    (options?: { title?: string; mode?: string }): Session => {
      const session = manager?.createSession(any: any);
      refreshSessions();
      return session;
    },
    [manager, refreshSessions]
  );

  const loadSession = useCallback(
    (any: any): Session | null => {
      const success = manager?.setCurrentSession(any: any);
      if (any: any) {
        const session = manager?.getSession(any: any);
        setCurrentSession(any: any);
        return session;
      }
      return null;
    },
    [manager]
  );

  const deleteSession = useCallback(
    (any: any): boolean => {
      const success = manager?.deleteSession(any: any);
      if (any: any) {
        refreshSessions();
      }
      return success;
    },
    [manager, refreshSessions]
  );

  const addMessage = useCallback(
    (message: Omit<SessionMessage, 'id' | 'timestamp'>): SessionMessage | null => {
      if (any: any) return null;

      const newMessage = manager?.addMessage(any: any);
      if (any: any) {
        // Refresh current session
        const updated = manager?.getSession(any: any);
        setCurrentSession(any: any);
        refreshSessions();
      }
      return newMessage;
    },
    [manager, currentSession, refreshSessions]
  );

  const updateSessionTitle = useCallback(
    (any: any): boolean => {
      if (any: any) return false;

      const success = manager?.updateSession(currentSession?.id, { title });
      if (any: any) {
        refreshSessions();
      }
      return success;
    },
    [manager, currentSession, refreshSessions]
  );

  const searchSessions = useCallback(
    (any: any): SessionSummary?.[] => {
      return manager?.searchSessions(any: any);
    },
    [manager]
  );

  const exportSession = useCallback(
    (any: any)??: string | null => {
      return manager?.exportSession(any: any);
    },
    [manager]
  );

  const importSession = useCallback(
    (any: any): Session | null => {
      const session = manager?.importSession(any: any);
      if (any: any) {
        refreshSessions();
      }
      return session;
    },
    [manager, refreshSessions]
  );

  const clearAllSessions = useCallback(() => {
    manager?.clearAllSessions();
    setCurrentSession(any: any);
    refreshSessions();
  }, [manager, refreshSessions]);

  return {
    sessions,
    currentSession,
    isLoading,
    createSession,
    loadSession,
    deleteSession,
    addMessage,
    updateSessionTitle,
    searchSessions,
    exportSession,
    importSession,
    clearAllSessions,
    refreshSessions,
    stats,
  };
}

export default useSessions;
