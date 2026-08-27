// ─── Status Filter Options ────────────────────────────────────────────────────
export const STATUS_FILTER_OPTIONS = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: true },
  { label: 'Inactive', value: false },
] as const;

// ─── Gender Options ───────────────────────────────────────────────────────────
export const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' }
] as const;

export type GenderValue = typeof GENDER_OPTIONS[number]['value'];

// ─── Shared Validation Regexes ────────────────────────────────────────────────
/** Exactly 10-digit Indian mobile number (no country code, no special chars) */
export const PHONE_REGEX = /^[6-9]\d{9}$/;
export const PHONE_ERROR = 'Invalid phone number (10 digits, starts with 6-9, e.g. 9000000000)';

/** Gmail-only email */
export const EMAIL_GMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@gmail\.com$/;
export const EMAIL_GMAIL_ERROR = 'Only Gmail addresses are allowed (e.g. user@gmail.com)';

/** Password: min 6, 1 upper, 1 lower, 1 digit, 1 special */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/;
export const PASSWORD_ERROR = 'Must contain 1 uppercase, 1 lowercase, 1 number, and 1 special character';

export * from './routes';
