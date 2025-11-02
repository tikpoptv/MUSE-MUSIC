'use client';

import { useState, useEffect } from 'react';

interface TranslationLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (originalLanguage: string, targetLanguage: string, shareRequest: boolean) => void;
  defaultOriginalLanguage?: string;
  defaultTargetLanguage?: string;
}

const languages = [
  { code: 'auto', name: 'Auto Detect' },
  { code: 'en', name: 'English' },
  { code: 'th', name: 'Thai' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'vi', name: 'Vietnamese' }
];

const targetLanguages = languages.filter(lang => lang.code !== 'auto');

export default function TranslationLanguageModal({
  isOpen,
  onClose,
  onConfirm,
  defaultOriginalLanguage = 'Auto Detect',
  defaultTargetLanguage = 'Thai'
}: TranslationLanguageModalProps) {
  const [originalLanguage, setOriginalLanguage] = useState<string>(defaultOriginalLanguage);
  const [targetLanguage, setTargetLanguage] = useState<string>(defaultTargetLanguage);
  const [shareRequest, setShareRequest] = useState<boolean>(true);

  // Reset shareRequest when modal opens
  useEffect(() => {
    if (isOpen) {
      setShareRequest(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(originalLanguage, targetLanguage, shareRequest);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 w-full max-w-md border border-white/20">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mt-1">
            Select Languages
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-bold -mt-1"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source Language
            </label>
            <select
              value={originalLanguage}
              onChange={(e) => setOriginalLanguage(e.target.value)}
              className="w-full py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:border-transparent text-gray-900 bg-white"
              style={{
                paddingLeft: '16px',
                paddingRight: '40px',
                appearance: 'none',
                backgroundImage: 'url("/icons/dropdown-arrow.svg")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
                backgroundSize: '16px'
              }}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.name}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Language
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:border-transparent text-gray-900 bg-white"
              style={{
                paddingLeft: '16px',
                paddingRight: '40px',
                appearance: 'none',
                backgroundImage: 'url("/icons/dropdown-arrow.svg")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
                backgroundSize: '16px'
              }}
            >
              {targetLanguages.map((lang) => (
                <option key={lang.code} value={lang.name}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={shareRequest}
                onChange={(e) => setShareRequest(e.target.checked)}
                className="w-5 h-5 text-[#7B61FF] border-gray-300 rounded focus:ring-[#7B61FF] focus:ring-2 cursor-pointer"
              />
              <span className="text-sm text-gray-700">
                Share this result with the community?
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-2 ml-8">
              If unchecked, this will be kept private and won&apos;t require approval.
            </p>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleConfirm}
            className="flex-1 bg-[#7B61FF] text-white py-3 rounded-lg hover:bg-[#6B51EF] transition-colors font-medium"
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

