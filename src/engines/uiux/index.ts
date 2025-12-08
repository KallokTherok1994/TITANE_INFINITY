/**
 * TITANE∞ v20Ω — UI/UX Adaptive Engine
 * Exports du moteur d'adaptation UI/UX
 */

// Types
export * from './types';

// Detectors
export * from './detectors/ContextDetector';
export * from './detectors/OverloadDetector';
export * from './detectors/BehaviorDetector';
export * from './detectors/PerformanceDetector';
export * from './detectors/ModeDetector';

// Adapters
export * from './adapters/LayoutAdapter';
export * from './adapters/DensityAdapter';
export * from './adapters/VisibilityAdapter';
export * from './adapters/MotionAdapter';
export * from './adapters/ThemeAdapter';

// Policies
export * from './policies/CognitivePolicy';
export * from './policies/SafetyPolicy';
export * from './policies/PerformancePolicy';

// Main Engine
export * from './UIUXEngine';
export { UIUXEngine as default } from './UIUXEngine';
