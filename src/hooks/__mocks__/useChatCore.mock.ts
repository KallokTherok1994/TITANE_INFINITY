import type { UseChatCoreReturn } from '../useChatCore';
import type { ChatEngineResponse } from '@/services/ai';
import type { AIMessage } from '@/services/ai/types';

const mockResponse = (content: string): ChatEngineResponse => ({
  content,
  provider: 'titane-local',
  timestamp: Date.now(),
  mode: 'default',
  contextUsed: [],
  omegaMetadata: {
    pipelineSteps: ['mock'],
    validationScore: 1,
    autoHealed: false,
    failureHandled: false,
    processingTime: 1,
  },
});

export function useChatCore(): UseChatCoreReturn {
  return {
    currentMode: 'default',
    currentProvider: 'titane-local',
    anomalyCount: 0,
    generate: async (message: string, history: AIMessage[]) => {
      return mockResponse(`Mocked(${history.length}): ${message}`);
    },
    async *stream(message: string, history: AIMessage[]) {
      yield `Mock chunk: ${message}`;
      return mockResponse(`Mocked(${history.length}): ${message}`);
    },
    setMode: () => {},
    setProvider: () => {},
    validateResponse: () => ({
      isValid: true,
      score: 1,
      issues: [],
    }),
  };
}
