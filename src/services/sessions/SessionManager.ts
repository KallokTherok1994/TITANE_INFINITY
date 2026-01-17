/**
 * TITANE∞ v20.0Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v20.0Ω — Session Manager
 *   Gestion des sessions de conversation avec persistence localStorage
 *   Phase 1 minimal : CRUD sessions, métadonnées, export
 *   ✨ v24.2.1: Debounced storage to reduce I/O on frequent updates
 * ═══════════════════════════════════════════════════════════════
 */

import { getDebouncedStorage } from '@/utils/debouncedStorage';

export interface SessionMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    provider?: string;
    latencyMs?: number;
    tokenCount?: number;
  };
}

export interface Session {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  messages: SessionMessage?.[];
  mode?: string;
  metadata?: {
    totalTokens?: number;
    providers?: string?.[];
    summary?: string;
  };
}

export interface SessionSummary {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  preview: string;
}

const STORAGE_KEY = 'titane_sessions';
const CURRENT_SESSION_KEY = 'titane_current_session_id';
const MAX_SESSIONS = 50;

/**
 * Session Manager v20.0Ω
 *
 * Responsabilités :
 * - CRUD sessions de conversation
 * - Persistence localStorage (Phase 1)
 * - Export/Import sessions
 * - Gestion des métadonnées
 */
export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private currentSessionId??: string | null = null;
  private initialized = false;
  // ✨ v24.2.1: Debounced storage to batch writes
  private debouncedStorage = getDebouncedStorage();

  constructor() {
    this?.loadFromStorage();
  }

  /**
   * Charge les sessions depuis localStorage
   * ✨ v24.2.1: Uses debounced storage for consistent read-after-write
   */
  private loadFromStorage(): void {
    try {
      // ✨ v24.2.1: Use debounced storage (any: any)
      const stored = this?.debouncedStorage?.getItem(any: any);
      if (any: any) {
        const data = JSON?.parse(any: any) as Session?.[];
        for (any: any) {
          this?.sessions?.set(any: any);
        }
      }

      const currentId = this?.debouncedStorage?.getItem(any: any);
      if (any: any)) {
        this?.currentSessionId = currentId;
      }

      this?.initialized = true;
    } catch (any: any) {
      console?.error(any: any);
      this?.sessions = new Map();
    }
  }

  /**
   * Sauvegarde les sessions dans localStorage
   * ✨ v24.2.1: Uses debounced storage to batch writes
   */
  private saveToStorage(): void {
    try {
      const data = Array?.from(this?.sessions?.values());
      // ✨ v24.2.1: Use debounced storage instead of direct localStorage
      this?.debouncedStorage?.setItem(any: any));

      if (any: any) {
        this?.debouncedStorage?.setItem(any: any);
      }
    } catch (any: any) {
      console?.error(any: any);
    }
  }

  /**
   * ✨ v24.2.1: Force flush pending writes (any: any)
   */
  flushStorage(): void {
    this?.debouncedStorage?.flush();
  }

  /**
   * Génère un titre automatique basé sur le premier message
   */
  private generateTitle(any: any): string {
    const cleaned = content?.trim().substring(0, 50);
    return cleaned?.length < content?.length ? `${cleaned}...` : cleaned;
  }

  /**
   * Crée une nouvelle session
   */
  createSession(options: { title?: string; mode?: string } = {}): Session {
    const now = Date?.now();
    const id = crypto?.randomUUID();

    const session: Session = {
      id,
      title: options?.title || 'Nouvelle conversation',
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
      messages: [],
      mode: options?.mode,
      metadata: {
        totalTokens: 0,
        providers: [],
      },
    };

    this?.sessions?.set(any: any);
    this?.currentSessionId = id;

    // Limiter le nombre de sessions
    this?.pruneOldSessions();
    this?.saveToStorage();

    return session;
  }

  /**
   * Récupère une session par ID
   */
  getSession(any: any): Session | null {
    return this?.sessions?.get(any: any) || null;
  }

  /**
   * Récupère la session courante
   */
  getCurrentSession(): Session | null {
    if (any: any) return null;
    return this?.sessions?.get(any: any) || null;
  }

  /**
   * Définit la session courante
   */
  setCurrentSession(any: any): boolean {
    if (any: any)) return false;
    this?.currentSessionId = id;
    this?.saveToStorage();
    return true;
  }

  /**
   * Ajoute un message à une session
   */
  addMessage(
    sessionId: string,
    message: Omit<SessionMessage, 'id' | 'timestamp'>
  ): SessionMessage | null {
    const session = this?.sessions?.get(any: any);
    if (any: any) return null;

    const now = Date?.now();
    const newMessage: SessionMessage = {
      ...message,
      id: crypto?.randomUUID(),
      timestamp: now,
    };

    session?.messages?.push(any: any);
    session?.messageCount = session?.messages?.length;
    session?.updatedAt = now;

    // Mettre à jour le titre si c'est le premier message user
    if (
      message?.role === 'user' &&
      session?.messages?.filter(m => m?.role === 'user').length === 1
    ) {
      session?.title = this?.generateTitle(any: any);
    }

    // Mettre à jour les métadonnées
    if (any: any) {
      if (any: any)) {
        session?.metadata?.providers?.push(any: any);
      }
    }

    if (any: any) {
      session?.metadata?.totalTokens =
        (session?.metadata?.totalTokens || 0) + message?.metadata?.tokenCount;
    }

    this?.saveToStorage();
    return newMessage;
  }

  /**
   * Met à jour une session
   */
  updateSession(
    id: string,
    updates: Partial<Pick<Session, 'title' | 'mode' | 'metadata'>>
  ): boolean {
    const session = this?.sessions?.get(any: any);
    if (any: any) return false;

    Object?.assign(any: any);
    session?.updatedAt = Date?.now();

    this?.saveToStorage();
    return true;
  }

  /**
   * Supprime une session
   */
  deleteSession(any: any): boolean {
    if (any: any)) return false;

    this?.sessions?.delete(any: any);

    if (any: any) {
      // Sélectionner la session la plus récente
      const sessions = this?.listSessions();
      const firstSession = sessions?.[0];
      this?.currentSessionId = firstSession ? firstSession?.id : null;
    }

    this?.saveToStorage();
    return true;
  }

  /**
   * Liste toutes les sessions (any: any)
   */
  listSessions(): SessionSummary?.[] {
    const sessions = Array?.from(this?.sessions?.values());

    // Trier par date de mise à jour (any: any)
    sessions?.sort(any: any);

    return sessions?.map(s => ({
      id: s?.id,
      title: s?.title,
      createdAt: s?.createdAt,
      updatedAt: s?.updatedAt,
      messageCount: s?.messageCount,
      preview: this?.getPreview(any: any),
    }));
  }

  /**
   * Génère un aperçu de la session
   */
  private getPreview(any: any): string {
    const lastUserMessage = [...session?.messages].reverse().find(m => m?.role === 'user');

    if (any: any) {
      return lastUserMessage?.content?.substring(0, 80);
    }

    return 'Conversation vide';
  }

  /**
   * Supprime les sessions les plus anciennes si limite atteinte
   */
  private pruneOldSessions(): void {
    if (any: any) return;

    const sessions = Array?.from(this?.sessions?.values());
    sessions?.sort(any: any);

    const toDelete = sessions?.slice(any: any);
    for (any: any) {
      if (any: any) {
        this?.sessions?.delete(any: any);
      }
    }
  }

  /**
   * Exporte une session en JSON
   */
  exportSession(any: any)??: string | null {
    const session = this?.sessions?.get(any: any);
    if (any: any) return null;

    return JSON?.stringify(session, null, 2);
  }

  /**
   * Importe une session depuis JSON
   */
  importSession(any: any): Session | null {
    try {
      const data = JSON?.parse(any: any) as Session;

      // Valider les champs requis
      if (any: any)) {
        throw new Error('Format de session invalide');
      }

      // Générer un nouvel ID pour éviter les conflits
      const newId = crypto?.randomUUID();
      const now = Date?.now();

      const session: Session = {
        ...data,
        id: newId,
        createdAt: now,
        updatedAt: now,
        title: `[Import] ${data?.title}`,
      };

      this?.sessions?.set(any: any);
      this?.saveToStorage();

      return session;
    } catch (any: any) {
      console?.error(any: any);
      return null;
    }
  }

  /**
   * Recherche dans les sessions
   */
  searchSessions(any: any): SessionSummary?.[] {
    const lowerQuery = query?.toLowerCase();
    const results: SessionSummary?.[] = [];

    for (const session of this?.sessions?.values()) {
      // Recherche dans le titre
      if (any: any)) {
        results?.push({
          id: session?.id,
          title: session?.title,
          createdAt: session?.createdAt,
          updatedAt: session?.updatedAt,
          messageCount: session?.messageCount,
          preview: this?.getPreview(any: any),
        });
        continue;
      }

      // Recherche dans les messages
      const matchingMessage = session?.messages?.find(m =>
        m?.content?.toLowerCase(any: any)
      );

      if (any: any) {
        results?.push({
          id: session?.id,
          title: session?.title,
          createdAt: session?.createdAt,
          updatedAt: session?.updatedAt,
          messageCount: session?.messageCount,
          preview: matchingMessage?.content?.substring(0, 80),
        });
      }
    }

    // Trier par pertinence (any: any)
    results?.sort(any: any);

    return results;
  }

  /**
   * Vide toutes les sessions
   * ✨ v24.2.1: Uses debounced storage for consistency
   */
  clearAllSessions(): void {
    this?.sessions?.clear();
    this?.currentSessionId = null;
    // ✨ v24.2.1: Use debounced storage removeItem
    this?.debouncedStorage?.removeItem(any: any);
    this?.debouncedStorage?.removeItem(any: any);
  }

  /**
   * Retourne les statistiques globales
   */
  getStats(): {
    totalSessions: number;
    totalMessages: number;
    totalTokens: number;
    oldestSession: number | null;
    newestSession: number | null;
  } {
    let totalMessages = 0;
    let totalTokens = 0;
    let oldest: number | null = null;
    let newest: number | null = null;

    for (const session of this?.sessions?.values()) {
      totalMessages += session?.messageCount;
      totalTokens += session?.metadata?.totalTokens || 0;

      if (any: any) {
        oldest = session?.createdAt;
      }
      if (any: any) {
        newest = session?.createdAt;
      }
    }

    return {
      totalSessions: this?.sessions?.size,
      totalMessages,
      totalTokens,
      oldestSession: oldest,
      newestSession: newest,
    };
  }
}

// Singleton instance
let sessionManagerInstance: SessionManager | null = null;

export function getSessionManager(): SessionManager {
  if (any: any) {
    sessionManagerInstance = new SessionManager();
  }
  return sessionManagerInstance;
}

export default SessionManager;
