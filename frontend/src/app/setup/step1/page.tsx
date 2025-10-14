'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { setupService } from '@/services/setupService';
import { SetupLayout, SetupHeader, SetupNavigation, SetupButton } from '@/components/setup';

// Import interface type
type SetupStatusData = Awaited<ReturnType<typeof setupService.getSetupStatus>>;

export default function SetupStep1() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSetupStatus = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          toast.error('Please login first');
          setTimeout(() => {
            router.push('/login');
          }, 1500);
          return;
        }

        const data: SetupStatusData = await setupService.getSetupStatus();
        

        if (data.stepStatus && data.stepStatus.step1) {
          console.log('Step 1 is completed, checking for password data...');
          if (data.stepData && data.stepData.step1?.hasPassword) {
            console.log('Auto-filling password fields...');
            setPassword('*****');
            setConfirmPassword('*****');
            setIsValid(true);
            toast.success('Password already set up! Auto-filled with *****. You can proceed to next step.');
          } else {
            console.log('No password data, redirecting...');
            toast.success('Password already set up! Redirecting to next step...');
            setTimeout(() => {
              router.push('/setup/step2');
            }, 1500);
            return;
          }
        } else {
          console.log('Step 1 not completed yet');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching setup status:', error);
        toast.error('Authentication failed. Please login again.');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      }
    };

    fetchSetupStatus();
  }, [router]);

  useEffect(() => {
    console.log('Password validation triggered:', { password, confirmPassword, isValid });
    
    if (!password || !confirmPassword) {
      setPasswordError('');
      setIsValid(false);
      return;
    }
    
    if (password === '*****') {
      // Password already set up, skip validation
      console.log('Password is *****, setting valid to true');
      setPasswordError('');
      setIsValid(true);
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
  }, [password, confirmPassword, isValid]);

  const validatePassword = () => {
    if (!password || !confirmPassword) {
      setPasswordError('Please fill in both password fields');
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    if (password === '*****') {
      // Password already set up, skip length validation
      setPasswordError('');
      return true;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleNext = async () => {
    if (validatePassword()) {
      if (password === '*****') {
        // Password already set up, just proceed
        toast.success('Proceeding to next step...');
        setTimeout(() => {
          router.push('/setup/step2');
        }, 1500);
      } else {
        // New password, save it
        try {
          await setupService.saveSetupStep('step1', { password });
          toast.success('Password saved successfully!');
          setTimeout(() => {
            router.push('/setup/step2');
          }, 1500);
        } catch {
          toast.error('Failed to save password. Please try again.');
        }
      }
    }
  };



  const handleBack = () => {
    router.push('/');
  };

  return (
    <SetupLayout isLoading={isLoading}>
      <SetupHeader 
        title="Set up your profile"
        description="Create a password for your account to keep it secure."
      />

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
          <SetupButton
            onClick={handleNext}
            disabled={!isValid}
          >
            <span>Next</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </SetupButton>
          
          <SetupNavigation onBack={handleBack} />
        </div>
    </SetupLayout>
  );
}
