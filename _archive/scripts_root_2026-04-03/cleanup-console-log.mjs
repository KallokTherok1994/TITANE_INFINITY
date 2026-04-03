#!/usr/bin/env node
/**
 * Console.log → logger.debug() Cleanup Script v2
 * Handles multi-line console.log/console.debug properly
 * Skips files that already had TS errors (pre-existing)
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const TARGET_DIR = 'src';
const EXTS = ['.ts', '.tsx'];
let totalReplacements = 0;
let totalFiles = 0;
let skippedFiles = 0;

// Files to skip (pre-existing TS errors or special cases)
const SKIP_FILES = new Set([
  'src/App.tsx',
  'src/core/optimization/PerformanceOptimizer.ts',
  'src/core/state/StateIntegrityEngine.ts',
  'src/hooks/useChat.loaders.ts',
  'src/hooks/useDevicePermissions.ts',
  'src/hooks/useToast.ts',
  'src/modules/devSudo/devSudoLazyLoader.ts',
  'src/monitoring/index.ts',
  'src/services/ai/chatEngine.preload.ts',
  'src/services/ai/chatEngine.ts',
  'src/services/ai/contextManager.ts',
  'src/services/ai/orchestrator.ts',
  'src/services/monitoring/logger.ts',
  'src/services/monitoring/monitoringLazyLoader.ts',
  // Complex console.log with nested parens — script can't parse
  'src/components/BootHealthDashboard.tsx',
  'src/core/devops/LocalAgentEngine.ts',
  'src/hooks/useVoiceEngine.ts',
  'src/services/singularityBridge.ts',
  'src/services/voice/voiceRouter.ts',
]);

function getAllFiles(dir) {
  let results = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          if (entry === 'node_modules' || entry === '__tests__' || entry === '.git')
            continue;
          results = results.concat(getAllFiles(fullPath));
        } else if (EXTS.includes(extname(entry))) {
          results.push(fullPath);
        }
      } catch {
        /* skip unreadable */
      }
    }
  } catch {
    /* skip unreadable */
  }
  return results;
}

function processFile(filePath) {
  // Skip problematic files
  if (SKIP_FILES.has(filePath)) {
    skippedFiles++;
    return;
  }

  let content;
  try {
    content = readFileSync(filePath, 'utf8');
  } catch {
    return;
  }

  const original = content;
  let replacements = 0;

  // Strategy: Replace simple single-line console.log/console.debug
  // Pattern 1: Single-line: console.log('...'[, args]) or console.debug('...'[, args])
  // We use a multi-step approach for safety

  // First, handle single-line console.debug(...) and console.log(...)
  // that are complete statements on one line
  content = content.replace(
    /^(\s*)console\.(log|debug)\(([^)]*)\);?\s*$/gm,
    (match, indent, method, args) => {
      replacements++;
      // console.debug → logger.debug, console.log → logger.debug
      return `${indent}logger.debug(${args});`;
    }
  );

  // Second, handle single-line console.log/console.debug with template literals
  // that may span visually but are on one line (already handled above)

  // Third, handle multi-line console.log/console.debug
  // Pattern: console.log(\n  ...\n)
  // We need to find the matching closing parenthesis
  const lines = content.split('\n');
  const newLines = [];
  let i = 0;
  let inConsoleBlock = false;
  let consoleIndent = '';
  let consoleArgs = [];
  let parenDepth = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!inConsoleBlock) {
      // Check if this line starts a console.log or console.debug
      const startMatch = line.match(/^(\s*)console\.(log|debug)\((.*)$/);
      if (startMatch) {
        consoleIndent = startMatch[1];
        const rest = startMatch[3];
        parenDepth = 1;

        // Count parens in the rest of the line
        for (const ch of rest) {
          if (ch === '(') parenDepth++;
          if (ch === ')') parenDepth--;
        }

        if (parenDepth <= 0) {
          // Single line, already handled by regex above, skip
          newLines.push(line);
          i++;
          continue;
        }

        // Multi-line: start collecting
        inConsoleBlock = true;
        consoleArgs = [rest];
        i++;
        continue;
      } else {
        newLines.push(line);
        i++;
        continue;
      }
    } else {
      // Inside a multi-line console.log/console.debug
      for (const ch of line) {
        if (ch === '(') parenDepth++;
        if (ch === ')') parenDepth--;
      }

      consoleArgs.push(line.trim());

      if (parenDepth <= 0) {
        // End of multi-line console.log
        // Join args, remove trailing );
        let fullArgs = consoleArgs.join('\n');
        fullArgs = fullArgs.replace(/\);\s*$/, '');
        newLines.push(`${consoleIndent}logger.debug(${fullArgs});`);
        replacements++;
        inConsoleBlock = false;
        consoleArgs = [];
      }
      i++;
    }
  }

  if (inConsoleBlock) {
    // Unclosed console block - don't modify
    return;
  }

  content = newLines.join('\n');

  if (content !== original) {
    try {
      writeFileSync(filePath, content, 'utf8');
      totalReplacements += replacements;
      totalFiles++;
      if (replacements > 5) {
        console.log(`  ${filePath}: ${replacements} replacements`);
      }
    } catch (e) {
      console.error(`  ERROR writing ${filePath}: ${e.message}`);
    }
  }
}

console.log('🧹 Console.log → logger.debug() Cleanup v2');
console.log(`Scanning ${TARGET_DIR}/...\n`);

const files = getAllFiles(TARGET_DIR);
console.log(`Found ${files.length} TypeScript/TSX files\n`);

for (const file of files) {
  processFile(file);
}

console.log(`\n✅ Done!`);
console.log(`   Files modified: ${totalFiles}`);
console.log(`   Total replacements: ${totalReplacements}`);
console.log(`   Files skipped: ${skippedFiles}`);
