'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { setupService } from '@/services/setupService';
import TermsModal from '@/components/TermsModal';
import { LocalStorageManager } from '../../utils/localStorageManager';
import { localStorageKeys } from '../../utils/localStorageKeys';

interface SkipSetupButtonProps {
  className?: string;
}

interface MinimalUser { setupSkipped?: boolean }

export default function SkipSetupButton({ className = "text-gray-500 hover:text-gray-700 text-sm transition-colors" }: SkipSetupButtonProps) {
  const router = useRouter();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSkip = () => {
    if (!acceptTerms) {
      setShowTermsModal(true);
      toast.error('Please accept terms and conditions before skipping setup');
      return;
    }
    
    handleAcceptTerms();
  };

  const handleAcceptTerms = async () => {
    setAcceptTerms(true);
    setShowTermsModal(false);
    toast.success('Terms and conditions accepted');
    
    try {
      await setupService.skipSetup(true);
      
      const user = LocalStorageManager.get<MinimalUser>(localStorageKeys.USER_DATA);
      if (user) {
        user.setupSkipped = true;
        LocalStorageManager.set(localStorageKeys.USER_DATA, user);
      }
      
      toast.success('Setup skipped successfully!');
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch {
      toast.error('Failed to skip setup. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setShowTermsModal(false);
  };

  return (
    <>
      <button
        onClick={handleSkip}
        className={className}
      >
        Skip Set up
      </button>
      
      <TermsModal
        isOpen={showTermsModal}
        onClose={handleCloseModal}
        onAccept={handleAcceptTerms}
      />
    </>
  );
}
