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
}

export default function GenericModal({
  showModal = false,
  closeModal = () => {},
  modalTitle = '',
  modalBody,
}: GenericModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!showModal || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 w-full h-full z-[9999] flex items-center justify-center bg-gray-800/70 p-4">
      {/* Modal Box */}
      <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <span className="font-semibold text-xl text-black dark:text-white">
            {modalTitle}
          </span>
          <button
            onClick={() => closeModal()}
            type="button"
            className="text-gray-500 hover:text-red-500 text-2xl font-bold transition"
            aria-label="Close Modal"
          >
            <IoCloseSharp size={22} />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-auto p-4 scrollbar-hide">
          {modalBody}
        </div>
      </div>
    </div>,
    document.body
  );
}
