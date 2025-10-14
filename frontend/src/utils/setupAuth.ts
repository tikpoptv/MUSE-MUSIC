import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { setupService } from '@/services/setupService';

export interface SetupStatusData {
  stepStatus: {
    step1: boolean;
    step2: boolean;
    step3: boolean;
    step4: boolean;
  };
  stepData: {
    step1: { hasPassword: boolean } | null;
    step2: { birthday: string } | null;
    step3: { country: string; timezone: string; language: string } | null;
    step4: { genres: string[] } | null;
  };
}

export const useSetupAuth = () => {
  const router = useRouter();

  const checkAuthAndFetchStatus = useCallback(async (): Promise<SetupStatusData | null> => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Please login first');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
        return null;
      }

      return await setupService.getSetupStatus();
    } catch (error) {
      console.error('Error fetching setup status:', error);
      toast.error('Authentication failed. Please login again.');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      return null;
    }
  }, [router]);

  return {
    checkAuthAndFetchStatus
  };
};
