import { db } from '../firebase/config';
import { doc, getDoc, setDoc, DocumentReference } from 'firebase/firestore';
import { auth } from '../firebase/config';

interface UserData {
  favorites: string[];
  [key: string]: any;
}

export const favoriteService = {
  async toggleFavorite(recipeId: string): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be authenticated');

    const userDocRef: DocumentReference<UserData> = doc(db, 'users', user.uid) as DocumentReference<UserData>;
    
    try {
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data() || { favorites: [] };
      const favorites = userData.favorites || [];
      
      const isFavorited = favorites.includes(recipeId);
      const newFavorites = isFavorited
        ? favorites.filter(id => id !== recipeId)
        : [...favorites, recipeId];
      
      await setDoc(userDocRef, {
        ...userData,
        favorites: newFavorites
      }, { merge: true });
      
      return !isFavorited;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  },

  async getFavorites(): Promise<Set<string>> {
    const user = auth.currentUser;
    if (!user) return new Set();

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data() as UserData | undefined;
      return new Set(userData?.favorites || []);
    } catch (error) {
      console.error('Error getting favorites:', error);
      return new Set();
    }
  }
}; 