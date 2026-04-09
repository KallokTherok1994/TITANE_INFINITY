import type {
  LongTermMemoryEntry,
  MemoryEntry,
} from '@/services/memory/persistentMemory.config';

const GENERIC_KNOWLEDGE_TAGS = new Set([
  'knowledge-base',
  'default-kb',
  'system',
  'knowledge',
]);

function normalizeMemoryText(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractKnowledgeCategory(entry: LongTermMemoryEntry): string {
  const normalizedTags = (entry.tags ?? [])
    .map(tag => normalizeMemoryText(tag))
    .filter(tag => tag && !GENERIC_KNOWLEDGE_TAGS.has(tag) && !/^v?\d/.test(tag));

  return (
    normalizedTags[0] ||
    normalizeMemoryText(entry.title) ||
    normalizeMemoryText(entry.topic)
  );
}

function buildContentFingerprint(value: string): string {
  return normalizeMemoryText(value).slice(0, 240);
}

function buildMemorySemanticKey(entry: MemoryEntry): string | null {
  const hashKey = normalizeMemoryText(entry.metadata.contentHash ?? '');
  if (hashKey) {
    return `${entry.level}|${entry.contentType}|hash|${hashKey}`;
  }

  const contentKey = buildContentFingerprint(entry.content);
  if (entry.level === 'long_term' && entry.contentType === 'knowledge') {
    const titleKey = buildContentFingerprint(
      `${entry.title} ${entry.summary} ${extractKnowledgeCategory(entry)}`
    );

    if (contentKey.length >= 24) {
      return `knowledge|content|${contentKey}`;
    }

    if (titleKey) {
      return `knowledge|title|${titleKey}`;
    }

    return null;
  }

  if (!contentKey) {
    return null;
  }

  return `${entry.level}|${entry.contentType}|${normalizeMemoryText(entry.topic)}|${contentKey}`;
}

function scoreMemoryEntry(entry: LongTermMemoryEntry): number {
  return (
    (entry.metadata.accessCount ?? 0) * 10 +
    (entry.confidenceScore ?? 0) +
    entry.content.length / 10 +
    (entry.title ? 5 : 0) +
    (entry.userVerified ? 5 : 0)
  );
}

function scoreGenericMemoryEntry(entry: MemoryEntry): number {
  return (
    (entry.metadata.accessCount ?? 0) * 10 +
    entry.importance * 20 +
    entry.content.length / 10 +
    ('title' in entry && entry.title ? 5 : 0)
  );
}

function mergeKnowledgeEntries(
  existing: LongTermMemoryEntry,
  incoming: LongTermMemoryEntry
): LongTermMemoryEntry {
  const preferred =
    scoreMemoryEntry(incoming) > scoreMemoryEntry(existing) ? incoming : existing;
  const alternate = preferred === existing ? incoming : existing;

  return {
    ...preferred,
    title: preferred.title || alternate.title,
    summary:
      preferred.summary.length >= alternate.summary.length
        ? preferred.summary
        : alternate.summary,
    content:
      preferred.content.length >= alternate.content.length
        ? preferred.content
        : alternate.content,
    tags: Array.from(
      new Set([...(existing.tags ?? []), ...(incoming.tags ?? [])])
    ).filter(Boolean),
    sourceEntryIds: Array.from(
      new Set([...(existing.sourceEntryIds ?? []), ...(incoming.sourceEntryIds ?? [])])
    ).filter(Boolean),
    confidenceScore: Math.max(
      existing.confidenceScore ?? 0,
      incoming.confidenceScore ?? 0
    ),
    metadata: {
      ...preferred.metadata,
      createdAt: Math.min(existing.metadata.createdAt, incoming.metadata.createdAt),
      updatedAt: Math.max(existing.metadata.updatedAt, incoming.metadata.updatedAt),
      lastAccessedAt: Math.max(
        existing.metadata.lastAccessedAt ?? 0,
        incoming.metadata.lastAccessedAt ?? 0
      ),
      accessCount: Math.max(
        existing.metadata.accessCount ?? 0,
        incoming.metadata.accessCount ?? 0
      ),
      source: preferred.metadata.source ?? alternate.metadata.source,
      contentHash: preferred.metadata.contentHash ?? alternate.metadata.contentHash,
      schemaVersion: preferred.metadata.schemaVersion ?? alternate.metadata.schemaVersion,
    },
    version: Math.max(existing.version ?? 1, incoming.version ?? 1),
    versionHistory: Array.from(
      new Set([...(existing.versionHistory ?? []), ...(incoming.versionHistory ?? [])])
    ),
    editable: existing.editable || incoming.editable,
    userVerified: existing.userVerified || incoming.userVerified,
  };
}

function mergeMemoryEntries(existing: MemoryEntry, incoming: MemoryEntry): MemoryEntry {
  if (
    existing.level === 'long_term' &&
    existing.contentType === 'knowledge' &&
    incoming.level === 'long_term' &&
    incoming.contentType === 'knowledge'
  ) {
    return mergeKnowledgeEntries(existing, incoming);
  }

  const preferred =
    scoreGenericMemoryEntry(incoming) > scoreGenericMemoryEntry(existing)
      ? incoming
      : existing;
  const alternate = preferred === existing ? incoming : existing;

  return {
    ...preferred,
    tags: Array.from(
      new Set([...(existing.tags ?? []), ...(incoming.tags ?? [])])
    ).filter(Boolean),
    metadata: {
      ...preferred.metadata,
      createdAt: Math.min(existing.metadata.createdAt, incoming.metadata.createdAt),
      updatedAt: Math.max(existing.metadata.updatedAt, incoming.metadata.updatedAt),
      lastAccessedAt: Math.max(
        existing.metadata.lastAccessedAt ?? 0,
        incoming.metadata.lastAccessedAt ?? 0
      ),
      accessCount: Math.max(
        existing.metadata.accessCount ?? 0,
        incoming.metadata.accessCount ?? 0
      ),
      source: preferred.metadata.source ?? alternate.metadata.source,
      contentHash: preferred.metadata.contentHash ?? alternate.metadata.contentHash,
      schemaVersion: preferred.metadata.schemaVersion ?? alternate.metadata.schemaVersion,
    },
  };
}

export function dedupeMemoryEntries(entries: MemoryEntry[]): MemoryEntry[] {
  const entriesById = new Map<string, MemoryEntry>();

  for (const entry of entries) {
    if (!entry) {
      continue;
    }

    if (!entriesById.has(entry.id)) {
      entriesById.set(entry.id, entry);
      continue;
    }

    const current = entriesById.get(entry.id);
    if (current) {
      entriesById.set(entry.id, mergeMemoryEntries(current, entry));
    }
  }

  const deduped: MemoryEntry[] = [];
  const semanticKeyToIndex = new Map<string, number>();

  for (const entry of entriesById.values()) {
    const semanticKey = buildMemorySemanticKey(entry);

    if (!semanticKey) {
      deduped.push(entry);
      continue;
    }

    const existingIndex = semanticKeyToIndex.get(semanticKey);
    if (existingIndex === undefined) {
      semanticKeyToIndex.set(semanticKey, deduped.length);
      deduped.push(entry);
      continue;
    }

    const existingEntry = deduped[existingIndex];
    if (existingEntry) {
      deduped[existingIndex] = mergeMemoryEntries(existingEntry, entry);
    }
  }

  return deduped;
}
