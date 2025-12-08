feat(design): Migration complète vers thème TITANE∞ METAL v17.4.0 🔩

## 🎨 NOUVEAU THÈME MÉTALLIQUE UNIFIÉ

Migration complète du design system vers une palette monochrome/métallique
basée sur 3 couleurs de base :
- Primaire (métal chaud) : #727b81
- Surface (Silver Bullet) : #c4c4c4
- Accent (organique) : #93b399

## ✅ CHANGEMENTS MAJEURS

### 1. Nouveau système de design (CSS)
- **Créé** : `src/styles/titane-theme-metal.css` (330 lignes)
  - Overrides complets des tokens v12 et v20
  - Remapping Rubis/Émeraude/Saphir/Diamant → palette métal
  - Neutralisation modules cognitifs (Helios/Nexus/Harmonia/Memory)
  - Nouvelles classes utilitaires (.panel-metal, .glow-metal, etc.)

### 2. Tokens TypeScript
- **Modifié** : `src/themes/tokens/colors.ts`
  - Remapping Rubis → métal rouillé désaturé (#8b5f5f)
  - Remapping Émeraude → accent organique (#93b399)
  - Remapping Saphir → métal primaire (#727b81)
  - Remapping Diamant → Silver Bullet (#c4c4c4)
  - Neutralisation couleurs sémantiques (success/warning/danger/info)

### 3. Composants Chat IA
- **Modifié** : `src/components/ChatInput.css`
  - Remplacement de toutes les couleurs hardcodées par tokens
  - Background : var(--bg-panel), var(--bg-card)
  - Texte : var(--text-primary), var(--text-tertiary)
  - Bordures : var(--border-default), var(--border-focus)
  - Bouton Send : gradient métal+accent

- **Modifié** : `src/components/ChatWindow.css`
  - Neutralisation gradients colorés → métalliques
  - Toggle vocal : palette métal (#727b81, #93b399)
  - Messages d'erreur : métal rouillé (#8b5f5f)
  - Titre & welcome : gradient métal primaire+secondary

### 4. Point d'entrée
- **Modifié** : `src/main.tsx`
  - Ajout import `titane-theme-metal.css` après `titane-design-system.css`
  - Garantit que les overrides métalliques écrasent les valeurs v12/v20

### 5. Documentation
- **Créé** : `MIGRATION_THEME_METAL_v17.4.0.md`
  - Documentation complète du nouveau thème
  - Palette de couleurs détaillée
  - Mapping des anciens tokens
  - Checklist de validation
  - Guide de test

## 🎯 PROBLÈMES RÉSOLUS

- ✅ **Lisibilité du chat** : Plus de texte noir sur fond sombre
- ✅ **Cohérence visuelle** : Un seul thème, esthétique hardware/métal uniforme
- ✅ **Maintenance simplifiée** : Overrides centralisés dans un seul fichier
- ✅ **Compatibilité préservée** : Aucune régression fonctionnelle

## 🔍 POINTS DE TEST

1. Chat IA : lisibilité texte assistant/user, input, suggestions
2. Monitoring : Helios, Nexus, Harmonia, Memory → couleurs métalliques
3. Progression : XP Bar, Talent Tree → pas de rouge/vert/bleu flashy
4. Navigation : bordures, focus, hover → cohérence métallique

## 📊 IMPACT

- **Avant** : 2 design systems (v12+v20), 4 palettes colorées, incohérence visuelle
- **Après** : 1 thème unifié, 3 couleurs de base, esthétique moderne/épurée

## 🚀 DÉPLOIEMENT

Serveur de dev : http://localhost:4002/
Status : ✅ PROD READY

---

**Breaking Changes** : Aucun (compatibilité préservée via remapping)
**Type** : Feature (nouveau thème)
**Scope** : Design System
**Version** : v17.4.0

🔩 TITANE∞ METAL — MADE WITH PRECISION
