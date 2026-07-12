import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { HiChevronLeft, HiChevronRight, HiChevronUpDown, HiChevronUp, HiChevronDown } from 'react-icons/hi2';

export default function DataTable({ data = [], columns = [], pageSize: initialPageSize = 20, onPageChange }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      return sortDir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [data, sortKey, sortDir]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginated = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    const p = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(p);
    onPageChange?.(p);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const renderCell = (value) => {
    if (value === null || value === undefined) {
      return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">null</span>;
    }
    if (typeof value === 'number' && isNaN(value)) {
      return <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-medium">NaN</span>;
    }
    if (typeof value === 'boolean') {
      return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${value ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
          {String(value)}
        </span>
      );
    }
    const str = String(value);
    return str.length > 60 ? str.slice(0, 57) + '…' : str;
  };

  // Derive columns from data if not provided
  const cols =
    columns.length > 0
      ? columns
      : data.length > 0
      ? Object.keys(data[0]).map((key) => ({ key, label: key }))
      : [];

  if (!data.length || !cols.length) {
    return (
      <div className="flex items-center justify-center py-16 text-text-muted text-sm">
        No data to display
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-surface rounded-xl border border-border overflow-hidden"
    >
      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg border-b border-border">
              {cols.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary select-none whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key ? (
                      sortDir === 'asc' ? (
                        <HiChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <HiChevronDown className="w-3.5 h-3.5" />
                      )
                    ) : (
                      <HiChevronUpDown className="w-3.5 h-3.5 opacity-40" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.map((row, idx) => (
              <tr
                key={idx}
                className={`hover:bg-primary/[0.03] transition-colors ${
                  idx % 2 === 0 ? '' : 'bg-bg/50'
                }`}
              >
                {cols.map((col) => (
                  <td key={col.key} className="px-4 py-2.5 text-text-primary whitespace-nowrap">
                    {renderCell(row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-bg/50">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="bg-surface border border-border rounded-lg px-2 py-1 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {[10, 20, 50, 100].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <span className="ml-2">
            {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, data.length)} of {data.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <HiChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let page;
            if (totalPages <= 5) {
              page = i + 1;
            } else if (currentPage <= 3) {
              page = i + 1;
            } else if (currentPage >= totalPages - 2) {
              page = totalPages - 4 + i;
            } else {
              page = currentPage - 2 + i;
            }
            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <HiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
