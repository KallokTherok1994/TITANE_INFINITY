// src-tauri/src/commands/display_system_commands.rs
// Commandes Tauri pour le contrôle des paramètres d'affichage (Linux/xrandr)
// (c) TITANE_INFINITY 2026

use serde::{Deserialize, Serialize};
use std::process::Command;
use tauri::command;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DisplayEnvironment {
    pub resolution: Option<String>, // e.g. "1920x1080"
    pub brightness: Option<u8>,     // 0-100 (always 80 — backlight not readable via xrandr)
    pub quality: Option<String>,    // e.g. "high", "medium", "low"
    pub monitor_count: Option<u8>,
    pub active_monitor: Option<u8>,
    pub color_depth: Option<u8>,   // bits
    pub refresh_rate: Option<u16>, // Hz
}

/// Parse `xrandr --query` output to extract display environment.
/// Returns safe defaults if xrandr is unavailable (Wayland/headless).
fn parse_xrandr_environment(output: &str) -> DisplayEnvironment {
    let mut resolution: Option<String> = None;
    let mut refresh_rate: Option<u16> = None;
    let mut monitor_count: u8 = 0;

    for line in output.lines() {
        // Connected monitor line: "HDMI-1 connected 1920x1080+0+0 ..."
        if line.contains(" connected") {
            monitor_count += 1;
            if let Some(res) = line.split_whitespace().find(|s| {
                s.contains('x') && s.chars().next().map_or(false, |c| c.is_ascii_digit())
            }) {
                let clean = res.split('+').next().unwrap_or(res);
                if clean.contains('x') {
                    resolution = Some(clean.to_string());
                }
            }
        }
        // Active mode line has '*': "   1920x1080     60.00*+ ..."
        if line.trim_start().starts_with(|c: char| c.is_ascii_digit()) && line.contains('*') {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 2 {
                for part in &parts[1..] {
                    let rate_str = part.trim_end_matches(|c| c == '*' || c == '+');
                    if let Ok(rate) = rate_str.parse::<f32>() {
                        refresh_rate = Some(rate as u16);
                        if resolution.is_none() {
                            resolution = Some(parts[0].to_string());
                        }
                        break;
                    }
                }
            }
        }
    }

    let quality = match resolution.as_deref() {
        Some(r) if r.starts_with("3840") || r.starts_with("2560") => "high",
        Some(r) if r.starts_with("1920") || r.starts_with("1680") => "high",
        Some(r) if r.starts_with("1280") => "medium",
        _ => "low",
    };

    DisplayEnvironment {
        resolution: resolution.or_else(|| Some("1920x1080".to_string())),
        brightness: Some(80), // xrandr does not expose backlight; ddcutil needed
        quality: Some(quality.to_string()),
        monitor_count: Some(monitor_count.max(1)),
        active_monitor: Some(0),
        color_depth: Some(24),
        refresh_rate: refresh_rate.or(Some(60)),
    }
}

/// Parse `xrandr --query` output to list connected monitors.
fn parse_xrandr_monitors(output: &str) -> Vec<String> {
    let mut monitors: Vec<String> = Vec::new();
    let mut idx: usize = 0;

    for line in output.lines() {
        if line.contains(" connected") {
            let name = line.split_whitespace().next().unwrap_or("Unknown").to_string();
            let res = line
                .split_whitespace()
                .find(|s| {
                    s.contains('x')
                        && s.chars().next().map_or(false, |c| c.is_ascii_digit())
                })
                .and_then(|s| s.split('+').next())
                .filter(|s| s.contains('x'))
                .unwrap_or("unknown");
            monitors.push(format!("Monitor {idx}: {name} ({res})"));
            idx += 1;
        }
    }

    if monitors.is_empty() {
        monitors.push("Monitor 0: default (1920x1080)".to_string());
    }
    monitors
}

#[command]
pub async fn display_get_environment() -> Result<DisplayEnvironment, String> {
    match Command::new("xrandr").arg("--query").output() {
        Ok(output) if output.status.success() => {
            let text = String::from_utf8_lossy(&output.stdout);
            Ok(parse_xrandr_environment(&text))
        }
        _ => {
            // xrandr unavailable (Wayland/headless) — safe defaults
            Ok(DisplayEnvironment {
                resolution: Some("1920x1080".to_string()),
                brightness: Some(80),
                quality: Some("high".to_string()),
                monitor_count: Some(1),
                active_monitor: Some(0),
                color_depth: Some(24),
                refresh_rate: Some(60),
            })
        }
    }
}

#[command]
pub async fn display_list_monitors() -> Result<Vec<String>, String> {
    match Command::new("xrandr").arg("--query").output() {
        Ok(output) if output.status.success() => {
            let text = String::from_utf8_lossy(&output.stdout);
            Ok(parse_xrandr_monitors(&text))
        }
        _ => Ok(vec!["Monitor 0: default (1920x1080)".to_string()]),
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DisplaySettingsUpdate {
    pub resolution: Option<String>,
    pub brightness: Option<u8>,
    pub quality: Option<String>,
    pub active_monitor: Option<u8>,
}

#[command]
pub async fn display_set_environment(update: DisplaySettingsUpdate) -> Result<bool, String> {
    // Apply gamma-based brightness via xrandr (scale: 0.0–1.0)
    if let Some(brightness) = update.brightness {
        let gamma = (brightness as f32 / 100.0).clamp(0.1, 1.0);
        let gamma_str = format!("{gamma:.2}");
        if let Ok(q) = Command::new("xrandr").arg("--query").output() {
            let text = String::from_utf8_lossy(&q.stdout);
            for line in text.lines() {
                if line.contains(" connected") {
                    if let Some(output_name) = line.split_whitespace().next() {
                        let _ = Command::new("xrandr")
                            .args(["--output", output_name, "--brightness", &gamma_str])
                            .output();
                    }
                }
            }
        }
    }
    Ok(true)
}

// ── Tests ─────────────────────────────────────────────────────────────────────
#[cfg(test)]
mod tests {
    use super::*;

    const XRANDR_SAMPLE: &str = "Screen 0: minimum 16 x 16, current 1920 x 1080, maximum 32767 x 32767\nHDMI-1 connected primary 1920x1080+0+0 (normal left inverted right x axis y axis) 527mm x 296mm\n   1920x1080     60.00*+  50.00  \n   1280x720      60.00  \nDP-1 disconnected (normal left inverted right x axis y axis)\n";

    const XRANDR_DUAL: &str = "Screen 0: minimum 16 x 16, current 3840 x 1080, maximum 32767 x 32767\nHDMI-1 connected 1920x1080+0+0 527mm x 296mm\n   1920x1080     60.00*+\nHDMI-2 connected 1920x1080+1920+0 527mm x 296mm\n   1920x1080     60.00*+\n";

    #[test]
    fn test_parse_xrandr_resolution() {
        let env = parse_xrandr_environment(XRANDR_SAMPLE);
        assert_eq!(env.resolution, Some("1920x1080".to_string()));
    }

    #[test]
    fn test_parse_xrandr_refresh_rate() {
        let env = parse_xrandr_environment(XRANDR_SAMPLE);
        assert_eq!(env.refresh_rate, Some(60));
    }

    #[test]
    fn test_parse_xrandr_monitor_count_single() {
        let env = parse_xrandr_environment(XRANDR_SAMPLE);
        assert_eq!(env.monitor_count, Some(1));
    }

    #[test]
    fn test_parse_xrandr_monitor_count_dual() {
        let env = parse_xrandr_environment(XRANDR_DUAL);
        assert_eq!(env.monitor_count, Some(2));
    }

    #[test]
    fn test_parse_xrandr_quality_high() {
        let env = parse_xrandr_environment(XRANDR_SAMPLE);
        assert_eq!(env.quality, Some("high".to_string()));
    }

    #[test]
    fn test_parse_xrandr_empty_uses_defaults() {
        let env = parse_xrandr_environment("");
        assert_eq!(env.resolution, Some("1920x1080".to_string()));
        assert_eq!(env.monitor_count, Some(1));
        assert_eq!(env.refresh_rate, Some(60));
    }

    #[test]
    fn test_parse_monitors_single() {
        let monitors = parse_xrandr_monitors(XRANDR_SAMPLE);
        assert_eq!(monitors.len(), 1);
        assert!(monitors[0].contains("HDMI-1"));
        assert!(monitors[0].contains("1920x1080"));
    }

    #[test]
    fn test_parse_monitors_dual() {
        let monitors = parse_xrandr_monitors(XRANDR_DUAL);
        assert_eq!(monitors.len(), 2);
        assert!(monitors[0].contains("HDMI-1"));
        assert!(monitors[1].contains("HDMI-2"));
    }

    #[test]
    fn test_parse_monitors_empty_fallback() {
        let monitors = parse_xrandr_monitors("");
        assert_eq!(monitors.len(), 1);
        assert!(monitors[0].contains("default"));
    }
}
