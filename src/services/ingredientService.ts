import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Ingredient } from '../types/recipe';

const COLLECTION_NAME = 'ingredients';

export const getIngredients = async (): Promise<Ingredient[]> => {
  const ingredientsSnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return ingredientsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Ingredient[];
};

export const addIngredient = async (ingredientData: Omit<Ingredient, 'id'>): Promise<Ingredient> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...ingredientData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return {
      id: docRef.id,
      ...ingredientData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error in addIngredient:', error);
    throw error;
  }
};

export const updateIngredient = async (id: string, ingredient: Partial<Ingredient>): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...ingredient,
    updatedAt: new Date()
  });
};

export const deleteIngredient = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}; 