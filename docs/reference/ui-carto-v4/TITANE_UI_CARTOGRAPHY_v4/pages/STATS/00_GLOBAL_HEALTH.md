# STATS — Global Health (page observée)

## 1) Rôle
Page de synthèse orientée **observabilité** : elle agrège l’état des sous‑systèmes (Singularity, Memory, System, Optimizations) et remonte des **alertes** actionnables.

## 2) Layout global
- **Colonne centrale** (carte large) centrée dans l’espace “cosmos”.
- **Sections empilées** verticalement dans la carte.
- **Widget flottant** `Cognitive Layout` + toggle `Adaptation auto` (flottant, persistant).

## 3) Sections et contenu

### 3.1 Global Health
- En‑tête : `Global Health`.
- Valeur observée : `UNKNOWN` (placeholder ou erreur de collecte).

**Recommandations**
- Ne jamais afficher `UNKNOWN` sans contexte : afficher `—` + tooltip “signal non disponible” + cause (permission / init / provider).
- Ajouter un bouton “Refresh” + timestamp “Last updated”.

---

### 3.2 Singularity Sync
- En‑tête : `Singularity Sync`.
- Bandeau erreur rouge observé : `undefined is not an object (evaluating 'f.quantum_coherence')`.

**Interprétation la plus probable**
- Objet `f` (ou la structure retournée) n’est pas initialisé / change de forme en runtime.
- L’UI lit `f.quantum_coherence` sans garde‑fou.

**Correctifs minimaux**
- Remplacer tout accès direct par `?.` + valeurs par défaut :
  - `const qc = f?.quantum_coherence ?? null`
- Encapsuler la section dans un `guard`: si données absentes → état “Non disponible” plutôt qu’exception.
- Ajouter **contrat de données** (TS type + validation Zod) avant render.

**Gates UI**
- Zéro exception dans les pages d’observabilité : une erreur ne doit jamais casser le render global.

---

### 3.3 Memory Engine
Bloc “moteur mémoire” avec métriques :
- `Total Entries`, `Short Term`, `Medium Term`, `Long Term`, `Total Size`, `Health Score`.
- Valeurs observées : `NaN` / `NaN KB`.

**Causes possibles**
- Division par zéro (ex. health score calculé avec un dénominateur à 0).
- Parsing numérique absent (`Number(undefined)` → `NaN`).
- Source de données non initialisée.

**Correctifs minimaux**
- Normaliser toutes les métriques via une fonction utilitaire :
  - `safeNumber(x, fallback=0)`
  - `formatBytesSafe(bytes)`
- Si absence de données : afficher `0` + `non initialisé`.

---

### 3.4 Health Details (sous-cartes)
Quatre mini‑cartes observées :
- `Conversation` : `UNKNOWN`, `Active 0?`, `Total Messages 0?`, `Avg Response 0ms`.
- `Memory` : `UNKNOWN`, `Entries 0?`, `Size 0.00 KB`, `Fragmentation 0.0%`.
- `Singularity` : `UNKNOWN`, `Active Engines 0?`, `Sync error 0?`, `Conflicts 0?`.
- `System` : `UNKNOWN`, `Uptime 0?`, `CPU 0%`, `Memory 0MB`, `Network unknown`.

**Recommandations**
- Ajouter un état “Collecting…” au lieu de `UNKNOWN`.
- Couleur / icône stable : OK / Warning / Error.
- Lier chaque carte à une page détail (drill‑down).

---

### 3.5 Ultimate Optimization (Phase 12)
Quatre mini‑cartes :
- `GPU Accelerator` : mention `WebGL fallback`.
- `WebAssembly` : `speedup`, `WASM tasks`, `JS fallback`.
- `Service Worker` : `Inactive`, `cache`, `version`.
- `IndexedDB` : `Cache hit rate`, `Avg read/write`, `Compression`, `Fragmentation`.

**Recommandations**
- Les “fallback” doivent expliquer *pourquoi* (support GPU, sandbox WebView, permissions Tauri) et proposer action.
- En prod Tauri, clarifier le statut `Service Worker` (souvent non applicable en `tauri://`).

---

### 3.6 Performance Impact
Trois cartes :
- `GPU Speedup` (ex. 8.2x)
- `WASM Boost` (ex. 1.0x)
- `DB Speed` (ex. 100%)

**Recommandations**
- Préciser la base de comparaison (baseline) et la méthode de mesure.
- Afficher l’intervalle de confiance / nb. samples.

---

### 3.7 Alerts
Bandeau d’alerte observé :
- `singularity` (error)
- texte : `Sync error with 0 conflicts`
- actions : `Resolve` + `Auto‑Recover`

**Recommandations**
- `Resolve` doit ouvrir un panneau avec : cause, logs, action proposée, simulation.
- `Auto‑Recover` doit être idempotent et journalisé (INDEX ULTIME vΩ).

## 4) Bugs / risques (priorité)
1. **Crash UI** par accès propriété sur `undefined` (Singularity Sync).
2. **NaN** affichés (Memory Engine) → brise la confiance et masque la cause.
3. `UNKNOWN` généralisé → manque d’états “loading / unavailable / degraded”.

## 5) Checklist de durcissement (4‑Ring)
- [ ] Zéro `NaN` affiché (formatters safe).
- [ ] Zéro exception render (ErrorBoundary local par section).
- [ ] Contrat de données typé + validation runtime.
- [ ] Bouton Refresh + timestamp.
- [ ] Drill‑down sur chaque sous‑carte.
