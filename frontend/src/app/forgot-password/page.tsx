'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isAuth = authService.isAuthenticated();
    
    if (isAuth) {
      toast.success('You are already signed in');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    // ตรวจสอบรูปแบบอีเมล
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Invalid email format');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await authService.forgotPassword(email);

      if (result.success) {
        setIsEmailSent(true);
        toast.success(result.message || 'Password reset link sent to your email');
      } else {
        toast.error(result.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Failed to send email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
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
            <h1 className="text-4xl md:text-4xl font-bold text-black mb-6">Email Sent Successfully</h1>
            <p className="text-gray-500 text-sm mb-6">
              We&apos;ve sent a password reset link to <strong>{email}</strong><br />
              Please check your email and click the link to reset your password
            </p>
            <p className="text-gray-400 text-xs mb-8">
              If you don&apos;t see the email, please check your Spam or Junk folder
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => {
                setIsEmailSent(false);
                setEmail('');
              }}
              className="w-full py-3 bg-gray-200 text-purple-600 font-medium hover:bg-gray-300 transition-colors duration-200"
              style={{ borderRadius: '14px' }}
            >
              Send New Email
            </button>

            <Link 
              href="/login" 
              className="w-full py-3 bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors duration-200 block text-center"
              style={{ borderRadius: '14px' }}
            >
              Back to Sign In
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
          <h1 className="text-4xl md:text-4xl font-bold text-black mb-6">Forgot Password</h1>
          <p className="text-gray-500 text-sm">
            Please enter the email address you used to register<br />
            We&apos;ll send you a password reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
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
            {isLoading ? 'Sending email...' : 'Send Reset Link'}
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
