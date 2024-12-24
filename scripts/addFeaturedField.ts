import { db } from '../src/firebase/config';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const addFeaturedFieldToRecipes = async () => {
  try {
    const recipesRef = collection(db, 'recipes');
    const snapshot = await getDocs(recipesRef);
    
    const batch = [];
    snapshot.docs.forEach((doc) => {
      const recipeRef = doc.ref;
      batch.push(updateDoc(recipeRef, {
        featured: false // default value
      }));
    });
    
    await Promise.all(batch);
    console.log('Successfully added featured field to all recipes');
  } catch (error) {
    console.error('Error updating recipes:', error);
  }
};

// Run the script
addFeaturedFieldToRecipes(); 