# MAP_IPC

## Entrées de mapping

### IPC1
- **Objet**: `src-tauri/src/`
- **Ring**: Ring 4
- **Responsabilité**: Exposer commandes backend
- **Interfaces**: `#[tauri::command]`
- **I/O**: IPC
- **Preuve**: `rg -n "tauri::command" -S src-tauri/src`
- **Statut**: QUALIFIED

### IPC2
- **Objet**: `src/` client canonique
- **Ring**: Ring 4
- **Responsabilité**: Encapsuler appels IPC
- **Interfaces**: wrapper invoke canonique
- **I/O**: IPC
- **Preuve**: `rg -n "invoke\\(" -S src`
- **Statut**: QUALIFIED

### IPC3
- **Objet**: invokes directs hors canon
- **Ring**: Ring 4
- **Responsabilité**: Détection de dérive
- **Interfaces**: scan statique
- **I/O**: IPC
- **Preuve**: `rg -n "invoke\\(" -S src src-tauri`
- **Statut**: EXPERIMENTAL
