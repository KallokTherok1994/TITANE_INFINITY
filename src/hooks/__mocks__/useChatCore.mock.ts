export const __TITANE_TEST_MOCK__ = true;

type AIMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  provider?: string;
  metadata?: Record<string, unknown>;
};

type ChatMode = 'default' | string;

type ChatEngineResponse = {
  content: string;
  provider: string;
  timestamp: number;
  mode: ChatMode;
  contextUsed: string[];
  model?: string;
  tokens?: number;
  suggestions?: string[];
  metadata?: Record<string, unknown>;
  omegaMetadata?: {
    pipelineSteps: string[];
    validationScore: number;
    autoHealed: boolean;
    failureHandled: boolean;
    processingTime: number;
  };
};

type UseChatCoreReturn = {
  currentMode: ChatMode;
  currentProvider: string;
  anomalyCount: number;
  generate: (message: string, history: AIMessage[]) => Promise<ChatEngineResponse>;
  stream: (
    message: string,
    history: AIMessage[]
  ) => AsyncGenerator<string, ChatEngineResponse>;
  setMode: (mode: ChatMode) => void;
  setProvider: (provider: string) => void;
  validateResponse: (
    content: string,
    mode: ChatMode,
    prompt: string
  ) => { isValid: boolean; score: number; issues: unknown[] };
};

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
      if (/who\s+are\s+you\?/i.test(message)) {
        return mockResponse('TITANE∞ — intelligence cognitive locale');
      }
      return mockResponse(`Mocked(${history.length}): ${message}`);
    },
    async *stream(message: string, history: AIMessage[]) {
      if (/who\s+are\s+you\?/i.test(message)) {
        yield 'Mock chunk: TITANE∞';
        return mockResponse('TITANE∞ — intelligence cognitive locale');
      }
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
