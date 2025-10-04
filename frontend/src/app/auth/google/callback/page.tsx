'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '../../../../services/authService';
import toast from 'react-hot-toast';

function GoogleCallbackContent() {
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
              setTimeout(() => {
                window.location.href = '/';
              }, 1500);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="relative mb-8">
          <div className="w-24 h-24 border-4 border-purple-100 rounded-full animate-pulse mx-auto"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 border-4 border-transparent border-t-purple-600 border-r-purple-600 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-purple-600 rounded-full animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-800">Signing in with Google</h2>
          <p className="text-gray-600 text-lg">Please wait while we authenticate your account...</p>
          
          <div className="flex justify-center space-x-2 mt-8">
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-purple-100 rounded-full animate-pulse mx-auto"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 border-4 border-transparent border-t-purple-600 border-r-purple-600 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-purple-600 rounded-full animate-pulse"></div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-800">Loading...</h2>
            <p className="text-gray-600 text-lg">Please wait...</p>
            
            <div className="flex justify-center space-x-2 mt-8">
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}