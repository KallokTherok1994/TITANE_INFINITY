// @ts-nocheck
/**
 * Tests pour EventStream Component
 * Coverage: Real-time events, Filtering, Auto-scroll
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventStream } from '@/components/devtools/EventStream';
import type { SystemEvent } from '@/types';

describe('EventStream Component', () => {
  const fixedTs = 1700000000000;
  const mockEvents: SystemEvent[] = [
    { id: '1', type: 'system', message: 'System started', timestamp: fixedTs },
    { id: '2', type: 'user', message: 'User action', timestamp: fixedTs },
    { id: '3', type: 'error', message: 'Error occurred', timestamp: fixedTs },
  ];

  describe('Rendering', () => {
    it('should render event stream', () => {
      render(<EventStream events={mockEvents} />);
      expect(screen.getByText('System started')).toBeInTheDocument();
    });

    it('should render empty state container', () => {
      render(<EventStream events={[]} />);
      expect(
        screen.queryAllByText(/System started|User action|Error occurred/)
      ).toHaveLength(0);
    });

    it('should show event timestamps', () => {
      render(<EventStream events={mockEvents} />);
      expect(screen.getAllByText(/\d{2}:\d{2}:\d{2}/)).toHaveLength(3);
    });
  });

  describe('Event Types', () => {
    it('should render system events', () => {
      render(<EventStream events={mockEvents} />);
      expect(screen.getByText('System started')).toBeInTheDocument();
    });

    it('should render user events', () => {
      render(<EventStream events={mockEvents} />);
      expect(screen.getByText('User action')).toBeInTheDocument();
    });

    it('should render error events', () => {
      render(<EventStream events={mockEvents} />);
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('should style events by type', () => {
      render(<EventStream events={mockEvents} />);
      const errorEvent = screen.getByText('Error occurred');
      const card = errorEvent.closest('[class*="border-red-500"]');
      expect(card).toBeTruthy();
    });
  });

  describe('Filtering', () => {
    it('should limit number of events via maxEvents', () => {
      render(<EventStream events={mockEvents} maxEvents={1} />);
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
      expect(screen.queryByText('System started')).not.toBeInTheDocument();
    });

    it('should render source label when provided', () => {
      const eventsWithSource = [
        { ...mockEvents[0], source: 'kernel' },
        mockEvents[1],
        mockEvents[2],
      ];

      render(<EventStream events={eventsWithSource} />);
      expect(screen.getByText(/source: kernel/i)).toBeInTheDocument();
    });
  });

  describe('Auto-scroll', () => {
    it('should render newly appended event on rerender', () => {
      render(<EventStream events={mockEvents} />);
      const { rerender } = render(<EventStream events={mockEvents} autoScroll />);

      const newEvents = [
        ...mockEvents,
        { id: '4', type: 'system', message: 'New event', timestamp: Date.now() },
      ];
      rerender(<EventStream events={newEvents} autoScroll />);

      expect(screen.getByText('New event')).toBeInTheDocument();
    });

    it('should keep deterministic rendering on user scroll event', () => {
      render(<EventStream events={mockEvents} autoScroll />);

      const container = screen.getByText('System started').closest('div');
      expect(container).toBeTruthy();
      fireEvent.scroll(container, { target: { scrollTop: 0 } });
      expect(screen.getByText('System started')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should render stable list with deterministic keys', () => {
      render(<EventStream events={mockEvents} />);
      expect(screen.getByText('System started')).toBeInTheDocument();
      expect(screen.getByText('User action')).toBeInTheDocument();
    });

    it('should preserve rendering with warning type events', () => {
      const events = [
        { id: 'w1', type: 'warning', message: 'Warn', timestamp: Date.now() },
      ];
      render(<EventStream events={events as any} />);
      expect(screen.getByText('Warn')).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<EventStream events={mockEvents} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
