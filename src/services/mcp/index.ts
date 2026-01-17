/**
 * TITANE_INFINITY v∞.42 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════
// MCP OS v1.1 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export * from './mcp.types';
export { MCPOrchestrator } from './MCPOrchestrator';
export { MCPCognitiveIntegration } from './MCPCognitiveIntegration';
export {
  useMCPOrchestrator,
  useMCPHealth,
  useMCPJobQueue,
  useMCPMemory,
  useMCPGovernance,
  useMCPEvolution,
} from '@/hooks/useMCPOrchestrator';
