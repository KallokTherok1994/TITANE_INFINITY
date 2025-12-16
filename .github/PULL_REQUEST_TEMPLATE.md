# 🎯 Pull Request Template

## 📋 Description

<!-- Décrivez brièvement les changements apportés -->

## 🎯 Type de Changement

- [ ] 🐛 Bug fix (correction non-breaking)
- [ ] ✨ New feature (fonctionnalité non-breaking)
- [ ] 💥 Breaking change (fix ou feature qui casse la compatibilité)
- [ ] 📚 Documentation (mise à jour documentation uniquement)
- [ ] 🎨 Style (formatage, sans changement de code)
- [ ] ♻️ Refactoring (ni fix ni feature)
- [ ] ⚡ Performance (amélioration performance)
- [ ] ✅ Tests (ajout ou correction de tests)
- [ ] 🔧 Chore (build, CI, dépendances)

## ✅ Checklist

### Code Quality

- [ ] Mon code suit les standards du projet ([CONTRIBUTING.md](CONTRIBUTING.md))
- [ ] J'ai effectué une auto-review de mon code
- [ ] J'ai commenté les parties complexes
- [ ] Mes changements ne génèrent pas de nouveaux warnings
- [ ] J'ai testé localement (Titan-Dev)

### Documentation

- [ ] J'ai mis à jour la documentation si nécessaire
- [ ] J'ai ajouté des exemples de code si applicable
- [ ] Les références croisées sont à jour
- [ ] Le CHANGELOG.md est mis à jour (si applicable)

### Tests

- [ ] J'ai ajouté des tests pour mes changements
- [ ] Tous les tests passent localement (`npm test`)
- [ ] Les tests Tauri passent (`npm run test:tauri`)
- [ ] Coverage maintenu ou amélioré

### Backend (si applicable)

- [ ] Code Rust formaté (`cargo fmt`)
- [ ] Clippy satisfait (`cargo clippy`)
- [ ] Tests Rust passent (`cargo test`)
- [ ] Commandes Tauri documentées

### Frontend (si applicable)

- [ ] Code TypeScript/React formaté (`npm run format`)
- [ ] ESLint satisfait (`npm run lint`)
- [ ] Types TypeScript corrects
- [ ] Composants testés

## 🧪 Tests Effectués

<!-- Décrivez comment vous avez testé vos changements -->

**Environnement:**

- OS: <!-- Ubuntu 24.04 / Windows 11 / macOS -->
- Node.js: <!-- version -->
- Rust: <!-- version -->

**Scénarios testés:**

1. <!-- Scénario 1 -->
2. <!-- Scénario 2 -->
3. <!-- Scénario 3 -->

## 📊 Impact

**Modules affectés:**

- [ ] Backend (Rust/Tauri)
- [ ] Frontend (React/TypeScript)
- [ ] AI/OMEGA Pipeline
- [ ] Memory OS
- [ ] Audio/TTS
- [ ] Documentation

**Performance:**

- [ ] Aucun impact performance
- [ ] Amélioration performance (détails ci-dessous)
- [ ] Dégradation acceptable (justification ci-dessous)

<!-- Si impact performance, fournir benchmarks avant/après -->

## 🔗 Liens Associés

**Issues:**

- Fixes #<!-- issue number -->
- Closes #<!-- issue number -->
- Related to #<!-- issue number -->

**Documentation:**

- [Guide concerné](<!-- lien vers doc -->)
- [API Reference](<!-- lien vers API -->)

## 📸 Screenshots/Vidéos (si UI)

<!-- Ajouter screenshots pour changements visuels -->

**Avant:**

<!-- screenshot ou description -->

**Après:**

<!-- screenshot ou description -->

## ⚠️ Breaking Changes

<!-- Si breaking change, décrire l'impact et migration -->

**Impact:**

- <!-- Qui est affecté ? -->
- <!-- Quoi doit changer ? -->

**Migration:**

```typescript
// Avant
// code example

// Après
// code example
```

## 📝 Notes Additionnelles

<!-- Informations supplémentaires pour les reviewers -->

---

## 🎯 Review Checklist (pour reviewers)

### Code Review

- [ ] Code clair et maintenable
- [ ] Pas de code dupliqué
- [ ] Conventions de nommage respectées
- [ ] Gestion d'erreurs appropriée
- [ ] Pas de secrets/credentials hardcodés

### Architecture

- [ ] Design aligné avec architecture TITANE∞
- [ ] Pas de couplage excessif
- [ ] Interfaces bien définies
- [ ] Principes SOLID respectés

### Sécurité

- [ ] Pas de vulnérabilités évidentes
- [ ] Input validation appropriée
- [ ] Authentification/autorisation correcte (si applicable)
- [ ] Données sensibles protégées

### Performance

- [ ] Pas de fuites mémoire
- [ ] Algorithmes efficaces
- [ ] Requêtes optimisées
- [ ] Lazy loading approprié (si applicable)

### Tests

- [ ] Tests pertinents et complets
- [ ] Edge cases couverts
- [ ] Tests lisibles et maintenables
- [ ] Mocks appropriés

### Documentation

- [ ] README à jour
- [ ] API documentée
- [ ] Exemples fournis
- [ ] CHANGELOG mis à jour

---

**Prêt pour review ?** Assignez des reviewers et attendez l'approbation ! ✅

<!--
Templates spécifiques disponibles:
- Backend: .github/PULL_REQUEST_TEMPLATE/backend.md
- Frontend: .github/PULL_REQUEST_TEMPLATE/frontend.md
- Documentation: .github/PULL_REQUEST_TEMPLATE/documentation.md
-->
