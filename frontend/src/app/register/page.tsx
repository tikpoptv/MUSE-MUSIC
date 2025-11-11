'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import { authService } from '@/services/authService';
import { passwordRules, validatePassword, validateFormData } from '@/utils/passwordValidation';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [passwordValidation, setPasswordValidation] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isAuth = authService.isAuthenticated();
    
    if (isAuth) {
      toast.success('คุณเข้าสู่ระบบอยู่แล้ว');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    }
  }, [router]);

  useEffect(() => {
    // Always validate password rules when password changes
    if (formData.password) {
      const validation = validatePassword(formData.password);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation({});
    }

    // Check form validity using utility function
    const { isFormValid } = validateFormData(formData.password, formData.confirmPassword);
    setIsFormValid(isFormValid);
  }, [formData.password, formData.confirmPassword]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error('Username and password are required');
      return;
    }

    if (formData.username.length < 3 || formData.username.length > 20) {
      toast.error('Username must be 3-20 characters');
      return;
    }

    // Check password validation using utility function
    const { allRulesMet } = validateFormData(formData.password, formData.confirmPassword);
    if (!allRulesMet) {
      toast.error('Password does not meet requirements');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7662'}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Account created successfully! Please sign in.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        // Handle validation errors from backend
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((error: string) => {
            toast.error(error);
          });
        } else {
          toast.error(data.message || 'Registration failed');
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Registration error:', error);
      toast.error('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden pb-8" 
      style={{ 
        backgroundImage: 'url(/login-background.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#ffffff'
      }}
    >
      <div className="bg-white rounded-2xl p-8 mx-4 shadow-2xl relative z-10 flex flex-col justify-center" style={{
        boxShadow: '0 0 50px rgba(94, 7, 202, 0.1), 0 0 100px rgba(94, 7, 202, 0.05), 0 0 150px rgba(94, 7, 202, 0.03), 0 0 200px rgba(94, 7, 202, 0.02), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        minHeight: '650px',
        width: '480px'
      }}>
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-4xl font-bold text-black mb-6">Create your account</h1>
          <p className="text-gray-500 text-sm">Create your space to save favorite tracks and moods.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username || ''}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderRadius: '8px' }}
            />
          </div>


          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password || ''}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-4 py-3 pr-12 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderRadius: '8px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword || ''}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-4 py-3 pr-12 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderRadius: '8px' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Password Requirements and Match Check */}
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2 font-medium">Password Requirements:</p>
            <div className="space-y-1">
              {passwordRules.map((rule) => (
                <div key={rule.id} className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordValidation[rule.id] 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                  }`}>
                    {passwordValidation[rule.id] && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${
                    passwordValidation[rule.id] 
                      ? 'text-green-600' 
                      : 'text-gray-500'
                  }`}>
                    {rule.text}
                  </span>
                </div>
              ))}
              
              {/* Passwords Match Check */}
              <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  formData.password && formData.confirmPassword && formData.password === formData.confirmPassword
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
                }`}>
                  {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${
                  formData.password && formData.confirmPassword && formData.password === formData.confirmPassword
                    ? 'text-green-600' 
                    : 'text-gray-500'
                }`}>
                  Passwords match
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isFormValid || !formData.username}
            className={`w-full py-3 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isFormValid && formData.username && !isLoading
                ? 'bg-[#7B61FF] hover:bg-[#6B51EF] text-white'
                : 'bg-gray-200 text-purple-600'
            }`}
            style={{ borderRadius: '14px' }}
          >
            {isLoading ? 'Creating Account...' : 'Create!'}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">Or Sign in with</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>
        <GoogleAuthButton />

        <div className="flex justify-start items-center mt-6">
          <Link href="/login" className="text-gray-500 text-sm hover:text-gray-700 transition-colors duration-200">
            Back
          </Link>
        </div>
      </div>
    </div>
  );
}

