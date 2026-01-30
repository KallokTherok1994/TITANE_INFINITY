/**
 * TITANE∞ v26.4.0 — StatusPill Component
 * Status indicator pill
 */

export interface StatusPillProps {
  status: 'active' | 'inactive' | 'error' | 'warning';
  label?: string;
}

export function StatusPill({ status, label }: StatusPillProps) {
  const colors = {
    active: 'bg-green-900 text-green-300 border-green-500',
    inactive: 'bg-gray-700 text-gray-300 border-gray-500',
    error: 'bg-red-900 text-red-300 border-red-500',
    warning: 'bg-yellow-900 text-yellow-300 border-yellow-500',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded border text-xs font-medium ${colors[status]}`}
    >
      <span className="w-2 h-2 rounded-full bg-current mr-1.5" />
      {label || status}
    </span>
  );
}

StatusPill.displayName = 'StatusPill';
