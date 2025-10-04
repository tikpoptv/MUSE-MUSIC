'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
// @ts-expect-error - No type definitions available for country-list
import countryList from 'country-list';
import { formatInTimeZone } from 'date-fns-tz';
import ISO6391 from 'iso-639-1';

export default function SetupStep3() {
  const router = useRouter();
  const [country, setCountry] = useState('Thailand');
  const [timezone, setTimezone] = useState('Thailand (GMT+7)');
  const [language, setLanguage] = useState('English');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

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

  const handleNext = () => {
    if (acceptTerms) {
      router.push('/setup/step4');
    }
  };

  const handleTermsClick = () => {
    setShowTermsModal(true);
  };

  const handleAcceptTerms = () => {
    setAcceptTerms(true);
    setShowTermsModal(false);
    toast.success('Terms and conditions accepted');
  };

  const handleCloseModal = () => {
    setShowTermsModal(false);
  };

  const handleSkip = () => {
    if (!acceptTerms) {
      setShowTermsModal(true);
      toast.error('Please accept terms and conditions before skipping setup');
      return;
    }
    router.push('/');
  };

  const handleBack = () => {
    router.push('/setup/step2');
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
            Pick at least one genre to start shaping your music mood.
          </p>
        </div>

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

          <div className="flex items-start space-x-3">
            <button
              onClick={handleTermsClick}
              className="flex-shrink-0 mt-1"
            >
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                acceptTerms 
                  ? 'bg-[#7B61FF] border-[#7B61FF]' 
                  : 'border-gray-300'
              }`}>
                {acceptTerms && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
            <div>
              <p className="text-sm text-gray-900">
                Accept{' '}
                <button
                  type="button"
                  onClick={handleTermsClick}
                  className="text-purple-600 hover:text-purple-800 underline"
                >
                  terms and conditions
                </button>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                You agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleNext}
            disabled={!acceptTerms}
            className={`w-full px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 ${
              acceptTerms
                ? 'bg-[#7B61FF] hover:bg-[#6B51EF] text-white'
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

      {showTermsModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 mx-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Terms and Conditions</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Educational Project</h3>
                <p>MUSE Music is an educational project developed for CPE 334 Software Engineering course. This is a demonstration application for learning purposes only.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Music Content Disclaimer</h3>
                <p>All music content used in this application is for educational demonstration purposes only. We do not claim ownership of any music tracks and acknowledge that all rights belong to their respective copyright holders.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Non-Commercial Use</h3>
                <p>This application is strictly for educational and demonstration purposes. No commercial use is intended or permitted. All music content is used under fair use for educational purposes.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4. Copyright Notice</h3>
                <p>We respect all copyright holders and their intellectual property rights. If you are a copyright holder and believe your content has been used inappropriately, please contact us for immediate removal.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5. Educational Purpose</h3>
                <p>This project demonstrates software engineering principles including user authentication, database design, API development, and frontend-backend integration for academic evaluation.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">6. Data Privacy</h3>
                <p>User data collected is used solely for educational demonstration purposes. No personal information will be shared or used for commercial purposes.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">7. Project Scope</h3>
                <p>This is a capstone project for CPE 334 Software Engineering course, demonstrating full-stack development skills and software engineering best practices.</p>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-8">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptTerms}
                className="flex-1 px-4 py-2 bg-[#7B61FF] text-white rounded-lg hover:bg-[#6B51EF] transition-colors"
              >
                Accept Terms
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}