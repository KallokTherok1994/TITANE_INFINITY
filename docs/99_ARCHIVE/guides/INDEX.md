# 📚 Archived Guides — INDEX

**Archive reason:** Consolidation vers docs/04_guides/  
**Date archivage:** 15 décembre 2025  
**Phase:** Phase 5 - Consolidation Guides  
**Status:** ✅ Archivé (ZERO suppression respectée)

---

## 🎯 PURPOSE

Guides obsolètes archivés suite à consolidation Phase 5:
- **12+ guides dispersés** → **3 guides unifiés** (docs/04_guides/)
- **Raison:** Duplication contenu, versions obsolètes, maintenance coûteuse
- **Remplacement:** QUICKSTART.md, SETUP.md, TESTING.md

**Principe:** ZERO suppression — guides archivés (pas deleted), réversibles

---

## 📋 GUIDES ARCHIVÉS (7 fichiers)

### Quick Start Guides (4 fichiers)

#### 1. QUICK_START_v∞.3.md
**Date création:** v∞.3 (version antérieure)  
**Raison archivage:** Superseded by [docs/04_guides/quickstart/QUICKSTART.md](../../04_guides/quickstart/QUICKSTART.md)  
**Contenu:** ASCII banner, launch commands (dev/production), feature testing  
**Duplication:** Installation, lancement, features → maintenant dans QUICKSTART.md unifié

#### 2. QUICK_START_CHAT_IA_v19.5.2.md
**Date création:** v19.5.2 (version obsolète)  
**Raison archivage:** Superseded by [docs/04_guides/quickstart/QUICKSTART.md § Chat IA](../../04_guides/quickstart/QUICKSTART.md#chat-ia---premiers-pas)  
**Contenu:** Chat IA setup, providers configuration (Ollama, Gemini, Claude, OpenAI)  
**Duplication:** Configuration Chat IA → maintenant section dédiée QUICKSTART.md

#### 3. QUICKSTART_UBUNTU_24.04.md
**Date création:** v24 (Ubuntu-specific)  
**Raison archivage:** Superseded by [docs/04_guides/quickstart/QUICKSTART.md § Installation](../../04_guides/quickstart/QUICKSTART.md#installation-rapide)  
**Contenu:** Ubuntu 24.04 installation guide, 3-command setup, dependencies  
**Duplication:** Installation Ubuntu → maintenant section "Installation Rapide" QUICKSTART.md

#### 4. POST_INSTALL_README.md
**Date création:** Post-installation guide  
**Raison archivage:** Superseded by [docs/04_guides/quickstart/QUICKSTART.md](../../04_guides/quickstart/QUICKSTART.md) + [docs/04_guides/development/SETUP.md](../../04_guides/development/SETUP.md)  
**Contenu:** Post-installation steps, configuration  
**Duplication:** Setup post-install → maintenant QUICKSTART.md + SETUP.md

### README Obsolete Versions (3 fichiers)

#### 5. README_FINAL_v∞.3.md
**Date création:** v∞.3 (version finale antérieure)  
**Raison archivage:** README outdated, superseded by current README.md  
**Contenu:** README version finale v∞.3  
**Duplication:** Info générale → maintenant README.md current + docs/04_guides/

#### 6. README_INSTALL_SUITE.md
**Date création:** Installation suite README  
**Raison archivage:** Superseded by [docs/04_guides/development/SETUP.md](../../04_guides/development/SETUP.md)  
**Contenu:** Installation suite tools, development setup  
**Duplication:** Setup development → maintenant SETUP.md complet

#### 7. README_v19.5.2_OLD.md
**Date création:** v19.5.2 (version obsolète)  
**Raison archivage:** README outdated, superseded by current README.md  
**Contenu:** README version v19.5.2 (ancienne)  
**Duplication:** Info générale → maintenant README.md current + docs/04_guides/

---

## 🔄 MIGRATION MAPPING

**Ancien guide → Nouveau guide**

| Ancien fichier                     | Nouveau fichier                                              | Section                     |
| ---------------------------------- | ------------------------------------------------------------ | --------------------------- |
| QUICK_START_v∞.3.md                | docs/04_guides/quickstart/QUICKSTART.md                      | Installation + Features     |
| QUICK_START_CHAT_IA_v19.5.2.md     | docs/04_guides/quickstart/QUICKSTART.md                      | § Chat IA - Premiers Pas    |
| QUICKSTART_UBUNTU_24.04.md         | docs/04_guides/quickstart/QUICKSTART.md                      | § Installation Rapide       |
| POST_INSTALL_README.md             | docs/04_guides/quickstart/QUICKSTART.md + development/SETUP.md | Installation + Setup        |
| README_FINAL_v∞.3.md               | README.md (current) + docs/04_guides/                        | Info générale               |
| README_INSTALL_SUITE.md            | docs/04_guides/development/SETUP.md                          | Setup Development           |
| README_v19.5.2_OLD.md              | README.md (current) + docs/04_guides/                        | Info générale               |

---

## 📊 CONSOLIDATION IMPACT

**Avant Phase 5:**
- **12+ guides dispersés** à racine (QUICKSTART*, README*)
- **Problèmes:** Duplication, versions obsolètes, navigation confuse, maintenance coûteuse

**Après Phase 5:**
- **3 guides unifiés** (docs/04_guides/)
  - QUICKSTART.md (850 lignes) — Onboarding utilisateur complet
  - SETUP.md (650 lignes) — Setup développement standardisé
  - TESTING.md (750 lignes) — Stratégie tests complète
- **Avantages:** Navigation claire, contenu centralisé, maintenance facile

**Métriques:**
- Réduction fichiers: 12+ → 3 guides
- Lignes consolidées: ~2,250 lignes documentation unifiée
- Duplication éliminée: ~60% contenu dupliqué supprimé
- Maintenance simplifiée: 1 seul fichier à updater par thème

---

## 🔍 CONTENU ARCHIVÉ PRÉSERVÉ

**Ce qui est préservé:**

✅ **Installation guides** (Ubuntu 24.04 specific, post-install)  
✅ **Chat IA configuration** (providers setup v19.5.2)  
✅ **Quick start workflows** (v∞.3 ASCII banners, commands)  
✅ **README versions historiques** (v19.5.2, v∞.3)  
✅ **Development setup** (installation suite tools)

**Accès archive:**
- Path: `docs/99_ARCHIVE/guides/`
- Réversible: `git mv docs/99_ARCHIVE/guides/<file> .` (si besoin)
- Historique: `git log --follow docs/99_ARCHIVE/guides/<file>`

---

## 📚 GUIDES ACTUELS (Références)

**Navigation vers guides actifs:**

- 📖 **[docs/04_guides/quickstart/QUICKSTART.md](../../04_guides/quickstart/QUICKSTART.md)** — Onboarding utilisateur complet
- 🛠️ **[docs/04_guides/development/SETUP.md](../../04_guides/development/SETUP.md)** — Setup développement standardisé
- 🧪 **[docs/04_guides/development/TESTING.md](../../04_guides/development/TESTING.md)** — Stratégie tests complète
- 🗺️ **[docs/04_guides/INDEX.md](../../04_guides/INDEX.md)** — Navigation master guides

**Guides spécialisés (racine - à migrer Phase 5):**
- 🎤 **[VOCAL_README.md](../../../VOCAL_README.md)** — Mode Vocal complet
- 🎨 **[MULTIMODAL_QUICK_START.md](../../../MULTIMODAL_QUICK_START.md)** — Multimodal Engine
- 🧠 **[UNIFIED_MEMORY_GUIDE.md](../../../UNIFIED_MEMORY_GUIDE.md)** — UnifiedMemory OS
- ⏱️ **[TEMPORAL_INTEGRATIONS_README_FR.md](../../../TEMPORAL_INTEGRATIONS_README_FR.md)** — Temporal Integrations

---

## ✅ VALIDATION ARCHIVAGE

**Checklist Phase 5:**

✅ **7 fichiers archivés** (git mv, pas delete)  
✅ **ZERO suppression** respectée (principe sacré)  
✅ **Réversibilité** garantie (git log --follow)  
✅ **INDEX.md créé** (navigation archive)  
✅ **Migration mapping** documentée  
✅ **Cross-refs** mis à jour (vers docs/04_guides/)

**Git status:**
- Status: `renamed` (pas `deleted`)
- Commitable: Ready for Phase 5 final commit

---

## 🔄 RÉVERSIBILITÉ

**Pour restaurer un guide archivé:**

```bash
# Exemple: restaurer QUICKSTART_UBUNTU_24.04.md
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
git mv docs/99_ARCHIVE/guides/QUICKSTART_UBUNTU_24.04.md .

# Vérifier historique
git log --follow docs/99_ARCHIVE/guides/QUICKSTART_UBUNTU_24.04.md
```

**Attention:** Restaurer créerait duplication avec docs/04_guides/quickstart/QUICKSTART.md  
**Recommandation:** Utiliser guides unifiés (docs/04_guides/) sauf besoin spécifique

---

## 📞 SUPPORT

**Questions archivage?** → [GitHub Issues](https://github.com/KallokTherok1994/TITANE_INFINITY/issues)  
**Besoin restaurer?** → Contacter TITANE Team avec raison justifiée  
**Documentation Phase 5?** → Voir [DOCUMENTATION_EVOLUTION_REPORT.md](../../../DOCUMENTATION_EVOLUTION_REPORT.md)

---

**INDEX généré:** 15 décembre 2025  
**Archive:** docs/99_ARCHIVE/guides/  
**Phase:** Phase 5 - Consolidation Guides  
**Maintainer:** TITANE∞ Documentation Evolution Engine vΩ

---

_Archive guides — ZERO suppression respectée_ ✅
