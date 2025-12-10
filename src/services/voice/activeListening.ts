/**
 * TITANE_INFINITY v19.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.4 — ACTIVE LISTENING EXPORTS
 *
 *   Export central pour Super Prompt v∞.3
 * ═══════════════════════════════════════════════════════════════════
 */

// ═══ HOOKS ═══
export {
  useActiveListening,
  useWakeWord,
  type ActiveListeningConfig,
  type ActiveListeningCallbacks,
  type ActiveListeningState,
  type UseActiveListeningReturn,
} from '@/hooks/useActiveListening';

// ═══ VOICE ENGINE (Extended) ═══
export {
  useVoiceEngine,
  type UseVoiceEngineOptions,
  type UseVoiceEngineReturn,
  type VoiceEngineState,
  type VoiceEngineStatus,
} from '@/hooks/useVoiceEngine';

// ═══ UI COMPONENTS ═══
export { WakeWordIndicator, WakeWordBadge } from '@/components/voice/WakeWordIndicator';

export { VoiceControlPanelWithWakeWord } from '@/components/voice/VoiceControlPanelWithWakeWord';

// ═══ ENGINES (Re-export from Super Prompt VI) ═══
export {
  wakeWordEngine,
  type WakeWordEvent,
  type WakeWordMode,
  type WakeWordConfig,
} from '@/services/voice/wakeWordEngine';

export {
  attentionEngine,
  type AttentionState,
  type AttentionEvent,
  type ListeningMode,
} from '@/services/voice/attentionEngine';

export {
  interruptionController,
  type InterruptionEvent,
} from '@/services/voice/interruptionController';

export { adaptiveThresholdEngine } from '@/services/voice/adaptiveThresholdEngine';

/**
 * ═══════════════════════════════════════════════════════════════════
 *   QUICK START EXAMPLES
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Example 1: Simple Wake Word
 * ```tsx
 * import { useWakeWord } from '@/services/voice/activeListening';
 *
 * function MyComponent() {
 *   const wake = useWakeWord((event) => {
 *     console.log('Wake detected:', event.mode);
 *   });
 *
 *   return <button onClick={wake.start}>Start Listening</button>;
 * }
 * ```
 */

/**
 * Example 2: Full Active Listening
 * ```tsx
 * import { useActiveListening, useVoiceEngine } from '@/services/voice/activeListening';
 *
 * function VoiceAssistant() {
 *   const voiceEngine = useVoiceEngine();
 *
 *   const listening = useActiveListening(
 *     { autoArm: true },
 *     {
 *       onCommand: (text) => {
 *         voiceEngine.completeTurnWithText(text);
 *       },
 *     }
 *   );
 *
 *   return (
 *     <div>
 *       <p>State: {listening.state.attentionState}</p>
 *       <button onClick={listening.disarm}>Stop</button>
 *     </div>
 *   );
 * }
 * ```
 */

/**
 * Example 3: Complete UI
 * ```tsx
 * import { VoiceControlPanelWithWakeWord } from '@/services/voice/activeListening';
 *
 * function App() {
 *   return <VoiceControlPanelWithWakeWord />;
 * }
 * ```
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   VERSIONING
 * ═══════════════════════════════════════════════════════════════════
 */
export const ACTIVE_LISTENING_VERSION = '19.4.0';
export const SUPER_PROMPT_VERSION = 'v∞.3';
