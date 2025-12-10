/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║   TITANE∞ v20.0 — DataTable Component                             ║
 * ║   Generic table for logs, metrics, memory, etc.                    ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import './DataTable.css';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'No data',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <div className="data-table-empty">{emptyMessage}</div>;
  }

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={keyExtractor(item)}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.render
                    ? col.render(item)
                    : (item as Record<string, unknown>)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
