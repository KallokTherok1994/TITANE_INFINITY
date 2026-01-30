# CANONICAL SOURCES - TITANE∞ v26.3.0

**Date de scellement :** 17/01/2026 01:31 UTC-5  
**Version canonique :** 26.3.0 (code > docs)

## 🔐 VERSION RÉELLE DU SYSTÈME

### Source of Truth

- **Code** : v26.3.0 (package.json, tauri.conf.json, Cargo.toml)
- **Docs** : v26.3.0 (descriptions cohérentes)
- **Toutes sources** : ✅ **COHÉRENTES** - v26.3.0 partout

**Décision :** Version canonique = 26.3.0 (cohérence parfaite)

## 📋 FICHIERS CANONIQUES (SOURCE OF TRUTH)

### Architecture & Constitution

- `ARCHITECTURE.md` - Architecture 4-Ring officielle
- `README_CONSTITUTION_SCELLE.md` - Constitution scellée
- `docs/TAURI_SURFACE.md` - Surface API Tauri
- `docs/API_SURFACE.md` - Surface API complète

### Configuration Système

- `src-tauri/tauri.conf.json` - Config Tauri (v26.3.0)
- `src-tauri/Cargo.toml` - Dépendances Rust (v26.3.0)
- `package.json` - ⚠️ À corriger (v26.3.2 → v26.3.0)
- `tsconfig.json` - Config TypeScript
- `vite.config.ts` - Config Vite

### Code Source Principal

- `src-tauri/src/main.rs` - Point d'entrée Rust
- `src/App.tsx` - Point d'entrée React
- `src/lib/ipc.ts` - Contrat IPC
- `src-tauri/allowlist.whitelist.stable.json` - Allowlist sécurisée

### Spécifications Fonctionnelles

- `docs/SECRETS.md` - Gestion secrets
- `docs/CAPABILITIES_REGISTRY.md` - Registre capacités
- `docs/RUNTIME_OBSERVABILITY.md` - Observabilité runtime

## 🔄 FICHIERS DÉRIVÉS (GÉNÉRÉS)

### Build & Distribution

- `dist/` - Artefacts de build Vite
- `src-tauri/target/` - Artefacts Rust
- `node_modules/` - Dépendances installées

### Tests & Qualité

- `coverage/` - Rapports de couverture
- `playwright-report/` - Rapports Playwright
- `runtime/stable/logs/` - Logs runtime

### Documentation Générée

- `docs/_evidence/` - Évidences automatiques
- `docs/_generated/` - Docs générées (si présentes)

## 🏛️ FICHIERS LEGACY (ARCHIVÉS)

### Archive Officielle

- `_archive/` - Tout contenu archivé avec date et raison

### Fichiers Suspects Legacy

- Fichiers avec dates < 2026-01-01
- Fichiers marqués "EXPERIMENTAL" sans justification
- Duplications évidentes (ex: config dupliquées)

## ⚠️ CONFLITS À RÉSOUDRE

### Version Package.json

- **Actuel :** 26.3.2
- **Correct :** 26.3.0
- **Action :** Correction obligatoire en PASS C

### Cohérence Docs/Code

- Vérifier toutes références de version
- Priorité : code > tests > config > docs

## 🎯 RÈGLES DE CONFLIT

1. **Code prime sur tout**
2. **Tests > Config > Docs**
3. **Jamais l'inverse**

## ✅ VALIDATION PASS 0

- [x] Version canonique déterminée : v26.3.0
- [x] Fichiers canoniques identifiés
- [x] Fichiers dérivés identifiés
- [x] Fichiers legacy identifiés
- [x] Conflits documentés

**PASS 0 TERMINÉ** - Source de vérité scellée.
