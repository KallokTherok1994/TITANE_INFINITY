# 06 — CAPABILITIES
## FINAL_SEALING_2026-03-06_1523_c167beb

---

## CSP (Content Security Policy)

```
connect-src 'self' tauri: asset: ipc:
```
Pas de wildcard internet — PASS ✅

## Allowlist capability: chat_ai.json

```json
{
  "allow": [
    "chat_stream_message",
    "chat_create_conversation",
    "chat_get_conversation",
    "chat_delete_conversation",
    "conversation_generate",
    "chat_get_providers_status",
    "chat_set_gemini_key",
    "chat_check_providers",
    "ai_query",
    "cp_get_ai_config",
    "cp_set_ai_config",
    "validate_chat_message"
  ]
}
```

**Nettoyé :** `chat_generate` retiré (était stale) ✅
**Toutes les commandes listées** sont enregistrées dans `generate_handler!` ✅
(Exception : `ai_query` → nécessite AIChatState, BLOCKED — P2)

## URLs réseau autorisées

- `https://generativelanguage.googleapis.com/**` — Gemini (optional)
- `http://localhost:11434/**` — Ollama local ✅
- `http://127.0.0.1:11434/**` — Ollama local ✅

Pas de wildcard externe ✅

## Stale capabilities (P2)

- `self_heal.json` : `autonomy_*` (5 cmds) — allowlistées mais non enregistrées
- `developer_mode.json` : `engines_devmode_*` (12 cmds) — stubs non enregistrés

## Deny-by-default

Toutes les capabilities utilisent `"deny": []` par défaut — aucun overscoping ✅

## GATE G_CAPABILITIES_ALIGNED: ✅ PASS (stale P2 dans budget)
