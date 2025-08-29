import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

// Validation schema
const loginSchema = yup.object({
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
    .trim()
    .matches(
      /^[^\s]+$/,
      'Password cannot contain spaces'
    ),
}).required();

export type LoginFormData = yup.InferType<typeof loginSchema>;

export const useLoginForm = () => {
  const form = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return form;
};
