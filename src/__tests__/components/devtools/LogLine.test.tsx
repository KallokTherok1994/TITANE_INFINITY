/**
 * Tests pour LogLine Component
 * Coverage: Log formatting, Levels, Timestamps, Highlighting
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LogLine } from '@/components/devtools/LogLine';
import type { LogEntry } from '@/types';

describe('LogLine Component', () => {
  const mockLog: LogEntry = {
    id: '1',
    timestamp: Date.now(),
    level: 'info',
    message: 'Test log message',
    category: 'system'
  };

  describe('Rendering', () => {
    it('should render log line', () => {
      render(<LogLine log={mockLog} />);
      expect(screen.getByText('Test log message')).toBeInTheDocument();
    });

    it('should show timestamp', () => {
      render(<LogLine log={mockLog} showTimestamp />);
      expect(screen.getByText(/\d{2}:\d{2}:\d{2}/)).toBeInTheDocument();
    });

    it('should show category', () => {
      render(<LogLine log={mockLog} showCategory />);
      expect(screen.getByText('system')).toBeInTheDocument();
    });
  });

  describe('Log Levels', () => {
    it('should style info level', () => {
      render(<LogLine log={mockLog} />);
      const line = screen.getByText('Test log message').closest('div');
      expect(line?.className).toMatch(/info|blue/i);
    });

    it('should style error level', () => {
      const errorLog = { ...mockLog, level: 'error' };
      render(<LogLine log={errorLog} />);
      const line = screen.getByText('Test log message').closest('div');
      expect(line?.className).toMatch(/error|red|danger/i);
    });

    it('should style warning level', () => {
      const warningLog = { ...mockLog, level: 'warning' };
      render(<LogLine log={warningLog} />);
      const line = screen.getByText('Test log message').closest('div');
      expect(line?.className).toMatch(/warning|yellow/i);
    });

    it('should style debug level', () => {
      const debugLog = { ...mockLog, level: 'debug' };
      render(<LogLine log={debugLog} />);
      const line = screen.getByText('Test log message').closest('div');
      expect(line?.className).toMatch(/debug|gray/i);
    });
  });

  describe('Icons', () => {
    it('should show level icon', () => {
      render(<LogLine log={mockLog} showIcon />);
      expect(screen.getByRole('img', { name: /info/i })).toBeInTheDocument();
    });

    it('should show error icon', () => {
      const errorLog = { ...mockLog, level: 'error' };
      render(<LogLine log={errorLog} showIcon />);
      expect(screen.getByRole('img', { name: /error/i })).toBeInTheDocument();
    });
  });

  describe('Highlighting', () => {
    it('should highlight search term', () => {
      render(<LogLine log={mockLog} highlight="log" />);
      const highlighted = screen.getByText('log');
      expect(highlighted.tagName).toBe('MARK');
    });

    it('should highlight multiple occurrences', () => {
      const logWithMultiple = { ...mockLog, message: 'test log and log again' };
      render(<LogLine log={logWithMultiple} highlight="log" />);
      expect(screen.getAllByText('log')).toHaveLength(2);
    });
  });

  describe('Metadata', () => {
    it('should show additional metadata', () => {
      const logWithMeta = { ...mockLog, metadata: { user: 'admin', action: 'login' } };
      render(<LogLine log={logWithMeta} showMetadata />);
      expect(screen.getByText(/user.*admin/i)).toBeInTheDocument();
    });
  });

  describe('Truncation', () => {
    it('should truncate long messages', () => {
      const longLog = { ...mockLog, message: 'A'.repeat(200) };
      render(<LogLine log={longLog} maxLength={100} />);
      const message = screen.getByText(/A+\.\.\./);
      expect(message.textContent?.length).toBeLessThan(110);
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<LogLine log={mockLog} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
