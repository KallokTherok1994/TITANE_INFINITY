/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.7 — HALO VISUALIZER DEMO
 *   Demo component showcasing HaloVisualizer with all states
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { HaloVisualizer, HaloIndicator } from './HaloVisualizer';
import { haloEngine } from '@/services/voice/haloEngine';
import './HaloVisualizer.css';

export function HaloVisualizerDemo() {
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Halo Visualizer Demo</h1>

      {/* Main Visualizer */}
      <div className="flex flex-col items-center gap-4 p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <HaloVisualizer size={size} showLabel={true} showDuration={true} />

        {/* Size Selector */}
        <div className="flex gap-2">
          {(['sm', 'md', 'lg', 'xl'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`px-3 py-1 rounded ${
                size === s ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* State Controls */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Test States</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <button
            onClick={() => haloEngine.reset()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            ○ Idle
          </button>
          <button
            onClick={() => haloEngine.startBreathing()}
            className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
          >
            🌊 Breathing
          </button>
          <button
            onClick={() => haloEngine.startPulsing()}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            ⚡ Pulsing
          </button>
          <button
            onClick={() => haloEngine.startShimmer()}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            ✨ Shimmer
          </button>
          <button
            onClick={() => haloEngine.setError()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            🔴 Error
          </button>
        </div>
      </div>

      {/* Compact Indicators */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Compact Indicator</h2>
        <div className="flex items-center gap-2 p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <span>Status:</span>
          <HaloIndicator />
        </div>
      </div>

      {/* State Description */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">States Description</h2>
        <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>
            <strong>Idle</strong> (○ Blue): Halo statique, aucune activité
          </li>
          <li>
            <strong>Breathing</strong> (🌊 Cyan): Respiration lente, utilisateur parle
            (VAD speech)
          </li>
          <li>
            <strong>Pulsing</strong> (⚡ Purple): Pulsation rapide, IA réfléchit (AI
            thinking)
          </li>
          <li>
            <strong>Shimmer</strong> (✨ Gold): Scintillement rapide, TITANE parle (TTS
            speaking)
          </li>
          <li>
            <strong>Error</strong> (🔴 Red): Erreur détectée dans le pipeline vocal
          </li>
        </ul>
      </div>

      {/* Auto Cycle Demo */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Auto Cycle</h2>
        <button
          onClick={async () => {
            haloEngine.startBreathing();
            await new Promise(r => setTimeout(r, 2000));
            haloEngine.startPulsing();
            await new Promise(r => setTimeout(r, 2000));
            haloEngine.startShimmer();
            await new Promise(r => setTimeout(r, 2000));
            haloEngine.reset();
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          ▶️ Run Full Cycle (Breathing → Pulsing → Shimmer → Idle)
        </button>
      </div>
    </div>
  );
}
