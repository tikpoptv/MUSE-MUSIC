'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import TermsModal from '@/components/TermsModal';
import Image from 'next/image';

export default function SetupStep1() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!password || !confirmPassword) {
      setPasswordError('');
      setIsValid(false);
      return;
    }
    
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      setIsValid(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      setIsValid(false);
      return;
    }
    
    setPasswordError('');
    setIsValid(true);
  }, [password, confirmPassword]);

  const validatePassword = () => {
    if (!password || !confirmPassword) {
      setPasswordError('Please fill in both password fields');
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleNext = () => {
    if (validatePassword()) {
      router.push('/setup/step2');
    }
  };

  const handleSkip = () => {
    if (!acceptTerms) {
      setShowTermsModal(true);
      toast.error('Please accept terms and conditions before skipping setup');
      return;
    }
    router.push('/');
  };

  const handleAcceptTerms = () => {
    setAcceptTerms(true);
  };


  const handleBack = () => {
    router.push('/');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden" 
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
        width: '480px',
        height: '700px'
      }}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Set up your profile
          </h1>
          <p className="text-sm text-gray-600">
            Create a password for your account to keep it secure.
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              className="w-full px-4 py-3 pr-12 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-600"
              style={{ borderRadius: '8px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <Image 
                src={showPassword ? "/icons/eye-off-icon.svg" : "/icons/eye-icon.svg"}
                alt={showPassword ? "Hide password" : "Show password"}
                width={20} 
                height={20}
                className="h-5 w-5 text-gray-400"
              />
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
              }}
              className="w-full px-4 py-3 pr-12 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-600"
              style={{ borderRadius: '8px' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <Image 
                src={showConfirmPassword ? "/icons/eye-off-icon.svg" : "/icons/eye-icon.svg"}
                alt={showConfirmPassword ? "Hide password" : "Show password"}
                width={20} 
                height={20}
                className="h-5 w-5 text-gray-400"
              />
            </button>
          </div>
          
          {passwordError && (
            <div className="text-red-500 text-sm mt-2">
              {passwordError}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={handleNext}
            disabled={!isValid}
            className={`w-full px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 ${
              isValid 
                ? 'bg-[#7B61FF] hover:bg-[#6B51EF] text-white cursor-pointer' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>Next</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Skip Set up
            </button>
            
            <button
              onClick={handleBack}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleAcceptTerms}
      />
    </div>
  );
}
