# AUDIT VÉRITÉ DOCUMENTAIRE — DOCS vs RÉALITÉ RUNTIME
## Surface F : Cohérence de la documentation avec le backend actif

---

## Périmètre

Seule la documentation ayant un **impact direct sur la vérité runtime** est auditée.
Les docs de conception ou d'historique ne sont pas dans le périmètre de cet audit.

---

## Commande OMEGA v2 — Migration documentée

### Preuve dans `main.rs`

```rust
// [RETRAIT v27.0.5-prod] Legacy chat command removed (use conversation_generate)
```

### Preuve dans `tauriCommands.ts`

```typescript
// [RETRAIT v27.0.5-prod] Legacy chat command removed (use conversation_generate)
READ_PRODUCTION_WEEK1_CSV: 'read_production_week1_csv',
```

Le commentaire dans `tauriCommands.ts` signale correctement le retrait de `chat_send_message`.
La migration vers `conversation_generate` est documentée en code.

**Verdict : PASS** — La doc en commentaire reflète la réalité du handler.

---

## lib.rs — Annotations de migration

```rust
#[deprecated(
    since = "24.2.0",
    note = "Use unified_memory_v2 API instead..."
)]
pub mod memory_os;
```

Les modules dépréciés sont annotés avec `#[deprecated]`. Le backend compile avec 
`#![allow(deprecated)]` pour la période de migration.

**Verdict : PASS** — La dette de migration est correctement documentée.

---

## handlers.rs — Code mort non documenté (P2)

Le fichier `src-tauri/src/handlers.rs` contient une macro `generate_titane_handlers!`
qui n'est **jamais appelée** dans `main.rs`. Ce code mort inclut des références à 
`control_panel_commands::cp_get_ai_config` et d'autres commandes.

**Impact** : Ce fichier crée une illusion que les commandes sont enregistrées, induisant
en erreur les développeurs qui le consultent. C'est la cause racine du bug P1.

**Recommandation** : Ajouter un commentaire `// DEAD CODE — do not use this macro` 
ou supprimer le fichier. Non appliqué dans ce PR (changement cosmétique non critique).

**Verdict : P2 — documenté, non corrigé dans ce PR**

---

## TAURI_COMMANDS.ts (fichier dupliqué) — P2

Le fichier `src/core/commands/TAURI_COMMANDS.ts` est un fichier séparé qui redéclare 
certaines commandes avec des noms légèrement différents :
```typescript
CONTROL_PANEL_GET_AI_CONFIG: 'cp_get_ai_config',
CONTROL_PANEL_SET_AI_CONFIG: 'cp_set_ai_config',
```

Ce fichier coexiste avec `src/lib/tauriCommands.ts` (la source canonique).
**Risque** : désynchronisation entre les deux sources si des commandes sont modifiées.

**Recommandation** : Consolider vers `src/lib/tauriCommands.ts` à terme. Non appliqué 
dans ce PR (changement non minimal).

**Verdict : P2 — documenté**

---

## Capabilities vs README/Docs

Les fichiers `src-tauri/capabilities/*.json` contiennent des descriptions commentées 
qui correspondent à la réalité des features :
- `chat-ai` : "Gemini, Ollama, Local" — correspond aux providers enregistrés ✅
- `audio-tts` : "Audio/TTS/ASR TITANE∞ v19.3" — correspond aux commandes audio ✅
- `self-heal` : "Self-Healing et l'autonomie" — partiellement correct (autonomy_* non enregistrés) → P2

---

## Invariants constitution respectés (PASS)

La constitution TITANE∞ exige dans les invariants non-négociables :

| Invariant | Preuve | Statut |
|-----------|--------|--------|
| Tauri-only (pas de serveur web interne) | `csp: "connect-src 'self' tauri: asset: ipc:"` — aucun localhost server | ✅ PASS |
| Online-first avec fallback local obligatoire | Ollama localhost dans capabilities, ChatOrchestratorState avec fallback | ✅ PASS |
| Architecture 4-Ring intacte | Ring 2 (Engines) sans I/O, Ring 3 (Services) = orchestration IPC | ✅ PASS |
| Allowlist deny-by-default | Aucune commande dangereuse allowlistée | ✅ PASS |
| Anti-silence UI/IPC | `normalizeIpcResponse()` explicite pour tous les cas | ✅ PASS |

---

**GATE G_DOCUMENTATION_TRUTH : PASS (P2 documentés, aucun invariant violé)**
