import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy,
  getDoc,
  writeBatch,
  limit
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Recipe } from '../types';

// Helper function to ensure consistent recipe ordering
const orderRecipesByPosition = (recipes: Recipe[]): Recipe[] => {
  return recipes.sort((a, b) => {
    const posA = a.position || Number.MAX_VALUE;
    const posB = b.position || Number.MAX_VALUE;
    return posA - posB;
  });
};

export const getRecipes = async (): Promise<Recipe[]> => {
  const recipesRef = collection(db, 'recipes');
  // Always query with position ordering
  const q = query(recipesRef, orderBy('position', 'asc'));
  const snapshot = await getDocs(q);
  
  const recipes = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Recipe[];

  return orderRecipesByPosition(recipes);
};

export const getRecipeById = async (id: string): Promise<Recipe | null> => {
  const recipeRef = doc(db, 'recipes', id);
  const recipeDoc = await getDoc(recipeRef);
  
  if (!recipeDoc.exists()) {
    return null;
  }
  
  return {
    id: recipeDoc.id,
    ...recipeDoc.data()
  } as Recipe;
};

export const addRecipe = async (recipe: Partial<Recipe>): Promise<string> => {
  const recipesRef = collection(db, 'recipes');
  
  // Get the highest position value
  const q = query(recipesRef, orderBy('position', 'desc'), limit(1));
  const snapshot = await getDocs(q);
  const highestPosition = snapshot.docs[0]?.data()?.position || 0;
  
  const docRef = await addDoc(recipesRef, {
    ...recipe,
    position: highestPosition + 1, // Place at the end
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
};

export const updateRecipe = async (id: string, data: Partial<Recipe>): Promise<void> => {
  const recipeRef = doc(db, 'recipes', id);
  await updateDoc(recipeRef, {
    ...data,
    updatedAt: new Date(),
    // Ensure tags are stored as strings
    tags: data.tags?.map(tag => typeof tag === 'object' ? tag.id : tag) || []
  });
};

export const deleteRecipe = async (id: string): Promise<void> => {
  const recipeRef = doc(db, 'recipes', id);
  await deleteDoc(recipeRef);
  
  // Optionally reorder remaining recipes to close gaps
  const recipesRef = collection(db, 'recipes');
  const q = query(recipesRef, orderBy('position', 'asc'));
  const snapshot = await getDocs(q);
  
  const batch = writeBatch(db);
  snapshot.docs.forEach((doc, index) => {
    batch.update(doc.ref, { position: index + 1 });
  });
  
  await batch.commit();
};

// New function to reorder all recipes (useful for maintenance)
export const reorderAllRecipes = async (): Promise<void> => {
  const recipesRef = collection(db, 'recipes');
  const q = query(recipesRef, orderBy('position', 'asc'));
  const snapshot = await getDocs(q);
  
  const batch = writeBatch(db);
  snapshot.docs.forEach((doc, index) => {
    batch.update(doc.ref, { position: index + 1 });
  });
  
  await batch.commit();
}; 