/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ HYBRID ENGINE v∞
 *   Fusion AI Bubble + Dev Console
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Super Prompt #16 — Copilote omniprésent technique + réactif
 *
 * Unification complète de:
 * - AI Bubble Engine (chat IA)
 * - Dev Console Engine (terminal dev)
 * - Self-Healing Engine (auto-repair)
 * - Singularity Engine (introspection)
 * - Memory Eternal (contexte)
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { secureInvoke } from '@/lib/security';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type HybridMode = 'bubble' | 'console' | 'chat' | 'dev';

export type IntentType =
  | 'chat' // Question/conversation
  | 'dev' // Commande développement
  | 'heal' // Correction/patch
  | 'introspection' // Analyse système
  | 'diagnostic'; // Diagnostic technique

export interface HybridIntent {
  type: IntentType;
  confidence: number;
  keywords: string[];
  suggestedAction?: string;
}

export interface HybridCommand {
  raw: string;
  parsed: {
    action: string;
    target?: string;
    params?: Record<string, unknown>;
  };
  requiresSudo: boolean;
}

export interface HybridExecution {
  command: HybridCommand;
  output: string;
  exitCode: number;
  duration: number;
  timestamp: number;
  errors?: string[];
}

export interface DevDiagnostic {
  module: string;
  health: 'healthy' | 'warning' | 'error';
  issues: string[];
  suggestions: string[];
}

export interface AutoPatch {
  file: string;
  lineStart: number;
  lineEnd: number;
  oldCode: string;
  newCode: string;
  description: string;
  confidence: number;
}

export interface HybridState {
  mode: HybridMode;
  currentIntent: IntentType | null;
  executionHistory: HybridExecution[];
  diagnostics: DevDiagnostic[];
  pendingPatches: AutoPatch[];
  isExecuting: boolean;
  lastError: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// HYBRID ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class HybridEngine {
  private state: HybridState = {
    mode: 'bubble',
    currentIntent: null,
    executionHistory: [],
    diagnostics: [],
    pendingPatches: [],
    isExecuting: false,
    lastError: null,
  };

  private subscribers: Set<(state: HybridState) => void> = new Set();

  // ─────────────────────────────────────────────────────────────────────────
  // INTENT DETECTION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Détecte l'intention de l'utilisateur à partir du message
   */
  detectIntent(message: string): HybridIntent {
    const lower = message.toLowerCase();

    // Keywords patterns
    const devKeywords = [
      'fix',
      'patch',
      'compile',
      'build',
      'rust',
      'cargo',
      'npm',
      'install',
      'run',
      'test',
      'debug',
    ];
    const healKeywords = ['repair', 'heal', 'correct', 'bug', 'error', 'crash', 'broken'];
    const introspectionKeywords = [
      'analyze',
      'inspect',
      'diagnostic',
      'status',
      'health',
      'check',
      'scan',
    ];
    const diagnosticKeywords = ['logs', 'errors', 'warnings', 'issues', 'problems'];

    let intent: IntentType = 'chat';
    let confidence = 0.5;
    const keywords: string[] = [];

    // Check dev patterns
    if (devKeywords.some(kw => lower.includes(kw))) {
      intent = 'dev';
      confidence = 0.8;
      keywords.push(...devKeywords.filter(kw => lower.includes(kw)));
    }

    // Check heal patterns
    if (healKeywords.some(kw => lower.includes(kw))) {
      intent = 'heal';
      confidence = 0.85;
      keywords.push(...healKeywords.filter(kw => lower.includes(kw)));
    }

    // Check introspection patterns
    if (introspectionKeywords.some(kw => lower.includes(kw))) {
      intent = 'introspection';
      confidence = 0.75;
      keywords.push(...introspectionKeywords.filter(kw => lower.includes(kw)));
    }

    // Check diagnostic patterns
    if (diagnosticKeywords.some(kw => lower.includes(kw))) {
      intent = 'diagnostic';
      confidence = 0.7;
      keywords.push(...diagnosticKeywords.filter(kw => lower.includes(kw)));
    }

    // Command pattern (starts with sudo, !, >, $)
    if (/^(sudo|!|>|\$)/.test(lower)) {
      intent = 'dev';
      confidence = 0.95;
    }

    return {
      type: intent,
      confidence,
      keywords,
      suggestedAction: this.getSuggestedAction(intent),
    };
  }

  private getSuggestedAction(intent: IntentType): string {
    switch (intent) {
      case 'dev':
        return 'Execute command in dev console';
      case 'heal':
        return 'Apply auto-healing patch';
      case 'introspection':
        return 'Run system introspection';
      case 'diagnostic':
        return 'Display diagnostics and logs';
      case 'chat':
      default:
        return 'Respond with AI chat';
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COMMAND PARSING
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Parse une commande utilisateur
   */
  parseCommand(input: string): HybridCommand {
    const trimmed = input.trim();

    // Remove sudo prefix if present
    const requiresSudo = /^sudo\s+/.test(trimmed);
    const cleaned = trimmed.replace(/^(sudo|!|>|\$)\s*/, '');

    // Parse command parts
    const parts = cleaned.split(/\s+/);
    const action = parts[0] || '';
    const target = parts[1];
    const params: Record<string, unknown> = {};

    // Extract parameters (key=value pairs)
    for (let i = 2; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;
      if (part.includes('=')) {
        const splitParts = part.split('=');
        const key = splitParts[0];
        const value = splitParts[1];
        if (key && value !== undefined) {
          params[key] = value;
        }
      }
    }

    return {
      raw: input,
      parsed: {
        action,
        target,
        params: Object.keys(params).length > 0 ? params : undefined,
      },
      requiresSudo,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COMMAND EXECUTION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Exécute une commande dev
   */
  async executeCommand(command: HybridCommand): Promise<HybridExecution> {
    this.setState({ isExecuting: true, lastError: null });

    const startTime = Date.now();

    try {
      // Route vers la bonne action
      let output: string;
      const exitCode: number = 0;

      switch (command.parsed.action) {
        case 'inspect':
        case 'analyze':
          output = await this.inspectModule(command.parsed.target || 'system');
          break;

        case 'fix':
        case 'patch':
          output = await this.applyPatch(command.parsed.target || '');
          break;

        case 'logs':
          output = await this.getLogs(command.parsed.target);
          break;

        case 'diagnostic':
        case 'health':
          output = await this.runDiagnostic(command.parsed.target || 'all');
          break;

        case 'run':
        case 'exec':
          output = await this.runDevCommand(command.raw);
          break;

        default:
          // Try to execute as shell command via Tauri
          output = await this.runDevCommand(command.raw);
      }

      const execution: HybridExecution = {
        command,
        output,
        exitCode,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
      };

      // Add to history
      this.state.executionHistory.unshift(execution);
      if (this.state.executionHistory.length > 50) {
        this.state.executionHistory.pop();
      }

      this.setState({ isExecuting: false });
      this.notifySubscribers();

      return execution;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      const execution: HybridExecution = {
        command,
        output: '',
        exitCode: 1,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
        errors: [errorMessage],
      };

      this.state.executionHistory.unshift(execution);
      this.setState({ isExecuting: false, lastError: errorMessage });
      this.notifySubscribers();

      return execution;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DEV OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Inspecte un module/fichier
   */
  private async inspectModule(target: string): Promise<string> {
    try {
      const result = await secureInvoke<string>('dev_inspect_file', { path: target });
      return result;
    } catch (error) {
      return `Failed to inspect ${target}: ${error}`;
    }
  }

  /**
   * Applique un patch automatique
   */
  private async applyPatch(target: string): Promise<string> {
    try {
      const result = await secureInvoke<string>('dev_apply_patch', { file: target });
      return result;
    } catch (error) {
      return `Failed to apply patch to ${target}: ${error}`;
    }
  }

  /**
   * Récupère les logs
   */
  private async getLogs(filter?: string): Promise<string> {
    try {
      const result = await secureInvoke<string>('dev_get_logs', { filter });
      return result;
    } catch (error) {
      return `Failed to get logs: ${error}`;
    }
  }

  /**
   * Exécute diagnostic
   */
  private async runDiagnostic(target: string): Promise<string> {
    try {
      const result = await secureInvoke<string>('hybrid_analyze_code', { target });
      return result;
    } catch (error) {
      return `Failed to run diagnostic: ${error}`;
    }
  }

  /**
   * Exécute commande shell via Tauri
   */
  private async runDevCommand(command: string): Promise<string> {
    try {
      const result = await secureInvoke<string>('dev_run_command', { command });
      return result;
    } catch (error) {
      return `Command failed: ${error}`;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AUTO-HEALING
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Détecte erreurs et propose patchs
   */
  async detectIssuesAndProposePatch(_context?: string): Promise<AutoPatch[]> {
    // INTEGRATION: Self-Healing Engine connection
    // 1. Import SelfHealingEngine from '@/engines/selfHealing/SelfHealingEngine'
    // 2. Analyze error patterns: SelfHealingEngine.analyzeErrors(context)
    // 3. Generate patches: Use AST transformation (babel-parser) to create code fixes
    // 4. Validate patches: Test in isolated sandbox before applying
    // 5. Apply fixes: SelfHealingEngine.applyPatch(patch) with rollback on failure
    // 6. Log results: Audit log of successful/failed patches for learning
    // For now, return empty array
    return [];
  }

  /**
   * Applique un patch automatique
   */
  async applyAutoPatch(patch: AutoPatch): Promise<boolean> {
    try {
      await secureInvoke('dev_apply_patch', {
        file: patch.file,
        lineStart: patch.lineStart,
        lineEnd: patch.lineEnd,
        newCode: patch.newCode,
      });
      return true;
    } catch (error) {
      console.error('[HybridEngine] Failed to apply auto-patch:', error);
      return false;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DIAGNOSTICS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Exécute diagnostic complet système
   */
  async runFullDiagnostic(): Promise<DevDiagnostic[]> {
    const diagnostics: DevDiagnostic[] = [];

    try {
      const result = await secureInvoke<string>('hybrid_analyze_code', { target: 'all' });

      // Parse result (format: JSON array of diagnostics)
      const parsed = JSON.parse(result) as DevDiagnostic[];
      diagnostics.push(...parsed);
    } catch (error) {
      console.error('[HybridEngine] Diagnostic failed:', error);
    }

    this.state.diagnostics = diagnostics;
    this.notifySubscribers();

    return diagnostics;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  getState(): HybridState {
    return { ...this.state };
  }

  setState(updates: Partial<HybridState>): void {
    this.state = { ...this.state, ...updates };
    this.notifySubscribers();
  }

  subscribe(callback: (state: HybridState) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.getState()));
  }

  /**
   * Reset state
   */
  reset(): void {
    this.state = {
      mode: 'bubble',
      currentIntent: null,
      executionHistory: [],
      diagnostics: [],
      pendingPatches: [],
      isExecuting: false,
      lastError: null,
    };
    this.notifySubscribers();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const hybridEngine = new HybridEngine();
export default hybridEngine;
