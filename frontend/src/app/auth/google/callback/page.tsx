'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '../../../../services/authService';
import toast from 'react-hot-toast';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const code = searchParams?.get('code');
        const error = searchParams?.get('error');

            if (error) {
              toast.error('Google authentication failed: ' + error);
              router.push('/register');
              return;
            }

            if (!code) {
              toast.error('No authorization code received from Google');
              router.push('/register');
              return;
            }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7662';
        const response = await fetch(`${apiUrl}/api/auth/google/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

            if (!response.ok) {
              const errorData = await response.json();
              
              if (response.status === 409 && errorData.message.includes('Account exists but not linked to Google')) {
                toast.error('Account exists but not linked to Google. Please link your Google account first or register with Google.');
                router.push('/register');
                return;
              }
              
              throw new Error(`Failed to exchange code for token: ${errorData.message || 'Unknown error'}`);
            }

            const data = await response.json();
            
            if (data.success && data.data) {
              authService.setAuthData(data.data);
              toast.success('Successfully signed in with Google!');
              router.push('/');
            } else {
              throw new Error('Authentication failed');
            }
          } catch (error) {
            console.error('Google Callback Error:', error);
            toast.error('Error occurred during Google authentication');
            router.push('/register');
          }
    };

    handleGoogleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Signing in with Google...</p>
      </div>
    </div>
  );
}