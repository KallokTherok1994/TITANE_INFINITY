import { describe, expect, it } from 'vitest';
import { analyzeLogsLocally, getLogAnalysisReportMarkdown } from '../index';

describe('log analysis service', () => {
  it('builds an intelligent report from raw logs', () => {
    const report = analyzeLogsLocally([
      {
        id: '1',
        level: 'error',
        source_core: 'chat',
        message: 'Provider timeout fail',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        level: 'warn',
        source_core: 'monitoring',
        message: 'warning threshold reached',
        timestamp: new Date().toISOString(),
      },
      {
        id: '3',
        level: 'info',
        source_core: 'system',
        message: 'boot completed',
        timestamp: new Date().toISOString(),
      },
    ]);

    expect(report.totalLogs).toBe(3);
    expect(report.errorCount).toBe(1);
    expect(report.warningCount).toBe(1);
    expect(report.anomalies.length).toBeGreaterThan(0);
    expect(report.improvementOpportunities.length).toBeGreaterThan(0);
  });

  it('renders markdown report with expected sections', () => {
    const report = analyzeLogsLocally([
      {
        id: '1',
        level: 'error',
        source_core: 'chat',
        message: 'panic undefined reference',
        timestamp: new Date().toISOString(),
      },
    ]);

    const markdown = getLogAnalysisReportMarkdown(report);

    expect(markdown).toContain('TITANE Log Analysis Report');
    expect(markdown).toContain('## Inconsistencies');
    expect(markdown).toContain('## Improvement Opportunities');
    expect(markdown).toContain('## Anomalies');
  });
});
