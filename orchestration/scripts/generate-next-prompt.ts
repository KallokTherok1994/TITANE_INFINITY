#!/usr/bin/env ts-node

/**
 * TITANE Orchestration — Generate Next Prompt for Copilot
 * 
 * Reads orchestration/roadmap.yaml and outputs next task with full context.
 * Outputs formatted prompt that can be pasted directly into Copilot Chat.
 */

import * as fs from 'fs';
import * as path from 'path';
import YAML from 'yaml';
import chalk from 'chalk';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  dependencies?: string[];
  estimatedTime: string;
  files?: number;
  tests?: number;
}

interface Phase {
  name: string;
  status: string;
  tasks: Task[];
}

interface Roadmap {
  phases: Phase[];
  metadata: {
    updated: string;
    totalTasks: number;
    completedTasks: number;
    version: string;
  };
}

async function loadRoadmap(): Promise<Roadmap> {
  const roadmapPath = path.join(__dirname, '../roadmap.yaml');
  
  if (!fs.existsSync(roadmapPath)) {
    console.error(chalk.red('❌ roadmap.yaml not found at', roadmapPath));
    process.exit(1);
  }
  
  const content = fs.readFileSync(roadmapPath, 'utf-8');
  const roadmap = YAML.parse(content);
  
  return roadmap;
}

function findNextTask(roadmap: Roadmap): Task | null {
  // Find first 'todo' or 'in-progress' task
  for (const phase of roadmap.phases) {
    for (const task of phase.tasks) {
      if (task.status === 'todo' || task.status === 'in-progress') {
        return task;
      }
    }
  }
  return null;
}

function generatePrompt(task: Task, nextPhase: string): string {
  const prompt = `
## 🎯 TITANE Orchestration — Next Task

**Task ID**: ${task.id}
**Phase**: ${nextPhase}
**Priority**: ${task.priority}
**Estimated Time**: ${task.estimatedTime}

### Task Description
${task.description}

### Requirements
- Tests to create: ${task.tests || 'As needed'}
- Files to modify: ${task.files || 'As needed'}
- Status: Start implementation using TDD workflow

### Instructions
1. Read orchestration/roadmap.yaml for full context
2. Check .github/instructions/titane.instructions.md for conventions
3. Use Copilot conductor agent for planning if needed
4. Follow TDD workflow: Write tests → Implement → Refactor
5. When complete, run \`npm run update -- ${task.id}\` to mark as done

### Workflow
- [ ] Read task requirements and dependencies
- [ ] Create implementation plan in plans/${task.id}-plan.md
- [ ] Write tests first
- [ ] Implement code
- [ ] Run tests: \`cargo test --all && npm test\`
- [ ] Format code: \`cargo fmt && npx prettier --write src/\`
- [ ] Get review: \`npm run status\`
- [ ] Commit with message: \`feat: ${task.title}\`

### Context
Project: TITANE_INFINITY v19.4.3+
Architecture: 9 cognitive motors
Stack: React 18 + Tauri v2 + Rust async
Status: Phase 2 complete (3 fusions), Phase 3 in progress

Start implementation now 👇
`;

  return prompt.trim();
}

async function main() {
  try {
    console.log(chalk.cyan('\n🔍 Loading TITANE Orchestration Roadmap...\n'));
    
    const roadmap = await loadRoadmap();
    const nextTask = findNextTask(roadmap);
    
    if (!nextTask) {
      console.log(chalk.green('✅ All tasks complete! Roadmap finished.\n'));
      process.exit(0);
    }
    
    // Find phase name
    let phaseName = 'Unknown';
    for (const phase of roadmap.phases) {
      for (const task of phase.tasks) {
        if (task.id === nextTask.id) {
          phaseName = phase.name;
          break;
        }
      }
    }
    
    const prompt = generatePrompt(nextTask, phaseName);
    
    console.log(chalk.yellow('📋 Next Task:'));
    console.log(chalk.cyan(`   ID: ${nextTask.id}`));
    console.log(chalk.cyan(`   Title: ${nextTask.title}`));
    console.log(chalk.cyan(`   Phase: ${phaseName}`));
    console.log(chalk.cyan(`   Priority: ${nextTask.priority}`));
    console.log(chalk.cyan(`   Status: ${nextTask.status}`));
    console.log(chalk.cyan(`   Est. Time: ${nextTask.estimatedTime}`));
    
    console.log(chalk.yellow('\n💬 Generated Prompt:\n'));
    console.log(prompt);
    
    // Show dependencies if any
    if (nextTask.dependencies && nextTask.dependencies.length > 0) {
      console.log(chalk.yellow('\n⚠️  Dependencies:'));
      for (const dep of nextTask.dependencies) {
        console.log(chalk.cyan(`   - ${dep}`));
      }
      console.log('');
    }
    
    console.log(chalk.gray('---\n'));
    console.log(chalk.gray('Commands:'));
    console.log(chalk.gray(`  npm run status     # Show overall progress`));
    console.log(chalk.gray(`  npm run next       # Show next task`));
    console.log(chalk.gray(`  npm run update -- ${nextTask.id}  # Mark as complete\n`));
    
  } catch (error) {
    console.error(chalk.red('❌ Error:', error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

main();

