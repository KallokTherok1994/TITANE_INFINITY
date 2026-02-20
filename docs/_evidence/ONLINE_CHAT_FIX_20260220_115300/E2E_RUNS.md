E2E Runs (x3 required)

Status: BLOCKED (manual UI steps required)

Test status
- cargo test: FAILED (audio::streaming_engine::tests::test_ring_buffer_wraparound)

Scenario S1 - ONLINE OK
- Required: send a chat message with providers ready.
- Evidence needed: log line CHAT_DECISION online=true reason=OK provider=<x>.

Scenario S2 - OFFLINE REAL (simulated)
- Required: remove a key or block network, then send a message.
- Evidence needed: reasonCode OFFLINE_* or TIMEOUT with providers down.

Scenario S3 - RECOVERY AUTO
- Required: restore key or network, then send a message without restart if possible.
- Evidence needed: online returns without manual restart.

Runs
- Run 1: pending
- Run 2: pending
- Run 3: pending

---

Campagne AUTO-PROOF-HARVEST (append-only)
Timestamp campagne: 2026-02-20T12:34:36Z
Mode: Tooling-only, sans modification runtime
Script: scripts/tools/e2e_chat_proof_harvest.sh

### SCENARIO: S1
Run 1:
Timestamp: 2026-02-20T12:34:37Z
Command: node scripts/e2e/run-ui-chat-360-autofix.cjs
Result: BLOCKED
Log path: runs/S1/run1/RAW.log
Excerpt: [HARVEST] BLOCKED; reason=blocked_by_policy: requires Vite dev server (Tauri-only invariant)

Run 2:
Timestamp: 2026-02-20T12:34:37Z
Command: node scripts/e2e/run-ui-chat-360-autofix.cjs
Result: BLOCKED
Log path: runs/S1/run2/RAW.log
Excerpt: [HARVEST] BLOCKED; reason=blocked_by_policy: requires Vite dev server (Tauri-only invariant)

Run 3:
Timestamp: 2026-02-20T12:34:37Z
Command: node scripts/e2e/run-ui-chat-360-autofix.cjs
Result: BLOCKED
Log path: runs/S1/run3/RAW.log
Excerpt: [HARVEST] BLOCKED; reason=blocked_by_policy: requires Vite dev server (Tauri-only invariant)

Conclusion S1: BLOCKED (aucun run online réel exécuté)

### SCENARIO: S2
Run 1:
Timestamp: 2026-02-20T12:34:37Z
Command: node scripts/e2e/run-ui-chat-360-autofix.cjs
Result: BLOCKED
Log path: runs/S2/run1/RAW.log
Excerpt: [HARVEST] BLOCKED; reason=blocked_by_policy: requires Vite dev server (Tauri-only invariant)

Run 2:
Timestamp: 2026-02-20T12:34:37Z
Command: node scripts/e2e/run-ui-chat-360-autofix.cjs
Result: BLOCKED
Log path: runs/S2/run2/RAW.log
Excerpt: [HARVEST] BLOCKED; reason=blocked_by_policy: requires Vite dev server (Tauri-only invariant)

Run 3:
Timestamp: 2026-02-20T12:34:37Z
Command: node scripts/e2e/run-ui-chat-360-autofix.cjs
Result: BLOCKED
Log path: runs/S2/run3/RAW.log
Excerpt: [HARVEST] BLOCKED; reason=blocked_by_policy: requires Vite dev server (Tauri-only invariant)

Conclusion S2: BLOCKED (offline contrôlé non exécuté)

### SCENARIO: S3
Run 1:
Timestamp: 2026-02-20T12:34:37Z
Command: node scripts/e2e/run-ui-chat-360-autofix.cjs
Result: BLOCKED
Log path: runs/S3/run1/RAW.log
Excerpt: [HARVEST] BLOCKED; reason=blocked_by_policy: requires Vite dev server (Tauri-only invariant)

Run 2:
Timestamp: 2026-02-20T12:34:37Z
Command: node scripts/e2e/run-ui-chat-360-autofix.cjs
Result: BLOCKED
Log path: runs/S3/run2/RAW.log
Excerpt: [HARVEST] BLOCKED; reason=blocked_by_policy: requires Vite dev server (Tauri-only invariant)

Run 3:
Timestamp: 2026-02-20T12:34:37Z
Command: node scripts/e2e/run-ui-chat-360-autofix.cjs
Result: BLOCKED
Log path: runs/S3/run3/RAW.log
Excerpt: [HARVEST] BLOCKED; reason=blocked_by_policy: requires Vite dev server (Tauri-only invariant)

Conclusion S3: BLOCKED (recovery automatique non exécuté)

Synthèse extraction
- S1/S2/S3: EXTRACT_CHAT_DECISION.txt = NO_MATCHES
- S1/S2/S3: EXTRACT_OFFLINE_TEXT.txt = NO_MATCHES
- S1/S2/S3: EXTRACT_NO_FALSE_OFFLINE.txt = NO_MATCHES

Gate qualité données
- Timestamps non distincts (tous runs à 2026-02-20T12:34:37Z) -> preuve insuffisante pour validation x3 indépendante.

---

Campagne AUTO-PROOF-HARVEST v2 (WDIO desktop, append-only)
Timestamp campagne: 2026-02-20T12:51:20Z -> 2026-02-20T13:03:26Z
Script: scripts/tools/e2e_chat_proof_campaign.sh
Specs tentés:
- e2e/desktop/online-chat-proof.wdio.test.js (IPC direct)
- e2e/desktop/online-chat-proof-ui.wdio.test.js (UI)

### SCENARIO: S1
Run 1:
Timestamp: 2026-02-20T12:58:50Z
Command: TITANE_PROOF_SCENARIO=S1 TITANE_PROOF_RUN=run1 ./.tools/node/current/bin/pnpm exec wdio run wdio.desktop.conf.cjs --spec e2e/desktop/online-chat-proof-ui.wdio.test.js
Result: BLOCKED
Log path: runs/S1/run1/RAW.log
Excerpt: AssertionError: Chat selectors not found

Run 2:
Timestamp: 2026-02-20T12:58:58Z
Command: idem run1 avec TITANE_PROOF_RUN=run2
Result: BLOCKED
Log path: runs/S1/run2/RAW.log
Excerpt: AssertionError: Chat selectors not found

Run 3:
Timestamp: 2026-02-20T12:59:06Z
Command: idem run1 avec TITANE_PROOF_RUN=run3
Result: BLOCKED
Log path: runs/S1/run3/RAW.log
Excerpt: AssertionError: Chat selectors not found

Conclusion S1: BLOCKED

### SCENARIO: S2
Run 1:
Timestamp: 2026-02-20T12:59:14Z
Command: OFFLINE_SIM=1 + driver UI
Result: BLOCKED
Log path: runs/S2/run1/RAW.log
Excerpt: AssertionError: Chat selectors not found

Run 2:
Timestamp: 2026-02-20T12:59:22Z
Command: OFFLINE_SIM=1 + driver UI
Result: BLOCKED
Log path: runs/S2/run2/RAW.log
Excerpt: AssertionError: Chat selectors not found

Run 3:
Timestamp: 2026-02-20T12:59:30Z
Command: OFFLINE_SIM=1 + driver UI
Result: BLOCKED
Log path: runs/S2/run3/RAW.log
Excerpt: AssertionError: Chat selectors not found

Conclusion S2: BLOCKED

### SCENARIO: S3
Run 1:
Timestamp: 2026-02-20T12:59:38Z
Command: recovery (OFFLINE_SIM unset) + driver UI
Result: BLOCKED
Log path: runs/S3/run1/RAW.log
Excerpt: AssertionError: Chat selectors not found

Run 2:
Timestamp: 2026-02-20T12:59:46Z
Command: recovery (OFFLINE_SIM unset) + driver UI
Result: BLOCKED
Log path: runs/S3/run2/RAW.log
Excerpt: AssertionError: Chat selectors not found

Run 3:
Timestamp: 2026-02-20T12:59:54Z
Command: recovery (OFFLINE_SIM unset) + driver UI
Result: BLOCKED
Log path: runs/S3/run3/RAW.log
Excerpt: AssertionError: Chat selectors not found

Conclusion S3: BLOCKED

Technical blocker proof
- IPC driver (previous attempt): `execute/sync` parse failure for async invoke in WRY WebDriver.
- UI driver: chat surface selectors absent in current desktop session.
- Consequence: aucun `CHAT_DECISION` extrait (`EXTRACT_CHAT_DECISION.txt = NO_MATCHES` sur 9 runs).

---

Targeted reruns v3 (append-only)

Single run (selector patch validation)
- Timestamp: 2026-02-20T13:16:14Z
- Command: `TITANE_PROOF_SCENARIO=S1 TITANE_PROOF_RUN=run1 pnpm exec wdio run wdio.desktop.conf.cjs --spec e2e/desktop/online-chat-proof-ui.wdio.test.js`
- Result: BLOCKED
- Excerpt: `AssertionError: Chat selectors not found`
- Diagnostic: `[DOM_DIAG] ... bodyTextHead="Aller au contenu principal ⚡ TITANE∞ Chargement..." testIds=[]`

Single run (bundled binary forced)
- Timestamp: 2026-02-20T13:18:27Z
- Command: `TAURI_BINARY_PATH=$(command -v titane-infinity) TITANE_PROOF_SCENARIO=S1 TITANE_PROOF_RUN=run1 pnpm exec wdio run ...online-chat-proof-ui.wdio.test.js`
- Result: BLOCKED
- Excerpt: `AssertionError: Chat selectors not found`
- Diagnostic: même fallback statique (`Chargement...`, aucun `data-testid`, aucun `textarea`)

Conclusion v3
- Les sélecteurs E2E ont été stabilisés côté code, mais la preuve runtime reste BLOCKED tant que le frontend React ne monte pas dans la session WRY test.

---

Targeted reruns v4 (append-only)

Single run (React mount wait + DOM_DIAG)
- Timestamp: 2026-02-20T13:44:xxZ
- Command: `TAURI_BINARY_PATH=$(command -v titane-infinity) TITANE_PROOF_SCENARIO=S1 TITANE_PROOF_RUN=run1 pnpm exec wdio run wdio.desktop.conf.cjs --spec e2e/desktop/online-chat-proof-ui.wdio.test.js`
- Result: BLOCKED (`React root not mounted`)
- Diagnostic:
	- `titaneBoot.errors[0] = ReferenceError: Cannot access uninitialized variable.`
	- Source: `tauri://localhost/assets/services-ai-OxGOyH_O.js`

Conclusion v4
- Frontend bundle `services-ai` échoue au chargement en WRY, empêchant tout montage React et donc toute preuve chat runtime.
