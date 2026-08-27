'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import LoadingButton from '@/components/ui/loadingButton';
import { FiArrowLeft, FiHome } from 'react-icons/fi';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-6 py-12 text-center animate-fade-in">
      <div className="relative mb-6">
        {/* Decorative background circles */}
        <div className="absolute inset-0 bg-custom-primary/5 rounded-full blur-3xl transform scale-150 opacity-60"></div>
        
        {/* Large 404 Text design */}
        <h1 className="relative text-9xl font-extrabold text-custom-primary tracking-widest drop-shadow-sm select-none">
          404
        </h1>
      </div>

      <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mt-4">
        Page Not Found
      </h2>
      
      <p className="mt-3 text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
        The page you are looking for does not exist, has been removed, or was typed incorrectly.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full max-w-sm">
        <LoadingButton
          variant="secondary"
          onClick={() => router.back()}
          className="flex items-center justify-center space-x-2 px-6 py-3 w-full sm:w-auto font-bold shadow-sm transition"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </LoadingButton>

        <LoadingButton
          variant="custom"
          onClick={() => router.push('/dashboard')}
          className="flex items-center justify-center space-x-2 px-6 py-3 w-full sm:w-auto bg-custom-primary hover:bg-custom-primary-hover text-white font-bold rounded-xl shadow-md transition"
        >
          <FiHome className="w-4 h-4" />
          <span>Back to Home</span>
        </LoadingButton>
      </div>
    </div>
  );
}
