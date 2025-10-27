'use client';

import Setup2FA from './Setup2FA';
import Manage2FA from './Manage2FA';
import Disable2FA from './Disable2FA';

interface TwoFAStatus {
  twoFactorEnabled: boolean;
  twoFactorSetupCompleted: boolean;
  setupStep: string;
  failedAttempts: number;
  isLocked: boolean;
  lockedUntil: string | null;
  backupCodesCount: number;
}

interface TwoFactorModalProps {
  type: 'setup' | 'manage' | 'disable';
  isOpen: boolean;
  onClose: () => void;
  twoFAStatus: TwoFAStatus;
}

export default function TwoFactorModal({ type, isOpen, onClose, twoFAStatus }: TwoFactorModalProps) {
  const handleComplete = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/20">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mt-1">
            {type === 'setup' && 'Setup Two-Factor Authentication'}
            {type === 'manage' && 'Manage Two-Factor Authentication'}
            {type === 'disable' && 'Disable Two-Factor Authentication'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-bold -mt-1"
          >
            ×
          </button>
        </div>

        {/* Content */}
        {type === 'setup' && (
          <Setup2FA onComplete={handleComplete} onClose={onClose} />
        )}

        {type === 'manage' && (
          <Manage2FA twoFAStatus={twoFAStatus} onClose={onClose} />
        )}

        {type === 'disable' && (
          <Disable2FA onComplete={handleComplete} onClose={onClose} />
        )}
      </div>
    </div>
  );
}
