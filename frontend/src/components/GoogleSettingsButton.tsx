'use client';

import { useState } from 'react';
import Image from 'next/image';

interface GoogleSettingsButtonProps {
  onAuthStart?: () => void;
  onAuthError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

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
        console.error(error);
        onAuthError?.(error);
        setIsLoading(false);
        return;
      }

      // ดึง user UUID จาก localStorage และเก็บไว้
      const userData = localStorage.getItem('user_data');
      if (!userData) {
        const error = 'User not authenticated';
        onAuthError?.(error);
        setIsLoading(false);
        return;
      }
      
      const user = JSON.parse(userData);
      const userId = user.userID;
      
      // เก็บ userId และ type ไว้ใน localStorage เพื่อใช้ใน callback
      localStorage.setItem('google_link_userId', userId);
      localStorage.setItem('google_auth_type', 'link');
      // ส่ง type เป็น 'link' สำหรับ backend
      localStorage.setItem('google_backend_type', 'link');
      
      const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
      const redirectUri = encodeURIComponent(`${frontendUrl}/auth/google/callback`);
      const scope = encodeURIComponent('openid email profile');
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
      
      window.location.href = authUrl;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Google Settings Auth Error:', error);
      onAuthError?.(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleGoogleAuth}
      disabled={disabled || isLoading}
      className={`py-2 px-4 border border-gray-300 flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ borderRadius: '8px' }}
    >
      <Image src="/icons/Google.svg" alt="Google" width={20} height={20} className="w-5 h-5" />
      <span className="text-black font-medium text-sm">
        {isLoading ? 'Loading...' : (children || 'Connect Google')}
      </span>
    </button>
  );
}
