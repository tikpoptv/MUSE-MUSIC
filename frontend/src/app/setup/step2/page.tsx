'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { twoFactorService } from '@/services/twoFactorService';
import { TwoFactorModal } from '@/components/modals';
import toast from 'react-hot-toast';

export default function Step2Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [twoFAStatus, setTwoFAStatus] = useState<{
    twofactorenabled: boolean;
    twoFactorSetupCompleted: boolean;
    setupStep: string;
    failedAttempts: number;
    isLocked: boolean;
    lockedUntil: string | null;
    backupCodesCount: number;
  } | null>(null);
  const [showTwoFAModal, setShowTwoFAModal] = useState(false);
  const [twoFAModalType, setTwoFAModalType] = useState<'setup' | 'manage' | 'disable'>('setup');

  useEffect(() => {
    fetchTwoFAStatus();
  }, []);

  const fetchTwoFAStatus = async () => {
    try {
      const status = await twoFactorService.get2FAStatus();
      setTwoFAStatus(status);
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
      setTwoFAStatus({
        twofactorenabled: false,
        twoFactorSetupCompleted: false,
        setupStep: 'not_started',
        failedAttempts: 0,
        isLocked: false,
        lockedUntil: null,
        backupCodesCount: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFAAction = (action: 'setup' | 'manage' | 'disable') => {
    setTwoFAModalType(action);
    setShowTwoFAModal(true);
  };

  const handleTwoFAModalClose = () => {
    setShowTwoFAModal(false);
    fetchTwoFAStatus(); // Refresh status after modal closes
  };

  const handleSkip = () => {
    router.push('/setup/step3');
  };

  const handleNext = () => {
    if (twoFAStatus?.twofactorenabled) {
      router.push('/setup/step3');
    } else {
      toast.error('Please enable Two-Factor Authentication to continue');
    }
  };

  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center relative overflow-hidden" 
        style={{ 
          backgroundImage: 'url(/login-background.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#ffffff'
        }}
      >
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden" 
      style={{ 
        backgroundImage: 'url(/login-background.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#ffffff'
      }}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-2xl mx-4 border-2 border-[#7B61FF]/30 shadow-lg">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Two-Factor Authentication
          </h1>
          <p className="text-gray-600 text-base sm:text-lg px-2">
            Secure your account with an additional layer of protection
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* 2FA Status */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Security Status
            </h3>
            
            {twoFAStatus?.twofactorenabled ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">
                    Two-Factor Authentication Enabled
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>• Setup completed: {twoFAStatus.twoFactorSetupCompleted ? 'Yes' : 'No'}</p>
                  <p>• Backup codes: {twoFAStatus.backupCodesCount} available</p>
                  <p>• Failed attempts: {twoFAStatus.failedAttempts}</p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => handleTwoFAAction('manage')}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm sm:text-base"
                  >
                    Manage 2FA
                  </button>
                  <button
                    onClick={() => handleTwoFAAction('disable')}
                    className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm sm:text-base"
                  >
                    Disable 2FA
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 font-medium">
                    Two-Factor Authentication Disabled
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Your account is not protected with two-factor authentication. 
                  We strongly recommend enabling it for better security.
                </p>
              <button
                onClick={() => handleTwoFAAction('setup')}
                className="bg-[#7B61FF] text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-[#6B51EF] transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
              >
                Enable Two-Factor Authentication
              </button>
              </div>
            )}
          </div>

          {/* Security Benefits */}
          <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3 sm:mb-4">
              Why Enable Two-Factor Authentication?
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-blue-800">
              <li>• <strong>Extra Security:</strong> Even if someone gets your password, they can&apos;t access your account</li>
              <li>• <strong>Protect Your Data:</strong> Keep your music preferences and personal information safe</li>
              <li>• <strong>Industry Standard:</strong> Used by banks, social media, and other secure services</li>
              <li>• <strong>Easy to Use:</strong> Works with popular authenticator apps like Google Authenticator</li>
            </ul>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between pt-4 sm:pt-6 space-y-3 sm:space-y-0">
            <button
              onClick={() => router.push('/setup/step1')}
              className="bg-gray-300 text-gray-700 px-4 sm:px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base order-2 sm:order-1"
            >
              Previous
            </button>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 order-1 sm:order-2">
              <button
                onClick={handleSkip}
                className="bg-gray-200 text-gray-600 px-4 sm:px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
              >
                Skip for Now
              </button>
              <button
                onClick={handleNext}
                disabled={!twoFAStatus?.twofactorenabled}
                className="bg-[#7B61FF] text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-[#6B51EF] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Modal */}
      {showTwoFAModal && (
        <TwoFactorModal
          isOpen={showTwoFAModal}
          onClose={handleTwoFAModalClose}
          type={twoFAModalType}
          twoFAStatus={{
            twoFactorEnabled: twoFAStatus?.twofactorenabled || false,
            twoFactorSetupCompleted: twoFAStatus?.twoFactorSetupCompleted || false,
            setupStep: twoFAStatus?.setupStep || 'not_started',
            failedAttempts: twoFAStatus?.failedAttempts || 0,
            isLocked: twoFAStatus?.isLocked || false,
            lockedUntil: twoFAStatus?.lockedUntil || null,
            backupCodesCount: twoFAStatus?.backupCodesCount || 0
          }}
        />
      )}
    </div>
  );
}