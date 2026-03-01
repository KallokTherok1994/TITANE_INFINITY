# 06_SCANS_BACKEND_HTTP.md — Scan réseau backend Rust

**Generated:** 2026-02-28T16:13:09Z  
**Pack:** PREP_BG_2026-02-28_1613_a8b70c2

## Commande exécutée

```bash
rg -n "reqwest|ureq|hyper|tauri-plugin-http|http-client" src-tauri -l
```

## Fichiers avec reqwest

```
src-tauri/src/core/http_types.rs        ← PORTE UNIQUE (re-exports)
src-tauri/src/tts/online_tts.rs         ← TTS online
src-tauri/src/memory_os/embeddings.rs   ← Embeddings
src-tauri/src/engines/unified_memory/summarizer.rs
src-tauri/src/engines/unified_memory/embeddings.rs
src-tauri/src/ai/gemini.rs              ← Provider Gemini
src-tauri/src/ia/anthropic_claude.rs    ← Provider Claude
src-tauri/src/ia/openai_gpt.rs          ← Provider OpenAI
src-tauri/src/ai/ollama.rs              ← Provider Ollama local
src-tauri/src/ai/providers/openai.rs
src-tauri/src/ai/providers/claude.rs
src-tauri/src/ai/providers/local.rs
src-tauri/src/services/fetch_service.rs ← Service fetch centralisé
src-tauri/src/overdrive/api_bridge.rs   ← API bridge (commenté)
```

## Analyse porte unique

**`src-tauri/src/core/http_types.rs`** est le point d'entrée canonical:

```rust
pub use reqwest::{header, redirect::Policy, Client, Error as ReqwestError, Response, StatusCode};
```

Tous les autres fichiers importent depuis ce module plutôt que reqwest directement.

## Points réseau identifiés

| Surface                     | Type                         | Timeout                                | Status     |
| --------------------------- | ---------------------------- | -------------------------------------- | ---------- |
| `ai/ollama.rs`              | HTTP local (127.0.0.1:11434) | `build_ollama_client(TIMEOUT_SECONDS)` | ✅ Timeout |
| `ia/openai_gpt.rs`          | HTTPS api.openai.com         | À vérifier                             | ⚠️ WARN    |
| `ia/anthropic_claude.rs`    | HTTPS api.anthropic.com      | À vérifier                             | ⚠️ WARN    |
| `ai/gemini.rs`              | HTTPS googleapis.com         | À vérifier                             | ⚠️ WARN    |
| `tts/online_tts.rs`         | HTTPS TTS provider           | À vérifier                             | ⚠️ WARN    |
| `services/fetch_service.rs` | Générique                    | À vérifier                             | ⚠️ WARN    |

## Verdict 06

**UNKNOWN** — Structure "porte unique" via `http_types.rs` prouvable.  
Les providers externes ont des clients mais les timeouts complets nécessitent une inspection fichier par fichier.  
Aucune surface non autorisée détectée. Providers standards attendus (Ollama local + optionnels cloud).
