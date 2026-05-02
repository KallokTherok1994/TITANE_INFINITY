import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AnimationProvider, useAnimation } from '@/contexts/AnimationContext';

const usePerformanceMonitorMock = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/usePerformanceMonitor', () => ({
  usePerformanceMonitor: usePerformanceMonitorMock,
}));

function makePerformanceMock(
  overrides: Partial<{
    fps: number;
    cpuLoad: number;
    shouldReduceMotion: boolean;
    shouldThrottle: boolean;
    duration: number;
    skipAnimation: boolean;
  }> = {}
) {
  const {
    fps = 60,
    cpuLoad = 10,
    shouldReduceMotion = false,
    shouldThrottle = false,
    duration = 0.2,
    skipAnimation = false,
  } = overrides;
  return {
    metrics: { fps, cpuLoad, shouldReduceMotion, shouldThrottle },
    shouldReduceMotion,
    shouldThrottle,
    animationConfig: { duration, skipAnimation },
  };
}

describe('AnimationContext', () => {
  beforeEach(() => {
    usePerformanceMonitorMock.mockReset();
  });

  it('exposes animation runtime values from provider (custom thresholds)', () => {
    usePerformanceMonitorMock.mockReturnValue(
      makePerformanceMock({ fps: 42, shouldThrottle: true, duration: 0.15 })
    );

    const Probe = () => {
      const { animationConfig, shouldReduceMotion, shouldThrottle, fps } = useAnimation();
      return (
        <div
          data-testid="animation-context-probe"
          data-duration={animationConfig.duration}
          data-skip={String(animationConfig.skipAnimation)}
          data-reduce={String(shouldReduceMotion)}
          data-throttle={String(shouldThrottle)}
          data-fps={String(fps)}
        >
          ready
        </div>
      );
    };

    render(
      <AnimationProvider fpsThreshold={35} cpuThreshold={75}>
        <Probe />
      </AnimationProvider>
    );

    const probe = screen.getByTestId('animation-context-probe');
    expect(probe).toHaveTextContent('ready');
    expect(probe).toHaveAttribute('data-duration', '0.15');
    expect(probe).toHaveAttribute('data-skip', 'false');
    expect(probe).toHaveAttribute('data-reduce', 'false');
    expect(probe).toHaveAttribute('data-throttle', 'true');
    expect(probe).toHaveAttribute('data-fps', '42');

    expect(usePerformanceMonitorMock).toHaveBeenCalledWith({
      fpsThreshold: 35,
      cpuThreshold: 75,
    });
  });

  it('uses default fpsThreshold=40 and cpuThreshold=80 when not provided', () => {
    usePerformanceMonitorMock.mockReturnValue(makePerformanceMock({ fps: 55 }));

    render(
      <AnimationProvider>
        <div data-testid="default-thresh">ok</div>
      </AnimationProvider>
    );

    expect(screen.getByTestId('default-thresh')).toHaveTextContent('ok');
    expect(usePerformanceMonitorMock).toHaveBeenCalledWith({
      fpsThreshold: 40,
      cpuThreshold: 80,
    });
  });

  it('exposes shouldReduceMotion=true when performance monitor signals it', () => {
    usePerformanceMonitorMock.mockReturnValue(
      makePerformanceMock({ shouldReduceMotion: true, skipAnimation: true, duration: 0 })
    );

    const Probe = () => {
      const { shouldReduceMotion, animationConfig } = useAnimation();
      return (
        <div
          data-testid="reduce-probe"
          data-reduce={String(shouldReduceMotion)}
          data-skip={String(animationConfig.skipAnimation)}
        >
          reduce
        </div>
      );
    };

    render(
      <AnimationProvider>
        <Probe />
      </AnimationProvider>
    );

    const probe = screen.getByTestId('reduce-probe');
    expect(probe).toHaveAttribute('data-reduce', 'true');
    expect(probe).toHaveAttribute('data-skip', 'true');
  });

  it('exposes shouldThrottle=false when performance is healthy', () => {
    usePerformanceMonitorMock.mockReturnValue(
      makePerformanceMock({ fps: 120, shouldThrottle: false })
    );

    const Probe = () => {
      const { shouldThrottle, fps } = useAnimation();
      return (
        <div
          data-testid="healthy-probe"
          data-throttle={String(shouldThrottle)}
          data-fps={String(fps)}
        >
          healthy
        </div>
      );
    };

    render(
      <AnimationProvider>
        <Probe />
      </AnimationProvider>
    );

    const probe = screen.getByTestId('healthy-probe');
    expect(probe).toHaveAttribute('data-throttle', 'false');
    expect(probe).toHaveAttribute('data-fps', '120');
  });

  it('throws when useAnimation is called outside provider', () => {
    usePerformanceMonitorMock.mockReturnValue(makePerformanceMock());

    const Probe = () => {
      useAnimation();
      return null;
    };

    expect(() => render(<Probe />)).toThrow(
      'useAnimation must be used within AnimationProvider'
    );
  });
});
