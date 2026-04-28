/**
 * TITANE∞ v31.2.33 — KnowledgeGraphIndex
 * Index de graphe de connaissance légèrement inspiré de HippoRAG:
 * co-occurrence topique entre entrées mémoire → relations 2-hop pour enrichissement contexte.
 *
 * Design:
 * - Stockage localStorage: titane_knowledge_graph_v1
 * - Nœuds: concepts extraits des entrées mémoire
 * - Arêtes: co-occurrence (deux entrées partagent un concept → arête)
 * - 2-hop traversal: getRelatedNodes(nodeId, maxHops=2)
 * - buildIndex(): reconstruit depuis un tableau d'entrées
 * - addEdge(): ajoute une relation manuelle ou issue d'enrichissement web
 */

// ─────────────────────────────────────────────────────────────────
// STORAGE KEY + CONSTANTS
// ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'titane_knowledge_graph_v1';
const MAX_NODES = 500;
const MAX_EDGES_PER_NODE = 20;

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  label: string;
  entryIds: string[];
  createdAt: number;
}

export interface GraphEdge {
  targetId: string;
  weight: number;
  updatedAt: number;
}

export interface KnowledgeGraph {
  nodes: Record<string, GraphNode>;
  /** adjacency list: nodeId → list of edges */
  edges: Record<string, GraphEdge[]>;
  version: number;
  lastBuilt: number;
}

/** Entrée minimale compatible avec MemoryEntry, StructuredMemoryEntry, etc. */
export interface GraphEntry {
  id: string;
  summary?: string;
  content?: string;
  tags?: string[];
}

// ─────────────────────────────────────────────────────────────────
// STORAGE HELPERS
// ─────────────────────────────────────────────────────────────────

function loadGraph(): KnowledgeGraph {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { nodes: {}, edges: {}, version: 1, lastBuilt: 0 };
    return JSON.parse(raw) as KnowledgeGraph;
  } catch {
    return { nodes: {}, edges: {}, version: 1, lastBuilt: 0 };
  }
}

function saveGraph(graph: KnowledgeGraph): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(graph));
  } catch {
    // localStorage full — silently ignore
  }
}

// ─────────────────────────────────────────────────────────────────
// TOKENIZATION
// ─────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'de', 'du', 'au', 'je',
  'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'que', 'qui', 'est', 'sont', 'a',
  'the', 'is', 'are', 'was', 'and', 'or', 'of', 'to', 'an', 'in', 'on', 'ce',
  'par', 'sur', 'pour', 'avec', 'pas', 'plus', 'dans', 'this', 'that', 'has',
]);

/** Extrait les tokens substantiels d'un texte pour construire les nœuds du graphe */
export function extractTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\séàùèêâîôûäëïöü]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w))
    .slice(0, 20);
}

/** Génère un ID de nœud depuis un label */
export function nodeId(label: string): string {
  return label.toLowerCase().replace(/\s+/g, '_').substring(0, 40);
}

// ─────────────────────────────────────────────────────────────────
// KNOWLEDGE GRAPH INDEX CLASS
// ─────────────────────────────────────────────────────────────────

class KnowledgeGraphIndexService {
  /**
   * Construit ou met à jour l'index depuis un tableau d'entrées mémoire.
   * Co-occurrence: si deux entrées partagent un token → arête entre leurs nœuds primaires.
   */
  buildIndex(entries: GraphEntry[]): void {
    const graph = loadGraph();

    // Limiter la taille des nœuds
    const nodeCount = Object.keys(graph.nodes).length;
    const entriesToProcess = entries.slice(0, MAX_NODES - nodeCount);

    // Map token → liste d'entryIds
    const tokenIndex: Record<string, string[]> = {};

    for (const entry of entriesToProcess) {
      const text = entry.summary || entry.content || '';
      const tokens = [
        ...extractTokens(text),
        ...(entry.tags || []),
      ];
      const primaryToken = tokens[0];
      if (!primaryToken) continue;

      const nid = nodeId(primaryToken);

      // Ajouter/mettre à jour le nœud
      if (!graph.nodes[nid]) {
        graph.nodes[nid] = {
          id: nid,
          label: primaryToken,
          entryIds: [entry.id],
          createdAt: Date.now(),
        };
      } else if (!graph.nodes[nid].entryIds.includes(entry.id)) {
        graph.nodes[nid].entryIds.push(entry.id);
      }

      // Index token → entryIds pour co-occurrence
      for (const token of tokens) {
        const tid = nodeId(token);
        if (!tokenIndex[tid]) tokenIndex[tid] = [];
        tokenIndex[tid].push(nid);
      }
    }

    // Construire les arêtes par co-occurrence
    for (const [, nodeIds] of Object.entries(tokenIndex)) {
      if (nodeIds.length < 2) continue;
      for (let i = 0; i < nodeIds.length; i++) {
        for (let j = i + 1; j < nodeIds.length; j++) {
          const a = nodeIds[i]!;
          const b = nodeIds[j]!;
          if (a !== b) {
            this._addOrUpdateEdge(graph, a, b, 0.5);
            this._addOrUpdateEdge(graph, b, a, 0.5);
          }
        }
      }
    }

    graph.lastBuilt = Date.now();
    saveGraph(graph);
  }

  /**
   * Ajoute ou renforce une arête entre deux nœuds. Crée les nœuds si absents.
   */
  addEdge(aLabel: string, bLabel: string, weight: number): void {
    const graph = loadGraph();
    const aid = nodeId(aLabel);
    const bid = nodeId(bLabel);
    // Upsert nodes so getRelatedLabels can resolve labels
    if (!graph.nodes[aid]) {
      graph.nodes[aid] = { id: aid, label: aLabel, entryIds: [], createdAt: Date.now() };
    }
    if (!graph.nodes[bid]) {
      graph.nodes[bid] = { id: bid, label: bLabel, entryIds: [], createdAt: Date.now() };
    }
    this._addOrUpdateEdge(graph, aid, bid, weight);
    this._addOrUpdateEdge(graph, bid, aid, weight);
    saveGraph(graph);
  }

  /**
   * Retourne les IDs de nœuds reliés au nœud donné en jusqu'à maxHops sauts.
   */
  getRelatedNodes(nId: string, maxHops = 2): string[] {
    const graph = loadGraph();
    const visited = new Set<string>([nId]);
    const frontier = [nId];

    for (let hop = 0; hop < maxHops; hop++) {
      const next: string[] = [];
      for (const current of frontier) {
        const edges = graph.edges[current] || [];
        for (const edge of edges) {
          if (!visited.has(edge.targetId)) {
            visited.add(edge.targetId);
            next.push(edge.targetId);
          }
        }
      }
      if (next.length === 0) break;
      frontier.length = 0;
      frontier.push(...next);
    }

    visited.delete(nId);
    return Array.from(visited);
  }

  /**
   * Retourne les labels des nœuds reliés (pour injection dans le prompt).
   */
  getRelatedLabels(nId: string, maxHops = 2): string[] {
    const graph = loadGraph();
    const relatedIds = this.getRelatedNodes(nId, maxHops);
    return relatedIds
      .map(id => graph.nodes[id]?.label)
      .filter(Boolean) as string[];
  }

  /**
   * Retourne les entrées mémoire reliées à un nœud (via entryIds).
   */
  getRelatedEntryIds(nId: string, maxHops = 2): string[] {
    const graph = loadGraph();
    const relatedIds = this.getRelatedNodes(nId, maxHops);
    const entryIds: string[] = [];
    for (const id of relatedIds) {
      const node = graph.nodes[id];
      if (node) entryIds.push(...node.entryIds);
    }
    return [...new Set(entryIds)];
  }

  /**
   * Retourne le graphe complet (pour debug/diagnostic).
   */
  getGraph(): KnowledgeGraph {
    return loadGraph();
  }

  /**
   * Vide le graphe (pour tests).
   */
  clear(): void {
    saveGraph({ nodes: {}, edges: {}, version: 1, lastBuilt: 0 });
  }

  private _addOrUpdateEdge(graph: KnowledgeGraph, fromId: string, toId: string, weight: number): void {
    if (!graph.edges[fromId]) graph.edges[fromId] = [];
    const edges = graph.edges[fromId];
    const existing = edges.find(e => e.targetId === toId);
    if (existing) {
      existing.weight = Math.min(1, existing.weight + weight * 0.1);
      existing.updatedAt = Date.now();
    } else {
      // Limit edges per node
      if (edges.length >= MAX_EDGES_PER_NODE) {
        // Remove weakest edge
        const minIdx = edges.reduce((minI, e, i, arr) => (e.weight < arr[minI]!.weight ? i : minI), 0);
        edges.splice(minIdx, 1);
      }
      edges.push({ targetId: toId, weight, updatedAt: Date.now() });
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// SINGLETON EXPORT
// ─────────────────────────────────────────────────────────────────

export const knowledgeGraphIndex = new KnowledgeGraphIndexService();
