#!/usr/bin/env ts-node
import { readFileSync, writeFileSync } from 'fs';
import YAML from 'yaml';
import chalk from 'chalk';

function updateTaskStatus(taskId: string, status: 'completed' | 'failed') {
  const content = readFileSync('./roadmap.yaml', 'utf8');
  const roadmap = YAML.parse(content);
  
  for (let i = 0; i <= 3; i++) {
    const phase = roadmap[`phase_${i}`];
    if (!phase) continue;
    
    const task = phase.tasks.find((t: Record<string, unknown>) => t.id === taskId);
    if (task) {
      task.status = status;
      
      if (status === 'completed') {
        roadmap.state.completed_tasks.push(taskId);
        console.log(chalk.green(`✅ ${taskId} → completed`));
      } else {
        roadmap.state.failed_tasks.push(taskId);
        console.log(chalk.red(`❌ ${taskId} → failed`));
      }
      
      roadmap.state.last_updated = new Date().toISOString();
      writeFileSync('./roadmap.yaml', YAML.stringify(roadmap));
      console.log(chalk.green('📝 Roadmap updated\n'));
      return;
    }
  }
  
  console.error(chalk.red(`Task ${taskId} not found`));
}

const [taskId, status] = process.argv.slice(2);

if (!taskId || !status) {
  console.log(chalk.yellow('Usage: npm run update <task-id> <completed|failed>'));
  process.exit(1);
}

updateTaskStatus(taskId, status as 'completed' | 'failed');
