import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Recipe } from '../types/recipe';

export const updateRecipe = async (id: string, recipe: Partial<Recipe>): Promise<void> => {
  const recipeRef = doc(db, 'recipes', id);
  await updateDoc(recipeRef, recipe);
}; 