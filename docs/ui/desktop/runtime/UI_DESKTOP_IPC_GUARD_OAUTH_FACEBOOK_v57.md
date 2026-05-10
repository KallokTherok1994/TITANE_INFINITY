# UI_DESKTOP_IPC_GUARD_OAUTH_FACEBOOK_v57

**Date**: 2026-05-10  
**Session**: v57 — Backend Activation Reduction  
**Gate**: `guard:ipc-contract`  
**Pre-fix**: 41/42 FAIL  
**Post-fix**: 42/42 PASS

---

## Root Cause

The commands `oauth_facebook_initiate`, `oauth_facebook_callback`, `oauth_facebook_get_profile`, and `oauth_facebook_logout` were:
1. Registered as Tauri commands in `src-tauri/src/auth/commands.rs`
2. Added to `ALLOWED_COMMANDS` in `src/lib/security.ts`
3. Used in `src/services/auth/oauthService.ts`
4. **Missing from** `src-tauri/tauri.conf.json` `main-capability.allow[]`

The IPC contract guard (`guard:ipc-contract`) counts all `ALLOWED_COMMANDS` from `security.ts` and expects each to have a corresponding entry in `tauri.conf.json`. The count was 42 frontend commands vs 41 allowed entries — a 1 mismatch that actually expanded to 4 commands missing (the 3 additional oauth_facebook beyond the first were silently missing).

---

## Fix Applied

File: `src-tauri/tauri.conf.json`  
Location: `permissions.main-capability.allow[]`, after `performance_get_metrics` entry

```json
{ "command": "oauth_facebook_initiate" },
{ "command": "oauth_facebook_callback" },
{ "command": "oauth_facebook_get_profile" },
{ "command": "oauth_facebook_logout" }
```

---

## Verification

```
pnpm run guard:ipc-contract
→ IPC CONTRACT PASS: 42/42 commands validated
```

---

## Rollback

To revert:
```bash
# Remove the 4 oauth_facebook entries from src-tauri/tauri.conf.json main-capability.allow[]
```

After removal, `guard:ipc-contract` will return to 41/42 FAIL — this will block any governed session.

---

## Security Note

The oauth_facebook capability entries follow the same pattern as all other commands in `main-capability`. The Tauri capabilities system ensures only declared commands can be invoked from the frontend. These 4 entries are required for the OAuth 2.0 Facebook login flow to function in production.
