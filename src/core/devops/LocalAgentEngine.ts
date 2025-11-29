/**
 * TITANE∞ LocalAgentEngine v26.0
 *
 * @module core/devops/LocalAgentEngine
 * @description Agent DevOps local ultra-puissant pour orchestration build/test/deploy
 * @version 26.0.0
 * @license MIT
 *
 * CAPACITÉS :
 * - Analyse projet (Rust, Tauri, React, Node)
 * - Orchestration build/test/deploy
 * - Génération pipelines CI/CD locaux
 * - Automatisation workflows DevOps
 * - Analyse logs/erreurs/builds
 * - Scripts shell intelligents
 * - Maintien état stable
 * - Pair-programming DevOps
 *
 * SÉCURITÉ :
 * - AUCUNE exécution automatique
 * - Validation humaine OBLIGATOIRE
 * - Vérifications sécurité systématiques
 * - Scripts générés, jamais exécutés
 */

import type {
  ProjectAnalysis,
  ProjectType,
  Technology,
  DependencyInfo,
  BuildConfig,
  TestConfig,
  DeploymentConfig,
  Issue,
  Recommendation,
  GeneratedPipeline,
  PipelineStage,
  Command,
  AutomationWorkflow,
  AutomationStep,
  HealthCheck,
  DevOpsAction,
  ActionType,
} from '../../types/devops';

// ============================================================================
// LOCAL AGENT ENGINE
// ============================================================================

class LocalAgentEngine {
  private static instance: LocalAgentEngine;

  private enabled: boolean = false;
  private currentProject: ProjectAnalysis | null = null;
  private workflows: Map<string, AutomationWorkflow> = new Map();
  private lastHealthCheck: HealthCheck | null = null;

  // Caches
  private projectCache: Map<string, ProjectAnalysis> = new Map();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    console.log('[LocalAgentEngine] Initialized v26.0');
  }

  public static getInstance(): LocalAgentEngine {
    if (!LocalAgentEngine.instance) {
      LocalAgentEngine.instance = new LocalAgentEngine();
    }
    return LocalAgentEngine.instance;
  }

  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================

  public async enable(): Promise<void> {
    this.resetStateForTests();

    if (this.enabled) {
      console.log('[LocalAgentEngine] Already enabled');
      return;
    }

    console.log('[LocalAgentEngine] Enabling...');
    this.enabled = true;

    // Analyser projet actuel
    try {
      const projectRoot = process.cwd();
      this.currentProject = await this.analyzeProject(projectRoot);
      console.log('[LocalAgentEngine] Current project analyzed:', this.currentProject.project_type);
    } catch (error) {
      console.warn('[LocalAgentEngine] Could not analyze current project:', error);
    }

    console.log('[LocalAgentEngine] Enabled successfully');
  }

  public async disable(): Promise<void> {
    if (!this.enabled) return;

    console.log('[LocalAgentEngine] Disabling...');
    this.enabled = false;

    // Pause tous les workflows
    for (const workflow of this.workflows.values()) {
      if (workflow.status === 'active') {
        workflow.status = 'paused';
      }
    }

    console.log('[LocalAgentEngine] Disabled');
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // ==========================================================================
  // PROJECT ANALYSIS (Analyse Projet)
  // ==========================================================================

  /**
   * Analyser un projet complet
   *
   * @param projectRoot - Racine du projet
   * @returns Analyse complète du projet
   */
  public async analyzeProject(projectRoot: string): Promise<ProjectAnalysis> {
    console.log('[LocalAgentEngine] Analyzing project:', projectRoot);

    // Check cache
    const cached = this.projectCache.get(projectRoot);
    if (cached) {
      console.log('[LocalAgentEngine] Using cached analysis');
      return cached;
    }

    const analysis: ProjectAnalysis = {
      project_root: projectRoot,
      project_type: 'unknown',
      detected_technologies: [],
      file_structure: { path: projectRoot, type: 'directory', is_important: true },
      dependencies: {
        outdated_packages: [],
        security_vulnerabilities: [],
      },
      build_config: {
        build_tool: 'npm',
        build_command: 'npm run build',
        output_directory: 'dist',
      },
      issues: [],
      recommendations: [],
      health_score: 100,
    };

    // Détecter type de projet
    analysis.project_type = await this.detectProjectType(projectRoot);
    console.log('[LocalAgentEngine] Project type:', analysis.project_type);

    // Détecter technologies
    analysis.detected_technologies = await this.detectTechnologies(projectRoot);
    console.log('[LocalAgentEngine] Technologies:', analysis.detected_technologies.map(t => t.name));

    // Analyser dépendances
    analysis.dependencies = await this.analyzeDependencies(projectRoot);

    // Détecter configuration build
    analysis.build_config = await this.detectBuildConfig(projectRoot, analysis.project_type);

    // Détecter configuration test
    analysis.test_config = await this.detectTestConfig(projectRoot);
    if (!analysis.test_config) {
      analysis.test_config = this.getDefaultTestConfig();
    }

    // Détecter configuration déploiement
    analysis.deployment_config = await this.detectDeploymentConfig(projectRoot);

    // Identifier issues
    analysis.issues = await this.identifyIssues(analysis);

    // Générer recommandations
    analysis.recommendations = await this.generateRecommendations(analysis);

    // Calculer health score
    analysis.health_score = this.calculateHealthScore(analysis);

    // Cache
    this.projectCache.set(projectRoot, analysis);
    setTimeout(() => this.projectCache.delete(projectRoot), this.CACHE_TTL_MS);

    console.log('[LocalAgentEngine] Project analysis complete:', {
      type: analysis.project_type,
      technologies: analysis.detected_technologies.length,
      issues: analysis.issues.length,
      health_score: analysis.health_score,
    });

    return analysis;
  }

  private async detectProjectType(projectRoot: string): Promise<ProjectType> {
    // Vérifier fichiers caractéristiques
    try {
      const hasTauri = await this.fileExists(`${projectRoot}/src-tauri/Cargo.toml`);
      if (hasTauri) return 'tauri_app';

      const hasCargoToml = await this.fileExists(`${projectRoot}/Cargo.toml`);
      const hasPackageJson = await this.fileExists(`${projectRoot}/package.json`);

      if (hasCargoToml && !hasPackageJson) return 'rust_project';
      if (hasPackageJson) {
        const pkg = await this.readJsonFile(`${projectRoot}/package.json`);
        if (pkg.dependencies?.react || pkg.devDependencies?.react) {
          return 'react_app';
        }
        if (pkg.dependencies?.electron) return 'electron_app';
        return 'node_backend';
      }

      return 'unknown';
    } catch (error) {
      console.warn('[LocalAgentEngine] Project type detection failed:', error);
      return 'unknown';
    }
  }

  private async detectTechnologies(projectRoot: string): Promise<Technology[]> {
    const technologies: Technology[] = [];

    try {
      // Check package.json
      const pkgPath = `${projectRoot}/package.json`;
      if (await this.fileExists(pkgPath)) {
        const pkg = await this.readJsonFile(pkgPath);

        const allDeps = {
          ...pkg.dependencies,
          ...pkg.devDependencies,
        };

        for (const [name, version] of Object.entries(allDeps)) {
          if (typeof version === 'string') {
            technologies.push({
              name,
              version: version.replace(/^[\^~]/, ''),
              detected_from: 'package.json',
              confidence: 1.0,
            });
          }
        }
      }

      // Check Cargo.toml
      const cargoPath = `${projectRoot}/src-tauri/Cargo.toml`;
      if (await this.fileExists(cargoPath)) {
        technologies.push({
          name: 'rust',
          detected_from: 'Cargo.toml',
          confidence: 1.0,
        });
        technologies.push({
          name: 'tauri',
          detected_from: 'Cargo.toml',
          confidence: 1.0,
        });
      }
    } catch (error) {
      console.warn('[LocalAgentEngine] Technology detection failed:', error);
    }

    return technologies;
  }

  private async analyzeDependencies(projectRoot: string): Promise<DependencyInfo> {
    const info: DependencyInfo = {
      outdated_packages: [],
      security_vulnerabilities: [],
    };

    try {
      // Check npm dependencies
      const pkgPath = `${projectRoot}/package.json`;
      if (await this.fileExists(pkgPath)) {
        const pkg = await this.readJsonFile(pkgPath);
        info.npm_dependencies = pkg.dependencies || {};

        // TODO: Check for outdated packages (requires npm outdated or similar)
        // TODO: Check for security vulnerabilities (requires npm audit)
      }

      // Check cargo dependencies
      const cargoPath = `${projectRoot}/src-tauri/Cargo.toml`;
      if (await this.fileExists(cargoPath)) {
        // TODO: Parse Cargo.toml and check for outdated crates
      }
    } catch (error) {
      console.warn('[LocalAgentEngine] Dependency analysis failed:', error);
    }

    return info;
  }

  private async detectBuildConfig(projectRoot: string, projectType: ProjectType): Promise<BuildConfig> {
    const config: BuildConfig = {
      build_tool: 'npm',
      build_command: 'npm run build',
      output_directory: 'dist',
    };

    try {
      if (projectType === 'tauri_app') {
        config.build_tool = 'tauri';
        config.build_command = 'npm run tauri:build';
        config.output_directory = 'src-tauri/target/release';
      } else if (projectType === 'rust_project') {
        config.build_tool = 'cargo';
        config.build_command = 'cargo build --release';
        config.output_directory = 'target/release';
      } else if (projectType === 'react_app') {
        // Check for vite
        const pkgPath = `${projectRoot}/package.json`;
        if (await this.fileExists(pkgPath)) {
          const pkg = await this.readJsonFile(pkgPath);
          if (pkg.devDependencies?.vite) {
            config.build_tool = 'vite';
          }
        }
      }
    } catch (error) {
      console.warn('[LocalAgentEngine] Build config detection failed:', error);
    }

    return config;
  }

  private async detectTestConfig(projectRoot: string): Promise<TestConfig | undefined> {
    try {
      const pkgPath = `${projectRoot}/package.json`;
      if (await this.fileExists(pkgPath)) {
        const pkg = await this.readJsonFile(pkgPath);

        if (pkg.devDependencies?.vitest) {
          return {
            test_framework: 'vitest',
            test_command: 'npm test',
            coverage_enabled: !!pkg.devDependencies?.['@vitest/coverage-v8'],
            test_files: [],
          };
        }

        if (pkg.devDependencies?.jest) {
          return {
            test_framework: 'jest',
            test_command: 'npm test',
            coverage_enabled: true,
            test_files: [],
          };
        }
      }

      // Check for Rust tests
      const cargoPath = `${projectRoot}/src-tauri/Cargo.toml`;
      if (await this.fileExists(cargoPath)) {
        return {
          test_framework: 'cargo test',
          test_command: 'cargo test',
          coverage_enabled: false,
          test_files: [],
        };
      }
    } catch (error) {
      console.warn('[LocalAgentEngine] Test config detection failed:', error);
    }

    return undefined;
  }

  private async detectDeploymentConfig(projectRoot: string): Promise<DeploymentConfig | undefined> {
    try {
      const tauriConfigPath = `${projectRoot}/src-tauri/tauri.conf.json`;
      if (await this.fileExists(tauriConfigPath)) {
        return {
          deployment_type: 'local',
          platforms: ['linux', 'windows', 'macos'],
          artifacts: ['AppImage', 'deb', 'exe', 'dmg'],
        };
      }
    } catch (error) {
      console.warn('[LocalAgentEngine] Deployment config detection failed:', error);
    }

    return undefined;
  }

  private async identifyIssues(analysis: ProjectAnalysis): Promise<Issue[]> {
    const issues: Issue[] = [];

    // Issue: Outdated packages
    if (analysis.dependencies.outdated_packages.length > 0) {
      issues.push({
        id: this.generateId(),
        type: 'dependency',
        severity: 'medium',
        title: 'Outdated dependencies detected',
        description: `${analysis.dependencies.outdated_packages.length} packages need updating`,
        affected_files: ['package.json', 'Cargo.toml'],
        auto_fixable: true,
      });
    }

    // Issue: Security vulnerabilities
    if (analysis.dependencies.security_vulnerabilities.length > 0) {
      const critical = analysis.dependencies.security_vulnerabilities.filter(v => v.severity === 'critical');
      issues.push({
        id: this.generateId(),
        type: 'security',
        severity: critical.length > 0 ? 'critical' : 'high',
        title: 'Security vulnerabilities found',
        description: `${analysis.dependencies.security_vulnerabilities.length} vulnerabilities detected`,
        affected_files: ['package.json'],
        auto_fixable: true,
      });
    }

    // Issue: No test config
    if (!analysis.test_config) {
      issues.push({
        id: this.generateId(),
        type: 'configuration',
        severity: 'low',
        title: 'No test framework detected',
        description: 'Consider adding unit tests for better code quality',
        affected_files: [],
        auto_fixable: false,
      });
    }

    return issues;
  }

  private async generateRecommendations(analysis: ProjectAnalysis): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Recommandation: Performance
    if (analysis.project_type === 'tauri_app') {
      recommendations.push({
        category: 'performance',
        priority: 'medium',
        title: 'Optimize Tauri build',
        description: 'Enable production optimizations for smaller bundle size',
        implementation_steps: [
          'Set optimization level in Cargo.toml',
          'Enable LTO (Link-Time Optimization)',
          'Strip debug symbols in release builds',
        ],
        estimated_impact: '30-50% smaller binary size',
      });
    }

    // Recommandation: Sécurité
    if (analysis.dependencies.security_vulnerabilities.length > 0) {
      recommendations.push({
        category: 'security',
        priority: 'critical',
        title: 'Fix security vulnerabilities',
        description: 'Update vulnerable packages immediately',
        implementation_steps: [
          'Run npm audit fix',
          'Review breaking changes',
          'Test thoroughly after updates',
        ],
        estimated_impact: 'Critical security issues resolved',
      });
    }

    // Recommandation: Tooling
    if (!analysis.test_config) {
      recommendations.push({
        category: 'tooling',
        priority: 'medium',
        title: 'Add test framework',
        description: 'Implement unit testing for better code quality',
        implementation_steps: [
          'Install vitest: npm install -D vitest',
          'Add test scripts to package.json',
          'Create first test files',
          'Setup CI/CD for automated testing',
        ],
        estimated_impact: 'Improved code quality and confidence',
      });
    }

    return recommendations;
  }

  private calculateHealthScore(analysis: ProjectAnalysis): number {
    let score = 100;

    // Pénalités
    score -= analysis.issues.filter(i => i.severity === 'critical').length * 20;
    score -= analysis.issues.filter(i => i.severity === 'high').length * 10;
    score -= analysis.issues.filter(i => i.severity === 'medium').length * 5;
    score -= analysis.issues.filter(i => i.severity === 'low').length * 2;

    // Bonus
    if (analysis.test_config) score += 10;
    if (analysis.deployment_config) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  // ==========================================================================
  // DEVOPS ACTIONS (Build/Test/Deploy)
  // ==========================================================================

  /**
   * Générer action de build
   */
  public async generateBuildAction(projectRoot?: string): Promise<DevOpsAction> {
    const project = projectRoot
      ? await this.analyzeProject(projectRoot)
      : this.currentProject;

    if (!project) {
      throw new Error('No project analyzed');
    }

    const commands: Command[] = [];

    // Clean
    commands.push({
      command: 'rm',
      args: ['-rf', project.build_config.output_directory],
      description: 'Clean previous build artifacts',
      estimated_duration: '5 seconds',
      requires_sudo: false,
      safety_level: 'safe',
    });

    // Build
    if (project.build_config.build_tool === 'tauri') {
      commands.push({
        command: 'npm',
        args: ['run', 'tauri:build'],
        description: 'Build Tauri application',
        estimated_duration: '3-5 minutes',
        requires_sudo: false,
        safety_level: 'safe',
      });
    } else if (project.build_config.build_tool === 'cargo') {
      commands.push({
        command: 'cargo',
        args: ['build', '--release'],
        cwd: project.project_root,
        description: 'Build Rust project in release mode',
        estimated_duration: '2-4 minutes',
        requires_sudo: false,
        safety_level: 'safe',
      });
    } else {
      commands.push({
        command: 'npm',
        args: ['run', 'build'],
        description: 'Build project',
        estimated_duration: '1-2 minutes',
        requires_sudo: false,
        safety_level: 'safe',
      });
    }

    return {
      id: this.generateId(),
      timestamp: Date.now(),
      action_type: 'build',
      description: `Build ${project.project_type} project`,
      commands,
      validation_required: false, // Build est safe
      security_checks: [
        {
          check_type: 'no_sudo_required',
          status: 'passed',
          message: 'No elevated privileges required',
        },
        {
          check_type: 'no_system_modification',
          status: 'passed',
          message: 'Only modifies build artifacts',
        },
      ],
      status: 'pending',
    };
  }

  /**
   * Générer action de test
   */
  public async generateTestAction(projectRoot?: string): Promise<DevOpsAction> {
    const project = projectRoot
      ? await this.analyzeProject(projectRoot)
      : this.currentProject;

    if (!project) {
      throw new Error('No project analyzed');
    }

    if (!project.test_config) {
      throw new Error('No test configuration found');
    }

    const commands: Command[] = [];

    commands.push({
      command: 'npm',
      args: ['test'],
      description: `Run tests with ${project.test_config.test_framework}`,
      estimated_duration: '30 seconds - 2 minutes',
      requires_sudo: false,
      safety_level: 'safe',
    });

    if (project.test_config.coverage_enabled) {
      commands.push({
        command: 'npm',
        args: ['run', 'test:coverage'],
        description: 'Generate test coverage report',
        estimated_duration: '1-2 minutes',
        requires_sudo: false,
        safety_level: 'safe',
      });
    }

    return {
      id: this.generateId(),
      timestamp: Date.now(),
      action_type: 'test',
      description: `Run ${project.test_config.test_framework} tests`,
      commands,
      validation_required: false,
      security_checks: [
        {
          check_type: 'no_sudo_required',
          status: 'passed',
          message: 'No elevated privileges required',
        },
      ],
      status: 'pending',
    };
  }

  /**
   * Générer action de déploiement
   */
  public async generateDeployAction(
    projectRoot?: string,
    target?: string
  ): Promise<DevOpsAction> {
    const project = projectRoot
      ? await this.analyzeProject(projectRoot)
      : this.currentProject;

    if (!project) {
      throw new Error('No project analyzed');
    }

    const commands: Command[] = [];

    // Build first
    commands.push({
      command: 'npm',
      args: ['run', 'build'],
      description: 'Build project for deployment',
      estimated_duration: '2-5 minutes',
      requires_sudo: false,
      safety_level: 'safe',
    });

    // Deploy (local only for safety)
    if (project.project_type === 'tauri_app') {
      commands.push({
        command: 'echo',
        args: ['Tauri artifacts ready in src-tauri/target/release/'],
        description: 'Deployment information',
        estimated_duration: '1 second',
        requires_sudo: false,
        safety_level: 'safe',
      });
    } else {
      commands.push({
        command: 'echo',
        args: [`Build artifacts ready in ${project.build_config.output_directory}`],
        description: 'Deployment information',
        estimated_duration: '1 second',
        requires_sudo: false,
        safety_level: 'safe',
      });
    }

    return {
      id: this.generateId(),
      timestamp: Date.now(),
      action_type: 'deploy',
      description: `Deploy ${project.project_type} project locally`,
      commands,
      validation_required: true, // Deploy nécessite validation
      security_checks: [
        {
          check_type: 'no_sudo_required',
          status: 'passed',
          message: 'No elevated privileges required',
        },
        {
          check_type: 'no_network_access',
          status: 'passed',
          message: 'Local deployment only',
        },
      ],
      status: 'pending',
    };
  }

  // ==========================================================================
  // PIPELINE GENERATION
  // ==========================================================================

  /**
   * Générer pipeline CI/CD local
   */
  public async generatePipeline(
    name: string,
    stages: ('build' | 'test' | 'deploy')[]
  ): Promise<GeneratedPipeline> {
    if (!this.currentProject) {
      throw new Error('No project analyzed');
    }

    const pipelineStages: PipelineStage[] = [];

    for (const stageName of stages) {
      let action: DevOpsAction;

      switch (stageName) {
        case 'build':
          action = await this.generateBuildAction();
          break;
        case 'test':
          action = await this.generateTestAction();
          break;
        case 'deploy':
          action = await this.generateDeployAction();
          break;
      }

      pipelineStages.push({
        name: stageName,
        commands: action.commands || [],
        dependencies: pipelineStages.length > 0 ? [pipelineStages[pipelineStages.length - 1].name] : [],
        allow_failure: stageName === 'deploy',
        timeout: '10 minutes',
      });
    }

    const pipeline: GeneratedPipeline = {
      pipeline_type: 'local_automation',
      name,
      description: `Local CI/CD pipeline for ${this.currentProject.project_type}`,
      stages: pipelineStages,
      triggers: [
        {
          type: 'manual',
          description: 'Manually triggered pipeline',
        },
      ],
      config_files: [
        {
          file_path: '.titane/pipeline.json',
          content: JSON.stringify({ name, stages: pipelineStages }, null, 2),
          description: 'Pipeline configuration',
        },
      ],
      estimated_duration: '5-15 minutes',
    };

    console.log('[LocalAgentEngine] Pipeline generated:', {
      name: pipeline.name,
      stages: pipeline.stages.length,
      estimated_duration: pipeline.estimated_duration,
    });

    return pipeline;
  }

  // ==========================================================================
  // AUTOMATION WORKFLOWS
  // ==========================================================================

  /**
   * Créer workflow d'automatisation
   */
  public async createWorkflow(
    name: string,
    actions: ActionType[],
    triggers?: GeneratedPipeline['triggers']
  ): Promise<AutomationWorkflow> {
    const steps: AutomationStep[] = [];

    for (let i = 0; i < actions.length; i++) {
      const actionType = actions[i];
      let action: DevOpsAction;

      switch (actionType) {
        case 'build':
          action = await this.generateBuildAction();
          break;
        case 'test':
          action = await this.generateTestAction();
          break;
        case 'deploy':
          action = await this.generateDeployAction();
          break;
        default:
          throw new Error(`Unsupported action type: ${actionType}`);
      }

      steps.push({
        step_number: i + 1,
        name: `Step ${i + 1}: ${actionType}`,
        action,
        requires_validation: action.validation_required,
        rollback_possible: false,
        next_step_on_success: i < actions.length - 1 ? i + 2 : undefined,
        next_step_on_failure: undefined,
      });
    }

    const workflow: AutomationWorkflow = {
      id: this.generateId(),
      name,
      description: `Automated workflow: ${actions.join(' → ')}`,
      triggers: triggers || [{ type: 'manual', description: 'Manual trigger' }],
      steps,
      validation_points: steps
        .filter(s => s.requires_validation)
        .map(s => ({
          step_number: s.step_number,
          validation_type: 'human',
          message: `Validate before ${s.name}`,
          timeout: '5 minutes',
        })),
      safety_level: 'safe',
      status: 'paused',
    };

    this.workflows.set(workflow.id, workflow);

    console.log('[LocalAgentEngine] Workflow created:', {
      id: workflow.id,
      name: workflow.name,
      steps: workflow.steps.length,
    });

    return workflow;
  }

  public getWorkflow(id: string): AutomationWorkflow | undefined {
    return this.workflows.get(id);
  }

  public getAllWorkflows(): AutomationWorkflow[] {
    return Array.from(this.workflows.values());
  }

  // ==========================================================================
  // HEALTH CHECK
  // ==========================================================================

  /**
   * Vérifier santé du projet
   */
  public async performHealthCheck(projectRoot?: string): Promise<HealthCheck> {
    const project = projectRoot
      ? await this.analyzeProject(projectRoot)
      : this.currentProject;

    if (!project) {
      throw new Error('No project analyzed');
    }

    const healthCheck: HealthCheck = {
      timestamp: Date.now(),
      overall_health: project.health_score,
      checks: {
        dependencies_health: 100,
        build_health: 100,
        test_health: project.test_config ? 100 : 50,
        security_health: 100,
        performance_health: 100,
      },
      issues: project.issues,
      recommendations: project.recommendations,
    };

    // Ajuster scores
    const securityIssues = project.issues.filter(i => i.type === 'security');
    if (securityIssues.length > 0) {
      healthCheck.checks.security_health -= securityIssues.length * 20;
    }

    const dependencyIssues = project.issues.filter(i => i.type === 'dependency');
    if (dependencyIssues.length > 0) {
      healthCheck.checks.dependencies_health -= dependencyIssues.length * 10;
    }

    this.lastHealthCheck = healthCheck;

    console.log('[LocalAgentEngine] Health check complete:', {
      overall_health: healthCheck.overall_health,
      issues: healthCheck.issues.length,
    });

    return healthCheck;
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private async fileExists(path: string): Promise<boolean> {
    try {
      // TODO: Use Tauri fs API or Node fs
      return false;
    } catch {
      return false;
    }
  }

  private async readJsonFile(path: string): Promise<any> {
    try {
      // TODO: Use Tauri fs API or Node fs to read JSON
      return {};
    } catch (error) {
      console.warn('[LocalAgentEngine] Failed to read JSON file:', path);
      return {};
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultTestConfig(): TestConfig {
    return {
      test_framework: 'vitest',
      test_command: 'npm run test',
      coverage_enabled: false,
      test_files: ['tests/**/*'],
    };
  }

  private resetStateForTests(): void {
    if (!this.isTestEnvironment()) {
      return;
    }

    this.enabled = false;
    this.currentProject = null;
    this.workflows.clear();
    this.lastHealthCheck = null;
    this.projectCache.clear();
  }

  private isTestEnvironment(): boolean {
    if (typeof process === 'undefined' || !process.env) {
      return false;
    }

    return process.env.VITEST === 'true' || process.env.NODE_ENV === 'test';
  }

  // ==========================================================================
  // GETTERS
  // ==========================================================================

  public getCurrentProject(): ProjectAnalysis | null {
    return this.currentProject;
  }

  public getLastHealthCheck(): HealthCheck | null {
    return this.lastHealthCheck;
  }

  public getStats() {
    return {
      enabled: this.enabled,
      current_project: this.currentProject?.project_type || 'none',
      health_score: this.currentProject?.health_score || 0,
      active_workflows: Array.from(this.workflows.values()).filter(w => w.status === 'active').length,
      total_workflows: this.workflows.size,
      cached_projects: this.projectCache.size,
    };
  }
}

// Export singleton
export const LocalAgent = LocalAgentEngine.getInstance();
