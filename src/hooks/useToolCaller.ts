/**
 * TITANE∞ — useToolCaller Hook
 * Hook pour intégrer tool calling dans les composants
 *
 * v26.4.0 (Sprint 6)
 */

import { useCallback, useRef } from 'react';
import { getToolCaller, type ToolDefinition } from '../services/chat/toolCaller';

/**
 * Hook for using tool calling in components
 */
export function useToolCaller(customTools?: Record<string, ToolDefinition>) {
  const toolCallerRef = useRef(getToolCaller(customTools));

  const parseToolCalls = useCallback((text: string) => {
    return toolCallerRef.current.parseToolCalls(text);
  }, []);

  const executeToolCall = useCallback(
    async (toolName: string, args: Record<string, unknown>) => {
      return toolCallerRef.current.executeToolCall(toolName, args);
    },
    []
  );

  const executeToolCalls = useCallback(
    async (calls: Array<{ name: string; arguments: Record<string, unknown> }>) => {
      return toolCallerRef.current.executeToolCalls(calls);
    },
    []
  );

  const getToolDescriptions = useCallback(() => {
    return toolCallerRef.current.getToolDescriptions();
  }, []);

  const getCallHistory = useCallback(() => {
    return toolCallerRef.current.getCallHistory();
  }, []);

  const formatToolResult = useCallback(
    (toolName: string, result: unknown, error?: string) => {
      return toolCallerRef.current.formatToolResult(toolName, result, error);
    },
    []
  );

  return {
    parseToolCalls,
    executeToolCall,
    executeToolCalls,
    getToolDescriptions,
    getCallHistory,
    formatToolResult,
  };
}

export default useToolCaller;
