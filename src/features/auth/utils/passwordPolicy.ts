/**
 * Password Policy Validator
 *
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 digit
 * - At least 1 special character
 *
 * NOTE: Individual boolean flags are returned without using a single regex.
 */

export interface PasswordValidationResult {
  minLength: boolean;
  uppercase: boolean;
  digit: boolean;
  special: boolean;
  isValid: boolean;
}

export type PasswordPolicyReason =
  | 'MIN_LENGTH'
  | 'UPPERCASE_REQUIRED'
  | 'DIGIT_REQUIRED'
  | 'SPECIAL_CHARACTER_REQUIRED';

/**
 * Validates password against policy rules
 */
export function validatePassword(password: string): PasswordValidationResult {
  if (!password) {
    return {
      minLength: false,
      uppercase: false,
      digit: false,
      special: false,
      isValid: false,
    };
  }

  const minLength = password.length >= 8;
  const uppercase = /[A-Z]/.test(password);
  const digit = /[0-9]/.test(password);
  // Special characters: symbols, punctuation, or any non-alphanumeric character
  const special = /[^A-Za-z0-9]/.test(password);

  const isValid = minLength && uppercase && digit && special;

  return {
    minLength,
    uppercase,
    digit,
    special,
    isValid,
  };
}

/**
 * Maps backend violation reason code to password validation rule key
 */
export function mapReasonToRuleKey(
  reason: string
): keyof Omit<PasswordValidationResult, 'isValid'> | null {
  switch (reason) {
    case 'MIN_LENGTH':
      return 'minLength';
    case 'UPPERCASE_REQUIRED':
      return 'uppercase';
    case 'DIGIT_REQUIRED':
      return 'digit';
    case 'SPECIAL_CHARACTER_REQUIRED':
      return 'special';
    default:
      return null;
  }
}
