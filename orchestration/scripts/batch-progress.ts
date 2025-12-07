#!/usr/bin/env ts-node
import { readFileSync } from 'fs';
import YAML from 'yaml';
import chalk from 'chalk';

function showProgress() {
  const roadmap = YAML.parse(readFileSync('./roadmap.yaml', 'utf8'));
  
  console.log(chalk.bold.cyan('\n📊 TITANE — Progression\n'));
  
  const completed = roadmap.state.completed_tasks.length;
  const total = roadmap.metadata.total_tasks;
  const pct = Math.round((completed / total) * 100);
  
  console.log(chalk.white(`Global : ${completed}/${total} (${pct}%)`));
  console.log(chalk.gray('█'.repeat(pct / 2) + '░'.repeat(50 - pct / 2)) + '\n');
  
  for (let i = 0; i <= 3; i++) {
    const phase = roadmap[`phase_${i}`];
    if (!phase) continue;
    
    const tasks = phase.tasks;
    const done = tasks.filter((t: Record<string, unknown>) => t.status === 'completed').length;
    const pending = tasks.filter((t: Record<string, unknown>) => t.status === 'pending').length;
    
    console.log(chalk.bold(`Phase ${i} — ${phase.title}`));
    console.log(chalk.green(`  ✅ Completed : ${done}`));
    console.log(chalk.yellow(`  ⏳ Pending   : ${pending}\n`));
  }
}

showProgress();
