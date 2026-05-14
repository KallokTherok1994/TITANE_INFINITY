/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 — AGENDA SERVICE
 * Services layer pour AgendaEngine (conformité ARCHITECTURE_RINGS)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Ce service encapsule tous les appels IPC Tauri pour l'agenda.
 * Les Engines (Ring 2) appellent ce service au lieu de secureInvoke directement.
 */

import { secureInvoke } from '@/lib/security';
import type { AgendaEvent } from '@/engines/time/types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AgendaService');

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface AgendaServiceConfig {
  autoSync: boolean;
  syncInterval: number;
}

type AgendaEventsEnvelope = {
  ok?: boolean;
  content?: AgendaEvent[] | null;
  error?: unknown;
  fallback?: boolean;
};

function extractAgendaEvents(response: unknown): AgendaEvent[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (!response || typeof response !== 'object') {
    return [];
  }

  const envelope = response as AgendaEventsEnvelope;
  if (Array.isArray(envelope.content)) {
    return envelope.content;
  }

  if (envelope.ok === false || envelope.fallback === true) {
    logger.warn('[AgendaService] Agenda load fallback/empty envelope; returning []', {
      hasError: Boolean(envelope.error),
      fallback: envelope.fallback === true,
    });
    return [];
  }

  logger.warn('[AgendaService] Agenda load returned unexpected shape; returning []');
  return [];
}

// ═══════════════════════════════════════════════════════════════════
// SERVICE API
// ═══════════════════════════════════════════════════════════════════

/**
 * Sauvegarder tous les événements
 */
export async function saveAllEvents(events: AgendaEvent[]): Promise<void> {
  return secureInvoke('agenda_save_events', { events });
}

/**
 * Charger tous les événements
 */
export async function loadAllEvents(): Promise<AgendaEvent[]> {
  const response = await secureInvoke<AgendaEvent[] | AgendaEventsEnvelope>(
    'agenda_load_events'
  );
  return extractAgendaEvents(response);
}

export async function syncAgenda(): Promise<void> {
  return secureInvoke('agenda_sync');
}

/**
 * Sauvegarder un seul événement
 */
export async function saveEvent(event: AgendaEvent): Promise<void> {
  return secureInvoke('agenda_save_event', { event });
}

/**
 * Supprimer un événement
 */
export async function deleteEvent(eventId: string): Promise<void> {
  return secureInvoke('agenda_delete_event', { eventId });
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════

export const agendaService = {
  saveAllEvents,
  loadAllEvents,
  syncAgenda,
  saveEvent,
  deleteEvent,
};
