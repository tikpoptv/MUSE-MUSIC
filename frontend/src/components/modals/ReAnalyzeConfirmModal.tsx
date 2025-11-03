'use client';

import { AlertTriangle } from 'lucide-react';

interface ReAnalyzeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing?: boolean;
  targetLanguage?: string;
}

export default function ReAnalyzeConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isProcessing = false,
  targetLanguage
}: ReAnalyzeConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Confirm Re-Analysis
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                Re-analyzing will overwrite all existing data. This action cannot be undone.
              </p>
              <div className="bg-gray-50 rounded-lg p-3 mt-3">
                <p className="font-medium text-gray-900 mb-2">What will be processed:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Translation {targetLanguage && <span className="font-semibold">(to {targetLanguage})</span>}</li>
                  <li>Mood Analysis</li>
                </ul>
              </div>
              <p className="font-medium text-gray-900 mt-3">
                Are you sure you want to continue?
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-4 py-2 text-white bg-[#7B61FF] rounded-lg hover:bg-[#6B51EF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

