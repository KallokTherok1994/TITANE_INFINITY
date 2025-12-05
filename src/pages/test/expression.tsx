/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.38 — TEST PAGE: EXPRESSION MONITOR
 *   Test & Debug · Synchronization · Voice/Halo/Narrative
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { ExpressionMonitor } from '@/components/visualization/ExpressionMonitor';
import {
  useUnifiedExpression,
  useExpressionSync,
  useOrchestratedVoice,
  useOrchestratedHalo,
  useOrchestratedNarrative,
  useExpressionActions,
  useIdentitySignature,
  useIdentityActions,
} from '@/hooks';

export default function ExpressionMonitorTestPage() {
  const expression = useUnifiedExpression();
  const sync = useExpressionSync();
  const voice = useOrchestratedVoice();
  const halo = useOrchestratedHalo();
  const narrative = useOrchestratedNarrative();
  const { forceUpdate } = useExpressionActions();

  const signature = useIdentitySignature();
  const { setIdentityValue } = useIdentityActions();

  const adjustTone = (value: number) => setIdentityValue('tone', value);
  const adjustEnergy = (value: number) => setIdentityValue('energy', value);
  const adjustWarmth = (value: number) => setIdentityValue('warmth', value);

  const [isEngineRunning, setIsEngineRunning] = useState(false);
  const [autoMode, setAutoMode] = useState(false);

  useEffect(() => {
    // Démarrer les moteurs
    const startEngines = async () => {
      try {
        const { unifiedIdentityKernel } = await import('@/engines/identity/unifiedIdentityKernel');
        const { expressionEngine } = await import('@/engines/expression/expressionEngine');

        unifiedIdentityKernel.start();
        expressionEngine.start();

        setIsEngineRunning(true);
        console.log('✅ Expression engines started');
      } catch (error) {
        console.error('❌ Failed to start engines:', error);
      }
    };

    startEngines();

    return () => {
      import('@/engines/identity/unifiedIdentityKernel').then(({ unifiedIdentityKernel }) => {
        unifiedIdentityKernel.stop();
      });
      import('@/engines/expression/expressionEngine').then(({ expressionEngine }) => {
        expressionEngine.stop();
      });
    };
  }, []);

  // Mode auto: variation aléatoire de l'identité
  useEffect(() => {
    if (!autoMode) return;

    const interval = setInterval(() => {
      const randomTone = Math.random();
      const randomEnergy = Math.random();
      const randomWarmth = Math.random();

      adjustTone(randomTone);
      adjustEnergy(randomEnergy);
      adjustWarmth(randomWarmth);

      forceUpdate();
    }, 2000);

    return () => clearInterval(interval);
  }, [autoMode, adjustTone, adjustEnergy, adjustWarmth, forceUpdate]);

  const handlePreset = (preset: 'calm' | 'excited' | 'focused' | 'warm') => {
    switch (preset) {
      case 'calm':
        adjustTone(0.3);
        adjustEnergy(0.3);
        adjustWarmth(0.7);
        break;
      case 'excited':
        adjustTone(0.8);
        adjustEnergy(0.9);
        adjustWarmth(0.6);
        break;
      case 'focused':
        adjustTone(0.5);
        adjustEnergy(0.7);
        adjustWarmth(0.4);
        break;
      case 'warm':
        adjustTone(0.6);
        adjustEnergy(0.5);
        adjustWarmth(0.9);
        break;
    }
    forceUpdate();
  };

  const getSyncColor = (score: number) => {
    if (score > 0.85) return 'text-green-400';
    if (score > 0.70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            🎭 Expression Monitor Test Lab
          </h1>
          <p className="text-gray-400">
            Test de la synchronisation expressive multimodale
          </p>
          <div className="mt-2 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm ${isEngineRunning ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {isEngineRunning ? '● Engines Running' : '○ Engines Stopped'}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm ${sync > 0.85 ? 'bg-green-500/20 text-green-400' : sync > 0.70 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
              Sync: {(sync * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Expression Monitor */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-2xl font-semibold mb-4">Expression Monitor</h2>
              <ExpressionMonitor />
            </div>
          </div>

          {/* Right: Controls */}
          <div className="space-y-6">
            {/* Identity Controls */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4">Identity Controls</h3>

              {/* Presets */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handlePreset('calm')}
                    className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                  >
                    Calm
                  </button>
                  <button
                    onClick={() => handlePreset('excited')}
                    className="px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg transition-colors"
                  >
                    Excited
                  </button>
                  <button
                    onClick={() => handlePreset('focused')}
                    className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors"
                  >
                    Focused
                  </button>
                  <button
                    onClick={() => handlePreset('warm')}
                    className="px-3 py-2 bg-pink-500/20 hover:bg-pink-500/30 rounded-lg transition-colors"
                  >
                    Warm
                  </button>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tone: {signature?.tone?.toFixed(2) ?? 0.5}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={signature?.tone ?? 0.5}
                    onChange={(e) => adjustTone(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Energy: {signature?.energy?.toFixed(2) ?? 0.5}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={signature?.energy ?? 0.5}
                    onChange={(e) => adjustEnergy(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Warmth: {signature?.warmth?.toFixed(2) ?? 0.5}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={signature?.warmth ?? 0.5}
                    onChange={(e) => adjustWarmth(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Auto Mode */}
              <div className="mt-4">
                <button
                  onClick={() => setAutoMode(!autoMode)}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    autoMode
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {autoMode ? '⏸ Stop Auto Mode' : '▶ Start Auto Mode'}
                </button>
              </div>
            </div>

            {/* Expression Details */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4">Expression Details</h3>

              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-400 mb-1">Voice Prosody</div>
                  <div className="pl-3 space-y-1 font-mono">
                    <div>Rate: {voice?.prosody?.rate?.toFixed(2) ?? 1.0}</div>
                    <div>Pitch: {voice?.prosody?.pitch?.toFixed(2) ?? 1.0}</div>
                    <div>Volume: {voice?.prosody?.volume?.toFixed(2) ?? 0.7}</div>
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 mb-1">Halo Dynamics</div>
                  <div className="pl-3 space-y-1 font-mono">
                    <div>Intensity: {(halo?.dynamics?.intensity * 100)?.toFixed(0) ?? 50}%</div>
                    <div>Pulsation: {(halo?.dynamics?.pulsation * 100)?.toFixed(0) ?? 50}%</div>
                    <div>Pattern: {halo?.pattern ?? 'none'}</div>
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 mb-1">Narrative Style</div>
                  <div className="pl-3 space-y-1 font-mono">
                    <div>Primary: {narrative?.style?.primary ?? 'fluid'}</div>
                    <div>Density: {(narrative?.style?.density * 100)?.toFixed(0) ?? 50}%</div>
                    <div>Tonality: {(narrative?.style?.tonality * 100)?.toFixed(0) ?? 50}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4">Sync Stats</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Global Sync:</span>
                  <span className={getSyncColor(sync)}>
                    {(sync * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Coherence:</span>
                  <span>{(expression?.coherenceScore * 100)?.toFixed(1) ?? 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-cyan-500/10 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/20">
          <h3 className="text-xl font-semibold mb-2">💡 Instructions</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Utilisez les presets pour tester différents états émotionnels</li>
            <li>• Ajustez Tone/Energy/Warmth avec les sliders pour voir l'impact en temps réel</li>
            <li>• Le mode Auto fait varier l'identité aléatoirement toutes les 2 secondes</li>
            <li>• Le Expression Monitor montre la synchronisation Voice↔Halo↔Narrative</li>
            <li>• Un score de sync &gt; 85% est optimal (vert), 70-85% est acceptable (jaune)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
