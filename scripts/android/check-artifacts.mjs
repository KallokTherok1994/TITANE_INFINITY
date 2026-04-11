import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const androidRoot = path.join(repoRoot, 'src-tauri', 'gen', 'android');
const outputsRoot = path.join(androidRoot, 'app', 'build', 'outputs');
const apkRoot = path.join(outputsRoot, 'apk');
const bundleRoot = path.join(outputsRoot, 'bundle');
const gradleFile = path.join(androidRoot, 'app', 'build.gradle.kts');

function exists(filePath) {
  return fs.existsSync(filePath);
}

function collectArtifacts(root, extension) {
  if (!exists(root)) return [];
  const found = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(absolute);
      } else if (entry.isFile() && absolute.endsWith(extension)) {
        found.push(path.relative(repoRoot, absolute));
      }
    }
  }
  return found.sort();
}

const initReady = exists(path.join(androidRoot, 'settings.gradle')) && exists(gradleFile);
const apkArtifacts = collectArtifacts(apkRoot, '.apk');
const bundleArtifacts = collectArtifacts(bundleRoot, '.aab');
const gradleContent = exists(gradleFile) ? fs.readFileSync(gradleFile, 'utf8') : '';
const hasSigningConfig = /signingConfig\s*=/.test(gradleContent);

console.log('ANDROID_ARTIFACT_REPORT');
console.log(`init_ready=${initReady ? 'yes' : 'no'}`);
console.log(`apk_count=${apkArtifacts.length}`);
console.log(`aab_count=${bundleArtifacts.length}`);
console.log(`explicit_signing_config=${hasSigningConfig ? 'yes' : 'no'}`);
console.log(
  `strongest_honest_target=${hasSigningConfig ? 'unsigned-or-signed-release-depends-on-local-config' : 'debug-apk-or-unsigned-release-apk'}`
);
console.log(
  'expected_debug_hint=src-tauri/gen/android/app/build/outputs/apk/**/debug/*.apk'
);
console.log(
  'expected_release_hint=src-tauri/gen/android/app/build/outputs/apk/**/release/*.apk'
);
console.log(
  'expected_bundle_hint=src-tauri/gen/android/app/build/outputs/bundle/**/**/*.aab'
);

if (apkArtifacts.length > 0) {
  console.log('apk_artifacts:');
  for (const artifact of apkArtifacts) console.log(`- ${artifact}`);
} else {
  console.log('apk_artifacts: none found');
}

if (bundleArtifacts.length > 0) {
  console.log('aab_artifacts:');
  for (const artifact of bundleArtifacts) console.log(`- ${artifact}`);
} else {
  console.log('aab_artifacts: none found');
}

if (!hasSigningConfig) {
  console.log(
    'signing_note=no Android keystore/signingConfig is declared in src-tauri/gen/android/app/build.gradle.kts'
  );
}
