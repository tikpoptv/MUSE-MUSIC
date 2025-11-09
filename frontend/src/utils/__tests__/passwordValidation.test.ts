import {
  passwordRules,
  validatePassword,
  isPasswordValid,
  doPasswordsMatch,
  getPasswordStrength,
  getPasswordStrengthLevel,
  getPasswordStrengthColor,
  getPasswordStrengthBgColor,
  validateFormData
} from '@/utils/passwordValidation'

describe('Password Validation Utils', () => {
  describe('passwordRules', () => {
    it('should have all required rules', () => {
      expect(passwordRules).toHaveLength(5)
      expect(passwordRules.map(rule => rule.id)).toEqual([
        'length',
        'uppercase',
        'lowercase',
        'number',
        'special'
      ])
    })

    it('should have correct rule texts', () => {
      expect(passwordRules[0].text).toBe('At least 8 characters')
      expect(passwordRules[1].text).toBe('One uppercase letter')
      expect(passwordRules[2].text).toBe('One lowercase letter')
      expect(passwordRules[3].text).toBe('One number')
      expect(passwordRules[4].text).toBe('One special character')
    })
  })

  describe('validatePassword', () => {
    it('should validate all rules correctly for valid password', () => {
      const password = 'TestPassword123!'
      const result = validatePassword(password)
      
      expect(result).toEqual({
        length: true,
        uppercase: true,
        lowercase: true,
        number: true,
        special: true
      })
    })

    it('should identify missing requirements', () => {
      const password = 'test'
      const result = validatePassword(password)
      
      expect(result).toEqual({
        length: false,
        uppercase: false,
        lowercase: true,
        number: false,
        special: false
      })
    })

    it('should handle empty password', () => {
      const password = ''
      const result = validatePassword(password)
      
      expect(result).toEqual({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      })
    })
  })

  describe('isPasswordValid', () => {
    it('should return true for valid password', () => {
      const password = 'TestPassword123!'
      expect(isPasswordValid(password)).toBe(true)
    })

    it('should return false for invalid password', () => {
      const password = 'test'
      expect(isPasswordValid(password)).toBe(false)
    })

    it('should return false for empty password', () => {
      const password = ''
      expect(isPasswordValid(password)).toBe(false)
    })
  })

  describe('doPasswordsMatch', () => {
    it('should return true when passwords match', () => {
      const password = 'TestPassword123!'
      const confirmPassword = 'TestPassword123!'
      expect(doPasswordsMatch(password, confirmPassword)).toBe(true)
    })

    it('should return false when passwords do not match', () => {
      const password = 'TestPassword123!'
      const confirmPassword = 'DifferentPassword123!'
      expect(doPasswordsMatch(password, confirmPassword)).toBe(false)
    })

    it('should handle empty passwords', () => {
      expect(doPasswordsMatch('', '')).toBe(true)
      expect(doPasswordsMatch('', 'test')).toBe(false)
      expect(doPasswordsMatch('test', '')).toBe(false)
    })
  })

  describe('getPasswordStrength', () => {
    it('should return 0 for empty password', () => {
      expect(getPasswordStrength('')).toBe(0)
    })

    it('should return low score for weak password', () => {
      expect(getPasswordStrength('test')).toBe(10) // only lowercase
    })

    it('should return medium score for medium password', () => {
      const score = getPasswordStrength('Test123')
      expect(score).toBeGreaterThanOrEqual(30)
      expect(score).toBeLessThan(60)
    })

    it('should return high score for strong password', () => {
      const score = getPasswordStrength('TestPassword123!')
      expect(score).toBeGreaterThanOrEqual(80)
    })

    it('should return maximum score for very strong password', () => {
      expect(getPasswordStrength('VeryStrongPassword123!@#')).toBe(100) // capped at 100
    })

    it('should add bonus points for extra length', () => {
      const shortPassword = 'Test123!'
      const longPassword = 'TestPassword123!'
      
      expect(getPasswordStrength(longPassword)).toBeGreaterThan(getPasswordStrength(shortPassword))
    })
  })

  describe('getPasswordStrengthLevel', () => {
    it('should return weak for low scores', () => {
      expect(getPasswordStrengthLevel('test')).toBe('weak')
      expect(getPasswordStrengthLevel('Test')).toBe('weak')
    })

    it('should return medium for medium scores', () => {
      const level = getPasswordStrengthLevel('Test123')
      expect(['weak', 'medium']).toContain(level)
    })

    it('should return strong for strong scores', () => {
      const level = getPasswordStrengthLevel('TestPassword123!')
      expect(['strong', 'very-strong']).toContain(level)
    })

    it('should return very-strong for high scores', () => {
      expect(getPasswordStrengthLevel('VeryStrongPassword123!@#')).toBe('very-strong')
    })
  })

  describe('getPasswordStrengthColor', () => {
    it('should return correct colors for each level', () => {
      expect(getPasswordStrengthColor('test')).toBe('text-red-500')
      expect(['text-red-500', 'text-yellow-500']).toContain(getPasswordStrengthColor('Test123'))
      expect(['text-blue-500', 'text-green-500']).toContain(getPasswordStrengthColor('TestPassword123!'))
      expect(getPasswordStrengthColor('VeryStrongPassword123!@#')).toBe('text-green-500')
    })
  })

  describe('getPasswordStrengthBgColor', () => {
    it('should return correct background colors for each level', () => {
      expect(getPasswordStrengthBgColor('test')).toBe('bg-red-100')
      expect(['bg-red-100', 'bg-yellow-100']).toContain(getPasswordStrengthBgColor('Test123'))
      expect(['bg-blue-100', 'bg-green-100']).toContain(getPasswordStrengthBgColor('TestPassword123!'))
      expect(getPasswordStrengthBgColor('VeryStrongPassword123!@#')).toBe('bg-green-100')
    })
  })

  describe('validateFormData', () => {
    it('should return complete validation for valid form', () => {
      const password = 'TestPassword123!'
      const confirmPassword = 'TestPassword123!'
      
      const result = validateFormData(password, confirmPassword)
      
      expect(result.passwordValidation).toEqual({
        length: true,
        uppercase: true,
        lowercase: true,
        number: true,
        special: true
      })
      expect(result.allRulesMet).toBe(true)
      expect(result.passwordsMatch).toBe(true)
      expect(result.isFormValid).toBe(true)
    })

    it('should return invalid for mismatched passwords', () => {
      const password = 'TestPassword123!'
      const confirmPassword = 'DifferentPassword123!'
      
      const result = validateFormData(password, confirmPassword)
      
      expect(result.allRulesMet).toBe(true)
      expect(result.passwordsMatch).toBe(false)
      expect(result.isFormValid).toBe(false)
    })

    it('should return invalid for weak password', () => {
      const password = 'test'
      const confirmPassword = 'test'
      
      const result = validateFormData(password, confirmPassword)
      
      expect(result.allRulesMet).toBe(false)
      expect(result.passwordsMatch).toBe(true)
      expect(result.isFormValid).toBe(false)
    })

    it('should return invalid for both weak password and mismatch', () => {
      const password = 'test'
      const confirmPassword = 'different'
      
      const result = validateFormData(password, confirmPassword)
      
      expect(result.allRulesMet).toBe(false)
      expect(result.passwordsMatch).toBe(false)
      expect(result.isFormValid).toBe(false)
    })
  })
})
