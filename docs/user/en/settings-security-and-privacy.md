# TITANE∞ — Settings, Security and Privacy (EN)

**Version:** 28.0.0  
**Status:** PARTIAL  
**Date:** 2026-03-17

---

## What is local

| Data | Storage | Notes |
|---|---|---|
| Conversation history | Local (localStorage) | Stays on your machine |
| Provider API keys | Local (Tauri secure storage) | Never sent to TITANE servers |
| Voice profile | Local (Tauri backend) | Synced via IPC |
| User preferences | Local | Not shared |
| Application logs | Local | In app data directory |

---

## What goes over the network

| Operation | Data sent | Recipient | Notes |
|---|---|---|---|
| Chat messages (OpenAI) | Message content + context | OpenAI servers | Subject to OpenAI policy |
| Chat messages (Claude) | Message content + context | Anthropic servers | Subject to Anthropic policy |
| Chat messages (Gemini) | Message content + context | Google servers | Subject to Google policy |
| Chat messages (Ollama) | Message content | Local Ollama server | No external send |

> **Network policy:** TITANE∞ is **online-first** — cloud providers send your data to their respective servers. TITANE∞ itself does not collect your data.

---

## API keys

### Configuration

API keys are configured in the **Settings** center of the application.

| Provider | Where to get key | Where key is stored |
|---|---|---|
| OpenAI | https://platform.openai.com/api-keys | Local Tauri storage |
| Claude | https://console.anthropic.com/ | Local Tauri storage |
| Gemini | https://aistudio.google.com/app/apikey | Local Tauri storage |
| Ollama | N/A (no key) | N/A |

### Key security

- Keys are **never** sent to TITANE servers
- Keys are **not** committed to the Git repository
- The `.env` file (if used) is in `.gitignore`

---

## Sensitive configuration files

| File | Content | Recommended action |
|---|---|---|
| `.env` | Environment variables (API keys) | Never commit |
| `.env.example` | Template without real values | Safe to commit |
| `.titane-security-config.json` | Security configuration | Never modify without understanding |

---

## Application security

- **Tauri-only runtime**: no exposed web server, no Electron
- **Governed IPC**: all frontend/backend communication goes through Tauri IPC with strict allowlist
- **CSP**: Content Security Policy configured in `tauri.base.json`
- **No silent failure**: errors are always reported to the user

---

## Known privacy limits

- Data sent to cloud providers (OpenAI, Claude, Gemini) is subject to their respective privacy policies
- TITANE∞ cannot guarantee the privacy of data transmitted to cloud providers
- For maximum privacy: use **Ollama** with local models

---

*French documentation: [docs/user/fr/parametres-securite-et-confidentialite.md](../fr/parametres-securite-et-confidentialite.md)*
