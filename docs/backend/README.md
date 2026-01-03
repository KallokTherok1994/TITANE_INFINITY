# 📚 TITANE∞ Backend Documentation

**Pour développeurs, contributeurs, et Kevin du futur.**

Cette documentation cartographie le backend TITANE∞ (Tauri v2 + Rust async) de manière claire, actionnable et respectueuse de ton énergie mentale.

---

## 🗺️ Navigation Rapide

| Document | Description | Quand le lire ? |
|----------|-------------|-----------------|
| **[overview.md](./overview.md)** | Vue d'ensemble "Backend 101" | Découvrir l'architecture |
| **[architecture.md](./architecture.md)** | Diagrammes + structure modules | Comprendre les flux |
| **[api-tauri.md](./api-tauri.md)** | Toutes les commandes Tauri | Implémenter features frontend |
| **[contribution-guide.md](./contribution-guide.md)** | Comment contribuer au backend | Ajouter du code |
| **[debug-and-self-heal.md](./debug-and-self-heal.md)** | Playbook debug + SelfHeal | Quand ça casse |
| **[verify-and-health.md](./verify-and-health.md)** | Scripts verify + health checks | Avant commit / déploiement |
| **[performance.md](./performance.md)** | Scheduler + async + Harmonia | Optimiser les perfs |

---

## 🎯 Accès Rapide par Besoin

### Je veux…

**Comprendre TITANE∞ backend en 10 minutes**
→ Lis [overview.md](./overview.md)

**Voir comment les noyaux (Helios, Nexus, etc.) s'organisent**
→ Lis [architecture.md](./architecture.md)

**Ajouter une nouvelle commande Tauri**
→ Lis [contribution-guide.md](./contribution-guide.md) § "Ajouter une commande"

**Débugger un crash au démarrage**
→ Lis [debug-and-self-heal.md](./debug-and-self-heal.md) § "Que faire si…"

**Vérifier que tout est OK avant un commit**
→ Lance `pnpm run verify:backend` (voir [verify-and-health.md](./verify-and-health.md))

**Optimiser les performances async**
→ Lis [performance.md](./performance.md)

---

## 🏗️ Structure du Backend (Rappel)

```
src-tauri/src/
  ├── utils/       → Erreurs, logs, constantes
  ├── types/       → Tous les types métier (30+)
  ├── services/    → IO, System, Storage (+ Security v17.3.0)
  ├── core/        → Helios, Nexus, Harmonia, Sentinel, Memory
  ├── engine/      → AutoEvolution, Diagnostics, Repair, HealthCheck
  ├── security/    → ShellGuard, StorageGuard (v17.3.0)
  ├── api/         → Commandes Tauri exposées au frontend
  ├── app/         → Setup, Main loop
  └── main.rs      → Point d'entrée
```

---

## 📦 Versions & Historique

| Version | Date | Changements majeurs |
|---------|------|---------------------|
| **v17.3.0** | 22 nov 2025 | Security hardening P0 (ShellGuard, StorageGuard, 10 vulns corrigées) |
| **v17.2.1** | 22 nov 2025 | Legacy bridge, écran noir fix |
| **v17.2.0** | 21 nov 2025 | Refactor architecture complète |
| v17.1.x | Nov 2025 | Phases auto-évolution |
| v13.0.0 | Oct 2025 | Multi-noyaux Helios/Nexus/Harmonia |

Voir [CHANGELOG.md](../../CHANGELOG.md) pour détails.

---

## 🧭 Philosophie de cette Doc

**Clarté** : Pas de jargon inutile. Si tu es fatigué à 23h, tu dois quand même comprendre.

**Action** : Chaque doc répond à "que faire maintenant ?".

**Énergie** : On documente pour économiser du temps mental, pas pour impressionner.

**Évolution** : Cette doc est vivante. Si tu trouves une incohérence, corrige-la (ou note-la dans un TODO).

---

## 🤖 Pour les IA Copilotes

Si tu es une IA (Copilot, Claude, ChatGPT, etc.) :

1. **Lis d'abord [overview.md](./overview.md)** pour contexte général
2. **Lis ensuite [architecture.md](./architecture.md)** pour comprendre les flux
3. **Consulte [api-tauri.md](./api-tauri.md)** pour les contrats d'interface
4. **Respecte [contribution-guide.md](./contribution-guide.md)** pour les conventions

Tu peux ensuite aider à :
- Refactorer du code en respectant l'architecture
- Ajouter de nouvelles features
- Debugger des problèmes
- Écrire des tests

**Mais jamais** :
- Casser les conventions (naming, erreurs, logs)
- Ignorer la sécurité (ShellGuard, StorageGuard sont obligatoires)
- Bloquer la boucle Tauri (toujours async)

---

## 📞 Contact & Contribution

**Mainteneur** : Kevin Thibault (@KallokTherok1994)

**Philosophie** : Divergence → Connexion → Structuration

**Contribution** : Voir [contribution-guide.md](./contribution-guide.md)

---

**TITANE∞** — *"L'évolution se mérite, la sécurité se construit"*
