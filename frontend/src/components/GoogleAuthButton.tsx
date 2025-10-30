'use client';

import { useState } from 'react';
import { localStorageKeys } from '../utils/localStorageKeys';
import { LocalStorageManager } from '../utils/localStorageManager';

interface GoogleAuthButtonProps {
  onAuthStart?: () => void;
  onAuthError?: (message: string) => void;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export default function GoogleAuthButton({ 
  onAuthStart, 
  onAuthError, 
  className = "",
  disabled = false,
  children 
}: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = async () => {
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

  return (
    <button onClick={handleGoogleAuth} className={className} disabled={disabled || isLoading}>
      {children ?? 'Continue with Google'}
    </button>
  );
}
