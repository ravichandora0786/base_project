'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FiSearch,
  FiRefreshCw,
  FiPlus,
  FiFilter,
  FiChevronDown,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import LoadingButton from '@/components/ui/loadingButton';
import { STATUS_FILTER_OPTIONS } from '@/lib/constants';

interface TableToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: any;
  onStatusChange: (status: any) => void;
  onRefresh: () => void;
  onCreate?: () => void;
  searchPlaceholder?: string;
  createTooltip?: string;
  extraActions?: React.ReactNode;
}

function StatusFilterDropdown({
  value,
  onChange,
}: {
  value: any;
  onChange: (val: any) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const currentOption =
    STATUS_FILTER_OPTIONS.find((opt) => opt.value === statusFilterNorm(value)) ||
    STATUS_FILTER_OPTIONS[0];

  function statusFilterNorm(val: any) {
    if (val === true || val === 'true') return true;
    if (val === false || val === 'false') return false;
    return 'all';
  }

  const getStatusDot = (val: any) => {
    if (val === true) return 'bg-emerald-500 shadow-xs shadow-emerald-500/50';
    if (val === false) return 'bg-rose-500 shadow-xs shadow-rose-500/50';
    return 'bg-slate-400 dark:bg-slate-500';
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-10 px-3 flex items-center justify-between gap-2 rounded-xl border bg-custom-card text-xs sm:text-sm font-semibold transition shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-custom-primary/20 ${
          isOpen
            ? 'border-custom-primary ring-2 ring-custom-primary/20 text-custom-primary'
            : 'border-custom hover:border-custom-primary/50 text-custom'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate">
          <FiFilter
            className={`w-3.5 h-3.5 shrink-0 transition-colors ${
              currentOption.value !== 'all' ? 'text-custom-primary' : 'text-custom-muted'
            }`}
          />
          <span className={`w-2 h-2 rounded-full shrink-0 ${getStatusDot(currentOption.value)}`} />
          <span className="truncate">{currentOption.label}</span>
        </div>
        <FiChevronDown
          className={`w-3.5 h-3.5 text-custom-muted shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-custom-primary' : ''
          }`}
        />
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-xl border border-custom bg-custom-card shadow-xl z-50 py-1 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[10px] font-bold text-custom-muted uppercase tracking-wider border-b border-custom/60">
            Filter by Status
          </div>
          {STATUS_FILTER_OPTIONS.map((opt) => {
            const isSelected = statusFilterNorm(opt.value) === statusFilterNorm(value);
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs font-semibold flex items-center justify-between gap-2 transition cursor-pointer ${
                  isSelected
                    ? 'bg-custom-primary/10 text-custom-primary'
                    : 'text-custom hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
                role="option"
                aria-selected={isSelected}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${getStatusDot(opt.value)}`} />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <FiCheck className="w-3.5 h-3.5 text-custom-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TableToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onRefresh,
  onCreate,
  searchPlaceholder = 'Search by Name',
  createTooltip = 'Add New',
  extraActions,
}: TableToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 mb-2.5">
      {/* Search and Status filter - Clean side-by-side pair on all screens */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-grow max-w-full sm:max-w-md md:max-w-lg">
        {/* Search Box */}
        <div className="relative flex-grow min-w-0">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-muted pointer-events-none">
            <FiSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-9 pr-8 text-sm bg-custom-card border border-custom hover:border-custom-primary/50 focus:border-custom-primary rounded-xl text-custom placeholder-custom-muted/70 focus:outline-none focus:ring-2 focus:ring-custom-primary/20 transition shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-custom-muted hover:text-custom transition cursor-pointer"
              title="Clear search"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="w-36 sm:w-40 shrink-0">
          <StatusFilterDropdown value={statusFilter} onChange={onStatusChange} />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end space-x-2 sm:space-x-3 shrink-0">
        {extraActions}

        <LoadingButton
          variant="custom"
          onClick={onRefresh}
          className="p-2.5 border border-custom rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-custom-muted hover:text-custom transition cursor-pointer flex items-center justify-center h-10"
          title="Refresh Data"
        >
          <FiRefreshCw className="w-4 h-4 animate-hover-spin" />
        </LoadingButton>

        {onCreate && (
          <LoadingButton
            onClick={onCreate}
            variant="custom"
            className="flex items-center space-x-1.5 px-3.5 sm:px-4 h-10 bg-custom-primary hover:bg-custom-primary-hover text-white rounded-xl font-bold shadow-md transition cursor-pointer"
            title={createTooltip}
          >
            <FiPlus className="w-4 h-4" />
            {/* <span className="text-xs sm:text-sm font-semibold">{createTooltip}</span> */}
          </LoadingButton>
        )}
      </div>
    </div>
  );
}
