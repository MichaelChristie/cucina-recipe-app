import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth } from '../config/firebase';

export const favoriteService = {
  async toggleFavorite(recipeId: string): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;

    const userDocRef = doc(db, 'users', user.uid);
    
    try {
      // Get current user data
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data() || {};
      const favorites = userData.favorites || [];
      
      // Toggle favorite
      const isFavorited = favorites.includes(recipeId);
      let newFavorites;
      
      if (isFavorited) {
        newFavorites = favorites.filter((id: string) => id !== recipeId);
      } else {
        newFavorites = [...favorites, recipeId];
      }
      
      // Update user document
      await setDoc(userDocRef, {
        ...userData,
        favorites: newFavorites
      }, { merge: true });
      
      return !isFavorited;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  },

  async getFavorites(): Promise<string[]> {
    const user = auth.currentUser;
    if (!user) return [];

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      return userData?.favorites || [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }
}; 