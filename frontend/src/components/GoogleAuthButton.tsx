'use client';

import { useState } from 'react';
import Image from 'next/image';

interface GoogleAuthButtonProps {
  onAuthStart?: () => void;
  onAuthError?: (error: string) => void;
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
        console.error(error);
        onAuthError?.(error);
        setIsLoading(false);
        return;
      }

      // เก็บ flag ว่าเป็น login/register ปกติ ตาม path ปัจจุบัน
      const currentPath = window.location.pathname;
      const authType = currentPath.includes('/login') ? 'login' : 'register';
      localStorage.setItem('google_auth_type', authType);
      // ส่ง type เป็น 'login' สำหรับ backend (logic เดียวกัน)
      localStorage.setItem('google_backend_type', 'login');
      
      const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
      const redirectUri = encodeURIComponent(`${frontendUrl}/auth/google/callback`);
      const scope = encodeURIComponent('openid email profile');
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=select_account`;
      
      window.location.href = authUrl;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Google Auth Error:', error);
      onAuthError?.(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleGoogleAuth}
      disabled={disabled || isLoading}
      className={`py-3 border border-gray-300 flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors duration-200 mx-auto disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ width: '158px', borderRadius: '14px' }}
    >
      <Image src="/icons/Google.svg" alt="Google" width={24} height={24} className="w-6 h-6" />
      <span className="text-black font-medium">
        {isLoading ? 'Loading...' : (children || 'Google')}
      </span>
    </button>
  );
}
