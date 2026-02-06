// @ts-nocheck
/**
 * Tests pour LogLine Component
 * Coverage: Log formatting, Levels, Timestamps, Highlighting
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LogLine } from '@/components/devtools/LogLine';
import type { LogEntry } from '@/types';

describe('LogLine Component', () => {
  const mockLog: LogEntry = {
    id: '1',
    timestamp: new Date('2026-02-02T12:00:00Z').getTime(),
    level: 'info',
    message: 'Test log message',
    category: 'system',
  };

  beforeEach(() => {
    vi.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('12:00:00');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render log line', () => {
      render(<LogLine log={mockLog} />);
      expect(screen.getByText('Test log message')).toBeInTheDocument();
    });

    it('should show timestamp', () => {
      render(<LogLine log={mockLog} />);
      expect(screen.getByText('12:00:00')).toBeInTheDocument();
    });

    it('should show category', () => {
      render(<LogLine log={mockLog} />);
      expect(screen.getByText(/\[system\]/i)).toBeInTheDocument();
    });
  });

  describe('Log Levels', () => {
    it('should style info level', () => {
      render(<LogLine log={mockLog} />);
      const level = screen.getByText('INFO');
      expect(level.className).toMatch(/text-blue-400/);
    });

    it('should style error level', () => {
      const errorLog = { ...mockLog, level: 'error' };
      render(<LogLine log={errorLog} />);
      const level = screen.getByText('ERROR');
      expect(level.className).toMatch(/text-red-400/);
    });

    it('should style warning level', () => {
      const warningLog = { ...mockLog, level: 'warn' };
      render(<LogLine log={warningLog} />);
      const level = screen.getByText('WARN');
      expect(level.className).toMatch(/text-yellow-400/);
    });

    it('should style debug level', () => {
      const debugLog = { ...mockLog, level: 'debug' };
      render(<LogLine log={debugLog} />);
      const level = screen.getByText('DEBUG');
      expect(level.className).toMatch(/text-gray-400/);
    });
  });

  describe('Highlighting', () => {
    it('should apply highlight background', () => {
      const { container } = render(<LogLine log={mockLog} highlight />);
      expect(container.firstChild?.className).toMatch(/bg-blue-900\/20/);
    });
  });

  describe('Metadata', () => {
    it('should show additional metadata', () => {
      const logWithMeta = {
        ...mockLog,
        details: { user: 'admin', action: 'login' },
      };
      render(<LogLine log={logWithMeta} />);
      expect(screen.getByText(/"user": "admin"/i)).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<LogLine log={mockLog} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
