# COMMANDS_SOURCE_OF_TRUTH.md — Source de Vérité des Commandes Tauri

**Version:** 28.0.0 | **SHA:** c59e9b5b3 | **Date:** 2026-03-15T13:32:00Z
**Source:** `src-tauri/src/main.rs` — bloc `tauri::generate_handler![...]`
**Classification:** CANON

---

## Métadonnées

| Attribut | Valeur |
|----------|--------|
| Source de vérité | `src-tauri/src/main.rs` invoke_handler |
| Total enregistré | **401 commandes** (SHA c59e9b5b3, Python parse stash-confirmé) |
| Total actuel (non committé) | **408 commandes** (+ 7 AUDIO_VOICE_AUDIT patches) |
| Valeur rétractée | ~~378~~ — artefact grep tronqué |
| proof_type | CODE (registered in source) |
| Dirty state | `tauri.conf.json` → `beforeBuildCommand="true"` (local dev override) |
| Cargo check | NON EXECUTE — non lancé cette session |

---

## Avertissement Critique

> **"registered" ≠ "fully implemented and stable"**
>
> Le fait qu'une commande soit dans `generate_handler![]` prouve uniquement :
> 1. La fonction Rust existe dans le source
> 2. Elle est exposée à l'IPC frontend
>
> Cela ne prouve PAS :
> - Le bon fonctionnement en runtime
> - L'absence de panics ou d'erreurs silencieuses
> - La stabilité sous charge
> - La compilation réussie (cargo check non exécuté)

---

## Domaines et Statuts

| Domaine | Commandes | Statut |
|---------|-----------|--------|
| Boot/State Bridge | 7 | PROVEN (CODE) |
| Database (Option1/libSQL) | 8 | PROVEN (CODE) |
| Core Messaging | 2 | PROVEN (CODE) |
| Conversation Engine OMEGA | 5 | PROVEN (CODE) |
| Chat Orchestrator | 8 | PROVEN (CODE) |
| Diagnostic | 1 | PROVEN (CODE) |
| Web Research | 1 | PROVEN (CODE) — STUB (no network) |
| Telemetry | 1 | PROVEN (CODE) |
| Voice Engine | 17 | PROVEN (CODE) |
| Avatar Engine | 10 | PROVEN (CODE) |
| Avatar Appearance | 10 | PROVEN (CODE) |
| Avatar Floating (desktop cfg) | 15+ | PROVEN (CODE, desktop-only) |
| Avatar FullBody | 12 | PROVEN (CODE) |
| Singularity Fusion | ~66 | PROVEN (CODE) |
| Singularity State | 18 | PROVEN (CODE) |
| System Center | 23 | PROVEN (CODE) |
| Orchestration Center | 2 | PROVEN (CODE) |
| QA Monitoring | 6 | PROVEN (CODE) |
| One Core | 8 | PROVEN (CODE) |
| EXP Fusion Engine | 8 | PROVEN (CODE) |
| Security (secure_commands) | 13 | PROVEN (CODE) |
| Runtime Config | 2 | PROVEN (CODE) |
| Chat Generate Providers | 3 | PROVEN (CODE) |
| Copilot | 4 | PROVEN (CODE) |
| AI Prompt Generator + Ollama | 2 | PROVEN (CODE) |
| Auth OS | 9 | PROVEN (CODE) |
| Audio/TTS/VAD/Capture | 19 | PROVEN (CODE) |
| Audio speak/recording | 4 | PROVEN (CODE) |
| Memory API + Helios | 9 | PROVEN (CODE) |
| Governance | 11 | PROVEN (CODE) |
| Memory OS | 5 | PROVEN (CODE) |
| Coherence Engine | 5 | PROVEN (CODE) |
| Unified Memory | 6 | PROVEN (CODE) |
| System Health | 10 | PROVEN (CODE) |
| DevTools | 3 | PROVEN (CODE) |
| Whisper Streaming | 3 | PROVEN (CODE) |
| Persistent Memory v19.2Ω | 12 | PROVEN (CODE) |
| UI Theme / Design Center | 4 | PROVEN (CODE) |
| Self-Healing (core + executor) | 18 | PROVEN (CODE) |
| Singularity Extra | 1 | PROVEN (CODE) |
| Window Controls | 8 | PROVEN (CODE) |
| Config Hub | 14 | PROVEN (CODE) |
| Titan Persistence | 27 | PROVEN (CODE) |
| Onboarding | 3 | PROVEN (CODE) |
| Fusion Commands (Week 1-4) | 8 | PROVEN (CODE) |
| Control Panel | 7 | PROVEN (CODE) |
| Identity Engine | 12 | PROVEN (CODE) |
| Legacy AI Bridge | 19 | PROVEN (CODE) |

**TOTAL : 401 commandes (SHA c59e9b5b3) / 408 commandes (avec patches non committés)**

---

## Commandes Supprimées / Dépréciées

| Commande | Raison | Remplacement |
|----------|--------|-------------|
| `chat_send_message` | Retirée en v27.0.5-prod | `conversation_generate` |
| `voice_synthesize_speech` | Dépréciée | `speak()` dans ai_chat.rs |

---

## Handlers Multiples (RISQUE C003 — OPEN)

`src-tauri/src/handlers.rs` contient des blocs `invoke_handler` legacy (v14, v16).
**Risque :** Shadowing potentiel de commandes si plusieurs handlers actifs.
**Action requise :** `cargo check --workspace` pour confirmer lequel est actif.
**Priorité :** P1

---

## Chemin vers PASS

1. `git restore -- src-tauri/tauri.conf.json` — débloquer build
2. `cargo check --workspace` — confirmer compilation 401 cmds + confirmer C003 dead code
3. `cargo clippy --all` — vérifier warnings Rust
4. `pnpm tauri build` — build production
5. E2E run x3 — valider G_COMMANDS_SOURCE_OF_TRUTH en runtime

---

*Autorité : Kevin Thibault — TITANE Team | 2026-03-15T13:32:00Z*
