'use client';

import Image from 'next/image';

interface ShareModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ShareModal({ isOpen, onConfirm, onCancel }: ShareModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.2)'
      }}
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' }}>
        <div className="flex flex-col items-center mb-4">
          <Image
            src="/gif/Cat-begging.gif"
            alt="Cat begging"
            width={150}
            height={150}
            className="mb-4"
            unoptimized
          />
          <h2 className="text-xl font-semibold text-gray-900 text-center">
            Pretty please? Would you like to share this with our community? 🥺
          </h2>
        </div>
        
        <div className="flex gap-4 justify-end mt-6">
          <button
            onClick={onCancel}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-[#7B61FF] text-white rounded-lg hover:bg-[#6B51EF] transition-colors"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

