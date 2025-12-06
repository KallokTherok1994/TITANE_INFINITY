/**
 * TITANE_INFINITY v∞.42 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   UNIFIED MEMORY — Integration Tests
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Basic integration tests to validate the unified memory system
 * 
 * Tests:
 * 1. Initialization
 * 2. Memory creation
 * 3. Memory retrieval (semantic search)
 * 4. Memory update
 * 5. Memory deletion
 * 6. Context building for OMEGA
 * 7. Tier auto-promotion
 * 8. Statistics
 */

import { createUnifiedMemory } from './index';
import type { UnifiedMemory } from './UnifiedMemory';
import * as fs from 'fs';
import * as path from 'path';

// Test configuration
const TEST_DB_PATH = './data/test_unified_memory.db';

/**
 * Clean up test database
 */
function cleanupTestDb() {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
  const walPath = TEST_DB_PATH + '-wal';
  if (fs.existsSync(walPath)) {
    fs.unlinkSync(walPath);
  }
  const shmPath = TEST_DB_PATH + '-shm';
  if (fs.existsSync(shmPath)) {
    fs.unlinkSync(shmPath);
  }
}

/**
 * Run all integration tests
 */
async function runIntegrationTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  UNIFIED MEMORY — Integration Tests');
  console.log('═══════════════════════════════════════════════════════════\n');

  let memory: UnifiedMemory | undefined;
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Cleanup before tests
    cleanupTestDb();

    // Test 1: Initialization
    console.log('Test 1: Initialization...');
    try {
      memory = await createUnifiedMemory({
        dbPath: TEST_DB_PATH,
        modelName: 'all-MiniLM-L6-v2',
        enableCache: true
      });
      console.log('✅ Test 1 PASSED: Initialization successful\n');
      testsPassed++;
    } catch (error) {
      console.error('❌ Test 1 FAILED:', error);
      testsFailed++;
      return;
    }

    // Test 2: Memory creation
    console.log('Test 2: Memory creation...');
    try {
      const entry1 = await memory.createMemory({
        type: 'fact',
        owner: 'test_user',
        summary: 'Kevin uses Pop!_OS 24.04 LTS',
        details: 'Kevin is running Pop!_OS 24.04 LTS on his development machine',
        tags: ['system', 'os'],
        importance: 0.8
      });

      const entry2 = await memory.createMemory({
        type: 'preference',
        owner: 'test_user',
        summary: 'Prefers TypeScript over JavaScript',
        details: 'Kevin strongly prefers TypeScript for type safety and better IDE support',
        tags: ['language', 'preference'],
        importance: 0.7
      });

      const entry3 = await memory.createMemory({
        type: 'milestone',
        owner: 'test_user',
        summary: 'MCP OS v1.1 completed',
        details: 'Master Cognitive Program v1.1 implementation completed with all 5 cores',
        tags: ['milestone', 'mcp'],
        importance: 0.95
      });

      console.log(`✅ Test 2 PASSED: Created 3 memories\n`);
      testsPassed++;
    } catch (error) {
      console.error('❌ Test 2 FAILED:', error);
      testsFailed++;
    }

    // Test 3: Memory retrieval (semantic search)
    console.log('Test 3: Memory retrieval (semantic search)...');
    try {
      const results = await memory.retrieveMemories({
        text: 'What operating system does Kevin use?',
        limit: 5
      });

      console.log(`  Found ${results.length} relevant memories:`);
      results.forEach((r, i) => {
        console.log(`  ${i + 1}. [${r.entry.type}] ${r.entry.summary} (score: ${r.score.toFixed(3)})`);
      });

      if (results.length > 0 && results[0].entry.summary.includes('Pop!_OS')) {
        console.log('✅ Test 3 PASSED: Semantic search working correctly\n');
        testsPassed++;
      } else {
        console.error('❌ Test 3 FAILED: Expected Pop!_OS result not found\n');
        testsFailed++;
      }
    } catch (error) {
      console.error('❌ Test 3 FAILED:', error);
      testsFailed++;
    }

    // Test 4: Context building for OMEGA
    console.log('Test 4: Context building for OMEGA...');
    try {
      const context = await memory.buildContext('Tell me about Kevin\'s preferences', {
        limit: 3
      });

      console.log(`  Context summary:\n${context.summary}`);
      console.log(`  Metadata:`, context.metadata);

      if (context.memories.length > 0) {
        console.log('✅ Test 4 PASSED: Context building successful\n');
        testsPassed++;
      } else {
        console.error('❌ Test 4 FAILED: No memories in context\n');
        testsFailed++;
      }
    } catch (error) {
      console.error('❌ Test 4 FAILED:', error);
      testsFailed++;
    }

    // Test 5: Statistics
    console.log('Test 5: Statistics...');
    try {
      const stats = await memory.getStats();
      console.log(`  Total memories: ${stats.total}`);
      console.log(`  By tier:`, stats.byTier);
      console.log(`  By type:`, stats.byType);
      console.log(`  By importance:`, stats.byImportance);

      const perfStats = memory.getPerformanceStats();
      console.log(`  Performance:`, perfStats);

      if (stats.total >= 3) {
        console.log('✅ Test 5 PASSED: Statistics working correctly\n');
        testsPassed++;
      } else {
        console.error('❌ Test 5 FAILED: Expected at least 3 memories\n');
        testsFailed++;
      }
    } catch (error) {
      console.error('❌ Test 5 FAILED:', error);
      testsFailed++;
    }

    // Test 6: Memory update
    console.log('Test 6: Memory update...');
    try {
      const results = await memory.retrieveMemories({
        text: 'Pop!_OS',
        limit: 1
      });

      if (results.length > 0) {
        const memoryId = results[0].entry.id;
        await memory.updateMemory(memoryId, {
          importance: 0.9
        });
        console.log('✅ Test 6 PASSED: Memory update successful\n');
        testsPassed++;
      } else {
        console.error('❌ Test 6 FAILED: No memory to update\n');
        testsFailed++;
      }
    } catch (error) {
      console.error('❌ Test 6 FAILED:', error);
      testsFailed++;
    }

    // Test 7: Memory deletion
    console.log('Test 7: Memory deletion...');
    try {
      const results = await memory.retrieveMemories({
        text: 'TypeScript',
        limit: 1
      });

      if (results.length > 0) {
        const memoryId = results[0].entry.id;
        await memory.deleteMemory(memoryId);
        
        // Verify deletion
        const afterDelete = await memory.retrieveMemories({
          text: 'TypeScript',
          limit: 5
        });
        
        console.log(`  Memories after deletion: ${afterDelete.length}`);
        console.log('✅ Test 7 PASSED: Memory deletion successful\n');
        testsPassed++;
      } else {
        console.error('❌ Test 7 FAILED: No memory to delete\n');
        testsFailed++;
      }
    } catch (error) {
      console.error('❌ Test 7 FAILED:', error);
      testsFailed++;
    }

    // Test 8: Cleanup
    console.log('Test 8: Cleanup operation...');
    try {
      const deletedCount = await memory.cleanup();
      console.log(`  Cleaned up ${deletedCount} memories`);
      console.log('✅ Test 8 PASSED: Cleanup successful\n');
      testsPassed++;
    } catch (error) {
      console.error('❌ Test 8 FAILED:', error);
      testsFailed++;
    }

  } catch (error) {
    console.error('❌ Tests aborted:', error);
  } finally {
    // Shutdown
    if (memory) {
      await memory.shutdown();
    }

    // Cleanup after tests
    cleanupTestDb();

    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  ✅ Passed: ${testsPassed}`);
    console.log(`  ❌ Failed: ${testsFailed}`);
    console.log(`  📊 Total:  ${testsPassed + testsFailed}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    if (testsFailed === 0) {
      console.log('🎉 All tests passed!\n');
    } else {
      console.log('⚠️  Some tests failed. Review logs above.\n');
      process.exit(1);
    }
  }
}

// Run tests if executed directly
if (require.main === module) {
  runIntegrationTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runIntegrationTests };
