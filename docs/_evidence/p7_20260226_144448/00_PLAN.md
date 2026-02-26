# 00_PLAN.md

Phase: P7 Security + Tauri Capabilities/Scopes
Date (UTC): 2026-02-26
Statut: READY

## Objectif
- Durcir sécurité traces/secrets et posture Tauri v2 en explicite default-deny.

## Rings impactés
- Ring 3 (services réseau), Ring 4 (Tauri/UI debug).

## Surfaces prévues
- `src-tauri/**` (network bounds, capabilities/scopes)
- `src/**` (redaction UI/debug)
- `.github/workflows/**` (gate diff capabilities)

## Gates cibles
- `G7_NO_SECRETS_IN_UI`
- `G7_NO_SECRETS_IN_LOGS`
- `G7_GATEWAY_BOUNDS_ENFORCED`
- `G7_ALLOWLIST_DENY_BY_DEFAULT_RECHECK`
- `G7_RATE_LIMIT_HEADERS_CAPTURED`
- `G7_TAURI_CAPABILITIES_EXPLICIT_ONLY`
- `G7_TAURI_SCOPES_NOT_WILDCARD`

## Rollback prévu
- Revert ciblé des fichiers Tauri/security + désactivation flags de hardening.