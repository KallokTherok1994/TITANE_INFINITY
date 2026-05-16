/**
 * TITANE∞ v30.0.0 — LogFilters Component
 * Filter controls for log viewer
 */

export interface LogFiltersProps {
  filters: {
    level: string[];
    search: string;
    source?: string;
  };
  onFilterChange: (filters: LogFiltersProps['filters']) => void;
}

export function LogFilters({ filters, onFilterChange }: LogFiltersProps) {
  return (
    <div className="flex gap-4 p-4 bg-titanium-bg-elevated rounded-lg">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search logs..."
          value={filters.search}
          onChange={e => onFilterChange({ ...filters, search: e.target.value })}
          className="w-full px-3 py-2 bg-titanium-bg-interactive text-white rounded border border-titanium-border-strong focus:border-blue-500 outline-none"
        />
      </div>
      <div className="flex gap-2">
        {['debug', 'info', 'warn', 'error'].map(level => (
          <button
            key={level}
            onClick={() => {
              const newLevels = filters.level.includes(level)
                ? filters.level.filter(l => l !== level)
                : [...filters.level, level];
              onFilterChange({ ...filters, level: newLevels });
            }}
            className={`px-3 py-2 rounded text-sm font-medium ${
              filters.level.includes(level)
                ? 'bg-blue-600 text-white'
                : 'bg-titanium-bg-interactive text-titanium-text-secondary'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}

LogFilters.displayName = 'LogFilters';
