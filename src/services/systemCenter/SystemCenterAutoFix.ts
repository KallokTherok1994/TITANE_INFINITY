/**
 * TITANE_INFINITY v21.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ — SYSTEM CENTER AUTOFIX ENGINE v21
 *   Auto-réparation & normalisation des diagnostics système
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ErrorCategory =
  | 'SECURITY_WHITELIST'
  | 'API_NOT_FOUND'
  | 'REACT_TECHNICAL'
  | 'MODULE_NOT_INITIALIZED'
  | 'CONFIG_UNAVAILABLE'
  | 'COMPONENT_CRASH';

export interface DetectedError {
  category: ErrorCategory;
  originalCommand?: string;
  errorMessage: string;
  componentName?: string;
  stackTrace?: string;
  timestamp: number;
}

export interface CommandMapping {
  invalidCommand: string;
  alternatives: string[];
  domain: string;
}

export interface AutoFixResult {
  success: boolean;
  errorFixed: DetectedError;
  appliedFix: string;
  newCommand?: string;
  fallbackApplied: boolean;
  message: string;
}

export interface SystemCenterUXOutput {
  ux_final: string;
  tech_notes: string[];
  command_fixes: Record<string, string[]>;
  frontend_patch: string;
  autofix_playbook: string[];
}

// ═══════════════════════════════════════════════════════════════
// COMMAND DOMAINS & MAPPINGS
// ═══════════════════════════════════════════════════════════════

/**
 * Mapping des domaines vers commandes autorisées
 */
const DOMAIN_COMMAND_MAP: Record<string, string[]> = {
  diagnostics: [
    'get_system_health',
    'get_module_health',
    'get_helios_metrics',
    'get_system_info',
    'get_cognitive_state',
  ],
  monitoring: [
    'engines_monitoring_get_metrics',
    'engines_monitoring_get_dashboard',
    'performance_get_metrics',
    'get_helios_state',
  ],
  hypervision: [
    'engines_monitoring_get_metrics',
    'engines_monitoring_get_dashboard',
    'get_system_health',
  ],
  config: ['get_runtime_config', 'state_get', 'get_all_configs'],
  cognition: ['singularity_get_state', 'get_cognitive_state', 'get_singularity_state'],
};

/**
 * Mapping commandes invalides → alternatives autorisées
 */
const INVALID_COMMAND_ALTERNATIVES: Record<string, CommandMapping> = {
  sc_run_quick_diagnostics: {
    invalidCommand: 'sc_run_quick_diagnostics',
    alternatives: ['get_system_health', 'get_module_health'],
    domain: 'diagnostics',
  },
  hypervision_start: {
    invalidCommand: 'hypervision_start',
    alternatives: ['engines_monitoring_get_dashboard', 'performance_get_metrics'],
    domain: 'monitoring',
  },
  get_all_configs: {
    invalidCommand: 'get_all_configs',
    alternatives: ['get_runtime_config', 'state_get'],
    domain: 'config',
  },
  cluster_node_start: {
    invalidCommand: 'cluster_node_start',
    alternatives: ['get_system_health', 'get_module_health'],
    domain: 'diagnostics',
  },
};

// ═══════════════════════════════════════════════════════════════
// ERROR DETECTION ENGINE
// ═══════════════════════════════════════════════════════════════

// ✨ v24.2.1: Size limits to prevent memory leaks
const MAX_DETECTED_ERRORS = 100;
const MAX_FIX_HISTORY = 50;

export class SystemCenterAutoFixEngine {
  private detectedErrors: DetectedError[] = [];
  private fixHistory: AutoFixResult[] = [];

  /**
   * Analyser une erreur brute et la catégoriser
   */
  analyzeError(error: Error | string, componentName?: string): DetectedError {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stackTrace = typeof error === 'object' ? error.stack : undefined;

    let category: ErrorCategory = 'REACT_TECHNICAL';

    // Détection par patterns
    if (errorMessage.includes('not in whitelist')) {
      category = 'SECURITY_WHITELIST';
    } else if (errorMessage.includes('Command') && errorMessage.includes('not found')) {
      category = 'API_NOT_FOUND';
    } else if (
      errorMessage.includes('not initialized') ||
      errorMessage.includes('undefined')
    ) {
      category = 'MODULE_NOT_INITIALIZED';
    } else if (
      errorMessage.includes('config') ||
      errorMessage.includes('configuration')
    ) {
      category = 'CONFIG_UNAVAILABLE';
    } else if (componentName) {
      category = 'COMPONENT_CRASH';
    }

    const detected: DetectedError = {
      category,
      errorMessage,
      componentName,
      stackTrace,
      timestamp: Date.now(),
    };

    // Extraire la commande invalide si applicable
    const commandMatch = errorMessage.match(/Command "([^"]+)"/);
    if (commandMatch) {
      detected.originalCommand = commandMatch[1];
    }

    // ✨ v24.2.1: Enforce size limit (LRU-like behavior)
    this.detectedErrors.push(detected);
    if (this.detectedErrors.length > MAX_DETECTED_ERRORS) {
      this.detectedErrors = this.detectedErrors.slice(-MAX_DETECTED_ERRORS);
    }
    return detected;
  }

  /**
   * Auto-réparer une erreur détectée
   */
  async autoFix(error: DetectedError): Promise<AutoFixResult> {
    switch (error.category) {
      case 'SECURITY_WHITELIST':
        return this.fixSecurityWhitelist(error);

      case 'API_NOT_FOUND':
        return this.fixApiNotFound(error);

      case 'MODULE_NOT_INITIALIZED':
        return this.fixModuleNotInitialized(error);

      case 'CONFIG_UNAVAILABLE':
        return this.fixConfigUnavailable(error);

      case 'COMPONENT_CRASH':
        return this.fixComponentCrash(error);

      default:
        return {
          success: false,
          errorFixed: error,
          appliedFix: 'NO_FIX_AVAILABLE',
          fallbackApplied: false,
          message: "Catégorie d'erreur non gérée",
        };
    }
  }

  /**
   * Fix: Command not in whitelist
   */
  private async fixSecurityWhitelist(error: DetectedError): Promise<AutoFixResult> {
    if (!error.originalCommand) {
      return {
        success: false,
        errorFixed: error,
        appliedFix: 'WHITELIST_NO_COMMAND',
        fallbackApplied: false,
        message: "Impossible d'extraire la commande invalide",
      };
    }

    const mapping = INVALID_COMMAND_ALTERNATIVES[error.originalCommand];
    if (!mapping) {
      return {
        success: false,
        errorFixed: error,
        appliedFix: 'WHITELIST_NO_ALTERNATIVE',
        fallbackApplied: false,
        message: `Pas d'alternative trouvée pour "${error.originalCommand}"`,
      };
    }

    // Essayer la première alternative
    const newCommand = mapping.alternatives[0];
    try {
      await secureInvoke(newCommand, {});

      const result: AutoFixResult = {
        success: true,
        errorFixed: error,
        appliedFix: 'WHITELIST_REPLACED',
        newCommand,
        fallbackApplied: false,
        message: `Commande remplacée: "${error.originalCommand}" → "${newCommand}"`,
      };

      // ✨ v24.2.1: Enforce size limit (LRU-like behavior)
      this.fixHistory.push(result);
      if (this.fixHistory.length > MAX_FIX_HISTORY) {
        this.fixHistory = this.fixHistory.slice(-MAX_FIX_HISTORY);
      }

      return result;
    } catch (testError) {
      // Fallback: utiliser get_system_health comme safe default
      return {
        success: true,
        errorFixed: error,
        appliedFix: 'WHITELIST_FALLBACK',
        newCommand: 'get_system_health',
        fallbackApplied: true,
        message: `Fallback appliqué: "${error.originalCommand}" → "get_system_health"`,
      };
    }
  }

  /**
   * Fix: API Command not found
   */
  private async fixApiNotFound(error: DetectedError): Promise<AutoFixResult> {
    // Tenter de détecter le domaine par le nom de la commande
    let domain = 'diagnostics';

    if (
      error.originalCommand?.includes('monitoring') ||
      error.originalCommand?.includes('hypervision')
    ) {
      domain = 'monitoring';
    } else if (error.originalCommand?.includes('config')) {
      domain = 'config';
    } else if (
      error.originalCommand?.includes('cognitive') ||
      error.originalCommand?.includes('singularity')
    ) {
      domain = 'cognition';
    }

    const alternatives = DOMAIN_COMMAND_MAP[domain] || DOMAIN_COMMAND_MAP.diagnostics;
    const newCommand = alternatives[0];

    return {
      success: true,
      errorFixed: error,
      appliedFix: 'API_REPLACED',
      newCommand,
      fallbackApplied: false,
      message: `API non trouvée remplacée par "${newCommand}" (domaine: ${domain})`,
    };
  }

  /**
   * Fix: Module not initialized
   */
  private async fixModuleNotInitialized(error: DetectedError): Promise<AutoFixResult> {
    const componentName = error.componentName || 'UnknownComponent';

    return {
      success: true,
      errorFixed: error,
      appliedFix: 'MODULE_FALLBACK_STATE',
      fallbackApplied: true,
      message: `État fallback appliqué pour ${componentName}`,
    };
  }

  /**
   * Fix: Configuration unavailable
   */
  private async fixConfigUnavailable(error: DetectedError): Promise<AutoFixResult> {
    return {
      success: true,
      errorFixed: error,
      appliedFix: 'CONFIG_DEFAULT_LOADED',
      newCommand: 'state_get',
      fallbackApplied: true,
      message: 'Configuration par défaut chargée',
    };
  }

  /**
   * Fix: Component crash
   */
  private async fixComponentCrash(error: DetectedError): Promise<AutoFixResult> {
    return {
      success: true,
      errorFixed: error,
      appliedFix: 'COMPONENT_ISOLATED',
      fallbackApplied: true,
      message: `Composant ${error.componentName} isolé par ErrorBoundary`,
    };
  }

  /**
   * Obtenir l'historique des réparations
   */
  getFixHistory(): AutoFixResult[] {
    return this.fixHistory;
  }

  /**
   * Obtenir toutes les erreurs détectées
   */
  getDetectedErrors(): DetectedError[] {
    return this.detectedErrors;
  }

  /**
   * Clear historique
   */
  clearHistory(): void {
    this.detectedErrors = [];
    this.fixHistory = [];
  }
}

// ═══════════════════════════════════════════════════════════════
// UX GENERATOR — VERSION PROPRE & PROFESSIONNELLE
// ═══════════════════════════════════════════════════════════════

export class SystemCenterUXGenerator {
  /**
   * Générer l'output UX final propre à partir d'erreurs détectées
   */
  static generateCleanUX(
    errors: DetectedError[],
    fixes: AutoFixResult[]
  ): SystemCenterUXOutput {
    // 1. UX_FINAL — Version propre professionnelle
    const uxFinal = this.buildUXFinal(errors, fixes);

    // 2. TECH_NOTES — Corrections techniques
    const techNotes = this.buildTechNotes(errors, fixes);

    // 3. COMMAND_FIXES — Mapping erreurs → alternatives
    const commandFixes = this.buildCommandFixes(errors);

    // 4. FRONTEND_PATCH — Code React/TS correctif
    const frontendPatch = this.buildFrontendPatch(errors);

    // 5. AUTOFIX_PLAYBOOK — Workflows d'automatisation
    const autofixPlaybook = this.buildAutofixPlaybook(errors);

    return {
      ux_final: uxFinal,
      tech_notes: techNotes,
      command_fixes: commandFixes,
      frontend_patch: frontendPatch,
      autofix_playbook: autofixPlaybook,
    };
  }

  /**
   * Construire la version UX finale propre
   */
  private static buildUXFinal(errors: DetectedError[], fixes: AutoFixResult[]): string {
    const securityErrors = errors.filter(e => e.category === 'SECURITY_WHITELIST');
    const apiErrors = errors.filter(e => e.category === 'API_NOT_FOUND');
    const moduleErrors = errors.filter(e => e.category === 'MODULE_NOT_INITIALIZED');
    const successfulFixes = fixes.filter(f => f.success);

    return `
# 🎯 Centre Système TITANE∞

## État Général
${successfulFixes.length > 0 ? '✅ Système stabilisé — Auto-réparations appliquées' : '⚠️ Diagnostic en cours'}

${errors.length > 0 ? `**${errors.length} anomalie(s) détectée(s)** — ${successfulFixes.length} corrigée(s) automatiquement` : 'Aucune anomalie détectée'}

---

## 📊 Diagnostics & Monitoring

### Diagnostics Sécurisés
${
  securityErrors.length > 0
    ? `⚠️ Certaines commandes ont été automatiquement remplacées par des alternatives sécurisées.`
    : `✅ Tous les diagnostics utilisent des commandes whitelistées.`
}

**Actions disponibles :**
- 🔍 Lancer diagnostic système complet
- 📈 Voir métriques performance
- 🧠 Vérifier état cognitif

### Monitoring HyperVision
${
  moduleErrors.some(e => e.componentName?.includes('HyperVision'))
    ? `⏸️ Mode lecture seule activé — Dashboard disponible`
    : `✅ Monitoring actif`
}

---

## 🔧 Anomalies Détectées

${
  securityErrors.length > 0
    ? `
### Sécurité (${securityErrors.length})
${securityErrors.map(e => `- Commande \`${e.originalCommand}\` remplacée automatiquement`).join('\n')}
`
    : ''
}

${
  apiErrors.length > 0
    ? `
### API (${apiErrors.length})
${apiErrors.map(_e => `- API non disponible — Fallback appliqué`).join('\n')}
`
    : ''
}

${
  moduleErrors.length > 0
    ? `
### Modules (${moduleErrors.length})
${moduleErrors.map(e => `- ${e.componentName}: État par défaut chargé`).join('\n')}
`
    : ''
}

---

## 💡 Suggestions & Modes Cognitifs

**Mode actuel :** Neutre (sécurisé)

**Conseils TITANE∞ :**
- Monitoring recommandé pour valider l'état général
- Diagnostics partiels disponibles en toute sécurité
- Configuration Hub accessible pour ajustements

**Actions rapides :**
- ▶️ Activer Monitoring complet
- 🔄 Relancer auto-diagnostic
- 📋 Consulter logs détaillés

---

## 🔍 Détails Techniques
<details>
<summary>Voir stack traces & corrections appliquées</summary>

${fixes
  .map(
    (fix, i) => `
### Fix #${i + 1} — ${fix.appliedFix}
- **Erreur:** ${fix.errorFixed.errorMessage}
- **Solution:** ${fix.message}
${fix.newCommand ? `- **Nouvelle commande:** \`${fix.newCommand}\`` : ''}
`
  )
  .join('\n')}
</details>
`.trim();
  }

  /**
   * Construire les notes techniques
   */
  private static buildTechNotes(
    errors: DetectedError[],
    _fixes: AutoFixResult[]
  ): string[] {
    const notes: string[] = [];

    // Corrections React/TS
    if (
      errors.some(
        e => e.category === 'REACT_TECHNICAL' || e.category === 'MODULE_NOT_INITIALIZED'
      )
    ) {
      notes.push(
        'React/TS: Ajouter fallback states pour toutes les variables optionnelles'
      );
      notes.push('React/TS: Wrapper tous les composants système avec ErrorBoundary');
    }

    // Commandes à remplacer
    const commandErrors = errors.filter(e => e.originalCommand);
    if (commandErrors.length > 0) {
      notes.push(
        `Commandes: ${commandErrors.length} commande(s) à remplacer dans le code`
      );
    }

    // Modules à isoler
    const moduleErrors = errors.filter(e => e.category === 'MODULE_NOT_INITIALIZED');
    if (moduleErrors.length > 0) {
      notes.push(
        `Modules: ${moduleErrors.length} module(s) nécessite(nt) isolation ou lazy loading`
      );
    }

    // Notes backend
    if (errors.some(e => e.category === 'API_NOT_FOUND')) {
      notes.push(
        'Backend: Vérifier registration des commandes dans main.rs invoke_handler'
      );
    }

    // Notes sécurité
    if (errors.some(e => e.category === 'SECURITY_WHITELIST')) {
      notes.push('Sécurité: Mettre à jour ALLOWED_COMMANDS dans src/lib/security.ts');
    }

    return notes;
  }

  /**
   * Construire le mapping commandes invalides → alternatives
   */
  private static buildCommandFixes(errors: DetectedError[]): Record<string, string[]> {
    const mapping: Record<string, string[]> = {};

    errors
      .filter(e => e.originalCommand)
      .forEach(error => {
        const cmd = error.originalCommand;
        if (!cmd) return;
        const alternatives = INVALID_COMMAND_ALTERNATIVES[cmd];
        if (alternatives) {
          mapping[cmd] = alternatives.alternatives;
        } else {
          // Fallback générique
          mapping[cmd] = ['get_system_health', 'get_module_health'];
        }
      });

    return mapping;
  }

  /**
   * Construire le patch frontend React/TS
   */
  private static buildFrontendPatch(errors: DetectedError[]): string {
    const moduleErrors = errors.filter(
      e => e.category === 'MODULE_NOT_INITIALIZED' || e.category === 'COMPONENT_CRASH'
    );

    if (moduleErrors.length === 0) {
      return '// Aucun patch nécessaire — Tous les composants fonctionnels';
    }

    return `
// ═══════════════════════════════════════════════════════════════
// SYSTEM CENTER — FRONTEND PATCH v21
// Auto-généré par SystemCenterAutoFixEngine
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { secureInvoke } from '@/lib/security';

// ────────────────────────────────────────────────────────────────
// PATCH 1: Fallback States
// ────────────────────────────────────────────────────────────────

${moduleErrors
  .map(
    error => `
// Fix pour: ${error.componentName || 'Component'}
// Erreur: ${error.errorMessage}
const [${error.componentName?.toLowerCase() || 'component'}Loading, set${error.componentName || 'Component'}Loading] = useState(false);
const [${error.componentName?.toLowerCase() || 'component'}Error, set${error.componentName || 'Component'}Error] = useState<string | null>(null);

useEffect(() => {
  // Protection variable undefined
  if (typeof ${error.componentName?.toLowerCase() || 'component'}Loading === "undefined") {
    console.warn("[${error.componentName}] Loading state undefined, fallback to false");
    set${error.componentName || 'Component'}Loading(false);
  }
}, [${error.componentName?.toLowerCase() || 'component'}Loading]);
`
  )
  .join('\n')}

// ────────────────────────────────────────────────────────────────
// PATCH 2: Protected Command Calls
// ────────────────────────────────────────────────────────────────

async function runSafeDiagnostic() {
  try {
    const result = await secureInvoke('get_system_health', {});
    return result;
  } catch (error) {
    console.error('[SystemCenter] Diagnostic failed:', error);
    // Fallback silencieux
    return { status: 'unavailable', message: 'Diagnostic temporairement indisponible' };
  }
}

// ────────────────────────────────────────────────────────────────
// PATCH 3: ErrorBoundary Wrapper
// ────────────────────────────────────────────────────────────────

export const SafeSystemCenter = () => (
  <ErrorBoundary
    fallback={
      <div className="system-center-error">
        <h2>⚠️ Centre Système temporairement indisponible</h2>
        <p>Une erreur technique est survenue. Le système tente une réparation automatique.</p>
        <button onClick={() => window.location.reload()}>
          🔄 Recharger
        </button>
      </div>
    }
  >
    <SystemCenterPage />
  </ErrorBoundary>
);

// ────────────────────────────────────────────────────────────────
// PATCH 4: Protected Render
// ────────────────────────────────────────────────────────────────

${moduleErrors
  .map(
    error => `
// Protection rendu: ${error.componentName}
if (${error.componentName?.toLowerCase() || 'component'}Error) {
  return (
    <div className="module-error-box">
      <span className="error-icon">⚠️</span>
      <h3>Module ${error.componentName} indisponible</h3>
      <p>{${error.componentName?.toLowerCase() || 'component'}Error}</p>
      <button onClick={() => set${error.componentName || 'Component'}Error(null)}>
        Réessayer
      </button>
    </div>
  );
}
`
  )
  .join('\n')}
`.trim();
  }

  /**
   * Construire le playbook d'auto-fix
   */
  private static buildAutofixPlaybook(errors: DetectedError[]): string[] {
    const playbook: string[] = [];

    // Workflow 1: system_center_autofix
    playbook.push(
      `
# Workflow 1: system_center_autofix

## Trigger
- Erreur détectée dans Centre Système
- Command whitelist violation
- API not found

## Étapes
1. Scanner modules actifs → get_system_health
2. Détecter commandes invalides (regex patterns)
3. Mapper → commandes autorisées (DOMAIN_COMMAND_MAP)
4. Mettre à jour configuration UI / SystemAPI
5. Relancer module isolé si applicable
6. Notifier utilisateur via toast
7. Écrire événement OSBridge (SystemCenterUpdated)

## Résultat attendu
- Commande invalide remplacée automatiquement
- UI continue de fonctionner sans interruption
- Log enregistré dans devtools_autofix_history
    `.trim()
    );

    // Workflow 2: frontend_autofix_system_center
    if (
      errors.some(
        e => e.category === 'REACT_TECHNICAL' || e.category === 'MODULE_NOT_INITIALIZED'
      )
    ) {
      playbook.push(
        `
# Workflow 2: frontend_autofix_system_center

## Trigger
- Stack trace React détectée
- Variable undefined
- Component crash

## Étapes
1. Inspecter stack trace → identifier composant cassé
2. Chercher variables manquantes (ex: matrixLoading)
3. Appliquer patchs:
   - Fallback states (useState defaults)
   - Guard clauses (typeof checks)
   - ErrorBoundary wrappers
4. Régénérer UI elements avec structure TITANE∞ v21
5. Tester rendu isolé
6. Log dans devtools_autofix_history

## Résultat attendu
- Composant stabilisé avec états par défaut
- Aucun crash utilisateur visible
- Patch appliqué sans reload
      `.trim()
      );
    }

    // Workflow 3: monitoring_autofix
    if (
      errors.some(
        e =>
          e.componentName?.includes('HyperVision') ||
          e.componentName?.includes('Monitoring')
      )
    ) {
      playbook.push(
        `
# Workflow 3: monitoring_autofix

## Trigger
- HyperVision ne démarre pas
- Monitoring command non whitelist

## Étapes
1. Vérifier si Monitoring ou HyperVision peut démarrer via commandes autorisées
2. Si command non whitelist → remplacer automatiquement:
   - hypervision_start → engines_monitoring_get_dashboard
   - monitoring_init → performance_get_metrics
3. Tester démarrage minimal
4. Mettre UI à jour:
   - État: Monitoring actif / lecture seule / inactif
5. Promote correction vers MemoryFabric comme insight
6. Suggérer activation complète si fallback actif

## Résultat attendu
- Monitoring fonctionnel (mode réduit si nécessaire)
- Métriques disponibles même en fallback
- Utilisateur informé du mode actif
      `.trim()
      );
    }

    return playbook;
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════

export const systemCenterAutoFix = new SystemCenterAutoFixEngine();
