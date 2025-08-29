import { AuthError, User, onAuthStateChanged } from 'firebase/auth';
import { DocumentData, doc, getDoc } from 'firebase/firestore';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState
} from 'react';
import { auth, db } from '../config/firebase';

// Type definitions for better type safety
interface UserData extends DocumentData {
  uid: string;
  email: string;
  displayName?: string;
  username?: string;
  profilePicture?: string;
  createdAt: Date;
}

interface FirebaseContextType {
  // Authentication state
  user: User | null;
  userData: UserData | null;
  
  // Loading and initialization states
  loading: boolean;
  initialized: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  refreshUserData: () => Promise<void>;
  clearError: () => void;
}

// Default context value
const defaultContext: FirebaseContextType = {
  user: null,
  userData: null,
  loading: true,
  initialized: false,
  error: null,
  refreshUserData: async () => {},
  clearError: () => {},
};

// Create context
const FirebaseContext = createContext<FirebaseContextType>(defaultContext);

// Custom hook for using Firebase context
export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

// Provider props interface
interface FirebaseProviderProps {
  children: React.ReactNode;
}

// Main provider component
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for cleanup and preventing memory leaks
  const isMountedRef = useRef(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Fetch user data from Firestore
  const fetchUserData = useCallback(async (uid: string): Promise<UserData | null> => {
    try {
      console.log(' Fetching user data for:', uid);
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        console.log('✅ User data fetched successfully');
        return data;
      } else {
        console.log('⚠️ User document does not exist in Firestore');
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      throw error;
    }
  }, []);

  // Refresh user data manually
  const refreshUserData = useCallback(async (): Promise<void> => {
    if (!user?.uid) return;
    
    try {
      setError(null);
      const data = await fetchUserData(user.uid);
      if (isMountedRef.current) {
        setUserData(data);
      }
    } catch (error) {
      if (isMountedRef.current) {
        setError(error instanceof Error ? error.message : 'Failed to refresh user data');
      }
    }
  }, [user?.uid, fetchUserData]);

  // Clear error state
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Main authentication state listener
  useEffect(() => {
    console.log('🔄 FirebaseProvider: Initializing authentication listener...');
    
    // Set up authentication state listener
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!isMountedRef.current) return;
        
        console.log(' Auth state changed:', currentUser ? `User: ${currentUser.email}` : 'No user');
        
        try {
          setError(null);
          
          if (currentUser) {
            // User is authenticated
            setUser(currentUser);
            
            // Fetch additional user data from Firestore
            try {
              const data = await fetchUserData(currentUser.uid);
              if (isMountedRef.current) {
                setUserData(data);
              }
            } catch (firestoreError) {
              console.warn('⚠️ Firestore error (non-critical):', firestoreError);
              // Don't fail auth if Firestore is down
              if (isMountedRef.current) {
                setUserData(null);
              }
            }
          } else {
            // No user authenticated
            setUser(null);
            setUserData(null);
          }
        } catch (error) {
          console.error('❌ Authentication error:', error);
          if (isMountedRef.current) {
            setError(error instanceof Error ? error.message : 'Authentication failed');
            setUser(null);
            setUserData(null);
          }
        } finally {
          if (isMountedRef.current) {
            setLoading(false);
            setInitialized(true);
            console.log('✅ Firebase authentication initialized');
          }
        }
      },
      (authError: AuthError) => {
        console.error('❌ Firebase Auth Error:', authError);
        if (isMountedRef.current) {
          setError(authError.message);
          setUser(null);
          setUserData(null);
          setLoading(false);
          setInitialized(true);
        }
      }
    );

    // Store unsubscribe function
    unsubscribeRef.current = unsubscribe;

    // Cleanup function
    return () => {
      console.log('🔄 FirebaseProvider: Cleaning up authentication listener');
      isMountedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [fetchUserData]);

  // Context value
  const contextValue: FirebaseContextType = {
    user,
    userData,
    loading,
    initialized,
    error,
    refreshUserData,
    clearError,
  };

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};
