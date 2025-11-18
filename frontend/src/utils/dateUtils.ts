const getBrowserLocale = (): string => {
  if (typeof window === 'undefined') return 'en-US';
  return navigator.language || navigator.languages?.[0] || 'en-US';
};

const getBrowserTimezone = (): string => {
  if (typeof window === 'undefined') return 'UTC';
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
};

const isThailandTimezone = (): boolean => {
  const timezone = getBrowserTimezone();
  return timezone === 'Asia/Bangkok' || timezone === 'Asia/Phnom_Penh' || timezone === 'Asia/Vientiane' || timezone === 'Asia/Ho_Chi_Minh';
};

export const formatDateThai = (
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = {},
  userTimezone?: string
): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...options
  };

  if (userTimezone) {
    defaultOptions.timeZone = userTimezone;
  } else if (!defaultOptions.timeZone) {
    if (isThailandTimezone()) {
      defaultOptions.timeZone = 'Asia/Bangkok';
    } else {
      defaultOptions.timeZone = getBrowserTimezone();
    }
  }
  
  return date.toLocaleString(getBrowserLocale(), defaultOptions);
};

export const formatDateOnlyThai = (
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = {},
  userTimezone?: string
): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };

  if (userTimezone) {
    defaultOptions.timeZone = userTimezone;
  } else if (!defaultOptions.timeZone) {
    if (isThailandTimezone()) {
      defaultOptions.timeZone = 'Asia/Bangkok';
    } else {
      defaultOptions.timeZone = getBrowserTimezone();
    }
  }
  
  return date.toLocaleDateString(getBrowserLocale(), defaultOptions);
};

export const formatTimeThai = (
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = {},
  userTimezone?: string
): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...options
  };

  if (userTimezone) {
    defaultOptions.timeZone = userTimezone;
  } else if (!defaultOptions.timeZone) {
    if (isThailandTimezone()) {
      defaultOptions.timeZone = 'Asia/Bangkok';
    } else {
      defaultOptions.timeZone = getBrowserTimezone();
    }
  }
  
  return date.toLocaleTimeString(getBrowserLocale(), defaultOptions);
};

export const formatDateLongThai = (
  dateString: string | Date,
  userTimezone?: string
): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  if (userTimezone) {
    options.timeZone = userTimezone;
  } else {
    if (isThailandTimezone()) {
      options.timeZone = 'Asia/Bangkok';
    } else {
      options.timeZone = getBrowserTimezone();
    }
  }
  
  return date.toLocaleDateString(getBrowserLocale(), options);
};

export const getCurrentDateThai = (userTimezone?: string): string => {
  const now = new Date();
  return formatDateThai(now, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }, userTimezone);
};

