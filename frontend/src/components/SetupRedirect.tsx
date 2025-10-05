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
      const userData = localStorage.getItem('user_data');
      if (userData && userData !== 'undefined' && userData !== 'null') {
        try {
          const user = JSON.parse(userData);
          console.log('SetupRedirect - User data from localStorage:', {
            setupCompleted: user.setupCompleted,
            setupSkipped: user.setupSkipped,
            provider: user.provider
          });
        
          if (user) {
          if (!user.setupCompleted && !user.setupSkipped) {
            console.log('SetupRedirect - Redirecting to setup (not completed, not skipped)');
            toast.success('Welcome! Let\'s set up your profile to get started.');
            if (user.provider === 'google') {
              router.push('/setup/step1');
            } else {
              router.push('/setup/step2');
            }
          } else if (user.setupSkipped && !user.setupCompleted) {
            console.log('SetupRedirect - Showing skip toast (skipped but not completed)');
            const handleSetupClick = () => {
              if (user.provider === 'google') {
                router.push('/setup/step1');
              } else {
                router.push('/setup/step2');
              }
            };

            const toastId = toast.error('Setup not completed yet. Click here to continue setup.', {
              duration: 8000,
              position: 'bottom-right',
              style: {
                cursor: 'pointer',
                background: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500'
              }
            });
            
            setTimeout(() => {
              const toastElement = document.querySelector(`[data-toast-id="${toastId}"]`) || 
                                 document.querySelector('[data-testid="toast"]') ||
                                 document.querySelector('.go2072408551');
              if (toastElement) {
                toastElement.addEventListener('click', handleSetupClick);
              }
            }, 100);
          } else {
            console.log('SetupRedirect - Setup completed, no action needed');
          }
        }
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
          localStorage.removeItem('user_data');
        }
      } else {
        setIsChecking(true);
        
        try {
          const user = await setupService.getSetupStatus();
          localStorage.setItem('user_data', JSON.stringify(user));
          
          console.log('SetupRedirect - User data from API:', {
            setupCompleted: user.setupCompleted,
            setupSkipped: user.setupSkipped,
            provider: user.provider
          });
        
          if (user) {
            if (!user.setupCompleted && !user.setupSkipped) {
              console.log('SetupRedirect - Redirecting to setup (not completed, not skipped)');
              toast.success('Welcome! Let\'s set up your profile to get started.');
              if (user.provider === 'google') {
                router.push('/setup/step1');
              } else {
                router.push('/setup/step2');
              }
            } else if (user.setupSkipped && !user.setupCompleted) {
              console.log('SetupRedirect - Showing skip toast (skipped but not completed)');
              const handleSetupClick = () => {
                if (user.provider === 'google') {
                  router.push('/setup/step1');
                } else {
                  router.push('/setup/step2');
                }
              };

              const toastId = toast.error('Setup not completed yet. Click here to continue setup.', {
                duration: 8000,
                position: 'bottom-right',
                style: {
                  cursor: 'pointer',
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #fca5a5',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '500'
                }
              });
              
              setTimeout(() => {
                const toastElement = document.querySelector(`[data-toast-id="${toastId}"]`) || 
                                   document.querySelector('[data-testid="toast"]') ||
                                   document.querySelector('.go2072408551');
                if (toastElement) {
                  toastElement.addEventListener('click', handleSetupClick);
                }
              }, 100);
            } else {
              console.log('SetupRedirect - Setup completed, no action needed');
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast.error('Failed to fetch user data. Please try again.');
        } finally {
          setIsChecking(false);
        }
      }
    };

    checkUserSetup();
  }, [router, pathname]);

  return null;
}
