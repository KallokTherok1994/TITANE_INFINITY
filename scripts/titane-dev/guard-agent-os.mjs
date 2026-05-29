import { readFileSync, existsSync } from 'fs';
import path from 'path';

const ROOT = process.cwd();

const REQUIRED_AGENTS = [
  '00_scope_sentinel.md', '01_orchestrator.md', '02_config_auditor.md',
  '03_instruction_layer_auditor.md', '04_surface_auditor.md', '05_runtime_architect.md',
  '06_frontend_refactor_DISABLED.md', '07_backend_http_rust_DISABLED.md',
  '08_test_runner.md', '09_security_guard.md', '10_documentation_agent.md', '11_reviewer.md'
];

const REQUIRED_SECTIONS = [
  '# NAME', '# MISSION', '# MODEL', '# STATUS', '# ALLOWED_SCOPE',
  '# FORBIDDEN_SCOPE', '# INPUT_CONTRACT', '# OUTPUT_CONTRACT',
  '# PROOF_CONTRACT', '# STOPLINES', '# ROLLBACK', '# VERDICT_ALLOWED'
];

const DISABLED_AGENTS = [
  '06_frontend_refactor_DISABLED.md',
  '07_backend_http_rust_DISABLED.md'
];

const AGENTS_DIR = path.join(ROOT, '.titane-dev', 'agents');

let errors = [];

for (const agent of REQUIRED_AGENTS) {
  const file = path.join(AGENTS_DIR, agent);
  if (!existsSync(file)) {
    errors.push(`MISSING_AGENT: ${agent}`);
    continue;
  }

  const content = readFileSync(file, 'utf8');

  for (const section of REQUIRED_SECTIONS) {
    if (!content.includes(section)) {
      errors.push(`MISSING_SECTION: ${agent} :: ${section}`);
    }
  }

  if (DISABLED_AGENTS.includes(agent)) {
    if (!content.includes('DISABLED')) {
      errors.push(`MISSING_DISABLED_MARKER: ${agent}`);
    }
    if (!content.includes('Kevin approval')) {
      errors.push(`MISSING_KEVIN_APPROVAL: ${agent}`);
    }
  }
}

// Check state dir
const stateFile = path.join(ROOT, '.titane-dev', 'state', 'nexus_gate_state.json');
if (!existsSync(stateFile)) {
  errors.push('MISSING_STATE_FILE: .titane-dev/state/nexus_gate_state.json');
}

if (errors.length > 0) {
  console.log('AGENT_OS_GUARD=FAIL');
  errors.forEach(e => console.log(e));
  process.exit(1);
} else {
  console.log('AGENT_OS_GUARD=PASS');
  console.log(`All ${REQUIRED_AGENTS.length} agents present with all ${REQUIRED_SECTIONS.length} required sections.`);
  console.log('Disabled agents correctly marked.');
  process.exit(0);
}
