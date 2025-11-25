const LANGUAGE_CODE_TO_NAME = {
  en: 'English',
  th: 'Thai',
  lo: 'Laos',
  ko: 'Korean',
  ja: 'Japanese',
  zh: 'Chinese',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  vi: 'Vietnamese',
  id: 'Indonesian',
  ms: 'Malay',
  hi: 'Hindi'
};

const LANGUAGE_NAME_TO_CODE = {
  'English': 'en',
  'Thai': 'th',
  'Laos': 'lo',
  'Korean': 'ko',
  'Japanese': 'ja',
  'Chinese': 'zh',
  'Spanish': 'es',
  'French': 'fr',
  'German': 'de',
  'Italian': 'it',
  'Portuguese': 'pt',
  'Russian': 'ru',
  'Vietnamese': 'vi',
  'Indonesian': 'id',
  'Malay': 'ms',
  'Hindi': 'hi'
};

const DEFAULT_ORIGINAL_LANGUAGE = 'English';
const DEFAULT_TARGET_LANGUAGE = 'Thai';
const DEFAULT_TRANSCRIPT_LANGUAGE_CODE = 'th';

const getLanguageNameByCode = (code) => {
  if (!code || typeof code !== 'string') {
    return null;
  }
  return LANGUAGE_CODE_TO_NAME[code.toLowerCase()] || null;
};

const getLanguageCodeByName = (name) => {
  if (!name || typeof name !== 'string') {
    return null;
  }
  return LANGUAGE_NAME_TO_CODE[name] || null;
};

const normalizeLanguageInput = (language) => {
  if (!language || typeof language !== 'string') {
    return null;
  }

  const trimmed = language.trim();
  if (!trimmed) {
    return null;
  }

  const lower = trimmed.toLowerCase();

  if (LANGUAGE_CODE_TO_NAME[lower]) {
    return LANGUAGE_CODE_TO_NAME[lower];
  }

  const matchedName = Object.values(LANGUAGE_CODE_TO_NAME).find(
    (name) => name.toLowerCase() === lower
  );

  return matchedName || trimmed;
};

const isValidLanguageCode = (code) => {
  if (!code || typeof code !== 'string') {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(LANGUAGE_CODE_TO_NAME, code.toLowerCase());
};

const isValidLanguageName = (name) => {
  if (!name || typeof name !== 'string') {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(LANGUAGE_NAME_TO_CODE, name);
};

const getLanguageCodes = () => {
  return Object.keys(LANGUAGE_CODE_TO_NAME);
};

const getLanguageNames = () => {
  return Object.values(LANGUAGE_CODE_TO_NAME);
};

module.exports = {
  LANGUAGE_CODE_TO_NAME,
  LANGUAGE_NAME_TO_CODE,
  DEFAULT_ORIGINAL_LANGUAGE,
  DEFAULT_TARGET_LANGUAGE,
  DEFAULT_TRANSCRIPT_LANGUAGE_CODE,
  getLanguageNameByCode,
  getLanguageCodeByName,
  normalizeLanguageInput,
  isValidLanguageCode,
  isValidLanguageName,
  getLanguageCodes,
  getLanguageNames
};

