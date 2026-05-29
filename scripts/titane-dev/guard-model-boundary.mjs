import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const ROOT = process.cwd();

const FORBIDDEN_PRODUCT_FILES = [
  'src/config/ollamaDefaults.ts',
  'config/championChallenger.json',
  'src-tauri/src/runtime_config.rs',
  'src-tauri/src/config/update.rs',
  'src-tauri/src/ollama.rs',
  'src-tauri/src/ai/ollama.rs',
  'src-tauri/src/ollama_provider_refactor.rs',
  'src/services/ai/championChallenger.ts',
];

const DEV_MODEL_PATTERNS = [
  /qwen3\.5:9b/,
  /qwen2\.5-coder/,
  /qwen2\.5:coder/,
];

const REQUIRED_PRODUCT_DEFAULT = 'gemma2:2b';
const PRODUCT_DEFAULT_SOURCES = [
  'src/config/ollamaDefaults.ts',
  'config/championChallenger.json',
];

let errors = [];
let warnings = [];

// Check forbidden product files for qwen contamination
for (const file of FORBIDDEN_PRODUCT_FILES) {
  const abs = path.join(ROOT, file);
  if (!existsSync(abs)) {
    warnings.push(`MISSING_FILE_QUALIFIED: ${file}`);
    continue;
  }
  const content = readFileSync(abs, 'utf8');
  for (const pattern of DEV_MODEL_PATTERNS) {
    if (pattern.test(content)) {
      errors.push(`BOUNDARY_VIOLATION: ${file} contains dev model pattern /${pattern.source}/`);
    }
  }
}

// Check product default is gemma2:2b
let gemmaFound = false;
for (const file of PRODUCT_DEFAULT_SOURCES) {
  const abs = path.join(ROOT, file);
  if (existsSync(abs)) {
    const content = readFileSync(abs, 'utf8');
    if (content.includes(REQUIRED_PRODUCT_DEFAULT)) {
      gemmaFound = true;
      break;
    }
  }
}

if (!gemmaFound) {
  errors.push(`PRODUCT_BASELINE_MISSING: ${REQUIRED_PRODUCT_DEFAULT} not found in product config files`);
}

// Check model_map.md has correct baseline
const modelMap = path.join(ROOT, '.titane-dev', 'memory', 'model_map.md');
if (existsSync(modelMap)) {
  const content = readFileSync(modelMap, 'utf8');
  if (!content.includes('PRODUCT_CHAT_DEFAULT = gemma2:2b')) {
    warnings.push('model_map.md does not declare PRODUCT_CHAT_DEFAULT = gemma2:2b');
  }
}

if (warnings.length > 0) {
  console.log('WARNINGS:');
  warnings.forEach(w => console.log(' ' + w));
}

if (errors.length > 0) {
  console.log('MODEL_BOUNDARY_GUARD=FAIL');
  errors.forEach(e => console.log(e));
  process.exit(1);
} else {
  console.log('MODEL_BOUNDARY_GUARD=PASS');
  console.log(`Product baseline ${REQUIRED_PRODUCT_DEFAULT}: confirmed.`);
  console.log('No dev model contamination in product config files.');
  process.exit(0);
}
