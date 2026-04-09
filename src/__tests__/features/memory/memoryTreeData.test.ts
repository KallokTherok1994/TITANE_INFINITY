import { describe, expect, it } from 'vitest';
import {
  buildPersistentMemoryTree,
  filterMemoryTree,
  findMemoryTreeNodeByEntryId,
} from '@/features/memory/memoryTreeData';
import type { MemoryEntry, MemoryStats } from '@/services/memory/persistentMemory.config';

const baseMetadata = {
  updatedAt: 0,
  accessCount: 0,
  source: 'chat_user' as const,
  schemaVersion: '1.0.0',
};

const entries: MemoryEntry[] = [
  {
    id: 's1',
    level: 'session',
    contentType: 'message',
    content: 'Contexte actif coding',
    topic: 'coding',
    importance: 2,
    tags: ['code'],
    metadata: {
      ...baseMetadata,
      createdAt: 100,
    },
    ttl: 1000,
    promotable: true,
  },
  {
    id: 'i1',
    level: 'intermediate',
    contentType: 'summary',
    title: 'Resume projet',
    content: 'Synthese projet actuelle',
    topic: 'project',
    importance: 4,
    tags: ['projet'],
    status: 'active',
    metadata: {
      ...baseMetadata,
      createdAt: 200,
    },
    sourceEntryIds: [],
    relevanceScore: 0.8,
    expiresAt: 1000,
    promotable: true,
  },
  {
    id: 'l1',
    level: 'long_term',
    contentType: 'knowledge',
    title: 'Preference stable',
    summary: 'Preference utilisateur',
    content: 'Utilisateur prefere Ollama local',
    topic: 'preferences',
    importance: 5,
    tags: ['ollama'],
    status: 'active',
    metadata: {
      ...baseMetadata,
      createdAt: 300,
      accessCount: 2,
    },
    sourceEntryIds: [],
    confidenceScore: 100,
    userVerified: true,
    editable: true,
    version: 1,
    versionHistory: [],
  },
];

const stats: MemoryStats = {
  countByLevel: {
    session: 1,
    intermediate: 1,
    long_term: 1,
  },
  countByTopic: {
    general: 0,
    coding: 1,
    project: 1,
    personal: 0,
    technical: 0,
    creative: 0,
    learning: 0,
    decisions: 0,
    preferences: 1,
    automation: 0,
    system: 0,
  },
  countByType: {
    message: 1,
    summary: 1,
    knowledge: 1,
    preference: 0,
    project_context: 0,
    code_snippet: 0,
    decision: 0,
    reference: 0,
    identity: 0,
    automation_result: 0,
    milestone: 0,
  },
  totalSize: 3072,
  sizeByLevel: {
    session: 1024,
    intermediate: 1024,
    long_term: 1024,
  },
  lastWrite: 0,
  lastRead: 0,
  summaryCount: 2,
  bundleCount: 1,
  health: {
    status: 'healthy',
    corruptedFiles: 0,
    lastIntegrityCheck: 0,
    diskSpacePercent: 100,
    encryptionActive: true,
    lastBackup: 0,
  },
};

describe('memoryTreeData', () => {
  it('builds a real tree from persistent memory entries and stats', () => {
    const tree = buildPersistentMemoryTree(entries, stats);

    expect(tree.name).toBe('Memoire TITANE');
    expect(tree.attributes?.entries).toBe(3);
    expect(tree.attributes?.resumes).toBe(2);
    expect(tree.children?.map(child => child.name)).toEqual([
      '⏱️ Session',
      '📝 Intermédiaire',
      '🗄️ Long Terme',
    ]);
    expect(tree.children?.[2]?.attributes?.entries).toBe(1);
    expect(tree.children?.[2]?.children?.[0]?.name).toContain('Préférences');
  });

  it('filters the tree by search term while preserving parent ancestry', () => {
    const tree = buildPersistentMemoryTree(entries, stats);
    const filtered = filterMemoryTree(tree, 'ollama', 'all');

    expect(filtered?.name).toBe('Memoire TITANE');
    expect(filtered?.children?.map(child => child.name)).toEqual(['🗄️ Long Terme']);
    expect(filtered?.children?.[0]?.children?.[0]?.children?.[0]?.name).toContain(
      'Ollama'
    );
  });

  it('filters the tree by node type', () => {
    const tree = buildPersistentMemoryTree(entries, stats);
    const filtered = filterMemoryTree(tree, '', 'long');

    expect(filtered?.children?.map(child => child.name)).toEqual(['🗄️ Long Terme']);
  });

  it('finds a leaf node by persistent entry id', () => {
    const tree = buildPersistentMemoryTree(entries, stats);
    const node = findMemoryTreeNodeByEntryId(tree, 'l1');

    expect(node).not.toBeNull();
    expect(node?.attributes?.entryId).toBe('l1');
    expect(node?.attributes?.topic).toBe('preferences');
  });

  it('keeps older topic entries reachable when a branch has more than three memories', () => {
    const tree = buildPersistentMemoryTree(
      [
        ...entries,
        {
          ...entries[2],
          id: 'l2',
          title: 'Preference secondaire',
          content: 'Preference secondaire plus recente',
          metadata: {
            ...entries[2].metadata,
            createdAt: 400,
          },
        },
        {
          ...entries[2],
          id: 'l3',
          title: 'Preference tertiaire',
          content: 'Preference tertiaire plus recente',
          metadata: {
            ...entries[2].metadata,
            createdAt: 500,
          },
        },
        {
          ...entries[2],
          id: 'l4',
          title: 'Preference quaternaire',
          content: 'Preference quaternaire plus recente',
          metadata: {
            ...entries[2].metadata,
            createdAt: 600,
          },
        },
      ],
      {
        ...stats,
        countByLevel: {
          ...stats.countByLevel,
          long_term: 4,
        },
        countByTopic: {
          ...stats.countByTopic,
          preferences: 4,
        },
      }
    );

    expect(findMemoryTreeNodeByEntryId(tree, 'l1')).not.toBeNull();
  });
});
