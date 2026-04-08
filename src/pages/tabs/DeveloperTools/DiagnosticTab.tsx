/**
 * TITANE∞ v30.0.0 — Diagnostic Tab
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
