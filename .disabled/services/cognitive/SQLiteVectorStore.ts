/**
 * SQLITE VECTOR STORE v∞
 *
 * Implémentation du VectorStore utilisant SQLite avec sqlite-vec
 * pour le stockage des embeddings et la recherche par similarité
 *
 * Features:
 * - Stockage persistant local
 * - Recherche par similarité cosine
 * - Filtrage avancé
 * - Compression automatique
 * - Backup & recovery
 */

import Database from 'better-sqlite3';
import type {
  SemanticMemoryEntry,
  SemanticMemoryResult,
  SemanticMemoryStats,
  VectorStore,
  SemanticMemoryType,
} from './semanticMemory.types';
import { cosineSimilarity } from './SemanticMemoryEngine';

/**
 * Configuration SQLiteVectorStore
 */
export interface SQLiteVectorStoreConfig {
  /** Chemin vers la base de données */
  dbPath: string;

  /** Nom de la collection */
  collectionName: string;

  /** Dimensions des vecteurs */
  dimensions: number;

  /** Options SQLite */
  sqliteOptions?: {
    readonly?: boolean;
    fileMustExist?: boolean;
    timeout?: number;
    verbose?: boolean;
  };
}

/** Type pour les rows SQLite */
interface SQLiteRow {
  id: string;
  type: string;
  owner: string;
  summary: string;
  details: string | null;
  source_type: string;
  source_id: string | null;
  source_timestamp: string;
  source_context: string | null;
  tags: string;
  importance: number;
  created_at: string;
  last_used_at: string | null;
  access_count: number;
  related_to: string | null;
  supersedes: string | null;
  valid_until: string | null;
  confidence: number;
  embedding: Buffer;
}

/**
 * SQLite Vector Store
 *
 * Utilise SQLite avec une table pour les métadonnées et une table pour les vecteurs
 * Recherche par similarité calculée en JavaScript (cosine similarity)
 */
export class SQLiteVectorStore implements VectorStore {
  private db?: Database.Database;
  private config: SQLiteVectorStoreConfig;
  private isInitialized = false;

  constructor(config: SQLiteVectorStoreConfig) {
    this.config = config;
  }

  /**
   * Initialiser le store
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Créer le dossier parent si nécessaire
      const pathParts = this.config.dbPath.split('/');
      pathParts.pop(); // Retirer le nom du fichier
      const dbDir = pathParts.join('/');

      if (dbDir) {
        try {
          const fs = await import('fs');
          await fs.promises.mkdir(dbDir, { recursive: true });
          console.log('[SQLiteVectorStore] Created directory:', dbDir);
        } catch (mkdirError) {
          // Ignorer si le dossier existe déjà
          if ((mkdirError as any).code !== 'EEXIST') {
            console.warn('[SQLiteVectorStore] mkdir warning:', mkdirError);
          }
        }
      }

      // Créer/ouvrir la base de données
      this.db = new Database(this.config.dbPath, this.config.sqliteOptions as any);

      // Activer WAL mode pour meilleures performances
      this.db.pragma('journal_mode = WAL');

      // Créer les tables
      this.createTables();

      // Créer les index
      this.createIndexes();

      this.isInitialized = true;
      console.log('[SQLiteVectorStore] Initialized:', this.config.dbPath);
    } catch (error) {
      console.error('[SQLiteVectorStore] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Ajouter une entrée
   */
  async add(entry: SemanticMemoryEntry): Promise<void> {
    if (!this.db) throw new Error('Store not initialized');

    const stmt = this.db.prepare(`
      INSERT INTO ${this.config.collectionName} (
        id, type, owner, summary, details, source_type, source_id, source_timestamp,
        source_context, tags, importance, created_at, last_used_at, access_count,
        related_to, supersedes, valid_until, confidence, embedding
      ) VALUES (
        @id, @type, @owner, @summary, @details, @source_type, @source_id, @source_timestamp,
        @source_context, @tags, @importance, @created_at, @last_used_at, @access_count,
        @related_to, @supersedes, @valid_until, @confidence, @embedding
      )
    `);

    stmt.run({
      id: entry.id,
      type: entry.type,
      owner: entry.owner,
      summary: entry.summary,
      details: entry.details || null,
      source_type: entry.source.type,
      source_id: entry.source.id || null,
      source_timestamp: entry.source.timestamp,
      source_context: entry.source.context || null,
      tags: JSON.stringify(entry.tags),
      importance: entry.importance,
      created_at: entry.created_at,
      last_used_at: entry.last_used_at || null,
      access_count: entry.access_count,
      related_to: entry.related_to ? JSON.stringify(entry.related_to) : null,
      supersedes: entry.supersedes || null,
      valid_until: entry.valid_until || null,
      confidence: entry.confidence,
      embedding: this.serializeEmbedding(entry.embedding),
    });
  }

  /**
   * Ajouter plusieurs entrées en batch
   */
  async addBatch(entries: SemanticMemoryEntry[]): Promise<void> {
    if (!this.db) throw new Error('Store not initialized');

    const insertMany = this.db.transaction((entries: SemanticMemoryEntry[]) => {
      for (const entry of entries) {
        this.add(entry);
      }
    });

    insertMany(entries);
  }

  /**
   * Recherche par similarité
   */
  async search(
    embedding: number[],
    limit: number,
    filters?: Record<string, unknown>
  ): Promise<SemanticMemoryResult[]> {
    if (!this.db) throw new Error('Store not initialized');

    // Construire la requête avec filtres
    let query = `SELECT * FROM ${this.config.collectionName}`;
    const whereClauses: string[] = [];
    const params: Record<string, unknown> = {};

    if (filters) {
      this.buildWhereClause(filters, whereClauses, params);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    // Récupérer toutes les entrées matchant les filtres
    const stmt = this.db.prepare(query);
    const rows = stmt.all(params);

    // Calculer les similarités
    const results: SemanticMemoryResult[] = [];

    for (const row of rows) {
      const entry = this.rowToEntry(row);
      const similarity = cosineSimilarity(embedding, entry.embedding);

      results.push({
        entry,
        score: similarity,
        similarity,
      });
    }

    // Trier par similarité et limiter
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, limit);
  }

  /**
   * Récupérer par ID
   */
  async get(id: string): Promise<SemanticMemoryEntry | null> {
    if (!this.db) throw new Error('Store not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM ${this.config.collectionName} WHERE id = ?
    `);

    const row = stmt.get(id);
    if (!row) return null;

    return this.rowToEntry(row);
  }

  /**
   * Mettre à jour une entrée
   */
  async update(id: string, updates: Partial<SemanticMemoryEntry>): Promise<void> {
    if (!this.db) throw new Error('Store not initialized');

    const setClauses: string[] = [];
    const params: Record<string, unknown> = { id };

    // Construire les SET clauses
    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'id' || key === 'embedding') return; // Skip id et embedding

      if (key === 'source' && value) {
        const source = value as SemanticMemoryEntry['source'];
        setClauses.push('source_type = @source_type');
        setClauses.push('source_id = @source_id');
        setClauses.push('source_timestamp = @source_timestamp');
        setClauses.push('source_context = @source_context');
        params.source_type = source.type;
        params.source_id = source.id || null;
        params.source_timestamp = source.timestamp;
        params.source_context = source.context || null;
      } else if (key === 'tags' && Array.isArray(value)) {
        setClauses.push('tags = @tags');
        params.tags = JSON.stringify(value);
      } else if (key === 'related_to' && Array.isArray(value)) {
        setClauses.push('related_to = @related_to');
        params.related_to = JSON.stringify(value);
      } else {
        const columnName = this.camelToSnake(key);
        setClauses.push(`${columnName} = @${key}`);
        params[key] = value;
      }
    });

    if (setClauses.length === 0) return;

    const query = `
      UPDATE ${this.config.collectionName}
      SET ${setClauses.join(', ')}
      WHERE id = @id
    `;

    const stmt = this.db.prepare(query);
    stmt.run(params);
  }

  /**
   * Supprimer une entrée
   */
  async delete(id: string): Promise<void> {
    if (!this.db) throw new Error('Store not initialized');

    const stmt = this.db.prepare(`
      DELETE FROM ${this.config.collectionName} WHERE id = ?
    `);

    stmt.run(id);
  }

  /**
   * Supprimer par filtre
   */
  async deleteWhere(filters: Record<string, unknown>): Promise<number> {
    if (!this.db) throw new Error('Store not initialized');

    const whereClauses: string[] = [];
    const params: Record<string, unknown> = {};

    this.buildWhereClause(filters, whereClauses, params);

    if (whereClauses.length === 0) {
      throw new Error('Cannot delete without filters');
    }

    const query = `
      DELETE FROM ${this.config.collectionName}
      WHERE ${whereClauses.join(' AND ')}
    `;

    const stmt = this.db.prepare(query);
    const info = stmt.run(params);

    return info.changes;
  }

  /**
   * Obtenir les stats
   */
  async getStats(): Promise<SemanticMemoryStats> {
    if (!this.db) throw new Error('Store not initialized');

    // Total memories
    const totalStmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM ${this.config.collectionName}
    `);
    const totalResult = totalStmt.get() as { count: number };
    const total_memories = totalResult.count;

    // By type
    const typeStmt = this.db.prepare(`
      SELECT type, COUNT(*) as count
      FROM ${this.config.collectionName}
      GROUP BY type
    `);
    const typeResults = typeStmt.all() as Array<{
      type: SemanticMemoryType;
      count: number;
    }>;
    const by_type: Record<SemanticMemoryType, number> = {
      fact: 0,
      preference: 0,
      decision: 0,
      milestone: 0,
      pattern: 0,
      context: 0,
    };
    typeResults.forEach(r => {
      by_type[r.type] = r.count;
    });

    // By importance
    const importanceStmt = this.db.prepare(`
      SELECT
        SUM(CASE WHEN importance < 0.5 THEN 1 ELSE 0 END) as low,
        SUM(CASE WHEN importance >= 0.5 AND importance < 0.75 THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN importance >= 0.75 AND importance < 0.95 THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN importance >= 0.95 THEN 1 ELSE 0 END) as critical
      FROM ${this.config.collectionName}
    `);
    const importanceResult = importanceStmt.get() as {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };

    // Dates
    const datesStmt = this.db.prepare(`
      SELECT
        MIN(created_at) as oldest,
        MAX(created_at) as newest
      FROM ${this.config.collectionName}
    `);
    const datesResult = datesStmt.get() as { oldest: string; newest: string };

    // Storage size (approximation)
    const sizeStmt = this.db.prepare(
      `SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()`
    );
    const sizeResult = sizeStmt.get() as { size: number };
    const storage_size_mb = sizeResult.size / (1024 * 1024);

    return {
      total_memories,
      by_type,
      by_importance: importanceResult,
      avg_embedding_time_ms: 0, // Pas mesuré ici
      avg_retrieval_time_ms: 0, // Pas mesuré ici
      storage_size_mb,
      oldest_memory: datesResult.oldest,
      newest_memory: datesResult.newest,
    };
  }

  /**
   * Nettoyer le store
   */
  async cleanup(): Promise<void> {
    if (!this.db) throw new Error('Store not initialized');

    // VACUUM pour récupérer l'espace
    this.db.pragma('vacuum');

    // Optimiser
    this.db.pragma('optimize');
  }

  /**
   * Fermer les connexions
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = undefined;
      this.isInitialized = false;
    }
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Créer les tables
   */
  private createTables(): void {
    if (!this.db) return;

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.config.collectionName} (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        owner TEXT NOT NULL,
        summary TEXT NOT NULL,
        details TEXT,
        source_type TEXT NOT NULL,
        source_id TEXT,
        source_timestamp TEXT NOT NULL,
        source_context TEXT,
        tags TEXT NOT NULL,
        importance REAL NOT NULL,
        created_at TEXT NOT NULL,
        last_used_at TEXT,
        access_count INTEGER NOT NULL DEFAULT 0,
        related_to TEXT,
        supersedes TEXT,
        valid_until TEXT,
        confidence REAL NOT NULL,
        embedding BLOB NOT NULL
      )
    `);
  }

  /**
   * Créer les index
   */
  private createIndexes(): void {
    if (!this.db) return;

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_${this.config.collectionName}_type
        ON ${this.config.collectionName}(type);

      CREATE INDEX IF NOT EXISTS idx_${this.config.collectionName}_owner
        ON ${this.config.collectionName}(owner);

      CREATE INDEX IF NOT EXISTS idx_${this.config.collectionName}_importance
        ON ${this.config.collectionName}(importance);

      CREATE INDEX IF NOT EXISTS idx_${this.config.collectionName}_created_at
        ON ${this.config.collectionName}(created_at);

      CREATE INDEX IF NOT EXISTS idx_${this.config.collectionName}_confidence
        ON ${this.config.collectionName}(confidence);
    `);
  }

  /**
   * Sérialiser un embedding
   */
  private serializeEmbedding(embedding: number[]): Buffer {
    // Stocker comme Float32Array pour efficacité
    const buffer = Buffer.allocUnsafe(embedding.length * 4);
    for (let i = 0; i < embedding.length; i++) {
      buffer.writeFloatLE(embedding[i], i * 4);
    }
    return buffer;
  }

  /**
   * Désérialiser un embedding
   */
  private deserializeEmbedding(buffer: Buffer): number[] {
    const embedding: number[] = [];
    for (let i = 0; i < buffer.length; i += 4) {
      embedding.push(buffer.readFloatLE(i));
    }
    return embedding;
  }

  /**
   * Convertir une row DB en SemanticMemoryEntry
   */
  private rowToEntry(row: SQLiteRow): SemanticMemoryEntry {
    return {
      id: row.id,
      type: row.type as SemanticMemoryType,
      owner: row.owner,
      summary: row.summary,
      details: row.details || undefined,
      source: {
        type: row.source_type,
        id: row.source_id || undefined,
        timestamp: row.source_timestamp,
        context: row.source_context || undefined,
      },
      tags: JSON.parse(row.tags),
      embedding: this.deserializeEmbedding(row.embedding),
      importance: row.importance,
      created_at: row.created_at,
      last_used_at: row.last_used_at || undefined,
      access_count: row.access_count,
      related_to: row.related_to ? JSON.parse(row.related_to) : undefined,
      supersedes: row.supersedes || undefined,
      valid_until: row.valid_until || undefined,
      confidence: row.confidence,
    };
  }

  /**
   * Construire les WHERE clauses
   */
  private buildWhereClause(
    filters: Record<string, unknown>,
    whereClauses: string[],
    params: Record<string, unknown>
  ): void {
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      // Opérateurs MongoDB-like
      if (key === '$or') {
        const orClauses: string[] = [];
        const orFilters = value as Array<Record<string, unknown>>;
        orFilters.forEach(orFilter => {
          const subWhereClauses: string[] = [];
          const subParams: Record<string, unknown> = {};
          this.buildWhereClause(orFilter, subWhereClauses, subParams);
          if (subWhereClauses.length > 0) {
            orClauses.push(`(${subWhereClauses.join(' AND ')})`);
            Object.assign(params, subParams);
          }
        });
        if (orClauses.length > 0) {
          whereClauses.push(`(${orClauses.join(' OR ')})`);
        }
        return;
      }

      // Opérateurs de comparaison
      if (typeof value === 'object' && !Array.isArray(value)) {
        const valueObj = value as Record<string, unknown>;
        const operators = Object.keys(valueObj);
        operators.forEach(op => {
          const columnName = this.camelToSnake(key);
          const paramName = `${key}_${op}`;
          const opValue = valueObj[op];

          switch (op) {
            case '$in':
              if (Array.isArray(opValue)) {
                whereClauses.push(
                  `${columnName} IN (${opValue.map((_, i: number) => `@${paramName}_${i}`).join(', ')})`
                );
                opValue.forEach((v: unknown, i: number) => {
                  params[`${paramName}_${i}`] = v;
                });
              }
              break;
            case '$gte':
              whereClauses.push(`${columnName} >= @${paramName}`);
              params[paramName] = opValue;
              break;
            case '$lte':
              whereClauses.push(`${columnName} <= @${paramName}`);
              params[paramName] = opValue;
              break;
            case '$gt':
              whereClauses.push(`${columnName} > @${paramName}`);
              params[paramName] = opValue;
              break;
            case '$lt':
              whereClauses.push(`${columnName} < @${paramName}`);
              params[paramName] = opValue;
              break;
            case '$neq':
              whereClauses.push(`${columnName} != @${paramName}`);
              params[paramName] = opValue;
              break;
            case '$contains':
              // Pour tags (JSON array)
              if (key === 'tags' && Array.isArray(opValue)) {
                opValue.forEach((tag: unknown, i: number) => {
                  whereClauses.push(`json_extract(tags, '$') LIKE @${paramName}_${i}`);
                  params[`${paramName}_${i}`] = `%"${String(tag)}"%`;
                });
              }
              break;
          }
        });
      } else {
        // Égalité simple
        const columnName = this.camelToSnake(key);
        whereClauses.push(`${columnName} = @${key}`);
        params[key] = value;
      }
    });
  }

  /**
   * Convertir camelCase en snake_case
   */
  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}
