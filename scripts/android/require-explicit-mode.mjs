const mode = process.argv[2] ?? 'android';

const commandSets = {
  dev: [
    'corepack pnpm run android:dev:mock    # Android dev against mock backend',
    'corepack pnpm run android:dev:full    # Android dev against Rust full backend + LAN Ollama',
  ],
  build: [
    'corepack pnpm run android:build:mock        # Release-style APK build with mock backend',
    'corepack pnpm run android:build:mock:debug  # Debug APK build with mock backend',
    'corepack pnpm run android:build:full        # Unsigned release APK build with full backend',
    'corepack pnpm run android:build:full:debug  # Debug APK build with full backend',
  ],
  'build:debug': [
    'corepack pnpm run android:build:mock:debug  # Debug APK build with mock backend',
    'corepack pnpm run android:build:full:debug  # Debug APK build with full backend',
  ],
};

const suggestions = commandSets[mode] ?? [];

console.error(
  `ANDROID MODE LOCK: \`${mode}\` is intentionally disabled because it is ambiguous.`
);
console.error('Choose an explicit Android mode instead:');
for (const suggestion of suggestions) {
  console.error(`  - ${suggestion}`);
}
console.error('Then inspect outputs with: corepack pnpm run android:artifact:check');
process.exit(1);
