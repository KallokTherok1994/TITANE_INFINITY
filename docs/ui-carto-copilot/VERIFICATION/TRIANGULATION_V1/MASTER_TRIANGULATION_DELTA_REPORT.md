# MASTER_TRIANGULATION_DELTA_REPORT

Triangulation entre AgentGPT (PDF), v4 (baseline), et cartographie Copilot.

## A) Navigation & Screens

**Common Ground**
- Sections top‑level (TITANE/TIME/STATS/ADMIN/DEV/Plus) présentes en v4 et en Copilot ([docs/ui-carto-copilot/VERIFICATION/V7_V4_KEYPOINTS.md](docs/ui-carto-copilot/VERIFICATION/V7_V4_KEYPOINTS.md#L13-L19), [docs/ui-carto-copilot/09_MANIFEST.json](docs/ui-carto-copilot/09_MANIFEST.json#L100-L127)).

**Conflicts**
- V4 liste “Plus” alors que Copilot liste “PLUS” et “MORE” (terminologie et section additionnelle) ([docs/ui-carto-copilot/VERIFICATION/V7_V4_KEYPOINTS.md](docs/ui-carto-copilot/VERIFICATION/V7_V4_KEYPOINTS.md#L13-L19), [docs/ui-carto-copilot/09_MANIFEST.json](docs/ui-carto-copilot/09_MANIFEST.json#L100-L127)).

**Blind Spots**
- AgentGPT ne détaille pas la navigation complète (aucune liste de sections). Preuve indirecte: uniquement des éléments de layout/composants dans [docs/ui-carto-copilot/VERIFICATION/V7_AGENTGPT_KEYPOINTS.md](docs/ui-carto-copilot/VERIFICATION/V7_AGENTGPT_KEYPOINTS.md#L11-L19).

**Risk**
- P2 (drift terminologique/navigation).

**Suggested Next Action**
- MONITOR (normaliser labels “PLUS/MORE” vs “Plus” dans documentation).

---

## B) Layout Shell & Persistent Widgets

**Common Ground**
- AppShell identifié par AgentGPT et Copilot ([docs/ui-carto-copilot/VERIFICATION/V7_AGENTGPT_KEYPOINTS.md](docs/ui-carto-copilot/VERIFICATION/V7_AGENTGPT_KEYPOINTS.md#L11-L16), [docs/ui-carto-copilot/10-navigation/13-layout-shell.md](docs/ui-carto-copilot/10-navigation/13-layout-shell.md#L1-L20)).
- Widget CognitiveLayout présent (v4) et listé en Copilot ([docs/ui-carto-copilot/VERIFICATION/V7_V4_KEYPOINTS.md](docs/ui-carto-copilot/VERIFICATION/V7_V4_KEYPOINTS.md#L20-L24), [docs/ui-carto-copilot/10-navigation/14-persistent-widgets.md](docs/ui-carto-copilot/10-navigation/14-persistent-widgets.md#L14-L55)).

**Conflicts**
- AgentGPT mentionne Sidebar/Menu, alors que Copilot documente “Sidebar removed” (UI vΩ) ([docs/ui-carto-copilot/VERIFICATION/V7_AGENTGPT_KEYPOINTS.md](docs/ui-carto-copilot/VERIFICATION/V7_AGENTGPT_KEYPOINTS.md#L13-L16), [docs/ui-carto-copilot/10-navigation/13-layout-shell.md](docs/ui-carto-copilot/10-navigation/13-layout-shell.md#L93-L99)).

**Blind Spots**
- V4 mentionne “BOOT BEACON/Console overlay” mais Copilot ne le liste pas dans les widgets persistants ([docs/ui-carto-copilot/VERIFICATION/V7_V4_KEYPOINTS.md](docs/ui-carto-copilot/VERIFICATION/V7_V4_KEYPOINTS.md#L20-L24), [docs/ui-carto-copilot/10-navigation/14-persistent-widgets.md](docs/ui-carto-copilot/10-navigation/14-persistent-widgets.md#L8-L107)).

**Risk**
- P2 (documentation divergence sur navigation latérale et overlays).

**Suggested Next Action**
- MONITOR (clarifier l’état Sidebar/Boot Beacon dans cartographie).

---

## C) Components Inventory

**Common Ground**
- ErrorBoundary présent dans AgentGPT et cartographie Copilot ([docs/ui-carto-copilot/VERIFICATION/V7_AGENTGPT_KEYPOINTS.md](docs/ui-carto-copilot/VERIFICATION/V7_AGENTGPT_KEYPOINTS.md#L15-L16), [docs/ui-carto-copilot/10-navigation/14-persistent-widgets.md](docs/ui-carto-copilot/10-navigation/14-persistent-widgets.md#L110-L177)).

**Conflicts**
- Aucun conflit prouvé sur les composants.

**Blind Spots**
- AgentGPT signale TitanePage volumineuse, mais Copilot ne fournit pas de métriques de taille de fichiers (seulement des counts globaux) ([docs/ui-carto-copilot/VERIFICATION/V7_AGENTGPT_KEYPOINTS.md](docs/ui-carto-copilot/VERIFICATION/V7_AGENTGPT_KEYPOINTS.md#L13-L16), [docs/ui-carto-copilot/09_MANIFEST.json](docs/ui-carto-copilot/09_MANIFEST.json#L84-L98)).

**Risk**
- P3 (documentation incomplète sur hotspots de taille).

**Suggested Next Action**
- MONITOR (ajouter métrique taille des 5 plus gros fichiers dans doc, si nécessaire).

---

## D) Hooks & Stores

**Common Ground**
- Copilot fournit des counts hooks/stores (80 hooks, 18 stores) ([docs/ui-carto-copilot/09_MANIFEST.json](docs/ui-carto-copilot/09_MANIFEST.json#L84-L95)).

**Conflicts**
- Aucun conflit prouvé (v4 et AgentGPT ne listent pas de counts).

**Blind Spots**
- V4 et AgentGPT n’ont pas de cartographie hooks/stores comparable; seule une extraction code existe (scan hooks) ([docs/ui-carto-copilot/VERIFICATION/TRIANGULATION_V1/SCANS/hooks-usage.txt](docs/ui-carto-copilot/VERIFICATION/TRIANGULATION_V1/SCANS/hooks-usage.txt#L1-L40)).

**Risk**
- P2 (pas de corrélation cross‑source des hooks/stores).

**Suggested Next Action**
- MONITOR (documenter un mapping hooks/stores pour triangulation future).

---

## E) IPC / Contracts / Security Boundaries

**Common Ground**
- Copilot documente l’usage de `secureInvoke` comme wrapper IPC ([docs/ui-carto-copilot/09_MANIFEST.json](docs/ui-carto-copilot/09_MANIFEST.json#L130-L136)).
- V4 impose local‑first/Tauri‑only pour le boot UI ([docs/ui-carto-copilot/VERIFICATION/V7_V4_KEYPOINTS.md](docs/ui-carto-copilot/VERIFICATION/V7_V4_KEYPOINTS.md#L9-L12)).

**Conflicts**
- Présence d’appels `invoke()` directs dans le code/tests (scan) vs pattern wrapper attendu (doc) ([docs/ui-carto-copilot/VERIFICATION/TRIANGULATION_V1/SCANS/ipc-usage.txt](docs/ui-carto-copilot/VERIFICATION/TRIANGULATION_V1/SCANS/ipc-usage.txt#L1-L40), [docs/ui-carto-copilot/09_MANIFEST.json](docs/ui-carto-copilot/09_MANIFEST.json#L130-L136)).

**Blind Spots**
- AgentGPT ne couvre pas les détails IPC dans le PDF (aucune mention dans keypoints). ([docs/ui-carto-copilot/VERIFICATION/V7_AGENTGPT_KEYPOINTS.md](docs/ui-carto-copilot/VERIFICATION/V7_AGENTGPT_KEYPOINTS.md#L11-L19)).

**Risk**
- P2 (écart documentaire IPC; déjà non‑conformité connue).

**Suggested Next Action**
- MONITOR (aligner doc IPC avec scans; pas de patch dans ce protocole).

---

## F) UI States (empty/loading/error) + Zero Silence

**Common Ground**
- V4 impose “zéro silence” ([docs/ui-carto-copilot/VERIFICATION/V7_V4_KEYPOINTS.md](docs/ui-carto-copilot/VERIFICATION/V7_V4_KEYPOINTS.md#L9-L12)).
- Copilot documente des ErrorBoundaries (UI states de secours) ([docs/ui-carto-copilot/10-navigation/14-persistent-widgets.md](docs/ui-carto-copilot/10-navigation/14-persistent-widgets.md#L110-L177)).

**Conflicts**
- Aucun conflit prouvé.

**Blind Spots**
- Couverture détaillée empty/loading/error non triangulée entre v4 et Copilot (v4 est principe, Copilot est inventaire). Preuves: principe v4 et inventaire Copilot ci‑dessus.

**Risk**
- P2 (manque de comparatif de couverture états UI).

**Suggested Next Action**
- MONITOR (ajouter un tableau de couverture croisée si requis).
