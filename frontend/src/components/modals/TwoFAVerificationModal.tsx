'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { twoFactorService } from '@/services/twoFactorService';

interface TwoFAVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  description: string;
}

export default function TwoFAVerificationModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  title, 
  description 
}: TwoFAVerificationModalProps) {
  const [twoFACode, setTwoFACode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleVerification = async () => {
    if (!twoFACode.trim()) {
      toast.error('Please enter a code');
      return;
    }

    if (!useBackupCode && twoFACode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await twoFactorService.verifyToken(twoFACode);
      
      if (response.success) {
        onSuccess();
        setTwoFACode('');
        toast.success('Verification successful');
      } else {
        toast.error('Invalid code');
      }
    } catch {
      toast.error('Invalid code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setTwoFACode('');
    setUseBackupCode(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/20">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mt-1">
            {title}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-bold -mt-1"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {description}
          </p>
          
          {/* Toggle between 2FA and Backup Code */}
          <div className="flex space-x-2">
            <button
              onClick={() => setUseBackupCode(false)}
              className={`flex-1 py-2 px-3 text-sm rounded-lg transition-colors ${
                !useBackupCode 
                  ? 'bg-[#7B61FF] text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              2FA Code
            </button>
            <button
              onClick={() => setUseBackupCode(true)}
              className={`flex-1 py-2 px-3 text-sm rounded-lg transition-colors ${
                useBackupCode 
                  ? 'bg-[#7B61FF] text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Backup Code
            </button>
          </div>
          
          <input
            type="text"
            value={twoFACode}
            onChange={(e) => {
              if (useBackupCode) {
                setTwoFACode(e.target.value.toUpperCase().slice(0, 8));
              } else {
                setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6));
              }
            }}
            placeholder={useBackupCode ? "A1B2C3D4" : "123456"}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg font-mono tracking-widest text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:border-transparent"
            maxLength={useBackupCode ? 8 : 6}
            onKeyPress={(e) => e.key === 'Enter' && handleVerification()}
          />
          
          <div className="flex space-x-3">
            <button
              onClick={handleVerification}
              disabled={isVerifying || (!useBackupCode && twoFACode.length !== 6) || (useBackupCode && twoFACode.length !== 8)}
              className="flex-1 bg-[#7B61FF] text-white py-3 rounded-lg hover:bg-[#6B51EF] transition-colors disabled:bg-gray-400"
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </button>
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
