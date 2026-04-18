const ANSI_PATTERN = /\u001b\[[0-9;?]*[ -/]*[@-~]/g;

export function normalizeMonitorArgs(args = []) {
  if (args[0] === '--') {
    return args.slice(1);
  }

  return args;
}

export function stripAnsi(line = '') {
  return line.replace(ANSI_PATTERN, '');
}

function isCargoProgressLine(lowerLine) {
  return (
    lowerLine.startsWith('compiling ') ||
    lowerLine.startsWith('building [') ||
    lowerLine.startsWith('finished `')
  );
}

export function classifyMonitorLine(line = '') {
  const normalized = stripAnsi(line).trim();
  const lower = normalized.toLowerCase();
  const isBeforeDevCommandLine = lower.includes('running beforedevcommand (`bash -lc');
  const isExpectedFrontendWaitLine = lower.includes(
    'warn waiting for your frontend dev server to start on http://127.0.0.1:5173'
  );
  const ignore =
    !normalized ||
    isBeforeDevCommandLine ||
    isExpectedFrontendWaitLine ||
    isCargoProgressLine(lower);

  const bootSeen =
    lower.includes('tauri app started') ||
    lower.includes('running dev command') ||
    lower.includes('vite v') ||
    lower.includes('app render') ||
    lower.includes('local:') ||
    lower.includes('ready in') ||
    lower.includes('ui_boot_marker');

  const isError =
    !ignore &&
    (/error:\s/.test(lower) ||
      /error\[[^\]]+\]/.test(lower) ||
      lower.includes('thread \x27main\x27 panicked') ||
      lower.includes('panic!') ||
      /\bfailed\b/.test(lower));
  const isWarn = !ignore && /\bwarn\b/.test(lower);
  const hasTimeout = lower.includes('timeout');
  const hasUnknown = lower.includes('unknown');

  return {
    normalized,
    ignore,
    bootSeen,
    isError,
    isWarn,
    hasTimeout,
    hasUnknown,
  };
}
