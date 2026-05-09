import { useEffect, useMemo } from 'react';
import { useTimeAgenda } from '@/hooks/useTimeAgenda';
import {
  TIME_RUNTIME_CONTEXT_KEY,
  type ChatContextEnvelope,
} from '@/services/chat/chatMemorySingleDoor';

type TimeRuntimeContextSnapshot = NonNullable<ChatContextEnvelope['timeContext']>;

const FOCUS_CATEGORIES = new Set(['focus', 'work', 'creative', 'learning']);

const clampPercent = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
};

const toMinutePrecisionIso = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  parsed.setSeconds(0, 0);
  return parsed.toISOString();
};

const readStoredContext = (): Partial<TimeRuntimeContextSnapshot> | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(TIME_RUNTIME_CONTEXT_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as Partial<TimeRuntimeContextSnapshot>;
  } catch {
    return null;
  }
};

const writeContextIfChanged = (
  next: Omit<TimeRuntimeContextSnapshot, 'updatedAt'>
): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const previous = readStoredContext();
  const previousComparable = previous
    ? {
        currentDateTime: previous.currentDateTime,
        timeZone: previous.timeZone,
        currentSegment: previous.currentSegment,
        isWorkHours: previous.isWorkHours,
        eventsToday: previous.eventsToday,
        eventsThisWeek: previous.eventsThisWeek,
        todayFocusMinutes: previous.todayFocusMinutes,
        currentEnergy: previous.currentEnergy,
        activeTab: previous.activeTab,
        runtimeSource: previous.runtimeSource,
      }
    : null;

  if (previousComparable && JSON.stringify(previousComparable) === JSON.stringify(next)) {
    return;
  }

  try {
    window.localStorage.setItem(
      TIME_RUNTIME_CONTEXT_KEY,
      JSON.stringify({
        ...next,
        updatedAt: Date.now(),
      } satisfies TimeRuntimeContextSnapshot)
    );
  } catch {
    // Non-blocking: TIME context publication must never crash the app shell.
  }
};

const isSameCalendarDay = (left: Date, right: Date): boolean => {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
};

const getEventDurationMinutes = (startIso: string, endIso: string): number => {
  return Math.max(
    0,
    Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000)
  );
};

const resolveTimeZone = (candidate?: string): string => {
  if (typeof candidate === 'string' && candidate.trim().length > 0) {
    return candidate;
  }

  try {
    const runtimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (runtimeZone && runtimeZone.trim().length > 0) {
      return runtimeZone;
    }
  } catch {
    // noop
  }

  return 'Local';
};

export function GlobalTemporalContextPublisher(): null {
  const { timeState, events, energyState, stats, currentDate, initialized } =
    useTimeAgenda();

  const todayFocusMinutes = useMemo(() => {
    return events
      .filter(
        event =>
          isSameCalendarDay(new Date(event.startDateTime), currentDate) &&
          FOCUS_CATEGORIES.has(event.category)
      )
      .reduce(
        (total, event) =>
          total + getEventDurationMinutes(event.startDateTime, event.endDateTime),
        0
      );
  }, [currentDate, events]);

  const currentEnergy = useMemo(() => {
    const rawLevel = energyState?.currentEnergyLevel ?? stats.currentEnergy;
    return clampPercent((rawLevel ?? 0) * 100);
  }, [energyState?.currentEnergyLevel, stats.currentEnergy]);

  useEffect(() => {
    const previous = readStoredContext();
    const previousTab =
      typeof previous?.activeTab === 'string' && previous.activeTab.trim().length > 0
        ? previous.activeTab
        : undefined;

    const runtimeSource: TimeRuntimeContextSnapshot['runtimeSource'] = initialized
      ? 'global-publisher'
      : 'uninitialized';

    writeContextIfChanged({
      currentDateTime: toMinutePrecisionIso(
        timeState?.currentDateTime ?? new Date(currentDate).toISOString()
      ),
      timeZone: resolveTimeZone(timeState?.timeZone),
      currentSegment:
        typeof stats.currentSegment === 'string' && stats.currentSegment.trim().length > 0
          ? stats.currentSegment
          : 'Unknown',
      isWorkHours: Boolean(stats.isWorkHours),
      eventsToday:
        typeof stats.eventsToday === 'number' && Number.isFinite(stats.eventsToday)
          ? stats.eventsToday
          : 0,
      eventsThisWeek:
        typeof stats.eventsThisWeek === 'number' && Number.isFinite(stats.eventsThisWeek)
          ? stats.eventsThisWeek
          : 0,
      todayFocusMinutes,
      currentEnergy,
      activeTab: previousTab,
      runtimeSource,
    });
  }, [
    currentDate,
    currentEnergy,
    initialized,
    stats.currentSegment,
    stats.eventsToday,
    stats.eventsThisWeek,
    stats.isWorkHours,
    timeState?.currentDateTime,
    timeState?.timeZone,
    todayFocusMinutes,
  ]);

  return null;
}
