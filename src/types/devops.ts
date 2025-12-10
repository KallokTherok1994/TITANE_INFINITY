/**
 * TITANE∞ DevOps Types v26.0
 *
 * @module types/devops
 * @description Types pour VisualDevOpsEngine et LocalAgentEngine
 * @version 26.0.0
 * @license MIT
 */

// ============================================================================
// SCREEN ANALYSIS (Visual Understanding)
// ============================================================================

export interface ScreenAnalysis {
  id: string;
  timestamp: number;
  image_base64?: string; // Image encodée si disponible
  detected_elements: DetectedElement[];
  context_type: ContextType;
  technical_content: TechnicalContent;
  diagnosis: Diagnosis;
  confidence: number; // 0-1
}

export type ContextType =
  | 'code_editor' // VSCode, IDE
  | 'terminal' // Terminal bash/zsh
  | 'browser' // UI web
  | 'logs' // Logs applicatifs
  | 'error_screen' // Erreur compilation/runtime
  | 'ui_designer' // Figma, interface design
  | 'documentation' // Docs technique
  | 'git_interface' // Git, GitHub, GitLab
  | 'tauri_devtools' // Tauri DevTools
  | 'performance' // Profiling, metrics
  | 'unknown';

export interface DetectedElement {
  type: ElementType;
  bounding_box?: BoundingBox;
  text_content?: string;
  code_snippet?: string;
  confidence: number;
  metadata: Record<string, unknown>;
}

export type ElementType =
  | 'code_block'
  | 'error_message'
  | 'terminal_output'
  | 'ui_component'
  | 'log_entry'
  | 'file_explorer'
  | 'command_line'
  | 'stack_trace'
  | 'performance_graph'
  | 'button'
  | 'input_field'
  | 'text_label'
  | 'unknown';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TechnicalContent {
  languages_detected: string[]; // ['rust', 'typescript', 'bash']
  frameworks_detected: string[]; // ['tauri', 'react', 'vite']
  errors_detected: ErrorDetection[];
  code_structure?: CodeStructure;
  terminal_commands?: string[];
  log_entries?: LogEntry[];
}

export interface ErrorDetection {
  error_type: 'compilation' | 'runtime' | 'lint' | 'test' | 'build' | 'unknown';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  file_path?: string;
  line_number?: number;
  column_number?: number;
  stack_trace?: string;
  suggested_fixes: string[];
}

export interface CodeStructure {
  file_type: string;
  language: string;
  imports: string[];
  functions: string[];
  classes: string[];
  components: string[];
  exports: string[];
}

export interface LogEntry {
  timestamp: number;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface Diagnosis {
  summary: string;
  issues_found: Issue[];
  root_causes: string[];
  impact_assessment: ImpactAssessment;
  recommended_actions: string[];
}

export interface Issue {
  id: string;
  type:
    | 'bug'
    | 'performance'
    | 'security'
    | 'architecture'
    | 'configuration'
    | 'dependency';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affected_files: string[];
  auto_fixable: boolean;
}

export interface ImpactAssessment {
  affected_systems: string[];
  estimated_fix_time: string; // "5 minutes", "2 hours"
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  requires_human_validation: boolean;
}

// ============================================================================
// DEVOPS ACTIONS (Assisted DevOps)
// ============================================================================

export interface DevOpsAction {
  id: string;
  timestamp: number;
  action_type: ActionType;
  description: string;
  script_generated?: GeneratedScript;
  pipeline_generated?: GeneratedPipeline;
  code_patch?: CodePatch;
  commands?: Command[];
  validation_required: boolean;
  security_checks: SecurityCheck[];
  status: 'pending' | 'validated' | 'rejected' | 'executed' | 'failed';
  result?: ActionResult;
}

export type ActionType =
  | 'build'
  | 'test'
  | 'deploy'
  | 'fix_error'
  | 'optimize'
  | 'refactor'
  | 'migrate'
  | 'install_deps'
  | 'generate_script'
  | 'create_pipeline'
  | 'analyze_logs'
  | 'setup_env'
  | 'clean_artifacts'
  | 'update_config'
  | 'run_command';

export interface GeneratedScript {
  script_type: 'bash' | 'zsh' | 'powershell' | 'python' | 'node';
  content: string;
  file_path?: string; // Où sauvegarder le script
  execution_mode: 'manual' | 'assisted'; // manual = copier/coller, assisted = TITANE guide
  estimated_duration: string;
  safety_level: 'safe' | 'moderate' | 'risky';
  description: string;
  usage_instructions: string[];
}

export interface GeneratedPipeline {
  pipeline_type: 'ci_cd' | 'local_automation' | 'watch_mode' | 'build_chain';
  name: string;
  description: string;
  stages: PipelineStage[];
  triggers: PipelineTrigger[];
  config_files: ConfigFile[];
  estimated_duration: string;
}

export interface PipelineStage {
  name: string;
  commands: Command[];
  dependencies: string[]; // Noms des stages précédents
  allow_failure: boolean;
  timeout: string;
}

export interface PipelineTrigger {
  type: 'file_change' | 'time_based' | 'manual' | 'git_hook' | 'event';
  pattern?: string; // Glob pattern pour file_change
  schedule?: string; // Cron pour time_based
  description: string;
}

export interface ConfigFile {
  file_path: string;
  content: string;
  description: string;
}

export interface CodePatch {
  file_path: string;
  original_code: string;
  patched_code: string;
  diff: string;
  explanation: string;
  risk_level: 'safe' | 'moderate' | 'risky';
  backup_recommended: boolean;
}

export interface Command {
  command: string;
  args: string[];
  cwd?: string;
  env?: Record<string, string>;
  description: string;
  estimated_duration: string;
  requires_sudo: boolean;
  safety_level: 'safe' | 'moderate' | 'risky';
}

export interface SecurityCheck {
  check_type: SecurityCheckType;
  status: 'passed' | 'warning' | 'failed';
  message: string;
  recommendation?: string;
}

export type SecurityCheckType =
  | 'no_sudo_required'
  | 'no_system_modification'
  | 'no_network_access'
  | 'no_file_deletion'
  | 'safe_dependencies'
  | 'validated_source'
  | 'no_privilege_escalation';

export interface ActionResult {
  success: boolean;
  output?: string;
  error?: string;
  duration_ms: number;
  artifacts_created?: string[];
  next_actions?: string[];
}

// ============================================================================
// PROJECT ANALYSIS (Local Agent)
// ============================================================================

export interface ProjectAnalysis {
  project_root: string;
  project_type: ProjectType;
  detected_technologies: Technology[];
  file_structure: FileStructureNode;
  dependencies: DependencyInfo;
  build_config: BuildConfig;
  test_config?: TestConfig;
  deployment_config?: DeploymentConfig;
  issues: Issue[];
  recommendations: Recommendation[];
  health_score: number; // 0-100
}

export type ProjectType =
  | 'tauri_app'
  | 'rust_project'
  | 'react_app'
  | 'node_backend'
  | 'electron_app'
  | 'library'
  | 'monorepo'
  | 'mixed'
  | 'unknown';

export interface Technology {
  name: string;
  version?: string;
  detected_from: string; // "package.json", "Cargo.toml"
  confidence: number; // 0-1
}

export interface FileStructureNode {
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileStructureNode[];
  is_important: boolean; // package.json, Cargo.toml, etc.
}

export interface DependencyInfo {
  npm_dependencies?: Record<string, string>;
  cargo_dependencies?: Record<string, string>;
  outdated_packages: OutdatedPackage[];
  security_vulnerabilities: SecurityVulnerability[];
}

export interface OutdatedPackage {
  name: string;
  current_version: string;
  latest_version: string;
  breaking_changes: boolean;
}

export interface SecurityVulnerability {
  package: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  fix_available: boolean;
  recommended_version?: string;
}

export interface BuildConfig {
  build_tool: 'cargo' | 'npm' | 'pnpm' | 'vite' | 'webpack' | 'tauri' | 'mixed';
  build_command: string;
  output_directory: string;
  optimization_level?: 'dev' | 'production';
  targets?: string[]; // ["x86_64-unknown-linux-gnu"]
  features?: string[]; // Cargo features
}

export interface TestConfig {
  test_framework: string; // "vitest", "jest", "cargo test"
  test_command: string;
  coverage_enabled: boolean;
  test_files: string[];
}

export interface DeploymentConfig {
  deployment_type: 'local' | 'remote' | 'ci_cd';
  platforms: string[]; // ["linux", "windows", "macos"]
  artifacts: string[];
}

export interface Recommendation {
  category: 'performance' | 'security' | 'architecture' | 'tooling' | 'dependencies';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  implementation_steps: string[];
  estimated_impact: string;
}

// ============================================================================
// AUTOMATION (Safe Automation)
// ============================================================================

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  triggers: PipelineTrigger[];
  steps: AutomationStep[];
  validation_points: ValidationPoint[];
  safety_level: 'safe' | 'moderate' | 'risky';
  status: 'active' | 'paused' | 'disabled';
}

export interface AutomationStep {
  step_number: number;
  name: string;
  action: DevOpsAction;
  requires_validation: boolean;
  rollback_possible: boolean;
  next_step_on_success?: number;
  next_step_on_failure?: number;
}

export interface ValidationPoint {
  step_number: number;
  validation_type: 'human' | 'automated_test' | 'security_scan';
  message: string;
  timeout?: string; // "5 minutes" - après quoi l'action est annulée
}

// ============================================================================
// COLLABORATION (Pair Programming)
// ============================================================================

export interface CollaborationSession {
  session_id: string;
  started_at: number;
  context: SessionContext;
  interactions: Interaction[];
  current_focus?: string; // Fichier/task actuel
  shared_state: Record<string, unknown>;
}

export interface SessionContext {
  project_root: string;
  current_branch?: string;
  open_files: string[];
  recent_errors: ErrorDetection[];
  recent_actions: DevOpsAction[];
}

export interface Interaction {
  timestamp: number;
  type:
    | 'user_request'
    | 'screen_analysis'
    | 'agent_proposal'
    | 'validation'
    | 'execution_result';
  content: string;
  data?: unknown;
}

// ============================================================================
// DEVOPS LAYER STATE (Extension de SingularityState)
// ============================================================================

export interface DevOpsLayer {
  enabled: boolean;
  visual_mode_active: boolean;
  local_agent_active: boolean;

  // Stats
  total_actions: number;
  successful_actions: number;
  failed_actions: number;
  pending_validations: number;

  // Sécurité
  security_level: 'strict' | 'moderate' | 'permissive';
  require_validation_for: ActionType[];
  blocked_actions: ActionType[];

  // Tracking
  last_screen_analysis?: number;
  last_devops_action?: number;
  last_build?: number;
  last_test?: number;
  last_deploy?: number;

  // Collaboration
  active_session?: CollaborationSession;

  // History (last 50)
  action_history: DevOpsAction[];
  analysis_history: ScreenAnalysis[];
}

// ============================================================================
// DIAGNOSTIC & REPORTING
// ============================================================================

export interface DevOpsReport {
  timestamp: number;
  period: string; // "last 24 hours", "session"

  summary: {
    total_actions: number;
    successful: number;
    failed: number;
    pending: number;
    avg_validation_time_ms: number;
  };

  actions_by_type: Record<ActionType, number>;
  errors_fixed: number;
  scripts_generated: number;
  pipelines_created: number;

  top_issues: Issue[];
  top_recommendations: Recommendation[];

  safety_metrics: {
    risky_actions_proposed: number;
    risky_actions_rejected: number;
    security_checks_failed: number;
  };
}

export interface HealthCheck {
  timestamp: number;
  overall_health: number; // 0-100
  checks: {
    dependencies_health: number;
    build_health: number;
    test_health: number;
    security_health: number;
    performance_health: number;
  };
  issues: Issue[];
  recommendations: Recommendation[];
}
