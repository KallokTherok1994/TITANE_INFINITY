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
  sessions: SessionSummary[];
  currentSession: Session | null;
  isLoading: boolean;

  // Actions
  createSession: (options?: { title?: string; mode?: string }) => Session;
  loadSession: (id: string) => Session | null;
  deleteSession: (id: string) => boolean;
  addMessage: (
    message: Omit<SessionMessage, 'id' | 'timestamp'>
  ) => SessionMessage | null;
  updateSessionTitle: (title: string) => boolean;
  searchSessions: (query: string) => SessionSummary[];
  exportSession: (id: string) => string | null;
  importSession: (json: string) => Session | null;
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
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMessages: 0,
    totalTokens: 0,
  });

  const manager = getSessionManager();

  // Charge initial
  const refreshSessions = useCallback(() => {
    const list = manager.listSessions();
    setSessions(list);

    const current = manager.getCurrentSession();
    setCurrentSession(current);

    const newStats = manager.getStats();
    setStats({
      totalSessions: newStats.totalSessions,
      totalMessages: newStats.totalMessages,
      totalTokens: newStats.totalTokens,
    });
  }, [manager]);

  useEffect(() => {
    refreshSessions();
    setIsLoading(false);
  }, [refreshSessions]);

  const createSession = useCallback(
    (options?: { title?: string; mode?: string }): Session => {
      const session = manager.createSession(options);
      refreshSessions();
      return session;
    },
    [manager, refreshSessions]
  );

  const loadSession = useCallback(
    (id: string): Session | null => {
      const success = manager.setCurrentSession(id);
      if (success) {
        const session = manager.getSession(id);
        setCurrentSession(session);
        return session;
      }
      return null;
    },
    [manager]
  );

  const deleteSession = useCallback(
    (id: string): boolean => {
      const success = manager.deleteSession(id);
      if (success) {
        refreshSessions();
      }
      return success;
    },
    [manager, refreshSessions]
  );

  const addMessage = useCallback(
    (message: Omit<SessionMessage, 'id' | 'timestamp'>): SessionMessage | null => {
      if (!currentSession) return null;

      const newMessage = manager.addMessage(currentSession.id, message);
      if (newMessage) {
        // Refresh current session
        const updated = manager.getSession(currentSession.id);
        setCurrentSession(updated);
        refreshSessions();
      }
      return newMessage;
    },
    [manager, currentSession, refreshSessions]
  );

  const updateSessionTitle = useCallback(
    (title: string): boolean => {
      if (!currentSession) return false;

      const success = manager.updateSession(currentSession.id, { title });
      if (success) {
        refreshSessions();
      }
      return success;
    },
    [manager, currentSession, refreshSessions]
  );

  const searchSessions = useCallback(
    (query: string): SessionSummary[] => {
      return manager.searchSessions(query);
    },
    [manager]
  );

  const exportSession = useCallback(
    (id: string): string | null => {
      return manager.exportSession(id);
    },
    [manager]
  );

  const importSession = useCallback(
    (json: string): Session | null => {
      const session = manager.importSession(json);
      if (session) {
        refreshSessions();
      }
      return session;
    },
    [manager, refreshSessions]
  );

  const clearAllSessions = useCallback(() => {
    manager.clearAllSessions();
    setCurrentSession(null);
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
