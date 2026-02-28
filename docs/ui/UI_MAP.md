# UI_MAP (Canonique)

Statut: QUALIFIED  
Ring impacté: Ring 4 (UI/Modules)  
Date: 2026-02-28

```mermaid
flowchart TD
  ROOT[/] --> TITANE[/titane]
  ROOT --> TIME[/time]
  ROOT --> STATS[/stats]
  ROOT --> ADMIN[/admin]
  ROOT --> DEV[/dev]
  ROOT --> FUSION[/fusion]
  ROOT --> OPT[/optimization]

  TITANE --> CHAT_ALIAS[/chat -> /titane]
  TITANE --> CAMERA_ALIAS[/camera -> /titane]
  TITANE --> EVO_ALIAS[/evo -> /titane]

  TIME --> AGENDA_ALIAS[/agenda -> /time]
  TIME --> TN_ALIAS[/time-navigator -> /time]

  ADMIN --> SETTINGS_ALIAS[/settings -> /admin]
  ADMIN --> GOV_ALIAS[/governance -> /admin]

  DEV --> QA_ALIAS[/qa -> /dev]
  DEV --> TESTS_ALIAS[/tests -> /dev]

  SING[/singularity] --> SINGULARITY_MONITOR[SingularityMonitor]
  ORCH[/orchestration-center]
  ORCH_INTEL[/orchestration-intelligence]
  REALITY[/reality-center]
  HYPER[/hyper-center]
  QUANTUM[/quantum-center]
  IDENTITY[/identity-center]
  MEMORY_EVO[/memory-evolution]
  CLOUD[/cloud]
  KNOWLEDGE[/knowledge]
  CREATION[/creation]
  EVOLUTION[/evolution]
  RESEARCH[/research]
  PERF[/performance]

  CATCHALL[/*] --> ROOT
```

## Notes gouvernées

- La route `/singularity` est unique et mène au composant réel `SingularityMonitor`.
- Les aliases historiques restent explicitement redirigés (pas de destination vide).
- Les entrées TopNav/Menu actives correspondent à des routes valides.
