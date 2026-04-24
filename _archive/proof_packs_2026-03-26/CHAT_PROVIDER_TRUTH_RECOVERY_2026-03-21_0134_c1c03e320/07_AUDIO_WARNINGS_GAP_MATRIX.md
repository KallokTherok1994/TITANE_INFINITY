# AUDIO_WARNINGS_GAP_MATRIX

## Observed Warnings

- WebKit/GStreamer: missing appsink / appsrc / autoaudiosink
- Backend microphone test: SUCCEEDS repeatedly

## Classification

| Warning                         | Classification         | Causal for Chat? | Action                             |
| ------------------------------- | ---------------------- | ---------------- | ---------------------------------- |
| GStreamer missing appsink       | ENV_DEP_MISSING        | NO               | None — system dependency gap       |
| GStreamer missing appsrc        | ENV_DEP_MISSING        | NO               | None — system dependency gap       |
| GStreamer missing autoaudiosink | BLOCKING_AUDIO_UI_ONLY | NO               | None — affects audio playback only |
| WebKit media warnings           | NON_BLOCKING_FOR_CHAT  | NO               | None                               |
| Microphone test                 | PASS                   | NO ISSUE         | None                               |

## Conclusion

**AUDIO_WARNINGS_NON_BLOCKING** — all audio/GStreamer warnings are environmental dependency gaps
or audio-UI-only issues. They have ZERO causal relationship to the chat text pipeline failure.

The chat pipeline (Ollama generate, IPC, UI text rendering) does not depend on GStreamer.
Audio issues affect: TTS output, voice input UI. Not: chat text generation.

## I12 Compliance

Audio warnings do not distract from primary chat lock. Primary lock correctly identified as
FAILURE_COUNTER_NOT_RESET in chat_orchestrator.rs, independent of audio subsystem.
