#!/usr/bin/env ts-node

/**
 * TITANE Orchestration — Batch Progress Status
 * 
 * Shows overall project progress, phase completion, and next steps.
 */

import * as fs from 'fs';
import * as path from 'path';
import YAML from 'yaml';
import chalk from 'chalk';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
}

interface Phase {
  name: string;
  tasks: Task[];
}

interface Roadmap {
  phases: Phase[];
}

async function loadRoadmap(): Promise<Roadmap> {
  const roadmapPath = path.join(__dirname, '../roadmap.yaml');
  const content = fs.readFileSync(roadmapPath, 'utf-8');
  return YAML.parse(content);
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'done':
      return '✅';
    case 'in-progress':
      return '🔄';
    case 'review':
      return '👀';
    case 'todo':
      return '⏳';
    default:
      return '❓';
  }
}

async function main() {
  try {
    const roadmap = await loadRoadmap();
    
    console.log(chalk.cyan.bold('\n📊 TITANE_INFINITY Orchestration Progress\n'));
    
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    
    // Show per-phase breakdown
    for (const phase of roadmap.phases) {
      const phaseTotal = phase.tasks.length;
      let phaseCompleted = 0;
      let phaseInProgress = 0;
      
      for (const task of phase.tasks) {
        totalTasks++;
        if (task.status === 'done') {
          phaseCompleted++;
          completedTasks++;
        } else if (task.status === 'in-progress') {
          phaseInProgress++;
          inProgressTasks++;
        }
      }
      
      const percentage = Math.round((phaseCompleted / phaseTotal) * 100);
      const bar = '█'.repeat(Math.floor(percentage / 5)) + 
                  '░'.repeat(20 - Math.floor(percentage / 5));
      
      console.log(chalk.cyan(`${phase.name}`));
      console.log(chalk.gray(`  ${getStatusEmoji('done')} ${phaseCompleted}/${phaseTotal} complete (${percentage}%)`));
      console.log(chalk.gray(`  [${bar}]\n`));
    }
    
    // Overall summary
    const overallPercentage = Math.round((completedTasks / totalTasks) * 100);
    const overallBar = '█'.repeat(Math.floor(overallPercentage / 5)) +
                       '░'.repeat(20 - Math.floor(overallPercentage / 5));
    
    console.log(chalk.yellow.bold('\n📈 Overall Status\n'));
    console.log(chalk.cyan(`✅ Completed  : ${completedTasks}/${totalTasks} tasks`));
    console.log(chalk.yellow(`🔄 In Progress: ${inProgressTasks} tasks`));
    console.log(chalk.gray(`⏳ Remaining  : ${totalTasks - completedTasks - inProgressTasks} tasks\n`));
    console.log(chalk.cyan(`[${overallBar}] ${overallPercentage}%\n`));
    
    // Find next task
    let nextTask = null;
    let nextPhase = '';
    
    for (const phase of roadmap.phases) {
      for (const task of phase.tasks) {
        if (task.status === 'todo' || task.status === 'in-progress') {
          nextTask = task;
          nextPhase = phase.name;
          break;
        }
      }
      if (nextTask) break;
    }
    
    if (nextTask) {
      console.log(chalk.yellow.bold('🎯 Next Task\n'));
      console.log(chalk.cyan(`ID    : ${nextTask.id}`));
      console.log(chalk.cyan(`Phase : ${nextPhase}`));
      console.log(chalk.cyan(`Title : ${nextTask.title}`));
      console.log(chalk.cyan(`Status: ${getStatusEmoji(nextTask.status)} ${nextTask.status}\n`));
      console.log(chalk.gray('Run: npm run next\n'));
    } else {
      console.log(chalk.green.bold('🎉 ALL TASKS COMPLETE!\n'));
    }
    
    // Show commands
    console.log(chalk.gray.bold('Commands:\n'));
    console.log(chalk.gray('  npm run next                # Show next task with prompt'));
    console.log(chalk.gray('  npm run update -- <ID>      # Mark task as done'));
    console.log(chalk.gray('  npm run update -- <ID> <status>  # Update task status'));
    console.log(chalk.gray('  npm run status              # Show this progress\n'));
    
    console.log(chalk.gray('Statuses: todo, in-progress, review, done\n'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error:', error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

main();
