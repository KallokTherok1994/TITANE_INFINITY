/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v30.0.0 — PERFORMANCE TEST PAGE
 *   Test automatisé des performances Living Engines
 * ═══════════════════════════════════════════════════════════════
 */

import { ErrorBoundary } from '@/components/ErrorBoundary';
import PerformanceDashboard from '../components/PerformanceDashboard';

const PerformanceTest: React.FC = () => {
  return (
    <div className="performance-test-page" data-testid="page-performance-test">
      <ErrorBoundary>
        <PerformanceDashboard />
      </ErrorBoundary>
    </div>
  );
};

export default PerformanceTest;
