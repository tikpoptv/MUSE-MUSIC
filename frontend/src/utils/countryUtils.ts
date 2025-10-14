// @ts-expect-error - No type definitions available for country-list
import countryList from 'country-list';
import { formatInTimeZone } from 'date-fns-tz';
import ISO6391 from 'iso-639-1';

export const countries = countryList.getNames();

export const allTimezones = Intl.supportedValuesOf('timeZone').map(tz => {
  const now = new Date();
  const offset = formatInTimeZone(now, tz, 'XXX');
  const city = tz.split('/').pop()?.replace(/_/g, ' ') || tz;
  return `${city} (GMT${offset})`;
}).slice(0, 50);

export const languages = ISO6391.getAllNames();

export const findTimezoneForCountry = (countryName: string) => {
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

export const findLanguageForCountry = (countryName: string) => {
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

interface FormData {
  username: string;
  password: string;
  email: string;
  fullName: string;
  country: string;
  timezone: string;
  language: string;
}

export interface Step3FormData {
  country: string;
  timezone: string;
  language: string;
}

export const handleCountryChange = (
  selectedCountry: string,
  setFormData: (updater: (prev: FormData) => FormData) => void,
  toast: { success: (message: string) => void; error: (message: string) => void }
) => {
  setFormData((prev: FormData) => ({ ...prev, country: selectedCountry }));
  
  const foundTimezone = findTimezoneForCountry(selectedCountry);
  const foundLanguage = findLanguageForCountry(selectedCountry);
  
  if (foundTimezone) {
    const now = new Date();
    const offset = formatInTimeZone(now, foundTimezone, 'XXX');
    const city = foundTimezone.split('/').pop()?.replace(/_/g, ' ') || foundTimezone;
    const timezoneString = `${city} (GMT${offset})`;
    setFormData((prev: FormData) => ({ 
      ...prev, 
      timezone: timezoneString,
      language: foundLanguage
    }));
    toast.success(`Auto timezone set to ${city} (GMT${offset}) and language to ${foundLanguage}`);
  } else {
    setFormData((prev: FormData) => ({ 
      ...prev, 
      timezone: 'UTC (GMT+00:00)',
      language: foundLanguage
    }));
    toast.error(`No timezone found for ${selectedCountry}, using UTC (GMT+00:00) and ${foundLanguage} instead`);
  }
};

export const handleCountryChangeStep3 = (
  selectedCountry: string,
  setFormData: (updater: (prev: Step3FormData) => Step3FormData) => void,
  toast: { success: (message: string) => void; error: (message: string) => void }
) => {
  setFormData((prev: Step3FormData) => ({ ...prev, country: selectedCountry }));
  
  const foundTimezone = findTimezoneForCountry(selectedCountry);
  const foundLanguage = findLanguageForCountry(selectedCountry);
  
  if (foundTimezone) {
    const now = new Date();
    const offset = formatInTimeZone(now, foundTimezone, 'XXX');
    const city = foundTimezone.split('/').pop()?.replace(/_/g, ' ') || foundTimezone;
    const timezoneString = `${city} (GMT${offset})`;
    setFormData((prev: Step3FormData) => ({ 
      ...prev, 
      timezone: timezoneString,
      language: foundLanguage
    }));
    toast.success(`Auto timezone set to ${city} (GMT${offset}) and language to ${foundLanguage}`);
  } else {
    setFormData((prev: Step3FormData) => ({ 
      ...prev, 
      timezone: 'UTC (GMT+00:00)',
      language: foundLanguage
    }));
    toast.error(`No timezone found for ${selectedCountry}, using UTC (GMT+00:00) and ${foundLanguage} instead`);
  }
};
