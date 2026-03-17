# TITANE∞ — User Guide (EN)

**Version:** 28.0.0  
**Status:** PARTIAL  
**Date:** 2026-03-17

---

## Main interface

TITANE∞ provides an AI-interaction-focused interface with several functional centers accessible from the main navigation.

### Main navigation

| Center | Function | Status |
|---|---|---|
| AI Chat | Conversations with AI providers | PROVEN |
| Audio / Voice | Voice mode, TTS, microphone | PROVEN |
| Memory | View conversational memory | PARTIAL |
| DevTools | Monitoring, logs, debug | PROVEN |
| Settings | Provider and app configuration | PROVEN |

---

## AI Chat

### Sending a message

1. Type your message in the input field
2. Press Enter or click "Send"
3. Wait for the AI response (max 30 second timeout)
4. On error: a "Retry" button appears

### Switching providers

- Use the provider selector in the chat interface
- Configured providers appear in the list
- Switching providers does not clear the conversation history

### Conversation history

- Messages are persisted locally (localStorage)
- STM/MTM/LTM memory is active if configured
- History is accessible across sessions

---

## Voice Mode

### Enabling voice mode

1. Click the microphone icon in the chat interface
2. Allow microphone access if prompted
3. Speak — Voice Activity Detection (VAD) is automatic
4. Transcription and AI response appear on screen

### TTS (Text-to-Speech)

- AI responses can be read aloud
- Click the speaker icon to toggle TTS on/off
- Active voice profile is synchronized from the backend

---

## Memory

> **Status:** PARTIAL — hierarchical memory is being stabilized.

- **STM (Short-Term Memory)**: Current session context
- **MTM (Medium-Term Memory)**: Recent session summaries
- **LTM (Long-Term Memory)**: Long-term persisted knowledge

---

## DevTools

> Accessible via the DevTools panel in the interface.

| Tool | Function |
|---|---|
| Helios | System metrics |
| Nexus | Dependency graph |
| Logs | Real-time event log |
| Watchdog | Process monitoring |
| Monitoring | Performance dashboard |

---

## Known limits

- Internet connectivity is required for cloud providers (OpenAI, Claude, Gemini)
- Full E2E is disabled by default in development
- Some advanced features (complete OMEGA pipeline) are PARTIAL status

---

*French documentation: [docs/user/fr/guide-utilisation.md](../fr/guide-utilisation.md)*
