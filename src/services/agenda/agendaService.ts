/**
 * TITANE∞ — Agenda Service (Ring 3)
 * Wrapper I/O pour AgendaEngine (Ring 2)
 *
 * ARCHITECTURE:
 * - AgendaEngine (Ring 2) = Pure logic, pas d'I/O
 * - AgendaService (Ring 3) = I/O avec Tauri backend
 */

import { secureInvoke } from '@/lib/security';
import type { AgendaEvent } from '@/engines/time/types';

/**
 * Service Agenda — Opérations I/O
 */
export class AgendaService {
  /**
   * Sauvegarder un événement (backend Tauri)
   */
  static async saveEvent(event: AgendaEvent): Promise<void> {
    await secureInvoke('memory_agenda_save', { event });
  }

  /**
   * Charger les événements (backend Tauri)
   */
  static async loadEvents(): Promise<AgendaEvent[]> {
    return await secureInvoke<AgendaEvent[]>('memory_agenda_load', {});
  }

  /**
   * Supprimer un événement (backend Tauri)
   */
  static async deleteEvent(eventId: string): Promise<void> {
    await secureInvoke('memory_agenda_delete', { eventId });
  }

  /**
   * Mettre à jour un événement (backend Tauri)
   */
  static async updateEvent(event: AgendaEvent): Promise<void> {
    await secureInvoke('memory_agenda_update', { event });
  }
}
