'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

export default function SetupRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUserSetup = () => {
      // Skip setup redirect for setup pages and auth pages
      if (pathname.startsWith('/setup') || 
          pathname.startsWith('/login') || 
          pathname.startsWith('/register') ||
          pathname.startsWith('/auth')) {
        return;
      }

      if (authService.isAuthenticated()) {
        const user = authService.getUserData();
        
        if (user) {
          if (!user.setupCompleted && !user.setupSkipped) {
            toast.success('Welcome! Let\'s set up your profile to get started.');
            if (user.provider === 'google') {
              router.push('/setup/step1');
            } else {
              router.push('/setup/step2');
            }
          } else if (user.setupSkipped && !user.setupCompleted) {
            toast.error('Setup not completed yet. Click here to continue setup.', {
              duration: 6000,
              style: {
                cursor: 'pointer'
              }
            });
            
            // Add click listener to the toast
            setTimeout(() => {
              const toastElement = document.querySelector('[data-testid="toast"]');
              if (toastElement) {
                toastElement.addEventListener('click', () => {
                  if (user.provider === 'google') {
                    router.push('/setup/step1');
                  } else {
                    router.push('/setup/step2');
                  }
                });
              }
            }, 100);
          }
        }
      }
    };

    checkUserSetup();
  }, [router, pathname]);

  return null;
}
