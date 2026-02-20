Changes

Backend (Ring 4)
- src-tauri/src/conversation_engine/mod.rs
  - timeout 60s
  - timeout decision uses AIRouter status
  - NO_FALSE_OFFLINE guard log
  - timeout fallback message avoids false offline when providers ready
  - unit tests for timeout decision
- src-tauri/src/conversation_engine/meta_accumulator.rs
  - build_timeout_meta_with_policy helper
- src-tauri/src/conversation_engine/commands.rs
  - decision contract emitted in IPC response (decision) with reasonCode mapping
  - CHAT_DECISION log added (1 line per response)

Frontend (Ring 4)
- src/types/providerMeta.ts
  - OnlineDecision type
- src/services/conversationEngine.ts
  - parse decision from backend response and expose it

---

Proof/Tooling update (append-only)
- scripts/tools/e2e_chat_proof_harvest.sh
  - Script de collecte automatique de preuves (A1/A2 + structure runs/S1..S3/run1..run3)
  - Génère TS/CMD/RAW/extractions/notes par run
  - Marque BLOCKED traçable si exécution chat E2E incompatible avec invariants
- docs/_evidence/ONLINE_CHAT_FIX_20260220_115300/runs/**
  - Artefacts auto-générés pour S1/S2/S3 x3
- docs/_evidence/ONLINE_CHAT_FIX_20260220_115300/build/**
  - Preuves build impact en statut BLOCKED (gate token absent)
- docs/_evidence/ONLINE_CHAT_FIX_20260220_115300/rollback/ROLLBACK_RESULT.txt
  - Rollback: NOT REQUESTED

Change metadata requirement
- Ring impacté: Ring 4 (E2E harness/tooling + preuve docs)
- Status: EXPERIMENTAL

---

Additional E2E driver attempts (append-only)
- e2e/desktop/online-chat-proof.wdio.test.js
  - Driver WDIO IPC direct pour `conversation_generate` (tentative Tauri v1/v2)
- e2e/desktop/online-chat-proof-ui.wdio.test.js
  - Driver WDIO UI pour envoi message sans IPC direct
- scripts/tools/e2e_chat_proof_campaign.sh
  - Campagne S1/S2/S3 x3 avec extraction par run (RAW + TAURI_DRIVER)

Observed blocker
- WRY WebDriver session ne permet pas une collecte exploitable du chat dans cet environnement:
  - IPC direct: `Could not parse script result` / `execute/sync`
  - UI driver: `Chat selectors not found`

Change metadata requirement
- Ring impacté: Ring 4 (E2E harness)
- Status: EXPERIMENTAL

---

Additional unblock attempts v3 (append-only)
- src/components/chat/ChatBubble.tsx
  - Ajout de `data-testid` stables pour E2E:
    - `chat-bubble-panel`, `chat-bubble-messages`, `chat-bubble-input`, `chat-bubble-send`
    - `chat-bubble-message-assistant`, `chat-bubble-assistant-content`
- e2e/desktop/online-chat-proof-ui.wdio.test.js
  - Priorité aux sélecteurs `data-testid` + fallbacks corrigés
  - Correctif sélecteur en mode `#chat-input-textarea` (`.chat-send-btn.chat-send-omega`)
  - Ajout diagnostic DOM (`[DOM_DIAG]`) en cas d'échec
  - Attente explicite du montage React (root + marqueur boot)
- scripts/e2e/tauri-wrapper.sh
  - Support explicite de `TAURI_BINARY_PATH` fourni par l'appelant
  - Ajout fallback `~/.local/bin/titane-infinity`
- scripts/tools/e2e_chat_proof_campaign.sh
  - Injection de `TAURI_BINARY_PATH=$(command -v titane-infinity)` pour forcer un binaire installé

Résultat
- Toujours BLOCKED: la session WRY affiche uniquement le fallback HTML statique `Chargement...` (React non monté), donc aucun sélecteur chat détectable.

Change metadata requirement
- Ring impacté: Ring 4 (UI chat + E2E harness)
- Status: EXPERIMENTAL

---

Stop-the-line compliance (append-only)
- Unexpected Rust changes detected in audio/config/core/security modules.
- Action: reverted to HEAD for listed Rust files (see runs/_unexpected_changes.diff).
- Proof: runs/_unexpected_changes_post_status.txt

React crash localization (append-only)
- Added runs/react_crash/FIND_BUNDLE.md with bundle name, line, and import chain.

---

Stop-the-line re-audit (append-only)
- Unexpected Rust changes reappeared in config/conversation_engine files.
- Evidence: runs/_unexpected_changes_rust_repeat.diff, runs/_unexpected_changes_rust_repeat_files.txt.
- Action: reverted to HEAD and captured post-status.

Change metadata requirement
- Ring impacté: Ring 4 (proof pack docs)
- Status: EXPERIMENTAL
