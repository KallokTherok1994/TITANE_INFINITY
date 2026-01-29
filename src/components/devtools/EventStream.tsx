/**
 * TITANE∞ v26.4.0 — EventStream Component
 * Display realtime system events
 */

import type { SystemEvent } from '@/types';

export interface EventStreamProps {
  events: SystemEvent[];
  maxEvents?: number;
}

export function EventStream({ events, maxEvents = 50 }: EventStreamProps) {
  const displayEvents = events.slice(-maxEvents);

  return (
    <div className="space-y-2">
      {displayEvents.map(event => (
        <div
          key={event.id}
          className={`p-3 rounded border-l-4 ${
            event.type === 'error'
              ? 'border-red-500 bg-red-900/20'
              : event.type === 'warning'
                ? 'border-yellow-500 bg-yellow-900/20'
                : event.type === 'success'
                  ? 'border-green-500 bg-green-900/20'
                  : 'border-blue-500 bg-blue-900/20'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{event.message}</p>
              {event.source && (
                <p className="text-xs text-gray-400 mt-1">Source: {event.source}</p>
              )}
            </div>
            <span className="text-xs text-gray-500 ml-2">
              {new Date(event.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
