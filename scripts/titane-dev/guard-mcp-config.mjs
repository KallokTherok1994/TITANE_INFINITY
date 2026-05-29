import { readFileSync, existsSync } from 'fs';
import path from 'path';

const ROOT = process.cwd();

const MCP_FILE = path.join(ROOT, '.vscode', 'mcp.json');
const WRAPPER_FILE = path.join(ROOT, 'scripts', 'titane-dev', 'start-ollama-dev-mcp.ps1');

let errors = [];

// Check mcp.json exists
if (!existsSync(MCP_FILE)) {
  errors.push('MISSING: .vscode/mcp.json');
  console.log('MCP_CONFIG_GUARD=FAIL');
  errors.forEach(e => console.log(e));
  process.exit(1);
}

let config;
try {
  config = JSON.parse(readFileSync(MCP_FILE, 'utf8'));
} catch (e) {
  errors.push(`INVALID_JSON: .vscode/mcp.json :: ${e.message}`);
  console.log('MCP_CONFIG_GUARD=FAIL');
  errors.forEach(e => console.log(e));
  process.exit(1);
}

// Verify servers.ollama-dev exists
const server = config?.servers?.['ollama-dev'];
if (!server) {
  errors.push('MISSING: servers.ollama-dev in mcp.json');
}

// Verify command is powershell (not bash)
if (server?.command !== 'powershell') {
  errors.push(`BASH_DEPENDENCY: command is "${server?.command}" — expected "powershell"`);
}

// Verify args contains the PS1 wrapper path
const args = server?.args || [];
const hasWrapper = args.some(a => a.includes('start-ollama-dev-mcp.ps1'));
if (!hasWrapper) {
  errors.push('MISSING: start-ollama-dev-mcp.ps1 in args');
}

// Verify env has OLLAMA_HOST
if (!server?.env?.OLLAMA_HOST) {
  errors.push('MISSING: env.OLLAMA_HOST in mcp.json');
}

// Verify env has TITANE_OLLAMA_DEV_MODEL = qwen3.5:9b
if (server?.env?.TITANE_OLLAMA_DEV_MODEL !== 'qwen3.5:9b') {
  errors.push(`MODEL_MISMATCH: TITANE_OLLAMA_DEV_MODEL is "${server?.env?.TITANE_OLLAMA_DEV_MODEL}" — expected "qwen3.5:9b"`);
}

// Verify PS1 wrapper exists
if (!existsSync(WRAPPER_FILE)) {
  errors.push('MISSING: scripts/titane-dev/start-ollama-dev-mcp.ps1');
}

// Verify no secrets in mcp.json
const raw = readFileSync(MCP_FILE, 'utf8');
const secretPatterns = ['API_KEY', 'PRIVATE_KEY', 'VITE_OPENAI', 'VITE_GEMINI', 'VITE_ANTHROPIC'];
for (const p of secretPatterns) {
  if (raw.includes(p)) {
    errors.push(`SECRET_SUSPECT: ${p} found in .vscode/mcp.json`);
  }
}

if (errors.length > 0) {
  console.log('MCP_CONFIG_GUARD=FAIL');
  errors.forEach(e => console.log(e));
  process.exit(1);
} else {
  console.log('MCP_CONFIG_GUARD=PASS');
  console.log('command=powershell, wrapper=start-ollama-dev-mcp.ps1, host=http://127.0.0.1:11434, model=qwen3.5:9b');
  console.log('No secrets in mcp.json.');
  process.exit(0);
}
