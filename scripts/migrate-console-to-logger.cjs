#!/usr/bin/env node

/**
 * TITANE∞ - Console Logger Migration Tool
 *
 * Migrate console.* calls to logger.* with proper formatting
 */

const fs = require('fs');
const path = require('path');

const TARGET_DIR = process.argv[2] || 'src';
const DRY_RUN = process.argv.includes('--dry-run');

// Conversion rules
const CONVERSION_MAP = {
  'console.log': 'logger.info',
  'console.info': 'logger.info',
  'console.warn': 'logger.warn',
  'console.error': 'logger.error',
  'console.debug': 'logger.debug',
};

// Files to skip
const SKIP_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  'consoleMonitor.ts', // Don't migrate the monitor itself
];

let stats = {
  filesProcessed: 0,
  filesModified: 0,
  conversions: 0,
  errors: 0,
};

/**
 * Check if file should be processed
 */
function shouldProcessFile(filePath) {
  if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

  for (const pattern of SKIP_PATTERNS) {
    if (filePath.includes(pattern)) return false;
  }

  return true;
}

/**
 * Extract emoji tag from console message
 */
function extractTag(message) {
  if (typeof message !== 'string') return null;
  const tagMatch = message.match(/^\[([A-Z-]+)\]/);
  return tagMatch ? tagMatch[1] : null;
}

/**
 * Convert console call to logger call
 */
function convertConsoleLine(line) {
  let modified = line;
  let hasChanges = false;

  for (const [consoleMethod, loggerMethod] of Object.entries(CONVERSION_MAP)) {
    const regex = new RegExp(`${consoleMethod.replace('.', '\\.')}\\(`, 'g');

    if (regex.test(line)) {
      // Extract message to identify tag
      const messageMatch = line.match(/'([^']*)'|"([^"]*)"|`([^`]*)`/);
      if (messageMatch) {
        const message = messageMatch[1] || messageMatch[2] || messageMatch[3];
        const tag = extractTag(message);

        // If tag exists, add it to logger context
        if (tag) {
          // Remove tag from message
          const cleanMessage = message.replace(/^\[[A-Z-]+\]\s*/, '');
          modified = modified.replace(
            new RegExp(`${consoleMethod.replace('.', '\\.')}\\([^)]+\\)`),
            `${loggerMethod}('${cleanMessage}', { component: '${tag}' })`
          );
        } else {
          modified = modified.replace(regex, `${loggerMethod}(`);
        }
      } else {
        modified = modified.replace(regex, `${loggerMethod}(`);
      }

      hasChanges = true;
      stats.conversions++;
    }
  }

  return { modified, hasChanges };
}

/**
 * Add logger import if missing
 */
function ensureLoggerImport(content) {
  const hasLoggerImport = /import.*logger.*from.*logger/.test(content);
  const hasCreateLogger = /createLogger/.test(content);

  if (!hasLoggerImport && !hasCreateLogger) {
    // Find first import statement
    const firstImportMatch = content.match(/^import\s/m);
    if (firstImportMatch) {
      const insertPos = firstImportMatch.index;
      return (
        content.slice(0, insertPos) +
        "import { logger } from '@/lib/logger';\n" +
        content.slice(insertPos)
      );
    }
  }

  return content;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    stats.filesProcessed++;

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    let modified = false;
    const newLines = lines.map(line => {
      const { modified: newLine, hasChanges } = convertConsoleLine(line);
      if (hasChanges) modified = true;
      return newLine;
    });

    if (modified) {
      let newContent = newLines.join('\n');
      newContent = ensureLoggerImport(newContent);

      if (!DRY_RUN) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
      }

      stats.filesModified++;
      console.log(`✅ Modified: ${filePath}`);
    }
  } catch (error) {
    stats.errors++;
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Recursively process directory
 */
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!SKIP_PATTERNS.some(pattern => entry.name.includes(pattern))) {
        processDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      if (shouldProcessFile(fullPath)) {
        processFile(fullPath);
      }
    }
  }
}

// Main
console.log('🔍 TITANE∞ - Console Logger Migration Tool');
console.log(`📁 Target: ${TARGET_DIR}`);
console.log(`🔬 Mode: ${DRY_RUN ? 'DRY RUN' : 'WRITE'}`);
console.log('─'.repeat(60));

const startTime = Date.now();
const targetPath = path.resolve(TARGET_DIR);

// Check if target is file or directory
if (fs.statSync(targetPath).isFile()) {
  processFile(targetPath);
} else {
  processDirectory(targetPath);
}

const duration = Date.now() - startTime;

console.log('─'.repeat(60));
console.log('📊 Migration Statistics:');
console.log(`   Files processed: ${stats.filesProcessed}`);
console.log(`   Files modified: ${stats.filesModified}`);
console.log(`   Total conversions: ${stats.conversions}`);
console.log(`   Errors: ${stats.errors}`);
console.log(`   Duration: ${duration}ms`);

if (DRY_RUN) {
  console.log('\n💡 Run without --dry-run to apply changes');
}
