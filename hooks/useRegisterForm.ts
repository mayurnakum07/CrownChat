import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

// Validation schema
const registerSchema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .matches(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    )
    .trim()
    .lowercase(),
  displayName: yup
    .string()
    .required('Display name is required')
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters')
    .trim(),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .trim()
    .lowercase()
    .max(254, 'Email is too long'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password is too long')
    .matches(
      /^[^\s]+$/,
      'Password cannot contain spaces'
    )
    .matches(
      /(?=.*[a-z])/,
      'Password must contain at least one lowercase letter'
    )
    .matches(
      /(?=.*[A-Z])/,
      'Password must contain at least one uppercase letter'
    )
    .matches(
      /(?=.*\d)/,
      'Password must contain at least one number'
    )
    .trim(),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match')
    .trim(),
  profilePicture: yup
    .string()
    .optional(),
}).required();

export type RegisterFormData = yup.InferType<typeof registerSchema>;

export const useRegisterForm = () => {
  const form = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      profilePicture: '',
    },
  });

  return form;
};
