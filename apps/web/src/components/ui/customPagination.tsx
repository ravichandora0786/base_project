import React from 'react';
import LoadingButton from './loadingButton';

interface CustomPaginationProps {
  pageIndex: number;
  pageSize: number;
  total: number;
  onPageChange: (index: number) => void;
}

const CustomPagination = ({ pageIndex, pageSize, total, onPageChange }: CustomPaginationProps) => {
  if (!total || total <= pageSize) return null;

  const totalPages = Math.ceil(total / pageSize);
  const windowSize = 3; // 3 page numbers window

  let pages: number[] = [];

  if (totalPages <= windowSize) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    const current = pageIndex + 1;
    let start = current - Math.floor(windowSize / 2);
    let end = start + windowSize - 1;

    // Adjust bounds
    if (start < 1) {
      start = 1;
      end = windowSize;
    }
    if (end > totalPages - 1) {
      end = totalPages - 1;
      start = end - (windowSize - 1);
      if (start < 1) start = 1;
    }

    for (let i = start; i <= end; i++) pages.push(i);
  }

  const go = (p: number) => {
    const newIndex = Math.max(0, Math.min(totalPages - 1, p));
    if (newIndex !== pageIndex) onPageChange(newIndex);
  };

  return (
    <div className="pagination-wrapper flex justify-center mt-6">
      <ul className="pagination-list flex items-center space-x-1">
        {/* Previous */}
        <li>
          <LoadingButton
            variant="custom"
            className="pagination-btn px-3 py-1.5 border border-custom rounded-lg disabled:opacity-50 text-sm font-semibold transition"
            onClick={() => go(pageIndex - 1)}
            disabled={pageIndex === 0}
          >
            Previous
          </LoadingButton>
        </li>

        {/* Page Numbers */}
        {pages.map((page) => (
          <li key={page}>
            <LoadingButton
              variant="custom"
              className={`px-3 py-1.5 border rounded-lg text-sm font-semibold transition ${
                page - 1 === pageIndex
                  ? 'bg-indigo-600 border-indigo-600 text-white font-bold'
                  : 'border-custom hover:bg-gray-50'
              }`}
              onClick={() => go(page - 1)}
            >
              {page}
            </LoadingButton>
          </li>
        ))}

        {/* Separator + Last Page */}
        {totalPages > windowSize && (
          <li className="flex items-end">
            <span className="border-b-2 border-dashed mb-1 mr-1 px-4 border-gray" />
            <LoadingButton
              variant="custom"
              className={`px-3 py-1.5 border rounded-lg text-sm font-semibold transition ${
                pageIndex === totalPages - 1
                  ? 'bg-indigo-600 border-indigo-600 text-white font-bold'
                  : 'border-custom hover:bg-gray-50'
              }`}
              onClick={() => go(totalPages - 1)}
            >
              {totalPages}
            </LoadingButton>
          </li>
        )}

        {/* Next */}
        <li>
          <LoadingButton
            variant="custom"
            className="pagination-btn px-3 py-1.5 border border-custom rounded-lg disabled:opacity-50 text-sm font-semibold transition"
            onClick={() => go(pageIndex + 1)}
            disabled={pageIndex + 1 >= totalPages}
          >
            Next
          </LoadingButton>
        </li>
      </ul>
    </div>
  );
};

export default CustomPagination;
