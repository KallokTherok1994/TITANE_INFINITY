/**
 * TITANE∞ v25.7.5 — Diagnostic Tab
 */

import { LazyChatDiagnostic } from '../../DevToolsLazy';

const DiagnosticTab = () => {
  return (
    <div className="devtools-tab-diagnostic">
      <LazyChatDiagnostic variant="panel" />
    </div>
  );
};

export default DiagnosticTab;
