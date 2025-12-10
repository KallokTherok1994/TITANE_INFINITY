/**
 * TITANE∞ LocalAgentEngine Tests
 *
 * @description Tests unitaires pour Local Agent Engine
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type {
  ProjectAnalysis,
  DevOpsAction,
  GeneratedPipeline,
  AutomationWorkflow,
  HealthCheck,
} from '../../../src/types/devops';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { LocalAgent } from '../../../src/core/devops/LocalAgentEngine';

describe('LocalAgentEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================

  describe('Lifecycle', () => {
    it('should initialize as disabled', () => {
      expect(LocalAgent.isEnabled()).toBe(false);
    });

    it('should enable successfully', async () => {
      await LocalAgent.enable();
      expect(LocalAgent.isEnabled()).toBe(true);
    });

    it('should disable successfully', async () => {
      await LocalAgent.enable();
      await LocalAgent.disable();
      expect(LocalAgent.isEnabled()).toBe(false);
    });

    it('should analyze project on enable', async () => {
      await LocalAgent.enable();

      const project = LocalAgent.getCurrentProject();
      expect(project).toBeDefined();
    });
  });

  // ==========================================================================
  // PROJECT ANALYSIS
  // ==========================================================================

  describe('analyzeProject', () => {
    beforeEach(async () => {
      await LocalAgent.enable();
    });

    it('should analyze Tauri project', async () => {
      const projectRoot = '/mock/tauri-project';

      // Mock file system checks
      const analysis = await LocalAgent.analyzeProject(projectRoot);

      expect(analysis).toBeDefined();
      expect(analysis.project_root).toBe(projectRoot);
      expect(analysis.project_type).toBeDefined();
      expect(analysis.detected_technologies).toBeInstanceOf(Array);
      expect(analysis.health_score).toBeGreaterThanOrEqual(0);
      expect(analysis.health_score).toBeLessThanOrEqual(100);
    });

    it('should detect project type', async () => {
      const analysis = await LocalAgent.analyzeProject('/mock/project');

      expect([
        'tauri_app',
        'rust_project',
        'react_app',
        'node_backend',
        'unknown',
      ]).toContain(analysis.project_type);
    });

    it('should detect technologies', async () => {
      const analysis = await LocalAgent.analyzeProject('/mock/project');

      expect(analysis.detected_technologies).toBeInstanceOf(Array);

      for (const tech of analysis.detected_technologies) {
        expect(tech.name).toBeDefined();
        expect(tech.detected_from).toBeDefined();
        expect(tech.confidence).toBeGreaterThanOrEqual(0);
        expect(tech.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('should analyze dependencies', async () => {
      const analysis = await LocalAgent.analyzeProject('/mock/project');

      expect(analysis.dependencies).toBeDefined();
      expect(analysis.dependencies.outdated_packages).toBeInstanceOf(Array);
      expect(analysis.dependencies.security_vulnerabilities).toBeInstanceOf(Array);
    });

    it('should detect build configuration', async () => {
      const analysis = await LocalAgent.analyzeProject('/mock/project');

      expect(analysis.build_config).toBeDefined();
      expect(analysis.build_config.build_tool).toBeDefined();
      expect(analysis.build_config.build_command).toBeDefined();
      expect(analysis.build_config.output_directory).toBeDefined();
    });

    it('should identify issues', async () => {
      const analysis = await LocalAgent.analyzeProject('/mock/project');

      expect(analysis.issues).toBeInstanceOf(Array);

      for (const issue of analysis.issues) {
        expect(issue.id).toBeDefined();
        expect(issue.type).toBeDefined();
        expect(issue.severity).toBeDefined();
        expect(issue.title).toBeDefined();
      }
    });

    it('should generate recommendations', async () => {
      const analysis = await LocalAgent.analyzeProject('/mock/project');

      expect(analysis.recommendations).toBeInstanceOf(Array);

      for (const rec of analysis.recommendations) {
        expect(rec.category).toBeDefined();
        expect(rec.priority).toBeDefined();
        expect(rec.title).toBeDefined();
        expect(rec.implementation_steps).toBeInstanceOf(Array);
      }
    });

    it('should calculate health score', async () => {
      const analysis = await LocalAgent.analyzeProject('/mock/project');

      expect(analysis.health_score).toBeGreaterThanOrEqual(0);
      expect(analysis.health_score).toBeLessThanOrEqual(100);
    });

    it('should cache project analysis', async () => {
      const projectRoot = '/mock/project';

      const analysis1 = await LocalAgent.analyzeProject(projectRoot);
      const analysis2 = await LocalAgent.analyzeProject(projectRoot);

      // Should return same object (cached)
      expect(analysis1).toBe(analysis2);
    });
  });

  // ==========================================================================
  // BUILD ACTION
  // ==========================================================================

  describe('generateBuildAction', () => {
    beforeEach(async () => {
      await LocalAgent.enable();
    });

    it('should generate build action', async () => {
      const action = await LocalAgent.generateBuildAction();

      expect(action.action_type).toBe('build');
      expect(action.commands).toBeInstanceOf(Array);
      expect(action.commands!.length).toBeGreaterThan(0);
      expect(action.validation_required).toBe(false); // Build is safe
      expect(action.status).toBe('pending');
    });

    it('should include clean command', async () => {
      const action = await LocalAgent.generateBuildAction();

      const cleanCommand = action.commands?.find(cmd => cmd.command === 'rm');
      expect(cleanCommand).toBeDefined();
    });

    it('should include build command', async () => {
      const action = await LocalAgent.generateBuildAction();

      const buildCommand = action.commands?.find(
        cmd => cmd.command === 'npm' || cmd.command === 'cargo'
      );
      expect(buildCommand).toBeDefined();
    });

    it('should perform security checks', async () => {
      const action = await LocalAgent.generateBuildAction();

      expect(action.security_checks).toBeInstanceOf(Array);
      expect(action.security_checks.length).toBeGreaterThan(0);

      const sudoCheck = action.security_checks.find(
        c => c.check_type === 'no_sudo_required'
      );
      expect(sudoCheck).toBeDefined();
      expect(sudoCheck?.status).toBe('passed');
    });
  });

  // ==========================================================================
  // TEST ACTION
  // ==========================================================================

  describe('generateTestAction', () => {
    beforeEach(async () => {
      await LocalAgent.enable();
    });

    it('should generate test action', async () => {
      const action = await LocalAgent.generateTestAction();

      expect(action.action_type).toBe('test');
      expect(action.commands).toBeInstanceOf(Array);
      expect(action.validation_required).toBe(false);
      expect(action.status).toBe('pending');
    });

    it('should include test command', async () => {
      const action = await LocalAgent.generateTestAction();

      const testCommand = action.commands?.find(
        cmd => cmd.command === 'npm' && cmd.args?.includes('test')
      );
      expect(testCommand).toBeDefined();
    });

    it('should throw if no test config', async () => {
      // Mock project without test config
      const project = LocalAgent.getCurrentProject();
      if (project) {
        project.test_config = undefined;
      }

      await expect(LocalAgent.generateTestAction()).rejects.toThrow(
        'No test configuration found'
      );
    });
  });

  // ==========================================================================
  // DEPLOY ACTION
  // ==========================================================================

  describe('generateDeployAction', () => {
    beforeEach(async () => {
      await LocalAgent.enable();
    });

    it('should generate deploy action', async () => {
      const action = await LocalAgent.generateDeployAction();

      expect(action.action_type).toBe('deploy');
      expect(action.commands).toBeInstanceOf(Array);
      expect(action.validation_required).toBe(true); // Deploy requires validation
      expect(action.status).toBe('pending');
    });

    it('should build before deploy', async () => {
      const action = await LocalAgent.generateDeployAction();

      const buildCommand = action.commands?.find(cmd => cmd.args?.includes('build'));
      expect(buildCommand).toBeDefined();
    });

    it('should perform security checks', async () => {
      const action = await LocalAgent.generateDeployAction();

      expect(action.security_checks).toBeInstanceOf(Array);

      const networkCheck = action.security_checks.find(
        c => c.check_type === 'no_network_access'
      );
      expect(networkCheck).toBeDefined();
    });
  });

  // ==========================================================================
  // PIPELINE GENERATION
  // ==========================================================================

  describe('generatePipeline', () => {
    beforeEach(async () => {
      await LocalAgent.enable();
    });

    it('should generate pipeline with multiple stages', async () => {
      const pipeline = await LocalAgent.generatePipeline('CI/CD Pipeline', [
        'build',
        'test',
        'deploy',
      ]);

      expect(pipeline.name).toBe('CI/CD Pipeline');
      expect(pipeline.stages).toHaveLength(3);
      expect(pipeline.pipeline_type).toBe('local_automation');
    });

    it('should create stages in correct order', async () => {
      const pipeline = await LocalAgent.generatePipeline('Test Pipeline', [
        'build',
        'test',
      ]);

      expect(pipeline.stages[0].name).toBe('build');
      expect(pipeline.stages[1].name).toBe('test');
    });

    it('should set stage dependencies', async () => {
      const pipeline = await LocalAgent.generatePipeline('Test Pipeline', [
        'build',
        'test',
        'deploy',
      ]);

      expect(pipeline.stages[0].dependencies).toHaveLength(0); // build has no deps
      expect(pipeline.stages[1].dependencies).toContain('build'); // test depends on build
      expect(pipeline.stages[2].dependencies).toContain('test'); // deploy depends on test
    });

    it('should allow deploy stage to fail', async () => {
      const pipeline = await LocalAgent.generatePipeline('Test Pipeline', [
        'build',
        'test',
        'deploy',
      ]);

      const deployStage = pipeline.stages.find(s => s.name === 'deploy');
      expect(deployStage?.allow_failure).toBe(true);
    });

    it('should generate config files', async () => {
      const pipeline = await LocalAgent.generatePipeline('Test Pipeline', ['build']);

      expect(pipeline.config_files).toHaveLength(1);
      expect(pipeline.config_files[0].file_path).toBe('.titane/pipeline.json');
      expect(pipeline.config_files[0].content).toBeDefined();
    });

    it('should set estimated duration', async () => {
      const pipeline = await LocalAgent.generatePipeline('Test Pipeline', [
        'build',
        'test',
      ]);

      expect(pipeline.estimated_duration).toBeDefined();
      expect(pipeline.estimated_duration).toContain('minute');
    });
  });

  // ==========================================================================
  // WORKFLOW CREATION
  // ==========================================================================

  describe('createWorkflow', () => {
    beforeEach(async () => {
      await LocalAgent.enable();
    });

    it('should create workflow with actions', async () => {
      const workflow = await LocalAgent.createWorkflow('Auto Build', ['build']);

      expect(workflow.name).toBe('Auto Build');
      expect(workflow.steps).toHaveLength(1);
      expect(workflow.status).toBe('paused');
    });

    it('should create workflow with triggers', async () => {
      const workflow = await LocalAgent.createWorkflow(
        'Auto Build',
        ['build'],
        [
          {
            type: 'file_change',
            pattern: 'src/**/*.ts',
            description: 'On TypeScript file changes',
          },
        ]
      );

      expect(workflow.triggers).toHaveLength(1);
      expect(workflow.triggers[0].type).toBe('file_change');
    });

    it('should set validation points', async () => {
      const workflow = await LocalAgent.createWorkflow(
        'Test Workflow',
        ['build', 'deploy'] // deploy requires validation
      );

      expect(workflow.validation_points.length).toBeGreaterThan(0);
    });

    it('should assign unique workflow ID', async () => {
      const workflow1 = await LocalAgent.createWorkflow('Workflow 1', ['build']);
      const workflow2 = await LocalAgent.createWorkflow('Workflow 2', ['test']);

      expect(workflow1.id).not.toBe(workflow2.id);
    });

    it('should store workflow', async () => {
      const workflow = await LocalAgent.createWorkflow('Test', ['build']);

      const retrieved = LocalAgent.getWorkflow(workflow.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(workflow.id);
    });

    it('should set safety level', async () => {
      const workflow = await LocalAgent.createWorkflow('Test', ['build', 'test']);

      expect(workflow.safety_level).toBe('safe');
    });
  });

  // ==========================================================================
  // WORKFLOW MANAGEMENT
  // ==========================================================================

  describe('Workflow Management', () => {
    beforeEach(async () => {
      await LocalAgent.enable();
    });

    it('should retrieve workflow by ID', async () => {
      const created = await LocalAgent.createWorkflow('Test', ['build']);

      const retrieved = LocalAgent.getWorkflow(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should return undefined for unknown workflow', () => {
      const workflow = LocalAgent.getWorkflow('unknown-id');
      expect(workflow).toBeUndefined();
    });

    it('should list all workflows', async () => {
      await LocalAgent.createWorkflow('Workflow 1', ['build']);
      await LocalAgent.createWorkflow('Workflow 2', ['test']);

      const workflows = LocalAgent.getAllWorkflows();
      expect(workflows).toHaveLength(2);
    });

    it('should pause workflows on disable', async () => {
      const workflow = await LocalAgent.createWorkflow('Test', ['build']);
      workflow.status = 'active';

      await LocalAgent.disable();

      expect(workflow.status).toBe('paused');
    });
  });

  // ==========================================================================
  // HEALTH CHECK
  // ==========================================================================

  describe('performHealthCheck', () => {
    beforeEach(async () => {
      await LocalAgent.enable();
    });

    it('should perform health check', async () => {
      const healthCheck = await LocalAgent.performHealthCheck();

      expect(healthCheck).toBeDefined();
      expect(healthCheck.timestamp).toBeGreaterThan(0);
      expect(healthCheck.overall_health).toBeGreaterThanOrEqual(0);
      expect(healthCheck.overall_health).toBeLessThanOrEqual(100);
    });

    it('should check all health aspects', async () => {
      const healthCheck = await LocalAgent.performHealthCheck();

      expect(healthCheck.checks).toBeDefined();
      expect(healthCheck.checks.dependencies_health).toBeDefined();
      expect(healthCheck.checks.build_health).toBeDefined();
      expect(healthCheck.checks.test_health).toBeDefined();
      expect(healthCheck.checks.security_health).toBeDefined();
      expect(healthCheck.checks.performance_health).toBeDefined();
    });

    it('should include issues', async () => {
      const healthCheck = await LocalAgent.performHealthCheck();

      expect(healthCheck.issues).toBeInstanceOf(Array);
    });

    it('should include recommendations', async () => {
      const healthCheck = await LocalAgent.performHealthCheck();

      expect(healthCheck.recommendations).toBeInstanceOf(Array);
    });

    it('should store last health check', async () => {
      await LocalAgent.performHealthCheck();

      const lastCheck = LocalAgent.getLastHealthCheck();
      expect(lastCheck).toBeDefined();
    });

    it('should lower health score for security issues', async () => {
      const project = LocalAgent.getCurrentProject();
      if (project) {
        // Add security issue
        project.issues.push({
          id: 'sec-1',
          type: 'security',
          severity: 'critical',
          title: 'Security vulnerability',
          description: 'Critical security issue',
          affected_files: [],
          auto_fixable: false,
        });
      }

      const healthCheck = await LocalAgent.performHealthCheck();

      expect(healthCheck.checks.security_health).toBeLessThan(100);
    });
  });

  // ==========================================================================
  // STATS
  // ==========================================================================

  describe('getStats', () => {
    beforeEach(async () => {
      await LocalAgent.enable();
    });

    it('should return current stats', () => {
      const stats = LocalAgent.getStats();

      expect(stats.enabled).toBe(true);
      expect(stats.current_project).toBeDefined();
      expect(stats.health_score).toBeGreaterThanOrEqual(0);
      expect(stats.active_workflows).toBe(0);
      expect(stats.total_workflows).toBe(0);
    });

    it('should track workflow count', async () => {
      await LocalAgent.createWorkflow('Workflow 1', ['build']);
      await LocalAgent.createWorkflow('Workflow 2', ['test']);

      const stats = LocalAgent.getStats();

      expect(stats.total_workflows).toBe(2);
    });

    it('should track active workflows', async () => {
      const workflow = await LocalAgent.createWorkflow('Test', ['build']);
      workflow.status = 'active';

      const stats = LocalAgent.getStats();

      expect(stats.active_workflows).toBe(1);
    });
  });

  // ==========================================================================
  // INTEGRATION TESTS
  // ==========================================================================

  describe('Integration', () => {
    it('should perform complete DevOps cycle', async () => {
      // 1. Enable agent
      await LocalAgent.enable();
      expect(LocalAgent.isEnabled()).toBe(true);

      // 2. Analyze project
      const project = LocalAgent.getCurrentProject();
      expect(project).toBeDefined();

      // 3. Generate build action
      const buildAction = await LocalAgent.generateBuildAction();
      expect(buildAction.action_type).toBe('build');

      // 4. Generate pipeline
      const pipeline = await LocalAgent.generatePipeline('CI/CD', ['build', 'test']);
      expect(pipeline.stages).toHaveLength(2);

      // 5. Create workflow
      const workflow = await LocalAgent.createWorkflow('Auto CI', ['build', 'test']);
      expect(workflow.steps).toHaveLength(2);

      // 6. Health check
      const healthCheck = await LocalAgent.performHealthCheck();
      expect(healthCheck.overall_health).toBeGreaterThanOrEqual(0);

      // 7. Get stats
      const stats = LocalAgent.getStats();
      expect(stats.total_workflows).toBe(1);

      // 8. Disable
      await LocalAgent.disable();
      expect(LocalAgent.isEnabled()).toBe(false);
    });
  });
});
