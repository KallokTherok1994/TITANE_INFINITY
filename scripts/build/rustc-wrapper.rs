// RUSTC_WRAPPER for TITANE∞ Windows builds.
//
// Compiled as a native .exe so it is invoked via CreateProcess (no CMD 8191-
// char limit).
//
// Proc-macro DLLs: strip all custom CRT link-args so crt_stub.o TLS does not
// crash rustc when it loads the DLL via LoadLibrary().
//
// Build script EXEs (crate_name starts with "build_script"):
// - Replace /STACK:8388608 with /STACK:134217728,134217728 (128MB reserve+commit).
//   Pre-committing the full stack avoids guard-page probing via __chkstk, which
//   is unreliable in our custom-CRT environment.
// - Inject /DEFAULTLIB:ucrt for math functions (roundf etc. from ucrtbase.dll).
//
// Final binary links (crate-type includes staticlib, cdylib, or bin):
// - Inject /DEFAULTLIB:ucrt so the final linked EXE/DLL finds math functions.
//   This is injected only at link time (not for rlib compilations) to avoid
//   invalidating the compiled rlib cache.
//
// Compile once:
//   rustc --edition 2021 -C opt-level=2 --target x86_64-pc-windows-msvc \
//         scripts/build/rustc-wrapper.rs \
//         -o scripts/build/rustc-wrapper.exe
//
// Then in .cargo/config.toml:
//   rustc-wrapper = "C:\\Dev\\TITANE_INFINITY\\scripts\\build\\rustc-wrapper.exe"

use std::process;

// Stripped from proc-macro DLL compilations (crt_stub.o causes TLS crash
// when rustc loads the DLL via LoadLibrary).
const STRIP_PROC_MACRO: &[&str] = &[
    "link-arg=/LIBPATH:C:\\Users\\Kevin\\WinSDK_NuGet\\c\\um\\x64",
    "link-arg=/LIBPATH:C:\\Users\\Kevin\\WinSDK_NuGet\\c\\ucrt\\x64",
    "link-arg=/LIBPATH:C:\\Users\\Kevin\\WinLibs",
    "link-arg=C:\\Users\\Kevin\\WinLibs\\crt_stub.o",
    "link-arg=/DEFAULTLIB:crt_stub_exe",
    "link-arg=/DEFAULTLIB:vcruntime140",
    "link-arg=/DEFAULTLIB:ucrt",
    "link-arg=/STACK:8388608",
];

// Stripped from build script EXEs (replaced with the larger pre-committed stack below).
const STRIP_BUILD_SCRIPT: &[&str] = &[
    "link-arg=/STACK:8388608",
];

fn main() {
    let all_args: Vec<String> = std::env::args().collect();
    if all_args.len() < 2 {
        eprintln!("rustc-wrapper: no rustc path given");
        process::exit(1);
    }
    let rustc = &all_args[1];
    let args = &all_args[2..];

    let is_proc_macro = args.windows(2).any(|w| w[0] == "--crate-type" && w[1] == "proc-macro")
        || args.iter().any(|a| a.starts_with("--crate-type=") && a.contains("proc-macro"));

    let crate_name = args.windows(2)
        .find(|w| w[0] == "--crate-name")
        .map(|w| w[1].as_str())
        .or_else(|| args.iter().find(|a| a.starts_with("--crate-name="))
            .map(|a| a.splitn(2, '=').nth(1).unwrap_or("?")))
        .unwrap_or("?");

    let is_build_script = crate_name.starts_with("build_script");

    // Detect final binary link (crate-type includes staticlib, cdylib, or bin).
    // Inject /DEFAULTLIB:ucrt only here so rlib cache keys stay unchanged.
    let is_final_link = !is_proc_macro && !is_build_script && {
        let mut found = false;
        let mut i = 0;
        while i < args.len() {
            let val: &str = if args[i] == "--crate-type" && i + 1 < args.len() {
                i += 1;
                &args[i]
            } else if args[i].starts_with("--crate-type=") {
                &args[i]["--crate-type=".len()..]
            } else {
                i += 1;
                continue;
            };
            if val.contains("staticlib") || val.contains("cdylib") || val == "bin" {
                found = true;
                break;
            }
            i += 1;
        }
        found
    };

    eprintln!("[wrapper] crate={crate_name} proc_macro={is_proc_macro} build_script={is_build_script} final_link={is_final_link}");

    let mut final_args: Vec<&str> = Vec::with_capacity(args.len() + 4);

    if is_proc_macro {
        let mut i = 0;
        while i < args.len() {
            if args[i] == "-C" && i + 1 < args.len() && STRIP_PROC_MACRO.contains(&args[i + 1].as_str()) {
                i += 2;
                continue;
            }
            final_args.push(args[i].as_str());
            i += 1;
        }
    } else if is_build_script {
        let mut i = 0;
        while i < args.len() {
            if args[i] == "-C" && i + 1 < args.len() && STRIP_BUILD_SCRIPT.contains(&args[i + 1].as_str()) {
                i += 2;
                continue;
            }
            final_args.push(args[i].as_str());
            i += 1;
        }
        // 128MB pre-committed stack + ucrt for math functions (roundf etc.)
        final_args.push("-C");
        final_args.push("link-arg=/STACK:134217728,134217728");
        final_args.push("-C");
        final_args.push("link-arg=/DEFAULTLIB:ucrt");
    } else if is_final_link {
        for a in args {
            final_args.push(a.as_str());
        }
        // Inject ucrt only at final link time (not rlib compile) to keep rlib cache valid
        final_args.push("-C");
        final_args.push("link-arg=/DEFAULTLIB:ucrt");
    } else {
        for a in args {
            final_args.push(a.as_str());
        }
    }

    let status = process::Command::new(rustc)
        .args(&final_args)
        .status()
        .unwrap_or_else(|e| {
            eprintln!("rustc-wrapper: failed to exec {rustc}: {e}");
            process::exit(1);
        });

    process::exit(status.code().unwrap_or(1));
}
