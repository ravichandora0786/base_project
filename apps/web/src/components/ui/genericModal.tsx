'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoCloseSharp } from 'react-icons/io5';

interface GenericModalProps {
  showModal?: boolean;
  closeModal?: () => void;
  modalTitle?: string;
  modalBody: React.ReactNode;
  name?: string;
  maxWidth?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl';
}

const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
};

export default function GenericModal({
  showModal = false,
  closeModal = () => {},
  modalTitle = '',
  modalBody,
  maxWidth,
  size = '2xl',
}: GenericModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!showModal || !mounted) return null;

  const widthClass = maxWidth || sizeClasses[size] || 'max-w-2xl';

  return createPortal(
    <div className="fixed inset-0 w-full h-full z-[9999] flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4">
      {/* Modal Box */}
      <div className={`relative w-full ${widthClass} max-h-[90vh] flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700/80 overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700/80">
          <span className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
            {modalTitle}
          </span>
          <button
            onClick={() => closeModal()}
            type="button"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
            aria-label="Close Modal"
            title="Close"
          >
            <IoCloseSharp size={20} />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-auto p-5 scrollbar-hide">
          {modalBody}
        </div>
      </div>
    </div>,
    document.body
  );
}
