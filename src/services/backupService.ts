import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const BACKUP_COLLECTION = 'backups';
const RECIPES_COLLECTION = 'recipes';

export const backupService = {
  createBackup: async () => {
    try {
      // Get all recipes
      const recipesSnapshot = await getDocs(collection(db, RECIPES_COLLECTION));
      const recipes: Record<string, any> = {};
      
      recipesSnapshot.forEach(doc => {
        recipes[doc.id] = doc.data();
      });

      // Create backup document
      const backupData = {
        timestamp: new Date().toISOString(),
        recipes,
        recipeCount: Object.keys(recipes).length
      };

      // Generate a unique ID based on timestamp
      const backupId = `backup-${backupData.timestamp}`;
      
      // Save to backups collection
      await setDoc(doc(db, BACKUP_COLLECTION, backupId), backupData);

      return backupData;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  },

  restoreFromBackup: async (backupId: string) => {
    try {
      // Get the backup document
      const backupDoc = await getDoc(doc(db, BACKUP_COLLECTION, backupId));
      
      if (!backupDoc.exists()) {
        throw new Error('Backup not found');
      }

      const backupData = backupDoc.data();
      const recipes = backupData.recipes;

      // Restore each recipe
      for (const [recipeId, recipeData] of Object.entries(recipes)) {
        await setDoc(doc(db, RECIPES_COLLECTION, recipeId), recipeData, { merge: true });
      }

      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw error;
    }
  },

  getBackups: async () => {
    try {
      const backupsSnapshot = await getDocs(collection(db, BACKUP_COLLECTION));
      return backupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting backups:', error);
      throw error;
    }
  }
}; 