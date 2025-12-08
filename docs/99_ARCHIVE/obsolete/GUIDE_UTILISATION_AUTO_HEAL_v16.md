# 🚀 GUIDE UTILISATION — AUTO-FIX + AUTO-HEAL v16.0

Guide rapide pour utiliser le système Auto-Fix + Auto-Heal de TITANE∞.

---

## 📋 PRÉREQUIS

- Node.js (v18+)
- npm (v9+)
- Rust (stable)
- Cargo
- Tauri CLI (optionnel, installé automatiquement)

---

## 🔧 AUTO-FIX : DIAGNOSTIC ET CORRECTION

### Lancement standard

```bash
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY
./scripts/titane_autofix.sh
```

**Ce que fait le script :**
1. ✅ Vérifie votre environnement (Node, npm, Rust, Cargo)
2. ✅ Analyse le frontend (TypeScript, fichiers)
3. ✅ Analyse le backend (Cargo, Rust)
4. ✅ Nettoie les anciens builds (node_modules, dist, target)
5. ✅ Réinstalle les dépendances (npm install, cargo update)
6. ✅ Corrige automatiquement les erreurs (cargo fix, npm audit fix)
7. ✅ Rebuild complet (Vite + Cargo)
8. ✅ Vérifie que tout fonctionne
9. ✅ Génère un rapport détaillé

**Durée :** ~5-10 minutes selon votre machine

### Mode test (validation robustesse)

```bash
./scripts/titane_autofix.sh --test-mode
```

**Ce que fait le mode test :**
1. Casse volontairement un fichier (App.tsx)
2. Tente de build (doit échouer)
3. Restaure le fichier
4. Rebuild (doit réussir)

**Objectif :** Valider que le système détecte bien les problèmes et peut récupérer.

### Consulter les logs

```bash
# Voir le dernier log
cat logs/autofix_*.log | tail -50

# Voir le dernier rapport
cat logs/autofix_report_*.txt
```

---

## 🛡️ AUTO-HEAL : RÉPARATION AUTOMATIQUE

### Activation monitoring automatique

**Méthode 1 : Dans `main.tsx` (recommandé)**

```typescript
import { autoHealClient } from './utils/autoHealClient';

// Au lancement de l'application
autoHealClient.monitor.start();

// Optionnel : changer l'intervalle (défaut: 30s)
autoHealClient.monitor.setCheckInterval(60000); // 1 minute
```

**Méthode 2 : Dans un composant**

```typescript
import { useEffect } from 'react';
import { autoHealClient } from '@/utils/autoHealClient';

function App() {
  useEffect(() => {
    // Démarrer monitoring
    autoHealClient.monitor.start();
    
    // Nettoyer au démontage
    return () => {
      autoHealClient.monitor.stop();
    };
  }, []);
  
  return <YourApp />;
}
```

### Réparation manuelle

**Scan du système :**

```typescript
import { autoHealClient } from '@/utils/autoHealClient';

const report = await autoHealClient.scan();
console.log('Événements:', report.events);
console.log('Actions:', report.actions);
console.log('Statut:', report.status);
```

**Réparer un module spécifique :**

```typescript
// Réparer le Chat IA
await autoHealClient.repair('chat_ia');

// Réparer le router
await autoHealClient.repair('router');

// Réparer WebView
await autoHealClient.repair('webview');

// Réparer IPC
await autoHealClient.repair('ipc');
```

**Réparer tous les modules :**

```typescript
await autoHealClient.repair();
// ou
await autoHealClient.repair(undefined);
```

**Récupérer les logs :**

```typescript
const logs = await autoHealClient.getLogs();
console.log('Historique:', logs);
```

### ErrorBoundary : Capture automatique

**Déjà intégré dans `App.tsx` !**

Toute erreur React sera automatiquement :
1. Capturée par `AutoHealErrorBoundary`
2. Affichée avec une UI de récupération
3. Réparée automatiquement
4. L'application sera rechargée

**Test manuel :**

Pour tester l'ErrorBoundary, provoquez une erreur volontaire :

```typescript
// Dans n'importe quel composant
function TestErrorComponent() {
  // Déclencher erreur au clic
  const handleError = () => {
    throw new Error('Test Auto-Heal');
  };
  
  return <button onClick={handleError}>Tester Auto-Heal</button>;
}
```

**Résultat attendu :**
- 🔍 "Analyse du système..."
- 🔧 "Réparation en cours..."
- ✅ "Reconstruction terminée"
- 🔄 Reload automatique après 1s

---

## 🎮 COMMANDES TAURI (BACKEND)

Si vous voulez appeler directement depuis le backend :

```rust
use tauri::State;
use crate::auto_heal::{AutoHealState, auto_heal_scan, auto_heal_repair};

// Scan
let report = auto_heal_scan(state).await?;

// Réparer module
let results = auto_heal_repair(Some("chat_ia".to_string()), state).await?;

// Réparer tout
let results = auto_heal_repair(None, state).await?;
```

---

## 📊 INTERFACE UTILISATEUR (À IMPLÉMENTER)

### Bouton "Heal" dans le menu

Ajoutez un bouton dans `Menu.tsx` :

```tsx
import { autoHealClient } from '@/utils/autoHealClient';
import { useState } from 'react';

function HealButton() {
  const [healing, setHealing] = useState(false);
  
  const handleHeal = async () => {
    setHealing(true);
    try {
      const report = await autoHealClient.scan();
      console.log('Scan:', report);
      
      if (report.events.some(e => e.severity === 'error' || e.severity === 'critical')) {
        await autoHealClient.repair();
        alert('Système réparé !');
      } else {
        alert('Système en bonne santé !');
      }
    } catch (error) {
      console.error('Erreur heal:', error);
      alert('Échec réparation');
    } finally {
      setHealing(false);
    }
  };
  
  return (
    <button onClick={handleHeal} disabled={healing}>
      {healing ? '🔧 Réparation...' : '🛡️ Heal System'}
    </button>
  );
}
```

### Panel de diagnostic dans Settings

Créez une section dans `Settings.tsx` :

```tsx
import { autoHealClient } from '@/utils/autoHealClient';
import { useState } from 'react';

function AutoHealSettings() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleScan = async () => {
    setLoading(true);
    const result = await autoHealClient.scan();
    setReport(result);
    setLoading(false);
  };
  
  return (
    <div className="auto-heal-settings">
      <h2>Auto-Heal System</h2>
      
      <button onClick={handleScan} disabled={loading}>
        {loading ? 'Scan en cours...' : 'Run Diagnostic'}
      </button>
      
      <button onClick={() => autoHealClient.repair()}>
        Repair All Modules
      </button>
      
      {report && (
        <div className="report">
          <h3>Statut: {report.status}</h3>
          <p>Dernier scan: {new Date(report.last_scan * 1000).toLocaleString()}</p>
          
          <h4>Événements récents:</h4>
          <ul>
            {report.events.slice(-10).reverse().map((event, i) => (
              <li key={i} className={`severity-${event.severity}`}>
                [{event.module}] {event.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

## 🧪 TESTS RECOMMANDÉS

### 1. Tester Auto-Fix script

```bash
# Lancement standard
./scripts/titane_autofix.sh

# Vérifier logs
cat logs/autofix_*.log | grep "ERROR\|SUCCESS"

# Vérifier rapport
cat logs/autofix_report_*.txt
```

### 2. Tester mode test

```bash
./scripts/titane_autofix.sh --test-mode
```

**Vérifier que :**
- ✅ Le fichier est bien cassé
- ✅ Le build échoue
- ✅ Le fichier est restauré
- ✅ Le rebuild réussit

### 3. Tester ErrorBoundary

```bash
# Lancer l'app
npm run dev
```

Puis dans l'application :
1. Créer un bouton qui lance `throw new Error('Test')`
2. Cliquer dessus
3. Vérifier que l'UI de récupération s'affiche
4. Attendre le reload automatique

### 4. Tester monitoring

```typescript
// Dans la console du navigateur
import { autoHealClient } from './utils/autoHealClient';

// Démarrer
autoHealClient.monitor.start();

// Attendre 30s et vérifier les logs console
// [AutoHeal] Scan terminé: {...}
```

### 5. Tester réparation manuelle

```typescript
// Console navigateur
import { autoHealClient } from './utils/autoHealClient';

// Scan
const report = await autoHealClient.scan();
console.log(report);

// Réparer
await autoHealClient.repair();
```

---

## 🚨 TROUBLESHOOTING

### Le script ne démarre pas

```bash
# Vérifier les permissions
ls -l scripts/titane_autofix.sh

# Si besoin, rendre exécutable
chmod +x scripts/titane_autofix.sh
```

### Build TypeScript échoue

```bash
# Relancer le script auto-fix
./scripts/titane_autofix.sh

# Ou manuellement
npm run type-check
npm run build
```

### Cargo build échoue (WebKitGTK manquant)

```bash
# Sur Ubuntu/Debian
sudo apt-get install libwebkit2gtk-4.1-dev

# Sur Fedora
sudo dnf install webkit2gtk4.1-devel

# Sur Arch
sudo pacman -S webkit2gtk-4.1
```

### ErrorBoundary ne capture pas l'erreur

Vérifier que `App.tsx` a bien le wrapper :

```tsx
<AutoHealErrorBoundary>
  <BrowserRouter>
    {/* app */}
  </BrowserRouter>
</AutoHealErrorBoundary>
```

### Monitoring ne se lance pas

```typescript
// Vérifier que le client est bien importé
import { autoHealClient } from './utils/autoHealClient';

// Démarrer explicitement
autoHealClient.monitor.start();

// Vérifier logs console
console.log('[AutoHeal] Monitoring...');
```

---

## 📝 BONNES PRATIQUES

### ✅ À FAIRE

1. **Lancer auto-fix régulièrement** (au moins 1x par semaine)
2. **Activer le monitoring au lancement de l'app** (dans main.tsx)
3. **Consulter les logs** après chaque auto-fix
4. **Tester ErrorBoundary** après chaque modification majeure
5. **Utiliser le mode test** avant un déploiement

### ❌ À ÉVITER

1. ❌ Ne pas désactiver ErrorBoundary en production
2. ❌ Ne pas ignorer les erreurs dans les logs
3. ❌ Ne pas modifier auto_heal.rs sans comprendre le système
4. ❌ Ne pas désactiver le monitoring sans raison
5. ❌ Ne pas supprimer les logs (utiles pour debugging)

---

## 🎯 CHECKLIST DÉPLOIEMENT

Avant de déployer en production :

- [ ] Lancer `./scripts/titane_autofix.sh` avec succès
- [ ] Build TypeScript : 0 erreurs
- [ ] Build Vite : SUCCESS
- [ ] ErrorBoundary testée et fonctionnelle
- [ ] Monitoring activé dans le code
- [ ] Logs générés et consultés
- [ ] Mode test réussi
- [ ] Documentation lue et comprise

---

## 📚 RESSOURCES

- **Architecture complète :** `ARCHITECTURE_AUTO_HEAL_v16.md`
- **Changelog détaillé :** `CHANGELOG_v16.0_AUTO_HEAL.md`
- **Rapport final :** `RAPPORT_FINAL_AUTO_HEAL_v16.txt`
- **Code source :**
  - Bash : `scripts/titane_autofix.sh`
  - Rust : `src-tauri/src/auto_heal.rs`
  - TypeScript : `src/utils/autoHealClient.ts`
  - React : `src/components/AutoHealErrorBoundary.tsx`

---

## 🤝 SUPPORT

En cas de problème, consulter dans l'ordre :

1. Les logs : `logs/autofix_*.log`
2. Le rapport : `logs/autofix_report_*.txt`
3. La console navigateur (F12)
4. Les logs backend (terminal Tauri)

---

🎯 **TITANE∞ v16.0 — Robustesse maximale, zéro intervention manuelle**
