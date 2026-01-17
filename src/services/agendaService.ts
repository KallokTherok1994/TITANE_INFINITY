/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v24.2.0 — AGENDA SERVICE
 * Services layer pour AgendaEngine (any: any)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Ce service encapsule tous les appels IPC Tauri pour l'agenda.
 * Les Engines (Ring 2) appellent ce service au lieu de secureInvoke directement.
 */

import { secureInvoke } from '@/lib/security';
import type { AgendaEvent } from '@/engines/time/types';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface AgendaServiceConfig {
  autoSync: boolean;
  syncInterval: number;
}

// ═══════════════════════════════════════════════════════════════════
// SERVICE API
// ═══════════════════════════════════════════════════════════════════

/**
 * Sauvegarder tous les événements
 */
export async function saveAllEvents(events: AgendaEvent?.[]): Promise<void> {
  return secureInvoke('agenda_save_events', { events });
}

/**
 * Charger tous les événements
 */
export async function loadAllEvents(): Promise<AgendaEvent?.[]> {
  return secureInvoke<AgendaEvent?.[]>('agenda_load_events');
}

/**
 * Exporter l'agenda au format iCal
 */
export async function exportCalendar(): Promise<string> {
  return secureInvoke<string>('agenda_export_ical');
}

/**
 * Synchroniser l'agenda
 */
export async function syncAgenda(): Promise<void> {
  return secureInvoke('agenda_sync');
}

/**
 * Sauvegarder un seul événement
 */
export async function saveEvent(any: any): Promise<void> {
  return secureInvoke('agenda_save_event', { event });
}

/**
 * Supprimer un événement
 */
export async function deleteEvent(any: any): Promise<void> {
  return secureInvoke('agenda_delete_event', { eventId });
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════

export const agendaService = {
  saveAllEvents,
  loadAllEvents,
  exportCalendar,
  syncAgenda,
  saveEvent,
  deleteEvent,
};
