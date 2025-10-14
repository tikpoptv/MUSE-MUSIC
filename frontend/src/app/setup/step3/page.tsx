'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { setupService } from '@/services/setupService';
import { SetupLayout, SetupHeader, SetupNavigation, SetupButton } from '@/components/setup';
import { countries, allTimezones, languages, handleCountryChangeStep3, Step3FormData } from '@/utils/countryUtils';

export default function SetupStep3() {
  const router = useRouter();
  const [country, setCountry] = useState('Thailand');
  const [timezone, setTimezone] = useState('Thailand (GMT+7)');
  const [language, setLanguage] = useState('English');
  const [isLoading, setIsLoading] = useState(true);

  const timezones = [...new Set([timezone, ...allTimezones])];


  const handleCountryChangeLocal = (selectedCountry: string) => {
    setCountry(selectedCountry);
    
    const formData: Step3FormData = { country: selectedCountry, timezone, language };
    const setFormData = (updater: (prev: Step3FormData) => Step3FormData) => {
      const newData = updater(formData);
      setTimezone(newData.timezone);
      setLanguage(newData.language);
    };
    
    handleCountryChangeStep3(selectedCountry, setFormData, toast);
  };

  const handleNext = async () => {
    try {
      await setupService.saveSetupStep('step3', { 
        country, 
        timezone, 
        language 
      });
      
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        user.stepData = user.stepData || {};
        user.stepData.step3 = { country, timezone, language };
        user.stepStatus = user.stepStatus || {};
        user.stepStatus.step3 = true;
        localStorage.setItem('user_data', JSON.stringify(user));
      }
      
      toast.success('Preferences saved successfully!');
      setTimeout(() => {
        router.push('/setup/step4');
      }, 1500);
    } catch {
      toast.error('Failed to save preferences. Please try again.');
    }
  };


  const handleBack = () => {
    router.push('/setup/step2');
  };

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

            const data = await setupService.getSetupStatus();
        
        if (data.stepStatus && data.stepStatus.step3) {
          if (data.stepData && data.stepData.step3) {
            setCountry(data.stepData.step3.country);
            setTimezone(data.stepData.step3.timezone);
            setLanguage(data.stepData.step3.language);
            toast.success('Preferences loaded from previous setup!');
          } else {
            toast.success('Preferences already set up! Redirecting to next step...');
            setTimeout(() => {
              router.push('/setup/step4');
            }, 1500);
            return;
          }
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

  return (
    <SetupLayout isLoading={isLoading}>
      <SetupHeader 
        title="Set up your profile"
        description="Pick at least one genre to start shaping your music mood."
      />

        <div className="mb-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Country
            </label>
            <select
              value={country}
                onChange={(e) => handleCountryChangeLocal(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-600 rounded-lg"
            >
              {countries.map((country: string, index: number) => (
                <option key={index} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-600 rounded-lg"
            >
              {timezones.map((tz: string, index: number) => (
                <option key={index} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-600 rounded-lg"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="space-y-4">
          <SetupButton onClick={handleNext}>
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