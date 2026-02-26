# 14_ROLLBACK.md

Date (UTC): 2026-02-26

## États des flags (safe defaults)
- `CONVOS_V1=1`
- `CONVOS_NETWORK_GATEWAY=1`
- `CONVOS_RESILIENCE=1`
- `CONVOS_SEARCH=1`
- `CONVOS_MEMORY_SNAPSHOTS=1`
- `CONVOS_MEMORY_LTM=0`
- `CONVOS_DEBUG_PANEL=1`

## Désactivation sûre Conversation OS (mode local/offline)
- Forcer mode offline:
	- `TITANE_OFFLINE_MODE=1`
	- `OFFLINE_SIM=1`
- Désactiver providers externes:
	- `VITE_ENABLE_EXTERNAL_AI=0`

## Revert migrations DB
- Les tables du `DbService` sont idempotentes (`CREATE TABLE IF NOT EXISTS`).
- Revert applicatif sans destruction:
	- rollback code via `git revert <commit>`
	- conserver les données append-only.

## Retrait allowlist
- Restaurer config gateway/policy:
	- `git restore -- src-tauri/src/services/network_gateway.rs src-tauri/src/engines/conversation_os/policy.rs`

## Procédure standard de revert commit
```bash
git log --oneline -n 20
git revert <sha_commit>
git push origin MAIN
```

