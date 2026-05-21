import { existsSync, mkdirSync, readdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const distDir = resolve(rootDir, 'dist');
const tauriDir = resolve(rootDir, 'src-tauri');

await mkdir(distDir, { recursive: true });

function tomlWindowsPath(value) {
  return value.replace(/\\/g, '\\\\');
}

function findMsvcLinker() {
  const roots = [
    resolve(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Microsoft Visual Studio'),
    resolve(process.env.ProgramFiles || 'C:\\Program Files', 'Microsoft Visual Studio'),
  ];

  for (const root of roots) {
    if (!existsSync(root)) continue;
    const years = readdirSync(root, { withFileTypes: true }).filter(entry => entry.isDirectory());
    for (const year of years) {
      const yearDir = resolve(root, year.name);
      const editions = readdirSync(yearDir, { withFileTypes: true }).filter(entry => entry.isDirectory());
      for (const edition of editions) {
        const msvcDir = resolve(yearDir, edition.name, 'VC', 'Tools', 'MSVC');
        if (!existsSync(msvcDir)) continue;
        const versions = readdirSync(msvcDir, { withFileTypes: true })
          .filter(entry => entry.isDirectory())
          .map(entry => entry.name)
          .sort()
          .reverse();
        for (const version of versions) {
          const linker = resolve(msvcDir, version, 'bin', 'Hostx64', 'x64', 'link.exe');
          if (existsSync(linker)) {
            return {
              linker,
              libDir: resolve(msvcDir, version, 'lib', 'x64'),
            };
          }
        }
      }
    }
  }

  return null;
}

function ensureTestCargoHome() {
  const cargoHome = resolve(tauriDir, 'target', 'cargo-home-tests');
  mkdirSync(cargoHome, { recursive: true });

  const userCargoHome = process.env.CARGO_HOME || resolve(process.env.USERPROFILE || '', '.cargo');
  const userRegistry = resolve(userCargoHome, 'registry');
  const localRegistry = resolve(cargoHome, 'registry');
  if (!existsSync(localRegistry) && existsSync(userRegistry)) {
    symlinkSync(userRegistry, localRegistry, 'junction');
  }

  const rustupHome = process.env.RUSTUP_HOME || resolve(process.env.USERPROFILE || '', '.rustup');
  const msvc = findMsvcLinker();
  const linker =
    msvc?.linker ||
    resolve(
      rustupHome,
      'toolchains',
      'stable-x86_64-pc-windows-msvc',
      'lib',
      'rustlib',
      'x86_64-pc-windows-msvc',
      'bin',
      'rust-lld.exe'
    );
  const userProfile = process.env.USERPROFILE || '';
  const libPaths = [
    msvc?.libDir,
    resolve(userProfile, 'WinSDK_NuGet', 'c', 'um', 'x64'),
    resolve(userProfile, 'WinSDK_NuGet', 'c', 'ucrt', 'x64'),
    resolve(userProfile, 'WinLibs'),
  ].filter(Boolean);
  const rustflags = libPaths.map(libPath => `  "-C", "link-arg=/LIBPATH:${tomlWindowsPath(libPath)}"`).join(',\n');
  const config = `[target.x86_64-pc-windows-msvc]
linker = "${tomlWindowsPath(linker)}"
rustflags = [
${rustflags},
  "-C", "link-arg=/DEFAULTLIB:vcruntime140"
]
`;
  writeFileSync(resolve(cargoHome, 'config.toml'), config, 'utf8');

  return cargoHome;
}

const env = {
  ...process.env,
  CARGO_HOME: ensureTestCargoHome(),
  RUST_MIN_STACK: process.env.RUST_MIN_STACK || '67108864',
};
// Keep test/proc-macro builds away from global linker flags such as crt_stub_exe,
// which can crash rustc while loading generated DLLs on Windows.
delete env.RUSTFLAGS;
delete env.CARGO_ENCODED_RUSTFLAGS;

const child = spawn('cargo', ['test', '--lib'], {
  cwd: tauriDir,
  stdio: 'inherit',
  shell: false,
  env,
});

child.on('error', error => {
  console.error(`[run-rust-tests] failed to start cargo: ${error.message}`);
  process.exit(1);
});

child.on('exit', code => {
  process.exit(code ?? 1);
});
