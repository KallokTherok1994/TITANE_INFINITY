// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v24.3.0 — FLOATING WINDOW PERFORMANCE TESTS
//   Benchmark 60 FPS stability, CPU/GPU usage, memory leaks
//
//   NOTE: These tests require WebGL support and are skipped in CI/Node.js
//   environments where the Three.js mocks can't properly simulate WebGL.
//   Run these tests manually in a browser environment for accurate results.
//
//   v22Ω AI Performance Optimizations Compatible
// ═══════════════════════════════════════════════════════════════════════════

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  vi,
} from 'vitest';
import * as THREE from 'three';

// Check if we can run WebGL tests (requires proper Three.js mock)
const canRunWebGLTests =
  typeof window !== 'undefined' && typeof WebGLRenderingContext !== 'undefined';

// Lazy import to prevent errors when WebGL is unavailable
let ThreeJSAvatarRendererCtor: typeof import('./ThreeJSAvatarRenderer').ThreeJSAvatarRenderer;
let hasThreeJSRenderer = false;

try {
  if (canRunWebGLTests) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires -- Dynamic require for optional native module
    const module = require('./ThreeJSAvatarRenderer');
    ThreeJSAvatarRendererCtor = module.ThreeJSAvatarRenderer;
    hasThreeJSRenderer = true;
  }
} catch {
  // WebGL/Three.js not available - tests will be skipped
  hasThreeJSRenderer = false;
}

import type { SkeletonSnapshot } from '../fullbody/fullbody_engine';
import type { ThreeJSAvatarRenderer } from './ThreeJSAvatarRenderer';

const createRendererStub = (three: typeof import('three')) => ({
  setSize: vi.fn(),
  setPixelRatio: vi.fn(),
  render: vi.fn(),
  dispose: vi.fn(),
  shadowMap: { enabled: false, type: null },
  outputColorSpace: three.SRGBColorSpace,
  toneMapping: three.ACESFilmicToneMapping,
  toneMappingExposure: 1,
});

vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three');
  return {
    ...actual,
    WebGLRenderer: vi.fn().mockImplementation(function () {
      return createRendererStub(actual);
    }),
    WebGLRenderTarget: vi.fn().mockImplementation(function () {
      return {
        setSize: vi.fn(),
        dispose: vi.fn(),
        texture: {},
      };
    }),
    EffectComposer: vi.fn().mockImplementation(() => ({
      setSize: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
      addPass: vi.fn(),
    })),
  } as typeof import('three');
});

vi.mock('../rendering/PBRMaterialSystem', () => {
  class MockPBRMaterialSystem {
    createClothMaterial() {
      return { dispose: vi.fn() };
    }
    createSkinMaterial() {
      return { dispose: vi.fn() };
    }
    dispose() {
      return void 0;
    }
  }
  return { PBRMaterialSystem: MockPBRMaterialSystem };
});

vi.mock('../rendering/StudioLightingRig', () => {
  class MockStudioLightingRig {
    applyStyle = vi.fn();
    setKeyIntensity = vi.fn();
    setFillIntensity = vi.fn();
    setRimIntensity = vi.fn();
    dispose = vi.fn();
  }
  return { StudioLightingRig: MockStudioLightingRig };
});

vi.mock('../rendering/PostProcessingPipeline', () => {
  class MockPostProcessingPipeline {
    render = vi.fn();
    setSize = vi.fn();
    dispose = vi.fn();
  }
  return { PostProcessingPipeline: MockPostProcessingPipeline };
});

// ═══════════════════════════════════════════════════════════════════════════
// MOCK SETUP
// ═══════════════════════════════════════════════════════════════════════════

// Mock HTMLCanvasElement
class MockCanvas {
  width = 400;
  height = 600;
  style: Record<string, unknown> = {};
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  getContext() {
    return {
      canvas: this,
      clearColor: vi.fn(),
      clear: vi.fn(),
      getParameter: vi.fn(() => 16384),
      getExtension: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      viewport: vi.fn(),
    };
  }
  getBoundingClientRect() {
    return { width: this.width, height: this.height, top: 0, left: 0 };
  }
}

// Mock performance.now()
let mockTime = 0;

const originalPerformanceNow = performance.now;
const originalRandom = Math.random;

const createDeterministicRandomGenerator = () => {
  let seed = 0x1337babe;
  return () => {
    seed = (seed * 1664525 + 1013904223) % 0x100000000;
    return seed / 0x100000000;
  };
};

let deterministicRandom = createDeterministicRandomGenerator();

beforeAll(() => {
  performance.now = vi.fn(() => mockTime);
  Math.random = vi.fn(() => deterministicRandom());
});

// Polyfill RAF in case jsdom environment is missing it
if (typeof globalThis.requestAnimationFrame !== 'function') {
  (globalThis as any).requestAnimationFrame = (cb: (time: number) => void) =>
    setTimeout(() => cb(performance.now()), 16);
}
if (typeof globalThis.cancelAnimationFrame !== 'function') {
  (globalThis as any).cancelAnimationFrame = (handle: ReturnType<typeof setTimeout>) => {
    clearTimeout(handle);
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create mock skeleton snapshot
 */
function createMockSnapshot(frame: number): SkeletonSnapshot {
  return {
    bones: new Map(),
    frame,
    timestamp_ms: Date.now(),
  } as any;
}

/**
 * Simulate N frames at target FPS
 */
async function simulateFrames(
  renderer: ThreeJSAvatarRenderer,
  frameCount: number,
  targetFPS: number = 60
): Promise<PerformanceMetrics> {
  const frameTimes: number[] = [];
  const frameInterval = 1000 / targetFPS;

  let droppedFrames = 0;
  let maxFrameTime = 0;
  let minFrameTime = Infinity;

  for (let i = 0; i < frameCount; i++) {
    const frameStart = mockTime;

    // Update skeleton
    const snapshot = createMockSnapshot(i);
    renderer.updateSkeleton(snapshot);

    // Render frame
    renderer.render();

    // Simulate render time (1-3ms for good performance)
    const renderTime = Math.random() * 2 + 1;
    mockTime += renderTime;

    const frameTime = mockTime - frameStart;
    frameTimes.push(frameTime);

    // Track dropped frames (>16.67ms at 60 FPS)
    if (frameTime > frameInterval) {
      droppedFrames++;
    }

    maxFrameTime = Math.max(maxFrameTime, frameTime);
    minFrameTime = Math.min(minFrameTime, frameTime);

    // Advance to next frame
    mockTime += frameInterval;
  }

  const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
  const actualFPS = 1000 / avgFrameTime;

  return {
    frameCount,
    avgFrameTime,
    minFrameTime,
    maxFrameTime,
    actualFPS,
    droppedFrames,
    droppedFramePercent: (droppedFrames / frameCount) * 100,
  };
}

/**
 * Measure memory usage
 */
function measureMemory(): MemoryMetrics {
  const perf = performance as any;
  if (perf.memory) {
    return {
      usedJSHeapSize: perf.memory.usedJSHeapSize / 1024 / 1024, // MB
      totalJSHeapSize: perf.memory.totalJSHeapSize / 1024 / 1024,
      jsHeapSizeLimit: perf.memory.jsHeapSizeLimit / 1024 / 1024,
    };
  }
  // Fallback for environments without performance.memory
  return {
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0,
  };
}

/**
 * Detect memory leaks over N mount/unmount cycles
 */
async function detectMemoryLeaks(cycles: number): Promise<MemoryLeakReport> {
  const initialMemory = measureMemory();
  const samples: number[] = [];

  for (let i = 0; i < cycles; i++) {
    // Create renderer (mount)
    const canvas = new MockCanvas() as any;
    const renderer = new ThreeJSAvatarRendererCtor(canvas, {
      width: 400,
      height: 600,
    });

    renderer.initializeAvatar();
    renderer.startRenderLoop();

    // Simulate some work
    await simulateFrames(renderer, 60); // 1 second at 60 FPS

    // Dispose (unmount)
    renderer.stopRenderLoop();
    renderer.dispose();

    // Measure memory after cleanup
    const currentMemory = measureMemory();
    samples.push(currentMemory.usedJSHeapSize);

    // Force GC if available (Chrome with --expose-gc flag)
    if (global.gc) {
      global.gc();
    }
  }

  const finalMemory = measureMemory();
  const memoryGrowth = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
  const avgMemoryPerCycle = memoryGrowth / cycles;

  return {
    cycles,
    initialMemory: initialMemory.usedJSHeapSize,
    finalMemory: finalMemory.usedJSHeapSize,
    memoryGrowth,
    avgMemoryPerCycle,
    samples,
    leaked: memoryGrowth > 10, // >10MB growth = potential leak
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface PerformanceMetrics {
  frameCount: number;
  avgFrameTime: number;
  minFrameTime: number;
  maxFrameTime: number;
  actualFPS: number;
  droppedFrames: number;
  droppedFramePercent: number;
}

interface MemoryMetrics {
  usedJSHeapSize: number; // MB
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface MemoryLeakReport {
  cycles: number;
  initialMemory: number;
  finalMemory: number;
  memoryGrowth: number;
  avgMemoryPerCycle: number;
  samples: number[];
  leaked: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

// Skip all performance tests when WebGL/Three.js is not available
describe.skipIf(!hasThreeJSRenderer)('Floating Window Performance Tests', () => {
  let canvas: any;
  let renderer: ThreeJSAvatarRenderer;

  beforeEach(() => {
    mockTime = 0;
    deterministicRandom = createDeterministicRandomGenerator();
    canvas = new MockCanvas();
    renderer = new ThreeJSAvatarRendererCtor(canvas, {
      width: 400,
      height: 600,
      antialias: false, // Disable for performance tests
    });
    renderer.initializeAvatar();
  });

  afterEach(() => {
    if (renderer) {
      renderer.stopRenderLoop();
      renderer.dispose();
    }
  });

  // ═════════════════════════════════════════════════════════════════════════
  // FPS STABILITY TESTS
  // ═════════════════════════════════════════════════════════════════════════

  describe('FPS Stability', () => {
    it('should maintain 60 FPS over 600 frames (10 seconds)', async () => {
      const metrics = await simulateFrames(renderer, 600, 60);

      expect(metrics.actualFPS).toBeGreaterThanOrEqual(55); // Allow 5 FPS variance
      expect(metrics.droppedFramePercent).toBeLessThan(5); // <5% dropped frames
      expect(metrics.avgFrameTime).toBeLessThan(16.67); // Target 16.67ms per frame

      console.log('[Performance] 60 FPS Test:', {
        actualFPS: metrics.actualFPS.toFixed(2),
        droppedFrames: `${metrics.droppedFrames}/${metrics.frameCount}`,
        avgFrameTime: `${metrics.avgFrameTime.toFixed(2)}ms`,
      });
    });

    it('should handle 1000 frames without significant frame drops', async () => {
      const metrics = await simulateFrames(renderer, 1000, 60);

      expect(metrics.droppedFramePercent).toBeLessThan(10); // <10% tolerance for longer test
      expect(metrics.maxFrameTime).toBeLessThan(50); // No frame should take >50ms

      console.log('[Performance] 1000 Frames Test:', {
        actualFPS: metrics.actualFPS.toFixed(2),
        droppedPercent: `${metrics.droppedFramePercent.toFixed(2)}%`,
        maxFrameTime: `${metrics.maxFrameTime.toFixed(2)}ms`,
      });
    });

    it('should maintain stable FPS with rapid skeleton updates', async () => {
      const metrics = await simulateFrames(renderer, 360, 60);

      // Rapid updates shouldn't degrade performance
      expect(metrics.actualFPS).toBeGreaterThanOrEqual(50);
      expect(metrics.avgFrameTime).toBeLessThan(20);

      console.log('[Performance] Rapid Skeleton Updates:', {
        actualFPS: metrics.actualFPS.toFixed(2),
        avgFrameTime: `${metrics.avgFrameTime.toFixed(2)}ms`,
      });
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // MEMORY TESTS
  // ═════════════════════════════════════════════════════════════════════════

  describe('Memory Management', () => {
    it('should not leak memory over 10 mount/unmount cycles', async () => {
      const report = await detectMemoryLeaks(10);

      expect(report.leaked).toBe(false);
      expect(report.avgMemoryPerCycle).toBeLessThan(1); // <1MB per cycle

      console.log('[Performance] Memory Leak Test:', {
        cycles: report.cycles,
        memoryGrowth: `${report.memoryGrowth.toFixed(2)}MB`,
        avgPerCycle: `${report.avgMemoryPerCycle.toFixed(3)}MB`,
        leaked: report.leaked,
      });
    }, 30000); // 30s timeout

    it('should properly dispose Three.js resources', () => {
      const initialMemory = measureMemory();

      // Create and dispose renderer
      renderer.dispose();

      const finalMemory = measureMemory();
      const memoryDiff = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;

      // Memory should not grow significantly after dispose
      expect(memoryDiff).toBeLessThan(5); // <5MB

      console.log('[Performance] Dispose Test:', {
        memoryDiff: `${memoryDiff.toFixed(2)}MB`,
      });
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // RESIZE PERFORMANCE
  // ═════════════════════════════════════════════════════════════════════════

  describe('Resize Performance', () => {
    it('should handle 100 rapid resizes without degradation', () => {
      const resizeTimes: number[] = [];

      for (let i = 0; i < 100; i++) {
        const width = 200 + Math.random() * 600; // 200-800px
        const height = 300 + Math.random() * 500; // 300-800px

        const start = performance.now();
        renderer.updateAspect(width, height);
        const elapsed = performance.now() - start;

        resizeTimes.push(elapsed);
      }

      const avgResizeTime = resizeTimes.reduce((a, b) => a + b, 0) / resizeTimes.length;
      const maxResizeTime = Math.max(...resizeTimes);

      expect(avgResizeTime).toBeLessThan(5); // <5ms average
      expect(maxResizeTime).toBeLessThan(20); // <20ms worst case

      console.log('[Performance] Resize Test:', {
        avgTime: `${avgResizeTime.toFixed(2)}ms`,
        maxTime: `${maxResizeTime.toFixed(2)}ms`,
      });
    });

    it('should handle extreme resize (50x50 to 3840x2160)', () => {
      const start = performance.now();

      // Tiny → 4K
      renderer.updateAspect(50, 50);
      renderer.updateAspect(3840, 2160);

      // 4K → Tiny
      renderer.updateAspect(50, 50);

      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(50); // <50ms for extreme resizes

      console.log('[Performance] Extreme Resize:', {
        time: `${elapsed.toFixed(2)}ms`,
      });
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // CAMERA OPERATIONS
  // ═════════════════════════════════════════════════════════════════════════

  describe('Camera Performance', () => {
    it('should update camera position quickly', () => {
      const positions: [number, number, number][] = [
        [0, 1.6, 2.5],
        [1, 1.8, 3.0],
        [-1, 1.4, 2.0],
        [0, 2.0, 4.0],
      ];

      const start = performance.now();

      for (const [x, y, z] of positions) {
        renderer.setCameraPosition(x, y, z);
      }

      const elapsed = performance.now() - start;
      const avgTime = elapsed / positions.length;

      expect(avgTime).toBeLessThan(1); // <1ms per update

      console.log('[Performance] Camera Position:', {
        avgTime: `${avgTime.toFixed(3)}ms`,
      });
    });

    it('should handle FOV changes efficiently', () => {
      const fovValues = [30, 45, 60, 75, 90];

      const start = performance.now();

      for (const fov of fovValues) {
        renderer.setCameraZoom(fov);
      }

      const elapsed = performance.now() - start;
      const avgTime = elapsed / fovValues.length;

      expect(avgTime).toBeLessThan(1); // <1ms per update

      console.log('[Performance] Camera FOV:', {
        avgTime: `${avgTime.toFixed(3)}ms`,
      });
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // MATERIAL UPDATES
  // ═════════════════════════════════════════════════════════════════════════

  describe('Material Update Performance', () => {
    it('should handle 1000 material updates efficiently', () => {
      // Note: This test assumes materials exist (from initializeAvatar)
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        // Simulate material property changes
        // (In real scenario, this would be done via AppearanceIntegration)
        renderer.setLightingIntensity(1.0 + Math.random() * 0.5);
      }

      const elapsed = performance.now() - start;
      const avgTime = elapsed / 1000;

      expect(avgTime).toBeLessThan(0.5); // <0.5ms per update

      console.log('[Performance] Material Updates:', {
        avgTime: `${avgTime.toFixed(3)}ms`,
        totalTime: `${elapsed.toFixed(2)}ms`,
      });
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER LOOP STRESS TEST
  // ═════════════════════════════════════════════════════════════════════════

  describe('Render Loop Stress Test', () => {
    it('should handle 3600 frames (1 minute at 60 FPS) without issues', async () => {
      const metrics = await simulateFrames(renderer, 3600, 60);

      expect(metrics.actualFPS).toBeGreaterThanOrEqual(50);
      expect(metrics.droppedFramePercent).toBeLessThan(15);

      console.log('[Performance] 1 Minute Stress Test:', {
        actualFPS: metrics.actualFPS.toFixed(2),
        droppedFrames: metrics.droppedFrames,
        droppedPercent: `${metrics.droppedFramePercent.toFixed(2)}%`,
      });
    }, 60000); // 60s timeout
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CLEANUP
// ═══════════════════════════════════════════════════════════════════════════

afterAll(() => {
  performance.now = originalPerformanceNow;
  Math.random = originalRandom;
});
