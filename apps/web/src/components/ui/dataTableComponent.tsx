'use client';

import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import NoRecordFoundComponent from './noRecordFound';
import LoadingButton from './loadingButton';

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
  const defaultData = React.useMemo(() => [], []);

  const table = useReactTable({
    data: data ?? defaultData,
    columns,
    rowCount: totalRows,
    state: {
      pagination,
      columnVisibility,
    },
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(newPagination);
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    debugTable: true,
  });

  return (
    <div className="table-container flex-1 flex flex-col min-h-0 gap-4">
      <div className="table-wrapper flex-grow overflow-auto bg-custom-card border border-custom rounded-2xl shadow-sm min-h-0">
        <table className="table-base w-full text-left border-collapse">
          <thead className="table-head sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 border-b border-custom shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.1)] dark:shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.1)]">
            {table.getHeaderGroups()?.map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers?.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="table-head-cell p-4 text-xs font-bold text-custom-muted uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-custom">
            {table.getRowModel()?.rows?.length > 0 ? (
              table.getRowModel()?.rows?.map((row, index) => (
                <tr 
                  key={row.id} 
                  className={`table-row hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition ${
                    index % 2 === 1 ? 'bg-custom-primary/5 dark:bg-custom-primary/5' : ''
                  }`}
                >
                  {row.getVisibleCells()?.map((cell) => (
                    <td key={cell.id} className="table-cell p-4 text-sm font-semibold">
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
                <td colSpan={columns.length} className="py-6 text-center">
                  <NoRecordFoundComponent />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalRows > pagination?.pageSize && (
        <div className="pagination-wrapper flex justify-center mt-6">
          <ul className="pagination-list flex items-center space-x-1">
            <li>
              <LoadingButton
                variant="custom"
                className="pagination-btn px-3 py-1.5 border border-custom rounded-lg disabled:opacity-50 text-sm font-semibold transition"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </LoadingButton>
            </li>

            {table.getCanPreviousPage() && (
              <li>
                <LoadingButton
                  variant="custom"
                  className="px-3 py-1.5 border border-custom rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                  onClick={() =>
                    table.setPageIndex(
                      table.getState().pagination.pageIndex - 1
                    )
                  }
                >
                  {table.getState().pagination.pageIndex}
                </LoadingButton>
              </li>
            )}

            <li>
              <LoadingButton
                variant="custom"
                className="px-3 py-1.5 border border-indigo-600 bg-indigo-600 text-white font-bold rounded-lg text-sm transition"
              >
                {table.getState().pagination.pageIndex + 1}
              </LoadingButton>
            </li>

            {table.getCanNextPage() && (
              <li>
                <LoadingButton
                  variant="custom"
                  className="px-3 py-1.5 border border-custom rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                  onClick={() =>
                    table.setPageIndex(
                      table.getState().pagination.pageIndex + 1
                    )
                  }
                >
                  {table.getState().pagination.pageIndex + 2}
                </LoadingButton>
              </li>
            )}

            <li>
              <LoadingButton
                variant="custom"
                className="pagination-btn px-3 py-1.5 border border-custom rounded-lg disabled:opacity-50 text-sm font-semibold transition"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </LoadingButton>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DataTableComponent;
