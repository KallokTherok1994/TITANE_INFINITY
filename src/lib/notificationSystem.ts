/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Phase 7: Notifications System
 * Browser notifications + sound alerts + toast messages
 * ═══════════════════════════════════════════════════════════════
 */

export type NotificationType = 'info' | 'warning' | 'error' | 'success';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface NotificationConfig {
  enableBrowserNotifications: boolean;
  enableSoundAlerts: boolean;
  enableToasts: boolean;
  soundVolume: number; // 0-1
  minPriority: NotificationPriority;
}

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: number;
  source: string; // 'anomaly', 'sla', 'predictive', 'alert'
  dismissed: boolean;
}

// ────────────────────────────────────────────────────────────────
// Notifications Manager
// ────────────────────────────────────────────────────────────────

export class NotificationSystem {
  private static config: NotificationConfig = {
    enableBrowserNotifications: true,
    enableSoundAlerts: true,
    enableToasts: true,
    soundVolume: 0.5,
    minPriority: 'medium',
  };

  private static notifications: Notification[] = [];
  private static listeners: Array<(notifications: Notification[]) => void> = [];
  private static permissionGranted = false;

  /**
   * Initialiser le système de notifications
   */
  static async initialize(): Promise<void> {
    // Charger config depuis localStorage
    const savedConfig = localStorage.getItem('notification-config');
    if (savedConfig) {
      try {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      } catch (e) {
        console.error('Erreur chargement config notifications:', e);
      }
    }

    // Demander permission pour notifications navigateur
    if (this.config.enableBrowserNotifications && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
    }
  }

  /**
   * Mettre à jour la configuration
   */
  static updateConfig(updates: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...updates };
    localStorage.setItem('notification-config', JSON.stringify(this.config));

    // Demander permission si activé
    if (updates.enableBrowserNotifications && 'Notification' in window && !this.permissionGranted) {
      Notification.requestPermission().then((permission) => {
        this.permissionGranted = permission === 'granted';
      });
    }
  }

  /**
   * Obtenir la configuration actuelle
   */
  static getConfig(): NotificationConfig {
    return { ...this.config };
  }

  /**
   * Envoyer une notification
   */
  static notify(
    title: string,
    message: string,
    type: NotificationType,
    priority: NotificationPriority,
    source: string
  ): void {
    // Vérifier priorité minimum
    const priorityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    if (priorityLevels[priority] < priorityLevels[this.config.minPriority]) {
      return; // Ignorer notification si priorité trop basse
    }

    const notification: Notification = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      priority,
      title,
      message,
      timestamp: Date.now(),
      source,
      dismissed: false,
    };

    // Ajouter à la liste
    this.notifications.unshift(notification);

    // Garder max 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    // Toast (toujours si activé)
    if (this.config.enableToasts) {
      this.showToast(notification);
    }

    // Browser notification
    if (this.config.enableBrowserNotifications && this.permissionGranted) {
      this.showBrowserNotification(notification);
    }

    // Sound alert
    if (this.config.enableSoundAlerts && priority !== 'low') {
      this.playSound(priority);
    }

    // Notifier les listeners
    this.notifyListeners();
  }

  /**
   * Afficher un toast (délégué aux listeners React)
   */
  private static showToast(notification: Notification): void {
    // Toast sera géré par le composant ToastContainer
    // On émet juste un événement custom
    const event = new CustomEvent('notification-toast', { detail: notification });
    window.dispatchEvent(event);
  }

  /**
   * Afficher une notification navigateur
   */
  private static showBrowserNotification(notification: Notification): void {
    if (!('Notification' in window)) return;

    try {
      const browserNotif = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'critical',
      });

      // Auto-fermer après 5s sauf si critique
      if (notification.priority !== 'critical') {
        setTimeout(() => browserNotif.close(), 5000);
      }
    } catch (e) {
      console.error('Erreur notification navigateur:', e);
    }
  }

  /**
   * Jouer un son d'alerte
   */
  private static playSound(priority: NotificationPriority): void {
    // Créer oscillateur Web Audio API pour son simple
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Fréquence basée sur priorité
      let frequency = 440; // A4
      switch (priority) {
        case 'critical':
          frequency = 880; // A5 - aigu
          break;
        case 'high':
          frequency = 660; // E5
          break;
        case 'medium':
          frequency = 440; // A4
          break;
      }

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gainNode.gain.value = this.config.soundVolume;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2); // 200ms beep
    } catch (e) {
      console.error('Erreur son alerte:', e);
    }
  }

  /**
   * Marquer une notification comme lue
   */
  static dismiss(notificationId: string): void {
    const notification = this.notifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.dismissed = true;
      this.notifyListeners();
    }
  }

  /**
   * Tout marquer comme lu
   */
  static dismissAll(): void {
    this.notifications.forEach((n) => (n.dismissed = true));
    this.notifyListeners();
  }

  /**
   * Supprimer les notifications anciennes (>24h)
   */
  static cleanup(): void {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.notifications = this.notifications.filter((n) => n.timestamp > dayAgo);
    this.notifyListeners();
  }

  /**
   * Obtenir toutes les notifications
   */
  static getAll(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Obtenir notifications non lues
   */
  static getUnread(): Notification[] {
    return this.notifications.filter((n) => !n.dismissed);
  }

  /**
   * Obtenir notifications par source
   */
  static getBySource(source: string): Notification[] {
    return this.notifications.filter((n) => n.source === source);
  }

  /**
   * Statistiques
   */
  static getStats(): {
    total: number;
    unread: number;
    byType: Record<NotificationType, number>;
    byPriority: Record<NotificationPriority, number>;
  } {
    const stats = {
      total: this.notifications.length,
      unread: this.notifications.filter((n) => !n.dismissed).length,
      byType: { info: 0, warning: 0, error: 0, success: 0 } as Record<NotificationType, number>,
      byPriority: { low: 0, medium: 0, high: 0, critical: 0 } as Record<
        NotificationPriority,
        number
      >,
    };

    for (const notif of this.notifications) {
      stats.byType[notif.type]++;
      stats.byPriority[notif.priority]++;
    }

    return stats;
  }

  /**
   * S'abonner aux changements
   */
  static subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notifier les listeners
   */
  private static notifyListeners(): void {
    const notifications = this.getAll();
    this.listeners.forEach((listener) => listener(notifications));
  }

  /**
   * Réinitialiser tout
   */
  static reset(): void {
    this.notifications = [];
    this.listeners = [];
    this.notifyListeners();
  }
}

// ────────────────────────────────────────────────────────────────
// Helpers pour intégration avec autres modules
// ────────────────────────────────────────────────────────────────

export const NotificationHelpers = {
  /**
   * Notification pour anomalie détectée
   */
  notifyAnomaly(service: string, metric: string, severity: string): void {
    const priorityMap: Record<string, NotificationPriority> = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'critical',
    };

    NotificationSystem.notify(
      `Anomalie détectée - ${service.toUpperCase()}`,
      `Métrique ${metric} présente une anomalie de sévérité ${severity}`,
      'warning',
      priorityMap[severity] || 'medium',
      'anomaly'
    );
  },

  /**
   * Notification pour violation SLA
   */
  notifySLAViolation(service: string, metric: string, actual: number, target: number): void {
    NotificationSystem.notify(
      `Violation SLA - ${service.toUpperCase()}`,
      `${metric}: ${actual.toFixed(2)} (seuil: ${target.toFixed(2)})`,
      'error',
      'high',
      'sla'
    );
  },

  /**
   * Notification pour alerte prédictive
   */
  notifyPredictive(
    service: string,
    metric: string,
    timeToThreshold: number,
    severity: string
  ): void {
    const priorityMap: Record<string, NotificationPriority> = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'critical',
    };

    NotificationSystem.notify(
      `Alerte Prédictive - ${service.toUpperCase()}`,
      `${metric} devrait dépasser le seuil dans ${timeToThreshold}min`,
      'warning',
      priorityMap[severity] || 'medium',
      'predictive'
    );
  },

  /**
   * Notification pour alerte générale
   */
  notifyAlert(message: string, priority: NotificationPriority): void {
    NotificationSystem.notify(
      'Alerte Système',
      message,
      priority === 'critical' || priority === 'high' ? 'error' : 'warning',
      priority,
      'alert'
    );
  },
};
