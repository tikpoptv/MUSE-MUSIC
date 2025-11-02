'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '../../../../services/authService';
import toast from 'react-hot-toast';
import { LocalStorageManager } from '../../../../utils/localStorageManager';
import { localStorageKeys } from '../../../../utils/localStorageKeys';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const authType = LocalStorageManager.get<string>(localStorageKeys.GOOGLE_AUTH_TYPE);
      const backendType = LocalStorageManager.get<string>(localStorageKeys.GOOGLE_BACKEND_TYPE);
      const linkUserId = LocalStorageManager.get<string>(localStorageKeys.GOOGLE_LINK_USERID);
      const type = authType || 'login';
      try {
        const code = searchParams?.get('code');
        const error = searchParams?.get('error');
        if (error) {
          toast.error('Google authentication failed: ' + error);
          if (type === 'link') {
            LocalStorageManager.remove(localStorageKeys.GOOGLE_LINK_USERID);
            LocalStorageManager.remove(localStorageKeys.GOOGLE_AUTH_TYPE);
            LocalStorageManager.remove(localStorageKeys.GOOGLE_BACKEND_TYPE);
            router.push('/account/settings');
          } else {
            LocalStorageManager.remove(localStorageKeys.GOOGLE_AUTH_TYPE);
            LocalStorageManager.remove(localStorageKeys.GOOGLE_BACKEND_TYPE);
            router.push(type === 'login' ? '/login' : '/register');
          }
          return;
        }
        if (!code) {
          toast.error('No authorization code received from Google');
          if (type === 'link') {
            LocalStorageManager.remove(localStorageKeys.GOOGLE_LINK_USERID);
            LocalStorageManager.remove(localStorageKeys.GOOGLE_AUTH_TYPE);
            LocalStorageManager.remove(localStorageKeys.GOOGLE_BACKEND_TYPE);
            router.push('/account/settings');
          } else {
            LocalStorageManager.remove(localStorageKeys.GOOGLE_AUTH_TYPE);
            LocalStorageManager.remove(localStorageKeys.GOOGLE_BACKEND_TYPE);
            router.push(type === 'login' ? '/login' : '/register');
          }
          return;
        }
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7662';
        const response = await fetch(`${apiUrl}/api/auth/google/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            code, 
            type: backendType || 'login',
            userId: linkUserId || null
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 409 && errorData.message.includes('already linked to another user')) {
            toast.error('This Google account is already linked to another user');
            if (type === 'link') {
              LocalStorageManager.remove(localStorageKeys.GOOGLE_LINK_USERID);
              LocalStorageManager.remove(localStorageKeys.GOOGLE_AUTH_TYPE);
              LocalStorageManager.remove(localStorageKeys.GOOGLE_BACKEND_TYPE);
              router.push('/account/settings');
            } else {
              LocalStorageManager.remove(localStorageKeys.GOOGLE_AUTH_TYPE);
              LocalStorageManager.remove(localStorageKeys.GOOGLE_BACKEND_TYPE);
              router.push(type === 'login' ? '/login' : '/register');
            }
            return;
          }
          throw new Error(`Failed to exchange code for token: ${errorData.message || 'Unknown error'}`);
        }
        const data = await response.json();
        if (data.success && data.data) {
          authService.setAuthData(data.data);
          if (type === 'link') {
            LocalStorageManager.remove(localStorageKeys.GOOGLE_LINK_USERID);
            LocalStorageManager.remove(localStorageKeys.GOOGLE_AUTH_TYPE);
            LocalStorageManager.remove(localStorageKeys.GOOGLE_BACKEND_TYPE);
            toast.success('Google account linked successfully!');
            setTimeout(() => {
              window.location.href = '/account/settings';
            }, 1500);
          } else {
            LocalStorageManager.remove(localStorageKeys.GOOGLE_AUTH_TYPE);
            LocalStorageManager.remove(localStorageKeys.GOOGLE_BACKEND_TYPE);
            toast.success('Successfully signed in with Google!');
            setTimeout(() => {
              window.location.href = '/';
            }, 1500);
          }
        } else {
          throw new Error('Authentication failed');
        }
      } catch {
        toast.error('Error occurred during Google authentication');
        if (type === 'link') {
          LocalStorageManager.remove(localStorageKeys.GOOGLE_LINK_USERID);
          LocalStorageManager.remove(localStorageKeys.GOOGLE_AUTH_TYPE);
          LocalStorageManager.remove(localStorageKeys.GOOGLE_BACKEND_TYPE);
          router.push('/account/settings');
        } else {
          LocalStorageManager.remove(localStorageKeys.GOOGLE_AUTH_TYPE);
          LocalStorageManager.remove(localStorageKeys.GOOGLE_BACKEND_TYPE);
          router.push(type === 'login' ? '/login' : '/register');
        }
      }
    };

    handleGoogleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
        <p>Processing Google authentication...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense>
      <GoogleCallbackContent />
    </Suspense>
  );
}