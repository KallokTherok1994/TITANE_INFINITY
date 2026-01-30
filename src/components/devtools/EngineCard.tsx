/**
 * TITANE∞ v26.4.0 — EngineCard Component
 * Display engine information card
 */

import type { Engine } from '@/types';

export interface EngineCardProps {
  engine: Engine;
  onClick?: () => void;
}

export function EngineCard({ engine, onClick }: EngineCardProps) {
  return (
    <div
      className="p-4 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-750 cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-white">{engine.name}</h3>
        <span
          className={`px-2 py-1 rounded text-xs ${
            engine.status === 'active'
              ? 'bg-green-900 text-green-300'
              : engine.status === 'error'
                ? 'bg-red-900 text-red-300'
                : 'bg-gray-700 text-gray-300'
          }`}
        >
          {engine.status}
        </span>
      </div>
      {engine.metrics && (
        <div className="mt-2 text-sm text-gray-400">
          <div>Requests: {engine.metrics.requests}</div>
          <div>Errors: {engine.metrics.errors}</div>
          <div>Latency: {engine.metrics.latency}ms</div>
        </div>
      )}
    </div>
  );
}

EngineCard.displayName = 'EngineCard';
