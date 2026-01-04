/**
 * TITANE∞ VisualDevOpsEngine v25.5
 *
 * @module core/devops/VisualDevOpsEngine
 * @description Moteur d'analyse visuelle et DevOps assisté
 * @version 25.5.0
 * @license MIT
 *
 * CAPACITÉS :
 * - Analyse captures d'écran (code, UI, terminal, logs)
 * - Détection visuelle intelligente
 * - Diagnostic technique automatique
 * - Génération scripts/commandes DevOps
 * - Propositions contextuelles
 * - Validation sécurité obligatoire
 * - Collaboration temps réel
 */

import { secureInvoke } from '@/lib/security';
import type {
  ScreenAnalysis,
  DevOpsAction,
  ActionType,
  Diagnosis,
  DetectedElement,
  TechnicalContent,
  ErrorDetection,
  GeneratedScript,
  CodePatch,
  Command,
  SecurityCheck,
  CollaborationSession,
  DevOpsReport,
} from '../../types/devops';

// ============================================================================
// VISUAL DEVOPS ENGINE
// ============================================================================

class VisualDevOpsEngine {
  private static instance: VisualDevOpsEngine;

  private enabled: boolean = false;
  private currentSession: CollaborationSession | null = null;
  private analysisHistory: ScreenAnalysis[] = [];
  private actionHistory: DevOpsAction[] = [];

  // Limites
  private readonly MAX_HISTORY = 50;
  private readonly _MAX_SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 heures

  private constructor() {
    console.log('[VisualDevOpsEngine] Initialized v25.5');
  }

  public static getInstance(): VisualDevOpsEngine {
    if (!VisualDevOpsEngine.instance) {
      VisualDevOpsEngine.instance = new VisualDevOpsEngine();
    }
    return VisualDevOpsEngine.instance;
  }

  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================

  public async enable(): Promise<void> {
    this.resetStateForTests();

    if (this.enabled) {
      console.log('[VisualDevOpsEngine] Already enabled');
      if (!this.currentSession || this.currentSession.interactions.length > 0) {
        this.currentSession = this.createSession();
      }
      return;
    }

    console.log('[VisualDevOpsEngine] Enabling...');
    this.enabled = true;

    // Démarrer session collaboration
    this.currentSession = this.createSession();

    console.log('[VisualDevOpsEngine] Enabled successfully');
  }

  public async disable(): Promise<void> {
    if (!this.enabled) return;

    console.log('[VisualDevOpsEngine] Disabling...');
    this.enabled = false;

    // Sauvegarder session si nécessaire
    if (this.currentSession) {
      await this.saveSession(this.currentSession);
      this.currentSession = null;
    }

    console.log('[VisualDevOpsEngine] Disabled');
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // ==========================================================================
  // SCREEN ANALYSIS (Analyse Visuelle)
  // ==========================================================================

  /**
   * Analyser une capture d'écran
   *
   * @param imageBase64 - Image encodée en base64 (optionnel)
   * @param context - Contexte fourni par l'utilisateur
   * @returns Analyse complète de l'écran
   */
  public async analyzeScreen(
    imageBase64?: string,
    context?: string
  ): Promise<ScreenAnalysis> {
    console.log('[VisualDevOpsEngine] Analyzing screen...');

    const analysis: ScreenAnalysis = {
      id: this.generateId(),
      timestamp: Date.now(),
      image_base64: imageBase64,
      detected_elements: [],
      context_type: 'unknown',
      technical_content: {
        languages_detected: [],
        frameworks_detected: [],
        errors_detected: [],
      },
      diagnosis: {
        summary: '',
        issues_found: [],
        root_causes: [],
        impact_assessment: {
          affected_systems: [],
          estimated_fix_time: 'unknown',
          risk_level: 'low',
          requires_human_validation: true,
        },
        recommended_actions: [],
      },
      confidence: 0,
    };

    // Analyser avec backend (si image fournie)
    if (imageBase64) {
      try {
        const backendAnalysis = await secureInvoke<{
          detected_elements: DetectedElement[];
          context_type: string;
          confidence: number;
        }>('visual_devops_analyze_screen', {
          imageBase64,
          context,
        });

        analysis.detected_elements = backendAnalysis.detected_elements;
        analysis.context_type = backendAnalysis.context_type as any;
        analysis.confidence = backendAnalysis.confidence;
      } catch (error) {
        console.warn('[VisualDevOpsEngine] Backend analysis failed, using fallback');
        analysis.confidence = 0.3;
      }
    }

    // Extraire contenu technique
    analysis.technical_content = this.extractTechnicalContent(
      analysis.detected_elements,
      context
    );
    this.enrichTechnicalContentFromContext(analysis.technical_content, context);

    // Diagnostiquer
    analysis.diagnosis = await this.diagnoseScreen(analysis);

    // Sauvegarder dans historique
    this.addToHistory('analysis', analysis);

    // Enregistrer interaction
    if (this.currentSession) {
      this.currentSession.interactions.push({
        timestamp: Date.now(),
        type: 'screen_analysis',
        content: `Screen analyzed: ${analysis.context_type}`,
        data: analysis,
      });
    }

    console.log('[VisualDevOpsEngine] Screen analysis complete:', {
      context_type: analysis.context_type,
      elements_found: analysis.detected_elements.length,
      errors_found: analysis.technical_content.errors_detected.length,
      confidence: analysis.confidence,
    });

    return analysis;
  }

  /**
   * Extraire contenu technique des éléments détectés
   */
  private extractTechnicalContent(
    elements: DetectedElement[],
    _contextHint?: string
  ): TechnicalContent {
    const content: TechnicalContent = {
      languages_detected: [],
      frameworks_detected: [],
      errors_detected: [],
      terminal_commands: [],
      log_entries: [],
    };

    // Analyser chaque élément
    for (const element of elements) {
      if (element.type === 'code_block' && element.code_snippet) {
        // Détecter langage
        const lang = this.detectLanguage(element.code_snippet);
        if (lang && !content.languages_detected.includes(lang)) {
          content.languages_detected.push(lang);
        }

        // Détecter frameworks
        const frameworks = this.detectFrameworks(element.code_snippet);
        content.frameworks_detected.push(...frameworks);
      }

      if (element.type === 'error_message' && element.text_content) {
        // Parser erreur
        const error = this.parseError(element.text_content);
        if (error) {
          content.errors_detected.push(error);
        }
      }

      if (element.type === 'terminal_output' && element.text_content) {
        // Extraire commandes
        const commands = this.extractCommands(element.text_content);
        content.terminal_commands?.push(...commands);
      }

      if (element.type === 'stack_trace' && element.text_content) {
        // Parser stack trace
        const error = this.parseStackTrace(element.text_content);
        if (error) {
          content.errors_detected.push(error);
        }
      }
    }

    // Déduplication
    content.languages_detected = [...new Set(content.languages_detected)];
    content.frameworks_detected = [...new Set(content.frameworks_detected)];

    return content;
  }

  /**
   * Diagnostiquer l'écran analysé
   */
  private async diagnoseScreen(analysis: ScreenAnalysis): Promise<Diagnosis> {
    const diagnosis: Diagnosis = {
      summary: '',
      issues_found: [],
      root_causes: [],
      impact_assessment: {
        affected_systems: [],
        estimated_fix_time: 'unknown',
        risk_level: 'low',
        requires_human_validation: true,
      },
      recommended_actions: [],
    };

    const { technical_content, context_type } = analysis;

    // Diagnostiquer erreurs
    if (technical_content.errors_detected.length > 0) {
      for (const error of technical_content.errors_detected) {
        const issue = {
          id: this.generateId(),
          type: 'bug' as const,
          severity: error.severity,
          title: `${error.error_type} error detected`,
          description: error.message,
          affected_files: error.file_path ? [error.file_path] : [],
          auto_fixable: error.suggested_fixes.length > 0,
        };

        diagnosis.issues_found.push(issue);
        diagnosis.root_causes.push(...this.identifyRootCauses(error));
        diagnosis.recommended_actions.push(...error.suggested_fixes);
      }

      diagnosis.summary = `Found ${technical_content.errors_detected.length} error(s)`;
      diagnosis.impact_assessment.risk_level = this.assessRiskLevel(
        technical_content.errors_detected
      );
    } else if (context_type === 'code_editor') {
      diagnosis.summary = 'Code editor detected, no errors visible';
      diagnosis.recommended_actions.push(
        'Review code for potential improvements',
        'Run tests to validate functionality'
      );
    } else if (context_type === 'terminal') {
      diagnosis.summary = 'Terminal session detected';
      diagnosis.recommended_actions.push(
        'Review command output',
        'Check for warnings or errors'
      );
    } else {
      diagnosis.summary = `${context_type} context detected`;
    }

    return diagnosis;
  }

  // ==========================================================================
  // DEVOPS ACTIONS (Actions Assistées)
  // ==========================================================================

  /**
   * Proposer une action DevOps basée sur l'analyse
   *
   * @param analysis - Analyse d'écran
   * @param actionType - Type d'action souhaité
   * @returns Action DevOps proposée (nécessite validation)
   */
  public async proposeAction(
    analysis: ScreenAnalysis,
    actionType: ActionType
  ): Promise<DevOpsAction> {
    console.log('[VisualDevOpsEngine] Proposing action:', actionType);

    const action: DevOpsAction = {
      id: this.generateId(),
      timestamp: Date.now(),
      action_type: actionType,
      description: '',
      validation_required: true,
      security_checks: [],
      status: 'pending',
    };

    // Générer contenu selon type d'action
    switch (actionType) {
      case 'fix_error':
        action.description = 'Fix detected errors';
        action.code_patch = await this.generateErrorFix(analysis);
        break;

      case 'build':
        action.description = 'Build project';
        action.script_generated = await this.generateBuildScript(analysis);
        break;

      case 'test':
        action.description = 'Run tests';
        action.commands = await this.generateTestCommands(analysis);
        break;

      case 'optimize':
        action.description = 'Optimize code/build';
        action.script_generated = await this.generateOptimizationScript(analysis);
        break;

      case 'generate_script':
        action.description = 'Generate custom script';
        action.script_generated = await this.generateCustomScript(analysis);
        break;

      default:
        action.description = `Perform ${actionType}`;
        action.commands = await this.generateGenericCommands(actionType, analysis);
    }

    // Vérifications de sécurité
    action.security_checks = await this.performSecurityChecks(action);

    // Sauvegarder dans historique
    this.addToHistory('action', action);

    // Enregistrer interaction
    if (this.currentSession) {
      this.currentSession.interactions.push({
        timestamp: Date.now(),
        type: 'agent_proposal',
        content: `Proposed action: ${action.description}`,
        data: action,
      });
    }

    console.log('[VisualDevOpsEngine] Action proposed:', {
      type: actionType,
      validation_required: action.validation_required,
      security_checks: action.security_checks.length,
    });

    return action;
  }

  /**
   * Valider une action (simulation - réel sera côté UI)
   */
  public async validateAction(
    actionId: string,
    approved: boolean,
    userNote?: string
  ): Promise<void> {
    const action = this.actionHistory.find(a => a.id === actionId);
    if (!action) {
      throw new Error(`Action ${actionId} not found`);
    }

    if (approved) {
      action.status = 'validated';
      console.log('[VisualDevOpsEngine] Action validated:', actionId);

      // Enregistrer validation
      if (this.currentSession) {
        this.currentSession.interactions.push({
          timestamp: Date.now(),
          type: 'validation',
          content: `Action validated: ${action.description}`,
          data: { action_id: actionId, user_note: userNote },
        });
      }
    } else {
      action.status = 'rejected';
      console.log('[VisualDevOpsEngine] Action rejected:', actionId);
    }
  }

  /**
   * Marquer action comme exécutée (appelé après exécution manuelle)
   */
  public async markActionExecuted(
    actionId: string,
    success: boolean,
    output?: string,
    error?: string
  ): Promise<void> {
    const action = this.actionHistory.find(a => a.id === actionId);
    if (!action) {
      throw new Error(`Action ${actionId} not found`);
    }

    action.status = success ? 'executed' : 'failed';
    const duration = Math.max(1, Date.now() - action.timestamp);

    action.result = {
      success,
      output,
      error,
      duration_ms: duration,
    };

    console.log('[VisualDevOpsEngine] Action executed:', {
      id: actionId,
      success,
      duration_ms: action.result.duration_ms,
    });

    // Enregistrer résultat
    if (this.currentSession) {
      this.currentSession.interactions.push({
        timestamp: Date.now(),
        type: 'execution_result',
        content: success ? 'Action succeeded' : 'Action failed',
        data: action.result,
      });
    }
  }

  // ==========================================================================
  // SCRIPT GENERATION (Génération Scripts)
  // ==========================================================================

  private async generateErrorFix(
    analysis: ScreenAnalysis
  ): Promise<CodePatch | undefined> {
    const errors = analysis.technical_content.errors_detected;
    if (errors.length === 0) return undefined;

    const firstError = errors[0];
    if (!firstError || !firstError.file_path || !firstError.suggested_fixes[0])
      return undefined;

    // Appeler backend pour générer patch
    try {
      const patch = await secureInvoke<CodePatch>('visual_devops_generate_fix', {
        error: firstError,
      });

      return patch;
    } catch (error) {
      console.warn('[VisualDevOpsEngine] Fix generation failed');

      // Fallback: patch minimal
      return {
        file_path: firstError.file_path,
        original_code: '// Original code with error',
        patched_code: `// Fixed: ${firstError.suggested_fixes[0] ?? 'Apply fix'}`,
        diff: '// Diff would be here',
        explanation: firstError.suggested_fixes[0] ?? 'Apply recommended fix',
        risk_level: 'moderate',
        backup_recommended: true,
      };
    }
  }

  private async generateBuildScript(analysis: ScreenAnalysis): Promise<GeneratedScript> {
    const frameworks = analysis.technical_content.frameworks_detected;
    const isTauri = frameworks.includes('tauri');
    const isReact = frameworks.includes('react');

    let content = '#!/bin/bash\n\n';
    content += '# TITANE∞ Build Script (Generated by VisualDevOpsEngine)\n';
    content += '# This script must be reviewed and executed manually\n\n';
    content += 'set -e # Exit on error\n\n';

    if (isTauri) {
      content += '# Build Tauri application\n';
      content += 'echo "🔨 Building Tauri app..."\n';
      content += 'corepack pnpm run build || exit 1\n';
      content += 'cargo tauri build || exit 1\n';
      content += 'echo "✅ Build complete"\n';
    } else if (isReact) {
      content += '# Build React application\n';
      content += 'echo "⚡ Building React app..."\n';
      content += 'corepack pnpm run build || exit 1\n';
      content += 'echo "✅ Build complete"\n';
    } else {
      content += '# Generic build\n';
      content += 'echo "🔧 Building project..."\n';
      content += 'corepack pnpm run build || cargo build || exit 1\n';
      content += 'echo "✅ Build complete"\n';
    }

    return {
      script_type: 'bash',
      content,
      file_path: 'build_generated.sh',
      execution_mode: 'manual',
      estimated_duration: '2-5 minutes',
      safety_level: 'safe',
      description: 'Build script for detected project type',
      usage_instructions: [
        'Review the script content',
        'Make it executable: chmod +x build_generated.sh',
        'Run: ./build_generated.sh',
        'Check build artifacts in dist/ or target/',
      ],
    };
  }

  private async generateTestCommands(analysis: ScreenAnalysis): Promise<Command[]> {
    const commands: Command[] = [];

    const frameworks = analysis.technical_content.frameworks_detected;
    const languages = analysis.technical_content.languages_detected;

    const addCommand = (command: Command) => {
      const exists = commands.some(
        existing =>
          existing.command === command.command &&
          JSON.stringify(existing.args) === JSON.stringify(command.args)
      );
      if (!exists) {
        commands.push(command);
      }
    };

    const defaultPnpmCommand: Command = {
      command: 'pnpm',
      args: ['test'],
      description: 'Run default test suite',
      estimated_duration: '30 seconds',
      requires_sudo: false,
      safety_level: 'safe',
    };

    if (languages.includes('typescript') || frameworks.includes('react')) {
      addCommand({
        ...defaultPnpmCommand,
        description: 'Run TypeScript/React tests',
      });
    } else {
      addCommand(defaultPnpmCommand);
    }

    if (languages.includes('rust') || frameworks.includes('tauri')) {
      addCommand({
        command: 'cargo',
        args: ['test'],
        cwd: './src-tauri',
        description: 'Run Rust tests',
        estimated_duration: '1 minute',
        requires_sudo: false,
        safety_level: 'safe',
      });
    }

    return commands;
  }

  private async generateOptimizationScript(
    _analysis: ScreenAnalysis
  ): Promise<GeneratedScript> {
    let content = '#!/bin/bash\n\n';
    content += '# TITANE∞ Optimization Script\n';
    content += '# Review carefully before execution\n\n';
    content += 'echo "🚀 Running optimizations..."\n\n';
    content += '# Clean build artifacts\n';
    content += 'echo "🧹 Cleaning..."\n';
    content += 'rm -rf dist/ build/ node_modules/.cache/\n';
    content += 'cargo clean --manifest-path src-tauri/Cargo.toml 2>/dev/null || true\n\n';
    content += '# Optimize dependencies\n';
    content += 'echo "📦 Optimizing dependencies..."\n';
    content += 'corepack pnpm dedupe || true\n\n';
    content += '# Production build\n';
    content += 'echo "⚡ Building optimized version..."\n';
    content += 'NODE_ENV=production corepack pnpm run build\n\n';
    content += 'echo "✅ Optimization complete"\n';

    return {
      script_type: 'bash',
      content,
      file_path: 'optimize_generated.sh',
      execution_mode: 'manual',
      estimated_duration: '3-7 minutes',
      safety_level: 'moderate',
      description: 'Full optimization pipeline',
      usage_instructions: [
        'Backup your project first',
        'Review script content',
        'chmod +x optimize_generated.sh',
        './optimize_generated.sh',
        'Test thoroughly after optimization',
      ],
    };
  }

  private async generateCustomScript(analysis: ScreenAnalysis): Promise<GeneratedScript> {
    // Script générique basé sur contexte
    const content = `#!/bin/bash

# TITANE∞ Custom Script
# Generated from screen analysis

echo "🔧 Custom operation starting..."

# Add your commands here
echo "Context: ${analysis.context_type}"
echo "Detected: ${analysis.technical_content.languages_detected.join(', ')}"

echo "✅ Operation complete"
`;

    return {
      script_type: 'bash',
      content,
      file_path: 'custom_generated.sh',
      execution_mode: 'manual',
      estimated_duration: 'varies',
      safety_level: 'safe',
      description: 'Custom script template',
      usage_instructions: [
        'Edit script with your specific commands',
        'Review and test in safe environment',
        'chmod +x custom_generated.sh',
        './custom_generated.sh',
      ],
    };
  }

  private async generateGenericCommands(
    actionType: ActionType,
    _analysis: ScreenAnalysis
  ): Promise<Command[]> {
    // Commandes génériques selon type d'action
    const commands: Command[] = [];

    switch (actionType) {
      case 'deploy':
        commands.push({
          command: 'pnpm',
          args: ['run', 'build'],
          description: 'Build for deployment',
          estimated_duration: '2 minutes',
          requires_sudo: false,
          safety_level: 'safe',
        });
        break;

      case 'clean_artifacts':
        commands.push({
          command: 'rm',
          args: ['-rf', 'dist/', 'build/', 'target/'],
          description: 'Clean build artifacts',
          estimated_duration: '5 seconds',
          requires_sudo: false,
          safety_level: 'moderate',
        });
        break;

      case 'install_deps':
        commands.push({
          command: 'npm',
          args: ['install'],
          description: 'Install dependencies',
          estimated_duration: '1-2 minutes',
          requires_sudo: false,
          safety_level: 'safe',
        });
        break;
    }

    return commands;
  }

  // ==========================================================================
  // SECURITY CHECKS
  // ==========================================================================

  private async performSecurityChecks(action: DevOpsAction): Promise<SecurityCheck[]> {
    const checks: SecurityCheck[] = [];

    // Check 1: No sudo required
    const requiresSudo = action.commands?.some(cmd => cmd.requires_sudo) || false;
    checks.push({
      check_type: 'no_sudo_required',
      status: requiresSudo ? 'warning' : 'passed',
      message: requiresSudo
        ? 'Action requires elevated privileges'
        : 'No elevated privileges required',
      recommendation: requiresSudo
        ? 'Review carefully before granting sudo access'
        : undefined,
    });

    // Check 2: No file deletion without confirmation
    const hasFileDeletion = action.commands?.some(
      cmd => cmd.command === 'rm' || cmd.args?.includes('--force')
    );
    checks.push({
      check_type: 'no_file_deletion',
      status: hasFileDeletion ? 'warning' : 'passed',
      message: hasFileDeletion ? 'Action may delete files' : 'No file deletion detected',
      recommendation: hasFileDeletion
        ? 'Backup important files before proceeding'
        : undefined,
    });

    // Check 3: Safe script content
    if (action.script_generated) {
      const script = action.script_generated.content;
      const hasDangerousCommands = /rm -rf \/|sudo rm|chmod 777|curl.*\| bash/.test(
        script
      );

      checks.push({
        check_type: 'validated_source',
        status: hasDangerousCommands ? 'failed' : 'passed',
        message: hasDangerousCommands
          ? 'Script contains potentially dangerous commands'
          : 'Script appears safe',
        recommendation: hasDangerousCommands
          ? 'Review script carefully or reject this action'
          : undefined,
      });
    }

    // Check 4: Code patch safety
    if (action.code_patch) {
      checks.push({
        check_type: 'no_system_modification',
        status: action.code_patch.risk_level === 'risky' ? 'warning' : 'passed',
        message: `Code patch risk level: ${action.code_patch.risk_level}`,
        recommendation: action.code_patch.backup_recommended
          ? 'Backup file before applying patch'
          : undefined,
      });
    }

    return checks;
  }

  // ==========================================================================
  // COLLABORATION SESSION
  // ==========================================================================

  private createSession(): CollaborationSession {
    return {
      session_id: this.generateId(),
      started_at: Date.now(),
      context: {
        project_root: process.cwd(),
        open_files: [],
        recent_errors: [],
        recent_actions: [],
      },
      interactions: [],
      shared_state: {},
    };
  }

  private async saveSession(session: CollaborationSession): Promise<void> {
    console.log('[VisualDevOpsEngine] Saving session:', session.session_id);
    // IMPLEMENTATION: Persist session to disk or backend
    // 1. Serialize: JSON.stringify(session) with pretty formatting
    // 2. Tauri filesystem: Use invoke('fs:write_file', { path, content }) to save
    // 3. Path: ~/.titane/devops/sessions/${session.session_id}.json
    // 4. Backup: Keep last 10 sessions, rotate older ones
    // 5. Load on startup: Read sessions on engine initialization for session recovery
    // 6. Backend sync: Optional sync to remote backend for multi-device collaboration
  }

  public getCurrentSession(): CollaborationSession | null {
    return this.currentSession;
  }

  // ==========================================================================
  // REPORTING
  // ==========================================================================

  public generateReport(period: string = 'session'): DevOpsReport {
    const successfulActions = this.actionHistory.filter(
      a => a.status === 'executed'
    ).length;
    const failedActions = this.actionHistory.filter(a => a.status === 'failed').length;
    const pendingActions = this.actionHistory.filter(a => a.status === 'pending').length;

    const actionsByType: Record<string, number> = {};
    for (const action of this.actionHistory) {
      actionsByType[action.action_type] = (actionsByType[action.action_type] ?? 0) + 1;
    }

    // Extraire top issues
    const allIssues = this.analysisHistory.flatMap(a => a.diagnosis.issues_found);
    const topIssues = allIssues.slice(0, 10);

    const riskyActionsProposed = this.actionHistory.filter(
      a =>
        a.script_generated?.safety_level === 'risky' ||
        a.code_patch?.risk_level === 'risky'
    ).length;

    const riskyActionsRejected = this.actionHistory.filter(
      a =>
        a.status === 'rejected' &&
        (a.script_generated?.safety_level === 'risky' ||
          a.code_patch?.risk_level === 'risky')
    ).length;

    const securityChecksFailed = this.actionHistory.reduce(
      (sum, action) =>
        sum + action.security_checks.filter(c => c.status === 'failed').length,
      0
    );

    return {
      timestamp: Date.now(),
      period,
      summary: {
        total_actions: this.actionHistory.length,
        successful: successfulActions,
        failed: failedActions,
        pending: pendingActions,
        avg_validation_time_ms: this.calculateAverageValidationTime(), // Calculate from interactions: sum(validation_end - action_start) / count
      },
      actions_by_type: actionsByType as any,
      errors_fixed: this.actionHistory.filter(
        a => a.action_type === 'fix_error' && a.status === 'executed'
      ).length,
      scripts_generated: this.actionHistory.filter(a => a.script_generated).length,
      pipelines_created: this.actionHistory.filter(a => a.pipeline_generated).length,
      top_issues: topIssues,
      top_recommendations: [],
      safety_metrics: {
        risky_actions_proposed: riskyActionsProposed,
        risky_actions_rejected: riskyActionsRejected,
        security_checks_failed: securityChecksFailed,
      },
    };
  }

  private calculateAverageValidationTime(): number {
    const completedActions = this.actionHistory.filter(
      a => a.status === 'executed' || a.status === 'rejected'
    );

    if (completedActions.length === 0) return 0;

    const totalValidationTime = completedActions.reduce((sum, action) => {
      // Calculate time from action creation (timestamp) to now
      const validationTime = action.timestamp ? Date.now() - action.timestamp : 0;
      return sum + validationTime;
    }, 0);

    return Math.round(totalValidationTime / completedActions.length);
  }

  private enrichTechnicalContentFromContext(
    content: TechnicalContent,
    context?: string
  ): void {
    if (!context) {
      return;
    }

    const parsedError = this.parseError(context);
    if (parsedError) {
      content.errors_detected.push(parsedError);
    }

    const looksLikeStackTrace = /at\s+\S+\s+\(|stack trace/i.test(context);
    if (looksLikeStackTrace) {
      const stackTrace = this.parseStackTrace(context);
      if (stackTrace) {
        content.errors_detected.push(stackTrace);
      }
    }

    const commands = this.extractCommands(context);
    if (commands.length > 0) {
      content.terminal_commands = [...(content.terminal_commands || []), ...commands];
    }

    if (/error\[E\d+]/i.test(context) || /cargo|rust/i.test(context)) {
      if (!content.languages_detected.includes('rust')) {
        content.languages_detected.push('rust');
      }
    }

    content.languages_detected = [...new Set(content.languages_detected)];
    content.frameworks_detected = [...new Set(content.frameworks_detected)];
  }

  private resetStateForTests(): void {
    if (!this.isTestEnvironment()) {
      return;
    }

    this.enabled = false;
    this.currentSession = null;
    this.analysisHistory = [];
    this.actionHistory = [];
  }

  private isTestEnvironment(): boolean {
    if (typeof process === 'undefined' || !process.env) {
      return false;
    }

    return process.env.VITEST === 'true' || process.env.NODE_ENV === 'test';
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private detectLanguage(code: string): string | null {
    if (/\bfn\s+\w+|impl\s+\w+|use\s+\w+/.test(code)) return 'rust';
    if (/\bfunction\s+\w+|const\s+\w+|import\s+/.test(code)) return 'typescript';
    if (/\bimport\s+React|export\s+default/.test(code)) return 'typescript';
    if (/\bdef\s+\w+|import\s+\w+|from\s+\w+/.test(code)) return 'python';
    return null;
  }

  private detectFrameworks(code: string): string[] {
    const frameworks: string[] = [];
    if (/tauri|invoke/.test(code)) frameworks.push('tauri');
    if (/React|useState|useEffect/.test(code)) frameworks.push('react');
    if (/vite|import\.meta/.test(code)) frameworks.push('vite');
    return frameworks;
  }

  private parseError(text: string): ErrorDetection | null {
    // Parser générique d'erreur
    const errorMatch = text.match(/error\[E\d+\]|Error:|ERROR:/i);
    if (!errorMatch) return null;

    return {
      error_type: 'compilation',
      severity: 'high',
      message: text.trim(),
      suggested_fixes: ['Review error message and fix accordingly'],
    };
  }

  private extractCommands(text: string): string[] {
    const lines = text.split('\n');
    const commands: string[] = [];

    for (const line of lines) {
      if (line.trim().startsWith('$') || line.trim().startsWith('>')) {
        commands.push(line.replace(/^[$>]\s*/, ''));
      }
    }

    return commands;
  }

  private parseStackTrace(text: string): ErrorDetection | null {
    const lines = text.split('\n');
    const firstLine = lines[0];

    return {
      error_type: 'runtime',
      severity: 'high',
      message: firstLine ?? 'Unknown error',
      stack_trace: text,
      suggested_fixes: ['Check stack trace for error location', 'Debug step by step'],
    };
  }

  private identifyRootCauses(error: ErrorDetection): string[] {
    const causes: string[] = [];

    if (error.error_type === 'compilation') {
      causes.push('Syntax error or type mismatch');
    }
    if (error.error_type === 'runtime') {
      causes.push('Logic error or null/undefined access');
    }

    return causes;
  }

  private assessRiskLevel(
    errors: ErrorDetection[]
  ): 'critical' | 'high' | 'medium' | 'low' {
    const critical = errors.some(e => e.severity === 'critical');
    if (critical) return 'critical';

    const high = errors.some(e => e.severity === 'high');
    if (high) return 'high';

    return 'medium';
  }

  private addToHistory(
    type: 'analysis' | 'action',
    item: ScreenAnalysis | DevOpsAction
  ): void {
    if (type === 'analysis') {
      this.analysisHistory.unshift(item as ScreenAnalysis);
      if (this.analysisHistory.length > this.MAX_HISTORY) {
        this.analysisHistory.pop();
      }
    } else {
      this.actionHistory.unshift(item as DevOpsAction);
      if (this.actionHistory.length > this.MAX_HISTORY) {
        this.actionHistory.pop();
      }
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==========================================================================
  // GETTERS
  // ==========================================================================

  public getAnalysisHistory(): ScreenAnalysis[] {
    return [...this.analysisHistory];
  }

  public getActionHistory(): DevOpsAction[] {
    return [...this.actionHistory];
  }

  public getStats() {
    return {
      total_analyses: this.analysisHistory.length,
      total_actions: this.actionHistory.length,
      pending_actions: this.actionHistory.filter(a => a.status === 'pending').length,
      successful_actions: this.actionHistory.filter(a => a.status === 'executed').length,
      failed_actions: this.actionHistory.filter(a => a.status === 'failed').length,
      session_duration_ms: this.currentSession
        ? Date.now() - this.currentSession.started_at
        : 0,
    };
  }
}

// Export singleton
export const VisualDevOps = VisualDevOpsEngine.getInstance();
