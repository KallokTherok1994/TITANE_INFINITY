---
applyTo: 'e2e/**, scripts/e2e/**, wdio*.conf*'
---

# Tests E2E Instructions

## Invariants rappeles

- Ring impacte: Ring 3 (Orchestration) and Ring 4 (E2E harness/UI).
- Determinisme, selectors stables, exports requis.
- Wrapper tauri-driver obligatoire + memory guard.

## DO

- Keep retries bounded and logged.
- Export page_classification, chat_dom_map, AR20, OFFLINE5, navigation, stability.
- Use reports/ for all proofs.
- For every new capability/feature, create E2E tests with stable `data-testid` selectors (Rule 16).
- For advanced Q&A capabilities, create scenario tests that verify real behavior (Rule 16).
- For fullscreen/zoom/chat visibility work, prefer proofs that validate the real scroll region, bottom composer visibility, and return-to-bottom behavior instead of static screenshots alone.
- For every E2E fix, follow the kernel AutoFix/AutoHeal canonical capture rule with:
  - `signature`: failing test name + artifact marker (log/export/error marker)
  - `verification`: rerun E2E command + explicit pass markers
  - `prevention`: gate/test change that prevents silent recurrence
- Kernel-mandated session gates apply (Rule 10 — `detect_recurrence.sh` + `verify_instructions.sh`).

## AutoHeal Gate (Rule 10 — mandatory before verdict)

After every E2E fix or new E2E test:

```bash
bash scripts/autoheal/detect_recurrence.sh  # must exit 0
bash scripts/verify_instructions.sh          # must exit 0
```

## Fullscreen / Zoom Proof Pattern

- Seed a long enough conversation to force a truthful overflow condition when the host permits it.
- Assert the stable scroll region selector before interacting: `chat-messages-scroll-region`.
- Assert input/composer visibility after layout compaction.
- If a return CTA exists, assert its visibility within the viewport and validate that it restores the latest message view.
- Record any host divergence truthfully; do not convert a runtime gap into a narrative PASS.

## DONT

- Skip wrapper/guard markers.
- Use hardcoded dev URLs without env override.
- Apply flaky band-aids (random sleeps/timeouts) instead of deterministic fixes.
- Ship a new user-facing feature without an E2E test.

## Required Export Artifacts (reports/e2e/)

Must be present before any E2E gate can PASS:

| Artifact              | Format | Location                               |
| --------------------- | ------ | -------------------------------------- |
| `page_classification` | JSON   | `reports/e2e/page_classification.json` |
| `chat_dom_map`        | JSON   | `reports/e2e/chat_dom_map.json`        |
| `AR20`                | JSON   | `reports/e2e/AR20.json`                |
| `OFFLINE5`            | JSON   | `reports/e2e/OFFLINE5.json`            |
| `navigation`          | JSON   | `reports/e2e/navigation.json`          |
| `stability`           | JSON   | `reports/e2e/stability.json`           |

## Preuves attendues

- Logs with wrapper/guard markers and export files.
- Q&A scenario test output for new capabilities.

## Gates specifiques

- Stop-the-line if any required export is missing.
  - Mechanism: validator detects missing file → exits code 1 (FAIL) → agent workflow halts.
- Missing required exports ⇒ `FAIL` + mandatory AutoFix/AutoHeal entry describing prevention.
- Missing test for new feature/capability ⇒ `BLOCKED` until test exists (Rule 16).
- Gate recurrence obligatoire: `G_AH_RECURRENCE_GUARD_PASS`.

## Rollback

- git restore -- e2e scripts/e2e wdio*.conf*
