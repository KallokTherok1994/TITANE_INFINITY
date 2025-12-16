/**
 * TITANE∞ v24.2.1 — Brotli Compression Script
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Compresses build output with Brotli for 10-15% better compression than gzip
 * Run after build: npm run compress
 */

import { createBrotliCompress, constants } from 'zlib';
import { createReadStream, createWriteStream, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { pipeline } from 'stream/promises';

const DIST_DIR = 'dist';
const ASSETS_DIR = join(DIST_DIR, 'assets');
const EXTENSIONS = ['.js', '.css', '.html', '.svg', '.json'];
const MIN_SIZE = 1024; // Only compress files > 1KB

async function compressFile(filePath) {
  const outputPath = `${filePath}.br`;

  try {
    await pipeline(
      createReadStream(filePath),
      createBrotliCompress({
        params: {
          [constants.BROTLI_PARAM_QUALITY]: 11, // Max quality (0-11)
          [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
        },
      }),
      createWriteStream(outputPath)
    );
    return true;
  } catch (error) {
    console.error(`Failed to compress ${filePath}:`, error.message);
    return false;
  }
}

function getFilesToCompress(dir) {
  const files = [];

  if (!existsSync(dir)) {
    return files;
  }

  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getFilesToCompress(fullPath));
    } else if (stat.isFile()) {
      const ext = extname(entry).toLowerCase();
      if (EXTENSIONS.includes(ext) && stat.size >= MIN_SIZE) {
        files.push({ path: fullPath, size: stat.size });
      }
    }
  }

  return files;
}

async function main() {
  console.log('🗜️  TITANE∞ Brotli Compression');
  console.log('━'.repeat(50));

  const startTime = Date.now();
  const files = [
    ...getFilesToCompress(ASSETS_DIR),
    ...getFilesToCompress(DIST_DIR).filter(f => !f.path.includes('/assets/')),
  ];

  if (files.length === 0) {
    console.log('⚠️  No files found to compress');
    return;
  }

  console.log(`📁 Found ${files.length} files to compress\n`);

  let totalOriginal = 0;
  let totalCompressed = 0;
  let successCount = 0;

  for (const file of files) {
    const success = await compressFile(file.path);
    if (success) {
      const compressedStat = statSync(`${file.path}.br`);
      const ratio = ((1 - compressedStat.size / file.size) * 100).toFixed(1);

      totalOriginal += file.size;
      totalCompressed += compressedStat.size;
      successCount++;

      const originalKB = (file.size / 1024).toFixed(1);
      const compressedKB = (compressedStat.size / 1024).toFixed(1);
      console.log(`✓ ${file.path.replace(DIST_DIR + '/', '')}`);
      console.log(`  ${originalKB} KB → ${compressedKB} KB (${ratio}% saved)`);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const totalRatio = ((1 - totalCompressed / totalOriginal) * 100).toFixed(1);
  const totalOriginalMB = (totalOriginal / 1024 / 1024).toFixed(2);
  const totalCompressedMB = (totalCompressed / 1024 / 1024).toFixed(2);

  console.log('\n' + '━'.repeat(50));
  console.log(`✅ Compressed ${successCount}/${files.length} files in ${duration}s`);
  console.log(`📊 Total: ${totalOriginalMB} MB → ${totalCompressedMB} MB (${totalRatio}% saved)`);
}

main().catch(console.error);
