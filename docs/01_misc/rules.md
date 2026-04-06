# 🧠 TITANE∞ — Cline AI Agent Rules

**Project:** TITANE∞ Cognitive Operating System  
**Version:** 26.2.0  
**Owner:** Kevin Thibault (@KallokTherok1994)  
**Created:** 2026-01-03  
**AI Agent:** Cline v1.0.8 with MCP Support

---

⚠️ **IMPORTANT:** Ce fichier définit les règles strictes pour Cline.  
Voir `.cline/custom-instructions.md` pour les instructions détaillées.

---

## 🚨 RÈGLES CRITIQUES NON-NÉGOCIABLES

### ⛔ DÉPLOIEMENT INTERDIT

```bash
# ❌ COMMANDES BLOQUÉES (sans "GO FOR PRODUCTION DEPLOY")
pnpm run build
pnpm run build:production
tauri build
./runtime/stable/build.sh
cargo build --release
dpkg -i *.deb
```

**Seul autorisé:** Mode développement (`pnpm run dev`, tests, linting)

### 🧠 MODE PLAN OBLIGATOIRE

1. **Analyser** le contexte complet
2. **Proposer** un plan détaillé
3. **Attendre** validation humaine
4. **Exécuter** étape par étape
5. **Valider** avec tests

### 🚫 PAS DE "ANY" TypeScript

```typescript
// ❌ INTERDIT
const data: any = fetch();

// ✅ REQUIS
interface Data {
  id: string;
}
const data: Data = fetch();
```

### ✅ TESTS OBLIGATOIRES

```bash
pnpm run check      # TypeScript
pnpm run lint       # ESLint
pnpm test -- --run  # Tests unitaires
```

---

## 📚 DOCUMENTATION COMPLÈTE

**Voir fichiers pour détails complets:**

- `.cline/custom-instructions.md` → Instructions conversationnelles (10 KB)
- `.cline/README.md` → Guide utilisateur
- `.cline/STATUS.md` → État configuration
- `.cline/deployment-safeguards.json` → Safeguards sécurité

**Références projet:**

- `ARCHITECTURE.md` → Architecture système
- `CODE_STYLE.md` → Standards de code
- `.github/copilot-instructions.md` → Règles critiques

---

## 🎯 WORKFLOW STANDARD

```markdown
1. ANALYSE
   → Lire contexte complet
   → Identifier patterns existants
   → Vérifier dépendances

2. PLAN
   → Proposer modifications détaillées
   → Lister impacts et risques
   → Demander validation

3. EXÉCUTION (après approval)
   → Appliquer une par une
   → Vérifier après chaque étape
   → Reporter problèmes

4. VALIDATION
   → pnpm run check
   → pnpm run lint
   → pnpm test -- --run
```

---

## 💻 STANDARDS CODE

### TypeScript

- Types stricts (pas de `any`)
- Interfaces explicites
- Error handling complet

### Naming

- Classes/Types: `PascalCase`
- Functions/Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

### Imports

```typescript
// 1. External (React, Tauri)
// 2. Internal (@/ paths)
// 3. Relative (./...)
// 4. Styles
```

---

## 🔒 SÉCURITÉ

- ❌ Pas de secrets hardcodés
- ✅ Validation inputs
- ✅ Dependencies sûres
- ✅ Error handling sécurisé

---

## 🧪 TESTS

- Minimum 80% coverage
- Tests avant commit
- Edge cases couverts
- Performance vérifiée

---

**Pour instructions détaillées:** `.cline/custom-instructions.md`  
**Version:** 1.0.0 | **Status:** ✅ Production Ready
