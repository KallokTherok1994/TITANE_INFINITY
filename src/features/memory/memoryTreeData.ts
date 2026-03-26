import type {
  MemoryEntry,
  MemoryLevel,
  MemoryStats,
} from '@/services/memory/persistentMemory.config';
import {
  MEMORY_LEVEL_LABELS,
  MEMORY_TOPIC_LABELS,
} from '@/services/memory/persistentMemory.config';

export interface MemoryTreeNodeData {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  children?: MemoryTreeNodeData[];
}

type ViewerNodeType = 'root' | 'short' | 'mid' | 'long';

const LEVEL_TO_NODE_TYPE: Record<MemoryLevel, ViewerNodeType> = {
  session: 'short',
  intermediate: 'mid',
  long_term: 'long',
};

const LEVEL_ORDER: MemoryLevel[] = ['session', 'intermediate', 'long_term'];

function toNodeType(level: MemoryLevel): ViewerNodeType {
  return LEVEL_TO_NODE_TYPE[level];
}

function averageImportance(entries: MemoryEntry[]): number {
  if (entries.length === 0) {
    return 0;
  }

  const total = entries.reduce((sum, entry) => sum + entry.importance, 0);
  return Number((total / entries.length).toFixed(1));
}

function groupEntriesByTopic(entries: MemoryEntry[]): Array<[string, MemoryEntry[]]> {
  const grouped = new Map<string, MemoryEntry[]>();

  for (const entry of entries) {
    const bucket = grouped.get(entry.topic) ?? [];
    bucket.push(entry);
    grouped.set(entry.topic, bucket);
  }

  return Array.from(grouped.entries()).sort((a, b) => b[1].length - a[1].length);
}

function buildTopicNode(
  level: MemoryLevel,
  topic: string,
  entries: MemoryEntry[]
): MemoryTreeNodeData {
  const label = MEMORY_TOPIC_LABELS[topic as keyof typeof MEMORY_TOPIC_LABELS];
  const recent = entries
    .slice()
    .sort((a, b) => b.metadata.createdAt - a.metadata.createdAt)
    .slice(0, 3)
    .map(entry => ({
      name:
        entry.content.length > 48
          ? `${entry.content.slice(0, 48).trim()}...`
          : entry.content || ('title' in entry && entry.title ? entry.title : entry.id),
      attributes: {
        entryId: entry.id,
        type: toNodeType(level),
        level,
        topic: entry.topic,
        importance: entry.importance,
        accesses: entry.metadata.accessCount,
        createdAt: entry.metadata.createdAt,
      },
    }));

  return {
    name: `${label?.icon ?? '📝'} ${label?.label ?? topic}`,
    attributes: {
      type: toNodeType(level),
      topic,
      entries: entries.length,
      importance_moyenne: averageImportance(entries),
    },
    children: recent,
  };
}

function buildLevelNode(
  level: MemoryLevel,
  entries: MemoryEntry[],
  stats?: MemoryStats | null
): MemoryTreeNodeData {
  const label = MEMORY_LEVEL_LABELS[level];
  const sizeBytes = stats?.sizeByLevel?.[level] ?? 0;
  const groupedTopics = groupEntriesByTopic(entries);

  return {
    name: `${label.icon} ${label.label}`,
    attributes: {
      type: toNodeType(level),
      entries: stats?.countByLevel?.[level] ?? entries.length,
      topics: groupedTopics.length,
      taille_kb: Number((sizeBytes / 1024).toFixed(1)),
    },
    children:
      groupedTopics.length > 0
        ? groupedTopics.map(([topic, topicEntries]) =>
            buildTopicNode(level, topic, topicEntries)
          )
        : [
            {
              name: 'Aucune entree',
              attributes: {
                type: toNodeType(level),
                empty: true,
                entries: 0,
              },
            },
          ],
  };
}

export function buildPersistentMemoryTree(
  entries: MemoryEntry[],
  stats?: MemoryStats | null
): MemoryTreeNodeData {
  const totalEntries =
    (stats?.countByLevel?.session ?? 0) +
    (stats?.countByLevel?.intermediate ?? 0) +
    (stats?.countByLevel?.long_term ?? 0);

  return {
    name: 'Memoire TITANE',
    attributes: {
      type: 'root',
      entries: totalEntries || entries.length,
      resumes: stats?.summaryCount ?? 0,
      bundles: stats?.bundleCount ?? 0,
    },
    children: LEVEL_ORDER.map(level =>
      buildLevelNode(
        level,
        entries.filter(entry => entry.level === level),
        stats
      )
    ),
  };
}

function nodeMatchesSearch(node: MemoryTreeNodeData, searchTerm: string): boolean {
  if (!searchTerm) {
    return true;
  }

  const lowered = searchTerm.toLowerCase();
  if (node.name.toLowerCase().includes(lowered)) {
    return true;
  }

  return Object.values(node.attributes ?? {}).some(value =>
    String(value).toLowerCase().includes(lowered)
  );
}

export function filterMemoryTree(
  node: MemoryTreeNodeData,
  searchTerm: string,
  selectedType: string
): MemoryTreeNodeData | null {
  const children = (node.children ?? [])
    .map(child => filterMemoryTree(child, searchTerm, selectedType))
    .filter((child): child is MemoryTreeNodeData => child !== null);

  const nodeType = String(node.attributes?.type ?? 'root');
  const matchesType =
    selectedType === 'all' || nodeType === 'root' || nodeType === selectedType;
  const matchesSearch = nodeMatchesSearch(node, searchTerm);
  const keepNode = (matchesType && matchesSearch) || children.length > 0;

  if (!keepNode) {
    return null;
  }

  return {
    ...node,
    children,
  };
}

export function findMemoryTreeNodeByEntryId(
  node: MemoryTreeNodeData,
  entryId: string
): MemoryTreeNodeData | null {
  if (String(node.attributes?.entryId ?? '') === entryId) {
    return node;
  }

  for (const child of node.children ?? []) {
    const match = findMemoryTreeNodeByEntryId(child, entryId);
    if (match) {
      return match;
    }
  }

  return null;
}
