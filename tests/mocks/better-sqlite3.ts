/**
 * TITANE∞ v24.3.0 — Mock for better-sqlite3
 * Used in Vitest environment where native bindings are not available.
 *
 * v22Ω AI Performance Optimizations Compatible
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

/**
 * In-memory storage for mock database
 */
const mockStorage = new Map<string, Map<string, any>>();

/**
 * Mock Statement class
 */
class MockStatement {
  private sql: string;
  private db: MockDatabase;

  constructor(sql: string, db: MockDatabase) {
    this.sql = sql;
    this.db = db;
  }

  run(...params: any[]): { changes: number; lastInsertRowid: number } {
    return { changes: 1, lastInsertRowid: 1 };
  }

  get(...params: any[]): any {
    return null;
  }

  all(...params: any[]): any[] {
    return [];
  }

  iterate(...params: any[]): IterableIterator<any> {
    return [][Symbol.iterator]();
  }

  pluck(_toggle?: boolean): this {
    return this;
  }

  expand(_toggle?: boolean): this {
    return this;
  }

  raw(_toggle?: boolean): this {
    return this;
  }

  columns(): any[] {
    return [];
  }

  bind(...params: any[]): this {
    return this;
  }
}

/**
 * Mock Database class
 */
class MockDatabase {
  private name: string;
  private storage: Map<string, any>;
  private _open: boolean = true;

  constructor(filename: string, _options?: any) {
    this.name = filename;

    // Use shared storage for in-memory or create new
    if (filename === ':memory:') {
      this.storage = new Map();
    } else {
      if (!mockStorage.has(filename)) {
        mockStorage.set(filename, new Map());
      }
      this.storage = mockStorage.get(filename)!;
    }
  }

  get open(): boolean {
    return this._open;
  }

  get inTransaction(): boolean {
    return false;
  }

  get readonly(): boolean {
    return false;
  }

  get memory(): boolean {
    return this.name === ':memory:';
  }

  prepare(sql: string): MockStatement {
    return new MockStatement(sql, this);
  }

  exec(sql: string): this {
    return this;
  }

  pragma(pragma: string, _options?: any): any {
    return pragma.includes('=') ? undefined : [];
  }

  transaction<T>(fn: (...args: any[]) => T): (...args: any[]) => T {
    const wrapper = (...args: any[]): T => {
      return fn(...args);
    };
    (wrapper as any).immediate = wrapper;
    (wrapper as any).exclusive = wrapper;
    (wrapper as any).deferred = wrapper;
    return wrapper;
  }

  backup(
    _destination: string,
    _options?: any
  ): Promise<{ totalPages: number; remainingPages: number }> {
    return Promise.resolve({ totalPages: 0, remainingPages: 0 });
  }

  serialize(_options?: any): Buffer {
    return Buffer.alloc(0);
  }

  function(_name: string, _fn: (...args: any[]) => any): this;
  function(_name: string, _options: any, _fn: (...args: any[]) => any): this;
  function(): this {
    return this;
  }

  aggregate(_name: string, _options: any): this {
    return this;
  }

  table(_name: string, _options: any): this {
    return this;
  }

  loadExtension(_path: string, _entryPoint?: string): this {
    return this;
  }

  close(): this {
    this._open = false;
    return this;
  }

  defaultSafeIntegers(_toggle?: boolean): this {
    return this;
  }

  unsafeMode(_toggle?: boolean): this {
    return this;
  }
}

/**
 * Mock SqliteError class
 */
class SqliteError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'SqliteError';
    this.code = code;
  }
}

// Export mock as default
export default MockDatabase;

// Named exports for compatibility
export { MockDatabase as Database, SqliteError };
