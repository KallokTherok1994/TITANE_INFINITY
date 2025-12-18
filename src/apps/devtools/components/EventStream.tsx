/**
 * TITANE∞ v22.0 — EventStream Component
 * Real-time event streaming with filtering and replay
 */

import React, { useState, useEffect, useCallback } from 'react';
import { secureInvoke } from '@/lib/security';
import './EventStream.css';

type EventType = 'System' | 'Core' | 'Memory' | 'IPC' | 'User' | 'Error';
type EventSeverity = 'Info' | 'Warning' | 'Error' | 'Critical';

interface StreamEvent {
  id: string;
  timestamp: string;
  event_type: EventType;
  severity: EventSeverity;
  source: string;
  message: string;
  details?: Record<string, unknown>;
  correlation_id?: string;
}

interface EventStreamResponse {
  success: boolean;
  data?: StreamEvent[];
  error?: string;
}

export const EventStream: React.FC = () => {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<StreamEvent[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    if (isPaused) return;

    try {
      const response = await secureInvoke<EventStreamResponse>('get_event_stream', {
        limit: 100,
      });
      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  }, [isPaused]); // useCallback deps

  // Auto-refresh
  useEffect(() => {
    if (!isPaused) {
      fetchEvents();
    }
    const interval = setInterval(() => {
      if (!isPaused) {
        fetchEvents();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, fetchEvents]); // Fixed deps

  // Apply filters
  useEffect(() => {
    let filtered = events;

    // Type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(e => e.event_type === typeFilter);
    }

    // Severity filter
    if (severityFilter !== 'ALL') {
      filtered = filtered.filter(e => e.severity === severityFilter);
    }

    // Search query
    if (searchQuery) {
      filtered = filtered.filter(
        e =>
          e.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.source.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, typeFilter, severityFilter, searchQuery]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll) {
      const container = document.querySelector('.event-list');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [filteredEvents, autoScroll]);

  // Clear events
  const handleClear = async () => {
    try {
      await secureInvoke('clear_event_stream');
      setEvents([]);
      setFilteredEvents([]);
    } catch (error) {
      console.error('Failed to clear events:', error);
    }
  };

  // Export events
  const handleExport = () => {
    const dataStr = JSON.stringify(filteredEvents, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `events-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Get severity color
  const getSeverityColor = (severity: EventSeverity): string => {
    switch (severity) {
      case 'Info':
        return '#3b82f6';
      case 'Warning':
        return '#f59e0b';
      case 'Error':
        return '#ef4444';
      case 'Critical':
        return '#dc2626';
      default:
        return '#9ca3af';
    }
  };

  // Get type icon
  const getTypeIcon = (type: EventType): string => {
    switch (type) {
      case 'System':
        return '⚙️';
      case 'Core':
        return '🔧';
      case 'Memory':
        return '🧠';
      case 'IPC':
        return '📡';
      case 'User':
        return '👤';
      case 'Error':
        return '❌';
      default:
        return '📌';
    }
  };

  return (
    <div className="event-stream">
      {/* Header Stats */}
      <div className="event-stats">
        <div className="event-stat">
          <span className="event-stat-value">{events.length}</span>
          <span className="event-stat-label">Total Events</span>
        </div>
        <div className="event-stat" style={{ color: getSeverityColor('Info') }}>
          <span className="event-stat-value">
            {events.filter(e => e.severity === 'Info').length}
          </span>
          <span className="event-stat-label">Info</span>
        </div>
        <div className="event-stat" style={{ color: getSeverityColor('Warning') }}>
          <span className="event-stat-value">
            {events.filter(e => e.severity === 'Warning').length}
          </span>
          <span className="event-stat-label">Warnings</span>
        </div>
        <div className="event-stat" style={{ color: getSeverityColor('Error') }}>
          <span className="event-stat-value">
            {events.filter(e => e.severity === 'Error').length}
          </span>
          <span className="event-stat-label">Errors</span>
        </div>
        <div className="event-stat" style={{ color: getSeverityColor('Critical') }}>
          <span className="event-stat-value">
            {events.filter(e => e.severity === 'Critical').length}
          </span>
          <span className="event-stat-label">Critical</span>
        </div>
      </div>

      {/* Controls */}
      <div className="event-controls">
        <select
          className="event-select"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All Types</option>
          <option value="System">System</option>
          <option value="Core">Core</option>
          <option value="Memory">Memory</option>
          <option value="IPC">IPC</option>
          <option value="User">User</option>
          <option value="Error">Error</option>
        </select>

        <select
          className="event-select"
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value)}
        >
          <option value="ALL">All Severities</option>
          <option value="Info">Info</option>
          <option value="Warning">Warning</option>
          <option value="Error">Error</option>
          <option value="Critical">Critical</option>
        </select>

        <input
          type="text"
          className="event-search"
          placeholder="Search events..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />

        <label className="event-toggle">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={e => setAutoScroll(e.target.checked)}
          />
          <span>Auto-scroll</span>
        </label>

        <button
          className={`event-btn ${isPaused ? 'event-btn-paused' : ''}`}
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? '▶️ Resume' : '⏸️ Pause'}
        </button>

        <button className="event-btn" onClick={handleExport}>
          💾 Export
        </button>

        <button className="event-btn event-btn-danger" onClick={handleClear}>
          🗑️ Clear
        </button>
      </div>

      {/* Event List */}
      <div className="event-list">
        {filteredEvents.length === 0 ? (
          <div className="event-empty">
            <span>📡</span>
            <p>No events to display</p>
            {isPaused && <p className="event-empty-sub">Stream is paused</p>}
          </div>
        ) : (
          filteredEvents.map(event => (
            <div
              key={event.id}
              className={`event-item event-${event.severity.toLowerCase()}`}
            >
              <div className="event-header">
                <span className="event-time">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
                <span className="event-type-icon">{getTypeIcon(event.event_type)}</span>
                <span className="event-type">{event.event_type}</span>
                <span
                  className="event-severity"
                  style={{ color: getSeverityColor(event.severity) }}
                >
                  {event.severity}
                </span>
                <span className="event-source">{event.source}</span>
                {event.correlation_id && (
                  <span className="event-correlation" title="Correlation ID">
                    🔗 {event.correlation_id.substring(0, 8)}
                  </span>
                )}
              </div>
              <div className="event-message">{event.message}</div>
              {event.details && Object.keys(event.details).length > 0 && (
                <details className="event-details">
                  <summary>View details</summary>
                  <pre>{JSON.stringify(event.details, null, 2)}</pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
