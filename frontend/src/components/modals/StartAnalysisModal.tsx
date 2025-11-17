'use client';

import { Search } from 'lucide-react';

interface StartAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  searchQuery: string;
}

export default function StartAnalysisModal({
  isOpen,
  onClose,
  onConfirm,
  searchQuery
}: StartAnalysisModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Search className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Song Not Found
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                We couldn&apos;t find &quot;<span className="font-semibold">{searchQuery}</span>&quot; in our system.
              </p>
              <p>
                Would you like to start a new analysis? We&apos;ll search for the song and help you analyze it.
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
            Start Analysis
          </button>
        </div>
      </div>
    </div>
  );
}

