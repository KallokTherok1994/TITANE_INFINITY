import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AnimationProvider, useAnimation } from '@/contexts/AnimationContext';

const usePerformanceMonitorMock = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/usePerformanceMonitor', () => ({
  usePerformanceMonitor: usePerformanceMonitorMock,
}));

describe('AnimationContext', () => {
  it('exposes animation runtime values from provider', () => {
    usePerformanceMonitorMock.mockReturnValue({
      metrics: {
        fps: 42,
        cpuLoad: 18,
        shouldReduceMotion: false,
        shouldThrottle: true,
      },
      shouldReduceMotion: false,
      shouldThrottle: true,
      animationConfig: {
        duration: 0.15,
        skipAnimation: false,
      },
    });

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

  it('throws when useAnimation is called outside provider', () => {
    usePerformanceMonitorMock.mockReturnValue({
      metrics: {
        fps: 60,
        cpuLoad: 0,
        shouldReduceMotion: false,
        shouldThrottle: false,
      },
      shouldReduceMotion: false,
      shouldThrottle: false,
      animationConfig: {
        duration: 0.2,
        skipAnimation: false,
      },
    });

    const Probe = () => {
      useAnimation();
      return null;
    };

    expect(() => render(<Probe />)).toThrow(
      'useAnimation must be used within AnimationProvider'
    );
  });
});
