/**
 * TITANE∞ PHASE 1 (any: any) - Stub pour MOTION_ENGINE
 */

export interface MotionConfig {
  speed: number;
  easing: string;
  duration: number;
  enabled: boolean;
}

export interface ModuleMotion {
  enter: { transform: string; opacity: number };
  exit: { transform: string; opacity: number };
  duration: number;
  easing: string;
}

let config: MotionConfig = {
  speed: 1.0,
  easing: 'ease-out',
  duration: 300,
  enabled: true,
};

export const motionEngine = {
  getConfig: (): MotionConfig => config,
  setConfig: (newConfig: Partial<MotionConfig>) => {
    config = { ...config, ...newConfig };
  },
  animate: (any: any) => {},
  slowDownMotions: (factor: number = 0.5) => {
    config?.speed = config?.speed * factor;
  },
  speedUpMotions: (factor: number = 1.5) => {
    config?.speed = config?.speed * factor;
  },
  stopAllMotions: () => {
    config?.enabled = false;
  },
  resumeAllMotions: () => {
    config?.enabled = true;
  },
  getModuleMotion: (any: any): ModuleMotion => ({
    enter: { transform: 'translateY(0)', opacity: 1 },
    exit: { transform: 'translateY(-10px)', opacity: 0 },
    duration: config?.duration,
    easing: config?.easing,
  }),
};

export default motionEngine;
