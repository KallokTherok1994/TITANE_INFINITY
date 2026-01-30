# KNOWN LIMITATIONS - TITANE∞ v26.3.0

**Date:** 17/01/2026
**Version:** v26.3.0
**Statut:** Production-Ready Conditionnel

## 🚫 LIMITATIONS CRITIQUES

### 1. Dépendance PNPM

**Issue:** pnpm v10.28.0 requis mais non installé
**Impact:** Build et tests impossibles
**Workaround:** Installation locale immédiate
**Fix prévu:** Automatisation installation

### 2. Tests Non Exécutés

**Issue:** Suite de tests complète non validée
**Impact:** Certification non complète
**Workaround:** Exécution manuelle post-installation pnpm
**Fix prévu:** Intégration CI/CD complète

## ⚠️ LIMITATIONS FONCTIONNELLES

### Chat IA

#### Providers Externes

- **API Keys:** Configuration manuelle requise
- **Rate Limits:** Non gérés automatiquement
- **Offline:** Dégradation vers local uniquement

#### Mode Local

- **Base de Connaissances:** Statique, non extensible
- **Personnalisation:** Limitée aux patterns OMEGA
- **Multilingual:** Français uniquement

### Interface Utilisateur

#### Responsive Design

- **Mobile:** Non optimisé (< 768px)
- **Tablette:** Support partiel
- **Accessibility:** WCAG 2.1 AA partiel

#### Performance

- **Messages Longs:** Virtualisation > 50 messages
- **Images:** Pas de compression automatique
- **Voice:** Requiert permissions microphone

### Système

#### Stockage

- **Local Storage:** Limite 5-10MB selon navigateur
- **IndexedDB:** Non utilisé actuellement
- **Sync:** Pas de synchronisation multi-device

#### Sécurité

- **IPC:** Allowlist minimal mais manuel
- **Secrets:** Stockage local non chiffré
- **Updates:** Auto-update non testé

## 🔧 LIMITATIONS TECHNIQUES

### Architecture

#### 4-Ring Pattern

- **Types → Engines → Services → UI:** Strict mais complexe
- **Circular Dependencies:** Guards présents mais coûteux
- **Tree Shaking:** Partiellement optimisé

#### Performance

- **Bundle Size:** ~50MB non optimisé
- **Boot Time:** < 3s objectif, non mesuré
- **Memory:** < 500MB objectif, non tracké

### Outils & Dev

#### Build System

- **Vite:** Configuré mais non testé production
- **Tauri:** Build multi-platform non validé
- **ESLint:** max-warnings=0 non testé

#### Tests

- **Coverage:** Framework présent, métriques absentes
- **E2E:** Playwright configuré, scénarios limités
- **Integration:** Tests partiels seulement

## 📋 LIMITATIONS DOCUMENTAIRES

### Guides Utilisateur

- **Installation:** Linux/Ubuntu centré
- **Configuration:** API keys manuelle uniquement
- **Troubleshooting:** Cas courants couverts

### Documentation Technique

- **API Surface:** Partiellement documentée
- **Architecture:** Détails implémentation absents
- **Contributing:** Guidelines basiques

## 🎯 LIMITATIONS COMMERCIALES

### Licence & Distribution

- **Open Source:** Partiel (frontend), backend propriétaire
- **Distribution:** Auto-update limité
- **Support:** Communauté uniquement

### Fonctionnalités Premium

- **Cloud Providers:** Paywall potentiel
- **Advanced Features:** Non implémentées
- **Analytics:** Métriques locales uniquement

## 🔮 LIMITATIONS TEMPORAIRES (FIXABLES)

### Prochaines Releases

#### v26.4.0 (1 mois)

- [ ] Tests automatisés complets
- [ ] Mobile responsive complet
- [ ] Multi-device sync
- [ ] API keys chiffrées

#### v26.5.0 (2 mois)

- [ ] Performance optimizations
- [ ] Advanced analytics
- [ ] Plugin system
- [ ] Internationalization

#### v27.0.0 (3 mois)

- [ ] Cloud sync
- [ ] Advanced AI features
- [ ] Enterprise features
- [ ] Multi-platform native

## ✅ LIMITATIONS ACCEPTÉES (BY DESIGN)

### Philosophie TITANE∞

#### Local-First

- **Aucune donnée cloud:** Choix architectural
- **Privé par défaut:** Zero telemetry externe
- **Offline-first:** Fonctionnel sans réseau

#### Tauri-Only

- **Pas de web app:** Desktop uniquement
- **Native performance:** Electron rejeté
- **Security model:** Allowlist strict

#### Architecture OMEGA

- **Complexité:** Patterns avancés requis
- **Learning curve:** Expertise technique nécessaire
- **Maintenance:** Auto-healing vs manuel

---

## 📞 SUPPORT & FEEDBACK

**Pour signaler une limitation:**

- Issues GitHub avec tag `limitation`
- Documentation `docs/REPAIR_PLAYBOOK.md`
- Communauté Discord TITANE∞

**Priorisation:** Sécurité > Stability > Performance > Features

---

**Limitations documentées et acceptées pour TITANE∞ v26.3.0**
