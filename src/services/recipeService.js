import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION_NAME = 'recipes';

// Create a new recipe
export const addRecipe = async (recipeData) => {
  try {
    // Validate required fields
    const validatedData = {
      title: recipeData.title || '',
      description: recipeData.description || '',
      image: recipeData.image || '',
      prepTime: recipeData.prepTime || '',
      difficulty: recipeData.difficulty || 'medium',
      category: recipeData.category || '',
      nutrition: recipeData.nutrition || {
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
      },
      steps: recipeData.steps || [],
      // ...existing fields
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), validatedData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding recipe:', error);
    throw error;
  }
};

// Get a single recipe by ID
export const getRecipeById = async (recipeId) => {
  try {
    const recipeRef = doc(db, COLLECTION_NAME, recipeId);
    const recipeSnap = await getDoc(recipeRef);
    
    if (!recipeSnap.exists()) {
      throw new Error('Recipe not found');
    }
    
    return {
      id: recipeSnap.id,
      ...recipeSnap.data()
    };
  } catch (error) {
    console.error('Error getting recipe:', error);
    throw error;
  }
};

// Read all recipes
export const getAllRecipes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting recipes:', error);
    throw error;
  }
};

// Update a recipe
export const updateRecipe = async (recipeId, updatedData) => {
  try {
    const recipeRef = doc(db, COLLECTION_NAME, recipeId);
    await updateDoc(recipeRef, updatedData);
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
};

// Delete a recipe
export const deleteRecipe = async (recipeId) => {
  try {
    const recipeRef = doc(db, COLLECTION_NAME, recipeId);
    await deleteDoc(recipeRef);
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
}; 