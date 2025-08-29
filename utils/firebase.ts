import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthError,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Type definitions
interface UserData {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  username: string;
  profilePicture?: string;
}

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Error handling utility
const handleAuthError = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
};

// Save user data to Firestore with batch operations
const saveUserToFirestore = async (user: User, userData: Omit<UserData, 'uid' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    console.log('💾 Saving user data to Firestore:', user.uid);
    
    const batch = writeBatch(db);
    
    // Create user document
    const userRef = doc(db, 'users', user.uid);
    const userDocData: UserData = {
      uid: user.uid,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    batch.set(userRef, userDocData);
    
    // Create username index for uniqueness
    const usernameRef = doc(db, 'usernames', userData.username);
    batch.set(usernameRef, { uid: user.uid });
    
    // Commit the batch
    await batch.commit();
    console.log('✅ User data saved successfully');
  } catch (error) {
    console.error('❌ Error saving user to Firestore:', error);
    throw new Error('Failed to create user account. Please try again.');
  }
};

// Sign up with email and password
export const signUp = async (data: SignUpData): Promise<AuthResult> => {
  try {
    console.log('🔄 Creating new user account:', data.email);
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      data.email, 
      data.password
    );
    
    // Update profile with display name and photo
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: data.displayName,
        photoURL: data.profilePicture || null,
      });
    }
    
    // Save user data to Firestore
    await saveUserToFirestore(userCredential.user, {
      email: data.email,
      displayName: data.displayName,
      username: data.username,
      profilePicture: data.profilePicture,
    });
    
    console.log('✅ User account created successfully');
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('❌ Sign up error:', error);
    const errorMessage = error && typeof error === 'object' && 'code' in error ? handleAuthError(error as AuthError) : 'Sign up failed. Please try again.';
    return { success: false, error: errorMessage };
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<AuthResult> => {
  try {
    console.log(' Signing in user:', email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    console.log('✅ User signed in successfully');
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('❌ Sign in error:', error);
    const errorMessage = error && typeof error === 'object' && 'code' in error ? handleAuthError(error as AuthError) : 'Sign in failed. Please try again.';
    return { success: false, error: errorMessage };
  }
};

// Sign out user
export const signOutUser = async (): Promise<AuthResult> => {
  try {
    console.log('🔄 Signing out user');
    
    await signOut(auth);
    
    console.log('✅ User signed out successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Sign out error:', error);
    return { success: false, error: 'Sign out failed. Please try again.' };
  }
};

// Get user data from Firestore
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    console.log(' Fetching user data:', uid);
    
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (userDoc.exists()) {
      const data = userDoc.data() as UserData;
      console.log('✅ User data fetched successfully');
      return data;
    }
    
    console.log('⚠️ User document not found');
    return null;
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    throw new Error('Failed to fetch user data. Please try again.');
  }
};

// Check if username is available
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    console.log('🔄 Checking username availability:', username);
    
    // Check if a document exists in the usernames collection with the username as ID
    const usernameDoc = await getDoc(doc(db, 'usernames', username));
    
    const isAvailable = !usernameDoc.exists();
    console.log('✅ Username availability checked:', isAvailable);
    
    return isAvailable;
  } catch (error) {
    console.error('❌ Error checking username availability:', error);
    throw new Error('Failed to check username availability. Please try again.');
  }
};

// Get all usernames for debugging
export const getAllUsernames = async (): Promise<string[]> => {
  try {
    console.log('🔄 Fetching all usernames...');
    
    const usernamesRef = collection(db, 'usernames');
    const querySnapshot = await getDocs(usernamesRef);
    
    const usernames: string[] = [];
    querySnapshot.forEach((doc) => {
      usernames.push(doc.id);
    });
    
    console.log('✅ All usernames fetched:', usernames);
    return usernames;
  } catch (error) {
    console.error('❌ Error fetching usernames:', error);
    return [];
  }
};

// Debug utilities for development
export const debugAuthState = async (): Promise<User | null> => {
  try {
    const currentUser = auth.currentUser;
    console.log('🔍 Debug Auth State:');
    console.log('  - Current user:', currentUser ? currentUser.email : 'null');
    console.log('  - User ID:', currentUser?.uid || 'null');
    console.log('  - Email verified:', currentUser?.emailVerified || 'N/A');
    
    // Check AsyncStorage for persistence
    const keys = await AsyncStorage.getAllKeys();
    const authKeys = keys.filter(key => key.includes('firebase'));
    console.log('  - Firebase keys in AsyncStorage:', authKeys.length);
    
    return currentUser;
  } catch (error) {
    console.error('❌ Error debugging auth state:', error);
    return null;
  }
};

export const checkAuthPersistence = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const authKeys = keys.filter(key => key.includes('firebase'));
    console.log('🔍 Auth persistence keys:', authKeys.length);
    
    for (const key of authKeys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`  ${key}:`, value ? 'exists' : 'null');
    }
  } catch (error) {
    console.error('❌ Error checking auth persistence:', error);
  }
};

// Clear all auth data (for testing/debugging)
export const clearAuthData = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const authKeys = keys.filter(key => key.includes('firebase'));
    
    if (authKeys.length > 0) {
      await AsyncStorage.multiRemove(authKeys);
      console.log('✅ Auth data cleared');
    }
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
  }
};

// Initialize Google Sign-In (placeholder for future implementation)
export const initializeGoogleSignIn = (): void => {
  console.log('🔄 Google Sign-In initialization (placeholder)');
  // TODO: Implement Google Sign-In when needed
};

// Sign in with Google (placeholder)
export const signInWithGoogle = async (): Promise<AuthResult> => {
  return {
    success: false,
    error: 'Google authentication is not yet configured. Please use email/password for now.'
  };
};
