import { z } from 'zod';

// Malawian phone number regex: accepts formats like:
// 0881234567, 0991234567, +265881234567, +265991234567, 098..., 031...
export const malawiPhoneRegex = /^(?:\+265|0)(?:88|99|98|31|21)\d{7}$/;

export function isValidMalawiPhone(val) {
  const clean = val.replace(/[\s-]/g, '');
  return malawiPhoneRegex.test(clean);
}

// Accepts either an email or a valid Malawian phone number
export function isValidIdentifier(val) {
  if (!val) return false;
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  const isPhone = isValidMalawiPhone(val.trim());
  return isEmail || isPhone;
}

// Zod Schemas
export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email or Malawian phone number is required')
    .refine(
      (val) => isValidIdentifier(val),
      'Please enter a valid 9-digit Malawian number (TNM / Airtel) or email address.'
    ),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  role: z.enum(['student', 'landlord']).default('student'),
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name is too long'),
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address (e.g. chisomo@unima.ac.mw)'),
  phone: z
    .string()
    .min(1, 'Malawian phone number is required')
    .refine(
      (val) => isValidMalawiPhone(val),
      'Enter a valid Malawian phone (e.g. 0888 123 456 or 0999 123 456)'
    ),
  university: z
    .string()
    .optional(),
  yearOfStudy: z
    .string()
    .optional(),
  propertyArea: z
    .string()
    .optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  agreeTerms: z
    .boolean()
    .refine((val) => val === true, 'You must agree to CampusNest terms & safety guidelines'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === 'student') {
    return Boolean(data.university && data.university.trim().length > 0);
  }
  return true;
}, {
  message: "Please select your university",
  path: ["university"],
});

export const viewingRequestSchema = z.object({
  preferredDate: z.string().min(1, 'Please select a viewing date'),
  preferredTimeSlot: z.string().min(1, 'Please select a preferred time slot'),
  contactPhone: z
    .string()
    .min(1, 'Contact phone is required')
    .refine((val) => isValidMalawiPhone(val), 'Enter a valid Malawian phone number'),
  studentNotes: z.string().max(300, 'Notes cannot exceed 300 characters').optional(),
});

export const reportListingSchema = z.object({
  reason: z.enum([
    'scam',
    'advance_fee',
    'inaccurate_info',
    'unavailable',
    'safety_concern',
    'other',
  ], {
    errorMap: () => ({ message: 'Please select a reason for reporting this listing' }),
  }),
  details: z
    .string()
    .min(10, 'Please provide at least 10 characters explaining what occurred')
    .max(1000, 'Details cannot exceed 1000 characters'),
  contactConsent: z.boolean().optional(),
});
