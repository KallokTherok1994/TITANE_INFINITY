# RUNBOOK PRODUCTION - TITANE∞ v26.3.0

**Date:** 17/01/2026
**Version:** v26.3.0
**Statut:** Production-Ready Conditionnel

## 🚀 DÉMARRAGE RAPIDE

### Prérequis Système

```bash
# Vérifier Node.js
node --version  # >= 18.19.1

# Installer pnpm (CRITIQUE)
npm install pnpm@10.28.0
pnpm --version  # 10.28.0
```

### Installation & Build

```bash
# Installer dépendances
pnpm install

# Vérifier environnement
pnpm run verify

# Build production
pnpm run build:production

# Démarrer application
./start
```

## 📊 MONITORING & HEALTH CHECKS

### Health Checks Automatiques

```bash
# Health check complet
./scripts/health/health_check.sh

# Tests smoke post-build
./scripts/smoke/smoke_stable_appimage.sh

# Diagnostic ultime
./scripts/ultra-diagnostic.sh
```

### Métriques Clés

- **Boot Time:** < 3 secondes
- **Memory Usage:** < 500MB
- **Chat Response:** < 2 secondes
- **Error Rate:** < 1%

### Monitoring OMEGA

```bash
# Status système temps réel
# Interface: Status bar + Debug panel
# Métriques: Consciousness level, System health, Provider status
```

## 🔧 MAINTENANCE ROUTINE

### Quotidienne

```bash
# Nettoyer caches build
rm -rf node_modules/.vite dist

# Vérifier health
./scripts/health/health_check.sh

# Logs rotation (si activé)
./scripts/maintenance/logs_rotate.sh
```

### Hebdomadaire

```bash
# Tests complets
pnpm run test:all

# Audit sécurité
./scripts/audit/01-security-audit.sh

# Performance check
./scripts/audit/03-performance-measure.sh
```

### Mensuelle

```bash
# Full audit
./scripts/audit/00-master-audit.sh

# Dependencies update
pnpm update

# Backup configurations
cp src-tauri/tauri.conf.json runtime/backup/
```

## 🚨 INCIDENTS & RÉSOLUTION

### Incident Classification

#### 🔴 Critique (Arrêt Complet)

- **Trigger:** Application ne démarre pas
- **SLA:** Résolution < 5 minutes
- **Action:** Rollback immédiat

#### 🟠 Majeur (Fonctionnalité Cassée)

- **Trigger:** Chat IA silencieux, erreurs runtime
- **SLA:** Résolution < 30 minutes
- **Action:** Restart + diagnostic

#### 🟡 Mineur (Performance)

- **Trigger:** Lenteurs, mémoire haute
- **SLA:** Résolution < 2 heures
- **Action:** Optimisations + monitoring

### Procédures d'Urgence

#### 1. Restart d'Urgence

```bash
# Stop all processes
pkill -f "titane-infinity"

# Clean restart
./start

# Verify
./scripts/health/health_check.sh
```

#### 2. Rollback d'Urgence

```bash
# Emergency rollback
./scripts/deployment/rollback-emergency.sh

# Previous version
git checkout v26.2.0
pnpm install --frozen-lockfile
pnpm run build:production
```

#### 3. Mode Safe

```bash
# Force local provider only
export VITE_FORCE_LOCAL_PROVIDER=1

# Disable advanced features
export VITE_DISABLE_VOICE_MODE=1
export VITE_DISABLE_DEBUG_PANEL=1

# Restart
./start
```

## 🔍 DIAGNOSTIC AVANCÉ

### Outils de Diagnostic

```bash
# Diagnostic ultime
./scripts/ultra-diagnostic.sh

# Tests ciblés
pnpm run test:architecture
pnpm run test:compliance

# Logs analysis
tail -f .clinerules/logs/operations.log
```

### Debug Panels

- **Interface:** Ctrl+Shift+D pour debug panel
- **Métriques:** Provider status, error counts, response times
- **Console:** Logs détaillés avec niveaux

## 📈 OPTIMISATIONS PERFORMANCE

### Memory Management

```bash
# Monitor memory usage
./scripts/performance/memory_monitor.sh

# Force garbage collection (si disponible)
export VITE_ENABLE_GC=1
```

### Provider Optimization

```bash
# Test provider performance
./scripts/diagnostic/provider_benchmark.sh

# Adjust timeouts
export VITE_ADAPTIVE_TIMEOUT_ENABLED=1
```

### UI Performance

```bash
# Virtual scrolling threshold
export VITE_VIRTUAL_SCROLL_THRESHOLD=25

# Debounce settings
export VITE_STREAMING_DEBOUNCE_MS=50
```

## 🔐 SÉCURITÉ & COMPLIANCE

### Vérifications Sécurité

```bash
# Security audit
./scripts/audit/01-security-audit.sh

# IPC contract validation
./scripts/security/ipc-contract-gate.sh

# Allowlist verification
./scripts/security/no-allow-all-gate.sh
```

### Secrets Management

```bash
# Rotate API keys
# Via interface: Settings → AI Providers → Update Keys

# Validate secrets isolation
./scripts/security/secret-scan.sh
```

## 📚 RÉFÉRENCES TECHNIQUES

### Architecture

- **4-Ring:** Types → Engines → Services → UI
- **OMEGA Pattern:** Auto-healing + consciousness
- **Local-First:** Zero cloud dependency

### Providers IA

- **titaneLocal:** Always available fallback
- **9 providers:** Auto-failover chain
- **Timeout:** Adaptive per provider

### UI/UX

- **Emergency Modes:** Auto-recovery UI
- **Debug Tools:** Integrated monitoring
- **Responsive:** Desktop-first design

## 👥 SUPPORT & ESCALATION

### Niveau 1: Automatique

- Auto-healing system
- Emergency UI modes
- Local provider fallback

### Niveau 2: Manuel

- Restart procedures
- Safe mode activation
- Diagnostic tools

### Niveau 3: Expert

- Code rollback
- Configuration reset
- System rebuild

### Contacts

- **Technique:** Kevin Thibault
- **Documentation:** `docs/REPAIR_PLAYBOOK.md`
- **Issues:** GitHub repository

## 🎯 CHECKLIST PRÉ-RELEASE

### Pré-Release

- [ ] `pnpm install` success
- [ ] `pnpm run verify` clean
- [ ] `pnpm run build:production` success
- [ ] `./scripts/health/health_check.sh` pass
- [ ] `./scripts/smoke/smoke_stable_appimage.sh` pass

### Post-Release (24h)

- [ ] Monitoring alerts review
- [ ] User feedback analysis
- [ ] Performance metrics validation
- [ ] Error rates < 1%

### Maintenance (7j)

- [ ] Full test suite pass
- [ ] Security audit clean
- [ ] Dependencies updated
- [ ] Documentation aligned

---

**Runbook validé pour TITANE∞ v26.3.0 - Production conditionnelle**

_Priorité absolue: Installer pnpm pour activation complète_
