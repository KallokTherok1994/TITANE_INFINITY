/**
 * TITANE_INFINITY v∞.42 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   SQLITE VECTOR STORE v2.0 — Unified Memory Implementation
 *   Adapted for UnifiedMemory system
 * ═══════════════════════════════════════════════════════════════════════════
 */

import Database from 'better-sqlite3';
import type {
  UnifiedMemoryEntry,
  UnifiedMemoryResult,
  UnifiedMemoryStats,
  UnifiedMemoryType,
  IVectorStore,
} from './UnifiedMemory';
import type { MemoryTier } from '../mcp/mcp.types';

/**
 * Configuration
 */
export interface SQLiteVectorStoreConfig {
  dbPath: string;
  tableName: string;
  dimensions: number;
  sqliteOptions?: {
    readonly?: boolean;
    fileMustExist?: boolean;
    timeout?: number;
    verbose?: boolean;
  };
}

/**
 * SQLite Vector Store for UnifiedMemory
 *
 * Storage layer for unified memory system using SQLite
 * Handles persistence, search, and indexing
 */
export class SQLiteVectorStore implements IVectorStore {
  private db?: Database.Database;
  private config: SQLiteVectorStoreConfig;
  private isInitialized = false;

  constructor(config: SQLiteVectorStoreConfig) {
    this.config = config;
  }

  /**
   * Initialize store
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create/open database
      this.db = new Database(this.config.dbPath, this.config.sqliteOptions as any);

      // Enable WAL mode for better performance
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');
      this.db.pragma('cache_size = -64000'); // 64MB cache

      // Create tables
      this.createTables();

      // Create indexes
      this.createIndexes();

      this.isInitialized = true;
      console.log('[SQLiteVectorStore] Initialized:', this.config.dbPath);
    } catch (error) {
      console.error('[SQLiteVectorStore] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create database tables
   */
  private createTables(): void {
    if (!this.db) throw new Error('Database not initialized');

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.config.tableName} (
        id TEXT PRIMARY KEY,
        tier TEXT NOT NULL,
        type TEXT NOT NULL,
        summary TEXT NOT NULL,
        details TEXT,
        embedding BLOB,
        owner TEXT NOT NULL,
        tags TEXT NOT NULL,
        source_type TEXT NOT NULL,
        source_id TEXT,
        source_timestamp INTEGER NOT NULL,
        source_context TEXT,
        importance REAL NOT NULL,
        confidence REAL NOT NULL,
        strength REAL NOT NULL,
        is_useful INTEGER NOT NULL,
        is_true INTEGER NOT NULL,
        is_structuring INTEGER NOT NULL,
        is_stable INTEGER NOT NULL,
        is_reusable INTEGER NOT NULL,
        created INTEGER NOT NULL,
        accessed INTEGER NOT NULL,
        access_count INTEGER NOT NULL,
        last_used INTEGER,
        valid_until INTEGER,
        related_to TEXT,
        supersedes TEXT,
        compression_level REAL NOT NULL,
        is_duplicate INTEGER
      )
    `);
  }

  /**
   * Create indexes for faster queries
   */
  private createIndexes(): void {
    if (!this.db) throw new Error('Database not initialized');

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_tier ON ${this.config.tableName}(tier);
      CREATE INDEX IF NOT EXISTS idx_type ON ${this.config.tableName}(type);
      CREATE INDEX IF NOT EXISTS idx_owner ON ${this.config.tableName}(owner);
      CREATE INDEX IF NOT EXISTS idx_importance ON ${this.config.tableName}(importance);
      CREATE INDEX IF NOT EXISTS idx_created ON ${this.config.tableName}(created);
      CREATE INDEX IF NOT EXISTS idx_accessed ON ${this.config.tableName}(accessed);
    `);
  }

  /**
   * Add entry
   */
  async add(entry: UnifiedMemoryEntry): Promise<void> {
    if (!this.db) throw new Error('Store not initialized');

    const stmt = this.db.prepare(`
      INSERT INTO ${this.config.tableName} (
        id, tier, type, summary, details, embedding, owner, tags,
        source_type, source_id, source_timestamp, source_context,
        importance, confidence, strength,
        is_useful, is_true, is_structuring, is_stable, is_reusable,
        created, accessed, access_count, last_used, valid_until,
        related_to, supersedes, compression_level, is_duplicate
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?
      )
    `);

    stmt.run(
      entry.id,
      entry.tier,
      entry.type,
      entry.summary,
      entry.details || null,
      entry.embedding ? this.serializeEmbedding(entry.embedding) : null,
      entry.owner,
      JSON.stringify(entry.tags),
      entry.source.type,
      entry.source.id || null,
      entry.source.timestamp,
      entry.source.context || null,
      entry.importance,
      entry.confidence,
      entry.strength,
      entry.isUseful ? 1 : 0,
      entry.isTrue ? 1 : 0,
      entry.isStructuring ? 1 : 0,
      entry.isStable ? 1 : 0,
      entry.isReusable ? 1 : 0,
      entry.created,
      entry.accessed,
      entry.accessCount,
      entry.lastUsed || null,
      entry.validUntil || null,
      entry.relatedTo ? JSON.stringify(entry.relatedTo) : null,
      entry.supersedes || null,
      entry.compressionLevel,
      entry.isDuplicate ? 1 : 0
    );
  }

  /**
   * Add multiple entries in batch
   */
  async addBatch(entries: UnifiedMemoryEntry[]): Promise<void> {
    if (!this.db) throw new Error('Store not initialized');

    const insertMany = this.db.transaction((entries: UnifiedMemoryEntry[]) => {
      for (const entry of entries) {
        this.add(entry);
      }
    });

    insertMany(entries);
  }

  /**
   * Search by similarity
   */
  async search(
    embedding: number[],
    limit: number,
    filters?: Record<string, any>
  ): Promise<UnifiedMemoryResult[]> {
    if (!this.db) throw new Error('Store not initialized');

    // Build WHERE clause from filters
    const whereClauses: string[] = [];
    const params: any[] = [];

    if (filters?.tiers && filters.tiers.length > 0) {
      whereClauses.push(`tier IN (${filters.tiers.map(() => '?').join(',')})`);
      params.push(...filters.tiers);
    }

    if (filters?.types && filters.types.length > 0) {
      whereClauses.push(`type IN (${filters.types.map(() => '?').join(',')})`);
      params.push(...filters.types);
    }

    if (filters?.owner) {
      whereClauses.push('owner = ?');
      params.push(filters.owner);
    }

    if (filters?.minImportance !== undefined) {
      whereClauses.push('importance >= ?');
      params.push(filters.minImportance);
    }

    if (filters?.minCreated !== undefined) {
      whereClauses.push('created >= ?');
      params.push(filters.minCreated);
    }

    // Query all entries matching filters
    const whereClause =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const stmt = this.db.prepare(`
      SELECT * FROM ${this.config.tableName}
      ${whereClause}
      LIMIT ?
    `);

    const rows = stmt.all(...params, limit * 3); // Get more for similarity filtering

    // Calculate similarities and sort
    const results: UnifiedMemoryResult[] = [];
    for (const row of rows) {
      const entry = this.rowToEntry(row);
      if (!entry.embedding) continue;

      const similarity = this.cosineSimilarity(embedding, entry.embedding);

      results.push({
        entry,
        score: similarity,
        similarity,
      });
    }

    // Sort by similarity and take top N
    return results
      .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
      .slice(0, limit);
  }

  /**
   * Get entry by ID
   */
  async get(id: string): Promise<UnifiedMemoryEntry | null> {
    if (!this.db) throw new Error('Store not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM ${this.config.tableName}
      WHERE id = ?
    `);

    const row = stmt.get(id);
    return row ? this.rowToEntry(row) : null;
  }

  /**
   * Update entry
   */
  async update(id: string, updates: Partial<UnifiedMemoryEntry>): Promise<void> {
    if (!this.db) throw new Error('Store not initialized');

    const setClauses: string[] = [];
    const params: any[] = [];

    // Build SET clause dynamically
    if (updates.tier !== undefined) {
      setClauses.push('tier = ?');
      params.push(updates.tier);
    }
    if (updates.summary !== undefined) {
      setClauses.push('summary = ?');
      params.push(updates.summary);
    }
    if (updates.details !== undefined) {
      setClauses.push('details = ?');
      params.push(updates.details);
    }
    if (updates.importance !== undefined) {
      setClauses.push('importance = ?');
      params.push(updates.importance);
    }
    if (updates.strength !== undefined) {
      setClauses.push('strength = ?');
      params.push(updates.strength);
    }
    if (updates.accessed !== undefined) {
      setClauses.push('accessed = ?');
      params.push(updates.accessed);
    }
    if (updates.accessCount !== undefined) {
      setClauses.push('access_count = ?');
      params.push(updates.accessCount);
    }
    if (updates.lastUsed !== undefined) {
      setClauses.push('last_used = ?');
      params.push(updates.lastUsed);
    }
    if (updates.supersedes !== undefined) {
      setClauses.push('supersedes = ?');
      params.push(updates.supersedes);
    }

    if (setClauses.length === 0) return;

    params.push(id);

    const stmt = this.db.prepare(`
      UPDATE ${this.config.tableName}
      SET ${setClauses.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...params);
  }

  /**
   * Delete entry
   */
  async delete(id: string): Promise<void> {
    if (!this.db) throw new Error('Store not initialized');

    const stmt = this.db.prepare(`
      DELETE FROM ${this.config.tableName}
      WHERE id = ?
    `);

    stmt.run(id);
  }

  /**
   * Delete entries matching filters
   */
  async deleteWhere(filters: Record<string, any>): Promise<number> {
    if (!this.db) throw new Error('Store not initialized');

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (filters.importance?.$lt !== undefined) {
      whereClauses.push('importance < ?');
      params.push(filters.importance.$lt);
    }

    if (filters.tier !== undefined) {
      whereClauses.push('tier = ?');
      params.push(filters.tier);
    }

    if (filters.created?.$lt !== undefined) {
      whereClauses.push('created < ?');
      params.push(filters.created.$lt);
    }

    if (whereClauses.length === 0) return 0;

    const stmt = this.db.prepare(`
      DELETE FROM ${this.config.tableName}
      WHERE ${whereClauses.join(' AND ')}
    `);

    const result = stmt.run(...params);
    return result.changes;
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<UnifiedMemoryStats> {
    if (!this.db) throw new Error('Store not initialized');

    // Total count
    const totalStmt = this.db.prepare(
      `SELECT COUNT(*) as count FROM ${this.config.tableName}`
    );
    const total = (totalStmt.get() as any).count;

    // By tier
    const tierStmt = this.db.prepare(`
      SELECT tier, COUNT(*) as count
      FROM ${this.config.tableName}
      GROUP BY tier
    `);
    const tierRows = tierStmt.all() as any[];
    const byTier: Record<MemoryTier, number> = {
      SHORT_TERM: 0,
      MEDIUM_TERM: 0,
      LONG_TERM: 0,
      META_MEMORY: 0,
    };
    tierRows.forEach(row => {
      byTier[row.tier as MemoryTier] = row.count;
    });

    // By type
    const typeStmt = this.db.prepare(`
      SELECT type, COUNT(*) as count
      FROM ${this.config.tableName}
      GROUP BY type
    `);
    const typeRows = typeStmt.all() as any[];
    const byType: Record<UnifiedMemoryType, number> = {} as any;
    typeRows.forEach(row => {
      byType[row.type as UnifiedMemoryType] = row.count;
    });

    // By importance
    const importanceStmt = this.db.prepare(`
      SELECT
        SUM(CASE WHEN importance < 0.4 THEN 1 ELSE 0 END) as low,
        SUM(CASE WHEN importance >= 0.4 AND importance < 0.7 THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN importance >= 0.7 AND importance < 0.9 THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN importance >= 0.9 THEN 1 ELSE 0 END) as critical
      FROM ${this.config.tableName}
    `);
    const importanceRow = importanceStmt.get() as any;

    // Temporal stats
    const temporalStmt = this.db.prepare(`
      SELECT MIN(created) as oldest, MAX(created) as newest
      FROM ${this.config.tableName}
    `);
    const temporalRow = temporalStmt.get() as any;

    return {
      total,
      byTier,
      byType,
      byImportance: {
        low: importanceRow.low || 0,
        medium: importanceRow.medium || 0,
        high: importanceRow.high || 0,
        critical: importanceRow.critical || 0,
      },
      avgEmbeddingTimeMs: 0, // Tracked by UnifiedMemory
      avgRetrievalTimeMs: 0, // Tracked by UnifiedMemory
      storageSizeMB: 0, // TODO: Calculate from file size
      oldestMemory: temporalRow.oldest || 0,
      newestMemory: temporalRow.newest || 0,
    };
  }

  /**
   * Cleanup (vacuum database)
   */
  async cleanup(): Promise<void> {
    if (!this.db) throw new Error('Store not initialized');
    this.db.pragma('vacuum');
  }

  /**
   * Close database
   */
  async close(): Promise<void> {
    if (!this.db) return;
    this.db.close();
    this.db = undefined;
    this.isInitialized = false;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Serialize embedding to buffer
   */
  private serializeEmbedding(embedding: number[]): Buffer {
    const buffer = Buffer.allocUnsafe(embedding.length * 4);
    for (let i = 0; i < embedding.length; i++) {
      buffer.writeFloatLE(embedding[i], i * 4);
    }
    return buffer;
  }

  /**
   * Deserialize embedding from buffer
   */
  private deserializeEmbedding(buffer: Buffer): number[] {
    const embedding: number[] = [];
    for (let i = 0; i < buffer.length; i += 4) {
      embedding.push(buffer.readFloatLE(i));
    }
    return embedding;
  }

  /**
   * Convert database row to UnifiedMemoryEntry
   */
  private rowToEntry(row: any): UnifiedMemoryEntry {
    return {
      id: row.id,
      tier: row.tier,
      type: row.type,
      summary: row.summary,
      details: row.details || undefined,
      embedding: row.embedding ? this.deserializeEmbedding(row.embedding) : undefined,
      owner: row.owner,
      tags: JSON.parse(row.tags),
      source: {
        type: row.source_type,
        id: row.source_id || undefined,
        timestamp: row.source_timestamp,
        context: row.source_context || undefined,
      },
      importance: row.importance,
      confidence: row.confidence,
      strength: row.strength,
      isUseful: row.is_useful === 1,
      isTrue: row.is_true === 1,
      isStructuring: row.is_structuring === 1,
      isStable: row.is_stable === 1,
      isReusable: row.is_reusable === 1,
      created: row.created,
      accessed: row.accessed,
      accessCount: row.access_count,
      lastUsed: row.last_used || undefined,
      validUntil: row.valid_until || undefined,
      relatedTo: row.related_to ? JSON.parse(row.related_to) : undefined,
      supersedes: row.supersedes || undefined,
      compressionLevel: row.compression_level,
      isDuplicate: row.is_duplicate === 1,
    };
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same dimensions');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (normA * normB);
  }
}
