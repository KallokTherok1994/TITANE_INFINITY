/**
 * TITANE∞ v26.3.0 — Advanced Boot Recovery System
 * © 2025 TITANE Team. All rights reserved.
 *
 * 🚀 SYSTÈME DE RÉCUPÉRATION DE BOOT AVANCÉ
 * Système intelligent de récupération automatique des erreurs de boot
 */

interface BootAttempt {
  id: string;
  timestamp: number;
  strategy: 'normal' | 'safe_mode' | 'minimal' | 'fallback' | 'emergency';
  success: boolean;
  error?: string;
  duration: number;
  userAgent: string;
  memoryUsage?: number;
}

interface BootStrategy {
  name: string;
  description: string;
  priority: number;
  timeout: number;
  fallbackDelay: number;
  execute: () => Promise<boolean>;
  requirements: string[];
}

class TitaneBootRecovery {
  private bootAttempts: BootAttempt[] = [];
  private currentStrategy: string = 'normal';
  private maxRetries: number = 5;
  private isRecovering: boolean = false;
  private emergencyMode: boolean = false;
  private bootStrategies: Map<string, BootStrategy> = new Map();

  constructor() {
    this.initializeBootStrategies();
    this.loadBootHistory();
    this.setupEmergencyHandlers();
  }

  /**
   * Initialise les stratégies de boot
   */
  private initializeBootStrategies(): void {
    const strategies: BootStrategy[] = [
      {
        name: 'normal',
        description: 'Boot normal avec tous les modules',
        priority: 1,
        timeout: 15000,
        fallbackDelay: 2000,
        requirements: [],
        execute: this.executeNormalBoot.bind(this),
      },

      {
        name: 'safe_mode',
        description: 'Mode sécurisé sans modules avancés',
        priority: 2,
        timeout: 10000,
        fallbackDelay: 1500,
        requirements: ['DOM_READY'],
        execute: this.executeSafeBoot.bind(this),
      },

      {
        name: 'minimal',
        description: 'Boot minimal avec composants essentiels uniquement',
        priority: 3,
        timeout: 8000,
        fallbackDelay: 1000,
        requirements: ['DOM_READY'],
        execute: this.executeMinimalBoot.bind(this),
      },

      {
        name: 'fallback',
        description: 'Interface de fallback sans React',
        priority: 4,
        timeout: 5000,
        fallbackDelay: 500,
        requirements: ['DOM_READY'],
        execute: this.executeFallbackBoot.bind(this),
      },

      {
        name: 'emergency',
        description: "Mode d'urgence HTML pur",
        priority: 5,
        timeout: 3000,
        fallbackDelay: 0,
        requirements: [],
        execute: this.executeEmergencyBoot.bind(this),
      },
    ];

    strategies.forEach(strategy => {
      this.bootStrategies.set(strategy.name, strategy);
    });
  }

  /**
   * Démarre le processus de boot avec récupération intelligente
   */
  public async startIntelligentBoot(): Promise<boolean> {
    console.log('🚀 [BOOT-RECOVERY] Starting intelligent boot process...');

    // Vérifier l'historique de boot pour adapter la stratégie
    const recentFailures = this.getRecentBootFailures();
    const recommendedStrategy = this.analyzeBootHistory(recentFailures);

    console.log(
      `📊 [BOOT-RECOVERY] Boot history analysis: ${recentFailures.length} recent failures, recommended strategy: ${recommendedStrategy}`
    );

    // Essayer les stratégies dans l'ordre de priorité
    const strategiesToTry = this.getBootStrategiesInOrder(recommendedStrategy);

    for (const strategyName of strategiesToTry) {
      if (this.isRecovering) {
        console.log(`🔄 [BOOT-RECOVERY] Trying strategy: ${strategyName}`);
      }

      const success = await this.attemptBootWithStrategy(strategyName);
      if (success) {
        console.log(`✅ [BOOT-RECOVERY] Boot successful with strategy: ${strategyName}`);
        this.onBootSuccess(strategyName);
        return true;
      }

      console.warn(`❌ [BOOT-RECOVERY] Strategy ${strategyName} failed, trying next...`);
    }

    // Tous les tentatives ont échoué
    console.error(
      '🚨 [BOOT-RECOVERY] All boot strategies failed, entering emergency mode'
    );
    this.enterEmergencyMode();
    return false;
  }

  /**
   * Tente un boot avec une stratégie spécifique
   */
  private async attemptBootWithStrategy(strategyName: string): Promise<boolean> {
    const strategy = this.bootStrategies.get(strategyName);
    if (!strategy) {
      console.error(`❌ [BOOT-RECOVERY] Unknown strategy: ${strategyName}`);
      return false;
    }

    const attempt: BootAttempt = {
      id: `boot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      strategy: strategyName as any,
      success: false,
      duration: 0,
      userAgent: navigator.userAgent,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || undefined,
    };

    const startTime = Date.now();

    try {
      // Vérifier les prérequis
      const requirementsMet = this.checkStrategyRequirements(strategy.requirements);
      if (!requirementsMet) {
        throw new Error(`Requirements not met for strategy: ${strategyName}`);
      }

      // Exécuter la stratégie avec timeout
      const success = await Promise.race([
        strategy.execute(),
        new Promise<boolean>((_, reject) =>
          setTimeout(() => reject(new Error('Boot timeout')), strategy.timeout)
        ),
      ]);

      attempt.success = success;
      attempt.duration = Date.now() - startTime;

      this.bootAttempts.unshift(attempt);
      this.saveBootHistory();

      if (success && strategy.fallbackDelay > 0) {
        // Attendre avant de considérer le boot comme réussi
        await new Promise(resolve => setTimeout(resolve, strategy.fallbackDelay));
      }

      return success;
    } catch (error) {
      attempt.success = false;
      attempt.error = error instanceof Error ? error.message : String(error);
      attempt.duration = Date.now() - startTime;

      this.bootAttempts.unshift(attempt);
      this.saveBootHistory();

      console.error(`❌ [BOOT-RECOVERY] Strategy ${strategyName} failed:`, error);
      return false;
    }
  }

  /**
   * Stratégies de boot spécifiques
   */
  private async executeNormalBoot(): Promise<boolean> {
    try {
      // Import dynamique pour éviter les erreurs de module
      const { createRoot } = await import('react-dom/client');

      // Importer App dynamiquement avec bon typage
      const AppModule = await import('../App');
      const App = (AppModule as any).default || AppModule.App;

      // Importer React dynamiquement avec bon typage
      const ReactModule = await import('react');
      const React = (ReactModule as any).default || ReactModule;

      // Vérifier que les modules sont correctement chargés
      if (!createRoot || !App || !React) {
        throw new Error('Failed to load core React modules');
      }

      const container = document.getElementById('root');
      if (!container) {
        throw new Error('Root container not found');
      }

      const root = createRoot(container);

      // Créer l'app avec gestion d'erreur
      const AppWithErrorBoundary = React.createElement(
        React.Suspense,
        {
          fallback: React.createElement(
            'div',
            { className: 'loading' },
            'Loading TITANE∞...'
          ),
        },
        React.createElement(App)
      );

      root.render(AppWithErrorBoundary);

      // Attendre que l'app se charge
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Vérifier que l'app est effectivement rendue
      const appElement =
        container.querySelector('[data-app-loaded="true"]') ||
        container.querySelector('.app-container') ||
        container.children.length > 0;

      return !!appElement;
    } catch (error) {
      console.error('🚨 [BOOT-RECOVERY] Normal boot failed:', error);
      return false;
    }
  }

  private async executeSafeBoot(): Promise<boolean> {
    try {
      // Boot en mode sécurisé sans modules avancés
      const { createRoot } = await import('react-dom/client');

      // Importer React avec bon typage
      const ReactModule = await import('react');
      const React = (ReactModule as any).default || ReactModule;

      // Créer une app minimaliste
      const SafeApp = React.createElement(
        'div',
        {
          className: 'safe-mode-app',
          style: { padding: '20px', fontFamily: 'monospace' },
        },
        React.createElement(
          'h1',
          { style: { color: '#00f5ff' } },
          '🛡️ TITANE∞ Safe Mode'
        ),
        React.createElement(
          'p',
          null,
          'Application running in safe mode due to boot issues.'
        ),
        React.createElement(
          'button',
          {
            onClick: () => window.location.reload(),
            style: {
              padding: '10px 20px',
              background: '#00f5ff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            },
          },
          'Retry Normal Boot'
        )
      );

      const container = document.getElementById('root');
      if (!container) return false;

      const root = createRoot(container);
      root.render(SafeApp);

      return true;
    } catch (error) {
      console.error('🚨 [BOOT-RECOVERY] Safe boot failed:', error);
      return false;
    }
  }

  private async executeMinimalBoot(): Promise<boolean> {
    try {
      const container = document.getElementById('root');
      if (!container) return false;

      // Boot minimal sans React
      container.innerHTML = `
        <div style="
          padding: 20px; 
          font-family: 'Fira Code', monospace; 
          background: linear-gradient(135deg, #000428 0%, #004e92 100%);
          color: #e0e6ed;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        ">
          <h1 style="color: #00f5ff; text-align: center; margin-bottom: 20px;">
            ⚡ TITANE∞ Minimal Mode
          </h1>
          <p style="text-align: center; margin-bottom: 30px; opacity: 0.8;">
            Running in minimal mode for maximum compatibility
          </p>
          <div style="display: flex; gap: 10px;">
            <button onclick="window.location.reload()" style="
              padding: 10px 20px;
              background: #00f5ff;
              color: #000;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-family: inherit;
            ">Retry Boot</button>
            <button onclick="localStorage.clear(); window.location.reload()" style="
              padding: 10px 20px;
              background: #ff6b6b;
              color: #000;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-family: inherit;
            ">Clear Cache & Retry</button>
          </div>
          <div style="margin-top: 30px; text-align: center; font-size: 0.9rem; opacity: 0.6;">
            Boot History: ${this.bootAttempts.length} attempts | 
            Strategy: minimal | 
            Version: v26.3.0
          </div>
        </div>
      `;

      return true;
    } catch (error) {
      console.error('🚨 [BOOT-RECOVERY] Minimal boot failed:', error);
      return false;
    }
  }

  private async executeFallbackBoot(): Promise<boolean> {
    try {
      const container = document.getElementById('root');
      if (!container) return false;

      // Interface de fallback pure HTML/CSS
      container.innerHTML = `
        <div id="fallback-interface" style="
          font-family: system-ui, -apple-system, sans-serif;
          background: #1a1a1a;
          color: #ffffff;
          height: 100vh;
          padding: 40px;
          display: flex;
          flex-direction: column;
        ">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #ff6b6b; margin-bottom: 10px;">⚠️ TITANE∞ Fallback Mode</h1>
            <p style="opacity: 0.7;">The application encountered boot issues and is running in fallback mode.</p>
          </div>
          
          <div style="
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
          ">
            <h3 style="margin: 0 0 15px 0;">🔧 Recovery Options:</h3>
            <div style="display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
              <button onclick="window.location.reload()" style="
                padding: 12px;
                background: #4ecdc4;
                color: #000;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
              ">🔄 Retry Boot</button>
              
              <button onclick="localStorage.clear(); sessionStorage.clear(); window.location.reload()" style="
                padding: 12px;
                background: #feca57;
                color: #000;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
              ">🧹 Clear All Cache</button>
              
              <button onclick="if(confirm('This will reset all TITANE∞ data. Continue?')) { localStorage.clear(); sessionStorage.clear(); indexedDB.deleteDatabase('titane-db'); window.location.reload(); }" style="
                padding: 12px;
                background: #ff6b6b;
                color: #fff;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
              ">🚨 Full Reset</button>
            </div>
          </div>
          
          <div style="
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 20px;
            flex: 1;
          ">
            <h3 style="margin: 0 0 15px 0;">📊 Boot Diagnostics:</h3>
            <pre style="
              background: rgba(0,0,0,0.3);
              padding: 15px;
              border-radius: 4px;
              font-size: 0.9rem;
              overflow-x: auto;
              white-space: pre-wrap;
            ">${this.generateBootDiagnostics()}</pre>
          </div>
        </div>
      `;

      return true;
    } catch (error) {
      console.error('🚨 [BOOT-RECOVERY] Fallback boot failed:', error);
      return false;
    }
  }

  private async executeEmergencyBoot(): Promise<boolean> {
    try {
      // Mode d'urgence absolu - HTML pur
      document.body.innerHTML = `
        <div style="
          font-family: monospace;
          background: #000;
          color: #ff0000;
          padding: 20px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        ">
          <h1>🚨 TITANE∞ EMERGENCY MODE 🚨</h1>
          <p>Critical boot failure - Emergency recovery active</p>
          <p>Please reload the page or contact support</p>
          <button onclick="window.location.reload()" style="
            margin-top: 20px;
            padding: 15px 30px;
            background: #ff0000;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1.1rem;
            font-weight: bold;
          ">EMERGENCY RELOAD</button>
          <div style="margin-top: 30px; font-size: 0.8rem; opacity: 0.7;">
            Emergency Mode Active | ${new Date().toISOString()} | Total Boot Attempts: ${this.bootAttempts.length}
          </div>
        </div>
      `;

      return true;
    } catch (error) {
      console.error('🚨 [BOOT-RECOVERY] Emergency boot failed:', error);
      // Fallback absolu
      document.body.innerHTML =
        '<h1 style="color: red; text-align: center; margin-top: 50px;">CRITICAL ERROR - PLEASE RELOAD</h1>';
      return false;
    }
  }

  /**
   * Méthodes utilitaires
   */
  private getRecentBootFailures(): BootAttempt[] {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 heures
    return this.bootAttempts.filter(
      attempt => !attempt.success && attempt.timestamp > cutoff
    );
  }

  private analyzeBootHistory(recentFailures: BootAttempt[]): string {
    if (recentFailures.length === 0) return 'normal';
    if (recentFailures.length >= 3) return 'minimal';
    if (recentFailures.length >= 2) return 'safe_mode';
    return 'normal';
  }

  private getBootStrategiesInOrder(recommended: string): string[] {
    const strategies = Array.from(this.bootStrategies.entries())
      .sort((a, b) => a[1].priority - b[1].priority)
      .map(([name]) => name);

    // Mettre la stratégie recommandée en premier
    if (recommended !== 'normal') {
      const index = strategies.indexOf(recommended);
      if (index > 0) {
        strategies.splice(index, 1);
        strategies.unshift(recommended);
      }
    }

    return strategies;
  }

  private checkStrategyRequirements(requirements: string[]): boolean {
    return requirements.every(req => {
      switch (req) {
        case 'DOM_READY':
          return document.readyState !== 'loading';
        default:
          return true;
      }
    });
  }

  private generateBootDiagnostics(): string {
    const recent = this.bootAttempts.slice(0, 5);
    const diagnostics = [
      `Boot Recovery System v26.3.0`,
      `Current Time: ${new Date().toISOString()}`,
      `User Agent: ${navigator.userAgent.substring(0, 80)}...`,
      `Memory Usage: ${(performance as any).memory?.usedJSHeapSize ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) + 'MB' : 'N/A'}`,
      `Total Boot Attempts: ${this.bootAttempts.length}`,
      `Recent Failures: ${this.getRecentBootFailures().length}`,
      `Emergency Mode: ${this.emergencyMode ? 'YES' : 'NO'}`,
      '',
      'Recent Boot Attempts:',
      ...recent.map(
        attempt =>
          `${new Date(attempt.timestamp).toLocaleTimeString()} | ${attempt.strategy.toUpperCase()} | ${attempt.success ? '✅ SUCCESS' : '❌ FAILED'} | ${attempt.duration}ms${attempt.error ? ` | ${attempt.error}` : ''}`
      ),
    ];

    return diagnostics.join('\n');
  }

  private onBootSuccess(strategy: string): void {
    this.isRecovering = false;
    this.emergencyMode = false;

    // Afficher un message de récupération réussie si ce n'était pas un boot normal
    if (strategy !== 'normal') {
      setTimeout(() => {
        console.log(
          `🎉 [BOOT-RECOVERY] Successfully recovered using ${strategy} strategy`
        );

        // Optionally show a recovery notification to the user
        const notification = document.createElement('div');
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(78, 205, 196, 0.9);
          color: #000;
          padding: 15px 20px;
          border-radius: 8px;
          z-index: 10000;
          font-family: monospace;
          font-weight: bold;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        notification.textContent = `🎉 Boot recovered using ${strategy} strategy`;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 5000);
      }, 2000);
    }
  }

  private enterEmergencyMode(): void {
    this.emergencyMode = true;
    this.executeEmergencyBoot();
  }

  private setupEmergencyHandlers(): void {
    // Handler global pour les erreurs critiques
    window.addEventListener('error', event => {
      if (
        event.error?.message?.includes('Importing a module script failed') ||
        event.error?.message?.includes('Loading chunk') ||
        event.error?.message?.includes('dynamically imported module')
      ) {
        console.error(
          '🚨 [BOOT-RECOVERY] Critical import error detected, triggering recovery'
        );
        this.isRecovering = true;
        setTimeout(() => this.startIntelligentBoot(), 100);
      }
    });

    // Handler pour les rejections de promesses
    window.addEventListener('unhandledrejection', event => {
      if (
        event.reason?.message?.includes('Loading chunk') ||
        event.reason?.message?.includes('import')
      ) {
        console.error(
          '🚨 [BOOT-RECOVERY] Critical promise rejection detected, triggering recovery'
        );
        this.isRecovering = true;
        setTimeout(() => this.startIntelligentBoot(), 100);
      }
    });
  }

  private loadBootHistory(): void {
    try {
      const stored = localStorage.getItem('titane_boot_history');
      if (stored) {
        const history = JSON.parse(stored);
        this.bootAttempts = history.slice(0, 50); // Limiter à 50 entrées
      }
    } catch (error) {
      console.warn('🔧 [BOOT-RECOVERY] Failed to load boot history:', error);
    }
  }

  private saveBootHistory(): void {
    try {
      const historyToSave = this.bootAttempts.slice(0, 50);
      localStorage.setItem('titane_boot_history', JSON.stringify(historyToSave));
    } catch (error) {
      console.warn('🔧 [BOOT-RECOVERY] Failed to save boot history:', error);
    }
  }

  /**
   * API publique
   */
  public getBootHistory(): BootAttempt[] {
    return [...this.bootAttempts];
  }

  public getBootStats(): object {
    const total = this.bootAttempts.length;
    const successful = this.bootAttempts.filter(a => a.success).length;
    const recent24h = this.bootAttempts.filter(
      a => a.timestamp > Date.now() - 24 * 60 * 60 * 1000
    );

    return {
      total_attempts: total,
      success_rate: total > 0 ? ((successful / total) * 100).toFixed(1) + '%' : 'N/A',
      recent_24h: recent24h.length,
      emergency_mode: this.emergencyMode,
      current_strategy: this.currentStrategy,
      strategies_available: Array.from(this.bootStrategies.keys()),
    };
  }

  public forceRecovery(strategy?: string): void {
    console.log(
      `🔧 [BOOT-RECOVERY] Forcing recovery${strategy ? ` with strategy: ${strategy}` : ''}`
    );
    this.isRecovering = true;

    if (strategy && this.bootStrategies.has(strategy)) {
      this.attemptBootWithStrategy(strategy);
    } else {
      this.startIntelligentBoot();
    }
  }
}

// Instance globale
export const titaneBootRecovery = new TitaneBootRecovery();

// Démarrage automatique au chargement
if (typeof window !== 'undefined') {
  // Attendre que le DOM soit prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      titaneBootRecovery.startIntelligentBoot();
    });
  } else {
    // DOM déjà prêt, démarrer immédiatement
    setTimeout(() => titaneBootRecovery.startIntelligentBoot(), 100);
  }
}

// Export des types
export type { BootAttempt, BootStrategy };
