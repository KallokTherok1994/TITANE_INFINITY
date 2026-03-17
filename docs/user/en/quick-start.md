# TITANE∞ — Quick Start (EN)

**Version:** 28.0.0  
**Status:** PARTIAL  
**Date:** 2026-03-17

---

## First launch steps

### 1. Install TITANE∞

→ See [Installation](./installation.md)

### 2. Launch the application

```bash
# AppImage:
./Titan-Stable_27.0.5_amd64.AppImage

# If DEB installed:
titane-infinity  # Or via application launcher

# From source:
pnpm run dev
```

### 3. Configure an AI provider

On first launch, you must configure at least one AI provider:

| Provider | Type | API key needed | Offline |
|---|---|---|---|
| OpenAI | Cloud | YES | NO |
| Claude (Anthropic) | Cloud | YES | NO |
| Gemini (Google) | Cloud | YES | NO |
| Ollama | Local | NO | YES (if model downloaded) |

> **Network policy:** TITANE∞ is **online-first** — cloud providers require an Internet connection. Ollama can work locally if the server is started.

### 4. Start a conversation

1. Select the "Chat AI" center in the interface
2. Choose your active provider
3. Type your first message
4. The AI response appears in the conversation

### 5. With Ollama (optional — local models)

```bash
# Start Ollama
pnpm run ollama:start
# or
ollama serve

# Pull a model
pnpm run ollama:pull
# or
ollama pull llama3.2:latest

# Check Ollama is running
pnpm run ollama:status
```

---

## What you can do right away

| Feature | Available | Status |
|---|---|---|
| Multi-provider AI chat | YES | PROVEN |
| Voice mode (TTS) | YES | PROVEN |
| Conversational memory | YES | PARTIAL |
| Local models (Ollama) | YES (if configured) | QUALIFIED |
| DevTools / monitoring | YES | PROVEN |
| Audio / microphone | YES | PROVEN |

---

## Next steps

- [User Guide](./user-guide.md) — In-depth usage
- [Features and Centers](./features-and-centers.md) — All capabilities
- [FAQ](./faq.md) — Frequently asked questions

---

*French documentation: [docs/user/fr/demarrage-rapide.md](../fr/demarrage-rapide.md)*
