import { useState, useCallback } from 'react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  DocumentReference 
} from 'firebase/firestore';
import { db } from '../firebase/config';

interface FirebaseOperation<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
  execute: () => Promise<void>;
}

export const useFirebaseDocument = <T>(collectionName: string, docId: string): FirebaseOperation<T> => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    try {
      const docRef = doc(db, collectionName, docId) as DocumentReference<T>;
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setData(docSnap.data());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [collectionName, docId]);

  return { loading, error, data, execute };
}; 