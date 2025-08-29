import { LoginFormData } from '@/hooks/useLoginForm';
import { RegisterFormData } from '@/hooks/useRegisterForm';
import { UseFormSetError } from 'react-hook-form';

export const handleFirebaseAuthError = (
  error: string | undefined,
  setError: UseFormSetError<LoginFormData>
) => {
  if (!error) return;

  // Handle specific Firebase auth errors
  if (error.includes('user-not-found')) {
    setError('email', { message: 'No account found with this email' });
  } else if (error.includes('wrong-password')) {
    setError('password', { message: 'Incorrect password' });
  } else if (error.includes('invalid-email')) {
    setError('email', { message: 'Invalid email format' });
  } else if (error.includes('user-disabled')) {
    setError('email', { message: 'This account has been disabled' });
  } else if (error.includes('too-many-requests')) {
    return 'Too many login attempts. Please try again later.';
  } else if (error.includes('network-request-failed')) {
    return 'Network error. Please check your internet connection.';
  } else if (error.includes('invalid-credential')) {
    setError('email', { message: 'Invalid email or password' });
  } else {
    return error;
  }
  
  return null;
};

export const handleFirebaseRegisterError = (
  error: string | undefined,
  setError: UseFormSetError<RegisterFormData>
) => {
  if (!error) return;

  // Handle specific Firebase registration errors
  if (error.includes('email-already-in-use')) {
    setError('email', { message: 'An account with this email already exists' });
  } else if (error.includes('invalid-email')) {
    setError('email', { message: 'Invalid email format' });
  } else if (error.includes('weak-password')) {
    setError('password', { message: 'Password is too weak' });
  } else if (error.includes('username-already-exists')) {
    setError('username', { message: 'Username is already taken' });
  } else if (error.includes('too-many-requests')) {
    return 'Too many registration attempts. Please try again later.';
  } else if (error.includes('network-request-failed')) {
    return 'Network error. Please check your internet connection.';
  } else if (error.includes('operation-not-allowed')) {
    return 'Registration is currently disabled. Please try again later.';
  } else {
    return error;
  }
  
  return null;
};

export const validatePasswordStrength = (password: string) => {
  const minLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strength = [minLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
    .filter(Boolean).length;

  return {
    strength,
    isValid: minLength,
    feedback: {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    }
  };
};
