import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, CollectionReference } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { FirebaseConfig, Recipe, User } from '../types';

const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Type-safe collection references
export const recipesCollection = collection(db, 'recipes') as CollectionReference<Recipe>;
export const usersCollection = collection(db, 'users') as CollectionReference<User>;

// Helper function for type-safe document references
export const getTypedCollection = <T>(collectionName: string) => {
  return collection(db, collectionName) as CollectionReference<T>;
}; 