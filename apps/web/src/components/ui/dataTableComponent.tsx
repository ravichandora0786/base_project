'use client';

import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiChevronUp,
  FiChevronDown,
} from 'react-icons/fi';
import NoRecordFoundComponent from './noRecordFound';

interface DataTableComponentProps {
  columns: ColumnDef<any, any>[];
  data: any[];
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  setPagination: (pagination: any) => void;
  totalRows: number;
  columnVisibility?: any;
  setColumnVisibility?: any;
}

const DataTableComponent = ({
  columns,
  data,
  pagination,
  setPagination,
  totalRows,
  columnVisibility,
  setColumnVisibility,
}: DataTableComponentProps) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const defaultData = React.useMemo(() => [], []);

  const pageSize = pagination?.pageSize || 10;
  const currentPage = pagination?.pageIndex || 0;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

  const table = useReactTable({
    data: data ?? defaultData,
    columns,
    rowCount: totalRows,
    pageCount: totalPages,
    state: {
      pagination,
      columnVisibility,
      sorting,
    },
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(newPagination);
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  const startRow = totalRows === 0 ? 0 : currentPage * pageSize + 1;
  const endRow = Math.min((currentPage + 1) * pageSize, totalRows);
  const canPreviousPage = currentPage > 0;
  const canNextPage = currentPage < totalPages - 1;

  const handlePageChange = (newPageIndex: number) => {
    if (newPageIndex >= 0 && newPageIndex < totalPages) {
      setPagination({
        ...pagination,
        pageIndex: newPageIndex,
      });
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination({
      pageIndex: 0,
      pageSize: newPageSize,
    });
  };

  const getPageNumbers = () => {
    const delta = 1;
    const range: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 0; i < totalPages; i++) {
        range.push(i);
      }
    } else {
      range.push(0);

      if (currentPage > 2) {
        range.push('dots-1');
      }

      const start = Math.max(1, currentPage - delta);
      const end = Math.min(totalPages - 2, currentPage + delta);

      for (let i = start; i <= end; i++) {
        if (!range.includes(i)) {
          range.push(i);
        }
      }

      if (currentPage < totalPages - 3) {
        range.push('dots-2');
      }

      if (!range.includes(totalPages - 1)) {
        range.push(totalPages - 1);
      }
    }

    return range;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-custom-card border border-custom shadow-xs overflow-hidden">
      {/* Table Scrollable Body */}
      <div className="flex-grow overflow-auto min-h-0 relative">
        <table className="w-full text-left border-collapse">
          {/* Table Header */}
          <thead className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-custom">
            {table.getHeaderGroups()?.map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers?.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      className={`px-2 py-2 text-[11px] font-bold text-custom-muted uppercase tracking-wider select-none whitespace-nowrap ${
                        canSort
                          ? 'cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors'
                          : ''
                      }`}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-1.5">
                          <div className="flex-grow">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </div>
                          {canSort && (
                            <span className="inline-flex items-center shrink-0">
                              {isSorted === 'asc' ? (
                                <FiChevronUp className="w-3.5 h-3.5 text-custom-primary" />
                              ) : isSorted === 'desc' ? (
                                <FiChevronDown className="w-3.5 h-3.5 text-custom-primary" />
                              ) : (
                                <span className="opacity-0 group-hover:opacity-40 text-[9px] leading-none">
                                  ▲
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* Table Rows */}
          <tbody>
            {table.getRowModel()?.rows?.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="table-row-striped"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-2 py-1 text-sm text-slate-700 dark:text-slate-200 align-middle whitespace-nowrap"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <NoRecordFoundComponent />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Integrated Bottom Pagination & Summary Footer */}
      <div className="border-t border-custom px-3 py-2 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-2.5 select-none">
        {/* Left: Entries Info & Rows Per Page */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-3 text-xs text-custom-muted font-medium">
          <span>
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{startRow}</span>-
            <span className="font-bold text-slate-800 dark:text-slate-200">{endRow}</span> of{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">{totalRows}</span>
          </span>

          <div className="flex items-center gap-1.5 pl-2 sm:pl-3 border-l border-custom">
            <span className="hidden sm:inline">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="bg-custom-card border border-custom text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-custom-primary cursor-pointer transition shadow-2xs"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Pagination Controls */}
        <div className="flex items-center justify-center sm:justify-end space-x-1 sm:space-x-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handlePageChange(0)}
            disabled={!canPreviousPage}
            className="p-1.5 rounded-lg border border-custom text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="First Page"
          >
            <FiChevronsLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!canPreviousPage}
            className="px-2 py-1.5 rounded-lg border border-custom text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition"
            title="Previous Page"
          >
            <FiChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Prev</span>
          </button>

          <div className="flex items-center space-x-1">
            {getPageNumbers().map((p, idx) => {
              if (typeof p === 'string') {
                return (
                  <span key={`${p}-${idx}`} className="px-1 text-xs text-slate-400">
                    •••
                  </span>
                );
              }

              const isCurrent = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePageChange(p)}
                  className={`min-w-[28px] sm:min-w-[30px] h-7 px-1.5 sm:px-2 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                    isCurrent
                      ? 'bg-custom-primary text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 border border-custom hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {p + 1}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!canNextPage}
            className="px-2 py-1.5 rounded-lg border border-custom text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition"
            title="Next Page"
          >
            <span className="hidden md:inline">Next</span>
            <FiChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => handlePageChange(totalPages - 1)}
            disabled={!canNextPage}
            className="p-1.5 rounded-lg border border-custom text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Last Page"
          >
            <FiChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTableComponent;
