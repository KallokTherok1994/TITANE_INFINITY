# 08_ALLOWLIST_CAPABILITIES_REPORT — Rapport Allowlist et Capabilities
**Proof Pack:** FINAL_AUDIT_VERDICT_2026-03-05_1601_9aa61d5  
**Timestamp:** 2026-03-05T16:01:41Z

---

## Fichiers Capabilities (src-tauri/capabilities/)

| Fichier | Identifier | URLs distantes autorisées | Commandes |
|---------|-----------|--------------------------|-----------|
| `audio_tts.json` | audio-tts | localhost TTS | TTS commands |
| `chat_ai.json` | chat-ai | `*.googleapis.com/**`, `localhost:11434/**`, `127.0.0.1:11434/**` | 13 chat commands |
| `developer_mode.json` | developer-mode | aucune | dev commands |
| `persistence.json` | persistence | aucune | memory/state commands |
| `self_heal.json` | self-heal | aucune | self-heal commands |
| `singularity.json` | singularity | aucune | singularity commands |

---

## Allowlist (allowlist.whitelist.stable.json)

- **Taille:** 18 896 octets
- **Contenu:** 1000+ commandes whitelistées + politique deny-by-default

**Status: ✅ PASS** — deny-by-default confirmé

---

## Analyse Capabilities

### chat_ai.json — URLs distantes

```json
"remote": {
  "urls": [
    "https://generativelanguage.googleapis.com/**",
    "http://localhost:11434/**",
    "http://127.0.0.1:11434/**"
  ]
}
```

**Justification:**
- `generativelanguage.googleapis.com` → Gemini provider (online-first)
- `localhost:11434` + `127.0.0.1:11434` → Ollama local (fallback local obligatoire)

**Status: ✅ PASS** — scoped, justifié, pas de wildcard non bornée

---

## Résumé Allowlist

| Aspect | Status | Preuve |
|--------|--------|--------|
| Deny-by-default | ✅ PASS | allowlist.whitelist.stable.json |
| URLs Google API | ✅ PASS | justifiée (Gemini provider) |
| URLs Ollama local | ✅ PASS | justifiée (fallback local) |
| Permissions minimales | ✅ PASS | chaque capability = scope limité |
| Aucune URL wildcard non bornée | ✅ PASS | pattern `/**` sur domaines connus |
| Documentation capabilities | ⚠️ PARTIELLE | descriptions JSON présentes, pas de test dédié |

---

## Recommandation

Ajouter des tests dédiés pour chaque capability (vérifier que les commandes autorisées existent bien dans le code Rust). Status actuel: **NON PROUVÉ** par test automatique.
