import * as Yup from 'yup';
import { EMAIL_GMAIL_REGEX, EMAIL_GMAIL_ERROR, PASSWORD_REGEX, PASSWORD_ERROR } from '@/lib/constants';

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .matches(EMAIL_GMAIL_REGEX, EMAIL_GMAIL_ERROR)
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const registerSchema = Yup.object().shape({
  name: Yup.string().optional(),
  email: Yup.string()
    .matches(EMAIL_GMAIL_REGEX, EMAIL_GMAIL_ERROR)
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(PASSWORD_REGEX, PASSWORD_ERROR)
    .required('Password is required'),
  role: Yup.string()
    .oneOf(['USER', 'INSTRUCTOR', 'ADMIN'], 'Invalid role selection')
    .default('USER'),
});
