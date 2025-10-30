'use client';

import { useState } from 'react';
import { LocalStorageManager } from '../utils/localStorageManager';
import { localStorageKeys } from '../utils/localStorageKeys';

interface GoogleSettingsButtonProps {
  onAuthStart?: () => void;
  onAuthError?: (message: string) => void;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

interface MinimalUser { userID: string }

export default function GoogleSettingsButton({ 
  onAuthStart, 
  onAuthError, 
  className = "",
  disabled = false,
  children 
}: GoogleSettingsButtonProps) {
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
      const user = LocalStorageManager.get<MinimalUser>(localStorageKeys.USER_DATA);
      if (!user) {
        const error = 'User not authenticated';
        onAuthError?.(error);
        setIsLoading(false);
        return;
      }
      const userId = user.userID;
      LocalStorageManager.set(localStorageKeys.GOOGLE_LINK_USERID, userId);
      LocalStorageManager.set(localStorageKeys.GOOGLE_AUTH_TYPE, 'link');
      LocalStorageManager.set(localStorageKeys.GOOGLE_BACKEND_TYPE, 'link');
      const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
      const redirectUri = encodeURIComponent(`${frontendUrl}/auth/google/callback`);
      const scope = encodeURIComponent('openid email profile');
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
      window.location.href = authUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onAuthError?.(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleGoogleAuth} className={className} disabled={disabled || isLoading}>
      {children ?? 'Link Google Account'}
    </button>
  );
}
