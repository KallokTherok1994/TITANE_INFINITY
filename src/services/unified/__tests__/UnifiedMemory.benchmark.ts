/**
 * TITANE_INFINITY v∞.42 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   UNIFIED MEMORY — Performance Benchmarks
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Week 1 Performance Targets:
 * - Memory consumption: -60% (500MB → 200MB)
 * - Sync latency: -67% (3s → 1s)
 * - Vector search: -33% (180ms → 120ms)
 * - Memory leak: <100MB growth per 1,000 messages
 */

import { performance } from 'perf_hooks';
import os from 'os';
import { UnifiedMemory, SQLiteVectorStore, LocalEmbeddingGenerator } from '../index';
import type { UnifiedMemoryEntry as _UnifiedMemoryEntry } from '../UnifiedMemory';
import fs from 'fs';
import path from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// BENCHMARK CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

interface BenchmarkResult {
  name: string;
  duration: number;
  operations: number;
  opsPerSecond: number;
  memoryUsed: number;
  memoryDelta: number;
  success: boolean;
  target?: number;
  actual?: number;
  improvement?: string;
}

interface BenchmarkReport {
  timestamp: number;
  environment: {
    node: string;
    platform: string;
    arch: string;
    cpus: number;
  };
  results: BenchmarkResult[];
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    avgMemoryUsage: number;
    totalDuration: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function getMemoryUsage(): number {
  const usage = process.memoryUsage();
  return Math.round(usage.heapUsed / 1024 / 1024); // MB
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function formatBytes(bytes: number): string {
  return `${formatNumber(bytes)} MB`;
}

async function _sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════════════════════════════════════════
// BENCHMARK TESTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Benchmark 1: Memory Creation Throughput
 * Target: >100 memories/second
 */
async function benchmarkMemoryCreation(memory: UnifiedMemory): Promise<BenchmarkResult> {
  console.log('\n[Benchmark] Memory Creation Throughput...');

  const memoryBefore = getMemoryUsage();
  const iterations = 1000;
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    await memory.createMemory({
      type: 'fact',
      owner: 'benchmark_user',
      summary: `Benchmark memory ${i}`,
      details: `This is benchmark memory number ${i} for performance testing`,
      tags: ['benchmark', 'test'],
      importance: 0.5 + Math.random() * 0.5,
    });
  }

  const duration = performance.now() - start;
  const memoryAfter = getMemoryUsage();
  const opsPerSecond = (iterations / duration) * 1000;

  return {
    name: 'Memory Creation Throughput',
    duration,
    operations: iterations,
    opsPerSecond,
    memoryUsed: memoryAfter,
    memoryDelta: memoryAfter - memoryBefore,
    success: opsPerSecond > 100,
    target: 100,
    actual: opsPerSecond,
  };
}

/**
 * Benchmark 2: Vector Search Latency
 * Target: <120ms average (33% improvement from 180ms)
 */
async function benchmarkVectorSearch(memory: UnifiedMemory): Promise<BenchmarkResult> {
  console.log('\n[Benchmark] Vector Search Latency...');

  // Create test dataset
  const testQueries = [
    'What is the operating system?',
    'TypeScript programming language',
    'User preferences',
    'Important milestone',
    'Recent conversation',
    'System configuration',
    'Code optimization',
    'Memory management',
    'Database query',
    'API endpoint',
  ];

  const memoryBefore = getMemoryUsage();
  const iterations = 100;
  let totalDuration = 0;

  for (let i = 0; i < iterations; i++) {
    const query = testQueries[i % testQueries.length];
    const start = performance.now();

    await memory.retrieveMemories({
      text: query,
      limit: 10,
    });

    totalDuration += performance.now() - start;
  }

  const avgDuration = totalDuration / iterations;
  const memoryAfter = getMemoryUsage();

  return {
    name: 'Vector Search Latency',
    duration: totalDuration,
    operations: iterations,
    opsPerSecond: (iterations / totalDuration) * 1000,
    memoryUsed: memoryAfter,
    memoryDelta: memoryAfter - memoryBefore,
    success: avgDuration < 120,
    target: 120,
    actual: avgDuration,
    improvement:
      avgDuration < 180 ? `${formatNumber((1 - avgDuration / 180) * 100)}%` : 'N/A',
  };
}

/**
 * Benchmark 3: Memory Consolidation Performance
 * Target: <5s for 1,000 memories
 */
async function benchmarkConsolidation(memory: UnifiedMemory): Promise<BenchmarkResult> {
  console.log('\n[Benchmark] Consolidation Performance...');

  const memoryBefore = getMemoryUsage();
  const start = performance.now();

  const merged = await memory.consolidate();

  const duration = performance.now() - start;
  const memoryAfter = getMemoryUsage();

  return {
    name: 'Consolidation Performance',
    duration,
    operations: merged,
    opsPerSecond: merged > 0 ? (merged / duration) * 1000 : 0,
    memoryUsed: memoryAfter,
    memoryDelta: memoryAfter - memoryBefore,
    success: duration < 5000,
    target: 5000,
    actual: duration,
  };
}

/**
 * Benchmark 4: Memory Decay Performance
 * Target: <2s for 1,000 memories
 */
async function benchmarkDecay(memory: UnifiedMemory): Promise<BenchmarkResult> {
  console.log('\n[Benchmark] Decay Performance...');

  const memoryBefore = getMemoryUsage();
  const start = performance.now();

  const deleted = await memory.decay();

  const duration = performance.now() - start;
  const memoryAfter = getMemoryUsage();

  return {
    name: 'Decay Performance',
    duration,
    operations: deleted,
    opsPerSecond: deleted > 0 ? (deleted / duration) * 1000 : 0,
    memoryUsed: memoryAfter,
    memoryDelta: memoryAfter - memoryBefore,
    success: duration < 2000,
    target: 2000,
    actual: duration,
  };
}

/**
 * Benchmark 5: Memory Consumption Under Load
 * Target: <200MB for 1,000 memories (-60% from baseline 500MB)
 */
async function benchmarkMemoryConsumption(
  memory: UnifiedMemory
): Promise<BenchmarkResult> {
  console.log('\n[Benchmark] Memory Consumption Under Load...');

  const memoryBefore = getMemoryUsage();
  const iterations = 1000;
  const start = performance.now();

  // Create memories
  for (let i = 0; i < iterations; i++) {
    await memory.createMemory({
      type: i % 2 === 0 ? 'fact' : 'conversation',
      owner: 'load_test_user',
      summary: `Load test memory ${i}`,
      details: `This is a detailed load test memory with more content to simulate realistic usage patterns. Memory number ${i}.`,
      tags: ['load', 'test', `batch-${Math.floor(i / 100)}`],
      importance: Math.random(),
    });
  }

  const duration = performance.now() - start;
  const memoryAfter = getMemoryUsage();
  const memoryDelta = memoryAfter - memoryBefore;

  return {
    name: 'Memory Consumption Under Load',
    duration,
    operations: iterations,
    opsPerSecond: (iterations / duration) * 1000,
    memoryUsed: memoryAfter,
    memoryDelta,
    success: memoryDelta < 200,
    target: 200,
    actual: memoryDelta,
    improvement:
      memoryDelta < 500 ? `${formatNumber((1 - memoryDelta / 500) * 100)}%` : 'N/A',
  };
}

/**
 * Benchmark 6: Embedding Generation Throughput
 * Target: >50 embeddings/second
 */
async function benchmarkEmbeddingGeneration(): Promise<BenchmarkResult> {
  console.log('\n[Benchmark] Embedding Generation Throughput...');

  const generator = new LocalEmbeddingGenerator({
    modelName: 'Xenova/all-MiniLM-L6-v2',
    dimensions: 384,
    // useFallback: true // Not in config interface
  });
  await generator.initialize();

  const memoryBefore = getMemoryUsage();
  const iterations = 100;
  const start = performance.now();

  const texts = Array.from(
    { length: iterations },
    (_, i) => `This is test text number ${i} for embedding generation benchmarking`
  );

  await generator.generateBatch(texts);

  const duration = performance.now() - start;
  const memoryAfter = getMemoryUsage();
  const opsPerSecond = (iterations / duration) * 1000;

  return {
    name: 'Embedding Generation Throughput',
    duration,
    operations: iterations,
    opsPerSecond,
    memoryUsed: memoryAfter,
    memoryDelta: memoryAfter - memoryBefore,
    success: opsPerSecond > 50,
    target: 50,
    actual: opsPerSecond,
  };
}

/**
 * Benchmark 7: Concurrent Operations
 * Target: Handle 10 concurrent operations without degradation
 */
async function benchmarkConcurrentOps(memory: UnifiedMemory): Promise<BenchmarkResult> {
  console.log('\n[Benchmark] Concurrent Operations...');

  const memoryBefore = getMemoryUsage();
  const concurrency = 10;
  const start = performance.now();

  const operations = Array.from({ length: concurrency }, async (_, i) => {
    return Promise.all([
      memory.createMemory({
        type: 'fact',
        owner: 'concurrent_user',
        summary: `Concurrent memory ${i}`,
        tags: ['concurrent'],
        importance: 0.7,
      }),
      memory.retrieveMemories({
        text: 'concurrent test',
        limit: 5,
      }),
      memory.getStats(),
    ]);
  });

  await Promise.all(operations);

  const duration = performance.now() - start;
  const memoryAfter = getMemoryUsage();

  return {
    name: 'Concurrent Operations',
    duration,
    operations: concurrency * 3,
    opsPerSecond: ((concurrency * 3) / duration) * 1000,
    memoryUsed: memoryAfter,
    memoryDelta: memoryAfter - memoryBefore,
    success: duration < 5000,
    target: 5000,
    actual: duration,
  };
}

/**
 * Benchmark 8: Memory Leak Test
 * Target: <100MB growth per 1,000 operations
 */
async function benchmarkMemoryLeak(memory: UnifiedMemory): Promise<BenchmarkResult> {
  console.log('\n[Benchmark] Memory Leak Test (1,000 operations)...');

  const memoryBefore = getMemoryUsage();
  const iterations = 1000;
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    // Create
    const entry = await memory.createMemory({
      type: 'fact',
      owner: 'leak_test',
      summary: `Memory ${i}`,
      tags: ['leak-test'],
      importance: 0.5,
    });

    // Retrieve
    await memory.retrieveMemories({
      text: `Memory ${i}`,
      limit: 1,
    });

    // Update
    await memory.updateMemory(entry.id, {
      importance: 0.6,
    });

    // Delete
    await memory.deleteMemory(entry.id);

    // Force GC every 100 iterations
    if (i % 100 === 0 && global.gc) {
      global.gc();
    }
  }

  const duration = performance.now() - start;
  const memoryAfter = getMemoryUsage();
  const memoryGrowth = memoryAfter - memoryBefore;

  return {
    name: 'Memory Leak Test',
    duration,
    operations: iterations * 4, // create + retrieve + update + delete
    opsPerSecond: ((iterations * 4) / duration) * 1000,
    memoryUsed: memoryAfter,
    memoryDelta: memoryGrowth,
    success: memoryGrowth < 100,
    target: 100,
    actual: memoryGrowth,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN BENCHMARK RUNNER
// ═══════════════════════════════════════════════════════════════════════════

async function runBenchmarks(): Promise<BenchmarkReport> {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   UNIFIED MEMORY — Performance Benchmarks');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Node: ${process.version}`);
  console.log(`Platform: ${process.platform} ${process.arch}`);
  console.log(`CPUs: ${os.cpus().length}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  const results: BenchmarkResult[] = [];

  // Setup
  const dbPath = path.join(__dirname, 'benchmark.db');
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

  const vectorStore = new SQLiteVectorStore({ dbPath, dimensions: 384 } as any);
  const embeddingGenerator = new LocalEmbeddingGenerator({
    modelName: 'Xenova/all-MiniLM-L6-v2',
    dimensions: 384,
    // useFallback: true // Not in config interface
  });

  const memory = new UnifiedMemory(vectorStore, embeddingGenerator, {
    enabled: true,
    cleanup: { enabled: false, intervalMs: 0, removeBelowScore: 0.3 },
    consolidation: { enabled: false, intervalMs: 0, mergeSimilarThreshold: 0.9 },
    decay: { enabled: false, intervalMs: 0, decayRate: 0.05 },
  });

  await memory.initialize();

  // Run benchmarks
  try {
    results.push(await benchmarkMemoryCreation(memory));
    results.push(await benchmarkVectorSearch(memory));
    results.push(await benchmarkConsolidation(memory));
    results.push(await benchmarkDecay(memory));
    results.push(await benchmarkMemoryConsumption(memory));
    results.push(await benchmarkEmbeddingGeneration());
    results.push(await benchmarkConcurrentOps(memory));
    results.push(await benchmarkMemoryLeak(memory));
  } finally {
    await memory.shutdown();
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  }

  // Generate report
  const report: BenchmarkReport = {
    timestamp: Date.now(),
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      cpus: os.cpus().length,
    },
    results,
    summary: {
      totalTests: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      avgMemoryUsage: results.reduce((sum, r) => sum + r.memoryDelta, 0) / results.length,
      totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
    },
  };

  return report;
}

// ═══════════════════════════════════════════════════════════════════════════
// REPORT GENERATION
// ═══════════════════════════════════════════════════════════════════════════

function printReport(report: BenchmarkReport): void {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('   BENCHMARK RESULTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  report.results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    console.log(`   Duration: ${formatNumber(result.duration)}ms`);
    console.log(`   Operations: ${result.operations}`);
    console.log(`   Throughput: ${formatNumber(result.opsPerSecond)} ops/s`);
    console.log(`   Memory Delta: ${formatBytes(result.memoryDelta)}`);

    if (result.target && result.actual) {
      console.log(`   Target: ${result.target} | Actual: ${formatNumber(result.actual)}`);
    }

    if (result.improvement) {
      console.log(`   Improvement: ${result.improvement}`);
    }

    console.log('');
  });

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`Total Tests: ${report.summary.totalTests}`);
  console.log(`Passed: ${report.summary.passed}`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log(`Avg Memory Delta: ${formatBytes(report.summary.avgMemoryUsage)}`);
  console.log(`Total Duration: ${formatNumber(report.summary.totalDuration)}ms`);
  console.log(
    `\nSuccess Rate: ${formatNumber((report.summary.passed / report.summary.totalTests) * 100)}%`
  );
  console.log('═══════════════════════════════════════════════════════════════\n');
}

function saveReport(report: BenchmarkReport, outputPath: string): void {
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`\n📊 Report saved to: ${outputPath}\n`);
}

// ═══════════════════════════════════════════════════════════════════════════
// EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

runBenchmarks()
  .then(report => {
    printReport(report);

    const outputPath = path.join(__dirname, 'benchmark-results.json');
    saveReport(report, outputPath);

    // Exit with error code if any benchmarks failed
    process.exit(report.summary.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('Benchmark failed:', error);
    process.exit(1);
  });
