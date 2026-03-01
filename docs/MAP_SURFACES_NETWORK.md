# MAP_SURFACES_NETWORK

## Principe One Door

Chemin autorisé : UI -> IPC canonique -> Services -> Gateway réseau -> Externe.

## Entrées de mapping

### N1
- **Objet**: UI (`src/`)
- **Ring**: Ring 4
- **Responsabilité**: Déclencher des actions sans réseau externe direct
- **Interfaces**: hooks, handlers, client IPC
- **I/O**: Interdiction UI -> Externe
- **Preuve**: `rg -n "fetch\\(|axios\\(|XMLHttpRequest|WebSocket|https?://" -S src || true`
- **Statut**: QUALIFIED

### N2
- **Objet**: Services (`src/services/`)
- **Ring**: Ring 3
- **Responsabilité**: Encapsuler réseau gouverné
- **Interfaces**: services provider/API
- **I/O**: Réseau avec timeout/breaker
- **Preuve**: `rg -n "timeout|breaker|circuit|fetch|axios" -S src/services || true`
- **Statut**: EXPERIMENTAL

### N3
- **Objet**: Runtime Tauri (`src-tauri/src/`)
- **Ring**: Ring 4
- **Responsabilité**: Bridge IPC/OS/réseau autorisé
- **Interfaces**: `tauri::command`
- **I/O**: IPC et natif
- **Preuve**: `rg -n "tauri::command" -S src-tauri/src`
- **Statut**: QUALIFIED

## Couverture complémentaire

- **Objet**: Inventaire endpoints externes runtime
- **Ring**: Ring 3/4
- **Responsabilité**: Vérifier les cibles réseau effectivement déclarées
- **Interfaces**: scans statiques + configuration
- **I/O**: HTTP(S)
- **Preuve**: `rg -n "https?://" -S src src-tauri`
- **Statut**: QUALIFIED
