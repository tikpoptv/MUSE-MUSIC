'use client';

import { AlertTriangle } from 'lucide-react';

interface NavigateAwayConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetLanguage?: string;
}

export default function NavigateAwayConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  targetLanguage
}: NavigateAwayConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Navigate to Existing Processing?
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                An existing processing for <span className="font-semibold">{targetLanguage || 'this language'}</span> was found.
              </p>
              <p>
                You are currently managing a new processing. Do you want to leave this page and navigate to the existing processing?
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-[#7B61FF] rounded-lg hover:bg-[#6B51EF] transition-colors"
          >
            Navigate
          </button>
        </div>
      </div>
    </div>
  );
}

