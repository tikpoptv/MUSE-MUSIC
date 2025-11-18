'use client';

import { useState } from 'react';
import Image from 'next/image';
import { localStorageKeys } from '../utils/localStorageKeys';
import { LocalStorageManager } from '../utils/localStorageManager';

interface GoogleAuthButtonProps {
  onAuthStart?: () => void;
  onAuthError?: (message: string) => void;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  requireTermsAcceptance?: boolean;
  onTermsRequired?: () => void;
}

export default function GoogleAuthButton({ 
  onAuthStart, 
  onAuthError, 
  className = "",
  disabled = false,
  children,
  requireTermsAcceptance = false,
  onTermsRequired
}: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = async () => {
    if (requireTermsAcceptance && onTermsRequired) {
      onTermsRequired();
      return;
    }

    try {
      setIsLoading(true);
      onAuthStart?.();
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        const error = 'Google Client ID not configured';
        onAuthError?.(error);
        setIsLoading(false);
        return;
      }
      const currentPath = window.location.pathname;
      const authType = currentPath.includes('/login') ? 'login' : 'register';
      LocalStorageManager.set(localStorageKeys.GOOGLE_AUTH_TYPE, authType);
      LocalStorageManager.set(localStorageKeys.GOOGLE_BACKEND_TYPE, 'login');
      const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
      const redirectUri = encodeURIComponent(`${frontendUrl}/auth/google/callback`);
      const scope = encodeURIComponent('openid email profile');
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=select_account`;
      window.location.href = authUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onAuthError?.(errorMessage);
      setIsLoading(false);
    }
  };

  const baseClasses = "py-3 border border-gray-300 flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors duration-200 mx-auto disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <button 
      onClick={handleGoogleAuth}
      className={`${baseClasses} ${className}`}
      disabled={disabled || isLoading}
      style={{ width: '158px', borderRadius: '14px' }}
    >
      {children ? (
        children
      ) : (
        <>
          <Image alt="Google" src="/icons/Google.svg" width={24} height={24} className="w-6 h-6" />
          <span className="text-black font-medium">Google</span>
        </>
      )}
    </button>
  );
}
