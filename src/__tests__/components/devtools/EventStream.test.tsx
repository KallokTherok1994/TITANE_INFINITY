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
  const mockEvents: SystemEvent[] = [
    { id: '1', type: 'system', message: 'System started', timestamp: Date.now() },
    { id: '2', type: 'user', message: 'User action', timestamp: Date.now() },
    { id: '3', type: 'error', message: 'Error occurred', timestamp: Date.now() },
  ];

  describe('Rendering', () => {
    it('should render event stream', () => {
      render(<EventStream events={mockEvents} />);
      expect(screen.getByText('System started')).toBeInTheDocument();
    });

    it.skip('should render empty state', () => {
      render(<EventStream events={[]} />);
      expect(screen.getByText(/no events|empty/i)).toBeInTheDocument();
    });

    it('should show event timestamps', () => {
      render(<EventStream events={mockEvents} showTimestamps />);
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

    it.skip('should style events by type', () => {
      render(<EventStream events={mockEvents} />);
      const errorEvent = screen.getByText('Error occurred');
      expect(errorEvent.className).toMatch(/error|danger/i);
    });
  });

  describe('Filtering', () => {
    it.skip('should filter by event type', () => {
      render(<EventStream events={mockEvents} />);

      const typeFilter = screen.getByRole('combobox', { name: /type/i });
      fireEvent.change(typeFilter, { target: { value: 'error' } });

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
      expect(screen.queryByText('System started')).not.toBeInTheDocument();
    });

    it.skip('should search events', () => {
      render(<EventStream events={mockEvents} />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'User' } });

      expect(screen.getByText('User action')).toBeInTheDocument();
      expect(screen.queryByText('System started')).not.toBeInTheDocument();
    });
  });

  describe('Auto-scroll', () => {
    it('should auto-scroll to latest event', () => {
      const { rerender } = render(<EventStream events={mockEvents} autoScroll />);

      const newEvents = [
        ...mockEvents,
        { id: '4', type: 'system', message: 'New event', timestamp: Date.now() },
      ];
      rerender(<EventStream events={newEvents} autoScroll />);

      expect(screen.getByText('New event')).toBeInTheDocument();
    });

    it.skip('should disable auto-scroll on user scroll', () => {
      render(<EventStream events={mockEvents} autoScroll />);

      const container = screen.getByRole('log');
      fireEvent.scroll(container, { target: { scrollTop: 0 } });

      // Auto-scroll should be paused
      expect(container.dataset.autoscroll).toBe('false');
    });
  });

  describe('Actions', () => {
    it.skip('should clear events', () => {
      const onClear = vi.fn();
      render(<EventStream events={mockEvents} onClear={onClear} />);

      const clearButton = screen.getByRole('button', { name: /clear/i });
      fireEvent.click(clearButton);

      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it.skip('should pause stream', () => {
      const { rerender } = render(<EventStream events={mockEvents} />);

      const pauseButton = screen.getByRole('button', { name: /pause/i });
      fireEvent.click(pauseButton);

      const newEvents = [
        ...mockEvents,
        { id: '4', type: 'system', message: 'New', timestamp: Date.now() },
      ];
      rerender(<EventStream events={newEvents} />);

      // Stream paused, new event not shown
      expect(screen.queryByText('New')).not.toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it.skip('should match snapshot', () => {
      const { container } = render(<EventStream events={mockEvents} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
