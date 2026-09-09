'use client';

import React from 'react';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import LoadingButton from '@/components/ui/loadingButton';

interface TableRowActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  editTitle?: string;
  deleteTitle?: string;
  viewTitle?: string;
  extraActions?: React.ReactNode;
}

export default function TableRowActions({
  onEdit,
  onDelete,
  onView,
  editTitle = 'Edit',
  deleteTitle = 'Delete',
  viewTitle = 'View Details',
  extraActions,
}: TableRowActionsProps) {
  return (
    <div className="text-right space-x-1.5 whitespace-nowrap">
      {extraActions}

      {onView && (
        <LoadingButton
          variant="custom"
          onClick={onView}
          className="w-8 h-8 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition inline-flex items-center justify-center shadow-2xs"
          aria-label={viewTitle}
          title={viewTitle}
        >
          <FiEye className="w-4 h-4" />
        </LoadingButton>
      )}

      {onEdit && (
        <LoadingButton
          variant="custom"
          onClick={onEdit}
          className="w-8 h-8 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/40 transition inline-flex items-center justify-center shadow-2xs"
          aria-label={editTitle}
          title={editTitle}
        >
          <FiEdit2 className="w-4 h-4" />
        </LoadingButton>
      )}

      {onDelete && (
        <LoadingButton
          variant="custom"
          onClick={onDelete}
          className="w-8 h-8 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent hover:border-red-100 dark:hover:border-red-900/40 transition inline-flex items-center justify-center shadow-2xs"
          aria-label={deleteTitle}
          title={deleteTitle}
        >
          <FiTrash2 className="w-4 h-4" />
        </LoadingButton>
      )}
    </div>
  );
}
