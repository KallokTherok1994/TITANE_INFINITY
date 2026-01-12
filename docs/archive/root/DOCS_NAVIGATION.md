# 📚 Navigation Documentation Rapide — TITANE∞

**Statut:** ✅ Tech-Ready (Dev) | **Production:** ⛔ EN ATTENTE (autorisation requise) | **Version:** 26.3.0 | **Date:** 2026-01-11

---

## 🚀 DÉMARRAGE 3 MINUTES

### Je suis...

**👤 Utilisateur Final**
→ [Guide Utilisateur](docs/USER_GUIDE_v24.30.md) _(v24.30 - à mettre à jour)_

**💻 Développeur**
→ [Guide Développeur](docs/DEVELOPER_GUIDE.md)  
→ [Architecture 4-Ring](docs/ARCHITECTURE_RINGS.md)  
→ [Quick Start Performance](docs/QUICK_START_PERFORMANCE.md)

**🔧 Mainteneur / DevOps**
→ [Auto-Heal Systems](docs/AUTO_HEAL_SYSTEMS.md)  
→ [Pre-Deployment Check](scripts/verify/pre-deployment-check.sh)  
→ [Audit Production](AUDIT_DEPLOYMENT_AUTOHEAL_v26.2.0_FINAL.md)

**📦 Migrateur v24 → v26**
→ [Guide Migration Complet](docs/guides/MIGRATION_v24_to_v26.md)

---

## 📖 INDEX COMPLET

**→ [INDEX_MASTER.md](docs/INDEX_MASTER.md)**

Navigation exhaustive par catégorie:

- Architecture & Conception
- API & Référence Technique
- Systèmes Auto-Heal
- Audit & Production Readiness
- P1 Items (100% complétés)
- Tests & Qualité
- Déploiement & CI/CD
- Sécurité
- Performance
- Guides & Tutoriels

---

## ⚡ ACTIONS RAPIDES

### Vérifier Santé Système

```bash
./scripts/maintenance/health-check-enhanced.sh
```

### Valider Avant Déploiement

```bash
./scripts/verify/pre-deployment-check.sh --quick
# Exit 0 = GO, 1 = Warning, 2 = STOP
```

### Lancer Tests

```bash
# Frontend
pnpm test

# Backend Rust (local)
cd src-tauri && cargo test

# E2E (avec bindings SQLite/Three.js)
SKIP_E2E=false npm run test:e2e

# Architecture 4-Ring
npm run test:architecture
```

### Auto-Fix Rapide

```bash
# Linting
./scripts/audit/06-auto-fix.sh --lint

# Formatting
./scripts/audit/06-auto-fix.sh --format

# Tout
./scripts/audit/06-auto-fix.sh
```

---

## 🎯 PAR BESOIN

### Besoin: Migration API v24 → v26

**1.** Lire [MIGRATION_v24_to_v26.md](docs/guides/MIGRATION_v24_to_v26.md)  
**2.** Breaking changes: OMEGA v2, 4-Ring, conversationId  
**3.** Patterns migration fournis  
**4.** Checklist 8-16h

### Besoin: Comprendre Architecture

**1.** [Architecture 4-Ring](docs/ARCHITECTURE_RINGS.md)  
**2.** Ring 1 (Core) → Ring 2 (Engines) → Ring 3 (Services) → Ring 4 (UI)  
**3.** Tests: `src/__tests__/architecture/`

### Besoin: Nouveau Feature

**1.** Respecter 4-Ring imports  
**2.** Tests: unit + integration  
**3.** Pre-commit: health-check dry-run  
**4.** CI valide

### Besoin: Debugging

**1.** Logs Rust: `RUST_LOG=debug npm run tauri dev`  
**2.** Tests debug: `npm test -- --reporter=verbose`  
**3.** Health report: `./scripts/maintenance/health-check-enhanced.sh --verbose`

### Besoin: Déploiement Production

**1.** `./scripts/verify/pre-deployment-check.sh`  
**2.** Score 94/100 actuel  
**3.** 0 P0 blockers  
**4.** Monitoring: `proactive-monitor.sh` (cron)

---

## 📊 MÉTRIQUES ACTUELLES

```
Score Production:     94/100 ✅
Tests Passed:         97.93% (2173/2219)
Security OWASP:       10/10 ✅
Performance OMEGA:    150ms (<200ms target) ✅
Backend CI:           Docker Validated ✅
API Docs:             v26.2 Updated ✅
P1 Items:             0 (100% complétés) ✅
P2 Items:             5 (planifiés, non-bloquants)
```

---

## 🏥 AUTO-HEAL ACTIVÉ

**4 Scripts Opérationnels:**

- health-check-enhanced.sh (423 lignes)
- proactive-monitor.sh (458 lignes)
- pre-deployment-check.sh (535 lignes)
- 06-auto-fix.sh (578 lignes, 15 fixes)

**Doc:** [AUTO_HEAL_SYSTEMS.md](docs/AUTO_HEAL_SYSTEMS.md)

---

## 🔗 LIENS RAPIDES

| Catégorie         | Lien                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------- |
| 📖 Index Master   | [docs/INDEX_MASTER.md](docs/INDEX_MASTER.md)                                             |
| 🏗️ Architecture   | [docs/ARCHITECTURE_RINGS.md](docs/ARCHITECTURE_RINGS.md)                                 |
| 🔧 API v26.2      | [docs/guides/MIGRATION_v24_to_v26.md](docs/guides/MIGRATION_v24_to_v26.md)               |
| 🏥 Auto-Heal      | [docs/AUTO_HEAL_SYSTEMS.md](docs/AUTO_HEAL_SYSTEMS.md)                                   |
| 🔍 Audit Final    | [AUDIT_DEPLOYMENT_AUTOHEAL_v26.2.0_FINAL.md](AUDIT_DEPLOYMENT_AUTOHEAL_v26.2.0_FINAL.md) |
| ✅ P1 Complété    | [P1_COMPLETE_FINAL_v26.2.0.md](P1_COMPLETE_FINAL_v26.2.0.md)                             |
| 🚀 Tauri Commands | [docs/reference/TAURI_COMMANDS_v26.2.md](docs/reference/TAURI_COMMANDS_v26.2.md)         |
| 🧪 Stratégie E2E  | [docs/STRATEGIE_TESTS_E2E.md](docs/STRATEGIE_TESTS_E2E.md)                               |

---

## 📞 SUPPORT

**Documentation Complète:** [docs/INDEX_MASTER.md](docs/INDEX_MASTER.md)  
**Issues GitHub:** Tag approprié (bug, feature, migration, etc.)  
**Migration Help:** [MIGRATION_v24_to_v26.md](docs/guides/MIGRATION_v24_to_v26.md)

---

**Version:** 26.2.0 | **Score:** 94/100 | **État:** Tech-Ready (Dev); production en attente d’autorisation ✅
