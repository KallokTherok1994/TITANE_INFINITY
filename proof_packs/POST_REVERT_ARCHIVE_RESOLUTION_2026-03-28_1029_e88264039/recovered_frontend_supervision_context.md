# Plan: Perfectionnements Front-end et Supervision — TITANE∞

## État Actuel

### Pages existantes (toutes identiques ModuleCard)

- **Nexus.tsx**: 3 cartes (nœuds, connexions, densité). Aucune visualisation de graphe.
- **Sentinel.tsx**: 3 cartes (threatLevel, activeAlerts, criticalCount). Aucun détail d'incident.
- **Harmonia.tsx**: 3 cartes (activeFlows, balance, coherence). Aucun historique.

### Librairies disponibles (déjà installées)

- `recharts` 3.8.0 — graphiques (line, bar, radial, gauge)
- `react-d3-tree` 3.6.6 — arbres
- `react-chrono` 3.3.3 — timelines
- `framer-motion` — animations
- `sonner` — toasts temps réel
- `lucide-react` — icônes
- `zustand` — state management

### Données backend disponibles via IPC

- `nexus_get_graph` → NexusGraph { nodes: CognitiveNode[], connections: number }
- `harmonia_get_flows` → HarmoniaFlows { harmonic_balance, resonance_level, system_load, stability }
- `sentinel_get_alerts` → SentinelAlerts { alert_count, integrity_score }
- `helios_get_metrics` → HeliosMetrics { cpu_usage, memory_usage, disk_usage, uptime }
- `watchdog_get_data` → WatchdogData { tick_misses, module_health, last_check }
- `selfheal_get_data` → SelfHealData { corrections_applied, anomalies_detected, heal_efficiency }
- `adaptive_get_data` → AdaptiveData { adaptability, stability, trend }

### Manques identifiés

- Aucune librairie de graphe interactif (vis.js, cytoscape.js, react-force-graph)
- Aucune instrumentation OpenTelemetry/tracing
- Aucun mode développeur pour visualiser le contexte LLM
- Polling uniquement (setInterval), pas de WebSocket
- Aucun historique de données (pas de time-series)
- Aucun système d'alertes temps réel (sonner installé mais non utilisé)

---

## Phase 1: Dashboard Cognitif Amélioré

### 1.1 — Composants de visualisation à créer

#### `src/components/charts/GaugeCard.tsx`

- Utilise `recharts.RadialBarChart` pour afficher un gauge circulaire
- Props: value, max, label, color, threshold (pour alertes)
- Utilisé pour: memory_usage, cpu_usage, integrity_score, harmonic_balance

#### `src/components/charts/TimeSeriesChart.tsx`

- Utilise `recharts.LineChart` ou `AreaChart`
- Stocke un buffer circulaire de N derniers points (via Zustand)
- Props: dataKey, label, color, windowSize
- Utilisé pour: évolution de harmony_index, cpu_usage, memory_usage

#### `src/components/charts/IncidentFeed.tsx`

- Liste filtrable par sévérité (Critical, Warning, Info)
- Timeline avec `react-chrono`
- Alertes temps réel via `sonner` toast
- Props: incidents[], onFilterChange

#### `src/components/charts/GraphVisualization.tsx`

- Visualisation SVG du graphe de tâches Nexus
- Nœuds colorés par type, arêtes par poids
- Zoom/Pan avec framer-motion
- Clic sur nœud → détails

#### `src/components/charts/MemoryGauge.tsx`

- Gauge circulaire pour la charge mémoire
- Couleur dynamique: vert (<60%), jaune (60-80%), rouge (>80%)
- Alerte automatique si >80%

### 1.2 — Pages améliorées

#### `src/pages/Nexus.tsx` — Enrichissement

- Ajouter `GraphVisualization` en haut
- Ajouter `TimeSeriesChart` pour la densité du réseau
- Garder les ModuleCards existants en bas

#### `src/pages/Sentinel.tsx` — Enrichissement

- Ajouter `IncidentFeed` avec filtres de sévérité
- Ajouter `TimeSeriesChart` pour integrity_score
- Ajouter alertes sonner en temps réel si criticalCount > 0
- Garder les ModuleCards existants

#### `src/pages/Harmonia.tsx` — Enrichissement

- Ajouter `TimeSeriesChart` pour harmonic_balance evolution
- Ajouter `GaugeCard` pour resonance_level, system_load, stability
- Ajouter sous-scores pondérés (CPU, Memory, Error, Context, Emotional, User feedback)
- Garder les ModuleCards existants

#### Nouvelle page: `src/pages/Dashboard.tsx`

- Vue d'ensemble combinant les 3 modules
- 4 gauges principaux (CPU, Memory, Harmony, Integrity)
- Timeline d'alertes récentes
- Graphe Nexus miniature

### 1.3 — Système d'alertes temps réel

#### `src/hooks/useRealTimeAlerts.ts`

- Surveille les seuils: memory_usage > 80%, cpu_usage > 90%, criticalCount > 0
- Émet des toasts `sonner` avec priorité (error, warning, info)
- Debounce pour éviter le spam d'alertes

#### `src/stores/metricsStore.ts` (Zustand)

- Stocke les N derniers points de métriques (buffer circulaire)
- Fournit les données pour les TimeSeriesChart
- Met à jour via le polling existant

### 1.4 — Installation de la librairie de graphe

Installer `react-force-graph-2d` pour la visualisation du graphe Nexus:

```bash
pnpm add react-force-graph-2d
```

---

## Phase 2: Observabilité et Traçabilité

### 2.1 — Instrumentation OpenTelemetry

#### Installation

```bash
pnpm add @opentelemetry/api @opentelemetry/sdk-trace-web @opentelemetry/instrumentation
```

#### `src/services/telemetry/tracer.ts`

- Initialise le traceur OpenTelemetry
- Crée des spans pour chaque appel IPC Tauri
- Injecte les trace IDs dans les logs

#### `src/services/telemetry/ipcInstrumentation.ts`

- Wrapper autour de `tauri<T>()` qui crée automatiquement des spans
- Attributs: service.name, ipc.command, duration_ms, success
- Exporte les traces vers Jaeger (si configuré)

#### `src/services/telemetry/logCorrelator.ts`

- Corrèle les logs avec les trace IDs
- Injecte: trace_id, span_id, response_time, contexte injecté, décision prise
- Format JSON structuré

### 2.2 — Composants de visualisation des traces

#### `src/components/observability/TraceViewer.tsx`

- Affiche les traces distribuées
- Timeline Gantt-style avec framer-motion
- Détails par span: durée, attributs, erreurs
- Filtre par service, durée, statut

#### `src/components/observability/LogViewer.tsx`

- Console de logs temps réel avec filtrage
- Corrélation par trace_id
- Niveau de log coloré
- Recherche textuelle

#### `src/pages/Observability.tsx`

- Page dédiée à l'observabilité
- TraceViewer + LogViewer
- Métriques de latence par module

### 2.3 — Détection de drift et boucles infinies

#### `src/services/telemetry/driftDetector.ts`

- Analyse les patterns de traces pour détecter:
  - Boucles infinies (répétition de la même séquence)
  - Drift de coordination (dérive entre modules)
- Alertes automatiques via sonner

---

## Phase 3: Mode Développeur

### 3.1 — Panneau de debug

#### `src/components/dev/DevModePanel.tsx`

- Accès via raccourci clavier (Ctrl+Shift+D) ou bouton dans les settings
- Visualise le contexte LLM après sélection/compression
- Affiche les règles de sélection actives
- Permet l'édition des règles de sélection pour affiner la pertinence
- Affiche les réponses IPC brutes
- Authentification requise (feature flag ou mot de passe)

#### `src/components/dev/LLMContextViewer.tsx`

- Affiche le contexte injecté dans les prompts LLM
- Vue avant/après compression
- Métriques de compression (tokens avant/après, ratio)
- Diff coloré

#### `src/components/dev/SelectionRuleEditor.tsx`

- Éditeur de règles de sélection
- JSON editor avec validation
- Preview en temps réel de l'impact
- Sauvegarde via IPC

### 3.2 — Backend IPC pour le mode dev

#### `src-tauri/src/commands/dev_commands.rs`

- `dev_get_llm_context`: retourne le contexte LLM actuel
- `dev_get_selection_rules`: retourne les règles de sélection
- `dev_update_selection_rules`: met à jour les règles
- `dev_get_trace_buffer`: retourne le buffer de traces

#### `src-tauri/src/commands/dev_auth.rs`

- Authentification développeur
- Token-based ou mot de passe
- Rate limiting

---

## Fichiers à modifier/créer

### Nouveaux fichiers (Frontend)

```
src/components/charts/GaugeCard.tsx
src/components/charts/TimeSeriesChart.tsx
src/components/charts/IncidentFeed.tsx
src/components/charts/GraphVisualization.tsx
src/components/charts/MemoryGauge.tsx
src/components/observability/TraceViewer.tsx
src/components/observability/LogViewer.tsx
src/components/dev/DevModePanel.tsx
src/components/dev/LLMContextViewer.tsx
src/components/dev/SelectionRuleEditor.tsx
src/pages/Dashboard.tsx
src/pages/Observability.tsx
src/hooks/useRealTimeAlerts.ts
src/stores/metricsStore.ts
src/services/telemetry/tracer.ts
src/services/telemetry/ipcInstrumentation.ts
src/services/telemetry/logCorrelator.ts
src/services/telemetry/driftDetector.ts
```

### Fichiers existants à modifier

```
src/pages/Nexus.tsx — ajouter GraphVisualization + TimeSeriesChart
src/pages/Sentinel.tsx — ajouter IncidentFeed + alertes sonner
src/pages/Harmonia.tsx — ajouter gauges + time-series
src/App.tsx — ajouter routes Dashboard, Observability
src/hooks/useTitaneCore.ts — ajouter commandes dev IPC
```

### Backend (Rust)

```
src-tauri/src/commands/dev_commands.rs — IPC mode développeur
src-tauri/src/commands/dev_auth.rs — authentification dev
src-tauri/src/tracing/mod.rs — instrumentation OpenTelemetry
```

---

## Ordre d'exécution

1. ✅ Installer `react-force-graph-2d` et `@opentelemetry/*`
2. Créer le Zustand metricsStore
3. Créer GaugeCard, TimeSeriesChart
4. Enrichir Harmonia.tsx avec gauges + time-series
5. Créer IncidentFeed
6. Enrichir Sentinel.tsx avec incidents + alertes
7. Créer GraphVisualization
8. Enrichir Nexus.tsx avec graphe interactif
9. Créer Dashboard.tsx (vue d'ensemble)
10. Implémenter useRealTimeAlerts avec sonner
11. Créer le service de telemetrie (tracer, ipcInstrumentation)
12. Créer TraceViewer, LogViewer
13. Créer Observability.tsx
14. Créer DevModePanel, LLMContextViewer
15. Ajouter les IPC commands côté Rust
16. Ajouter les routes dans App.tsx
17. Tests et validation
