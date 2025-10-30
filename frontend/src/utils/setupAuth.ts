import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { setupService } from '@/services/setupService';
import { SetupStatusData } from '@/types/setup';

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
