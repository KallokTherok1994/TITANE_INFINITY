# TITANE∞ — FAQ (EN)

**Version:** 28.0.0  
**Status:** PARTIAL  
**Date:** 2026-03-17

---

## General questions

### Who is TITANE∞ for?

TITANE∞ is aimed at developers, researchers, and advanced users who want a unified interface for interacting with multiple AI models, with conversational memory, voice mode, and observability features.

### Does it work offline?

**Partially.** TITANE∞ is an **online-first** application:
- Cloud providers (OpenAI, Claude, Gemini) require an Internet connection
- Ollama (local models) works offline if the server is running and a model has been downloaded
- A local fallback is planned but its state is PARTIAL

### Is it free?

TITANE∞ is proprietary software. Using cloud AI providers (OpenAI, Claude, Gemini) is subject to those services' pricing. Ollama is free and open-source.

### Which operating systems are supported?

- **Linux**: Ubuntu 20.04+, Debian 11+, Linux Mint 20+, Pop!_OS 20.04+ — PROVEN (binary v27.0.5)
- **Windows**: PARTIAL (not CI-verified)
- **macOS**: PARTIAL (not CI-verified)

---

## Installation and setup

### Which version should I download?

The latest public binary release is **v27.0.5** (Linux). The current repo version is 28.0.0 but no public binary is available yet for this version.

### How do I configure my API keys?

In the **Settings** center of the application, enter your API keys for the providers you want. Keys are stored locally and never leave your machine (except to the relevant provider during requests).

### Does TITANE∞ install anything else on my system?

The DEB binary installs the standard application. No background server is installed. If you use Ollama, you must install it separately.

---

## Usage

### Why am I not getting a response?

Possible causes:
1. The AI provider is unavailable (check your connection)
2. Your API key is expired or incorrect
3. The 30-second timeout was reached — click "Retry"
4. Ollama is not started (if using Ollama)

### How do I access conversation history?

History is accessible in the chat interface. It is persisted in the application's localStorage.

### How do I use voice mode?

1. Click the microphone icon in the chat
2. Allow microphone access if prompted
3. Speak normally — voice detection is automatic
4. For TTS, click the speaker icon

---

## Known issues

### The app won't start

→ See [Troubleshooting](./troubleshooting.md) — "Launch issues" section

### Voice mode doesn't work

→ See [Troubleshooting](./troubleshooting.md) — "Audio issues" section

### Messages are not appearing

→ Verify the provider is configured and Internet connection is active

---

## Where to get help?

- GitHub issues: https://github.com/KallokTherok1994/TITANE_INFINITY/issues
- Application logs: DevTools center → Logs
- Documentation: This guide and other docs in `docs/user/en/`

---

*French documentation: [docs/user/fr/faq.md](../fr/faq.md)*
