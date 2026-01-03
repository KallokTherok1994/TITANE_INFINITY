# ⚡ Cheat Sheet — Super Prompts TITANE∞

Aide-mémoire rapide pour utiliser les Super Prompts efficacement.

---

## 🚀 Commandes Rapides

### Préparation

```bash
# Créer une branche de travail
git checkout -b chirurgie-frontend

# Backup de sécurité
git stash push -u -m "backup avant SP#1"

# Vérifier l'état propre
git status
```

### Pendant l'application

```bash
# Tester la compilation
pnpm run build

# Tester le linting
pnpm run lint

# Lancer en mode dev
pnpm run dev

# Vérifier les types TypeScript
npx tsc --noEmit
```

### Après application

```bash
# Voir les fichiers modifiés
git status

# Voir les diffs importants
git diff src/design-system/
git diff tailwind.config.ts

# Commit
git add .
git commit -m "feat(frontend): Apply Super Prompt #1"

# Push
git push origin chirurgie-frontend
```

### Rollback d'urgence

```bash
# Annuler toutes les modifications
git reset --hard HEAD

# Récupérer le backup
git stash pop

# OU revenir à un commit précédent
git log --oneline -5
git reset --hard <commit-hash>
```

---

## 🎯 Super Prompt #1 — Quick Copy

**Fichier** : [docs/super-prompts/frontend/SUPER_PROMPT_01_FRONTEND_FINAL_FORM.md](./frontend/SUPER_PROMPT_01_FRONTEND_FINAL_FORM.md)

**Ouvrir Copilot** : `Ctrl+Alt+I` (Linux/Windows) ou `Cmd+Alt+I` (Mac)

**Première ligne à copier** : `@workspace`

---

## 📊 Checklist Ultra-Rapide

### Avant

- [ ] Git clean (pas de fichiers non commités critiques)
- [ ] Branche de travail créée
- [ ] Copilot Chat ouvert
- [ ] Super Prompt copié

### Pendant

- [ ] Copilot analyse terminée
- [ ] Diagnostic généré
- [ ] Code généré et reviewé
- [ ] Modifications appliquées par lot
- [ ] Tests intermédiaires OK

### Après

- [ ] `pnpm run build` ✅
- [ ] `pnpm run lint` ✅
- [ ] `pnpm run dev` fonctionne
- [ ] Palette Titane visible
- [ ] Responsive fonctionne
- [ ] Commit créé

---

## 🎨 Palette Rapide (Copier-Coller)

```css
/* Backgrounds */
--color-bg-primary: #0A0B0D;
--color-bg-elevated: #1A1B1E;

/* Accents */
--color-accent-violet: #8B5CF6;

/* Text */
--color-text-primary: #E5E7EB;
--color-text-muted: #9CA3AF;

/* Semantic */
--color-semantic-success: #10B981;
--color-semantic-error: #EF4444;
--color-semantic-warning: #F59E0B;
--color-semantic-info: #3B82F6;
```

---

## 🏗️ Structure Cible (Référence Rapide)

```
src/
├── design-system/
│   ├── css-vars.css
│   ├── tokens.ts
│   └── (tailwind.config.ts)
├── components/
│   ├── ui/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   ├── MainChat.tsx
│   │   ├── DevToolsDock.tsx
│   │   └── MobileNav.tsx
│   └── feedback/
└── apps/
    ├── chat/
    ├── devtools/
    ├── settings/
    └── system/
```

---

## 🐛 Troubleshooting Express

| Problème | Commande / Solution |
|----------|---------------------|
| Copilot ne répond pas | `Ctrl+Shift+P` → "Reload Window" |
| Build cassé | `pnpm install && pnpm run build` |
| Types incorrects | `npx tsc --noEmit` pour voir les erreurs |
| Palette invisible | Vérifier import de `css-vars.css` dans `main.tsx` |
| Conflits Git | `git reset --hard HEAD && git stash pop` |
| Bundle trop lourd | Vérifier lazy loading dans `App.tsx` |

---

## 📱 Breakpoints Tailwind

| Nom | Taille | Usage |
|-----|--------|-------|
| `sm` | 375px | Mobile portrait |
| `md` | 768px | Tablette |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |

**Exemple** :
```tsx
<div className="hidden lg:flex">Desktop only</div>
<div className="flex lg:hidden">Mobile/Tablet only</div>
```

---

## 🎯 Raccourcis VS Code Utiles

| Action | Raccourci |
|--------|-----------|
| Ouvrir Copilot Chat | `Ctrl+Alt+I` |
| Commande rapide | `Ctrl+Shift+P` |
| Terminal intégré | `` Ctrl+` `` |
| Recherche fichier | `Ctrl+P` |
| Recherche dans workspace | `Ctrl+Shift+F` |
| Format document | `Shift+Alt+F` |
| Aller à la définition | `F12` |
| Renommer symbole | `F2` |

---

## 🔗 Liens Rapides

- [Super Prompt #1 Complet](./frontend/SUPER_PROMPT_01_FRONTEND_FINAL_FORM.md)
- [Quick Start](./QUICK_START.md)
- [Guide Visuel](./VISUAL_GUIDE.md)
- [Changelog](./CHANGELOG.md)
- [Design System TITANE](../DESIGN_SYSTEM_TITANE.md)

---

## 💡 Tips Ultra-Rapides

✅ **Toujours** lire le diagnostic avant d'appliquer
✅ **Toujours** tester entre chaque modification
✅ **Toujours** commit après validation
✅ **Jamais** tout accepter en aveugle
✅ **Jamais** skip les tests de build/lint

---

## 📋 Template de Commit

```
feat(frontend): Apply Super Prompt #1 - Frontend Final Form

- Add Design System (css-vars.css + tokens.ts)
- Update Tailwind config with Titane palette
- Create base layout components (AppShell, Sidebar, TopBar, MainChat)
- Implement responsive mobile-first design
- Generate frontend diagnostic report

Changes:
- src/design-system/* (new)
- src/components/layout/* (new)
- tailwind.config.ts (updated)
- docs/frontend/FRONTEND_DIAGNOSTIC_TITANE.md (new)

Co-authored-by: GitHub Copilot <noreply@github.com>
```

---

## ⚡ One-Liners Magiques

```bash
# Build + Lint + Dev test en une commande
pnpm run build && pnpm run lint && pnpm run dev

# Voir la taille du bundle
du -sh dist/

# Compter les lignes de code frontend
find src/ -name "*.tsx" -o -name "*.ts" | xargs wc -l

# Trouver tous les TODOs
grep -r "TODO" src/

# Vérifier les imports non utilisés (avec ESLint)
pnpm run lint -- --fix
```

---

**Version** : 1.0.0
**Dernière mise à jour** : 2025-12-09
**Auteur** : TITANE∞ Core Team

---

**💡 Pro Tip** : Imprimez cette cheat sheet ou gardez-la ouverte dans un onglet pendant que vous appliquez les super prompts !
