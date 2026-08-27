'use client';

import React, { createContext, useContext, useState, useRef } from 'react';
import LoadingButton from './loadingButton';
import { FiAlertTriangle, FiInfo } from 'react-icons/fi';

export interface ConfirmationOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'success';
}

const ConfirmationContext = createContext<((options: ConfirmationOptions) => Promise<boolean>) | null>(null);

export function ConfirmationProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmationOptions>({ title: '' });
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = (opts: ConfirmationOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  };

  const handleClose = (value: boolean) => {
    setIsOpen(false);
    if (resolverRef.current) {
      resolverRef.current(value);
      resolverRef.current = null;
    }
  };

  return (
    <ConfirmationContext.Provider value={confirm}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/50 dark:bg-gray-950/70 p-4 animate-fade-in">
          <div className="bg-custom-card border border-custom rounded-2xl shadow-xl max-w-sm w-full p-6 animate-scale-up">
            <div className="flex flex-col items-center text-center">
              {options.variant === 'danger' ? (
                <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center mb-4">
                  <FiAlertTriangle className="w-7 h-7" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-custom-primary/10 text-custom-primary flex items-center justify-center mb-4">
                  <FiInfo className="w-7 h-7" />
                </div>
              )}

              <h3 className="text-lg font-bold text-gray-950">
                {options.title}
              </h3>
              {options.message && (
                <p className="text-sm text-custom-muted mt-2 leading-relaxed">
                  {options.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <LoadingButton
                variant="secondary"
                onClick={() => handleClose(false)}
                className="font-bold py-2"
              >
                {options.cancelText || 'Cancel'}
              </LoadingButton>
              <LoadingButton
                variant={options.variant === 'danger' ? 'danger' : 'primary'}
                onClick={() => handleClose(true)}
                className="font-bold py-2"
              >
                {options.confirmText || 'Confirm'}
              </LoadingButton>
            </div>
          </div>
        </div>
      )}
    </ConfirmationContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmationProvider');
  }
  return context;
}
