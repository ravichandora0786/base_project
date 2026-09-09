import React from 'react';
import { FiInbox } from 'react-icons/fi';

interface NoRecordFoundProps {
  title?: string;
  description?: string;
}

export default function NoRecordFoundComponent({
  title = 'No records found',
  description = 'There are no records matching your search or filters.',
}: NoRecordFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center select-none animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-custom flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3.5 shadow-2xs">
        <FiInbox className="w-7 h-7 stroke-[1.5]" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{title}</h3>
      <p className="text-xs text-custom-muted max-w-sm leading-relaxed">{description}</p>
    </div>
  );
}
