'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { setupService } from '@/services/setupService';
import { LocalStorageManager } from '../../utils/localStorageManager';
import { localStorageKeys } from '../../utils/localStorageKeys';

interface SkipSetupButtonProps {
  className?: string;
}

interface MinimalUser { setupSkipped?: boolean }

export default function SkipSetupButton({ className = "text-gray-500 hover:text-gray-700 text-sm transition-colors" }: SkipSetupButtonProps) {
  const router = useRouter();

  const handleSkip = async () => {
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

  return (
    <button
      onClick={handleSkip}
      className={className}
    >
      Skip Set up
    </button>
  );
}
