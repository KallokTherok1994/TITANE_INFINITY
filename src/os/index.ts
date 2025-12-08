/**
 * TITANE∞ v20Ω — OS Unified Integration
 * Point d'entrée de l'intégration système unifiée
 */

export * from './TitaneOS';
export * from './types';
export * from './bus/EventBus';
export * from './bus/MessageBus';
export * from './registry/EngineRegistry';
export * from './registry/ServiceRegistry';
export * from './bridge/TauriBridge';
export * from './bridge/StateBridge';
export * from './lifecycle/LifecycleManager';
export * from './config/ConfigManager';

export { TitaneOS as default } from './TitaneOS';
