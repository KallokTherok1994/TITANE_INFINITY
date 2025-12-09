# TITANE Visual Engine v19.3.0

Complete frontend visual system with adaptive states, advanced particle physics, and real-time effects.

## Overview

The TITANE Visual Engine is a production-ready, high-performance visual system that provides:

- **11 Visual States** with smooth 500ms transitions
- **Advanced Particle System** supporting 600 particles at 60fps
- **4 Contextual Patterns** (spiral, focused, dispersed, chaotic)
- **Adaptive UI Panels** that respond to system state
- **Special Effects** (energy arcs, healing waves, glitches, etc.)
- **WebSocket Integration** for real-time state synchronization
- **Performance Monitoring** with automatic optimization

## Architecture

### Core Components

```
src/
├── visual-engine/           # Core visual engine
│   ├── TitaneVisualEngine.ts   # Main engine orchestrator
│   ├── StateManager.ts         # State transitions & history
│   └── index.ts                # Exports
│
├── particles/               # Advanced particle system
│   ├── ParticleSystem.ts      # Particle pool & rendering
│   ├── Particle.ts            # Individual particle physics
│   └── index.ts               # Exports
│
├── design-system/          # Design tokens & states
│   ├── visual-states.ts       # 11 visual state configurations
│   └── tokens.ts              # Design system tokens
│
├── components/panels/      # Adaptive UI panels
│   ├── ChatPanel.tsx          # Chat with particle background
│   ├── MemoryPanel.tsx        # Animated memory metrics
│   ├── DevToolsPanel.tsx      # Engine status cards
│   └── SelfHealingPanel.tsx   # Healing progress visualization
│
├── effects/                # Special visual effects
│   ├── EnergyArcs.tsx         # SVG energy arcs
│   ├── HealingWaves.tsx       # Ripple waves
│   ├── AudioWaveform.tsx      # Audio visualization
│   ├── GlitchEffect.tsx       # RGB split glitch
│   └── SpiralPattern.tsx      # Rotating spiral
│
├── hooks/                  # React hooks
│   ├── useVisualState.ts      # Subscribe to visual state
│   └── useParticles.ts        # Particle system hook
│
├── stores/                 # State management
│   └── visualStateStore.ts    # Zustand store for engine
│
└── styles/                 # CSS animations
    └── animations.css         # All animation keyframes
```

## Visual States

### 11 Available States

1. **idle** - Calm, minimal activity
2. **listening** - Active listening state (blue)
3. **thinking** - Processing/reasoning (purple)
4. **speaking** - Active speaking state (green)
5. **processing** - Heavy computation (yellow)
6. **error** - Error state (red)
7. **success** - Success state (green)
8. **loading** - Loading state (gray)
9. **healing** - Self-healing active (cyan)
10. **quantum** - Quantum processing (pink)
11. **singularity** - Maximum intensity (violet)

### State Properties

Each state defines:
- Primary, secondary, accent colors
- Glow intensity and color
- Particle density (100-600)
- Particle speed (0.5-3.5)
- Wave amplitude and frequency
- Pulse interval
- Transition duration (500ms)

## Usage

### Basic Setup

```typescript
import { useVisualStateStore } from '@/stores/visualStateStore';
import { useVisualState } from '@/hooks/useVisualState';

function MyComponent() {
  const { engine, initEngine, startEngine, setState } = useVisualStateStore();
  const { state, visuals, isTransitioning } = useVisualState(engine);

  useEffect(() => {
    // Initialize engine
    initEngine({
      enableParticles: true,
      enableEffects: true,
      targetFPS: 60,
      performanceMode: 'high',
    });

    // Start render loop
    startEngine();
  }, []);

  return (
    <div style={{ backgroundColor: visuals.background }}>
      <button onClick={() => setState('thinking')}>
        Set Thinking State
      </button>
    </div>
  );
}
```

### Using Adaptive Panels

```typescript
import { ChatPanel } from '@/components/panels/ChatPanel';
import { MemoryPanel } from '@/components/panels/MemoryPanel';

function Dashboard() {
  const metrics = [
    { label: 'Short Term', value: 75, max: 100, color: '#4a9eff' },
    { label: 'Long Term', value: 45, max: 100, color: '#34d399' },
  ];

  return (
    <>
      <ChatPanel>
        <p>Chat content here</p>
      </ChatPanel>

      <MemoryPanel metrics={metrics} />
    </>
  );
}
```

### Using Particle System

```typescript
import { useParticles } from '@/hooks/useParticles';

function ParticleBackground() {
  const { canvasRef, setPattern, setColors } = useParticles({
    maxParticles: 300,
    pattern: 'spiral',
    emissionRate: 10,
  });

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    />
  );
}
```

### Using Special Effects

```typescript
import { EnergyArcs, HealingWaves, GlitchEffect } from '@/effects';

function EffectsDemo() {
  const arcs = [
    { id: '1', start: { x: 100, y: 100 }, end: { x: 300, y: 200 }, color: '#4a9eff', intensity: 0.8 }
  ];

  return (
    <>
      <EnergyArcs arcs={arcs} animated />
      <HealingWaves color="#06b6d4" waveCount={3} />
      <GlitchEffect continuous intensity="medium">
        <h1>Glitched Text</h1>
      </GlitchEffect>
    </>
  );
}
```

## Performance

### Optimization Features

- **Object Pooling**: Particles are reused from a pool to minimize GC pressure
- **GPU Acceleration**: All animations use transform/opacity for GPU rendering
- **RAF-based Updates**: Render loop synchronized with browser refresh rate
- **Adaptive Performance**: Automatic quality reduction on performance warnings
- **Smooth Transitions**: All state changes use 500ms cubic-bezier easing

### Performance Modes

```typescript
// High: All features enabled (600 particles, all effects)
setPerformanceMode('high');

// Medium: Particles enabled, effects disabled (300 particles)
setPerformanceMode('medium');

// Low: All visual features disabled
setPerformanceMode('low');
```

### Monitoring

```typescript
const { performanceMetrics } = useVisualStateStore();

console.log(performanceMetrics);
// {
//   fps: 60,
//   frameTime: 16.67,
//   particleCount: 300,
//   effectsActive: 2,
//   memoryUsage: 0
// }
```

## WebSocket Integration

The Visual Engine supports real-time state updates via WebSocket:

```typescript
initEngine({
  enableWebSocket: true,
  websocketUrl: 'ws://localhost:8080/visual-state',
});

// Backend sends:
{
  "type": "state_change",
  "payload": {
    "state": "thinking"
  }
}

// Engine automatically transitions to new state
```

## Design System

### CSS Variables

All design tokens are available as CSS variables:

```css
:root {
  --color-primary-500: #727b81;
  --color-accent-500: #93b399;
  --background-base: #050607;
  --spacing-4: 1rem;
  --radius-md: 0.5rem;
  --transition-duration-base: 500ms;
}
```

### Animations

Pre-built CSS animations for common effects:

- `.smooth-transition` - 500ms all-properties transition
- `.pulse-slow/medium/fast` - Pulsing animations
- `.glow-pulse` - Glowing effect
- `.shimmer` - Shimmer/shine effect
- `.wave-gentle/active` - Wave animations
- `.spiral-rotate` - Spiral rotation
- `.healing-ripple` - Healing wave ripple
- `.glitch` - Glitch effect
- `.fade-in/out` - Fade transitions
- `.slide-in-*` - Slide transitions
- `.scale-in/out` - Scale transitions

## Testing

### Unit Tests

```bash
npm run test:unit
```

### Integration Tests

```bash
npm run test:integration
```

### Demo Component

Run the complete demo:

```typescript
import { VisualEngineDemo } from '@/components/VisualEngineDemo';

<VisualEngineDemo />
```

## API Reference

### TitaneVisualEngine

```typescript
class TitaneVisualEngine {
  constructor(config?: Partial<VisualEngineConfig>)

  start(): void
  stop(): void
  setState(state: VisualState, duration?: number): void
  setStateImmediate(state: VisualState): void
  getCurrentState(): VisualState
  getCurrentVisuals(): StateVisualConfig
  getTransitionProgress(): number
  isTransitioning(): boolean
  setPerformanceMode(mode: 'high' | 'medium' | 'low'): void
  getPerformanceMetrics(): PerformanceMetrics
  updateConfig(config: Partial<VisualEngineConfig>): void
  destroy(): void
}
```

### StateManager

```typescript
class StateManager {
  getCurrentState(): VisualState
  getCurrentVisuals(): StateVisualConfig
  setState(state: VisualState, duration?: number, force?: boolean): void
  setStateImmediate(state: VisualState): void
  getTransitionProgress(): number
  isTransitioning(): boolean
  getHistory(): StateHistoryEntry[]
  getStats(): StateStats
  destroy(): void
}
```

### ParticleSystem

```typescript
class ParticleSystem {
  constructor(config?: Partial<ParticleSystemConfig>)

  setCanvas(canvas: HTMLCanvasElement): void
  start(): void
  stop(): void
  update(deltaTime: number): void
  render(): void
  setPattern(pattern: ParticlePattern): void
  setColors(colors: string[]): void
  setEmissionRate(rate: number): void
  getParticleCount(): number
  clear(): void
  destroy(): void
}
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers

Requires:
- ES2020 support
- Canvas API
- RequestAnimationFrame
- WebSocket (optional)

## License

Proprietary - TITANE_INFINITY v19.3.0
© 2025 Humain Total / Kevin Thibault / TITANE Team
