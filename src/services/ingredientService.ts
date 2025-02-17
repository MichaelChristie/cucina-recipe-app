import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Ingredient } from '../types/recipe';

const COLLECTION_NAME = 'ingredients';

interface IngredientCreate extends Omit<Ingredient, 'id'> {}
interface IngredientUpdate extends Partial<IngredientCreate> {}

export const getIngredients = async (): Promise<Ingredient[]> => {
  const ingredientsSnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return ingredientsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Ingredient));
};

export const addIngredient = async (ingredient: IngredientCreate): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), ingredient);
  return docRef.id;
};

export const updateIngredient = async (id: string, updates: IngredientUpdate): Promise<void> => {
  const ingredientRef: DocumentReference = doc(db, COLLECTION_NAME, id);
  await updateDoc(ingredientRef, updates);
};

export const deleteIngredient = async (id: string): Promise<void> => {
  const ingredientRef: DocumentReference = doc(db, COLLECTION_NAME, id);
  await deleteDoc(ingredientRef);
}; 