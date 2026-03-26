# DEPENDENCY_DECISION_MATRIX
**TITANE∞ — Triage des dépendances par usage réel**
**Date**: 2026-03-26
**Phase**: PHASE 4 — TRIAGE STRICT DES DÉPENDANCES
**Verdict**: QUALIFIED

---

## Méthodologie

Pour chaque candidat: `pnpm why <dep>` + `grep` d'imports directs dans src/ + vérification usage runtime.
Classes: `KEEP_CORE` | `KEEP_LAZY` | `LABS_ONLY` | `DELETE_CANDIDATE`

---

## Dépendances JavaScript/TypeScript — Candidats prioritaires

| Package | Version | Layer | Usage prouvé | Decision | Risque | Prochaine action |
|---------|---------|-------|--------------|----------|--------|-----------------|
| `@xenova/transformers` | 2.17.2 | Frontend ML | `src/services/unified/LocalEmbeddingGenerator.ts`, `src/services/cognitive/LocalEmbeddingGenerator.ts` | **KEEP_CORE** | P1 | Vérifier lazy-load WASM (~100MB) — déjà géré via import dynamique ? |
| `better-sqlite3` | 12.8.0 (vs 12.6.2 declared) | Node.js SQLite | `src/services/unified/SQLiteVectorStore.ts` (import direct), mocked dans tests | **KEEP — RISK FLAG P1** | P1 | Clarifier: path dev/test only vs production ? Tauri WebView ne peut pas exécuter Node.js natif. Canonical = Rust rusqlite |
| `@tauri-apps/plugin-http` | — | Rust network | **Absent de src/** — présent dans `src-tauri/src/commands/http_commands.rs` | **KEEP_CORE (Rust side)** | P1 | Pas de violation doctrine: network est Rust-side via reqwest/plugin-http, pas frontend direct |
| `framer-motion` | 12.34.3 | UI animations | 58 fichiers src/ | **KEEP_LAZY** | P2 | Tree-shakeable via Vite. Conserver — animations UI répandues |
| `three` (three.js) | 0.183.2 | 3D engine | `src/modules/avatar/` uniquement (4 fichiers) | **LABS_ONLY** | P1 | Isolation dans avatar module — ThreeJSLazyLoader déjà présent. Lazy-loaded correctement. |
| `react-d3-tree` | 3.6.6 | Tree viz | `src/features/memory/MemoryTreeViewer.tsx` | **KEEP_LAZY** | P2 | Import direct — mémoire UI. Acceptable. |
| `recharts` | 3.8.0 | Charts | `src/components/performance/MetricsGraph.tsx` (lazy imports réels), mention dans MemorySearchPanel/VisionMetricsChart/RealTimeCharts (commentaires/strings) | **KEEP_LAZY** | P2 | 4 fichiers grep positifs. MetricsGraph.tsx = lazy-loaded (import dynamique). DELETE_CANDIDATE infirmé. |

---

## Dépendances Rust (Cargo.toml) — Candidats

| Crate | Feature | Usage prouvé | Decision | Risque | Note |
|-------|---------|--------------|----------|--------|------|
| `ort` (ONNX Runtime) | `optional` (feature `onnx`) | Désactivé par défaut (`default = ["custom-protocol", "mock", "audio-capture"]`) | **LABS** | P1 | Déjà optional — correct. Ne pas mettre en default. |
| `cpal` (audio capture) | `optional` (feature `audio-capture`) | Activé par défaut — liasound2-dev requis | **LABS** | P1 | Dans default features — devrait être opt-in. Risque: fail sur systèmes sans ALSA. Évaluer retrait du `default`. |
| `hnsw_rs` | — | Memory OS / vector index | **KEEP_CORE** | P0 | Brique centrale du vector search mémoire. Ne pas toucher. |
| `tantivy` | — | LOCAL_INDEX mode (Phase 5) | **KEEP_CORE** | P1 | Index lexical BM25 — Memory OS. Protéger. |
| `rusqlite` | `bundled` feature | Persistence Rust-side (SQLite) | **KEEP_CORE** | P0 | Backend SQLite canonical. Ne pas toucher. |
| `reqwest` | rustls-tls | HTTP client Rust | **KEEP_CORE** | P1 | Online-first policy — provider HTTP calls. |
| `lru` | — | AIRouterCache | **KEEP_CORE** | P2 | Updated 0.12→0.16 (RUSTSEC fix). |
| `smallvec` | serde | Small allocations | **KEEP_CORE** | P2 | Performance memory allocs. |
| `dashmap` | — | Lock-free HashMap IPC | **KEEP_CORE** | P2 | IPC optimization. |
| `ndarray` / `rustfft` | — | Audio FFT / signal | **LABS** | P1 | Voice fingerprinting — Labs scope. |
| `image` | — | Image processing | **LABS** | P1 | Multimodal — Labs scope. |

---

## Dépendances DevDependencies — Revue

| Package | Décision | Note |
|---------|----------|------|
| `storybook` + chromatic | **LABS_OPS** | `.storybook/` présent, non intégré CI principal. Non prioritaire. |
| `vitest` | **KEEP** (Ops) | Test infrastructure critique |
| `playwright` | **KEEP** (Ops) | E2E tests |
| `webdriverio` | **KEEP** (Ops) | E2E desktop |
| `@types/*` | **KEEP** | TypeScript types |

---

## Actions prioritaires identifiées

### P1 — À traiter avant prochaine release

1. **`better-sqlite3` dans SQLiteVectorStore**: clarifier si ce chemin s'exécute en production Tauri ou seulement en tests.
   - Si tests uniquement: déjà OK (mocked dans vitest)
   - Si production: RISK — le WebView Tauri ne peut pas charger des native addons Node.js → ajouter garde `isTauriRuntimeAvailable()` et fallback IPC vers Rust
   - Evidence actuelle: `SQLiteVectorStore.unit.test.ts` mock `better-sqlite3` → probable test-only path

2. **`cpal` dans default features**: évaluer retrait de `default` pour éviter build failure sur systèmes sans ALSA.
   - Impact: `pnpm run dev` sans audio ne serait pas affecté si cpal est opt-in
   - Note: `audio-capture = ["cpal"]` est dans default → changer `default = ["custom-protocol", "mock"]` et laisser audio opt-in

3. **`recharts` (KEEP_LAZY — reclassé)**: 4 fichiers confirment l'usage. `MetricsGraph.tsx` utilise recharts via lazy imports dynamiques (`import('recharts').then(...)`). Les autres fichiers ont des commentaires ou references string. Pas de suppression. ~~DELETE_CANDIDATE~~ → **KEEP_LAZY**.

### P2 — À traiter dans les prochaines sessions

4. **`@xenova/transformers` (~100MB WASM)**: vérifier que le chargement est bien lazy (import dynamique) et ne bloque pas le boot.
   - `LocalEmbeddingGenerator.ts` devrait utiliser `import('@xenova/transformers')` de manière dynamique, pas statique.

5. **`three` dans avatar**: déjà lazy via ThreeJSLazyLoader. Confirmer qu'aucun `import * as THREE` statique ne reste dans le path critique de boot.

---

## Résumé décisions

| Décision | Count | Packages |
|----------|-------|---------|
| KEEP_CORE | 8 | hnsw_rs, tantivy, rusqlite, reqwest, framer-motion, @xenova/transformers, plugin-http (Rust), lru/dashmap/smallvec |
| KEEP_LAZY | 2 | react-d3-tree, framer-motion |
| LABS_ONLY | 3 | three, ort, ndarray/rustfft/image |
| DELETE_CANDIDATE | 0 | — (recharts reclassé KEEP_LAZY après grep exhaustif) |
| RISK FLAG P1 | 2 | better-sqlite3 (Node.js vs Tauri WebView), cpal (default feature) |

---

## Verdict

```
PHASE 4: QUALIFIED
- Matrice créée
- Chaque dépendance prioritaire classée
- Suppressions restent CANDIDATE (recharts) — preuve complémentaire requise
- Risques P1 documentés (better-sqlite3, cpal default)
- Prochaine action: PHASE 5 — MÉMOIRE CANONIQUE UNIQUE
```
