/**
 * TITANE∞ v14.0 — Harmonia Engine (CPU Monitoring)
 * ═══════════════════════════════════════════════════
 *
 * Module Rust pour surveiller la charge CPU et équilibrer les watchers
 */
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use sysinfo::System;

lazy_static::lazy_static! {
    static ref CPU_MONITOR: Arc<Mutex<CpuMonitor>> = Arc::new(Mutex::new(CpuMonitor::new()));
}

/// Statut du monitoring CPU
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuStatus {
    /// Charge CPU globale (0-100%)
    pub global_usage: f32,
    /// Nombre de cores
    pub core_count: usize,
    /// Usage par core
    pub per_core_usage: Vec<f32>,
    /// Température (si disponible)
    pub temperature: Option<f32>,
    /// Système en throttling ?
    pub is_throttling: bool,
    /// Recommandation d'action
    pub recommendation: String,
}

/// Mode d'équilibrage Harmonia
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HarmoniaMode {
    /// Mode normal (< 60% CPU)
    Normal,
    /// Mode équilibré (60-80% CPU)
    Balanced,
    /// Mode throttling (> 80% CPU)
    Throttled,
}

/// Moniteur CPU Harmonia
pub struct CpuMonitor {
    system: System,
    last_update: Instant,
    current_mode: HarmoniaMode,
    history: Vec<f32>, // 10 dernières mesures
}

impl CpuMonitor {
    /// Crée un nouveau moniteur
    pub fn new() -> Self {
        let mut system = System::new_all();
        system.refresh_all();

        Self {
            system,
            last_update: Instant::now(),
            current_mode: HarmoniaMode::Normal,
            history: Vec::with_capacity(10),
        }
    }

    /// Rafraîchit les métriques CPU
    pub fn refresh(&mut self) {
        // Éviter les rafraîchissements trop fréquents (< 500ms)
        if self.last_update.elapsed() < Duration::from_millis(500) {
            return;
        }

        self.system.refresh_cpu();
        self.last_update = Instant::now();
    }

    /// Obtient le statut CPU actuel
    pub fn get_status(&mut self) -> CpuStatus {
        self.refresh();

        // sysinfo 0.30+ : utiliser cpus() directement
        let global_usage = if let Some(cpu) = self.system.cpus().first() {
            cpu.cpu_usage()
        } else {
            0.0
        };
        let core_count = self.system.cpus().len();
        let per_core_usage: Vec<f32> = self
            .system
            .cpus()
            .iter()
            .map(|cpu| cpu.cpu_usage())
            .collect();

        // Historique
        self.history.push(global_usage);
        if self.history.len() > 10 {
            self.history.remove(0);
        }

        // Détection throttling
        let is_throttling = global_usage > 80.0;

        // Mode Harmonia
        self.current_mode = if global_usage > 80.0 {
            HarmoniaMode::Throttled
        } else if global_usage > 60.0 {
            HarmoniaMode::Balanced
        } else {
            HarmoniaMode::Normal
        };

        // Recommandation
        let recommendation = match self.current_mode {
            HarmoniaMode::Normal => "All systems nominal".to_string(),
            HarmoniaMode::Balanced => "Moderate load, optimizing watchers".to_string(),
            HarmoniaMode::Throttled => "High load detected, throttling watchers".to_string(),
        };

        CpuStatus {
            global_usage,
            core_count,
            per_core_usage,
            temperature: None, // sysinfo ne fournit pas toujours la température
            is_throttling,
            recommendation,
        }
    }

    /// Obtient le mode Harmonia actuel
    pub fn get_mode(&self) -> HarmoniaMode {
        self.current_mode
    }

    /// Calcule la charge moyenne sur l'historique
    pub fn get_average_load(&self) -> f32 {
        if self.history.is_empty() {
            return 0.0;
        }
        self.history.iter().sum::<f32>() / self.history.len() as f32
    }

    /// Détermine si un throttling est nécessaire
    pub fn should_throttle(&mut self) -> bool {
        self.refresh();
        let avg_load = self.get_average_load();

        // Throttle si charge moyenne > 75% sur les 10 dernières mesures
        avg_load > 75.0 || self.current_mode == HarmoniaMode::Throttled
    }

    /// Calcule le délai recommandé pour les watchers (en ms)
    pub fn get_recommended_watch_delay(&mut self) -> u64 {
        self.refresh();
        let _load = if let Some(cpu) = self.system.cpus().first() {
            cpu.cpu_usage()
        } else {
            0.0
        };

        // Délai basé sur le mode Harmonia
        match self.current_mode {
            HarmoniaMode::Normal => 100,    // 100ms (réactif)
            HarmoniaMode::Balanced => 250,  // 250ms (équilibré)
            HarmoniaMode::Throttled => 500, // 500ms (throttlé)
        }
    }
}

impl Default for CpuMonitor {
    fn default() -> Self {
        Self::new()
    }
}

/// API publique pour les commandes Tauri
pub fn get_cpu_status() -> CpuStatus {
    let mut monitor = CPU_MONITOR.lock().unwrap();
    monitor.get_status()
}

pub fn should_throttle_watchers() -> bool {
    let mut monitor = CPU_MONITOR.lock().unwrap();
    monitor.should_throttle()
}

pub fn get_watch_delay() -> u64 {
    let mut monitor = CPU_MONITOR.lock().unwrap();
    monitor.get_recommended_watch_delay()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cpu_monitor() {
        let mut monitor = CpuMonitor::new();
        let status = monitor.get_status();

        assert!(status.global_usage >= 0.0);
        assert!(status.global_usage <= 100.0);
        assert!(status.core_count > 0);
    }

    #[test]
    fn test_harmonia_mode() {
        let monitor = CpuMonitor::new();
        let mode = monitor.get_mode();

        // Mode doit être valide
        assert!(matches!(
            mode,
            HarmoniaMode::Normal | HarmoniaMode::Balanced | HarmoniaMode::Throttled
        ));
    }
}
