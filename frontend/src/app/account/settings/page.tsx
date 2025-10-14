'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { countries, allTimezones, languages, handleCountryChange } from '@/utils/countryUtils';
import GoogleSettingsButton from '@/components/GoogleSettingsButton';

export default function SettingsPage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '••••••••',
    email: '',
    fullName: '',
    country: '',
    timezone: '',
    language: ''
  });

  const [originalData, setOriginalData] = useState({
    username: '',
    password: '••••••••',
    email: '',
    fullName: '',
    country: '',
    timezone: '',
    language: ''
  });

  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  const handleCountryChangeLocal = (selectedCountry: string) => {
    handleCountryChange(selectedCountry, setFormData, toast);
  };

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const isAuth = authService.isAuthenticated();
        if (!isAuth) {
          toast.error('Please login first');
          router.push('/login');
          return;
        }

        const settings = await userService.getUserSettings();
        
        const newFormData = {
          username: settings.username,
          password: '••••••••',
          email: settings.email,
          fullName: settings.fullName,
          country: settings.country,
          timezone: settings.timezone,
          language: settings.language
        };
        
        setFormData(newFormData);
        setOriginalData(newFormData);
        setProfilePicture(settings.profilePicture);
        setIsGoogleConnected(settings.provider === 'google');
      } catch (error) {
        console.error('Error fetching user settings:', error);
        toast.error('Failed to load user settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserSettings();
  }, [router]);

  const handleEdit = (field: string) => {
    setIsEditing(field);
  };

  const handleSave = async () => {
    const currentField = isEditing;
    if (!currentField || isSaving) return;

    const hasChanges = formData[currentField as keyof typeof formData] !== originalData[currentField as keyof typeof originalData];
    
    if (!hasChanges) {
      toast.error('No changes detected. Please make some changes before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const settingsData = {
        [currentField]: formData[currentField as keyof typeof formData]
      };

      await userService.updateUserSettings(settingsData);

      setOriginalData({...originalData, [currentField]: formData[currentField as keyof typeof formData]});
      setIsEditing(null);
      toast.success('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };


  const renderInputField = (field: string, label: string, type: string = 'text', extraContent?: React.ReactNode) => {
    const isPassword = type === 'password';
    const isCountry = field === 'country';
    const isTimezone = field === 'timezone';
    const isLanguage = field === 'language';
    
    const shouldBeEnabled = isEditing !== null;
    
    return (
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
          <div className="relative">
            {isCountry ? (
              <select
                value={formData[field as keyof typeof formData] || ''}
                onChange={(e) => handleCountryChangeLocal(e.target.value)}
                className={`w-full pl-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:border-transparent text-[#0F172A] ${
                  shouldBeEnabled ? 'border-gray-300 pr-12' : 'border-gray-200 bg-gray-50 pr-3'
                }`}
                disabled={!shouldBeEnabled}
                style={{ 
                  appearance: 'none',
                  backgroundImage: shouldBeEnabled ? 'url("/icons/dropdown-arrow.svg")' : 'none',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '16px'
                }}
              >
                {countries.map((country: string) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            ) : isTimezone ? (
              <select
                value={formData[field as keyof typeof formData] || ''}
                onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                className={`w-full pl-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:border-transparent text-[#0F172A] ${
                  shouldBeEnabled ? 'border-gray-300 pr-12' : 'border-gray-200 bg-gray-50 pr-3'
                }`}
                disabled={!shouldBeEnabled}
                style={{ 
                  appearance: 'none',
                  backgroundImage: shouldBeEnabled ? 'url("/icons/dropdown-arrow.svg")' : 'none',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '16px'
                }}
              >
                {allTimezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            ) : isLanguage ? (
              <select
                value={formData[field as keyof typeof formData] || ''}
                onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                className={`w-full pl-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:border-transparent text-[#0F172A] ${
                  shouldBeEnabled ? 'border-gray-300 pr-12' : 'border-gray-200 bg-gray-50 pr-3'
                }`}
                disabled={!shouldBeEnabled}
                style={{ 
                  appearance: 'none',
                  backgroundImage: shouldBeEnabled ? 'url("/icons/dropdown-arrow.svg")' : 'none',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '16px'
                }}
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={type}
                value={formData[field as keyof typeof formData] || ''}
                onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:border-transparent text-[#0F172A] ${
                  shouldBeEnabled ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                }`}
                disabled={isPassword || !shouldBeEnabled}
                readOnly={isPassword}
              />
            )}
            {!isPassword && !shouldBeEnabled && (
              <button
                onClick={() => handleEdit(field)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#7B61FF] transition-colors"
              >
                <Image src="/icons/pen-edit-icon.svg" alt="Edit" width={16} height={16} />
              </button>
            )}
          </div>
          {extraContent}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B61FF] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-[32px] p-8 w-full max-w-4xl" 
        style={{
          boxShadow: '0 0 50px rgba(123, 97, 255, 0.1), 0 0 100px rgba(123, 97, 255, 0.05), 0 0 150px rgba(123, 97, 255, 0.03), 0 0 200px rgba(123, 97, 255, 0.02), 0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="flex flex-col items-center lg:col-span-1">
            <div className={`w-48 h-48 rounded-full flex items-center justify-center mb-4 overflow-hidden cursor-pointer relative group ${
              profilePicture ? 'bg-transparent' : 'bg-gradient-to-br from-[#7B61FF] to-[#6B51EF]'
            }`}>
              {profilePicture ? (
                <>
                  <Image 
                    src={profilePicture} 
                    alt="Profile Picture" 
                    width={192} 
                    height={192}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#7B61FF] to-[#6B51EF] bg-opacity-80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="text-center text-white">
                      <Image 
                        src="/icons/pen-edit-icon.svg" 
                        alt="Edit" 
                        width={24} 
                        height={24}
                        className="filter brightness-0 invert mx-auto mb-1"
                      />
                      <div className="text-sm font-medium">Change Photo</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="text-white text-4xl font-bold mb-2">+</div>
                  <div className="text-white text-xs">Add your picture!</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Account Details */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* Username */}
            {renderInputField('username', 'Username')}

            {/* Full Name */}
            {renderInputField('fullName', 'Full Name')}

            {/* Password */}
            {renderInputField('password', 'Password', 'password', 
              <button className="text-[#7B61FF] text-sm hover:underline mt-1">Reset Password?</button>
            )}

            {/* Email */}
            {renderInputField('email', 'Email', 'email')}

            {/* Country */}
            {renderInputField('country', 'Country')}

            {/* Timezone */}
            {renderInputField('timezone', 'Timezone')}

            {/* Language */}
            {renderInputField('language', 'Language')}

            {/* Google Sign-in Integration */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Google Account</label>
                <div className="flex items-center justify-between">
                  {isGoogleConnected ? (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-700">Connected to Google</span>
                      </div>
                      <Image 
                        src="/icons/Google.svg" 
                        alt="Google" 
                        width={20} 
                        height={20}
                        className="opacity-80"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">Not connected to Google</span>
                      </div>
                      <GoogleSettingsButton 
                        onAuthStart={() => toast.loading('Connecting to Google...')}
                        onAuthError={(error) => toast.error(`Google connection failed: ${error}`)}
                      >
                        Connect
                      </GoogleSettingsButton>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 ${
                    isSaving 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#7B61FF] hover:bg-[#6B51EF]'
                  } text-white`}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Image src="/icons/save-icon.svg" alt="Save" width={16} height={16} className="filter brightness-0 invert" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}