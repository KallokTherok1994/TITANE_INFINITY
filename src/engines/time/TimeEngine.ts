/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — TIME ENGINE
 * Moteur central de gestion du temps
 * ═══════════════════════════════════════════════════════════════════
 *
 * Fonctionnalités:
 * - Suivi du temps réel avec synchronisation
 * - Segments journaliers (matin, après-midi, soir, nuit)
 * - Template hebdomadaire (jours travaillés/repos)
 * - Détection automatique du contexte temporel
 * - Tick interne pour mise à jour continue
 */

import type { TimeState, DaySegment, DayProfile } from './types';

// ═══════════════════════════════════════════════════════════════════
// CONSTANTES — Segments par défaut (monochrome TITANE)
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_DAY_SEGMENTS: DaySegment[] = [
  {
    id: 'early_morning',
    label: 'Aube',
    startTime: '05:00',
    endTime: '07:00',
    color: '#9ca4ab', // primary-300
    typicalEnergy: 0.6,
    icon: '🌅',
  },
  {
    id: 'morning',
    label: 'Matin',
    startTime: '07:00',
    endTime: '12:00',
    color: '#727b81', // primary-500
    typicalEnergy: 0.9,
    icon: '☀️',
  },
  {
    id: 'midday',
    label: 'Midi',
    startTime: '12:00',
    endTime: '14:00',
    color: '#838d95', // primary-400
    typicalEnergy: 0.65,
    icon: '🍽️',
  },
  {
    id: 'afternoon',
    label: 'Après-midi',
    startTime: '14:00',
    endTime: '18:00',
    color: '#727b81', // primary-500
    typicalEnergy: 0.8,
    icon: '⚡',
  },
  {
    id: 'evening',
    label: 'Soir',
    startTime: '18:00',
    endTime: '22:00',
    color: '#60676d', // primary-600
    typicalEnergy: 0.5,
    icon: '🌆',
  },
  {
    id: 'night',
    label: 'Nuit',
    startTime: '22:00',
    endTime: '05:00',
    color: '#4f5459', // primary-700
    typicalEnergy: 0.2,
    icon: '🌙',
  },
];

const DEFAULT_WEEK_TEMPLATE: DayProfile[] = [
  { day: 0, label: 'Dimanche', active: false, profile: 'rest' },
  { day: 1, label: 'Lundi', active: true, profile: 'work' },
  { day: 2, label: 'Mardi', active: true, profile: 'work' },
  { day: 3, label: 'Mercredi', active: true, profile: 'focus' },
  { day: 4, label: 'Jeudi', active: true, profile: 'work' },
  { day: 5, label: 'Vendredi', active: true, profile: 'creative' },
  { day: 6, label: 'Samedi', active: false, profile: 'rest' },
];

const DEFAULT_WORK_HOURS = {
  start: '09:00',
  end: '18:00',
};

// ═══════════════════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════════════════

/**
 * Convertit une heure HH:mm en minutes depuis minuit
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Obtient les minutes actuelles depuis minuit
 */
function getCurrentMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Vérifie si une heure est dans un intervalle (gère le passage minuit)
 */
function isTimeInRange(
  currentMinutes: number,
  startTime: string,
  endTime: string
): boolean {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  // Gestion du passage minuit (ex: 22:00 - 05:00)
  if (start > end) {
    return currentMinutes >= start || currentMinutes < end;
  }

  return currentMinutes >= start && currentMinutes < end;
}

/**
 * Génère l'état initial du temps
 */
function createInitialTimeState(): TimeState {
  const now = new Date();
  const currentMinutes = getCurrentMinutes(now);
  const currentDayOfWeek = now.getDay();

  // Trouver le segment actuel
  const currentSegment =
    DEFAULT_DAY_SEGMENTS.find(segment =>
      isTimeInRange(currentMinutes, segment.startTime, segment.endTime)
    ) || DEFAULT_DAY_SEGMENTS[0];

  // Vérifier si jour travaillé
  const dayProfile = DEFAULT_WEEK_TEMPLATE.find(d => d.day === currentDayOfWeek);
  const isWorkDay = dayProfile?.active ?? false;

  // Vérifier si dans les heures de travail
  const isWorkHours =
    isWorkDay &&
    isTimeInRange(currentMinutes, DEFAULT_WORK_HOURS.start, DEFAULT_WORK_HOURS.end);

  return {
    currentDateTime: now.toISOString(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    daySegments: DEFAULT_DAY_SEGMENTS,
    workHours: DEFAULT_WORK_HOURS,
    weekTemplate: DEFAULT_WEEK_TEMPLATE,
    currentSegment,
    currentDayOfWeek,
    isWorkDay,
    isWorkHours,
    lastUpdate: Date.now(),
  };
}

// ═══════════════════════════════════════════════════════════════════
// TIME ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════

/**
 * Listener pour les changements d'état du temps
 */
type TimeStateListener = (state: TimeState) => void;

/**
 * TimeEngine v∞ — Moteur central du temps TITANE∞
 */
export class TimeEngine {
  private state: TimeState;
  private listeners: Set<TimeStateListener>;
  private tickInterval: ReturnType<typeof setInterval> | null;
  private readonly tickRate: number;

  constructor(tickRate: number = 1000) {
    this.state = createInitialTimeState();
    this.listeners = new Set();
    this.tickInterval = null;
    this.tickRate = tickRate;
  }

  // ═══════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Initialise le TimeEngine et démarre le tick interne
   */
  init(): void {
    console.log('[TimeEngine] ⏰ Initialisation...');
    this.updateCurrentDateTime();
    this.startTick();
    console.log('[TimeEngine] ✅ Initialisé:', {
      timeZone: this.state.timeZone,
      currentSegment: this.state.currentSegment?.label,
      isWorkDay: this.state.isWorkDay,
      isWorkHours: this.state.isWorkHours,
    });
  }

  /**
   * Arrête le TimeEngine
   */
  destroy(): void {
    console.log('[TimeEngine] 🛑 Arrêt...');
    this.stopTick();
    this.listeners.clear();
  }

  // ═══════════════════════════════════════════════════════════════
  // TICK INTERNE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Démarre le tick interne de synchronisation
   */
  private startTick(): void {
    if (this.tickInterval) return;

    this.tickInterval = setInterval(() => {
      this.syncTick();
    }, this.tickRate);

    console.log(`[TimeEngine] ⚙️ Tick démarré (${this.tickRate}ms)`);
  }

  /**
   * Arrête le tick interne
   */
  private stopTick(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
      console.log('[TimeEngine] ⏹️ Tick arrêté');
    }
  }

  /**
   * Tick de synchronisation interne
   */
  private syncTick(): void {
    const previousSegment = this.state.currentSegment;
    const previousIsWorkHours = this.state.isWorkHours;

    this.updateCurrentDateTime();

    // Notifier si changement de segment
    if (previousSegment?.id !== this.state.currentSegment?.id) {
      console.log(
        '[TimeEngine] 🔄 Changement de segment:',
        previousSegment?.label,
        '→',
        this.state.currentSegment?.label
      );
    }

    // Notifier si changement heures de travail
    if (previousIsWorkHours !== this.state.isWorkHours) {
      console.log(
        '[TimeEngine] 💼 Heures de travail:',
        this.state.isWorkHours ? 'DÉBUT' : 'FIN'
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // MISE À JOUR DE L'ÉTAT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Met à jour l'heure actuelle et recalcule le contexte
   */
  updateCurrentDateTime(): void {
    const now = new Date();
    const currentMinutes = getCurrentMinutes(now);
    const currentDayOfWeek = now.getDay();

    // Trouver le segment actuel
    const currentSegment =
      this.state.daySegments.find(segment =>
        isTimeInRange(currentMinutes, segment.startTime, segment.endTime)
      ) || this.state.daySegments[0];

    // Vérifier jour travaillé
    const dayProfile = this.state.weekTemplate.find(d => d.day === currentDayOfWeek);
    const isWorkDay = dayProfile?.active ?? false;

    // Heures de travail personnalisées ou par défaut
    const workHours = dayProfile?.customWorkHours || this.state.workHours;
    const isWorkHours =
      isWorkDay && isTimeInRange(currentMinutes, workHours.start, workHours.end);

    // Mettre à jour l'état
    this.state = {
      ...this.state,
      currentDateTime: now.toISOString(),
      currentSegment,
      currentDayOfWeek,
      isWorkDay,
      isWorkHours,
      lastUpdate: Date.now(),
    };

    // Notifier les listeners
    this.notifyListeners();
  }

  /**
   * Calcule les segments de la journée (permet personnalisation)
   */
  computeDaySegments(customSegments?: Partial<DaySegment>[]): DaySegment[] {
    if (!customSegments || customSegments.length === 0) {
      return DEFAULT_DAY_SEGMENTS;
    }

    // Fusionner avec les segments par défaut
    return DEFAULT_DAY_SEGMENTS.map((defaultSegment, index) => ({
      ...defaultSegment,
      ...customSegments[index],
    }));
  }

  /**
   * Initialise/met à jour le template hebdomadaire
   */
  initWeekTemplate(customTemplate?: Partial<DayProfile>[]): void {
    if (customTemplate && customTemplate.length > 0) {
      this.state.weekTemplate = DEFAULT_WEEK_TEMPLATE.map((defaultDay, index) => ({
        ...defaultDay,
        ...customTemplate[index],
      }));
    } else {
      this.state.weekTemplate = DEFAULT_WEEK_TEMPLATE;
    }

    this.notifyListeners();
  }

  /**
   * Met à jour les heures de travail
   */
  setWorkHours(start: string, end: string): void {
    this.state.workHours = { start, end };
    this.updateCurrentDateTime(); // Recalculer isWorkHours
  }

  /**
   * Met à jour un jour spécifique du template
   */
  updateDayProfile(day: number, profile: Partial<DayProfile>): void {
    const index = this.state.weekTemplate.findIndex(d => d.day === day);
    if (index !== -1) {
      this.state.weekTemplate[index] = {
        ...this.state.weekTemplate[index],
        ...profile,
      };
      this.updateCurrentDateTime();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtient l'état complet du temps
   */
  getState(): TimeState {
    return { ...this.state };
  }

  /**
   * Obtient le segment actuel
   */
  getCurrentSegment(): DaySegment | null {
    return this.state.currentSegment;
  }

  /**
   * Obtient le profil du jour actuel
   */
  getCurrentDayProfile(): DayProfile | undefined {
    return this.state.weekTemplate.find(d => d.day === this.state.currentDayOfWeek);
  }

  /**
   * Vérifie si c'est un jour travaillé
   */
  isWorkDay(): boolean {
    return this.state.isWorkDay;
  }

  /**
   * Vérifie si on est dans les heures de travail
   */
  isWorkHours(): boolean {
    return this.state.isWorkHours;
  }

  /**
   * Obtient le temps restant dans le segment actuel (en minutes)
   */
  getTimeRemainingInSegment(): number {
    if (!this.state.currentSegment) return 0;

    const now = new Date();
    const currentMinutes = getCurrentMinutes(now);
    const endMinutes = timeToMinutes(this.state.currentSegment.endTime);

    // Gestion passage minuit
    if (endMinutes < currentMinutes) {
      return 24 * 60 - currentMinutes + endMinutes;
    }

    return endMinutes - currentMinutes;
  }

  /**
   * Obtient le temps restant dans les heures de travail (en minutes)
   */
  getTimeRemainingInWorkHours(): number {
    if (!this.state.isWorkHours) return 0;

    const now = new Date();
    const currentMinutes = getCurrentMinutes(now);
    const endMinutes = timeToMinutes(this.state.workHours.end);

    return Math.max(0, endMinutes - currentMinutes);
  }

  // ═══════════════════════════════════════════════════════════════
  // LISTENERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Ajoute un listener pour les changements d'état
   */
  subscribe(listener: TimeStateListener): () => void {
    this.listeners.add(listener);
    // Appel immédiat avec l'état actuel
    listener(this.getState());

    // Retourne une fonction de désinscription
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifie tous les listeners
   */
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('[TimeEngine] Erreur listener:', error);
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════

/**
 * Instance singleton du TimeEngine
 */
export const timeEngine = new TimeEngine();

/**
 * Fonctions utilitaires exportées
 */
export const TimeEngineUtils = {
  timeToMinutes,
  getCurrentMinutes,
  isTimeInRange,
  createInitialTimeState,
  DEFAULT_DAY_SEGMENTS,
  DEFAULT_WEEK_TEMPLATE,
  DEFAULT_WORK_HOURS,
};
