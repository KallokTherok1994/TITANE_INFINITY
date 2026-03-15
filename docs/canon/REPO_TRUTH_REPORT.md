# REPO_TRUTH_REPORT.md — TITANE_INFINITY Canonical Source of Truth

**Version:** 28.0.0
**Branch:** MAIN
**SHA:** c59e9b5b3
**Date:** 2026-03-15T13:32:00Z
**Authority:** Kevin Thibault / TITANE Team
**Classification:** CANON — append-only after seal

---

## 1. Scope

Ce document constitue le rapport de vérité canonique pour TITANE_INFINITY v28.0.0.
Il documente exclusivement ce qui est **prouvé par le code source** (`src-tauri/src/main.rs`,
`src/`, `registry/`, `proof_packs/`) au SHA c59e9b5b3.

---

## 2. Ce qui est PROUVÉ (proof_type = CODE)

### 2.1 Commandes Tauri enregistrées

**Source:** `src-tauri/src/main.rs` bloc `invoke_handler` (tauri::generate_handler![...])
**Total:** 401 commandes registered (Python parse à SHA c59e9b5b3, stash-confirmé)
**Note:** 408 avec patches AUDIO_VOICE_AUDIT non committés (+7 cmds)
**CORRECTION:** La valeur "378" précédemment annoncée était un artefact de grep tronqué (grep -A 153/400 insuffisant) — RÉTRACTÉE.
**Méthode:** Python `re.findall(r'\.invoke_handler\(tauri::generate_handler!\[(.*?)\]\)', content, re.DOTALL)` — méthode canonique

Domaines (voir CAPABILITY_REGISTRY_CANON.md pour détail exhaustif) :
- Boot/State Bridge : 7 cmds
- Database (Option1/libSQL) : 8 cmds
- Core Messaging : 2 cmds
- Conversation Engine OMEGA v19.5.2 : 5 cmds
- Chat Orchestrator v21 + R04 : 8 cmds
- Diagnostic : 1 cmd
- Web Research (STUB) : 1 cmd
- Telemetry : 1 cmd
- Voice Engine v21 REPAIR : 17 cmds
- Avatar Engine v23 : 10 cmds
- Avatar Appearance : 10 cmds
- Avatar Floating (desktop-only, cfg guard) : 15+ cmds
- Avatar FullBody : 12 cmds
- Singularity Fusion (AutoFix/AutoHeal/CrashGuard/Perf/Pipeline) : ~66 cmds
- Singularity State : 18 cmds
- System Center (Logs/Cluster/HyperVision/Introspection/Diag) : 23+ cmds
- Security (secure_commands) : 13 cmds
- Runtime Config : 2 cmds
- Chat Generate (Gemini/OpenAI/Claude) : 3 cmds
- Copilot : 4 cmds
- AI Prompt Generator + Ollama : 2 cmds
- Auth OS : 9 cmds
- Audio/TTS/VAD/Capture : 23 cmds
- Memory API + Helios : 9 cmds
- Governance + Memory OS + Coherence + Unified Memory : 22+ cmds
- System Health + DevTools + Whisper : 16 cmds
- Persistent Memory v19.2Ω : 12 cmds
- Self-Healing (core + executor) : 18 cmds
- Window Controls + Config Hub : 22 cmds
- Titan Persistence : 27 cmds
- Onboarding + Fusion + Control Panel + Identity : 34 cmds
- Legacy AI Bridge : 19 cmds
- UI Theme / Design Center : 4 cmds

### 2.2 IPC Wrapper Canonique

**Fichier:** `src/utils/invoke.ts`
**Statut:** PROUVÉ — wrapper universel implémenté
**Contrat:** `CanonicalIpcResult<T>` avec champs `ok`, `content`, `error`
**Sécurité:** Passe par `secureInvoke` de `@/lib/security`
**Variants:** `safeInvoke`, `safeInvokeWithRetry`, `safeInvokeWithTimeout`

**Fichier:** `src/lib/tauriClient.ts`
**Statut:** PROUVÉ — client Tauri présent, 1 invoke par commande

### 2.3 httpClient.ts gouverné (One Door)

`src/core/http/httpClient.ts` : réseau direct frontend désactivé en mode gouverné.
Aucun `fetch()` direct trouvé dans `src/` hors test/spec files.

### 2.4 Séparation Ring 4 niveaux

Structure vérifiée dans le code source (voir ARCHITECTURE_TRUTH.md) :
- Ring 1 : `src/types/`, `src-tauri/src/engines/unified_memory/`
- Ring 2 : `src/services/`, `src-tauri/src/commands/`
- Ring 3 : `src/core/`, `src-tauri/src/handlers.rs`
- Ring 4 : `src/App.tsx`, `src/main.tsx`, `src-tauri/src/main.rs`

### 2.5 Registry actif

- `registry/repo-events.jsonl` : 139 entrées
- `registry/ui-events.jsonl` : 119 entrées
- `registry/autofix-autoheal-rules.jsonl` : 22 règles
- `registry/proofpack-index.jsonl` : 36 entrées référencées

### 2.6 Proof Packs

- Répertoire `proof_packs/` : 160+ packs
- Plus récent : `V70_GITHUB_RELEASE_PUBLICATION_20260313_234139_ced624c8c7`

---

## 3. Ce qui est PARTIEL

| Élément | Raison |
|---------|--------|
| `src-tauri/tauri.conf.json` | Dirty : `beforeBuildCommand="true"` (build désactivé localement), unicode escapes |
| `src-tauri/gen/android/gradle.properties` | Dirty : cause inconnue |
| handlers.rs | Contient des blocs legacy (v14, v16) — risque shadowing non vérifié (C003) |
| Build pipeline | Non exécuté dans cette session |
| Runtime proof | Aucun run observé cette session |

---

## 4. Ce qui est BLOQUÉ

| Élément | Raison |
|---------|--------|
| `cargo check` | Non exécuté — contexte doc-only |
| E2E tests | Non lancés cette session |
| Build production | Bloqué par dirty tauri.conf.json |

---

## 5. Fichiers Dirty

```
src-tauri/tauri.conf.json
  — beforeBuildCommand="true" (override local dev)
  — unicode escape sequences

src-tauri/gen/android/gradle.properties
  — cause unknown
```

**Restauration :** `git restore -- src-tauri/tauri.conf.json src-tauri/gen/android/gradle.properties`

---

## 6. Versions Vérifiées

| Composant | Version |
|-----------|---------|
| App (package.json) | 28.0.0 |
| App (tauri.conf.json) | 28.0.0 |
| Node | 18.19.1 |
| pnpm | 10.30.2 |
| Rust | 1.94.0 |
| OMEGA Conversation Engine | v19.5.2 |
| Chat Orchestrator | v21 + R04 |

---

*Autorité : Kevin Thibault — TITANE Team*
*Généré : 2026-03-15T13:32:00Z — Session MASTER_AUDIT_CANON*
