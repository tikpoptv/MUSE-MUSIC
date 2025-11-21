export interface Language {
  code: string;
  name: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'th', name: 'Thai' },
  { code: 'lo', name: 'Lao' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'vi', name: 'Vietnamese' }
];

export const DEFAULT_ORIGINAL_LANGUAGE = 'English';
export const DEFAULT_TARGET_LANGUAGE = 'Thai';
export const DEFAULT_TRANSCRIPT_LANGUAGE_CODE = 'th';

export const getLanguageNameByCode = (code: string): string => {
  const language = languages.find(lang => lang.code === code);
  return language?.name || code;
};

export const getLanguageCodeByName = (name: string): string => {
  const language = languages.find(lang => lang.name === name);
  return language?.code || name.toLowerCase().substring(0, 2);
};

export const getLanguageByCode = (code: string): Language | undefined => {
  return languages.find(lang => lang.code === code);
};

export const getLanguageByName = (name: string): Language | undefined => {
  return languages.find(lang => lang.name === name);
};

export const isValidLanguageCode = (code: string): boolean => {
  return languages.some(lang => lang.code === code);
};

export const isValidLanguageName = (name: string): boolean => {
  return languages.some(lang => lang.name === name);
};

export const getLanguageCodes = (): string[] => {
  return languages.map(lang => lang.code);
};

export const getLanguageNames = (): string[] => {
  return languages.map(lang => lang.name);
};

export const languageNameToCode: Record<string, string> = {
  'Thai': 'th',
  'English': 'en',
  'Japanese': 'ja',
  'Korean': 'ko',
  'Lao': 'lo',
  'Chinese': 'zh',
  'Spanish': 'es',
  'French': 'fr',
  'German': 'de',
  'Italian': 'it',
  'Portuguese': 'pt',
  'Russian': 'ru',
  'Vietnamese': 'vi'
};

export const languageCodeToName: Record<string, string> = {
  'th': 'Thai',
  'en': 'English',
  'ja': 'Japanese',
  'ko': 'Korean',
  'lo': 'Lao',
  'zh': 'Chinese',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'vi': 'Vietnamese'
};

