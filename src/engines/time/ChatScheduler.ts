/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — CHAT SCHEDULER
 * Planification d'événements via langage naturel (Chat IA)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Fonctionnalités:
 * - Détection des blocs de commande agenda dans les réponses IA
 * - Parsing des commandes JSON structurées
 * - Exécution des commandes via Tauri
 * - Synchronisation automatique après actions
 * - Feedback utilisateur
 */

import type {
  AgendaCommand,
  AgendaCommandType,
  AgendaEvent,
  EventCategory,
  PriorityLevel,
} from './types';
import { agendaEngine } from './AgendaEngine';
// MIGRATION: Ring 3 I/O - Move I/O operations to AgendaService Tauri commands
// 1. Replace agendaEngine.* calls with secureInvoke('agenda_service::*', params)
// 2. Security: Use secureInvoke wrapper for rate limiting and validation
// 3. Commands: agenda_create_event, agenda_update_event, agenda_delete_event, agenda_get_events
// 4. Error handling: Catch Tauri command errors and propagate to UI with user-friendly messages
// 5. Synchronization: Ensure frontend state stays in sync with backend via Tauri events
// import { secureInvoke } from '@/lib/security';

// ═══════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════

/**
 * Délimiteurs pour les blocs de commande agenda
 */
const COMMAND_START_MARKER = '===AGENDA_COMMAND_V1===';
const COMMAND_END_MARKER = '===END_AGENDA_COMMAND_V1===';

/**
 * Patterns de détection alternative (regex)
 */
const COMMAND_PATTERNS = {
  // Pattern principal avec marqueurs
  structured: new RegExp(
    `${COMMAND_START_MARKER}\\s*([\\s\\S]*?)\\s*${COMMAND_END_MARKER}`,
    'g'
  ),
  // Pattern JSON inline (fallback)
  inlineJson: /\[AGENDA\]\s*(\{[\s\S]*?\})\s*\[\/AGENDA\]/g,
};

// ═══════════════════════════════════════════════════════════════════
// CHAT SCHEDULER CLASS
// ═══════════════════════════════════════════════════════════════════

/**
 * Résultat d'exécution d'une commande
 */
export interface CommandExecutionResult {
  success: boolean;
  command: AgendaCommand;
  event?: AgendaEvent;
  error?: string;
  message: string;
}

/**
 * Listener pour les exécutions de commandes
 */
type CommandListener = (result: CommandExecutionResult) => void;

/**
 * ChatScheduler v∞ — Planification via Chat IA TITANE∞
 */
export class ChatScheduler {
  private listeners: Set<CommandListener>;
  private lastCommands: AgendaCommand[];
  private enabled: boolean;

  constructor() {
    this.listeners = new Set();
    this.lastCommands = [];
    this.enabled = true;
  }

  // ═══════════════════════════════════════════════════════════════
  // DETECTION & PARSING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Détecte les blocs de commande dans une réponse IA
   */
  detectAgendaCommands(response: string): AgendaCommand[] {
    if (!this.enabled) return [];

    const commands: AgendaCommand[] = [];

    // Méthode 1: Pattern structuré avec marqueurs
    let match: RegExpExecArray | null;
    const structuredPattern = new RegExp(
      `${COMMAND_START_MARKER}\\s*([\\s\\S]*?)\\s*${COMMAND_END_MARKER}`,
      'g'
    );

    while ((match = structuredPattern.exec(response)) !== null) {
      const jsonStr = match[1].trim();
      const parsed = this.parseAgendaCommand(jsonStr);
      if (parsed) commands.push(parsed);
    }

    // Méthode 2: Pattern JSON inline (fallback)
    if (commands.length === 0) {
      const inlinePattern = /\[AGENDA\]\s*(\{[\s\S]*?\})\s*\[\/AGENDA\]/g;
      while ((match = inlinePattern.exec(response)) !== null) {
        const jsonStr = match[1].trim();
        const parsed = this.parseAgendaCommand(jsonStr);
        if (parsed) commands.push(parsed);
      }
    }

    this.lastCommands = commands;
    return commands;
  }

  /**
   * Parse une chaîne JSON en commande agenda
   */
  parseAgendaCommand(jsonStr: string): AgendaCommand | null {
    try {
      const obj = JSON.parse(jsonStr);

      // Validation minimale
      if (!obj.type || !this.isValidCommandType(obj.type)) {
        console.warn('[ChatScheduler] Type de commande invalide:', obj.type);
        return null;
      }

      // Construire la commande validée
      const command: AgendaCommand = {
        type: obj.type as AgendaCommandType,
        title: obj.title,
        start: obj.start,
        end: obj.end,
        fromEventId: obj.fromEventId,
        meta: obj.meta
          ? {
              durationMinutes: obj.meta.durationMinutes,
              category: obj.meta.category as EventCategory,
              priority: obj.meta.priority as PriorityLevel,
              description: obj.meta.description,
              tags: obj.meta.tags,
              recurrence: obj.meta.recurrence,
            }
          : undefined,
      };

      console.log('[ChatScheduler] ✅ Commande parsée:', command.type, command.title);
      return command;
    } catch (error) {
      console.error('[ChatScheduler] Erreur parsing JSON:', error);
      return null;
    }
  }

  /**
   * Vérifie si un type de commande est valide
   */
  private isValidCommandType(type: string): type is AgendaCommandType {
    return ['create', 'update', 'move', 'delete', 'query'].includes(type);
  }

  // ═══════════════════════════════════════════════════════════════
  // EXECUTION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Exécute une commande agenda
   */
  async executeAgendaCommand(command: AgendaCommand): Promise<CommandExecutionResult> {
    console.log('[ChatScheduler] 🚀 Exécution commande:', command.type);

    try {
      let result: CommandExecutionResult;

      switch (command.type) {
        case 'create':
          result = await this.executeCreate(command);
          break;
        case 'update':
          result = await this.executeUpdate(command);
          break;
        case 'move':
          result = await this.executeMove(command);
          break;
        case 'delete':
          result = await this.executeDelete(command);
          break;
        case 'query':
          result = await this.executeQuery(command);
          break;
        default:
          result = {
            success: false,
            command,
            error: `Type de commande non supporté: ${command.type}`,
            message: 'Commande non reconnue',
          };
      }

      // Notifier les listeners
      this.notifyListeners(result);

      // Synchroniser l'agenda après l'action
      if (result.success && command.type !== 'query') {
        await this.syncAgendaAfterAction();
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const result: CommandExecutionResult = {
        success: false,
        command,
        error: errorMessage,
        message: `Erreur lors de l'exécution: ${errorMessage}`,
      };
      this.notifyListeners(result);
      return result;
    }
  }

  /**
   * Exécute une commande de création
   */
  private async executeCreate(command: AgendaCommand): Promise<CommandExecutionResult> {
    if (!command.title || !command.start) {
      return {
        success: false,
        command,
        error: 'Titre et date de début requis pour créer un événement',
        message: 'Informations manquantes',
      };
    }

    // Calculer la date de fin si non fournie
    let endDateTime = command.end;
    if (!endDateTime) {
      const durationMinutes = command.meta?.durationMinutes || 60;
      const startDate = new Date(command.start);
      endDateTime = new Date(
        startDate.getTime() + durationMinutes * 60 * 1000
      ).toISOString();
    }

    try {
      // Créer via Tauri
      const event = await secureInvoke<AgendaEvent>('agenda_create_event', {
        title: command.title,
        description: command.meta?.description || '',
        startDateTime: command.start,
        endDateTime,
        category: command.meta?.category || 'work',
        priority: command.meta?.priority || 'medium',
        tags: command.meta?.tags || [],
      });

      return {
        success: true,
        command,
        event,
        message: `✅ Événement "${command.title}" créé avec succès`,
      };
    } catch (error) {
      // Fallback: créer localement
      const event = await agendaEngine.createQuickEvent(
        command.title,
        command.start,
        command.meta?.durationMinutes || 60,
        command.meta?.category || 'work'
      );

      return {
        success: true,
        command,
        event,
        message: `✅ Événement "${command.title}" créé (local)`,
      };
    }
  }

  /**
   * Exécute une commande de mise à jour
   */
  private async executeUpdate(command: AgendaCommand): Promise<CommandExecutionResult> {
    if (!command.fromEventId) {
      return {
        success: false,
        command,
        error: "ID d'événement requis pour la mise à jour",
        message: 'ID manquant',
      };
    }

    const updates: Partial<AgendaEvent> = {};
    if (command.title) updates.title = command.title;
    if (command.start) updates.startDateTime = command.start;
    if (command.end) updates.endDateTime = command.end;
    if (command.meta?.description) updates.description = command.meta.description;
    if (command.meta?.category) updates.category = command.meta.category;
    if (command.meta?.priority) updates.priority = command.meta.priority;
    if (command.meta?.tags) updates.tags = command.meta.tags;

    try {
      await secureInvoke('agenda_update_event', {
        eventId: command.fromEventId,
        updates,
      });

      const event = await agendaEngine.updateEvent(command.fromEventId, updates);

      return {
        success: true,
        command,
        event: event || undefined,
        message: `✅ Événement mis à jour`,
      };
    } catch (error) {
      const event = await agendaEngine.updateEvent(command.fromEventId, updates);
      return {
        success: !!event,
        command,
        event: event || undefined,
        message: event ? `✅ Événement mis à jour (local)` : 'Événement non trouvé',
      };
    }
  }

  /**
   * Exécute une commande de déplacement
   */
  private async executeMove(command: AgendaCommand): Promise<CommandExecutionResult> {
    if (!command.fromEventId || !command.start) {
      return {
        success: false,
        command,
        error: "ID d'événement et nouvelle date requis",
        message: 'Informations manquantes',
      };
    }

    try {
      await secureInvoke('agenda_move_event', {
        eventId: command.fromEventId,
        newStartDateTime: command.start,
        newEndDateTime: command.end,
      });

      const event = await agendaEngine.moveEvent(
        command.fromEventId,
        command.start,
        command.end
      );

      return {
        success: true,
        command,
        event: event || undefined,
        message: `✅ Événement déplacé`,
      };
    } catch (error) {
      const event = await agendaEngine.moveEvent(
        command.fromEventId,
        command.start,
        command.end
      );
      return {
        success: !!event,
        command,
        event: event || undefined,
        message: event ? `✅ Événement déplacé (local)` : 'Événement non trouvé',
      };
    }
  }

  /**
   * Exécute une commande de suppression
   */
  private async executeDelete(command: AgendaCommand): Promise<CommandExecutionResult> {
    if (!command.fromEventId) {
      return {
        success: false,
        command,
        error: "ID d'événement requis pour la suppression",
        message: 'ID manquant',
      };
    }

    try {
      await secureInvoke('agenda_delete_event', {
        eventId: command.fromEventId,
      });

      await agendaEngine.deleteEvent(command.fromEventId);

      return {
        success: true,
        command,
        message: `✅ Événement supprimé`,
      };
    } catch (error) {
      const deleted = await agendaEngine.deleteEvent(command.fromEventId);
      return {
        success: deleted,
        command,
        message: deleted ? `✅ Événement supprimé (local)` : 'Événement non trouvé',
      };
    }
  }

  /**
   * Exécute une commande de requête
   */
  private async executeQuery(command: AgendaCommand): Promise<CommandExecutionResult> {
    // Pour les requêtes, on retourne simplement les événements correspondants
    let events: AgendaEvent[] = [];

    if (command.start && command.end) {
      events = agendaEngine.getEventsInRange(
        new Date(command.start),
        new Date(command.end)
      );
    } else if (command.start) {
      events = agendaEngine.getEventsForDay(new Date(command.start));
    } else {
      events = agendaEngine.getEventsForDay(new Date());
    }

    return {
      success: true,
      command,
      message: `📋 ${events.length} événement(s) trouvé(s)`,
    };
  }

  /**
   * Synchronise l'agenda après une action
   */
  private async syncAgendaAfterAction(): Promise<void> {
    try {
      await agendaEngine.loadEvents();
      console.log('[ChatScheduler] 🔄 Agenda synchronisé');
    } catch (error) {
      console.warn('[ChatScheduler] Erreur sync:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // BATCH EXECUTION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Traite automatiquement une réponse IA complète
   */
  async processAIResponse(response: string): Promise<CommandExecutionResult[]> {
    const commands = this.detectAgendaCommands(response);
    const results: CommandExecutionResult[] = [];

    for (const command of commands) {
      const result = await this.executeAgendaCommand(command);
      results.push(result);
    }

    return results;
  }

  /**
   * Exécute plusieurs commandes en batch
   */
  async executeBatch(commands: AgendaCommand[]): Promise<CommandExecutionResult[]> {
    const results: CommandExecutionResult[] = [];

    for (const command of commands) {
      const result = await this.executeAgendaCommand(command);
      results.push(result);
    }

    return results;
  }

  // ═══════════════════════════════════════════════════════════════
  // CONFIG & STATE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Active/désactive le ChatScheduler
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    console.log('[ChatScheduler]', enabled ? '✅ Activé' : '❌ Désactivé');
  }

  /**
   * Vérifie si le ChatScheduler est actif
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Obtient les dernières commandes détectées
   */
  getLastCommands(): AgendaCommand[] {
    return [...this.lastCommands];
  }

  /**
   * Génère un template de commande pour l'IA
   */
  generateCommandTemplate(type: AgendaCommandType): string {
    const templates: Record<AgendaCommandType, object> = {
      create: {
        type: 'create',
        title: "Titre de l'événement",
        start: new Date().toISOString(),
        end: new Date(Date.now() + 3600000).toISOString(),
        meta: {
          durationMinutes: 60,
          category: 'work',
          priority: 'medium',
          description: 'Description optionnelle',
          tags: ['tag1', 'tag2'],
        },
      },
      update: {
        type: 'update',
        fromEventId: 'evt_xxx',
        title: 'Nouveau titre',
        meta: {
          priority: 'high',
        },
      },
      move: {
        type: 'move',
        fromEventId: 'evt_xxx',
        start: new Date().toISOString(),
      },
      delete: {
        type: 'delete',
        fromEventId: 'evt_xxx',
      },
      query: {
        type: 'query',
        start: new Date().toISOString(),
        end: new Date(Date.now() + 86400000).toISOString(),
      },
    };

    return `${COMMAND_START_MARKER}\n${JSON.stringify(templates[type], null, 2)}\n${COMMAND_END_MARKER}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // LISTENERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Ajoute un listener pour les résultats de commandes
   */
  subscribe(listener: CommandListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notifie tous les listeners
   */
  private notifyListeners(result: CommandExecutionResult): void {
    this.listeners.forEach(listener => {
      try {
        listener(result);
      } catch (error) {
        console.error('[ChatScheduler] Erreur listener:', error);
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════

/**
 * Instance singleton du ChatScheduler
 */
export const chatScheduler = new ChatScheduler();

/**
 * Constantes exportées
 */
export const ChatSchedulerUtils = {
  COMMAND_START_MARKER,
  COMMAND_END_MARKER,
  COMMAND_PATTERNS,
};
