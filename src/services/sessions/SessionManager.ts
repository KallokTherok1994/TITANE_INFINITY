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
  messages: SessionMessage[];
  mode?: string;
  metadata?: {
    totalTokens?: number;
    providers?: string[];
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
  private currentSessionId: string | null = null;
  private initialized = false;
  // ✨ v24.2.1: Debounced storage to batch writes
  private debouncedStorage = getDebouncedStorage();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Charge les sessions depuis localStorage
   * ✨ v24.2.1: Uses debounced storage for consistent read-after-write
   */
  private loadFromStorage(): void {
    try {
      // ✨ v24.2.1: Use debounced storage (checks pending writes first)
      const stored = this.debouncedStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as Session[];
        for (const session of data) {
          this.sessions.set(session.id, session);
        }
      }

      const currentId = this.debouncedStorage.getItem(CURRENT_SESSION_KEY);
      if (currentId && this.sessions.has(currentId)) {
        this.currentSessionId = currentId;
      }

      this.initialized = true;
    } catch (error) {
      console.error('[SessionManager] Erreur chargement:', error);
      this.sessions = new Map();
    }
  }

  /**
   * Sauvegarde les sessions dans localStorage
   * ✨ v24.2.1: Uses debounced storage to batch writes
   */
  private saveToStorage(): void {
    try {
      const data = Array.from(this.sessions.values());
      // ✨ v24.2.1: Use debounced storage instead of direct localStorage
      this.debouncedStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      if (this.currentSessionId) {
        this.debouncedStorage.setItem(CURRENT_SESSION_KEY, this.currentSessionId);
      }
    } catch (error) {
      console.error('[SessionManager] Erreur sauvegarde:', error);
    }
  }

  /**
   * ✨ v24.2.1: Force flush pending writes (call before shutdown)
   */
  flushStorage(): void {
    this.debouncedStorage.flush();
  }

  /**
   * Génère un titre automatique basé sur le premier message
   */
  private generateTitle(content: string): string {
    const cleaned = content.trim().substring(0, 50);
    return cleaned.length < content.length ? `${cleaned}...` : cleaned;
  }

  /**
   * Crée une nouvelle session
   */
  createSession(options: { title?: string; mode?: string } = {}): Session {
    const now = Date.now();
    const id = crypto.randomUUID();

    const session: Session = {
      id,
      title: options.title || 'Nouvelle conversation',
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
      messages: [],
      mode: options.mode,
      metadata: {
        totalTokens: 0,
        providers: [],
      },
    };

    this.sessions.set(id, session);
    this.currentSessionId = id;

    // Limiter le nombre de sessions
    this.pruneOldSessions();
    this.saveToStorage();

    return session;
  }

  /**
   * Récupère une session par ID
   */
  getSession(id: string): Session | null {
    return this.sessions.get(id) || null;
  }

  /**
   * Récupère la session courante
   */
  getCurrentSession(): Session | null {
    if (!this.currentSessionId) return null;
    return this.sessions.get(this.currentSessionId) || null;
  }

  /**
   * Définit la session courante
   */
  setCurrentSession(id: string): boolean {
    if (!this.sessions.has(id)) return false;
    this.currentSessionId = id;
    this.saveToStorage();
    return true;
  }

  /**
   * Ajoute un message à une session
   */
  addMessage(
    sessionId: string,
    message: Omit<SessionMessage, 'id' | 'timestamp'>
  ): SessionMessage | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const now = Date.now();
    const newMessage: SessionMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: now,
    };

    session.messages.push(newMessage);
    session.messageCount = session.messages.length;
    session.updatedAt = now;

    // Mettre à jour le titre si c'est le premier message user
    if (
      message.role === 'user' &&
      session.messages.filter(m => m.role === 'user').length === 1
    ) {
      session.title = this.generateTitle(message.content);
    }

    // Mettre à jour les métadonnées
    if (message.metadata?.provider && session.metadata?.providers) {
      if (!session.metadata.providers.includes(message.metadata.provider)) {
        session.metadata.providers.push(message.metadata.provider);
      }
    }

    if (message.metadata?.tokenCount && session.metadata) {
      session.metadata.totalTokens =
        (session.metadata.totalTokens || 0) + message.metadata.tokenCount;
    }

    this.saveToStorage();
    return newMessage;
  }

  /**
   * Met à jour une session
   */
  updateSession(
    id: string,
    updates: Partial<Pick<Session, 'title' | 'mode' | 'metadata'>>
  ): boolean {
    const session = this.sessions.get(id);
    if (!session) return false;

    Object.assign(session, updates);
    session.updatedAt = Date.now();

    this.saveToStorage();
    return true;
  }

  /**
   * Supprime une session
   */
  deleteSession(id: string): boolean {
    if (!this.sessions.has(id)) return false;

    this.sessions.delete(id);

    if (this.currentSessionId === id) {
      // Sélectionner la session la plus récente
      const sessions = this.listSessions();
      this.currentSessionId = sessions.length > 0 ? sessions[0]!.id : null;
    }

    this.saveToStorage();
    return true;
  }

  /**
   * Liste toutes les sessions (résumés)
   */
  listSessions(): SessionSummary[] {
    const sessions = Array.from(this.sessions.values());

    // Trier par date de mise à jour (plus récent en premier)
    sessions.sort((a, b) => b.updatedAt - a.updatedAt);

    return sessions.map(s => ({
      id: s.id,
      title: s.title,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      messageCount: s.messageCount,
      preview: this.getPreview(s),
    }));
  }

  /**
   * Génère un aperçu de la session
   */
  private getPreview(session: Session): string {
    const lastUserMessage = [...session.messages].reverse().find(m => m.role === 'user');

    if (lastUserMessage) {
      return lastUserMessage.content.substring(0, 80);
    }

    return 'Conversation vide';
  }

  /**
   * Supprime les sessions les plus anciennes si limite atteinte
   */
  private pruneOldSessions(): void {
    if (this.sessions.size <= MAX_SESSIONS) return;

    const sessions = Array.from(this.sessions.values());
    sessions.sort((a, b) => a.updatedAt - b.updatedAt);

    const toDelete = sessions.slice(0, this.sessions.size - MAX_SESSIONS);
    for (const session of toDelete) {
      if (session.id !== this.currentSessionId) {
        this.sessions.delete(session.id);
      }
    }
  }

  /**
   * Exporte une session en JSON
   */
  exportSession(id: string): string | null {
    const session = this.sessions.get(id);
    if (!session) return null;

    return JSON.stringify(session, null, 2);
  }

  /**
   * Importe une session depuis JSON
   */
  importSession(json: string): Session | null {
    try {
      const data = JSON.parse(json) as Session;

      // Valider les champs requis
      if (!data.id || !data.messages || !Array.isArray(data.messages)) {
        throw new Error('Format de session invalide');
      }

      // Générer un nouvel ID pour éviter les conflits
      const newId = crypto.randomUUID();
      const now = Date.now();

      const session: Session = {
        ...data,
        id: newId,
        createdAt: now,
        updatedAt: now,
        title: `[Import] ${data.title}`,
      };

      this.sessions.set(newId, session);
      this.saveToStorage();

      return session;
    } catch (error) {
      console.error('[SessionManager] Erreur import:', error);
      return null;
    }
  }

  /**
   * Recherche dans les sessions
   */
  searchSessions(query: string): SessionSummary[] {
    const lowerQuery = query.toLowerCase();
    const results: SessionSummary[] = [];

    for (const session of this.sessions.values()) {
      // Recherche dans le titre
      if (session.title.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: session.id,
          title: session.title,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          messageCount: session.messageCount,
          preview: this.getPreview(session),
        });
        continue;
      }

      // Recherche dans les messages
      const matchingMessage = session.messages.find(m =>
        m.content.toLowerCase().includes(lowerQuery)
      );

      if (matchingMessage) {
        results.push({
          id: session.id,
          title: session.title,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          messageCount: session.messageCount,
          preview: matchingMessage.content.substring(0, 80),
        });
      }
    }

    // Trier par pertinence (date la plus récente)
    results.sort((a, b) => b.updatedAt - a.updatedAt);

    return results;
  }

  /**
   * Vide toutes les sessions
   * ✨ v24.2.1: Uses debounced storage for consistency
   */
  clearAllSessions(): void {
    this.sessions.clear();
    this.currentSessionId = null;
    // ✨ v24.2.1: Use debounced storage removeItem
    this.debouncedStorage.removeItem(STORAGE_KEY);
    this.debouncedStorage.removeItem(CURRENT_SESSION_KEY);
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

    for (const session of this.sessions.values()) {
      totalMessages += session.messageCount;
      totalTokens += session.metadata?.totalTokens || 0;

      if (oldest === null || session.createdAt < oldest) {
        oldest = session.createdAt;
      }
      if (newest === null || session.createdAt > newest) {
        newest = session.createdAt;
      }
    }

    return {
      totalSessions: this.sessions.size,
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
  if (!sessionManagerInstance) {
    sessionManagerInstance = new SessionManager();
  }
  return sessionManagerInstance;
}

export default SessionManager;
