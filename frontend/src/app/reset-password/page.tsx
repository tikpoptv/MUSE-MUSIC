'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ email: string; username: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const validateToken = useCallback(async (tokenToValidate: string) => {
    try {
      // Add 2 second delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await authService.validateResetToken(tokenToValidate);

      if (result.success && result.data) {
        setUserInfo(result.data);
        setIsValidatingToken(false);
      } else {
        toast.error(result.message || 'Invalid or expired reset token');
        router.push('/forgot-password');
      }
    } catch (error) {
      console.error('Token validation error:', error);
      toast.error('An error occurred while validating reset token');
      router.push('/forgot-password');
    }
  }, [router]);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      toast.error('Invalid or missing reset token');
      router.push('/forgot-password');
      return;
    }
    setToken(tokenFromUrl);
    validateToken(tokenFromUrl);
  }, [searchParams, router, validateToken]);

  useEffect(() => {
    const isAuth = authService.isAuthenticated();
    
    if (isAuth) {
      toast.success('You are already signed in');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'password') {
      setPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7662'}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        toast.success('Password reset successfully!');
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('An error occurred while resetting password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div 
        className="min-h-screen flex items-start justify-center relative overflow-hidden" 
        style={{ 
          paddingTop: '80px', 
          paddingBottom: '0px',
          marginTop: '0px',
          backgroundImage: 'url(/login-background.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#ffffff'
        }}
      >
        <div className="bg-white rounded-2xl p-8 mx-4 shadow-2xl relative z-10 flex flex-col justify-center" style={{
          boxShadow: '0 0 50px rgba(94, 7, 202, 0.1), 0 0 100px rgba(94, 7, 202, 0.05), 0 0 150px rgba(94, 7, 202, 0.03), 0 0 200px rgba(94, 7, 202, 0.02), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          height: '650px',
          width: '480px'
        }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-4xl font-bold text-black mb-6">Password Reset Successfully</h1>
            <p className="text-gray-500 text-sm mb-6">
              Your password has been reset successfully.<br />
              You can now sign in with your new password.
            </p>
          </div>

          <div className="space-y-4">
            <Link 
              href="/login" 
              className="w-full py-3 bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors duration-200 block text-center"
              style={{ borderRadius: '14px' }}
            >
              Sign In Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isValidatingToken) {
    return (
      <div 
        className="min-h-screen flex items-start justify-center relative overflow-hidden" 
        style={{ 
          paddingTop: '80px', 
          paddingBottom: '0px',
          marginTop: '0px',
          backgroundImage: 'url(/login-background.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#ffffff'
        }}
      >
        <div className="bg-white rounded-2xl p-8 mx-4 shadow-2xl relative z-10 flex flex-col justify-center" style={{
          boxShadow: '0 0 50px rgba(94, 7, 202, 0.1), 0 0 100px rgba(94, 7, 202, 0.05), 0 0 150px rgba(94, 7, 202, 0.03), 0 0 200px rgba(94, 7, 202, 0.02), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          height: '650px',
          width: '480px'
        }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-4xl font-bold text-black mb-6">Validating Reset Link</h1>
            <p className="text-gray-500 text-sm mb-6">
              Please wait while we verify your reset link...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div 
        className="min-h-screen flex items-start justify-center relative overflow-hidden" 
        style={{ 
          paddingTop: '80px', 
          paddingBottom: '0px',
          marginTop: '0px',
          backgroundImage: 'url(/login-background.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#ffffff'
        }}
      >
        <div className="bg-white rounded-2xl p-8 mx-4 shadow-2xl relative z-10 flex flex-col justify-center" style={{
          boxShadow: '0 0 50px rgba(94, 7, 202, 0.1), 0 0 100px rgba(94, 7, 202, 0.05), 0 0 150px rgba(94, 7, 202, 0.03), 0 0 200px rgba(94, 7, 202, 0.02), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          height: '650px',
          width: '480px'
        }}>
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-4xl font-bold text-black mb-6">Invalid Reset Link</h1>
            <p className="text-gray-500 text-sm mb-6">
              This password reset link is invalid or has expired.<br />
              Please request a new password reset link.
            </p>
          </div>

          <div className="space-y-4">
            <Link 
              href="/forgot-password" 
              className="w-full py-3 bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors duration-200 block text-center"
              style={{ borderRadius: '14px' }}
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-start justify-center relative overflow-hidden" 
      style={{ 
        paddingTop: '80px', 
        paddingBottom: '0px',
        marginTop: '0px',
        backgroundImage: 'url(/login-background.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#ffffff'
      }}
    >
      <div className="bg-white rounded-2xl p-8 mx-4 shadow-2xl relative z-10 flex flex-col justify-center" style={{
        boxShadow: '0 0 50px rgba(94, 7, 202, 0.1), 0 0 100px rgba(94, 7, 202, 0.05), 0 0 150px rgba(94, 7, 202, 0.03), 0 0 200px rgba(94, 7, 202, 0.02), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        height: '650px',
        width: '480px'
      }}>
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-4xl font-bold text-black mb-6">Reset Password</h1>
          <p className="text-gray-500 text-sm mb-2">
            Enter your new password for:
          </p>
          {userInfo && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-gray-700">
                <span className="font-semibold">Username:</span> {userInfo.username}
              </p>
              <p className="text-sm font-medium text-gray-700">
                <span className="font-semibold">Email:</span> {userInfo.email}
              </p>
            </div>
          )}
          <p className="text-gray-500 text-sm">
            Make sure it&apos;s at least 6 characters long
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="New Password"
              value={password}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderRadius: '8px' }}
            />
          </div>

          <div className="relative">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderRadius: '8px' }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gray-200 text-purple-600 font-medium hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderRadius: '14px' }}
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="flex justify-center items-center mt-6">
          <Link href="/login" className="text-gray-500 text-sm hover:text-gray-700 transition-colors duration-200">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
