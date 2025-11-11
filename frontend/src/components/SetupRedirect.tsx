'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/authService';
import { setupService } from '@/services/setupService';
import toast from 'react-hot-toast';

export default function SetupRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkUserSetup = async () => {
      if (pathname.startsWith('/setup') || 
          pathname.startsWith('/login') || 
          pathname.startsWith('/register') ||
          pathname.startsWith('/auth')) {
        return;
      }

      if (!authService.isAuthenticated() || isChecking) {
        return;
      }

      setIsChecking(true);

      try {
        const setupStatus = await setupService.getSetupStatus();

        if (setupStatus) {
          // Update user data in localStorage with latest setup status
          const user = authService.getUserData();
          if (user) {
            const updatedUser = {
              ...user,
              setupCompleted: setupStatus.setupCompleted,
              setupSkipped: setupStatus.setupSkipped
            };
            authService.setUserData(updatedUser);
          }

          if (setupStatus.setupCompleted || setupStatus.setupSkipped) {
            return;
          }

          if (!setupStatus.setupCompleted && !setupStatus.setupSkipped) {
            toast.success('Welcome! Let\'s set up your profile to get started.');
            if (user?.provider === 'google') {
              router.push('/setup/step1');
            } else {
              router.push('/setup/step2');
            }
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching user data:', error);
        toast.error('Failed to fetch user data. Please try again.');
      } finally {
        setIsChecking(false);
      }
    };

    checkUserSetup();
  }, [router, pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
