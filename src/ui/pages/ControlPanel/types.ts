/**
 * TITANE∞ OS - Control Panel Shared Types
 * Break circular dependencies in ControlPanel components
 */

export type ControlPanelSection =
  | 'system'
  | 'appearance'
  | 'singularity'
  | 'ai'
  | 'memory'
  | 'modules'
  | 'network'
  | 'updates'
  | 'logs'
  | 'security';
