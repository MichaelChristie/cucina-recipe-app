import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Ingredient } from '../types/recipe';

export const getIngredients = async (): Promise<Ingredient[]> => {
  const ingredientsSnapshot = await getDocs(collection(db, 'ingredients'));
  return ingredientsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Ingredient[];
}; 