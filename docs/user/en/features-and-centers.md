# TITANE∞ — Features and Centers (EN)

**Version:** 28.0.0  
**Status:** PARTIAL  
**Date:** 2026-03-17

---

## Overview

TITANE∞ is organized into **functional centers**. Each center corresponds to an interface area with specific capabilities.

---

## Center 1 — AI Chat

**Status:** PROVEN

**What it does:** Main interface for interacting with AI models.

**Supported providers:**
- OpenAI (GPT-4, GPT-3.5, etc.) — Internet connection required
- Claude (Anthropic) — Internet connection required
- Gemini (Google) — Internet connection required
- Ollama (local models: Llama, Mistral, etc.) — optional, requires local server

**Constraints:**
- 30 second timeout per request
- Conversation history persisted locally
- Each message requires the provider to be reachable

---

## Center 2 — Audio / Voice

**Status:** PROVEN (core), PARTIAL (some advanced features)

**What it does:** Voice mode with speech recognition (VAD), TTS, and voice profiles.

**Capabilities:**
- Automatic Voice Activity Detection (VAD)
- Text-to-Speech (TTS) for AI responses
- Voice profile synchronized from backend
- Audio state machine (idle → speaking → processing → AI speaking)

**Constraints:**
- Requires microphone access (system permission)
- TTS may require a configured voice synthesis server
- Anti-echo is automatically activated during TTS playback

---

## Center 3 — Memory

**Status:** PARTIAL

**What it does:** View and manage hierarchical conversational memory.

**Memory levels:**
- **STM**: Current session (recent messages)
- **MTM**: Recent session summaries
- **LTM**: Long-term persisted knowledge

**Constraints:**
- Full STM/MTM/LTM sync is being stabilized
- Memory browsing is available but manual editing is limited

---

## Center 4 — DevTools

**Status:** PROVEN

**What it does:** Built-in monitoring and debugging tools in the interface.

**Available tools:**
- **Helios**: Real-time system metrics
- **Nexus**: Dependency graph
- **Logs**: Event log
- **Watchdog**: Process monitoring
- **Monitoring**: Performance dashboard

**Constraints:**
- DevTools is aimed at developers and maintainers
- Does not affect application behavior in production

---

## Center 5 — Settings

**Status:** PROVEN

**What it does:** Configure AI providers, user preferences, API key management.

**Capabilities:**
- API key configuration per provider
- Default provider selection
- Audio and voice settings
- Interface preferences

**Constraints:**
- API keys are stored locally (see [Settings, Security and Privacy](./settings-security-and-privacy.md))
- Some advanced settings require an application restart

---

## Features with PLANNED status

The following are documented as future intent but not yet available or fully verified:

| Feature | Status | Notes |
|---|---|---|
| Full UnifiedMemory OS | DOC_ONLY | Architecture documented, partial implementation |
| Full runtime self-repair | DOC_ONLY | Governance scripts present, runtime self-healing unproven |
| Full OMEGA v2 pipeline (10 stages) | PARTIAL | Partially implemented in `conversationEngine.ts` |
| Multimodal (images, advanced audio) | PLANNED | Specs present, implementation incomplete |

---

*French documentation: [docs/user/fr/fonctionnalites-et-centres.md](../fr/fonctionnalites-et-centres.md)*
