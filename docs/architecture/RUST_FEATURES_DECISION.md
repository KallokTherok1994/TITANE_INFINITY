# RUST_FEATURES_DECISION
**TITANE∞ — Décision features Rust par défaut**
**Date**: 2026-03-26
**Phase**: PHASE 5 — RÉDUCTION DES FEATURES RUST PAR DÉFAUT
**Verdict**: QUALIFIED

---

## Features actuelles (Cargo.toml)

```toml
[features]
default = ["custom-protocol", "mock", "audio-capture"]
custom-protocol = ["tauri/custom-protocol"]
mock = []
full = []
ollama = []
audio-capture = ["cpal"]
onnx = ["ort"]
```

---

## Analyse des features par défaut

### `custom-protocol` — KEEP_DEFAULT

| Champ | Valeur |
|-------|--------|
| Usage | `tauri/custom-protocol` — requis pour charger les assets via `tauri://` |
| Retirer ? | NON — rompt le chargement de l'app en production |
| Verdict | **KEEP_DEFAULT** |

### `mock` — KEEP_DEFAULT (conditionnel)

| Champ | Valeur |
|-------|--------|
| Usage | `#[cfg(not(feature = "mock"))]` dans `src-tauri/src/audio/commands.rs` — désactive les vraies commandes audio en mode mock |
| Rôle | Permet le build frontend-only sans dépendances système audio |
| Preuve | 8+ fichiers Rust utilisent `cfg(feature = "mock")` |
| Retirer du default ? | RISQUE P1 — build dev sans mock pourrait échouer si les dépendances système manquent |
| Verdict | **KEEP_DEFAULT** — nécessaire pour dev environment sans ALSA complète |

### `audio-capture` (→ `cpal`) — RISK_FLAG P1

| Champ | Valeur |
|-------|--------|
| Usage | Active `cpal` = capture audio ALSA temps réel |
| Preuve | `src-tauri/src/audio/mod.rs:1` + `streaming_engine.rs` utilise `#[cfg(feature = "audio-capture")]` |
| Risque | `cpal` requiert `libasound2-dev` sur Linux — build fail si absent |
| Environnement affecté | Systèmes Linux sans ALSA, CI bare, ARM minimal |
| Alternative | Feature opt-in → `pnpm run dev -- --features custom-protocol,mock` |
| Action recommandée | Retirer de `default`, laisser opt-in |
| Blocage | Nécessite test build sans audio-capture + vérification que `mock` couvre les stubs audio |
| Verdict | **RISK_FLAG P1** — candidat au retrait du default, différé (session dédiée) |

---

## Dépendances Rust non-optionnelles mais Labs-scope

Ces crates sont compilées TOUJOURS (pas de feature gate) mais appartiennent à un scope Labs:

| Crate | Scope réel | Risque | Décision |
|-------|-----------|--------|---------|
| `ndarray` (0.17.1) | Audio FFT / signal processing | P2 — compilation OK, pas de dep système | **LABS** — toujours compilé, pas de feature gate. Acceptable car pur Rust. |
| `rustfft` (6.2) | FFT pour voice fingerprinting | P2 — pur Rust | **LABS** — idem, pur Rust, pas de dep externe |
| `image` (0.25) | Image loading multimodal | P2 — pur Rust | **LABS** — multimodal non prouvé runtime, mais compilation propre |
| `hound` (3.5) | WAV reading/writing | P2 — pur Rust | **LABS** — lié à audio, pur Rust |

**Décision**: ces crates sont toujours compilées. Le risque est faible (pur Rust, pas de dépendances système). Pas de move urgent — simplement documenté comme Labs scope.

---

## Features opt-in correctement configurées

| Feature | Crate | Statut | Décision |
|---------|-------|--------|---------|
| `onnx` | `ort` (ONNX Runtime) | Opt-in, hors default | **CORRECT** — ONNX requiert libs système complexes, ne doit pas être default |
| `ollama` | — | Opt-in, hors default | **CORRECT** — intégration Ollama optionnelle |
| `full` | — | Opt-in, hors default | **CORRECT** — mode full backend (non prouvé en prod) |

---

## Résumé décisions

| Feature | État actuel | Décision | Priorité |
|---------|------------|----------|---------|
| `custom-protocol` | default | **KEEP_DEFAULT** | — |
| `mock` | default | **KEEP_DEFAULT** | — |
| `audio-capture` (cpal) | default | **RISK_FLAG — retirer du default** | P1, session dédiée |
| `onnx` (ort) | opt-in | **CORRECT** | — |
| `ndarray`/`rustfft`/`image`/`hound` | toujours compilé | **LABS** (acceptable, pur Rust) | P2, documenter seulement |

---

## Action reportée — retrait de `audio-capture` du default

```toml
# AVANT
default = ["custom-protocol", "mock", "audio-capture"]

# APRÈS (cible)
default = ["custom-protocol", "mock"]
# audio-capture activé explicitement: cargo build --features audio-capture
```

**Prérequis avant exécution**:
1. Vérifier que `mock` feature couvre tous les stubs audio (streaming_engine a déjà `#[cfg(not(feature = "audio-capture"))]` → LIKELY OK)
2. Build test: `cargo check --no-default-features --features custom-protocol,mock`
3. Build test: `cargo build --features custom-protocol,mock` (sans ALSA)
4. Si PASS: `cargo check` avec default modifié
5. Session dédiée avec branch `feat/audio-feature-opt-in`

**Rollback**: `git revert <sha>` sur Cargo.toml

---

## Verdict

```
PHASE 5: QUALIFIED
- Features default auditées: custom-protocol (KEEP), mock (KEEP), audio-capture (RISK P1)
- Features opt-in: onnx/ollama/full = CORRECTS
- Crates toujours compilées: ndarray/rustfft/image = LABS, pur Rust, risque P2 seulement
- Action principale (cpal retrait du default): DIFFÉRÉE — session dédiée requise
- Prochaine action: PHASE 7 — POLICY CANONIQUE DU CHAT
```
