import { commonStrings } from '@/constants/strings';
import { onlyDigits } from '@/utils/format';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function isValidPassword(value: string): boolean {
  return value.length >= MIN_PASSWORD_LENGTH;
}

export function isValidCep(value: string): boolean {
  return onlyDigits(value).length === 8;
}

export function validateLoginForm(email: string, password: string): string | null {
  if (!isRequired(email) || !isRequired(password)) {
    return commonStrings.validation.requiredField;
  }
  if (!isValidEmail(email)) {
    return commonStrings.validation.invalidEmail;
  }
  if (!isValidPassword(password)) {
    return commonStrings.validation.minLengthPassword;
  }
  return null;
}
