'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { setupService } from '@/services/setupService';
import { SetupLayout, SetupHeader, SetupNavigation, SetupButton } from '@/components/setup';
// @ts-expect-error - No type definitions available for country-list
import countryList from 'country-list';
import { formatInTimeZone } from 'date-fns-tz';
import ISO6391 from 'iso-639-1';

export default function SetupStep3() {
  const router = useRouter();
  const [country, setCountry] = useState('Thailand');
  const [timezone, setTimezone] = useState('Thailand (GMT+7)');
  const [language, setLanguage] = useState('English');
  const [isLoading, setIsLoading] = useState(true);

  const countries = countryList.getNames();
  
  const allTimezones = Intl.supportedValuesOf('timeZone').map(tz => {
    const now = new Date();
    const offset = formatInTimeZone(now, tz, 'XXX');
    const city = tz.split('/').pop()?.replace(/_/g, ' ') || tz;
    return `${city} (GMT${offset})`;
  }).slice(0, 50);

  const timezones = [...new Set([timezone, ...allTimezones])];

  const findTimezoneForCountry = (countryName: string) => {
    const allTimezones = Intl.supportedValuesOf('timeZone');
    const countryLower = countryName.toLowerCase();
    
    const matchingStrategies = [
      (tz: string) => {
        const tzLower = tz.toLowerCase();
        return tzLower.includes(countryLower);
      },
      
      (tz: string) => {
        const tzLower = tz.toLowerCase();
        return tzLower.includes(countryLower.replace(/\s+/g, '_'));
      },
      
      (tz: string) => {
        const tzLower = tz.toLowerCase();
        return tzLower.includes(countryLower.replace(/\s+/g, ''));
      },
      
      (tz: string) => {
        const city = tz.split('/').pop()?.toLowerCase() || '';
        
        const cityMappings: { [key: string]: string[] } = {
          'thailand': ['bangkok'],
          'united states': ['new_york', 'chicago', 'denver', 'los_angeles'],
          'united kingdom': ['london'],
          'japan': ['tokyo'],
          'south korea': ['seoul'],
          'singapore': ['singapore'],
          'malaysia': ['kuala_lumpur'],
          'indonesia': ['jakarta', 'makassar', 'jayapura'],
          'philippines': ['manila'],
          'vietnam': ['ho_chi_minh'],
          'australia': ['sydney', 'melbourne', 'perth'],
          'germany': ['berlin'],
          'france': ['paris'],
          'italy': ['rome'],
          'spain': ['madrid'],
          'netherlands': ['amsterdam'],
          'sweden': ['stockholm'],
          'russia': ['moscow', 'vladivostok'],
          'united arab emirates': ['dubai'],
          'india': ['kolkata'],
          'china': ['shanghai', 'beijing'],
          'hong kong': ['hong_kong'],
          'taiwan': ['taipei'],
          'canada': ['toronto', 'vancouver'],
          'brazil': ['sao_paulo'],
          'mexico': ['mexico_city'],
          'argentina': ['buenos_aires'],
          'chile': ['santiago'],
          'south africa': ['johannesburg'],
          'egypt': ['cairo'],
          'nigeria': ['lagos'],
          'kenya': ['nairobi'],
          'morocco': ['casablanca'],
          'turkey': ['istanbul'],
          'israel': ['jerusalem'],
          'saudi arabia': ['riyadh'],
          'iran': ['tehran'],
          'pakistan': ['karachi'],
          'bangladesh': ['dhaka'],
          'sri lanka': ['colombo'],
          'nepal': ['kathmandu'],
          'myanmar': ['yangon'],
          'laos': ['vientiane'],
          'cambodia': ['phnom_penh']
        };
        
        const cities = cityMappings[countryLower] || [];
        return cities.some(cityName => city.includes(cityName));
      }
    ];
    
    for (const strategy of matchingStrategies) {
      const foundTimezone = allTimezones.find(strategy);
      if (foundTimezone) {
        return foundTimezone;
      }
    }
    
    return null;
  };

  const handleCountryChange = (selectedCountry: string) => {
    setCountry(selectedCountry);
    
    const foundTimezone = findTimezoneForCountry(selectedCountry);
    const foundLanguage = findLanguageForCountry(selectedCountry);
    
    if (foundTimezone) {
      const now = new Date();
      const offset = formatInTimeZone(now, foundTimezone, 'XXX');
      const city = foundTimezone.split('/').pop()?.replace(/_/g, ' ') || foundTimezone;
      const timezoneString = `${city} (GMT${offset})`;
      setTimezone(timezoneString);
      setLanguage(foundLanguage);
      toast.success(`Auto timezone set to ${city} (GMT${offset}) and language to ${foundLanguage}`);
    } else {
      setTimezone('UTC (GMT+00:00)');
      setLanguage(foundLanguage);
      toast.error(`No timezone found for ${selectedCountry}, using UTC (GMT+00:00) and ${foundLanguage} instead`);
    }
  };
  
  const languages = ISO6391.getAllNames();

  const findLanguageForCountry = (countryName: string) => {
    const countryLanguageMap: { [key: string]: string } = {
      'Thailand': 'Thai',
      'United States': 'English',
      'United Kingdom': 'English',
      'Japan': 'Japanese',
      'South Korea': 'Korean',
      'Singapore': 'English',
      'Malaysia': 'Malay',
      'Indonesia': 'Indonesian',
      'Philippines': 'Filipino',
      'Vietnam': 'Vietnamese',
      'Australia': 'English',
      'Germany': 'German',
      'France': 'French',
      'Italy': 'Italian',
      'Spain': 'Spanish',
      'Netherlands': 'Dutch',
      'Sweden': 'Swedish',
      'Russia': 'Russian',
      'United Arab Emirates': 'Arabic',
      'India': 'Hindi',
      'China': 'Chinese',
      'Hong Kong': 'Chinese',
      'Taiwan': 'Chinese',
      'Canada': 'English',
      'Brazil': 'Portuguese',
      'Mexico': 'Spanish',
      'Argentina': 'Spanish',
      'Chile': 'Spanish',
      'South Africa': 'English',
      'Egypt': 'Arabic',
      'Nigeria': 'English',
      'Kenya': 'English',
      'Morocco': 'Arabic',
      'Turkey': 'Turkish',
      'Israel': 'Hebrew',
      'Saudi Arabia': 'Arabic',
      'Iran': 'Persian',
      'Pakistan': 'Urdu',
      'Bangladesh': 'Bengali',
      'Sri Lanka': 'Sinhala',
      'Nepal': 'Nepali',
      'Myanmar': 'Burmese',
      'Laos': 'Lao',
      'Cambodia': 'Khmer'
    };

    return countryLanguageMap[countryName] || 'English';
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
              onChange={(e) => handleCountryChange(e.target.value)}
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