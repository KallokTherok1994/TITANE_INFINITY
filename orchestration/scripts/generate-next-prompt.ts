#!/usr/bin/env ts-node
import { readFileSync } from 'fs';
import YAML from 'yaml';
import clipboardy from 'clipboardy';
import chalk from 'chalk';

interface Task {
  id: string;
  title: string;
  description: string;
  files: string[];
  tests: string[];
  estimated_time: string;
  dependencies: string[];
  status: string;
}

function loadRoadmap() {
  const content = readFileSync('./roadmap.yaml', 'utf8');
  return YAML.parse(content);
}

function getNextTask(roadmap: Record<string, unknown>): Task | null {
  const completed = new Set(
    (roadmap.state as Record<string, unknown>).completed_tasks as string[]
  );

  for (let i = 0; i <= 3; i++) {
    const phase = roadmap[`phase_${i}`] as Record<string, unknown>;
    if (!phase) continue;

    for (const task of phase.tasks as Task[]) {
      if (
        task.status === 'pending' &&
        task.dependencies.every((d: string) => completed.has(d))
      ) {
        return task;
      }
    }
  }
  return null;
}

function generatePrompt(task: Task): string {
  return `
# 🎯 TÂCHE ${task.id} — ${task.title}

## Objectif
${task.description.trim()}

## Fichiers
${task.files.length > 0 ? task.files.map(f => `- ${f}`).join('\n') : '_Aucun_'}

## Tests
${task.tests.map(t => `- \`${t}\``).join('\n')}

## Estimation
${task.estimated_time}

Suis le workflow TDD du Conductor.
`.trim();
}

function main() {
  console.log(chalk.cyan('\n🎯 TITANE — Next Prompt\n'));

  const roadmap = loadRoadmap();
  const task = getNextTask(roadmap);

  if (!task) {
    console.log(chalk.green('✅ Toutes tâches complétées !\n'));
    return;
  }

  const prompt = generatePrompt(task);

  try {
    clipboardy.writeSync(prompt);
    console.log(chalk.green(`✅ Prompt généré : ${task.id}`));
    console.log(chalk.yellow('📎 Copié dans clipboard !\n'));
  } catch {
    console.log(chalk.yellow('⚠️  Clipboard unavailable'));
  }

  console.log(chalk.gray('─'.repeat(60)));
  console.log(prompt);
  console.log(chalk.gray('─'.repeat(60) + '\n'));
}

main();
