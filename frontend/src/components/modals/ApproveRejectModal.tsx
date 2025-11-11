'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

interface ApproveRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'approve' | 'reject';
  songName: string;
  isProcessing?: boolean;
}

export default function ApproveRejectModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  songName,
  isProcessing = false
}: ApproveRejectModalProps) {
  if (!isOpen) return null;

  const isApprove = type === 'approve';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-start gap-4 mb-6">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
            isApprove ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isApprove ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {isApprove ? 'Approve Song' : 'Reject Song'}
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                {isApprove 
                  ? `Are you sure you want to approve "${songName}"? This will make the song publicly available.`
                  : `Are you sure you want to reject "${songName}"? This action cannot be undone.`
                }
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
            className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isApprove
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isProcessing ? 'Processing...' : (isApprove ? 'Approve' : 'Reject')}
          </button>
        </div>
      </div>
    </div>
  );
}

