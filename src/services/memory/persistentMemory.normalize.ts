import type {
  MemoryBundle,
  MemoryContentType,
  MemoryHealth,
  MemoryLevel,
  MemoryReadResponse,
  MemoryStats,
  MemorySummary,
  MemoryTopic,
} from './persistentMemory.config';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function toCamelCaseKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

export function normalizePersistentMemoryPayload<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(item => normalizePersistentMemoryPayload(item)) as T;
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const normalized = Object.entries(value).reduce<Record<string, unknown>>(
    (acc, [key, nestedValue]) => {
      acc[toCamelCaseKey(key)] = normalizePersistentMemoryPayload(nestedValue);
      return acc;
    },
    {}
  );

  return normalized as T;
}

export function normalizePersistentMemoryReadResponse(
  value: unknown
): MemoryReadResponse {
  const normalized = normalizePersistentMemoryPayload(value) as Record<string, unknown>;
  return {
    entries: Array.isArray(normalized.entries)
      ? normalizePersistentMemoryPayload(normalized.entries)
      : [],
    summaries: Array.isArray(normalized.summaries)
      ? normalizePersistentMemorySummaries(normalized.summaries)
      : undefined,
    totalCount: Number(normalized.totalCount ?? 0),
    queryTime: Number(normalized.queryTime ?? 0),
    relevanceScores: isPlainObject(normalized.relevanceScores)
      ? (normalized.relevanceScores as Record<string, number>)
      : {},
  };
}

export function normalizePersistentMemoryStats(value: unknown): MemoryStats {
  const raw = isPlainObject(value) ? value : {};
  const healthSource = isPlainObject(raw.health) ? raw.health : {};

  return {
    countByLevel: isPlainObject(raw.countByLevel)
      ? (raw.countByLevel as Record<MemoryLevel, number>)
      : isPlainObject(raw.count_by_level)
        ? (raw.count_by_level as Record<MemoryLevel, number>)
        : {
            session: 0,
            intermediate: 0,
            long_term: 0,
          },
    countByTopic: isPlainObject(raw.countByTopic)
      ? (raw.countByTopic as Record<MemoryTopic, number>)
      : isPlainObject(raw.count_by_topic)
        ? (raw.count_by_topic as Record<MemoryTopic, number>)
        : ({} as Record<MemoryTopic, number>),
    countByType: isPlainObject(raw.countByType)
      ? (raw.countByType as Record<MemoryContentType, number>)
      : isPlainObject(raw.count_by_type)
        ? (raw.count_by_type as Record<MemoryContentType, number>)
        : ({} as Record<MemoryContentType, number>),
    totalSize: Number(raw.totalSize ?? raw.total_size ?? 0),
    sizeByLevel: isPlainObject(raw.sizeByLevel)
      ? (raw.sizeByLevel as Record<MemoryLevel, number>)
      : isPlainObject(raw.size_by_level)
        ? (raw.size_by_level as Record<MemoryLevel, number>)
        : {
            session: 0,
            intermediate: 0,
            long_term: 0,
          },
    lastWrite: Number(raw.lastWrite ?? raw.last_write ?? 0),
    lastRead: Number(raw.lastRead ?? raw.last_read ?? 0),
    summaryCount: Number(raw.summaryCount ?? raw.summary_count ?? 0),
    bundleCount: Number(raw.bundleCount ?? raw.bundle_count ?? 0),
    health: normalizePersistentMemoryHealth(healthSource),
  };
}

function normalizePersistentMemoryHealth(value: unknown): MemoryHealth {
  const raw = isPlainObject(value) ? value : {};
  return {
    status: String(raw.status ?? 'healthy') as MemoryHealth['status'],
    corruptedFiles: Number(raw.corruptedFiles ?? raw.corrupted_files ?? 0),
    lastIntegrityCheck: Number(raw.lastIntegrityCheck ?? raw.last_integrity_check ?? 0),
    diskSpacePercent: Number(raw.diskSpacePercent ?? raw.disk_space_percent ?? 0),
    encryptionActive: Boolean(raw.encryptionActive ?? raw.encryption_active ?? false),
    lastBackup: Number(raw.lastBackup ?? raw.last_backup ?? 0),
  };
}

export function normalizePersistentMemoryBundles(value: unknown): MemoryBundle[] {
  return normalizePersistentMemoryPayload(value) as MemoryBundle[];
}

export function normalizePersistentMemorySummaries(value: unknown): MemorySummary[] {
  return normalizePersistentMemoryPayload(value) as MemorySummary[];
}
