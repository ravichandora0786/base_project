'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { getInitials } from '@/lib/utils';

export interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
  name?: string | null;
}

export default function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  name = '',
}: ImagePreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Reset image error state whenever imageUrl changes
  useEffect(() => {
    setImgError(false);
  }, [imageUrl]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const hasImage = Boolean(imageUrl && !imgError);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-xl w-full flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 sm:-right-2 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
          title="Close Preview"
          aria-label="Close Preview"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Content Card */}
        {hasImage ? (
          <div className="max-h-[80vh] max-w-full overflow-hidden rounded-2xl shadow-2xl border border-white/20 bg-black/50 flex items-center justify-center">
            <img
              src={imageUrl!}
              alt={name || 'User photo'}
              className="max-h-[75vh] w-auto max-w-full object-contain mx-auto rounded-2xl"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-gray-900/90 border border-white/15 shadow-2xl flex flex-col items-center justify-center">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-custom-primary/20 text-custom-primary border-2 border-custom-primary/40 flex items-center justify-center text-4xl sm:text-5xl font-extrabold shadow-2xl tracking-wider select-none">
              {getInitials(name)}
            </div>
            <span className="text-xs text-white/50 mt-3 font-medium">No profile photo uploaded</span>
          </div>
        )}

        {/* Caption */}
        <div className="mt-3 text-center">
          <h3 className="text-white font-bold text-base sm:text-lg">{name}</h3>
        </div>
      </div>
    </div>,
    document.body
  );
}
