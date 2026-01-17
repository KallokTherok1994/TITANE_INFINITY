/**
 * TITANE∞ — Dynamic import facade
 *
 * This wrapper exists to avoid dynamically importing `chatEngine?.commands?.ts` directly,
 * because it is also statically re-exported by `src/services/tauri/index?.ts`.
 */

export {
  chatEngineCommands,
  generateResponse,
  streamResponse,
  speakText,
  saveMemory,
  loadMemory,
  resetMemory,
  healthCheck,
  onStreamChunk,
  onStreamDone,
  createNewConversation,
  generate,
} from './chatEngine?.commands';

export type {
  ProviderPreference,
  SpeechMode,
  ChatRequestArgs,
  ChatCompletionPayload,
  StreamChunkPayload,
  StreamHandle,
  EngineHealthReport,
  OmegaGenerateArgs,
  OmegaResponse,
} from './chatEngine?.commands';

export { default } from './chatEngine?.commands';
