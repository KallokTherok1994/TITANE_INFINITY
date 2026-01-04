// ══════════════════════════════════════════════════════════════════════════════
// TITANE∞ - DevOps Commands v19.0
// ══════════════════════════════════════════════════════════════════════════════
// Commandes Tauri pour le DevOpsDashboard
// Permettent l'exécution de commandes système et la récupération de statistiques
// ══════════════════════════════════════════════════════════════════════════════

#[allow(dead_code)]
use serde::{Deserialize, Serialize};
use std::process::Command;

const WORKSPACE_DIR: &str = "/home/titane/Documents/TITANE_INFINITY";

#[derive(Debug, Clone, Copy)]
enum AllowedCommand {
    PnpmRunBuild,
    PnpmTypeCheck,
    PnpmTest,
    PnpmClean,
    CargoCheck,
    CargoClippy,
    CargoBuild,
    CargoBuildRelease,
    AutoBuildScript,
    InstallerScript,
    GitStatus,
    GitLogRecent,
}

impl AllowedCommand {
    fn from_input(input: &str) -> Option<Self> {
        match input.trim() {
            "corepack pnpm run build" => Some(Self::PnpmRunBuild),
            "corepack pnpm run type-check" => Some(Self::PnpmTypeCheck),
            "corepack pnpm run test" => Some(Self::PnpmTest),
            "corepack pnpm run clean" => Some(Self::PnpmClean),
            "pnpm run build" => Some(Self::PnpmRunBuild),
            "pnpm run type-check" => Some(Self::PnpmTypeCheck),
            "pnpm run test" => Some(Self::PnpmTest),
            "pnpm run clean" => Some(Self::PnpmClean),
            "cargo check" => Some(Self::CargoCheck),
            "cargo clippy" => Some(Self::CargoClippy),
            "cargo build" => Some(Self::CargoBuild),
            "cargo build --release" => Some(Self::CargoBuildRelease),
            "./autobuild_full.sh" => Some(Self::AutoBuildScript),
            "./titane_installer.sh" => Some(Self::InstallerScript),
            "git status" => Some(Self::GitStatus),
            "git log --oneline -10" => Some(Self::GitLogRecent),
            _ => None,
        }
    }

    fn build_command(&self) -> Command {
        match self {
            Self::PnpmRunBuild => {
                let mut cmd = Command::new("pnpm");
                cmd.args(["run", "build"]);
                cmd
            }
            Self::PnpmTypeCheck => {
                let mut cmd = Command::new("pnpm");
                cmd.args(["run", "type-check"]);
                cmd
            }
            Self::PnpmTest => {
                let mut cmd = Command::new("pnpm");
                cmd.args(["run", "test"]);
                cmd
            }
            Self::PnpmClean => {
                let mut cmd = Command::new("pnpm");
                cmd.args(["run", "clean"]);
                cmd
            }
            Self::CargoCheck => {
                let mut cmd = Command::new("cargo");
                cmd.arg("check");
                cmd
            }
            Self::CargoClippy => {
                let mut cmd = Command::new("cargo");
                cmd.args(["clippy"]);
                cmd
            }
            Self::CargoBuild => {
                let mut cmd = Command::new("cargo");
                cmd.arg("build");
                cmd
            }
            Self::CargoBuildRelease => {
                let mut cmd = Command::new("cargo");
                cmd.args(["build", "--release"]);
                cmd
            }
            Self::AutoBuildScript => {
                let mut cmd = Command::new("sh");
                cmd.arg("./autobuild_full.sh");
                cmd
            }
            Self::InstallerScript => {
                let mut cmd = Command::new("sh");
                cmd.arg("./titane_installer.sh");
                cmd
            }
            Self::GitStatus => {
                let mut cmd = Command::new("git");
                cmd.arg("status");
                cmd
            }
            Self::GitLogRecent => {
                let mut cmd = Command::new("git");
                cmd.args(["log", "--oneline", "-10"]);
                cmd
            }
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DevOpsStats {
    pub cpu_usage: String,
    pub memory_usage: String,
    pub processes_count: u32,
    pub uptime: String,
    pub cargo_status: String,
    pub npm_status: String,
}

/// Exécute une commande shell DevOps (build, test, clean, etc.)
#[tauri::command]
pub async fn devops_run(cmd: String) -> Result<String, String> {
    log::info!("🚀 DevOps command execution request: {}", cmd);

    let allowed = AllowedCommand::from_input(&cmd).ok_or_else(|| {
        log::warn!("🚫 DevOps command rejected (not in whitelist): {}", cmd);
        format!("Commande non autorisée: {}", cmd)
    })?;

    let mut command = allowed.build_command();
    command.current_dir(WORKSPACE_DIR);

    let output = command.output().map_err(|e| {
        log::error!("❌ DevOps command execution error: {}", e);
        format!("Erreur d'exécution: {}", e)
    })?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    let result = if output.status.success() {
        log::info!("✅ DevOps command success: {}", cmd);
        format!("✅ SUCCESS\n\n{}\n{}", stdout, stderr)
    } else {
        log::warn!("⚠️ DevOps command failed: {}", cmd);
        format!(
            "❌ ERROR (exit code: {:?})\n\n{}\n{}",
            output.status.code(),
            stdout,
            stderr
        )
    };

    Ok(result)
}

/// Récupère les statistiques système pour le DevOpsDashboard
#[tauri::command]
pub async fn devops_stats() -> Result<DevOpsStats, String> {
    log::debug!("📊 DevOps stats requested");

    // CPU Usage
    let cpu_output = Command::new("sh")
        .arg("-c")
        .arg("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1")
        .output()
        .map_err(|e| format!("CPU check error: {}", e))?;
    let cpu_usage = String::from_utf8_lossy(&cpu_output.stdout)
        .trim()
        .to_string();

    // Memory Usage
    let mem_output = Command::new("sh")
        .arg("-c")
        .arg("free -m | awk 'NR==2{printf \"%s/%sMB (%.0f%%)\", $3,$2,$3*100/$2 }'")
        .output()
        .map_err(|e| format!("Memory check error: {}", e))?;
    let memory_usage = String::from_utf8_lossy(&mem_output.stdout)
        .trim()
        .to_string();

    // Process Count
    let proc_output = Command::new("sh")
        .arg("-c")
        .arg("ps aux | wc -l")
        .output()
        .map_err(|e| format!("Process count error: {}", e))?;
    let processes_count = String::from_utf8_lossy(&proc_output.stdout)
        .trim()
        .parse::<u32>()
        .unwrap_or(0);

    // Uptime
    let uptime_output = Command::new("sh")
        .arg("-c")
        .arg("uptime -p | sed 's/up //'")
        .output()
        .map_err(|e| format!("Uptime check error: {}", e))?;
    let uptime = String::from_utf8_lossy(&uptime_output.stdout)
        .trim()
        .to_string();

    // Cargo Status (vérifie si Cargo compile sans erreurs)
    let cargo_check = Command::new("cargo")
        .arg("check")
        .arg("--manifest-path")
        .arg("src-tauri/Cargo.toml")
        .current_dir(WORKSPACE_DIR)
        .output()
        .map_err(|e| format!("Cargo check error: {}", e))?;
    let cargo_status = if cargo_check.status.success() {
        "✅ OK".to_string()
    } else {
        "❌ ERRORS".to_string()
    };

    // PNPM Status (vérifie si TypeScript compile sans erreurs)
    // NOTE: on conserve le champ `npm_status` pour compat UI.
    let npm_check = Command::new("pnpm")
        .arg("run")
        .arg("type-check")
        .current_dir(WORKSPACE_DIR)
        .output()
        .map_err(|e| format!("PNPM check error: {}", e))?;
    let npm_status = if npm_check.status.success() {
        "✅ OK".to_string()
    } else {
        let error_count = String::from_utf8_lossy(&npm_check.stdout)
            .lines()
            .filter(|l| l.starts_with("src/"))
            .count();
        format!("⚠️ {} errors", error_count)
    };

    let stats = DevOpsStats {
        cpu_usage,
        memory_usage,
        processes_count,
        uptime,
        cargo_status,
        npm_status,
    };

    log::debug!("📊 DevOps stats: {:?}", stats);
    Ok(stats)
}
