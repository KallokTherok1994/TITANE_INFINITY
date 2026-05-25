#!/usr/bin/env node
/**
 * RUSTC_WRAPPER for TITANE∞ Windows builds.
 *
 * Proc-macro DLLs: strip all custom CRT link-args so crt_stub.o TLS does
 * not crash rustc via LoadLibrary().
 *
 * Build script EXEs (crate_name starts with "build_script"):
 * - Replace /STACK:8388608 with /STACK:134217728,134217728 (128MB pre-commit)
 * - Inject /DEFAULTLIB:ucrt (for roundf etc. from ucrtbase.dll)
 *
 * Final binary links (crate-type includes staticlib, cdylib, or bin):
 * - Inject /DEFAULTLIB:ucrt only at link time (not for rlib compilations)
 *   to avoid invalidating the rlib cache.
 */

import { spawnSync } from 'node:child_process';

const [rustc, ...args] = process.argv.slice(2);

const isProcMacro = (() => {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--crate-type' && args[i + 1] === 'proc-macro') return true;
    if (args[i].startsWith('--crate-type=') && args[i].includes('proc-macro')) return true;
  }
  return false;
})();

const crateNameArg = (() => {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--crate-name' && i + 1 < args.length) return args[i + 1];
    if (args[i].startsWith('--crate-name=')) return args[i].slice('--crate-name='.length);
  }
  return '?';
})();

const isBuildScript = crateNameArg.startsWith('build_script');

const isFinalLink = !isProcMacro && !isBuildScript && (() => {
  for (let i = 0; i < args.length; i++) {
    let val = null;
    if (args[i] === '--crate-type' && i + 1 < args.length) val = args[i + 1];
    else if (args[i].startsWith('--crate-type=')) val = args[i].slice('--crate-type='.length);
    if (val && (val.includes('staticlib') || val.includes('cdylib') || val === 'bin')) return true;
  }
  return false;
})();

const STRIP_PROC_MACRO = new Set([
  `link-arg=/LIBPATH:C:\\Users\\Kevin\\WinSDK_NuGet\\c\\um\\x64`,
  `link-arg=/LIBPATH:C:\\Users\\Kevin\\WinSDK_NuGet\\c\\ucrt\\x64`,
  `link-arg=/LIBPATH:C:\\Users\\Kevin\\WinLibs`,
  `link-arg=C:\\Users\\Kevin\\WinLibs\\crt_stub.o`,
  `link-arg=/DEFAULTLIB:crt_stub_exe`,
  `link-arg=/DEFAULTLIB:vcruntime140`,
  `link-arg=/DEFAULTLIB:ucrt`,
  `link-arg=/STACK:8388608`,
]);

const STRIP_BUILD_SCRIPT = new Set([
  `link-arg=/STACK:8388608`,
]);

let finalArgs = args;

if (isProcMacro) {
  const filtered = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-C' && i + 1 < args.length && STRIP_PROC_MACRO.has(args[i + 1])) {
      i++;
      continue;
    }
    filtered.push(args[i]);
  }
  finalArgs = filtered;
} else if (isBuildScript) {
  const filtered = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-C' && i + 1 < args.length && STRIP_BUILD_SCRIPT.has(args[i + 1])) {
      i++;
      continue;
    }
    filtered.push(args[i]);
  }
  filtered.push('-C', 'link-arg=/STACK:134217728,134217728');
  filtered.push('-C', 'link-arg=/DEFAULTLIB:ucrt');
  finalArgs = filtered;
} else if (isFinalLink) {
  finalArgs = [...args, '-C', 'link-arg=/DEFAULTLIB:ucrt'];
}

const result = spawnSync(rustc, finalArgs, { stdio: 'inherit' });
const exitCode = result.status ?? (result.signal ? 1 : 0);
process.exit(exitCode);
