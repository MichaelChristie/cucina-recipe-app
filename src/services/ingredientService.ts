import { db } from '../config/firebase';
import { collection, doc, getDocs, updateDoc, deleteDoc, addDoc, DocumentReference } from 'firebase/firestore';
import { Ingredient } from '../types/admin';

const COLLECTION_NAME = 'ingredients';

export const getIngredients = async (): Promise<Ingredient[]> => {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Ingredient[];
};

export const addIngredient = async (ingredient: Omit<Ingredient, 'id'>): Promise<DocumentReference> => {
  return await addDoc(collection(db, COLLECTION_NAME), {
    ...ingredient,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

export const updateIngredient = async (id: string, updates: Partial<Ingredient>): Promise<void> => {
  const ingredientRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(ingredientRef, {
    ...updates,
    updatedAt: new Date()
  });
};

export const deleteIngredient = async (id: string): Promise<void> => {
  const ingredientRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(ingredientRef);
};

export const removeDuplicateIngredients = async (): Promise<void> => {
  const ingredients = await getIngredients();
  const uniqueNames = new Set<string>();
  const duplicates: string[] = [];

  ingredients.forEach(ingredient => {
    if (uniqueNames.has(ingredient.name.toLowerCase())) {
      duplicates.push(ingredient.id);
    } else {
      uniqueNames.add(ingredient.name.toLowerCase());
    }
  });

  await Promise.all(duplicates.map(id => deleteIngredient(id)));
}; 