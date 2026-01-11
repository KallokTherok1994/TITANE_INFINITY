/**
 * TITANE∞ v25.7.5 — Logs Tab
 */

import { LazyLogsCard, LazyErrorsCard } from '../../DevToolsLazy';
import { logger } from '@/utils/logger';

interface LogsTabProps {
  logs: string[];
  errorCount: number;
}

const LogsTab = ({ logs, errorCount }: LogsTabProps) => {
  return (
    <div className="devtools-tab-logs">
      <div className="devtools-grid devtools-grid--logs">
        <LazyLogsCard
          totalLogs={logs.length}
          recentLogs={logs.slice(-10).reverse()}
          onViewAll={() => logger.debug('View all logs requested')}
        />

        <LazyErrorsCard
          errorCount={errorCount}
          latestError={logs.filter(log => log.includes('[ERROR]')).slice(-1)[0]}
          errorType={errorCount > 5 ? 'critical' : errorCount > 0 ? 'warning' : 'info'}
          onViewErrors={() => logger.debug('View errors requested')}
        />
      </div>

      {/* Full logs list */}
      <div className="devtools-panel__content" style={{ marginTop: '24px' }}>
        <div className="devtools-panel__header">
          <h3 className="devtools-panel__title">Logs Système</h3>
          <span className="devtools-panel__count">{logs.length} entrées</span>
        </div>
        <div className="devtools-logs">
          {logs
            .slice()
            .reverse()
            .map((log, i) => (
              <div
                key={i}
                className={`devtools-log-item ${
                  log.includes('[ERROR]')
                    ? 'devtools-log-item--error'
                    : log.includes('[WARN]')
                      ? 'devtools-log-item--warning'
                      : 'devtools-log-item--info'
                }`}
              >
                <span className="devtools-log-item__dot" />
                <span className="devtools-log-item__text">{log}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default LogsTab;
