export const passwordRules = [
  { id: 'length', text: 'At least 8 characters', test: (password: string) => password.length >= 8 },
  { id: 'uppercase', text: 'One uppercase letter', test: (password: string) => /[A-Z]/.test(password) },
  { id: 'lowercase', text: 'One lowercase letter', test: (password: string) => /[a-z]/.test(password) },
  { id: 'number', text: 'One number', test: (password: string) => /\d/.test(password) },
  { id: 'special', text: 'One special character', test: (password: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password) }
];

export const validatePassword = (password: string): Record<string, boolean> => {
  const validation: Record<string, boolean> = {};
  passwordRules.forEach(rule => {
    validation[rule.id] = rule.test(password);
  });
  return validation;
};

export const isPasswordValid = (password: string): boolean => {
  return passwordRules.every(rule => rule.test(password));
};

export const doPasswordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

export const getPasswordStrength = (password: string): number => {
  let score = 0;
  
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 10;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password)) score += 20;
  
  if (password.length > 20) score += 10;
  
  return Math.min(score, 100);
};

export const getPasswordStrengthLevel = (password: string): 'weak' | 'medium' | 'strong' | 'very-strong' => {
  const score = getPasswordStrength(password);
  
  if (score < 40) return 'weak';
  if (score < 60) return 'medium';
  if (score < 80) return 'strong';
  return 'very-strong';
};

export const getPasswordStrengthColor = (password: string): string => {
  const level = getPasswordStrengthLevel(password);
  
  switch (level) {
    case 'weak': return 'text-red-500';
    case 'medium': return 'text-yellow-500';
    case 'strong': return 'text-blue-500';
    case 'very-strong': return 'text-green-500';
    default: return 'text-gray-500';
  }
};

export const getPasswordStrengthBgColor = (password: string): string => {
  const level = getPasswordStrengthLevel(password);
  
  switch (level) {
    case 'weak': return 'bg-red-100';
    case 'medium': return 'bg-yellow-100';
    case 'strong': return 'bg-blue-100';
    case 'very-strong': return 'bg-green-100';
    default: return 'bg-gray-100';
  }
};

export const validateFormData = (password: string, confirmPassword: string) => {
  const passwordValidation = validatePassword(password);
  const allRulesMet = isPasswordValid(password);
  const passwordsMatch = doPasswordsMatch(password, confirmPassword);
  
  return {
    passwordValidation,
    allRulesMet,
    passwordsMatch,
    isFormValid: allRulesMet && passwordsMatch
  };
};
