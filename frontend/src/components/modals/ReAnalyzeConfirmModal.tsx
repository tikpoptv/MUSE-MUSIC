'use client';

import { AlertTriangle } from 'lucide-react';

interface ReAnalyzeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing?: boolean;
  targetLanguage?: string;
  mode?: 're-analyze' | 'new-analysis';
  shareRequest?: boolean;
  onShareRequestChange?: (value: boolean) => void;
}

export default function ReAnalyzeConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isProcessing = false,
  targetLanguage,
  mode = 're-analyze',
  shareRequest,
  onShareRequestChange
}: ReAnalyzeConfirmModalProps) {
  if (!isOpen) return null;

  const isNewAnalysis = mode === 'new-analysis';
  const showShareToggle = isNewAnalysis && typeof shareRequest === 'boolean' && !!onShareRequestChange;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {isNewAnalysis ? 'Start New Analysis' : 'Confirm Re-Analysis'}
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              {isNewAnalysis ? (
                <p>
                  This will create a brand new analysis for this song. Existing public data remains untouched.
                </p>
              ) : (
              <p>
                Re-analyzing will overwrite all existing data. This action cannot be undone.
              </p>
              )}
              <div className="bg-gray-50 rounded-lg p-3 mt-3">
                <p className="font-medium text-gray-900 mb-2">What will be processed:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Translation {targetLanguage && <span className="font-semibold">(to {targetLanguage})</span>}</li>
                  <li>Mood Analysis</li>
                </ul>
              </div>
              <p className="font-medium text-gray-900 mt-3">
                {isNewAnalysis ? 'Do you want to start this new analysis?' : 'Are you sure you want to continue?'}
              </p>
              {showShareToggle && (
                <div className="mt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareRequest}
                      onChange={(e) => onShareRequestChange?.(e.target.checked)}
                      className="w-5 h-5 text-[#7B61FF] border-gray-300 rounded focus:ring-[#7B61FF] focus:ring-2 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">
                      Share this analysis with the community?
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-2 ml-8">
                    When enabled, the new analysis goes through the approval flow and can become public.
                  </p>
                </div>
              )}
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
            {isProcessing ? 'Processing...' : (isNewAnalysis ? 'Start' : 'Confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

