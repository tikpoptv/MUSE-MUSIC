'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { twoFactorService } from '@/services/twoFactorService';

interface Disable2FAProps {
  onComplete: () => void;
  onClose: () => void;
}

export default function Disable2FA({ onComplete, onClose }: Disable2FAProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDisable2FA = async () => {
    try {
      setIsLoading(true);
      await twoFactorService.disable2FA();
      toast.success('2FA has been disabled successfully');
      onComplete();
    } catch (error) {
      console.error('Disable 2FA error:', error);
      toast.error('Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Disable 2FA</h3>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to disable two-factor authentication? This will make your account less secure.
        </p>
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={onClose}
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleDisable2FA}
          disabled={isLoading}
          className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Disabling...' : 'Disable 2FA'}
        </button>
      </div>
    </div>
  );
}
