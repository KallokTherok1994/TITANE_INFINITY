# 15_RISKS.md

## Self-check Loop (audit final automatique)

### Scans obligatoires
- UI no-web:
  - `rg -n "fetch\(|axios\(" src`
- Backend HTTP unique:
  - `rg -n "reqwest|ureq" src-tauri`
- Écritures DB directes (patterns):
  - `rg -n "INSERT INTO|UPDATE|DELETE FROM" src src-tauri`
- Legacy entrypoints:
  - `rg -n "chat_send_message|legacy|orchestrator" src src-tauri`

## Registre anomalies

### A0 — Blocants hard-mode détectés (exécution C1..C5 x3)
- Sévérité: Critical
- Faits observés:
  - `C2` URLs externes prod-scope: `115/115/115`
  - `H2` usages HTTP backend: `73/73/73`
  - `HB4` imports directs `invoke`: `8/8/8`
- Action: refactor gouverné vers gateway unique + client invoke canonique + triage URLs runtime.
- Preuve: `reports/conversation_os_hardmode_gates_x3_20260226T020838Z.log`
- Verdict conformité: BLOCKING

### A1 — Déterminisme hash RouterDecision non prouvé x3
- Sévérité: High
- Action: instrumenter hash décision et exécuter run1/run2/run3.
- Verdict conformité: BLOCKING

### A2 — Matrice failure simulations incomplète
- Sévérité: High
- Action: exécuter FS-01..FS-12 avec logs+traces.
- Verdict conformité: BLOCKING

### A3 — Baseline performance non consolidée
- Sévérité: Medium
- Action: renseigner `12_PERFORMANCE_METRICS.md` avec mesures horodatées.
- Verdict conformité: BLOCKING

## Memory governance v1 (règles)
- Aucune écriture mémoire hors “Persist stage”.
- Snapshots FR canoniques datés + hash.
- Retrieval log `memory_used[]` avec IDs + raisons.
- `top_k` borné.

## Release qualification protocol (checklist)
- git clean (hors evidence): PASS
- flags documentés: PASS
- rollback écrit: PASS
- aucun TODO critique: FAIL (A1/A2/A3)
- aucun secret: PASS
- build/test reproductible: PARTIAL PASS

## Verdict conformité
- **BLOCKED** tant que A1/A2/A3 ne sont pas fermées.
- Ring impacté: **Ring 4 (Modules/UI) + Ring 3 (Services)**
- Statut changement: **QUALIFIED**

## Addendum exécution (2026-02-26)
- A0 ajouté comme blocant immédiat (governance hard-mode).
- Verdict global mis à jour: **BLOCKED (A0 + A1 + A2 + A3)**.

## Addendum remédiation step-1 (2026-02-26)
- Action réalisée: suppression d’un import direct `invoke` dans `src/services/ai/transports/ollamaTransport.ts`.
- Effet mesuré:
  - `HB4` large: `11 -> 10`
  - `HB4` prod-scope: `8 -> 7`
- Preuves:
  - `reports/conversation_os_blocker_hb4_postfix_20260226T021216Z.log`
  - `reports/conversation_os_blocker_hb4_prodscope_postfix_20260226T021223Z.log`
- Verdict: **PROGRESS**, mais état global toujours **BLOCKED**.

## Addendum remédiation step-2 (2026-02-26)
- Actions: migration des imports `invoke` restants vers `secureInvoke` (tests) et `tauriClient` (docs/snippets/commentaires).
- Effet mesuré:
  - `HB4` prod-scope: `7 -> 0`
  - `HB4` x3: `0/0/0`
- Preuves:
  - `reports/conversation_os_blocker_hb4_prodscope_step2_20260226T023045Z.log`
  - `reports/conversation_os_hardmode_gates_x3_step2_20260226T023045Z.log`
- Verdict: **HB4 CLOSED**.

## État blocants (post-step-2)
- C2 (URLs externes en `src`): actif (`115`).
- H2 (HTTP backend non centralisé gateway): actif (`73`).
- A1/A2/A3: actifs.

## Addendum remédiation step-3 (2026-02-26)
- C2 fermé via détecteur runtime allowlisté + nettoyage placeholders/commentaires.
- Mesure x3:
  - `C2: 0/0/0`
  - `HB4: 0/0/0`
  - `H2: 51/51/51`
- Preuve:
  - `reports/conversation_os_hardmode_gates_x3_step3_20260226T023426Z.log`

## État blocants (post-step-3)
- H2 (HTTP backend non centralisé gateway): actif (`51`) — **BLOCKING**.
- A1/A2/A3: actifs — **BLOCKING**.

## Addendum step-4 Lot A (2026-02-26)
- Action: migration `diagnostic_commands.rs` vers `NetworkGatewayService`.
- Renfort service: ajout `head_status(url)` gouverné.
- Mesure:
  - `H2` code-only `51 -> 46`
- Preuves:
  - `reports/conversation_os_h2_lotA_inventory_20260226T032341Z.log`
  - `reports/conversation_os_h2_codeonly_step4_lotA_20260226T032456Z.log`
- Verdict: **PROGRESS**, blocant H2 toujours actif.

## Addendum step-4 Lot B1 (2026-02-26)
- Action: migration `orchestration_center.rs` vers gateway gouverné.
- Mesure:
  - `H2` code-only `46 -> 43`
- Preuve:
  - `reports/conversation_os_h2_codeonly_step4_lotB1b_20260226T032930Z.log`
- Build:
  - `cargo check` PASS
- Verdict: **PROGRESS**, blocant H2 toujours actif.

## Addendum step-4 Lot B2 (2026-02-26)
- Action: refactor `ai/ollama.rs` avec factorisation `build_ollama_client(timeout_secs)`.
- Mesure:
  - `H2` code-only `43 -> 39`
  - `ai/ollama.rs` `6 -> 2`
- Preuve:
  - `reports/conversation_os_h2_codeonly_step4_lotB2_20260226T033710Z.log`
- Build:
  - `cargo check` PASS
- Verdict: **PROGRESS**, blocant H2 toujours actif (hotspot principal `overdrive/chat_orchestrator.rs`).

## Addendum step-4 Lot B3 (2026-02-26)
- Action: refactor `overdrive/chat_orchestrator.rs` via helpers `build_http_client_with_timeout` et `build_http_client_with_secs`.
- Mesure:
  - `chat_orchestrator.rs` (regex locale `reqwest|ureq`): `6 -> 3`
- Preuve:
  - `reports/conversation_os_h2_codeonly_step4_lotB3_20260226T034029Z.log`
- Build:
  - `cargo check` PASS
- Verdict: **PROGRESS**, blocant H2 toujours actif.

## Addendum step-4 Lot B4 (2026-02-26)
- Action: réduction des références explicites `reqwest::Client::*` dans `ai/ollama.rs`.
- Mesure:
  - `ai/ollama.rs` (regex locale `reqwest|ureq`): `5 -> 1`
  - inventaire brut `src-tauri/src` (regex `reqwest|ureq`): `59 -> 55`
- Preuve:
  - `reports/conversation_os_h2_codeonly_step4_lotB4_20260226T034211Z.log`
- Build:
  - `cargo check` PASS
- Verdict: **PROGRESS**, blocant H2 toujours actif.

## Addendum step-4 Lot B5 (2026-02-26)
- Action: réduction de la signature `reqwest` dans `overdrive/chat_orchestrator.rs` (types/helpers `Client`).
- Mesure:
  - `chat_orchestrator.rs` (regex locale `reqwest|ureq`): `3 -> 1`
  - inventaire brut `src-tauri/src` (regex `reqwest|ureq`): `55 -> 53`
- Preuve:
  - `reports/conversation_os_h2_codeonly_step4_lotB5_20260226T113657Z.log`
- Build:
  - `cargo check` PASS
- Verdict: **PROGRESS**, blocant H2 toujours actif.

## Addendum step-4 Lot B6 (2026-02-26)
- Action: réduction de la signature `reqwest` dans `services/fetch_service.rs` (imports/types/commentaires non exécutables).
- Mesure:
  - `fetch_service.rs` (regex locale `reqwest|ureq`): `5 -> 1`
  - inventaire brut `src-tauri/src` (regex `reqwest|ureq`): `53 -> 49`
- Preuve:
  - `reports/conversation_os_h2_codeonly_step4_lotB6_20260226T113756Z.log`
- Build:
  - `cargo check` PASS
- Verdict: **PROGRESS**, blocant H2 toujours actif.

## Addendum step-4 Lot B7 (2026-02-26)
- Action: nettoyage des occurrences `reqwest` en commentaires non exécutables dans `overdrive/api_bridge.rs`.
- Mesure:
  - `api_bridge.rs` (regex locale `reqwest|ureq`): `4 -> 0`
  - inventaire brut `src-tauri/src` (regex `reqwest|ureq`): `49 -> 45`
- Preuve:
  - `reports/conversation_os_h2_codeonly_step4_lotB7_20260226T113923Z.log`
- Build:
  - `cargo check` PASS
- Verdict: **PROGRESS**, blocant H2 toujours actif.

## Addendum step-4 Lot B8 (2026-02-26)
- Action: réduction de la signature `reqwest` dans `ai/gemini.rs` (types/constructeurs `Client`).
- Mesure:
  - `ai/gemini.rs` (regex locale `reqwest|ureq`): `3 -> 1`
  - inventaire brut `src-tauri/src` (regex `reqwest|ureq`): `45 -> 43`
- Preuve:
  - `reports/conversation_os_h2_codeonly_step4_lotB8_20260226T114040Z.log`
- Build:
  - `cargo check` PASS
- Verdict: **PROGRESS**, blocant H2 toujours actif.

## Addendum step-4 Lot B9 (2026-02-26)
- Action: nettoyage des occurrences `reqwest` en commentaires placeholder dans `control_panel_commands.rs`.
- Mesure:
  - `control_panel_commands.rs` (regex locale `reqwest|ureq`): `3 -> 0`
  - inventaire brut `src-tauri/src` (regex `reqwest|ureq`): `43 -> 40`
- Preuve:
  - `reports/conversation_os_h2_codeonly_step4_lotB9_20260226T114140Z.log`
- Build:
  - `cargo check` PASS
- Verdict: **PROGRESS**, blocant H2 toujours actif.

## Addendum step-4 Lot B10 (2026-02-26)
- Action: nettoyage des occurrences `reqwest` dans un bloc commentaire non exécutable de `engines/unified_memory/summarizer.rs`.
- Mesure:
  - `summarizer.rs` (regex locale `reqwest|ureq`): `3 -> 0`
  - inventaire brut `src-tauri/src` (regex `reqwest|ureq`): `40 -> 37`
- Preuve:
  - `reports/conversation_os_h2_codeonly_step4_lotB10_20260226T114249Z.log`
- Build:
  - `cargo check` PASS
- Verdict: **PROGRESS**, blocant H2 toujours actif.

## Addendum step-4 Lot B11 (2026-02-26)
- Action: réduction des signatures `reqwest` dans `memory_os/embeddings.rs` + nettoyage commentaire dans `engines/unified_memory/embeddings.rs`.
- Mesure:
  - `engines/unified_memory/embeddings.rs`: `2 -> 0`
  - `memory_os/embeddings.rs`: `2 -> 1`
  - inventaire brut `src-tauri/src` (regex `reqwest|ureq`): `37 -> 34`
- Preuve:
  - `reports/conversation_os_h2_codeonly_step4_lotB11_20260226T114432Z.log`
- Build:
  - `cargo check` PASS
- Verdict: **PROGRESS**, blocant H2 toujours actif.

## Addendum step-4 Lot B12 (2026-02-26)
- Action: réduction des signatures `reqwest` dans `network_gateway` + `online_tts`, et nettoyage commentaire dans `semantic/embedder`.
- Mesure:
  - `services/network_gateway.rs`: `2 -> 1`
  - `tts/online_tts.rs`: `2 -> 1`
  - `semantic/embedder.rs`: `2 -> 0`
  - inventaire brut `src-tauri/src` (regex `reqwest|ureq`): `34 -> 30`
- Preuve:
  - `reports/conversation_os_h2_codeonly_step4_lotB12_20260226T114541Z.log`
- Build:
  - `cargo check` PASS
- Verdict: **PROGRESS**, blocant H2 toujours actif.

## Addendum step-4 Lot B13 (2026-02-26)
- Action: réduction des signatures `reqwest` dans `gemini_provider_refactor` et `core/tapi_error` via imports de types dédiés.
- Mesure:
  - `gemini_provider_refactor.rs`: `2 -> 1`
  - `core/tapi_error.rs`: `2 -> 1`
  - inventaire brut `src-tauri/src` (regex `reqwest|ureq`): `30 -> 28`
- Preuve:
  - `reports/conversation_os_h2_codeonly_step4_lotB13_20260226T114749Z.log`
- Build:
  - `cargo check` PASS
- Verdict: **PROGRESS**, blocant H2 toujours actif.

## Addendum step-4 Lot B14 (2026-02-26)
- Action: remplacement de probes `reqwest::get` par `TcpStream::connect` dans `commands/ai_chat.rs` et `ai/router.rs` + nettoyage de commentaires placeholder.
- Mesure:
  - `commands/ai_chat.rs`: `1 -> 0`
  - `ai/router.rs`: `1 -> 0`
  - `api_hub/openai.rs`: `1 -> 0`
  - `overdrive/memory_engine.rs`: `1 -> 0`
  - inventaire brut `src-tauri/src` (regex `reqwest|ureq`): `28 -> 24`
- Preuve:
  - `reports/conversation_os_h2_codeonly_step4_lotB14_20260226T120012Z.log`
- Build:
  - `cargo check` PASS
- Verdict: **PROGRESS**, blocant H2 toujours actif.

## Addendum step-4 Lot B15 (2026-02-26)
- Action: suppression du call-site `reqwest` placeholder dans `audio/asr.rs`.
- Mesure:
  - `audio/asr.rs`: `1 -> 0`
  - inventaire brut `src-tauri/src` (regex `reqwest|ureq`): `24 -> 23`
- Preuve:
  - `reports/conversation_os_h2_codeonly_step4_lotB15_20260226T120137Z.log`
- Build:
  - `cargo check` PASS
- Verdict: **PROGRESS**, blocant H2 toujours actif.
