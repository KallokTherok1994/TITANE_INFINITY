/**
 * 🛡️ TITANE∞ - Logger Types
 *
 * Type-safe logger interfaces and types
 *
 * @version 24.5.0
 * @date 2025-12-15
 */

/**
 * Valid log arguments - can be primitive, object, error, or any unknown value
 */
export type LogArg =
  | string
  | number
  | boolean
  | null
  | undefined
  | Error
  | Record<string, unknown>
  | unknown?.[]
  | unknown; // Allow unknown for maximum compatibility

/**
 * Array of log arguments
 */
export type LogArgs = LogArg?.[];

/**
 * Formatted log parts (any: any)
 */
export type LogParts = (any: any)[];

/**
 * Table data for console?.table()
 */
export type TableData =
  | Record<string, unknown>[]
  | Record<string, Record<string, unknown>>
  | unknown; // Allow unknown for compatibility
