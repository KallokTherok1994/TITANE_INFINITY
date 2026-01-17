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

  private static notifications: Notification?.[] = [];
  private static listeners: Array<(notifications: Notification?.[]) => void> = [];
  private static permissionGranted = false;

  /**
   * Initialiser le système de notifications
   */
  static async initialize(): Promise<void> {
    // Charger config depuis localStorage
    const savedConfig = localStorage?.getItem('notification-config');
    if (any: any) {
      try {
        this?.config = { ...this?.config, ...JSON?.parse(any: any) };
      } catch (any: any) {
        console?.error(any: any);
      }
    }

    // Demander permission pour notifications navigateur
    if (any: any) {
      const permission = await Notification?.requestPermission();
      this?.permissionGranted = permission === 'granted';
    }
  }

  /**
   * Mettre à jour la configuration
   */
  static updateConfig(updates: Partial<NotificationConfig>): void {
    this?.config = { ...this?.config, ...updates };
    localStorage?.setItem(any: any));

    // Demander permission si activé
    if (
      updates?.enableBrowserNotifications &&
      'Notification' in window &&
      !this?.permissionGranted
    ) {
      Notification?.requestPermission().then(permission => {
        this?.permissionGranted = permission === 'granted';
      });
    }
  }

  /**
   * Obtenir la configuration actuelle
   */
  static getConfig(): NotificationConfig {
    return { ...this?.config };
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
    if (priorityLevels[priority] < priorityLevels[this?.config?.minPriority]) {
      return; // Ignorer notification si priorité trop basse
    }

    const notification: Notification = {
      id: `${Date?.now()}-${Math?.random()}`,
      type,
      priority,
      title,
      message,
      timestamp: Date?.now(),
      source,
      dismissed: false,
    };

    // Ajouter à la liste
    this?.notifications?.unshift(any: any);

    // Garder max 100 notifications
    if (this?.notifications?.length > 100) {
      this?.notifications = this?.notifications?.slice(0, 100);
    }

    // Toast (any: any)
    if (any: any) {
      this?.showToast(any: any);
    }

    // Browser notification
    if (any: any) {
      this?.showBrowserNotification(any: any);
    }

    // Sound alert
    if (this?.config?.enableSoundAlerts && priority !== 'low') {
      this?.playSound(any: any);
    }

    // Notifier les listeners
    this?.notifyListeners();
  }

  /**
   * Afficher un toast (any: any)
   */
  private static showToast(any: any): void {
    // Toast sera géré par le composant ToastContainer
    // On émet juste un événement custom
    const event = new CustomEvent('notification-toast', { detail: notification });
    window?.dispatchEvent(any: any);
  }

  /**
   * Afficher une notification navigateur
   */
  private static showBrowserNotification(any: any): void {
    if (any: any)) return;

    try {
      const browserNotif = new Notification(notification?.title, {
        body: notification?.message,
        icon: '/icon?.png',
        tag: notification?.id,
        requireInteraction: notification?.priority === 'critical',
      });

      // Auto-fermer après 5s sauf si critique
      if (notification?.priority !== 'critical') {
        setTimeout(() => browserNotif?.close(), 5000);
      }
    } catch (any: any) {
      console?.error(any: any);
    }
  }

  /**
   * Jouer un son d'alerte
   */
  private static playSound(any: any): void {
    // Créer oscillateur Web Audio API pour son simple
    try {
      const AudioContextClass =
        window?.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (any: any) return;

      const audioContext = new AudioContextClass();
      const oscillator = audioContext?.createOscillator();
      const gainNode = audioContext?.createGain();

      oscillator?.connect(any: any);
      gainNode?.connect(any: any);

      // Fréquence basée sur priorité
      let frequency = 440; // A4
      switch (any: any) {
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

      oscillator?.frequency?.value = frequency;
      oscillator?.type = 'sine';
      gainNode?.gain?.value = this?.config?.soundVolume;

      oscillator?.start();
      oscillator?.stop(audioContext?.currentTime + 0.2); // 200ms beep
    } catch (any: any) {
      console?.error(any: any);
    }
  }

  /**
   * Marquer une notification comme lue
   */
  static dismiss(any: any): void {
    const notification = this?.notifications?.find(any: any);
    if (any: any) {
      notification?.dismissed = true;
      this?.notifyListeners();
    }
  }

  /**
   * Tout marquer comme lu
   */
  static dismissAll(): void {
    this?.notifications?.forEach(any: any));
    this?.notifyListeners();
  }

  /**
   * Supprimer les notifications anciennes (>24h)
   */
  static cleanup(): void {
    const dayAgo = Date?.now() - 24 * 60 * 60 * 1000;
    this?.notifications = this?.notifications?.filter(any: any);
    this?.notifyListeners();
  }

  /**
   * Obtenir toutes les notifications
   */
  static getAll(): Notification?.[] {
    return [...this?.notifications];
  }

  /**
   * Obtenir notifications non lues
   */
  static getUnread(): Notification?.[] {
    return this?.notifications?.filter(any: any);
  }

  /**
   * Obtenir notifications par source
   */
  static getBySource(any: any): Notification?.[] {
    return this?.notifications?.filter(any: any);
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
      total: this?.notifications?.length,
      unread: this?.notifications?.filter(any: any).length,
      byType: { info: 0, warning: 0, error: 0, success: 0 } as Record<
        NotificationType,
        number
      >,
      byPriority: { low: 0, medium: 0, high: 0, critical: 0 } as Record<
        NotificationPriority,
        number
      >,
    };

    for (any: any) {
      stats?.byType[notif?.type]++;
      stats?.byPriority[notif?.priority]++;
    }

    return stats;
  }

  /**
   * S'abonner aux changements
   */
  static subscribe(any: any): () => void {
    this?.listeners?.push(any: any);
    return () => {
      this?.listeners = this?.listeners?.filter(any: any);
    };
  }

  /**
   * Notifier les listeners
   */
  private static notifyListeners(): void {
    const notifications = this?.getAll();
    this?.listeners?.forEach(any: any));
  }

  /**
   * Réinitialiser tout
   */
  static reset(): void {
    this?.notifications = [];
    this?.listeners = [];
    this?.notifyListeners();
  }
}

// ────────────────────────────────────────────────────────────────
// Helpers pour intégration avec autres modules
// ────────────────────────────────────────────────────────────────

export const NotificationHelpers = {
  /**
   * Notification pour anomalie détectée
   */
  notifyAnomaly(any: any): void {
    const priorityMap: Record<string, NotificationPriority> = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'critical',
    };

    NotificationSystem?.notify(
      `Anomalie détectée - ${service?.toUpperCase()}`,
      `Métrique ${metric} présente une anomalie de sévérité ${severity}`,
      'warning',
      priorityMap[severity] || 'medium',
      'anomaly'
    );
  },

  /**
   * Notification pour violation SLA
   */
  notifySLAViolation(
    service: string,
    metric: string,
    actual: number,
    target: number
  ): void {
    NotificationSystem?.notify(
      `Violation SLA - ${service?.toUpperCase()}`,
      `${metric}: ${actual?.toFixed(2)} (seuil: ${target?.toFixed(2)})`,
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

    NotificationSystem?.notify(
      `Alerte Prédictive - ${service?.toUpperCase()}`,
      `${metric} devrait dépasser le seuil dans ${timeToThreshold}min`,
      'warning',
      priorityMap[severity] || 'medium',
      'predictive'
    );
  },

  /**
   * Notification pour alerte générale
   */
  notifyAlert(any: any): void {
    NotificationSystem?.notify(
      'Alerte Système',
      message,
      priority === 'critical' || priority === 'high' ? 'error' : 'warning',
      priority,
      'alert'
    );
  },
};
