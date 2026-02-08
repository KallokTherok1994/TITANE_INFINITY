# Navigation & Routes — Cartographie

## 1) Niveaux de navigation
- Niveau 0 : `TITANE` | `TIME` | `STATS` | `ADMIN` | `DEV` | `Plus`
- Niveau 1 : sous-tabs/pills par section (DEV/TITANE/TIME)
- Niveau 2 : sous-onglets internes (ex. centre audio : principal/paramètres/diagnostic/avancé)

---

## 2) DEV (dashboards opérationnels)

### DEV → Vue d’ensemble
But : synthèse santé + indicateurs clefs.
UI :
- Cards KPI (Santé globale %, QA score, orchestrations, engines actifs, alertes)
- Bloc “Conscience système” (Niveau, Cohérence, Mode)

Actions :
- navigation vers sous-modules via tabs.

### DEV → Dev Tools
UI :
- Grille d’outils : Patch / Refactor / Rewrite / Audit / Test / Rollback
- Zone “Patch Operation” + bouton “Exécuter Patch”

Risques :
- opérations potentiellement destructives → exiger confirmations + dry-run.

### DEV → Command Center
UI :
- Cards “centres” : System/Governance/Design/Audio/Evolution/Orchestration
- Chaque card : santé %, moteurs, tags (UI/Security/Cognitive)

### DEV → System Commands
UI :
- Actions : Sync All / Health Check / Optimize / Repair / Garbage Collector / Backup

### DEV → Q&A Tests
UI :
- Couverture tests, moniteurs actifs, hardening (strict)
- Cards : Unit / Integration / E2E / Performance + bouton “Exécuter”

### DEV → Orchestration
(Non visible dans toutes les captures, mais onglet présent)
Attendu :
- pipelines, queue, workers, latences, retry, circuit breakers.

### DEV → Security
UI :
- “Security & Alerts”
- compteurs : alertes critiques / avertissements
- Liste d’alertes : ex. `non-disk` (usage disque), `system` (maintenance ok)
- Action “Acquitter”

### DEV → Metrics
UI :
- CPU / RAM / Disk usage
- System uptime
- Core Web Vitals (placeholder)

### DEV → Ultimate Optimization
UI :
- Dashboard vertical : GPU Accelerator V2 / WebAssembly Compute / Service Worker / IndexedDB Optimizer / Performance Summary
- Badges : “WebGL fallback”, “JS fallback”, “Not registered”, “Optimized”
- Actions : “Test Vector Addition”, “Test Dot Product”, “Clear Cache”, “Check Updates”, “Compact Database”

---

## 3) TITANE (cœur fonctionnel)

### TITANE → Vue d’ensemble
Attendu :
- résumé des modules & état global.

### TITANE → Chat
UI (observé) :
- Bandeau d’actions : “Nouvelle conversation / Conversations / Archives”
- Zone de configuration : provider + mode + quick-actions (icônes)
- Champ de recherche dans chat
- Zone centrale “TITANE∞ est prêt à converser” + boutons “Brainstorm / Summarize / Analyze / Explain”
- Composer bas : upload fichiers, vision, audio, conversation, input + bouton Envoyer

Erreurs observées :
- “Erreur lors du chargement d’Ollama : …” (fallback requis)

### TITANE → VAD
Attendu :
- micro, boucle VAD, contrôle latence, états.

### TITANE → Vision
Attendu :
- import image, preview, pipeline vision.

### TITANE → Identité
Attendu :
- profil, persona, mode, règles.

### TITANE → Mémoire
Attendu :
- STM/MTM/LTM, indices, compact, export.

### TITANE → Évolution
Attendu :
- moteurs d’évolution, logs, registry, events.

### TITANE → XP
UI (observé) :
- “XP Center / Skills / Growth” (panneau)
- stats progress, badges.

### TITANE → Transform
Attendu :
- transformations de contenu (résumé, extraction, etc.)

### TITANE → Centre Audio
UI (observé) :
- Sélection voix (listes)
- Boutons Test/Appliquer
- Paramètres (vitesse/hauteur/volume)
- Toggle “Emotions activées”
- Onglets : principal / paramètres / diagnostic / avancé

---

## 4) TIME (temporal/agenda)

### TIME → Maintenant
But : vue synthèse “now” (tâches, focus, contexte).

### TIME → Agenda
But : calendrier, slots, planning.

### TIME → Timeline
UI (observé) :
- bandeau (Maintenant/Agenda/Timeline/Snapshots/Intelligence/Flow)
- cards timeline (événements) + filtres + compteurs

### TIME → Snapshots
But : captures d’état, points de sauvegarde.

### TIME → Intelligence
But : analyse / insight sur timeline (patterns).

### TIME → Flow
But : exécution fluide (mode focus, rituel).

---

## 5) Fichiers machine-readable
- `data/routes_map.json` : route map structurée
- `data/screenshots_index.json` : index des captures

