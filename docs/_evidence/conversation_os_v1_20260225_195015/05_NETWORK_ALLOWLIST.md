# 05_NETWORK_ALLOWLIST.md

## Surface réseau canonique
- Service unique: `src-tauri/src/services/network_gateway.rs`
- Contrôles:
  - schéma `http/https` uniquement
  - allowlist/denylist domaine
  - budget requêtes (`max_requests`)
  - budget octets (`max_bytes_total`)
  - timeout (`timeout_ms`)

## Allowlist observée (default governed)
- `localhost`
- `127.0.0.1`
- `api.search.brave.com`
- `duckduckgo.com`
- `html.duckduckgo.com`

## Politique deny-by-default
- Toute cible hors allowlist => `PolicyViolation` (blocage)

## Intégration Search
- `SearchGatewayService` passe par `NetworkGatewayService`
- Brave prioritaire si clé disponible, sinon fallback DDG (point à qualifier selon politique stricte credentials)

## Risque résiduel observé
- Des appels frontend `fetch/WebSocket` existent encore dans des surfaces legacy du repo (`src/**` scan global).
- Pour conformité stricte, ces surfaces doivent rester hors flux Conversation OS v1 ou être neutralisées.
