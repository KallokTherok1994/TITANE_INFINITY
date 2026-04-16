import { spawnSync } from 'node:child_process';

const steps = [
  {
    name: 'sync-versions',
    command: 'corepack',
    args: ['pnpm', 'run', 'sync:versions'],
  },
  {
    name: 'gen-tauri-config-force',
    command: 'corepack',
    args: ['pnpm', 'run', 'gen:tauri-config:force'],
  },
  {
    name: 'android-build-mock-debug',
    command: 'corepack',
    args: ['pnpm', 'run', 'android:build:mock:debug'],
  },
  {
    name: 'android-artifact-check',
    command: 'corepack',
    args: ['pnpm', 'run', 'android:artifact:check'],
  },
];

console.log('ANDROID_BUILD_CANONICAL');

for (const step of steps) {
  console.log(`step=${step.name}`);
  const result = spawnSync(step.command, step.args, {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.error) {
    console.error(`status=FAIL step=${step.name} error=${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`status=FAIL step=${step.name} exit=${result.status ?? 1}`);
    process.exit(result.status ?? 1);
  }
}

console.log('status=PASS');
