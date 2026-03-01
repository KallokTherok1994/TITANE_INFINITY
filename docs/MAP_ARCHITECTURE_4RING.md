# MAP_ARCHITECTURE_4RING

## Entrées de mapping

### A1
- **Objet**: `src/types/`
- **Ring**: Ring 1
- **Responsabilité**: Contrats de type
- **Interfaces**: Types TS
- **I/O**: Aucun
- **Preuve**: `rg -n "src/types" -S .`
- **Statut**: QUALIFIED

### A2
- **Objet**: `src/engines/`
- **Ring**: Ring 2
- **Responsabilité**: Logique pure
- **Interfaces**: Engines
- **I/O**: Aucun
- **Preuve**: `rg -n "src/engines" -S .`
- **Statut**: QUALIFIED

### A3
- **Objet**: `src/services/`
- **Ring**: Ring 3
- **Responsabilité**: Orchestration I/O
- **Interfaces**: Services
- **I/O**: Gouverné
- **Preuve**: `rg -n "src/services" -S .`
- **Statut**: QUALIFIED

### A4
- **Objet**: `src/` + `src-tauri/src/`
- **Ring**: Ring 4
- **Responsabilité**: UI/OS + IPC
- **Interfaces**: UI, commandes Tauri
- **I/O**: IPC, système, réseau gouverné
- **Preuve**: `rg -n "tauri::command|invoke\\(" -S src-tauri src`
- **Statut**: QUALIFIED
