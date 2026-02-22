# TITANE∞ DEVOPS GUIDE v26.0

**Guide d'utilisation : Visual DevOps + Local Agent**

Date : 27 novembre 2025
Version : 26.0.0
Statut : **MODES ACTIFS**

---

## 📋 TABLE DES MATIÈRES

1. [Introduction](#introduction)
2. [Modes activés](#modes-activés)
3. [Visual DevOps Engine](#visual-devops-engine)
4. [Local Agent Engine](#local-agent-engine)
5. [Règles de sécurité](#règles-de-sécurité)
6. [Exemples d'utilisation](#exemples-dutilisation)
7. [Workflows automatisés](#workflows-automatisés)
8. [Dépannage](#dépannage)

---

## 1. INTRODUCTION

TITANE∞ v26.0 introduit **deux modes révolutionnaires** pour le développement DevOps :

### **MODE 1 : VISUAL DEVOPS (v25.5)**
- Analyse en temps réel de captures d'écran
- Compréhension visuelle (code, UI, terminal, logs)
- Diagnostic technique automatique
- Génération scripts/commandes DevOps intelligents
- Propositions contextuelles

### **MODE 2 : LOCAL AGENT (v26.0)**
- Orchestration build/test/deploy
- Analyse projet (Rust, Tauri, React, Node)
- Génération pipelines CI/CD locaux
- Automatisation workflows DevOps sécurisés
- Maintenance état stable

### **PRINCIPE FONDAMENTAL**
**TITANE ne prend JAMAIS le contrôle direct.**
Toute action nécessite **validation humaine obligatoire**.

---

## 2. MODES ACTIVÉS

### Activation

```typescript
import { VisualDevOps } from '@/core/devops/VisualDevOpsEngine';
import { LocalAgent } from '@/core/devops/LocalAgentEngine';

// Activer Visual DevOps
await VisualDevOps.enable();

// Activer Local Agent
await LocalAgent.enable();

// Vérifier statut
console.log('Visual DevOps:', VisualDevOps.isEnabled());
console.log('Local Agent:', LocalAgent.isEnabled());
```

### Désactivation

```typescript
// Désactiver proprement
await VisualDevOps.disable(); // Sauvegarde session
await LocalAgent.disable();   // Pause workflows
```

---

## 3. VISUAL DEVOPS ENGINE

### 3.1 Analyse d'écran

**Cas d'usage** : L'utilisateur envoie une capture d'écran d'une erreur

```typescript
// Analyser capture d'écran (base64)
const analysis = await VisualDevOps.analyzeScreen(
  imageBase64,
  'Erreur de compilation Rust'
);

console.log('Type de contexte:', analysis.context_type); // 'error_screen'
console.log('Erreurs détectées:', analysis.technical_content.errors_detected);
console.log('Diagnostic:', analysis.diagnosis.summary);
```

**Résultat** :
```json
{
  "id": "1732729600000-abc123",
  "context_type": "error_screen",
  "detected_elements": [
    {
      "type": "error_message",
      "text_content": "error[E0425]: cannot find value `foo` in this scope",
      "confidence": 0.95
    }
  ],
  "technical_content": {
    "languages_detected": ["rust"],
    "frameworks_detected": ["tauri"],
    "errors_detected": [
      {
        "error_type": "compilation",
        "severity": "high",
        "message": "cannot find value `foo` in this scope",
        "file_path": "src/main.rs",
        "line_number": 42,
        "suggested_fixes": [
          "Define variable `foo` before use",
          "Import `foo` from external crate",
          "Check for typos in variable name"
        ]
      }
    ]
  },
  "diagnosis": {
    "summary": "Found 1 error(s)",
    "issues_found": [...],
    "root_causes": ["Undefined variable"],
    "recommended_actions": ["Define variable `foo` before use"]
  }
}
```

### 3.2 Proposition d'action

**Après analyse, proposer une correction** :

```typescript
// Proposer fix automatique
const action = await VisualDevOps.proposeAction(
  analysis,
  'fix_error'
);

console.log('Action proposée:', action.description);
console.log('Patch généré:', action.code_patch);
console.log('Vérifications sécurité:', action.security_checks);
```

**Résultat** :
```json
{
  "id": "action-123",
  "action_type": "fix_error",
  "description": "Fix detected errors",
  "code_patch": {
    "file_path": "src/main.rs",
    "original_code": "println!(\"{}\", foo);",
    "patched_code": "let foo = \"value\";\nprintln!(\"{}\", foo);",
    "diff": "+ let foo = \"value\";\n  println!(\"{}\", foo);",
    "explanation": "Define variable `foo` before use",
    "risk_level": "safe",
    "backup_recommended": false
  },
  "validation_required": true,
  "security_checks": [
    {
      "check_type": "no_system_modification",
      "status": "passed",
      "message": "Code patch risk level: safe"
    }
  ],
  "status": "pending"
}
```

### 3.3 Validation et exécution

**L'utilisateur doit valider** :

```typescript
// Utilisateur valide
await VisualDevOps.validateAction(action.id, true, 'Approved fix');

// Utilisateur applique manuellement le patch
// (copier/coller ou appliquer dans l'éditeur)

// Marquer comme exécuté
await VisualDevOps.markActionExecuted(
  action.id,
  true, // success
  'Patch applied successfully'
);
```

### 3.4 Génération de scripts

**Générer script de build** :

```typescript
const buildAction = await VisualDevOps.proposeAction(
  analysis,
  'build'
);

const script = buildAction.script_generated;
console.log('Script généré:');
console.log(script.content);
console.log('Instructions:', script.usage_instructions);
```

**Script généré (`build_generated.sh`)** :
```bash
#!/bin/bash

# TITANE∞ Build Script (Generated by VisualDevOpsEngine)
# This script must be reviewed and executed manually

set -e # Exit on error

# Build Tauri application
echo "🔨 Building Tauri app..."
pnpm run build || exit 1
cargo tauri build || exit 1
echo "✅ Build complete"
```

**Instructions** :
```
1. Review the script content
2. Make it executable: chmod +x build_generated.sh
3. Run: ./build_generated.sh
4. Check build artifacts in dist/ or target/
```

### 3.5 Reporting

```typescript
// Générer rapport de session
const report = VisualDevOps.generateReport('session');

console.log('Actions totales:', report.summary.total_actions);
console.log('Actions réussies:', report.summary.successful);
console.log('Erreurs corrigées:', report.errors_fixed);
console.log('Scripts générés:', report.scripts_generated);
console.log('Métriques sécurité:', report.safety_metrics);
```

---

## 4. LOCAL AGENT ENGINE

### 4.1 Analyse de projet

**Analyser projet actuel** :

```typescript
const projectRoot = process.cwd();
const analysis = await LocalAgent.analyzeProject(projectRoot);

console.log('Type de projet:', analysis.project_type); // 'tauri_app'
console.log('Technologies:', analysis.detected_technologies);
console.log('Health score:', analysis.health_score); // 0-100
console.log('Issues:', analysis.issues);
console.log('Recommandations:', analysis.recommendations);
```

**Résultat** :
```json
{
  "project_root": "/home/user/TITANE_INFINITY",
  "project_type": "tauri_app",
  "detected_technologies": [
    { "name": "react", "version": "18.2.0", "detected_from": "package.json" },
    { "name": "tauri", "version": "1.5.0", "detected_from": "Cargo.toml" },
    { "name": "rust", "detected_from": "Cargo.toml" },
    { "name": "vite", "version": "5.0.0", "detected_from": "package.json" }
  ],
  "dependencies": {
    "outdated_packages": [],
    "security_vulnerabilities": []
  },
  "build_config": {
    "build_tool": "tauri",
    "build_command": "GO_FOR_PROD_BUILD__TITANE_INFINITY=YES corepack pnpm exec tauri build --config src-tauri/tauri.conf.json",
    "output_directory": "src-tauri/target/release"
  },
  "test_config": {
    "test_framework": "vitest",
    "test_command": "pnpm test",
    "coverage_enabled": true
  },
  "health_score": 95,
  "issues": [],
  "recommendations": [
    {
      "category": "performance",
      "priority": "medium",
      "title": "Optimize Tauri build",
      "description": "Enable production optimizations for smaller bundle size",
      "estimated_impact": "30-50% smaller binary size"
    }
  ]
}
```

### 4.2 Actions DevOps

#### Build

```typescript
// Générer action de build
const buildAction = await LocalAgent.generateBuildAction();

console.log('Description:', buildAction.description);
console.log('Commandes:', buildAction.commands);

// Commandes générées :
// 1. rm -rf src-tauri/target/release
// 2. GO_FOR_PROD_BUILD__TITANE_INFINITY=YES corepack pnpm exec tauri build --config src-tauri/tauri.conf.json
```

**Exécution manuelle** :
```bash
# L'utilisateur copie/colle les commandes
rm -rf src-tauri/target/release
GO_FOR_PROD_BUILD__TITANE_INFINITY=YES corepack pnpm exec tauri build --config src-tauri/tauri.conf.json
```

#### Test

```typescript
// Générer action de test
const testAction = await LocalAgent.generateTestAction();

console.log('Framework:', testAction.description); // "Run vitest tests"
console.log('Commandes:', testAction.commands);

// Commandes :
// 1. pnpm test
// 2. pnpm run test:coverage (si coverage activé)
```

#### Deploy

```typescript
// Générer action de déploiement
const deployAction = await LocalAgent.generateDeployAction();

console.log('Description:', deployAction.description);
console.log('Validation requise:', deployAction.validation_required); // true
console.log('Commandes:', deployAction.commands);
```

### 4.3 Génération de pipeline

**Créer pipeline build → test → deploy** :

```typescript
const pipeline = await LocalAgent.generatePipeline(
  'CI/CD Pipeline',
  ['build', 'test', 'deploy']
);

console.log('Pipeline:', pipeline.name);
console.log('Stages:', pipeline.stages);
console.log('Durée estimée:', pipeline.estimated_duration); // "5-15 minutes"

// Fichier de config généré
console.log('Config:', pipeline.config_files[0].content);
```

**Fichier `.titane/pipeline.json`** :
```json
{
  "name": "CI/CD Pipeline",
  "stages": [
    {
      "name": "build",
      "commands": [
        { "command": "rm", "args": ["-rf", "dist"] },
        { "command": "npm", "args": ["run", "tauri:build"] }
      ],
      "dependencies": [],
      "allow_failure": false,
      "timeout": "10 minutes"
    },
    {
      "name": "test",
      "commands": [
        { "command": "npm", "args": ["test"] }
      ],
      "dependencies": ["build"],
      "allow_failure": false,
      "timeout": "10 minutes"
    },
    {
      "name": "deploy",
      "commands": [
        { "command": "echo", "args": ["Tauri artifacts ready"] }
      ],
      "dependencies": ["test"],
      "allow_failure": true,
      "timeout": "10 minutes"
    }
  ]
}
```

### 4.4 Workflows automatisés

**Créer workflow récurrent** :

```typescript
// Workflow : build + test automatique
const workflow = await LocalAgent.createWorkflow(
  'Auto Build & Test',
  ['build', 'test'],
  [
    {
      type: 'file_change',
      pattern: 'src/**/*.ts',
      description: 'Trigger on TypeScript file changes'
    }
  ]
);

console.log('Workflow créé:', workflow.id);
console.log('Status:', workflow.status); // 'paused' (require activation)
console.log('Steps:', workflow.steps.length); // 2
```

**Activer workflow** :
```typescript
// Workflow reste en pause jusqu'à activation explicite
// (pour sécurité)
workflow.status = 'active';
```

### 4.5 Health Check

**Vérifier santé du projet** :

```typescript
const healthCheck = await LocalAgent.performHealthCheck();

console.log('Santé globale:', healthCheck.overall_health); // 0-100
console.log('Santé dépendances:', healthCheck.checks.dependencies_health);
console.log('Santé build:', healthCheck.checks.build_health);
console.log('Santé tests:', healthCheck.checks.test_health);
console.log('Santé sécurité:', healthCheck.checks.security_health);
console.log('Issues:', healthCheck.issues);
```

---

## 5. RÈGLES DE SÉCURITÉ

### Principes inviolables

1. **AUCUNE exécution automatique**
   - TITANE génère, l'utilisateur exécute
   - Validation humaine OBLIGATOIRE pour actions sensibles

2. **Vérifications systématiques**
   - Pas de sudo sans avertissement
   - Pas de suppression fichiers sans confirmation
   - Scripts analysés pour commandes dangereuses

3. **Niveaux de sécurité**
   - `strict` (défaut) : Validation pour tout
   - `moderate` : Validation pour actions sensibles
   - `permissive` : Validation minimale (déconseillé)

4. **Transparence totale**
   - Chaque action décrite clairement
   - Scripts complets affichés
   - Risques explicités

### Vérifications automatiques

```typescript
// Les security_checks sont effectués automatiquement
const action = await VisualDevOps.proposeAction(analysis, 'deploy');

for (const check of action.security_checks) {
  console.log(`[${check.status}] ${check.check_type}: ${check.message}`);
  if (check.recommendation) {
    console.log(`   ⚠️  ${check.recommendation}`);
  }
}
```

**Exemple de checks** :
```
[passed] no_sudo_required: No elevated privileges required
[warning] no_file_deletion: Action may delete files
   ⚠️  Backup important files before proceeding
[passed] validated_source: Script appears safe
```

---

## 6. EXEMPLES D'UTILISATION

### Exemple 1 : Correction erreur Rust

**Scénario** : L'utilisateur voit erreur de compilation

```typescript
// 1. Capturer écran (ou fournir contexte textuel)
const analysis = await VisualDevOps.analyzeScreen(
  undefined, // Pas d'image
  'error[E0425]: cannot find value `foo` in this scope\n  --> src/main.rs:42:15'
);

// 2. Analyser
console.log(analysis.diagnosis.summary);
// "Found 1 error(s)"

// 3. Proposer fix
const fixAction = await VisualDevOps.proposeAction(analysis, 'fix_error');

// 4. Afficher patch
console.log('Patch suggéré:');
console.log(fixAction.code_patch.patched_code);

// 5. Utilisateur valide et applique manuellement
await VisualDevOps.validateAction(fixAction.id, true);

// 6. Marquer comme appliqué
await VisualDevOps.markActionExecuted(fixAction.id, true);
```

### Exemple 2 : Build optimisé

```typescript
// 1. Analyser projet
const project = await LocalAgent.analyzeProject(process.cwd());

// 2. Vérifier recommandations
for (const rec of project.recommendations) {
  if (rec.category === 'performance') {
    console.log(`💡 ${rec.title}: ${rec.description}`);
  }
}

// 3. Générer script d'optimisation
const optimizeAction = await VisualDevOps.proposeAction(
  { context_type: 'code_editor' } as any,
  'optimize'
);

// 4. Récupérer script
const script = optimizeAction.script_generated;

// 5. Sauvegarder dans fichier
// (l'utilisateur fait ceci manuellement)
console.log('Sauvegarder ce script dans:', script.file_path);
console.log(script.content);

// 6. Exécuter
console.log('Instructions:', script.usage_instructions);
```

### Exemple 3 : Pipeline CI/CD local

```typescript
// 1. Créer pipeline complet
const pipeline = await LocalAgent.generatePipeline(
  'Full CI/CD',
  ['build', 'test', 'deploy']
);

// 2. Sauvegarder config
const configFile = pipeline.config_files[0];
console.log('Créer fichier:', configFile.file_path);
console.log(configFile.content);

// 3. Exécuter manuellement chaque stage
for (const stage of pipeline.stages) {
  console.log(`\n📦 Stage: ${stage.name}`);
  for (const cmd of stage.commands) {
    const fullCmd = `${cmd.command} ${cmd.args.join(' ')}`;
    console.log(`   $ ${fullCmd}`);
    console.log(`   (${cmd.description})`);
  }
}

// 4. L'utilisateur copie/colle les commandes dans terminal
```

### Exemple 4 : Workflow automatisé (avec validation)

```typescript
// 1. Créer workflow de test continu
const workflow = await LocalAgent.createWorkflow(
  'Continuous Testing',
  ['test'],
  [
    {
      type: 'file_change',
      pattern: 'src/**/*.{ts,tsx}',
      description: 'Run tests when source files change'
    }
  ]
);

// 2. Afficher validation points
for (const vp of workflow.validation_points) {
  console.log(`Validation requise au step ${vp.step_number}: ${vp.message}`);
}

// 3. Activer workflow (avec confirmation)
console.log('Activer workflow ? (y/n)');
// Si utilisateur accepte :
workflow.status = 'active';

// 4. Workflow reste en pause jusqu'à validation manuelle à chaque exécution
```

---

## 7. WORKFLOWS AUTOMATISÉS

### Structure d'un workflow

```typescript
interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  triggers: PipelineTrigger[];      // Quand déclencher
  steps: AutomationStep[];          // Quoi faire
  validation_points: ValidationPoint[]; // Où valider
  safety_level: 'safe' | 'moderate' | 'risky';
  status: 'active' | 'paused' | 'disabled';
}
```

### Exemple : Watch + Build + Test

```typescript
const workflow = await LocalAgent.createWorkflow(
  'Watch, Build & Test',
  ['build', 'test'],
  [
    {
      type: 'file_change',
      pattern: 'src/**/*',
      description: 'Watch all source files'
    }
  ]
);

// Workflow steps générés :
// Step 1: Build
//   - rm -rf dist/
//   - pnpm run build
//   - Validation: Non (safe)
// Step 2: Test
//   - pnpm test
//   - Validation: Non (safe)

console.log('Workflow créé avec', workflow.steps.length, 'steps');
console.log('Safety level:', workflow.safety_level); // 'safe'
```

### Gestion des workflows

```typescript
// Lister tous les workflows
const workflows = LocalAgent.getAllWorkflows();
for (const wf of workflows) {
  console.log(`[${wf.status}] ${wf.name} (${wf.steps.length} steps)`);
}

// Récupérer workflow spécifique
const wf = LocalAgent.getWorkflow('workflow-id-123');

// Pause workflow
if (wf) {
  wf.status = 'paused';
}

// Désactiver workflow
if (wf) {
  wf.status = 'disabled';
}
```

---

## 8. DÉPANNAGE

### Problème : Analyse d'écran échoue

**Symptôme** : `analyzeScreen()` retourne confidence faible

```typescript
const analysis = await VisualDevOps.analyzeScreen(imageBase64);
console.log('Confidence:', analysis.confidence); // < 0.5
```

**Solutions** :
1. Vérifier qualité de l'image (résolution, netteté)
2. Fournir contexte textuel en complément
3. Utiliser captures ciblées (erreur, code uniquement)

```typescript
// Avec contexte
const analysis = await VisualDevOps.analyzeScreen(
  imageBase64,
  'Erreur Rust: cannot find value `foo`'
);
```

### Problème : Projet non reconnu

**Symptôme** : `project_type = 'unknown'`

```typescript
const project = await LocalAgent.analyzeProject(projectRoot);
console.log(project.project_type); // 'unknown'
```

**Solutions** :
1. Vérifier présence de `package.json` ou `Cargo.toml`
2. Analyser depuis racine du projet
3. Installer dépendances manquantes

```bash
# Créer package.json si manquant
npm init -y

# Ou Cargo.toml
cargo init
```

### Problème : Actions bloquées en "pending"

**Symptôme** : Actions ne passent jamais à "validated"

```typescript
const action = await VisualDevOps.proposeAction(analysis, 'build');
console.log(action.status); // Reste 'pending'
```

**Solutions** :
1. Valider explicitement l'action
2. Vérifier si validation requise

```typescript
// Valider
await VisualDevOps.validateAction(action.id, true);

// Puis marquer comme exécutée
await VisualDevOps.markActionExecuted(action.id, true);
```

### Problème : Security checks échouent

**Symptôme** : `security_checks` contiennent des "failed"

```typescript
const action = await VisualDevOps.proposeAction(analysis, 'deploy');
const failed = action.security_checks.filter(c => c.status === 'failed');
console.log('Failed checks:', failed);
```

**Solutions** :
1. Lire recommandations de chaque check
2. Modifier niveau de sécurité (si approprié)
3. Rejeter l'action si trop risquée

```typescript
// Lire recommandations
for (const check of failed) {
  console.log(`⚠️  ${check.message}`);
  if (check.recommendation) {
    console.log(`   Solution: ${check.recommendation}`);
  }
}

// Rejeter si nécessaire
await VisualDevOps.validateAction(action.id, false, 'Too risky');
```

### Problème : Workflows ne se déclenchent pas

**Symptôme** : Workflow créé mais jamais exécuté

```typescript
const wf = LocalAgent.getWorkflow('workflow-id');
console.log(wf.status); // 'paused'
```

**Solutions** :
1. Vérifier statut (doit être 'active')
2. Vérifier triggers (file_change, manual, etc.)
3. Implémenter logique de watch (hors TITANE)

```typescript
// Activer
wf.status = 'active';

// Note : Le déclenchement automatique (file watchers)
// doit être implémenté côté application/système
// TITANE génère seulement la configuration
```

---

## 📚 RÉFÉRENCE RAPIDE

### VisualDevOpsEngine

| Méthode | Description |
|---------|-------------|
| `enable()` | Activer mode Visual DevOps |
| `disable()` | Désactiver et sauvegarder session |
| `analyzeScreen(image?, context?)` | Analyser capture d'écran |
| `proposeAction(analysis, actionType)` | Proposer action DevOps |
| `validateAction(id, approved, note?)` | Valider/rejeter action |
| `markActionExecuted(id, success, output?)` | Marquer action exécutée |
| `generateReport(period)` | Générer rapport |
| `getStats()` | Obtenir statistiques |

### LocalAgentEngine

| Méthode | Description |
|---------|-------------|
| `enable()` | Activer Local Agent |
| `disable()` | Désactiver et pauser workflows |
| `analyzeProject(root)` | Analyser projet complet |
| `generateBuildAction()` | Générer action de build |
| `generateTestAction()` | Générer action de test |
| `generateDeployAction()` | Générer action de déploiement |
| `generatePipeline(name, stages)` | Générer pipeline CI/CD |
| `createWorkflow(name, actions, triggers?)` | Créer workflow automatisé |
| `performHealthCheck()` | Vérifier santé du projet |
| `getStats()` | Obtenir statistiques |

### ActionTypes supportés

- `build` - Build projet
- `test` - Run tests
- `deploy` - Déploiement
- `fix_error` - Correction erreur
- `optimize` - Optimisation
- `refactor` - Refactoring
- `migrate` - Migration
- `install_deps` - Installation dépendances
- `generate_script` - Génération script
- `create_pipeline` - Création pipeline
- `analyze_logs` - Analyse logs
- `setup_env` - Setup environnement
- `clean_artifacts` - Nettoyage artifacts
- `update_config` - Mise à jour config
- `run_command` - Exécution commande

---

## 🔒 SÉCURITÉ - RAPPEL

**TITANE ne peut PAS** :
- ❌ Exécuter commandes système automatiquement
- ❌ Modifier fichiers sans validation
- ❌ Accéder au réseau sans autorisation
- ❌ Contourner sécurité OS/Tauri

**TITANE peut** :
- ✅ Analyser visuellement
- ✅ Diagnostiquer problèmes
- ✅ Générer scripts/commandes
- ✅ Proposer solutions
- ✅ Attendre validation humaine
- ✅ Guider l'utilisateur

**Toujours** :
- Lire les scripts générés
- Vérifier les security_checks
- Sauvegarder avant modifications sensibles
- Rejeter actions suspectes

---

## 📞 SUPPORT

Pour questions ou problèmes :
- Documentation complète : `docs/API_REFERENCE_v26.0.md`
- Architecture : `ARCHITECTURE_v∞.md`
- Changelog : `CHANGELOG_v26.0.md`

---

**TITANE∞ v26.0** — Visual DevOps + Local Agent
© 2025 TITANE Team. All rights reserved.
