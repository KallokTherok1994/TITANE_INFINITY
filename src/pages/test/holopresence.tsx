/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.38 — TEST PAGE: HOLOPRESENCE VISUALIZER
 *   Test & Debug · Visualization · Controls
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { HoloPresenceVisualizer } from '@/components/visualization/HoloPresenceVisualizer';
import { ExpressionMonitor } from '@/components/visualization/ExpressionMonitor';
import {
  useHoloPresence,
  useHoloShape,
  useHoloColorsVisuals,
  useHoloIntensity,
  useHoloPresenceActions,
} from '@/hooks';

export default function HoloPresenceTestPage() {
  const holoPresence = useHoloPresence();
  const shape = useHoloShape();
  const colors = useHoloColorsVisuals();
  const intensity = useHoloIntensity();
  const { flash, pulse, burst } = useHoloPresenceActions();

  const [isEngineRunning, setIsEngineRunning] = useState(false);

  useEffect(() => {
    // Démarrer les moteurs au chargement
    const startEngines = async () => {
      try {
        // Import dynamique pour éviter erreurs SSR
        const { unifiedIdentityKernel } = await import('@/engines/identity/unifiedIdentityKernel');
        const { expressionEngine } = await import('@/engines/expression/expressionEngine');
        const { holoPresenceEngine } = await import('@/engines/holopresence/holoPresenceEngine');

        unifiedIdentityKernel.start();
        expressionEngine.start();
        holoPresenceEngine.start();

        setIsEngineRunning(true);
        console.log('✅ Engines started for testing');
      } catch (error) {
        console.error('❌ Failed to start engines:', error);
      }
    };

    startEngines();

    // Cleanup
    return () => {
      import('@/engines/identity/unifiedIdentityKernel').then(({ unifiedIdentityKernel }) => {
        unifiedIdentityKernel.stop();
      });
      import('@/engines/expression/expressionEngine').then(({ expressionEngine }) => {
        expressionEngine.stop();
      });
      import('@/engines/holopresence/holoPresenceEngine').then(({ holoPresenceEngine }) => {
        holoPresenceEngine.stop();
      });
    };
  }, []);

  const handleShapeChange = (newShape: string) => {
    import('@/engines/holopresence/holoPresenceEngine').then(({ holoPresenceEngine }) => {
      holoPresenceEngine.setShape(newShape as any);
    });
  };

  const handleColorChange = (colorType: 'primary' | 'secondary' | 'accent', color: string) => {
    import('@/engines/holopresence/holoPresenceEngine').then(({ holoPresenceEngine }) => {
      const currentColors = holoPresenceEngine.getState().visuals.colors;
      holoPresenceEngine.setColors({
        ...currentColors,
        [colorType]: color,
      });
    });
  };

  const shapes = ['sphere', 'torus', 'helix', 'crystal', 'nebula', 'mandala', 'wave'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            🌀 HoloPresence Test Lab
          </h1>
          <p className="text-gray-400">
            Test et debug du système de visualisation holographique
          </p>
          <div className="mt-2">
            <span className={`px-3 py-1 rounded-full text-sm ${isEngineRunning ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {isEngineRunning ? '● Engines Running' : '○ Engines Stopped'}
            </span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Visualizer */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-2xl font-semibold mb-4">Visualizer</h2>
              <div className="flex justify-center">
                <HoloPresenceVisualizer width={500} height={500} />
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4">Controls</h3>

              {/* Shape Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Shape</label>
                <div className="grid grid-cols-4 gap-2">
                  {shapes.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleShapeChange(s)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        shape === s
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Pickers */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Colors</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-24">Primary</span>
                    <input
                      type="color"
                      value={colors.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-24">Secondary</span>
                    <input
                      type="color"
                      value={colors.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-24">Accent</span>
                    <input
                      type="color"
                      value={colors.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Event Buttons */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Events</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => flash(1.0)}
                    className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg transition-colors"
                  >
                    Flash
                  </button>
                  <button
                    onClick={() => pulse(0.8, 1000)}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                  >
                    Pulse
                  </button>
                  <button
                    onClick={() => burst(1.0)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                  >
                    Burst
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Metrics & Expression Monitor */}
          <div className="space-y-6">
            {/* Expression Monitor */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-2xl font-semibold mb-4">Expression Monitor</h2>
              <ExpressionMonitor />
            </div>

            {/* HoloPresence State */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4">HoloPresence State</h3>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400">Shape:</span>
                  <span>{shape}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Intensity:</span>
                  <span>{(intensity * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Size:</span>
                  <span>{(holoPresence?.visuals?.size ?? 0.5).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Glow:</span>
                  <span>{(holoPresence?.visuals?.glow ?? 0.5).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Particles:</span>
                  <span>{holoPresence?.particles?.count ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rotation Y:</span>
                  <span>{(holoPresence?.visuals?.rotation?.y ?? 0).toFixed(1)}°/s</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
              <h3 className="text-xl font-semibold mb-2">💡 Instructions</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Sélectionnez une forme pour voir la visualisation holographique</li>
                <li>• Changez les couleurs pour personnaliser l'apparence</li>
                <li>• Cliquez sur Flash/Pulse/Burst pour tester les événements</li>
                <li>• Le Expression Monitor montre la synchronisation en temps réel</li>
                <li>• Les moteurs Identity + Expression + HoloPresence tournent en arrière-plan</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
