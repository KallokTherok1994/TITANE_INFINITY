/**
 * TITANE∞ — Shared LogLevel enum
 *
 * Extracted from `src/utils/logger.ts` to avoid circular dependencies with
 * `src/config/logLevelConfig.ts` (HMR stability).
 */

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
}
