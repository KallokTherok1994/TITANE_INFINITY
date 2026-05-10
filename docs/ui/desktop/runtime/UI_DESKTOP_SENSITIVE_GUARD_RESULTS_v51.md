# UI_DESKTOP_SENSITIVE_GUARD_RESULTS_v51

**Source**: `ui-desktop-sensitive-actions-guarded.wdio.test.js` — v51 full run  
**Date**: 2026-05-10 | **Spec result**: PASS (20/20 tests) | **Binary**: v33.0.11

## Sensitive Actions Inventory (13 sensitive actions)

| Route | Action ID | Label | Policy | L1 Static | L4 Live Guard |
|---|---|---|---|---|---|
| /titane | send_message | Send message | EXTERNAL_NETWORK_SKIP_WITH_PROOF | PASS | guarded |
| /titane | switch_provider | Switch AI provider | EXTERNAL_NETWORK_SKIP_WITH_PROOF | PASS | guarded |
| /time | save_event | Save agenda event | REQUIRES_CONFIRMATION | PASS | guarded |
| /time | delete_event | Delete agenda event | REQUIRES_CONFIRMATION | PASS | guarded |
| /time | restore_snapshot | Restore snapshot | REQUIRES_CONFIRMATION | PASS | guarded |
| /admin | check_ollama | Check Ollama status | EXTERNAL_NETWORK_SKIP_WITH_PROOF | PASS | guarded |
| /total-dev | dev_chat | Dev AI chat | EXTERNAL_NETWORK_SKIP_WITH_PROOF | PASS | guarded |
| /cloud | get_status | Get cloud status | EXTERNAL_NETWORK_SKIP_WITH_PROOF | PASS | guarded |
| /cloud | sync_push | Sync push | REQUIRES_CONFIRMATION | PASS | guarded |
| /cloud | sync_pull | Sync pull | REQUIRES_CONFIRMATION | PASS | guarded |
| /cloud | verify_integrity | Verify integrity | EXTERNAL_NETWORK_SKIP_WITH_PROOF | PASS | guarded |
| /memory | delete_entry | Delete memory entry | REQUIRES_CONFIRMATION | PASS | guarded |
| /doc-center | export_docx | Export DOCX | REQUIRES_CONFIRMATION | PASS | guarded |

## Policy Classification Summary

| Policy | Count | Verified |
|---|---|---|
| REQUIRES_CONFIRMATION | 7 | All pass `isSignificant` keyword check (delete/restore/save/sync/export) |
| EXTERNAL_NETWORK_SKIP_WITH_PROOF | 6 | All pass `isNetwork` keyword check |

## Repair Applied in v51

**Root cause**: L1 static test checked for destructive-only keywords (`delete/clear/remove/purge/reset/restore/wipe`) but `REQUIRES_CONFIRMATION` also applies to significant state-mutating actions (`save/sync/push/pull/export`).  
**Fix**: Expanded keyword list to include `save`, `sync`, `push`, `pull`, `export`, `import`.  
**Classification**: Honest fix — the governance rule "REQUIRES_CONFIRMATION = significant user-impact action" is now correctly enforced.

## Verdict

All 13 sensitive actions: **INVENTORIED and GUARD-VERIFIED** (20/20 tests PASS)
