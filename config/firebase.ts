import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
    Auth,
    getReactNativePersistence,
    initializeAuth
} from 'firebase/auth';
import {
    Firestore,
    getFirestore
} from 'firebase/firestore';
import {
    FirebaseStorage,
    getStorage
} from 'firebase/storage';

// Firebase project configuration
// Replace with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyB_8in8auOQREHbTk-DHM-2rhAB90UOxyw",
  authDomain: "crownchat-a9151.firebaseapp.com",
  projectId: "crownchat-a9151",
  storageBucket: "crownchat-a9151.appspot.com",
  messagingSenderId: "62973149657",
  appId: "1:62973149657:ios:3650204cd01f37f61e19c8"
};

// Initialize Firebase app
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Auth with React Native persistence
// This ensures authentication state persists across app reloads
const auth: Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore database
const db: Firestore = getFirestore(app);

// Initialize Firebase Storage
const storage: FirebaseStorage = getStorage(app);

// Development environment setup (uncomment for local development)
// if (__DEV__) {
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectStorageEmulator(storage, 'localhost', 9199);
// }

// Export Firebase services
export { app, auth, db, storage };

// Export types for better type safety
    export type { Auth, FirebaseApp, FirebaseStorage, Firestore };

// Default export for backward compatibility
export default app;
