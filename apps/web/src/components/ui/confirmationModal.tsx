'use client';

import React, { useState } from 'react';
import DeleteIcon from '@mui/icons-material/DeleteForeverOutlined';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import LoadingButton from './loadingButton';
import CustomSwitch from './customSwitch';
import InputBox from './inputBox';

export interface ConfirmationModalOptions {
  title: string;
  message?: string;
  details?: { label: string; value: string }[];
  confirmText?: string;
  cancelText?: string;
  icon?: 'delete' | 'info';
  loading?: boolean;
  enableSettlement?: boolean;
  reason?: boolean;
}

export interface ConfirmationResult {
  confirmed: boolean;
  isSettlement: boolean;
  settlementAmount: number;
  reason: string;
}

const ConfirmationModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [resolve, setResolve] = useState<((val: ConfirmationResult) => void) | null>(null);
  const [modalData, setModalData] = useState<ConfirmationModalOptions>({ title: '' });
  const [isSettlement, setIsSettlement] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState('');
  const [reasonValue, setReasonValue] = useState('');

  const confirm = (options: ConfirmationModalOptions): Promise<ConfirmationResult> => {
    setModalData({
      title: options?.title,
      message:
        options?.message ||
        'Are you sure you want to perform this action? This cannot be undone.',
      details: options?.details || [],
      confirmText: options?.confirmText || 'Yes',
      cancelText: options?.cancelText || 'No',
      icon: options?.icon || 'info',
      loading: options?.loading || false,
      enableSettlement: options?.enableSettlement ?? false,
      reason: options?.reason ?? false,
    });
    setIsOpen(true);
    setIsSettlement(false);
    setSettlementAmount('');
    setReasonValue('');

    return new Promise((resolveFn) => {
      setResolve(() => resolveFn);
    });
  };

  const handleConfirm = (result: boolean) => {
    setIsOpen(false);
    if (resolve) {
      resolve({
        confirmed: result,
        isSettlement,
        settlementAmount:
          isSettlement && settlementAmount ? Number(settlementAmount) : 0,
        reason: reasonValue,
      });
    }
  };

  const ModalContent = isOpen && (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-800/70"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col justify-between items-center text-center py-6 px-8">
          {modalData.icon === 'delete' ? (
            <DeleteIcon className="text-red-500" sx={{ fontSize: 70 }} />
          ) : (
            <InfoIcon className="text-blue-500" sx={{ fontSize: 70 }} />
          )}
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
            {modalData.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{modalData.message}</p>
        </div>

        {/* Dynamic Details */}
        {modalData.details && modalData.details.length > 0 && (
          <div className="px-8 pb-4">
            <div className="border border-custom rounded-lg bg-gray-50 dark:bg-gray-700 p-4 text-sm text-gray-700 dark:text-gray-300">
              {modalData.details.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between border-b border-custom last:border-none py-1"
                >
                  <span className="font-medium">{item.label}</span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settlement Switch + Input */}
        {modalData.enableSettlement && (
          <div className="px-8 pb-4">
            <div className="flex justify-between items-center py-2 border-t border-custom">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Close with Settlement?
              </span>
              <CustomSwitch
                name="settlement"
                checked={isSettlement}
                onChange={(e) => setIsSettlement(e.target.checked)}
              />
            </div>

            {isSettlement && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Settlement Amount
                </label>
                <InputBox
                  type="text"
                  name="settlementAmount"
                  value={settlementAmount}
                  onChange={(e) => setSettlementAmount(e.target.value)}
                  placeholder="Enter settlement amount"
                  disabled={!isSettlement}
                  maxLength={10}
                />
              </div>
            )}
          </div>
        )}

        {/* Reason for update status */}
        {modalData.reason && (
          <div className="px-8 pb-4 mt-3">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Submit Reason for change status
            </label>
            <InputBox
              type="text"
              name="reason"
              value={reasonValue}
              onChange={(e) => setReasonValue(e.target.value)}
              placeholder="Enter Reason"
              disabled={false}
              maxLength={300}
            />
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-center gap-3 px-6 pb-6">
          <LoadingButton
            type="button"
            isLoading={false}
            disabled={false}
            variant="secondary"
            onClick={() => handleConfirm(false)}
          >
            {modalData.cancelText}
          </LoadingButton>
          <LoadingButton
            type="button"
            isLoading={!!modalData.loading}
            variant={modalData.icon === 'delete' ? 'danger' : 'primary'}
            onClick={() => handleConfirm(true)}
            disabled={isSettlement && !settlementAmount}
          >
            {modalData.confirmText}
          </LoadingButton>
        </div>
      </div>
    </div>
  );

  return { confirm, ModalContent };
};

export default ConfirmationModal;
