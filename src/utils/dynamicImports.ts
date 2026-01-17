/**
 * TITANE∞ v26.3.0 — Dynamic Import Wrappers
 * © 2025 TITANE Team. All rights reserved.
 *
 * 🔧 Wrappers pour éviter les problèmes de Vite dep-scan
 */

// Wrapper pour cognitive layout engine
export const loadCognitiveLayoutEngine = () =>
  import('../engines/cognitive/cognitiveLayoutEngine');

// Wrapper pour motion system
export const loadMotionSystem = () => import('../ui/motion/index');

// Wrapper pour quantum systems
export const loadQuantumIntelligence = () => import('./quantumIntelligence');

export const loadSelfHealingSystem = () => import('./selfHealingSystem');

export const loadTelemetryEngine = () => import('./telemetryEngine');
