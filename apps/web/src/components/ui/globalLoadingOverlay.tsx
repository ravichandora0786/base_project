'use client';

/**
 * Global full-screen loading overlay
 * @format
 */

import { useAppSelector } from '@/store';
import { selectGlobalLoading } from '@/store/common/selector';

export default function GlobalLoadingOverlay() {
  const loading = useAppSelector(selectGlobalLoading);
  if (!loading) return null;
  return (
    <div className="fixed inset-0 z-[9999] bg-black/25 backdrop-blur-[1px] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-custom-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
