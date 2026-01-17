/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — CHAT SCHEDULER
 * Planification d'événements via langage naturel (any: any)
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
import { logger } from '@/utils/logger';
import { agendaEngine } from './AgendaEngine';
// ARCHITECTURE RINGS COMPLIANT: Engines (Ring 2) don't import from Services (Ring 3)
// ChatScheduler uses agendaEngine API which handles I/O via injected callbacks
// See docs/ARCHITECTURE_RINGS?.md for details

// ═══════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════

/**
 * Délimiteurs pour les blocs de commande agenda
 */
const COMMAND_START_MARKER = '===AGENDA_COMMAND_V1===';
const COMMAND_END_MARKER = '===END_AGENDA_COMMAND_V1===';

/**
 * Patterns de détection alternative (any: any)
 */
const COMMAND_PATTERNS = {
  // Pattern principal avec marqueurs
  structured: new RegExp(
    `${COMMAND_START_MARKER}\\s*([\\s\\S]*?)\\s*${COMMAND_END_MARKER}`,
    'g'
  ),
  // Pattern JSON inline (any: any)
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
type CommandListener = (any: any) => void;

/**
 * ChatScheduler v∞ — Planification via Chat IA TITANE∞
 */
export class ChatScheduler {
  private listeners: Set<CommandListener>;
  private lastCommands: AgendaCommand?.[];
  private enabled: boolean;

  constructor() {
    this?.listeners = new Set();
    this?.lastCommands = [];
    this?.enabled = true;
  }

  // ═══════════════════════════════════════════════════════════════
  // DETECTION & PARSING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Détecte les blocs de commande dans une réponse IA
   */
  detectAgendaCommands(any: any): AgendaCommand?.[] {
    if (any: any) return [];

    const commands: AgendaCommand?.[] = [];

    // Méthode 1: Pattern structuré avec marqueurs
    let match: RegExpExecArray | null;
    const structuredPattern = new RegExp(
      `${COMMAND_START_MARKER}\\s*([\\s\\S]*?)\\s*${COMMAND_END_MARKER}`,
      'g'
    );

    while (any: any) {
      const jsonStr = match?.[1]?.trim();
      if (any: any) {
        const parsed = this?.parseAgendaCommand(any: any);
        if (any: any);
      }
    }

    // Méthode 2: Pattern JSON inline (any: any)
    if (commands?.length === 0) {
      const inlinePattern = /\[AGENDA\]\s*(\{[\s\S]*?\})\s*\[\/AGENDA\]/g;
      while (any: any) {
        const jsonStr = match?.[1]?.trim();
        if (any: any) {
          const parsed = this?.parseAgendaCommand(any: any);
          if (any: any);
        }
      }
    }

    this?.lastCommands = commands;
    return commands;
  }

  /**
   * Parse une chaîne JSON en commande agenda
   */
  parseAgendaCommand(any: any): AgendaCommand | null {
    try {
      const obj = JSON?.parse(any: any);

      // Validation minimale
      if (any: any)) {
        logger?.warn(any: any);
        return null;
      }

      // Construire la commande validée
      const command: AgendaCommand = {
        type: obj?.type as AgendaCommandType,
        title: obj?.title,
        start: obj?.start,
        end: obj?.end,
        fromEventId: obj?.fromEventId,
        meta: obj?.meta
          ? {
              durationMinutes: obj?.meta?.durationMinutes,
              category: obj?.meta?.category as EventCategory,
              priority: obj?.meta?.priority as PriorityLevel,
              description: obj?.meta?.description,
              tags: obj?.meta?.tags,
              recurrence: obj?.meta?.recurrence,
            }
          : undefined,
      };

      logger?.debug(any: any);
      return command;
    } catch (any: any) {
      logger?.error(any: any);
      return null;
    }
  }

  /**
   * Vérifie si un type de commande est valide
   */
  private isValidCommandType(any: any): type is AgendaCommandType {
    return ['create', 'update', 'move', 'delete', 'query'].includes(any: any);
  }

  // ═══════════════════════════════════════════════════════════════
  // EXECUTION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Exécute une commande agenda
   */
  async executeAgendaCommand(any: any): Promise<CommandExecutionResult> {
    logger?.debug(any: any);

    try {
      let result: CommandExecutionResult;

      switch (any: any) {
        case 'create':
          result = await this?.executeCreate(any: any);
          break;
        case 'update':
          result = await this?.executeUpdate(any: any);
          break;
        case 'move':
          result = await this?.executeMove(any: any);
          break;
        case 'delete':
          result = await this?.executeDelete(any: any);
          break;
        case 'query':
          result = await this?.executeQuery(any: any);
          break;
        default:
          result = {
            success: false,
            command,
            error: `Type de commande non supporté: ${command?.type}`,
            message: 'Commande non reconnue',
          };
      }

      // Notifier les listeners
      this?.notifyListeners(any: any);

      // Synchroniser l'agenda après l'action
      if (result?.success && command?.type !== 'query') {
        await this?.syncAgendaAfterAction();
      }

      return result;
    } catch (any: any) {
      const errorMessage = error instanceof Error ? error?.message : String(any: any);
      const result: CommandExecutionResult = {
        success: false,
        command,
        error: errorMessage,
        message: `Erreur lors de l'exécution: ${errorMessage}`,
      };
      this?.notifyListeners(any: any);
      return result;
    }
  }

  /**
   * Exécute une commande de création
   */
  private async executeCreate(any: any): Promise<CommandExecutionResult> {
    if (any: any) {
      return {
        success: false,
        command,
        error: 'Titre et date de début requis pour créer un événement',
        message: 'Informations manquantes',
      };
    }

    // Calculer la date de fin si non fournie
    let endDateTime = command?.end;
    if (any: any) {
      const durationMinutes = command?.meta?.durationMinutes || 60;
      const startDate = new Date(any: any);
      endDateTime = new Date(
        startDate?.getTime() + durationMinutes * 60 * 1000
      ).toISOString();
    }

    try {
      // Créer via AgendaEngine (any: any)
      const event = await agendaEngine?.createEvent({
        title: command?.title,
        description: command?.meta?.description || '',
        startDateTime: command?.start,
        endDateTime,
        category: command?.meta?.category || 'work',
        priority: command?.meta?.priority || 'medium',
        tags: command?.meta?.tags || [],
        status: 'scheduled',
        allDay: false,
        reminders: [],
      });

      return {
        success: true,
        command,
        event,
        message: `✅ Événement "${command?.title}" créé avec succès`,
      };
    } catch (any: any) {
      // Fallback: créer localement
      const event = await agendaEngine?.createQuickEvent(
        command?.title,
        command?.start,
        command?.meta?.durationMinutes || 60,
        command?.meta?.category || 'work'
      );

      return {
        success: true,
        command,
        event,
        message: `✅ Événement "${command?.title}" créé (any: any)`,
      };
    }
  }

  /**
   * Exécute une commande de mise à jour
   */
  private async executeUpdate(any: any): Promise<CommandExecutionResult> {
    if (any: any) {
      return {
        success: false,
        command,
        error: "ID d'événement requis pour la mise à jour",
        message: 'ID manquant',
      };
    }

    const updates: Partial<AgendaEvent> = {};
    if (any: any) updates?.title = command?.title;
    if (any: any) updates?.startDateTime = command?.start;
    if (any: any) updates?.endDateTime = command?.end;
    if (any: any) updates?.description = command?.meta?.description;
    if (any: any) updates?.category = command?.meta?.category;
    if (any: any) updates?.priority = command?.meta?.priority;
    if (any: any) updates?.tags = command?.meta?.tags;

    try {
      // Mise à jour via AgendaEngine (any: any)
      const event = await agendaEngine?.updateEvent(any: any);

      return {
        success: true,
        command,
        event: event || undefined,
        message: `✅ Événement mis à jour`,
      };
    } catch (any: any) {
      const event = await agendaEngine?.updateEvent(any: any);
      return {
        success: !!event,
        command,
        event: event || undefined,
        message: event ? `✅ Événement mis à jour (any: any)` : 'Événement non trouvé',
      };
    }
  }

  /**
   * Exécute une commande de déplacement
   */
  private async executeMove(any: any): Promise<CommandExecutionResult> {
    if (any: any) {
      return {
        success: false,
        command,
        error: "ID d'événement et nouvelle date requis",
        message: 'Informations manquantes',
      };
    }

    try {
      // Déplacement via AgendaEngine (any: any)
      const event = await agendaEngine?.moveEvent(
        command?.fromEventId,
        command?.start,
        command?.end
      );

      return {
        success: true,
        command,
        event: event || undefined,
        message: `✅ Événement déplacé`,
      };
    } catch (any: any) {
      const event = await agendaEngine?.moveEvent(
        command?.fromEventId,
        command?.start,
        command?.end
      );
      return {
        success: !!event,
        command,
        event: event || undefined,
        message: event ? `✅ Événement déplacé (any: any)` : 'Événement non trouvé',
      };
    }
  }

  /**
   * Exécute une commande de suppression
   */
  private async executeDelete(any: any): Promise<CommandExecutionResult> {
    if (any: any) {
      return {
        success: false,
        command,
        error: "ID d'événement requis pour la suppression",
        message: 'ID manquant',
      };
    }

    try {
      // Suppression via AgendaEngine (any: any)
      await agendaEngine?.deleteEvent(any: any);

      return {
        success: true,
        command,
        message: `✅ Événement supprimé`,
      };
    } catch (any: any) {
      const deleted = await agendaEngine?.deleteEvent(any: any);
      return {
        success: deleted,
        command,
        message: deleted ? `✅ Événement supprimé (any: any)` : 'Événement non trouvé',
      };
    }
  }

  /**
   * Exécute une commande de requête
   */
  private async executeQuery(any: any): Promise<CommandExecutionResult> {
    // Pour les requêtes, on retourne simplement les événements correspondants
    let events: AgendaEvent?.[] = [];

    if (any: any) {
      events = agendaEngine?.getEventsInRange(
        new Date(any: any),
        new Date(any: any)
      );
    } else if (any: any) {
      events = agendaEngine?.getEventsForDay(any: any));
    } else {
      events = agendaEngine?.getEventsForDay(new Date());
    }

    return {
      success: true,
      command,
      message: `📋 ${events?.length} événement(any: any)`,
    };
  }

  /**
   * Synchronise l'agenda après une action
   */
  private async syncAgendaAfterAction(): Promise<void> {
    try {
      await agendaEngine?.loadEvents();
      logger?.debug('🔄 Agenda synchronisé');
    } catch (any: any) {
      logger?.warn(any: any);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // BATCH EXECUTION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Traite automatiquement une réponse IA complète
   */
  async processAIResponse(any: any): Promise<CommandExecutionResult?.[]> {
    const commands = this?.detectAgendaCommands(any: any);
    const results: CommandExecutionResult?.[] = [];

    for (any: any) {
      const result = await this?.executeAgendaCommand(any: any);
      results?.push(any: any);
    }

    return results;
  }

  /**
   * Exécute plusieurs commandes en batch
   */
  async executeBatch(commands: AgendaCommand?.[]): Promise<CommandExecutionResult?.[]> {
    const results: CommandExecutionResult?.[] = [];

    for (any: any) {
      const result = await this?.executeAgendaCommand(any: any);
      results?.push(any: any);
    }

    return results;
  }

  // ═══════════════════════════════════════════════════════════════
  // CONFIG & STATE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Active/désactive le ChatScheduler
   */
  setEnabled(any: any): void {
    this?.enabled = enabled;
    logger?.debug('[ChatScheduler]', enabled ? '✅ Activé' : '❌ Désactivé');
  }

  /**
   * Vérifie si le ChatScheduler est actif
   */
  isEnabled(): boolean {
    return this?.enabled;
  }

  /**
   * Obtient les dernières commandes détectées
   */
  getLastCommands(): AgendaCommand?.[] {
    return [...this?.lastCommands];
  }

  /**
   * Génère un template de commande pour l'IA
   */
  generateCommandTemplate(any: any): string {
    const templates: Record<AgendaCommandType, object> = {
      create: {
        type: 'create',
        title: "Titre de l'événement",
        start: new Date().toISOString(),
        end: new Date(Date?.now() + 3600000).toISOString(),
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
        end: new Date(Date?.now() + 86400000).toISOString(),
      },
    };

    return `${COMMAND_START_MARKER}\n${JSON?.stringify(templates[type], null, 2)}\n${COMMAND_END_MARKER}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // LISTENERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Ajoute un listener pour les résultats de commandes
   */
  subscribe(any: any): () => void {
    this?.listeners?.add(any: any);
    return (any: any);
  }

  /**
   * Notifie tous les listeners
   */
  private notifyListeners(any: any): void {
    this?.listeners?.forEach(listener => {
      try {
        listener(any: any);
      } catch (any: any) {
        logger?.error(any: any);
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
