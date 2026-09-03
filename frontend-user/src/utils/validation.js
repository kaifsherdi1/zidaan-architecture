// Shared client-side validation for the auth forms.

// Pragmatic RFC-5322-ish check: something@something.tld, no spaces, sane TLD.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

export function isValidEmail(value) {
  return EMAIL_RE.test(String(value || '').trim());
}

// Accepts +CC and 10–15 digits once separators are stripped.
export function isValidPhone(value) {
  const digits = String(value || '').replace(/[^\d]/g, '');
  return /^\+?\d{10,15}$/.test(String(value || '').replace(/[\s()-]/g, '')) && digits.length >= 10 && digits.length <= 15;
}

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 15;

/**
 * Returns the individual rule results so the UI can show a live checklist.
 */
export function passwordChecks(pw) {
  const value = String(pw || '');
  return {
    length: value.length >= PASSWORD_MIN && value.length <= PASSWORD_MAX,
    uppercase: /[A-Z]/.test(value),
    number: /\d/.test(value),
    special: /[^A-Za-z0-9]/.test(value),
  };
}

export function isValidPassword(pw) {
  return Object.values(passwordChecks(pw)).every(Boolean);
}

export const PASSWORD_RULES = [
  { key: 'length', label: `${PASSWORD_MIN}–${PASSWORD_MAX} characters` },
  { key: 'uppercase', label: 'One uppercase letter' },
  { key: 'number', label: 'One number' },
  { key: 'special', label: 'One special character (@ # ! …)' },
];
