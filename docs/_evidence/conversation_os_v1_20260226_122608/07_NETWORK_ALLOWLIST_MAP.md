# 07_NETWORK_ALLOWLIST_MAP.md

Date (UTC): 2026-02-26

## Surface réseau autorité
- Service autorité: `src-tauri/src/services/network_gateway.rs`
- Politique: deny-by-default + allowlist/denylist + budgets + timeout.

## Domaines observés (gouvernés)
- Local: `localhost`, `127.0.0.1`
- Search: `api.search.brave.com`, `duckduckgo.com`
- Endpoint gating policy: `engines/conversation_os/policy.rs` (`is_endpoint_allowed`).

## Flux gouverné par service
- `SearchGatewayService` -> `NetworkGatewayService`
- `EmbeddingsService` -> `NetworkGatewayService`
- Diagnostics réseau -> `NetworkGatewayService`

## Règles
- Tout accès HTTP doit passer par le gateway.
- Tout domaine hors allowlist => blocage explicite.
- Toute erreur doit rester explicite (pas de fallback silencieux).

