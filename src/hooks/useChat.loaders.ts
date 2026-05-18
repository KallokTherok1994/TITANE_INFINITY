/**
 * Chat Service Loaders — Lazy-load chat services for performance
 * Extracted from useChat.ts (Phase 4 refactoring)
 */

// Chat Service Loader
let _chatServicePromise: Promise<{
  sendMessageLegacy: (messages: any[], config: any) => Promise<any>;
}> | null = null;

export const loadChatService = async () => {
  if (!_chatServicePromise) {
    _chatServicePromise = import('@/services/api/chat').then(m => m.chatService);
  }
  return _chatServicePromise;
};

// Cognitive Kernel Loader
let _cognitiveKernelPromise: Promise<{
  harmonizeChatMessages: (messages: unknown) => unknown;
  harmonizeError: (error: unknown) => { message: string; type: string; recovery: string };
}> | null = null;

type CognitiveKernelModule = {
  cognitiveKernel: {
    harmonizeChatMessages: (messages: unknown) => unknown;
    harmonizeError: (error: unknown) => {
      message: string;
      type: string;
      recovery: string;
    };
  };
};

export const loadCognitiveKernel = async () => {
  if (!_cognitiveKernelPromise) {
    _cognitiveKernelPromise = import('@/services/ai/cognitiveKernel').then(m => {
      const kernel = (m as unknown as CognitiveKernelModule).cognitiveKernel;
      return {
        harmonizeChatMessages: kernel.harmonizeChatMessages.bind(kernel),
        harmonizeError: kernel.harmonizeError.bind(kernel),
      };
    });
  }
  return _cognitiveKernelPromise;
};

// User Preferences Engine Loader
let _userPreferencesEnginePromise: Promise<{
  generateContextForAI: () => unknown;
  recordInteraction: (input: string, output: string) => void;
}> | null = null;

type UserPreferencesEngineModule = {
  userPreferencesEngine: {
    generateContextForAI: () => unknown;
    recordInteraction: (input: string, output: string) => void;
  };
};

export const loadUserPreferencesEngine = async () => {
  if (!_userPreferencesEnginePromise) {
    _userPreferencesEnginePromise = import('@/services/userPreferencesEngine').then(m => {
      const engine = (m as unknown as UserPreferencesEngineModule).userPreferencesEngine;
      return {
        generateContextForAI: engine.generateContextForAI.bind(engine),
        recordInteraction: engine.recordInteraction.bind(engine),
      };
    });
  }
  return _userPreferencesEnginePromise;
};

// Experience Tools Loader
let _experienceToolsPromise: Promise<{
  recordXPGain: (
    amount: number,
    source: string,
    description: string,
    metadata?: Record<string, unknown>
  ) => Promise<any>;
}> | null = null;

const mapXPSourceToDomain = (source: string): string => {
  const map: Record<string, string> = {
    chat_message: 'chat',
    chat_quality_bonus: 'chat',
    chat_titane_response: 'cognitive',
    chat_conversation_streak: 'chat',
    file_import: 'memory',
    knowledge_ingest: 'memory',
    memory_ingestion: 'memory',
    automation_success: 'system',
    diagnostic_pass: 'system',
    self_repair: 'system',
    system_fix: 'system',
    evolution_cycle: 'system',
    daily_login: 'system',
  };
  return map[source] ?? 'system';
};

export const loadExperienceTools = async () => {
  if (!_experienceToolsPromise) {
    _experienceToolsPromise = import('@/services/experienceService').then(m => ({
      recordXPGain: (
        amount: number,
        source: string,
        description: string,
        metadata?: Record<string, unknown>
      ) =>
        m.awardExperience(mapXPSourceToDomain(source), amount, source, {
          ...metadata,
          description,
        }),
    }));
  }
  return _experienceToolsPromise;
};

// DevSudo Integration Loader
let _devSudoPromise: Promise<{
  executeDevCommand: (command: any) => Promise<any>;
}> | null = null;

export const loadDevSudoIntegration = async () => {
  if (!_devSudoPromise) {
    _devSudoPromise = import('@/modules/devSudo/devSudoIntegration').then(m => ({
      executeDevCommand: m.devSudoHandler.executeCommand.bind(m.devSudoHandler),
    }));
  }
  return _devSudoPromise;
};

// Camera Integration Loader
let _cameraIntegrationPromise: Promise<{
  captureAndAnalyze: (message: string, visionStore: any) => Promise<any>;
}> | null = null;

export const loadCameraIntegration = async () => {
  if (!_cameraIntegrationPromise) {
    _cameraIntegrationPromise = import('@/modules/camera/cameraChatIntegration').then(
      m => ({
        captureAndAnalyze: m.handleCameraInChat,
      })
    );
  }
  return _cameraIntegrationPromise;
};

// Cloud Providers Loader - Désactivé (module n'existe pas)
// let _cloudProvidersPromise: Promise<{
//   validateProvider: (provider: string) => boolean;
// }> | null = null;

// export const loadCloudProviders = async () => {
//   if (!_cloudProvidersPromise) {
//     _cloudProvidersPromise = import('@/services/cloudProviders').then(m => ({
//       validateProvider: m.validateProvider,
//     }));
//   }
//   return _cloudProvidersPromise;
// };
