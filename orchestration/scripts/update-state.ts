#!/usr/bin/env ts-node

/**
 * TITANE Orchestration — Update Task Status
 * 
 * Updates orchestration/roadmap.yaml with task status.
 * Usage: npm run update -- P3-1-1
 */

import * as fs from 'fs';
import * as path from 'path';
import YAML from 'yaml';
import chalk from 'chalk';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  [key: string]: any;
}

interface Phase {
  name: string;
  tasks: Task[];
  [key: string]: any;
}

interface Roadmap {
  phases: Phase[];
  [key: string]: any;
}

async function loadRoadmap(): Promise<Roadmap> {
  const roadmapPath = path.join(__dirname, '../roadmap.yaml');
  const content = fs.readFileSync(roadmapPath, 'utf-8');
  return YAML.parse(content);
}

function saveRoadmap(roadmap: Roadmap): void {
  const roadmapPath = path.join(__dirname, '../roadmap.yaml');
  const yaml = YAML.stringify(roadmap);
  fs.writeFileSync(roadmapPath, yaml, 'utf-8');
}

function findAndUpdateTask(roadmap: Roadmap, taskId: string, newStatus: string): Task | null {
  for (const phase of roadmap.phases) {
    for (const task of phase.tasks) {
      if (task.id === taskId) {
        const oldStatus = task.status;
        task.status = newStatus as any;
        console.log(chalk.green(`✅ Updated ${taskId}: ${oldStatus} → ${newStatus}`));
        return task;
      }
    }
  }
  return null;
}

async function main() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
      console.error(chalk.red('❌ Usage: npm run update -- <TASK_ID> [status]'));
      console.error(chalk.gray('   status: todo (default), in-progress, review, done'));
      process.exit(1);
    }
    
    const taskId = args[0];
    const newStatus = args[1] || 'done';
    
    // Validate status
    const validStatuses = ['todo', 'in-progress', 'review', 'done'];
    if (!validStatuses.includes(newStatus)) {
      console.error(chalk.red(`❌ Invalid status: ${newStatus}`));
      console.error(chalk.gray(`   Valid: ${validStatuses.join(', ')}`));
      process.exit(1);
    }
    
    console.log(chalk.cyan(`\n🔄 Updating task ${taskId} to "${newStatus}"...\n`));
    
    const roadmap = await loadRoadmap();
    const task = findAndUpdateTask(roadmap, taskId, newStatus);
    
    if (!task) {
      console.error(chalk.red(`❌ Task not found: ${taskId}`));
      process.exit(1);
    }
    
    // Save updated roadmap
    saveRoadmap(roadmap);
    
    // Show statistics
    let total = 0;
    let completed = 0;
    
    for (const phase of roadmap.phases) {
      for (const t of phase.tasks) {
        total++;
        if (t.status === 'done') completed++;
      }
    }
    
    const percentage = Math.round((completed / total) * 100);
    
    console.log(chalk.green(`✅ Roadmap saved!\n`));
    console.log(chalk.cyan(`📊 Overall Progress: ${completed}/${total} (${percentage}%)`));
    console.log(chalk.cyan(`   ${'█'.repeat(Math.floor(percentage / 5))}${'░'.repeat(20 - Math.floor(percentage / 5))}\n`));
    
    // Show next task
    let nextTask = null;
    for (const phase of roadmap.phases) {
      for (const t of phase.tasks) {
        if (t.status === 'todo' || t.status === 'in-progress') {
          nextTask = t;
          break;
        }
      }
      if (nextTask) break;
    }
    
    if (nextTask) {
      console.log(chalk.yellow('📋 Next task:'));
      console.log(chalk.gray(`   ${nextTask.id}: ${nextTask.title}\n`));
      console.log(chalk.gray('   Run: npm run next\n'));
    } else {
      console.log(chalk.green('🎉 All tasks complete!\n'));
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error:', error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

main();
