import React from 'react';

interface FullScreenLoaderProps {
  showLoader?: boolean;
  message?: string;
}

const FullScreenLoader = ({ showLoader = false, message = 'Loading...' }: FullScreenLoaderProps) => {
  return (
    <>
      {showLoader && (
        <div className="fixed inset-0 w-full h-full z-[9999] flex items-center justify-center bg-gray-800/70">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-lg font-medium">{message}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default FullScreenLoader;
