import { collection, doc, getDocs, addDoc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Recipe } from '../types';

export const getRecipes = async (): Promise<Recipe[]> => {
  const recipesRef = collection(db, 'recipes');
  const q = query(recipesRef, orderBy('position', 'asc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Recipe[];
};

export const addRecipe = async (recipe: Partial<Recipe>): Promise<string> => {
  const recipesRef = collection(db, 'recipes');
  const docRef = await addDoc(recipesRef, {
    ...recipe,
    position: Date.now(), // Use timestamp as initial position
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
};

export const updateRecipe = async (id: string, data: Partial<Recipe>): Promise<void> => {
  const recipeRef = doc(db, 'recipes', id);
  await updateDoc(recipeRef, {
    ...data,
    updatedAt: new Date()
  });
};

export const deleteRecipe = async (id: string): Promise<void> => {
  const recipeRef = doc(db, 'recipes', id);
  await deleteDoc(recipeRef);
}; 