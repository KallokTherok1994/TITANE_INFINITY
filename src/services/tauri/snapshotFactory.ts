/**
 * ═══════════════════════════════════════════════════════════════
 * SNAPSHOT FACTORY — Contract Guard (Ring 3 Service)
 * 
 * Purpose: Enforce TS↔Rust Snapshot contracts at runtime.
 * Ensures `metadata` is always present, preventing IPC errors.
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * Normalize a partial Snapshot object to ensure it matches the Rust contract.
 * 
 * Guarantees:
 * - metadata field is always present (empty object if not provided)
 * - Prevents IPC deserialization failures at the Tauri boundary
 * 
 * Ring 3 (Service layer) — controlled I/O transformation
 * 
 * @param snapshot - Partial or complete snapshot object
 * @returns Normalized Snapshot with guaranteed metadata
 */
export function normalizeSnapshot(snapshot: any): any {
  return {
    ...snapshot,
    // Enforce metadata presence: empty object if not provided
    metadata: snapshot.metadata ?? {},
  };
}

/**
 * Validate Snapshot shape against Rust type signature.
 * Used in tests to ensure contract compliance.
 * 
 * @param snapshot - Object to validate
 * @returns true if snapshot has all required fields including metadata
 */
export function isValidSnapshot(snapshot: any): boolean {
  return (
    snapshot &&
    typeof snapshot === 'object' &&
    typeof snapshot.id === 'string' &&
    typeof snapshot.timestamp === 'number' &&
    typeof snapshot.metadata === 'object' &&
    snapshot.metadata !== null
  );
}

/**
 * Create a minimal Snapshot object with all required fields.
 * Primarily used in tests.
 */
export function createMinimalSnapshot(
  id: string = 'test-snapshot',
  timestamp: number = Date.now()
): any {
  return {
    id,
    timestamp,
    metadata: {},
  };
}
